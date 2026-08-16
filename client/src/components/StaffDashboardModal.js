import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { fetchOrders, updateOrderStatus } from '../services/api';

export const StaffDashboardModal = ({ visible, onClose, currentUser }) => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState('deliveries'); // deliveries, stats
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);

  const loadStaffData = async () => {
    if (!currentUser?._id) return;
    setLoading(true);
    try {
      const staffOrders = await fetchOrders({ role: 'staff', userId: currentUser._id });
      if (staffOrders) {
        setOrders(prev => {
          const map = new Map();
          // Server/incoming orders take precedence
          staffOrders.forEach(o => {
            if (o && o._id) map.set(o._id, o);
          });
          // Merge previous local orders that are not in the fetched list
          prev.forEach(o => {
            if (o && o._id && !map.has(o._id)) {
              map.set(o._id, o);
            }
          });
          return Array.from(map.values()).sort((a, b) => {
            const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
            const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
            return dateB - dateA;
          });
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible) {
      loadStaffData();
    }
  }, [visible, activeTab]);

  const handleUpdateStatus = async (orderId, currentStatus) => {
    let nextStatus = '';
    if (currentStatus === 'Confirmed') nextStatus = 'Packed';
    else if (currentStatus === 'Packed') nextStatus = 'Out for Delivery';
    else if (currentStatus === 'Out for Delivery') nextStatus = 'Delivered';

    if (!nextStatus) return;

    const prevOrders = [...orders];
    const statusMap = { 'Confirmed': 3, 'Packed': 4, 'Out for Delivery': 5 };

    Alert.alert(
      'Update Status',
      `Move order to ${nextStatus.toUpperCase()}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Update',
          onPress: async () => {
            // Optimistic update
            setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: nextStatus, statusStep: statusMap[nextStatus] || o.statusStep } : o));
            
            try {
              const res = await updateOrderStatus(orderId, nextStatus);
              if (res.success) {
                loadStaffData();
              } else {
                setOrders(prevOrders);
                Alert.alert('Error', 'Could not update status');
              }
            } catch (e) {
              setOrders(prevOrders);
              Alert.alert('Error', 'Something went wrong');
            }
          }
        }
      ]
    );
  };

  const handleCancelOrder = async (orderId) => {
    const prevOrders = [...orders];
    
    Alert.alert(
      'Cancel Delivery',
      'Are you sure you want to mark this delivery as Cancelled?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            // Optimistic update
            setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: 'Cancelled', statusStep: 0 } : o));
            
            try {
              const res = await updateOrderStatus(orderId, 'Cancelled');
              if (res.success) {
                loadStaffData();
              } else {
                setOrders(prevOrders);
                Alert.alert('Error', 'Could not cancel order');
              }
            } catch (e) {
              setOrders(prevOrders);
              Alert.alert('Error', 'Something went wrong');
            }
          }
        }
      ]
    );
  };

  // Compute staff metrics
  const totalDeliveries = orders.length;
  const completed = orders.filter(o => o.status === 'Delivered');
  const pending = orders.filter(o => !['Delivered', 'Cancelled'].includes(o.status));
  const cancelled = orders.filter(o => o.status === 'Cancelled');
  const codCollected = completed.reduce((sum, o) => sum + o.grandTotal, 0);
  const successRate = totalDeliveries > 0 ? Math.round((completed.length / totalDeliveries) * 100) : 0;

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.backBtn}>
            <Feather name="arrow-left" size={24} color={theme.textPrimary} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: theme.textPrimary }]}>Staff Portal</Text>
        </View>

        {/* Tabs */}
        <View style={[styles.tabBar, { borderBottomColor: theme.border }]}>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'deliveries' && { borderBottomColor: '#22C55E' }]}
            onPress={() => setActiveTab('deliveries')}
          >
            <Feather name="truck" size={16} color={activeTab === 'deliveries' ? '#22C55E' : theme.textSecondary} />
            <Text style={[styles.tabLabel, { color: activeTab === 'deliveries' ? '#22C55E' : theme.textSecondary }]}>
              My Deliveries
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'stats' && { borderBottomColor: '#22C55E' }]}
            onPress={() => setActiveTab('stats')}
          >
            <Feather name="award" size={16} color={activeTab === 'stats' ? '#22C55E' : theme.textSecondary} />
            <Text style={[styles.tabLabel, { color: activeTab === 'stats' ? '#22C55E' : theme.textSecondary }]}>
              My Stats
            </Text>
          </TouchableOpacity>
        </View>

        {loading && <ActivityIndicator size="large" color="#22C55E" style={{ marginVertical: 20 }} />}

        {/* Body Content */}
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* Deliveries Tab */}
          {activeTab === 'deliveries' && (
            <View style={styles.tabSection}>
              <Text style={[styles.sectionHeading, { color: theme.textPrimary }]}>Assigned Delivery Tasks</Text>
              
              {orders.map(ord => (
                <View key={ord._id} style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
                  <View style={styles.cardHeader}>
                    <Text style={[styles.orderNum, { color: theme.textPrimary }]}>Order #{ord.orderNumber}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: ord.status === 'Delivered' ? '#DCFCE7' : ord.status === 'Cancelled' ? '#FEE2E2' : '#FEF3C7' }]}>
                      <Text style={[styles.statusText, { color: ord.status === 'Delivered' ? '#16A34A' : ord.status === 'Cancelled' ? '#EF4444' : '#D97706' }]}>
                        {ord.status.toUpperCase()}
                      </Text>
                    </View>
                  </View>

                  <Text style={[styles.cardDetails, { color: theme.textPrimary, fontWeight: '800' }]}>
                    👤 Recipient Name: {ord.shippingAddress?.fullName || 'N/A'}
                  </Text>
                  <Text style={[styles.cardDetails, { color: theme.textSecondary }]}>
                    📍 Delivery Address: {ord.shippingAddress?.street || ord.shippingAddress?.address || 'N/A'}
                  </Text>
                  <Text style={[styles.cardDetails, { color: theme.textPrimary, fontWeight: '800' }]}>
                    📞 Contact Phone: {ord.shippingAddress?.phone || 'N/A'}
                  </Text>
                  <Text style={[styles.cardDetails, { color: '#F59E0B', fontWeight: '800' }]}>
                    Collect COD Cash: ₹{ord.grandTotal}
                  </Text>

                  <View style={styles.itemsBrief}>
                    {ord.items?.map((it, idx) => (
                      <Text key={idx} style={[styles.itemText, { color: theme.textSecondary }]}>
                        • {it.name} (x{it.quantity})
                      </Text>
                    ))}
                  </View>

                  {/* Actions depending on state */}
                  {['Confirmed', 'Packed', 'Out for Delivery'].includes(ord.status) && (
                    <>
                      <View style={styles.actionsDivider} />
                      <View style={styles.cardActions}>
                        <TouchableOpacity 
                          style={styles.updateBtn} 
                          onPress={() => handleUpdateStatus(ord._id, ord.status)}
                        >
                          <Feather name="refresh-cw" size={14} color="#FFFFFF" />
                          <Text style={styles.updateBtnText}>
                            {ord.status === 'Confirmed' && 'Mark as Packed'}
                            {ord.status === 'Packed' && 'Mark Out for Delivery'}
                            {ord.status === 'Out for Delivery' && 'Mark Delivered'}
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                          style={styles.cancelBtn} 
                          onPress={() => handleCancelOrder(ord._id)}
                        >
                          <Feather name="x-circle" size={14} color="#EF4444" />
                          <Text style={styles.cancelBtnText}>Cancel Delivery</Text>
                        </TouchableOpacity>
                      </View>
                    </>
                  )}
                </View>
              ))}

              {orders.length === 0 && !loading && (
                <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No active delivery tasks assigned.</Text>
              )}
            </View>
          )}

          {/* Stats Tab */}
          {activeTab === 'stats' && (
            <View style={styles.tabSection}>
              <Text style={[styles.sectionHeading, { color: theme.textPrimary }]}>My Delivery Performance</Text>
              
              <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border, gap: 14 }]}>
                <View style={styles.metricRow}>
                  <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>Total Deliveries Assigned</Text>
                  <Text style={[styles.metricVal, { color: theme.textPrimary }]}>{totalDeliveries}</Text>
                </View>

                <View style={styles.metricRow}>
                  <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>Cash COD Collected</Text>
                  <Text style={[styles.metricVal, { color: '#22C55E' }]}>₹{codCollected}</Text>
                </View>

                <View style={styles.divider} />

                <View style={styles.metricGrid}>
                  <View style={styles.gridBox}>
                    <Text style={[styles.gridVal, { color: '#16A34A' }]}>{completed.length}</Text>
                    <Text style={[styles.gridLabel, { color: theme.textSecondary }]}>Completed</Text>
                  </View>
                  <View style={styles.gridBox}>
                    <Text style={[styles.gridVal, { color: '#D97706' }]}>{pending.length}</Text>
                    <Text style={[styles.gridLabel, { color: theme.textSecondary }]}>Pending</Text>
                  </View>
                  <View style={styles.gridBox}>
                    <Text style={[styles.gridVal, { color: '#EF4444' }]}>{cancelled.length}</Text>
                    <Text style={[styles.gridLabel, { color: theme.textSecondary }]}>Cancelled</Text>
                  </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.metricRow}>
                  <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>Delivery Success Rate</Text>
                  <Text style={[styles.metricVal, { color: '#22C55E' }]}>{successRate}%</Text>
                </View>
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
    gap: 20
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
    fontSize: 13,
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
    flexDirection: 'row',
    gap: 10
  },
  updateBtn: {
    flex: 1.4,
    backgroundColor: '#22C55E',
    flexDirection: 'row',
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6
  },
  updateBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800'
  },
  cancelBtn: {
    flex: 1,
    borderColor: '#EF4444',
    borderWidth: 1.5,
    flexDirection: 'row',
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6
  },
  cancelBtnText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '800'
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  metricLabel: {
    fontSize: 13,
    fontWeight: '800'
  },
  metricVal: {
    fontSize: 18,
    fontWeight: '900'
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.05)'
  },
  metricGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  gridBox: {
    alignItems: 'center',
    flex: 1
  },
  gridVal: {
    fontSize: 16,
    fontWeight: '900'
  },
  gridLabel: {
    fontSize: 10,
    fontWeight: '800',
    marginTop: 2
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 20
  }
});
