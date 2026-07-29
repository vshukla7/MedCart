import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Linking, ScrollView } from 'react-native';
import { Ionicons, Feather, FontAwesome5 } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

export const PharmacistChatScreen = ({ visible, onClose }) => {
  const { theme } = useTheme();

  const whatsappNumbers = [
    { label: 'Pharmacist Support 1', number: '8084481565' },
    { label: 'Pharmacist Support 2', number: '7781984962' },
    { label: 'Pharmacist Support 3', number: '9279318477' }
  ];

  const handleOpenWhatsApp = (num) => {
    // Add country code +91
    const waUrl = `https://wa.me/91${num}`;
    Linking.canOpenURL(waUrl)
      .then((supported) => {
        if (supported) {
          Linking.openURL(waUrl);
        } else {
          Linking.openURL(`https://wa.me/91${num}`);
        }
      })
      .catch(() => {
        Linking.openURL(`https://wa.me/91${num}`);
      });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.modalCard, { backgroundColor: theme.card }]}>
          
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <FontAwesome5 name="whatsapp" size={24} color="#22C55E" />
              <Text style={[styles.title, { color: theme.textPrimary }]}>Connect on WhatsApp</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close-circle" size={24} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.description, { color: theme.textSecondary }]}>
            In-app chat is currently disabled. Please select one of our official pharmacist support numbers to instantly connect and verify prescriptions directly on WhatsApp:
          </Text>

          <ScrollView contentContainerStyle={styles.numbersList} showsVerticalScrollIndicator={false}>
            {whatsappNumbers.map((item, idx) => (
              <TouchableOpacity
                key={idx}
                style={[styles.numberCard, { backgroundColor: theme.inputBg, borderColor: theme.border }]}
                onPress={() => handleOpenWhatsApp(item.number)}
                activeOpacity={0.8}
              >
                <View style={styles.cardLeft}>
                  <View style={styles.avatarBox}>
                    <Text style={styles.avatarEmoji}>👨‍⚕️</Text>
                  </View>
                  <View>
                    <Text style={[styles.labelName, { color: theme.textPrimary }]}>{item.label}</Text>
                    <Text style={[styles.phoneNum, { color: theme.textSecondary }]}>+91 {item.number}</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward-circle" size={22} color="#22C55E" />
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: theme.textSecondary }]}>
              Available 24x7 for medical prescription reviews.
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  modalCard: {
    width: '100%',
    borderRadius: 28,
    padding: 20,
    maxHeight: 460,
    gap: 16,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
    paddingBottom: 12
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  title: {
    fontSize: 18,
    fontWeight: '800'
  },
  closeBtn: {
    padding: 4
  },
  description: {
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
    fontWeight: '500'
  },
  numbersList: {
    gap: 10
  },
  numberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  avatarBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center'
  },
  avatarEmoji: {
    fontSize: 18
  },
  labelName: {
    fontSize: 14,
    fontWeight: '800'
  },
  phoneNum: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 1
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
    paddingTop: 12,
    alignItems: 'center'
  },
  footerText: {
    fontSize: 11,
    fontWeight: '600'
  }
});
