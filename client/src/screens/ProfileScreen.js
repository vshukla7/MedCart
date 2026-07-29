import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { Ionicons, Feather, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { ManageRolesModal } from '../components/ManageRolesModal';

export const ProfileScreen = ({ 
  onOpenReminders, 
  onOpenChat, 
  onOpenOrders,
  currentUser,
  onLogout
}) => {
  const { theme, isDarkMode, toggleTheme } = useTheme();
  const [showManageRoles, setShowManageRoles] = useState(false);

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const displayName = currentUser?.name || 'User';
  const displayPhone = currentUser?.phone || 'No phone';
  const displayRole = currentUser?.role || 'user';

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.textPrimary }]}>Account Profile</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* User Card */}
        <View style={[styles.userCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{getInitials(displayName)}</Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={[styles.userName, { color: theme.textPrimary }]}>{displayName}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 }}>
              <Text style={[styles.userPhone, { color: theme.textSecondary }]}>{displayPhone}</Text>
              <View style={[styles.roleBadge, { backgroundColor: displayRole === 'admin' ? '#FEE2E2' : displayRole === 'staff' ? '#FEF3C7' : '#DCFCE7' }]}>
                <Text style={[styles.roleText, { color: displayRole === 'admin' ? '#EF4444' : displayRole === 'staff' ? '#D97706' : '#16A34A' }]}>
                  {displayRole.toUpperCase()}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Settings & Controls */}
        <Text style={[styles.sectionHeading, { color: theme.textPrimary }]}>Preferences & Settings</Text>

        {/* Admin Manage Roles Option */}
        {displayRole === 'admin' && (
          <TouchableOpacity 
            style={[styles.menuItem, { backgroundColor: theme.card, borderColor: theme.border }]}
            onPress={() => setShowManageRoles(true)}
            activeOpacity={0.8}
          >
            <View style={styles.menuLeft}>
              <View style={[styles.iconBox, { backgroundColor: '#FEE2E2' }]}>
                <Feather name="shield" size={18} color="#EF4444" />
              </View>
              <Text style={[styles.menuText, { color: theme.textPrimary }]}>Manage User Roles</Text>
            </View>
            <Feather name="chevron-right" size={18} color={theme.textSecondary} />
          </TouchableOpacity>
        )}

        {/* Dark Mode Toggle */}
        <View style={[styles.menuItem, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.menuLeft}>
            <View style={[styles.iconBox, { backgroundColor: '#F3E8FF' }]}>
              <Feather name="moon" size={18} color="#9333EA" />
            </View>
            <Text style={[styles.menuText, { color: theme.textPrimary }]}>Dark Mode</Text>
          </View>
          <Switch 
            value={isDarkMode} 
            onValueChange={toggleTheme}
            trackColor={{ false: '#CBD5E1', true: '#22C55E' }}
            thumbColor="#FFFFFF"
          />
        </View>

        {/* Medicine Refill Reminders */}
        <TouchableOpacity 
          style={[styles.menuItem, { backgroundColor: theme.card, borderColor: theme.border }]}
          onPress={onOpenReminders}
          activeOpacity={0.8}
        >
          <View style={styles.menuLeft}>
            <View style={[styles.iconBox, { backgroundColor: '#FEF3C7' }]}>
              <Ionicons name="alarm-outline" size={18} color="#D97706" />
            </View>
            <Text style={[styles.menuText, { color: theme.textPrimary }]}>Medicine Refill Reminders</Text>
          </View>
          <Feather name="chevron-right" size={18} color={theme.textSecondary} />
        </TouchableOpacity>

        {/* Order History */}
        <TouchableOpacity 
          style={[styles.menuItem, { backgroundColor: theme.card, borderColor: theme.border }]}
          onPress={onOpenOrders}
          activeOpacity={0.8}
        >
          <View style={styles.menuLeft}>
            <View style={[styles.iconBox, { backgroundColor: '#DCFCE7' }]}>
              <Ionicons name="receipt-outline" size={18} color="#16A34A" />
            </View>
            <Text style={[styles.menuText, { color: theme.textPrimary }]}>Order History</Text>
          </View>
          <Feather name="chevron-right" size={18} color={theme.textSecondary} />
        </TouchableOpacity>

        {/* Saved Addresses */}
        <View style={[styles.menuItem, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.menuLeft}>
            <View style={[styles.iconBox, { backgroundColor: '#DBEAFE' }]}>
              <Ionicons name="location-outline" size={18} color="#2563EB" />
            </View>
            <View>
              <Text style={[styles.menuText, { color: theme.textPrimary }]}>Saved Addresses</Text>
              <Text style={[styles.subText, { color: theme.textSecondary }]}>123 Healthcare Way, Mumbai</Text>
            </View>
          </View>
          <Feather name="chevron-right" size={18} color={theme.textSecondary} />
        </View>

        {/* Payment Methods */}
        <View style={[styles.menuItem, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.menuLeft}>
            <View style={[styles.iconBox, { backgroundColor: '#FEE2E2' }]}>
              <Ionicons name="card-outline" size={18} color="#DC2626" />
            </View>
            <View>
              <Text style={[styles.menuText, { color: theme.textPrimary }]}>Payment Methods</Text>
              <Text style={[styles.subText, { color: theme.textSecondary }]}>UPI (Google Pay, PhonePe), Cards, COD</Text>
            </View>
          </View>
          <Feather name="chevron-right" size={18} color={theme.textSecondary} />
        </View>

        {/* Chat with Pharmacist */}
        <TouchableOpacity 
          style={[styles.menuItem, { backgroundColor: theme.card, borderColor: theme.border }]}
          onPress={onOpenChat}
          activeOpacity={0.8}
        >
          <View style={styles.menuLeft}>
            <View style={[styles.iconBox, { backgroundColor: '#E0E7FF' }]}>
              <Ionicons name="chatbubbles-outline" size={18} color="#4F46E5" />
            </View>
            <Text style={[styles.menuText, { color: theme.textPrimary }]}>Chat with Pharmacist</Text>
          </View>
          <Feather name="chevron-right" size={18} color={theme.textSecondary} />
        </TouchableOpacity>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={onLogout} activeOpacity={0.8}>
          <Feather name="log-out" size={18} color="#EF4444" />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Manage User Roles Modal */}
      <ManageRolesModal visible={showManageRoles} onClose={() => setShowManageRoles(false)} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 10
  },
  title: {
    fontSize: 22,
    fontWeight: '800'
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
    gap: 12
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    gap: 14
  },
  avatarCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#22C55E',
    alignItems: 'center',
    justifyContent: 'center'
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800'
  },
  userInfo: {
    flex: 1
  },
  userName: {
    fontSize: 18,
    fontWeight: '800'
  },
  userEmail: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2
  },
  userPhone: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 1
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: '800',
    marginTop: 10,
    marginBottom: 2
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 18,
    borderWidth: 1
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center'
  },
  menuText: {
    fontSize: 14,
    fontWeight: '700'
  },
  subText: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: '#FEE2E2',
    gap: 8,
    marginTop: 10
  },
  logoutText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '800'
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6
  },
  roleText: {
    fontSize: 10,
    fontWeight: '800'
  }
});
