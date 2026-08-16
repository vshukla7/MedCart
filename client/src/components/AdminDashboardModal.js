import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, Alert } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { searchUsersByPhone, updateUserRole, fetchOrders, confirmOrder, assignOrder, fetchSalesAnalytics, broadcastNotification } from '../services/api';

const isExpoGo = Constants.executionEnvironment === 'storeClient';

export const AdminDashboardModal = ({ visible, onClose, currentUser }) => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState('dispatch'); // dispatch, roles, sales, analytics
  const [loading, setLoading] = useState(false);

  // Dispatch Tab State
  const [orders, setOrders] = useState([]);
  const [staffList, setStaffList] = useState([]);

  const getAssignedStaffName = (ord) => {
    const assignedId = ord.assignedStaff || ord.assignedTo?._id || ord.assignedTo;
    const staffObj = staffList.find(s => s._id === assignedId);
    return staffObj ? `Assigned to: ${staffObj.name}` : 'Not Assigned';
  };

  const isStaffAssigned = (ord, staffId) => {
    const assignedId = ord.assignedStaff || ord.assignedTo?._id || ord.assignedTo;
    return assignedId === staffId;
  };

  // Roles Tab State
  const [searchPhone, setSearchPhone] = useState('');
  const [users, setUsers] = useState([]);

  // Sales & Analytics State
  const [analyticsData, setAnalyticsData] = useState({
    analytics: { totalRevenue: 0, todayRevenue: 0, weeklyRevenue: 0, monthlyRevenue: 0, totalOrders: 0, deliveredOrders: 0, pendingOrders: 0, cancelledOrders: 0 },
    staffPerformance: []
  });

  // Broadcast Tab State
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastBody, setBroadcastBody] = useState('');

  const handleSendNotification = async () => {
    if (!broadcastTitle.trim() || !broadcastBody.trim()) {
      Alert.alert('Error', 'Please fill in both title and message.');
      return;
    }
    
    setLoading(true);
    try {
      const res = await broadcastNotification(broadcastTitle.trim(), broadcastBody.trim());
      if (res.success) {
        // Trigger a local push notification only in standalone/dev builds
        if (!isExpoGo) {
          try {
            await Notifications.scheduleNotificationAsync({
              content: {
                title: `📢 ${broadcastTitle.trim()}`,
                body: broadcastBody.trim(),
                sound: true,
              },
              trigger: null,
            });
          } catch (e) {
            console.log('[Notification] Skipped in Expo Go');
          }
        }
        
        Alert.alert('Success', 'Notification broadcast successfully to all users!');
        setBroadcastTitle('');
        setBroadcastBody('');
      } else {
        Alert.alert('Error', res.message || 'Could not broadcast notification');
      }
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Failed to send notification');
    } finally {
      setLoading(false);
    }
  };

  const loadDispatchData = async () => {
    setLoading(true);
    try {
      const allOrders = await fetchOrders({ role: 'admin' });
      const sorted = (allOrders || []).sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
        const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
        return dateB - dateA;
      });
      setOrders(sorted);

      // Get all staff members
      const matchedStaff = await searchUsersByPhone('');
      const staffOnly = matchedStaff.filter(u => u.role === 'staff' || u.role === 'admin');
      setStaffList(staffOnly);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadAnalyticsData = async () => {
    setLoading(true);
    try {
      const data = await fetchSalesAnalytics();
      if (data) setAnalyticsData(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible) {
      // Always reload dispatch data when modal opens
      loadDispatchData();
      if (activeTab === 'analytics') loadAnalyticsData();
    }
  }, [visible]);

  useEffect(() => {
    if (visible) {
      if (activeTab === 'dispatch') loadDispatchData();
      if (activeTab === 'analytics') loadAnalyticsData();
    }
  }, [activeTab]);

  const handleConfirm = async (orderId) => {
    try {
      const res = await confirmOrder(orderId, currentUser?._id);
      if (res.success) {
        Alert.alert('Success', 'Order confirmed');
        loadDispatchData();
      } else {
        Alert.alert('Error', 'Could not confirm order');
      }
    } catch (e) {
      Alert.alert('Error', 'Something went wrong');
    }
  };

  const handleAssign = async (orderId, staffId) => {
    try {
      const res = await assignOrder(orderId, staffId);
      if (res.success) {
        Alert.alert('Success', 'Order assigned successfully');
        loadDispatchData();
      } else {
        Alert.alert('Error', 'Could not assign order');
      }
    } catch (e) {
      Alert.alert('Error', 'Something went wrong');
    }
  };

  const handleSearchRoles = async () => {
    setLoading(true);
    try {
      const results = await searchUsersByPhone(searchPhone.trim());
      setUsers(results || []);
    } catch (e) {
      Alert.alert('Error', 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, userPhone, newRole) => {
    Alert.alert(
      'Update Access',
      `Confirm changing role of ${userPhone} to ${newRole.toUpperCase()}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Update',
          onPress: async () => {
            setLoading(true);
            try {
              const res = await updateUserRole(userId, newRole);
              if (res.success) {
                Alert.alert('Success', 'User role updated successfully');
                handleSearchRoles();
              } else {
                Alert.alert('Error', res.message || 'Could not update role');
              }
            } catch (e) {
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
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.backBtn}>
            <Feather name="arrow-left" size={24} color={theme.textPrimary} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: theme.textPrimary }]}>Admin Control Center</Text>
        </View>

        {/* Tab Selection */}
        <View style={[styles.tabBar, { borderBottomColor: theme.border }]}>
          {[
            { id: 'dispatch', label: 'Dispatch', icon: 'send' },
            { id: 'roles', label: 'Roles', icon: 'users' },
            { id: 'analytics', label: 'Analytics', icon: 'pie-chart' },
            { id: 'notify', label: 'Notify', icon: 'bell' }
          ].map(t => (
            <TouchableOpacity
              key={t.id}
              style={[styles.tabBtn, activeTab === t.id && { borderBottomColor: '#22C55E' }]}
              onPress={() => setActiveTab(t.id)}
            >
              <Feather name={t.icon} size={16} color={activeTab === t.id ? '#22C55E' : theme.textSecondary} />
              <Text style={[styles.tabLabel, { color: activeTab === t.id ? '#22C55E' : theme.textSecondary }]}>
                {t.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {loading && <ActivityIndicator size="large" color="#22C55E" style={{ marginVertical: 20 }} />}

        {/* Tab Body */}
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* Dispatch Tab */}
          {activeTab === 'dispatch' && (
            <View style={styles.tabSection}>
              <View style={styles.sectionHeadingRow}>
                <Text style={[styles.sectionHeading, { color: theme.textPrimary }]}>Order Confirmations & Assignments</Text>
                <TouchableOpacity
                  style={styles.refreshBtn}
                  onPress={loadDispatchData}
                  disabled={loading}
                >
                  <Feather name="refresh-cw" size={14} color="#22C55E" />
                  <Text style={styles.refreshBtnText}>Refresh</Text>
                </TouchableOpacity>
              </View>
              {orders.map(ord => (
                <View key={ord._id} style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
                  <View style={styles.cardHeader}>
                    <Text style={[styles.orderNum, { color: theme.textPrimary }]}>Order #{ord.orderNumber}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: ord.status === 'Pending' ? '#FEF3C7' : '#DCFCE7' }]}>
                      <Text style={[styles.statusText, { color: ord.status === 'Pending' ? '#D97706' : '#16A34A' }]}>
                        {ord.status.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                  
                  <Text style={[styles.cardDetails, { color: theme.textPrimary, fontWeight: '800' }]}>
                    👤 Recipient: {ord.shippingAddress?.fullName || 'N/A'} ({ord.shippingAddress?.phone || 'N/A'})
                  </Text>
                  <Text style={[styles.cardDetails, { color: theme.textSecondary }]}>
                    📍 Address: {ord.shippingAddress?.street || ord.shippingAddress?.address || 'N/A'}
                  </Text>
                  <Text style={[styles.cardDetails, { color: theme.textSecondary }]}>
                    Total Amount: ₹{ord.grandTotal} (Includes ₹20 delivery fee)
                  </Text>
                  
                  <View style={styles.itemsBrief}>
                    {ord.items?.map((it, idx) => (
                      <Text key={idx} style={[styles.itemText, { color: theme.textSecondary }]}>
                        • {it.name} (x{it.quantity})
                      </Text>
                    ))}
                  </View>

                  <View style={styles.actionsDivider} />

                  <View style={styles.cardActions}>
                    {ord.status === 'Pending' && (
                      <TouchableOpacity style={styles.confirmBtn} onPress={() => handleConfirm(ord._id)}>
                        <Feather name="check" size={14} color="#FFFFFF" />
                        <Text style={styles.confirmBtnText}>Confirm Order</Text>
                      </TouchableOpacity>
                    )}

                    {ord.status !== 'Pending' && ord.status !== 'Delivered' && ord.status !== 'Cancelled' && (
                      <View style={styles.assignmentBox}>
                        <Text style={[styles.assignLabel, { color: theme.textSecondary }]}>
                          {getAssignedStaffName(ord)}
                        </Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.staffChips}>
                          {staffList.map(staff => (
                            <TouchableOpacity
                              key={staff._id}
                              style={[
                                styles.staffChip,
                                isStaffAssigned(ord, staff._id) ? { backgroundColor: '#22C55E' } : { backgroundColor: theme.inputBg, borderColor: theme.border }
                              ]}
                              onPress={() => handleAssign(ord._id, staff._id)}
                            >
                              <Text style={[styles.staffChipText, isStaffAssigned(ord, staff._id) ? { color: '#FFFFFF' } : { color: theme.textPrimary }]}>
                                {staff.name}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </ScrollView>
                      </View>
                    )}
                  </View>
                </View>
              ))}
              {orders.length === 0 && !loading && (
                <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No orders dispatch list found.</Text>
              )}
            </View>
          )}

          {/* Roles Tab */}
          {activeTab === 'roles' && (
            <View style={styles.tabSection}>
              <View style={styles.searchRow}>
                <TextInput
                  style={[styles.searchBar, { backgroundColor: theme.inputBg, color: theme.textPrimary, borderColor: theme.border }]}
                  placeholder="Search user by phone number"
                  placeholderTextColor={theme.textSecondary}
                  value={searchPhone}
                  onChangeText={setSearchPhone}
                  keyboardType="phone-pad"
                />
                <TouchableOpacity style={styles.searchBtn} onPress={handleSearchRoles}>
                  <Text style={styles.searchBtnText}>Search</Text>
                </TouchableOpacity>
              </View>

              {users.map(user => (
                <View key={user._id} style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
                  <Text style={[styles.userName, { color: theme.textPrimary }]}>{user.name}</Text>
                  <Text style={[styles.userPhone, { color: theme.textSecondary }]}>{user.phone}</Text>
                  <Text style={[styles.roleBadgeText, { color: user.role === 'admin' ? '#EF4444' : user.role === 'staff' ? '#D97706' : '#16A34A' }]}>
                    Role: {user.role.toUpperCase()}
                  </Text>
                  
                  <View style={styles.actionsDivider} />
                  
                  <View style={styles.roleButtons}>
                    {user.role !== 'staff' && (
                      <TouchableOpacity style={[styles.roleActionBtn, { backgroundColor: '#FEF3C7' }]} onPress={() => handleRoleChange(user._id, user.phone, 'staff')}>
                        <Text style={{ color: '#D97706', fontWeight: '800', fontSize: 12 }}>Promote to Staff</Text>
                      </TouchableOpacity>
                    )}
                    {user.role === 'staff' && (
                      <TouchableOpacity style={[styles.roleActionBtn, { backgroundColor: '#FEE2E2' }]} onPress={() => handleRoleChange(user._id, user.phone, 'user')}>
                        <Text style={{ color: '#EF4444', fontWeight: '800', fontSize: 12 }}>Remove Staff Access</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <View style={styles.tabSection}>
              <Text style={[styles.sectionHeading, { color: theme.textPrimary }]}>Revenue & Orders Breakdown</Text>
              
              <View style={styles.analyticsGrid}>
                <View style={[styles.analyticsCard, { backgroundColor: '#DCFCE7' }]}>
                  <Text style={[styles.analyticsVal, { color: '#16A34A' }]}>₹{analyticsData.analytics?.totalRevenue}</Text>
                  <Text style={{ color: '#15803D', fontSize: 11, fontWeight: '700' }}>Total Revenue</Text>
                </View>

                <View style={[styles.analyticsCard, { backgroundColor: '#DBEAFE' }]}>
                  <Text style={[styles.analyticsVal, { color: '#2563EB' }]}>₹{analyticsData.analytics?.todayRevenue}</Text>
                  <Text style={{ color: '#1D4ED8', fontSize: 11, fontWeight: '700' }}>Today's Revenue</Text>
                </View>

                <View style={[styles.analyticsCard, { backgroundColor: '#F3E8FF' }]}>
                  <Text style={[styles.analyticsVal, { color: '#9333EA' }]}>₹{analyticsData.analytics?.weeklyRevenue}</Text>
                  <Text style={{ color: '#7E22CE', fontSize: 11, fontWeight: '700' }}>Weekly Revenue</Text>
                </View>

                <View style={[styles.analyticsCard, { backgroundColor: '#FEF3C7' }]}>
                  <Text style={[styles.analyticsVal, { color: '#D97706' }]}>₹{analyticsData.analytics?.monthlyRevenue}</Text>
                  <Text style={{ color: '#B45309', fontSize: 11, fontWeight: '700' }}>Monthly Revenue</Text>
                </View>
              </View>

              <Text style={[styles.sectionHeading, { color: theme.textPrimary, marginTop: 14 }]}>Orders Status</Text>
              <View style={styles.statsGrid}>
                <View style={styles.statBox}>
                  <Text style={styles.statVal}>{analyticsData.analytics?.totalOrders}</Text>
                  <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Total Orders</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statVal}>{analyticsData.analytics?.deliveredOrders}</Text>
                  <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Delivered</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statVal}>{analyticsData.analytics?.pendingOrders}</Text>
                  <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Pending</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statVal}>{analyticsData.analytics?.cancelledOrders}</Text>
                  <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Cancelled</Text>
                </View>
              </View>

              <Text style={[styles.sectionHeading, { color: theme.textPrimary, marginTop: 14 }]}>Staff COD Collection & Deliveries</Text>
              {analyticsData.staffPerformance?.map((staff, idx) => (
                <View key={staff._id || idx} style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
                  <Text style={[styles.userName, { color: theme.textPrimary }]}>{staff.name}</Text>
                  <Text style={[styles.userPhone, { color: theme.textSecondary }]}>Phone: {staff.phone} | Role: {staff.role?.toUpperCase()}</Text>
                  
                  <View style={styles.statsGrid}>
                    <View style={styles.statBox}>
                      <Text style={styles.statVal}>{staff.ordersDelivered}</Text>
                      <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Delivered</Text>
                    </View>
                    <View style={styles.statBox}>
                      <Text style={styles.statVal}>₹{staff.totalSales}</Text>
                      <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Sales (COD)</Text>
                    </View>
                    <View style={styles.statBox}>
                      <Text style={styles.statVal}>₹{staff.avgOrderValue}</Text>
                      <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Avg Value</Text>
                    </View>
                  </View>

                  <View style={styles.subStatsRow}>
                    <Text style={[styles.subStatLabel, { color: theme.textSecondary }]}>Pending: {staff.pending}</Text>
                    <Text style={[styles.subStatLabel, { color: theme.textSecondary }]}>Cancelled: {staff.cancelled}</Text>
                    <Text style={[styles.subStatLabel, { color: theme.textSecondary }]}>Success Rate: {staff.successRate}%</Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Notify Tab */}
          {activeTab === 'notify' && (
            <View style={styles.tabSection}>
              <Text style={[styles.sectionHeading, { color: theme.textPrimary }]}>Send Manual Event Notification</Text>
              <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border, gap: 14 }]}>
                <View style={styles.inputWrapper}>
                  <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Notification Title</Text>
                  <TextInput
                    style={[styles.formInput, { backgroundColor: theme.inputBg, color: theme.textPrimary, borderColor: theme.border }]}
                    placeholder="e.g. 🔥 Weekend Super Sale!"
                    placeholderTextColor={theme.textSecondary}
                    value={broadcastTitle}
                    onChangeText={setBroadcastTitle}
                  />
                </View>

                <View style={styles.inputWrapper}>
                  <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Notification Message / Paragraph</Text>
                  <TextInput
                    style={[styles.formTextArea, { backgroundColor: theme.inputBg, color: theme.textPrimary, borderColor: theme.border }]}
                    placeholder="e.g. Upload your prescription now and get 25% off on tablets with flat Rs. 20 COD shipping charges."
                    placeholderTextColor={theme.textSecondary}
                    multiline
                    numberOfLines={4}
                    value={broadcastBody}
                    onChangeText={setBroadcastBody}
                  />
                </View>

                <TouchableOpacity style={styles.sendNotifyBtn} onPress={handleSendNotification} activeOpacity={0.85}>
                  <Ionicons name="notifications-outline" size={18} color="#FFFFFF" />
                  <Text style={styles.sendNotifyBtnText}>Broadcast Push Notification</Text>
                </TouchableOpacity>
              </View>
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
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    paddingHorizontal: 20,
    justifyContent: 'space-between'
  },
  tabBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    paddingHorizontal: 8
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '800'
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
    gap: 16
  },
  tabSection: {
    gap: 14,
    paddingTop: 16
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: '800'
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    gap: 6
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  orderNum: {
    fontSize: 15,
    fontWeight: '800'
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800'
  },
  cardDetails: {
    fontSize: 12,
    fontWeight: '600'
  },
  itemsBrief: {
    marginTop: 4,
    gap: 2
  },
  itemText: {
    fontSize: 11,
    fontWeight: '500'
  },
  actionsDivider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.05)',
    marginVertical: 4
  },
  cardActions: {
    gap: 6
  },
  confirmBtn: {
    backgroundColor: '#22C55E',
    flexDirection: 'row',
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6
  },
  confirmBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800'
  },
  assignmentBox: {
    gap: 6
  },
  assignLabel: {
    fontSize: 11,
    fontWeight: '800'
  },
  staffChips: {
    gap: 8,
    paddingVertical: 2
  },
  staffChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1
  },
  staffChipText: {
    fontSize: 11,
    fontWeight: '800'
  },
  searchRow: {
    flexDirection: 'row',
    gap: 10
  },
  searchBar: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 13,
    fontWeight: '600'
  },
  searchBtn: {
    backgroundColor: '#22C55E',
    borderRadius: 12,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center'
  },
  searchBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800'
  },
  userName: {
    fontSize: 15,
    fontWeight: '800'
  },
  userPhone: {
    fontSize: 12,
    fontWeight: '600'
  },
  roleBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    marginTop: 2
  },
  roleButtons: {
    flexDirection: 'row',
    gap: 10
  },
  roleActionBtn: {
    flex: 1,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center'
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6
  },
  statBox: {
    alignItems: 'center',
    flex: 1
  },
  statVal: {
    fontSize: 16,
    fontWeight: '900',
    color: '#22C55E'
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '800',
    marginTop: 2
  },
  subStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
    paddingTop: 8
  },
  subStatLabel: {
    fontSize: 10,
    fontWeight: '700'
  },
  analyticsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10
  },
  analyticsCard: {
    width: '48%',
    borderRadius: 16,
    padding: 14,
    gap: 4
  },
  analyticsVal: {
    fontSize: 18,
    fontWeight: '900'
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 20
  },
  inputWrapper: {
    gap: 6
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '800'
  },
  formInput: {
    borderRadius: 12,
    borderWidth: 1,
    height: 44,
    paddingHorizontal: 12,
    fontSize: 13,
    fontWeight: '600'
  },
  formTextArea: {
    borderRadius: 12,
    borderWidth: 1,
    height: 80,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    fontWeight: '600',
    textAlignVertical: 'top'
  },
  sendNotifyBtn: {
    backgroundColor: '#22C55E',
    height: 44,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 6
  },
  sendNotifyBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800'
  },
  sectionHeadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  refreshBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: '#DCFCE7'
  },
  refreshBtnText: {
    color: '#16A34A',
    fontSize: 12,
    fontWeight: '800'
  }
});
