import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Modal, TextInput } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const parseTime = (timeStr) => {
  const parts = timeStr.trim().split(/\s+/);
  if (parts.length < 2) return { hours: 9, minutes: 0 };
  const [time, modifier] = parts;
  let [hours, minutes] = time.split(':').map(Number);
  if (isNaN(hours) || isNaN(minutes)) return { hours: 9, minutes: 0 };
  if (modifier === 'PM' && hours < 12) hours += 12;
  if (modifier === 'AM' && hours === 12) hours = 0;
  return { hours, minutes };
};

const scheduleReminderNotification = async (name, dosage, timeStr) => {
  try {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      console.log('Notification permission not granted');
      return null;
    }
    const { hours, minutes } = parseTime(timeStr);
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: `💊 Medicine Reminder: ${name}`,
        body: `Dosage: ${dosage}. It's time to take your medicine!`,
        sound: true,
      },
      trigger: {
        type: 'daily',
        hour: hours,
        minute: minutes,
      },
    });
    console.log(`Scheduled notification ${id} at ${hours}:${minutes}`);
    return id;
  } catch (e) {
    console.error('Error scheduling notification', e);
    return null;
  }
};

const cancelReminderNotification = async (notifId) => {
  if (!notifId) return;
  try {
    await Notifications.cancelScheduledNotificationAsync(notifId);
    console.log(`Cancelled notification ${notifId}`);
  } catch (e) {
    console.error('Error cancelling notification', e);
  }
};

export const RefillRemindersScreen = ({ visible, onClose }) => {
  const { theme } = useTheme();
  const [reminders, setReminders] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMedName, setNewMedName] = useState('');
  const [newDosage, setNewDosage] = useState('');
  const [newTime, setNewTime] = useState('09:00 AM');

  useEffect(() => {
    // Schedule default reminders on mount if active
    const setupReminders = async () => {
      const updated = await Promise.all(
        reminders.map(async (r) => {
          if (r.active && !r.notificationId) {
            const nId = await scheduleReminderNotification(r.name, r.dosage, r.time);
            return { ...r, notificationId: nId };
          }
          return r;
        })
      );
      setReminders(updated);
    };
    setupReminders();
  }, []);

  const toggleReminder = async (id) => {
    const target = reminders.find(r => r.id === id);
    if (!target) return;
    
    const newActive = !target.active;
    let notifId = target.notificationId;
    
    if (newActive) {
      notifId = await scheduleReminderNotification(target.name, target.dosage, target.time);
    } else {
      if (notifId) {
        await cancelReminderNotification(notifId);
        notifId = null;
      }
    }

    setReminders(prev => prev.map(r => r.id === id ? { ...r, active: newActive, notificationId: notifId } : r));
  };

  const handleAddReminder = async () => {
    if (!newMedName.trim()) return;
    const finalDosage = newDosage || '1 Tablet daily';
    const nId = await scheduleReminderNotification(newMedName, finalDosage, newTime);

    setReminders(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        name: newMedName,
        dosage: finalDosage,
        time: newTime,
        active: true,
        notificationId: nId
      }
    ]);
    setNewMedName('');
    setNewDosage('');
    setShowAddModal(false);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.backBtn}>
            <Feather name="arrow-left" size={24} color={theme.textPrimary} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: theme.textPrimary }]}>Medicine Refill Reminders</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.promoBox}>
            <Ionicons name="notifications" size={24} color="#16A34A" />
            <View style={styles.promoTextWrap}>
              <Text style={styles.promoTitle}>Never miss your daily dose</Text>
              <Text style={styles.promoSub}>Get automated alert reminders to take & refill medicines on time.</Text>
            </View>
          </View>

          {reminders.map(rem => (
            <View key={rem.id} style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <View style={styles.cardLeft}>
                <View style={styles.timeBadge}>
                  <Text style={styles.timeText}>{rem.time}</Text>
                </View>
                <View>
                  <Text style={[styles.medName, { color: theme.textPrimary }]}>{rem.name}</Text>
                  <Text style={[styles.dosageText, { color: theme.textSecondary }]}>{rem.dosage}</Text>
                </View>
              </View>

              <Switch
                value={rem.active}
                onValueChange={() => toggleReminder(rem.id)}
                trackColor={{ false: '#CBD5E1', true: '#22C55E' }}
                thumbColor="#FFFFFF"
              />
            </View>
          ))}
        </ScrollView>

        <TouchableOpacity 
          style={styles.fabBtn}
          onPress={() => setShowAddModal(true)}
          activeOpacity={0.85}
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
          <Text style={styles.fabText}>Add New Reminder</Text>
        </TouchableOpacity>

        {/* Add Reminder Modal */}
        <Modal visible={showAddModal} animationType="fade" transparent={true} onRequestClose={() => setShowAddModal(false)}>
          <View style={styles.addOverlay}>
            <View style={[styles.addCard, { backgroundColor: theme.card }]}>
              <Text style={[styles.addTitle, { color: theme.textPrimary }]}>Add Medicine Reminder</Text>
              
              <TextInput
                style={[styles.input, { backgroundColor: theme.inputBg, color: theme.textPrimary }]}
                placeholder="Medicine Name (e.g. Paracetamol)"
                placeholderTextColor={theme.textSecondary}
                value={newMedName}
                onChangeText={setNewMedName}
              />
              
              <TextInput
                style={[styles.input, { backgroundColor: theme.inputBg, color: theme.textPrimary }]}
                placeholder="Dosage (e.g. 1 Tablet after meal)"
                placeholderTextColor={theme.textSecondary}
                value={newDosage}
                onChangeText={setNewDosage}
              />

              <TextInput
                style={[styles.input, { backgroundColor: theme.inputBg, color: theme.textPrimary }]}
                placeholder="Time (e.g. 09:00 AM)"
                placeholderTextColor={theme.textSecondary}
                value={newTime}
                onChangeText={setNewTime}
              />

              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowAddModal(false)}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.saveBtn} onPress={handleAddReminder}>
                  <Text style={styles.saveText}>Save Reminder</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 45,
    paddingBottom: 16,
    gap: 12
  },
  backBtn: {
    padding: 4
  },
  title: {
    fontSize: 20,
    fontWeight: '800'
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 90,
    gap: 12
  },
  promoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    padding: 16,
    borderRadius: 20,
    gap: 12,
    marginBottom: 6
  },
  promoTextWrap: {
    flex: 1
  },
  promoTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#14532D'
  },
  promoSub: {
    fontSize: 12,
    fontWeight: '500',
    color: '#15803D',
    marginTop: 2
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1
  },
  timeBadge: {
    backgroundColor: '#22C55E',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12
  },
  timeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800'
  },
  medName: {
    fontSize: 15,
    fontWeight: '700'
  },
  dosageText: {
    fontSize: 12,
    marginTop: 2
  },
  fabBtn: {
    position: 'absolute',
    bottom: 24,
    left: 20,
    right: 20,
    backgroundColor: '#22C55E',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 18,
    gap: 8,
    elevation: 4
  },
  fabText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800'
  },
  addOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    paddingHorizontal: 20
  },
  addCard: {
    borderRadius: 24,
    padding: 20,
    gap: 12
  },
  addTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 4
  },
  input: {
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 48,
    fontSize: 14
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 8
  },
  cancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16
  },
  cancelText: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '700'
  },
  saveBtn: {
    backgroundColor: '#22C55E',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12
  },
  saveText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800'
  }
});
