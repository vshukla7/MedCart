import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons, FontAwesome5, Feather } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useCart } from '../context/CartContext';
import { useOrders } from '../context/OrderContext';

export const CheckoutModal = ({ visible, onClose, onSuccessOrder, currentUser }) => {
  const { theme } = useTheme();
  const { cartItems, grandTotal, subtotal, deliveryCharge, clearCart } = useCart();
  const { placeOrder } = useOrders();

  const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery (COD)');
  const [selectedAddress, setSelectedAddress] = useState({
    name: currentUser?.name || 'John Doe',
    phone: currentUser?.phone || '+91 98765 43210',
    address: '123 Healthcare Way, Sector 4, Mumbai, 400001'
  });
  const [isPlacing, setIsPlacing] = useState(false);

  // Keep address synchronized with currentUser if it changes
  React.useEffect(() => {
    if (currentUser) {
      setSelectedAddress(prev => ({
        ...prev,
        name: currentUser.name,
        phone: currentUser.phone
      }));
    }
  }, [currentUser]);

  const handlePlaceOrder = async () => {
    setIsPlacing(true);
    try {
      const orderPayload = {
        userId: currentUser?._id,
        items: cartItems,
        totalAmount: subtotal,
        deliveryCharge: deliveryCharge,
        grandTotal: grandTotal,
        paymentMethod: paymentMethod,
        shippingAddress: selectedAddress
      };

      const newOrder = await placeOrder(orderPayload);
      clearCart();
      setIsPlacing(false);
      onClose();
      onSuccessOrder(newOrder);
    } catch (e) {
      setIsPlacing(false);
      Alert.alert('Checkout Error', 'Unable to place order. Please try again.');
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.cardContainer, { backgroundColor: theme.card }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.textPrimary }]}>Checkout</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close-circle" size={26} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Delivery Address Section */}
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Delivery Address</Text>
            <View style={[styles.addressBox, { backgroundColor: theme.inputBg }]}>
              <View style={styles.addressHeader}>
                <Ionicons name="location" size={18} color="#22C55E" />
                <Text style={[styles.addressName, { color: theme.textPrimary }]}>{selectedAddress.name}</Text>
                <View style={styles.defaultBadge}>
                  <Text style={styles.defaultBadgeText}>Home</Text>
                </View>
              </View>
              <Text style={[styles.addressText, { color: theme.textSecondary }]}>{selectedAddress.address}</Text>
              <Text style={[styles.phoneText, { color: theme.textSecondary }]}>Phone: {selectedAddress.phone}</Text>
            </View>

            {/* Payment Method Section */}
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Payment Method</Text>

            <View
              style={[
                styles.paymentOption,
                { backgroundColor: theme.inputBg, borderColor: '#22C55E' }
              ]}
            >
              <View style={styles.payLeft}>
                <FontAwesome5 name="money-bill-wave" size={18} color="#F59E0B" />
                <Text style={[styles.payTitle, { color: theme.textPrimary }]}>Cash on Delivery (COD)</Text>
              </View>
              <Ionicons name="checkmark-circle" size={20} color="#22C55E" />
            </View>

            {/* Bill Summary */}
            <View style={styles.billBox}>
              <View style={styles.billRow}>
                <Text style={{ color: theme.textSecondary }}>Item Total</Text>
                <Text style={{ color: theme.textPrimary, fontWeight: '700' }}>₹{subtotal}</Text>
              </View>
              <View style={styles.billRow}>
                <Text style={{ color: theme.textSecondary }}>Delivery Charges</Text>
                <Text style={{ color: deliveryCharge === 0 ? '#22C55E' : theme.textPrimary, fontWeight: '700' }}>
                  {deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge}`}
                </Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.billRow}>
                <Text style={{ color: theme.textPrimary, fontWeight: '800', fontSize: 16 }}>Amount Payable</Text>
                <Text style={{ color: '#22C55E', fontWeight: '800', fontSize: 18 }}>₹{grandTotal}</Text>
              </View>
            </View>
          </ScrollView>

          <TouchableOpacity
            style={styles.placeOrderBtn}
            onPress={handlePlaceOrder}
            disabled={isPlacing}
            activeOpacity={0.85}
          >
            <Text style={styles.placeOrderText}>
              {isPlacing ? 'Placing Order...' : `Pay & Confirm Order (₹${grandTotal})`}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end'
  },
  cardContainer: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
    maxHeight: '88%'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16
  },
  title: {
    fontSize: 22,
    fontWeight: '800'
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginTop: 10,
    marginBottom: 8
  },
  addressBox: {
    padding: 14,
    borderRadius: 16,
    marginBottom: 12
  },
  addressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4
  },
  addressName: {
    fontSize: 14,
    fontWeight: '700'
  },
  defaultBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6
  },
  defaultBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#16A34A'
  },
  addressText: {
    fontSize: 12,
    lineHeight: 16
  },
  phoneText: {
    fontSize: 11,
    marginTop: 4
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    marginBottom: 8
  },
  payLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  payTitle: {
    fontSize: 13,
    fontWeight: '700'
  },
  billBox: {
    marginVertical: 14,
    gap: 8
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 4
  },
  placeOrderBtn: {
    backgroundColor: '#22C55E',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 10
  },
  placeOrderText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800'
  }
});
