import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { fetchOrders } from '../services/api';

export const OrdersScreen = ({ currentUser }) => {
  const { theme } = useTheme();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadHistory = async () => {
    if (!currentUser?._id) return;
    setLoading(true);
    try {
      const history = await fetchOrders({ role: 'user', userId: currentUser._id });
      setOrders(history || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [currentUser]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return '#F59E0B';
      case 'Confirmed': return '#3B82F6';
      case 'Packed': return '#8B5CF6';
      case 'Out for Delivery': return '#EC4899';
      case 'Delivered': return '#16A34A';
      default: return '#6B7280';
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text style={[styles.title, { color: theme.textPrimary }]}>My Orders History</Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Track and manage your pharmacy orders</Text>
          </View>
          <TouchableOpacity onPress={loadHistory} style={styles.refreshBtn}>
            <Feather name="refresh-cw" size={16} color="#22C55E" />
          </TouchableOpacity>
        </View>
      </View>

      {loading && <ActivityIndicator size="large" color="#22C55E" style={{ marginVertical: 20 }} />}

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {orders.map(ord => (
          <View 
            key={ord._id} 
            style={[styles.orderCard, { backgroundColor: theme.card, borderColor: theme.border }]}
          >
            <View style={styles.topRow}>
              <View>
                <Text style={[styles.orderNum, { color: theme.textPrimary }]}>Order #{ord.orderNumber}</Text>
                <Text style={[styles.dateText, { color: theme.textSecondary }]}>
                  {ord.createdAt ? new Date(ord.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Today'}
                </Text>
              </View>

              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(ord.status) + '1A' }]}>
                <Text style={[styles.statusText, { color: getStatusColor(ord.status) }]}>{ord.status}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            {/* Items Brief */}
            <View style={styles.itemsContainer}>
              {ord.items && ord.items.map((item, idx) => (
                <Text key={idx} style={[styles.itemText, { color: theme.textSecondary }]}>
                  • {item.name} (x{item.quantity})
                </Text>
              ))}
            </View>

            <View style={styles.bottomRow}>
              <View>
                <Text style={[styles.amountLabel, { color: theme.textSecondary }]}>Total Amount</Text>
                <Text style={styles.totalAmount}>₹{ord.grandTotal || ord.totalAmount}</Text>
              </View>

              <View style={styles.paymentInfo}>
                <Text style={[styles.payMethodText, { color: theme.textSecondary }]}>{ord.paymentMethod}</Text>
                <Text style={[styles.payStatusText, { color: ord.isPaid ? '#16A34A' : '#EF4444' }]}>
                  {ord.isPaid ? 'Paid' : 'Cash Pending'}
                </Text>
              </View>
            </View>
          </View>
        ))}

        {!loading && orders.length === 0 && (
          <View style={styles.emptyContainer}>
            <Feather name="package" size={48} color={theme.textSecondary} />
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No orders placed yet.</Text>
          </View>
        )}
      </ScrollView>
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
    paddingBottom: 12
  },
  title: {
    fontSize: 22,
    fontWeight: '800'
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 2
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
    gap: 14
  },
  orderCard: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  orderNum: {
    fontSize: 15,
    fontWeight: '800'
  },
  dateText: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12
  },
  statusText: {
    fontSize: 11,
    fontWeight: '800'
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 12
  },
  itemsContainer: {
    gap: 4,
    marginBottom: 12
  },
  itemText: {
    fontSize: 13,
    fontWeight: '500'
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  amountLabel: {
    fontSize: 10,
    fontWeight: '600'
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: '800',
    color: '#22C55E'
  },
  refreshBtn: {
    padding: 6
  },
  paymentInfo: {
    alignItems: 'flex-end',
    gap: 2
  },
  payMethodText: {
    fontSize: 10,
    fontWeight: '800'
  },
  payStatusText: {
    fontSize: 12,
    fontWeight: '800'
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    gap: 10
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center'
  }
});
