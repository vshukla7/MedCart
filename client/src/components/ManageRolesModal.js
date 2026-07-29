import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { searchUsersByPhone, updateUserRole } from '../services/api';

export const ManageRolesModal = ({ visible, onClose }) => {
  const { theme } = useTheme();
  const [searchPhone, setSearchPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);

  const formatPhoneNumber = (text) => {
    let cleaned = ('' + text).replace(/\D/g, '');
    if (cleaned.startsWith('91') && cleaned.length > 2) {
      cleaned = cleaned.substring(2);
    }
    if (cleaned.length === 0) return '';
    if (cleaned.length <= 5) return `+91 ${cleaned}`;
    return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5, 10)}`;
  };

  const handlePhoneChange = (text) => {
    if (text.length < searchPhone.length) {
      setSearchPhone(text);
      return;
    }
    setSearchPhone(formatPhoneNumber(text));
  };

  const handleSearch = async () => {
    if (!searchPhone.trim()) {
      Alert.alert('Error', 'Please enter a phone number to search.');
      return;
    }
    setLoading(true);
    try {
      const results = await searchUsersByPhone(searchPhone.trim());
      setUsers(results || []);
      if (!results || results.length === 0) {
        Alert.alert('Info', 'No users found matching that phone number.');
      }
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Could not search users');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, userPhone, newRole) => {
    Alert.alert(
      'Confirm Role Change',
      `Are you sure you want to change role of ${userPhone} to ${newRole.toUpperCase()}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Change',
          onPress: async () => {
            setLoading(true);
            try {
              const res = await updateUserRole(userId, newRole);
              if (res.success) {
                Alert.alert('Success', 'User role updated successfully');
                // Update local list
                setUsers(prev => prev.map(u => u._id === userId ? { ...u, role: newRole } : u));
              } else {
                Alert.alert('Failed', res.message || 'Could not update role');
              }
            } catch (e) {
              console.error(e);
              Alert.alert('Error', 'Something went wrong');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.backBtn}>
            <Feather name="arrow-left" size={24} color={theme.textPrimary} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: theme.textPrimary }]}>Manage User Roles</Text>
        </View>

        <View style={styles.searchSection}>
          <View style={[styles.searchBox, { backgroundColor: theme.inputBg, borderColor: theme.border }]}>
            <Feather name="search" size={18} color={theme.textSecondary} />
            <TextInput
              style={[styles.input, { color: theme.textPrimary }]}
              placeholder="Search by phone (e.g. +91 99999)"
              placeholderTextColor={theme.textSecondary}
              value={searchPhone}
              onChangeText={handlePhoneChange}
              keyboardType="phone-pad"
              onSubmitEditing={handleSearch}
            />
            {searchPhone ? (
              <TouchableOpacity onPress={() => setSearchPhone('')}>
                <Ionicons name="close-circle" size={18} color={theme.textSecondary} />
              </TouchableOpacity>
            ) : null}
          </View>
          <TouchableOpacity style={styles.searchBtn} onPress={handleSearch} disabled={loading} activeOpacity={0.85}>
            {loading ? <ActivityIndicator size="small" color="#FFFFFF" /> : <Text style={styles.searchBtnText}>Search</Text>}
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {users.map(user => (
            <View key={user._id} style={[styles.userCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <View style={styles.userInfo}>
                <View style={styles.avatarCircle}>
                  <Text style={styles.avatarText}>{(user.name || 'U').substring(0, 2).toUpperCase()}</Text>
                </View>
                <View style={styles.userDetails}>
                  <Text style={[styles.userName, { color: theme.textPrimary }]}>{user.name}</Text>
                  <Text style={[styles.userPhone, { color: theme.textSecondary }]}>{user.phone}</Text>
                  <View style={[styles.roleBadge, { backgroundColor: user.role === 'admin' ? '#FEE2E2' : user.role === 'staff' ? '#FEF3C7' : '#DCFCE7' }]}>
                    <Text style={[styles.roleText, { color: user.role === 'admin' ? '#EF4444' : user.role === 'staff' ? '#D97706' : '#16A34A' }]}>
                      {user.role.toUpperCase()}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.actionsDivider} />

              <View style={styles.roleActions}>
                <Text style={[styles.actionLabel, { color: theme.textSecondary }]}>Change role to:</Text>
                <View style={styles.roleButtons}>
                  {['user', 'staff', 'admin'].map(r => (
                    <TouchableOpacity
                      key={r}
                      style={[
                        styles.roleBtn,
                        user.role === r ? { backgroundColor: '#22C55E' } : { backgroundColor: theme.inputBg, borderColor: theme.border }
                      ]}
                      onPress={() => handleRoleChange(user._id, user.phone, r)}
                      disabled={user.role === r}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.roleBtnText, user.role === r ? { color: '#FFFFFF' } : { color: theme.textPrimary }]}>
                        {r.toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          ))}
          {!loading && users.length === 0 && (
            <View style={styles.emptyContainer}>
              <Feather name="users" size={48} color={theme.textSecondary} />
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>Search for a phone number to manage roles</Text>
            </View>
          )}
        </ScrollView>
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
  searchSection: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 16
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    gap: 8
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 14,
    fontWeight: '600'
  },
  searchBtn: {
    backgroundColor: '#22C55E',
    borderRadius: 14,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center'
  },
  searchBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800'
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
    gap: 16
  },
  userCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    gap: 12
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#22C55E',
    alignItems: 'center',
    justifyContent: 'center'
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800'
  },
  userDetails: {
    flex: 1,
    gap: 2
  },
  userName: {
    fontSize: 16,
    fontWeight: '800'
  },
  userPhone: {
    fontSize: 12,
    fontWeight: '500'
  },
  roleBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 2
  },
  roleText: {
    fontSize: 10,
    fontWeight: '800'
  },
  actionsDivider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.05)'
  },
  roleActions: {
    gap: 8
  },
  actionLabel: {
    fontSize: 11,
    fontWeight: '800'
  },
  roleButtons: {
    flexDirection: 'row',
    gap: 8
  },
  roleBtn: {
    flex: 1,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  roleBtnText: {
    fontSize: 11,
    fontWeight: '800'
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    gap: 12
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    maxWidth: 240
  }
});
