import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Alert, TextInput } from 'react-native';
import { Ionicons, FontAwesome5, Feather } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useCart } from '../context/CartContext';
import { useOrders } from '../context/OrderContext';

export const CheckoutModal = ({ visible, onClose, onSuccessOrder, currentUser }) => {
  const { theme } = useTheme();
  const { cartItems, grandTotal, subtotal, deliveryCharge, clearCart } = useCart();
  const { placeOrder } = useOrders();

  const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery (COD)');
  
  const [addressName, setAddressName] = useState(currentUser?.name || 'John Doe');
  const [addressPhone, setAddressPhone] = useState(currentUser?.phone || '+91 98765 43210');
  const [addressText, setAddressText] = useState(currentUser?.address || '123 Healthcare Way, Sector 4, Mumbai, 400001');
  const [latitude, setLatitude] = useState(currentUser?.latitude?.toString() || '19.0760');
  const [longitude, setLongitude] = useState(currentUser?.longitude?.toString() || '72.8777');
  
  const [isPlacing, setIsPlacing] = useState(false);

  // Keep address synchronized with currentUser if it changes
  React.useEffect(() => {
    if (currentUser) {
      setAddressName(currentUser.name || 'John Doe');
      setAddressPhone(currentUser.phone || '+91 98765 43210');
      setAddressText(currentUser.address || '123 Healthcare Way, Sector 4, Mumbai, 400001');
      setLatitude(currentUser.latitude?.toString() || '19.0760');
      setLongitude(currentUser.longitude?.toString() || '72.8777');
    }
  }, [currentUser, visible]);

  // Simulate Map Click Pin Movement
  const handleMapPinPress = () => {
    const randomLat = (19.05 + Math.random() * 0.05).toFixed(4);
    const randomLng = (72.85 + Math.random() * 0.05).toFixed(4);
    setLatitude(randomLat);
    setLongitude(randomLng);
    Alert.alert('Location Pinned', `Delivery location set to Lat: ${randomLat}, Lng: ${randomLng}`);
  };

  const handlePlaceOrder = async () => {
    if (!addressName.trim() || !addressText.trim() || !addressPhone.trim()) {
      Alert.alert('Checkout Error', 'Please fill in all shipping details.');
      return;
    }
    
    setIsPlacing(true);
    try {
      const orderPayload = {
        userId: currentUser?._id,
        items: cartItems,
        totalAmount: subtotal,
        deliveryCharge: deliveryCharge,
        grandTotal: grandTotal,
        paymentMethod: paymentMethod,
        shippingAddress: {
          fullName: addressName.trim(),
          phone: addressPhone.trim(),
          street: addressText.trim(),
          city: 'Mumbai',
          postalCode: '400001',
          latitude: parseFloat(latitude) || 19.0760,
          longitude: parseFloat(longitude) || 72.8777
        }
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
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Shipping Details</Text>
            <View style={styles.formContainer}>
              <View style={styles.inputBox}>
                <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Full Name</Text>
                <TextInput
                  style={[styles.textInput, { backgroundColor: theme.inputBg, color: theme.textPrimary, borderColor: theme.border }]}
                  value={addressName}
                  onChangeText={setAddressName}
                  placeholder="Enter receiver's name"
                  placeholderTextColor={theme.textSecondary}
                />
              </View>

              <View style={styles.inputBox}>
                <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Phone Number</Text>
                <TextInput
                  style={[styles.textInput, { backgroundColor: theme.inputBg, color: theme.textPrimary, borderColor: theme.border }]}
                  value={addressPhone}
                  onChangeText={setAddressPhone}
                  placeholder="Enter contact number"
                  placeholderTextColor={theme.textSecondary}
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.inputBox}>
                <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Delivery Address</Text>
                <TextInput
                  style={[styles.textInputArea, { backgroundColor: theme.inputBg, color: theme.textPrimary, borderColor: theme.border }]}
                  value={addressText}
                  onChangeText={setAddressText}
                  placeholder="Enter complete shipping address"
                  placeholderTextColor={theme.textSecondary}
                  multiline
                  numberOfLines={2}
                />
              </View>

              <Text style={[styles.inputLabel, { color: theme.textSecondary, marginTop: 4 }]}>Pin Address on Map</Text>
              <TouchableOpacity 
                style={[styles.checkoutMapContainer, { borderColor: theme.border }]} 
                onPress={handleMapPinPress}
                activeOpacity={0.9}
              >
                <View style={styles.mapSimulationOverlay}>
                  {/* Streets */}
                  <View style={styles.streetHorizontal} />
                  <View style={styles.streetVertical1} />
                  <View style={styles.streetVertical2} />
                  {/* Pin */}
                  <View style={styles.mapPin}>
                    <Ionicons name="location" size={24} color="#EF4444" />
                  </View>
                  <View style={styles.mapInstruction}>
                    <Text style={styles.instructionText}>Tap inside map to drop pin 📍</Text>
                  </View>
                </View>
              </TouchableOpacity>

              <View style={styles.coordinatesRow}>
                <View style={{ flex: 1, gap: 4 }}>
                  <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Latitude</Text>
                  <TextInput
                    style={[styles.textInput, { backgroundColor: theme.inputBg, color: theme.textPrimary, borderColor: theme.border }]}
                    value={latitude}
                    onChangeText={setLatitude}
                    keyboardType="numeric"
                  />
                </View>
                <View style={{ flex: 1, gap: 4 }}>
                  <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Longitude</Text>
                  <TextInput
                    style={[styles.textInput, { backgroundColor: theme.inputBg, color: theme.textPrimary, borderColor: theme.border }]}
                    value={longitude}
                    onChangeText={setLongitude}
                    keyboardType="numeric"
                  />
                </View>
              </View>
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
  formContainer: {
    gap: 10,
    marginBottom: 14
  },
  inputBox: {
    gap: 4
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '800'
  },
  textInput: {
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 13,
    fontWeight: '600'
  },
  textInputArea: {
    height: 52,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    fontSize: 13,
    fontWeight: '600',
    textAlignVertical: 'top'
  },
  checkoutMapContainer: {
    height: 100,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    backgroundColor: '#E2F0D9',
    position: 'relative'
  },
  mapSimulationOverlay: {
    flex: 1,
    position: 'relative'
  },
  streetHorizontal: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '40%',
    height: 16,
    backgroundColor: '#FFFFFF',
    opacity: 0.8
  },
  streetVertical1: {
    position: 'absolute',
    left: '25%',
    top: 0,
    bottom: 0,
    width: 16,
    backgroundColor: '#FFFFFF',
    opacity: 0.8
  },
  streetVertical2: {
    position: 'absolute',
    left: '70%',
    top: 0,
    bottom: 0,
    width: 16,
    backgroundColor: '#FFFFFF',
    opacity: 0.8
  },
  mapPin: {
    position: 'absolute',
    left: '46%',
    top: '25%',
    alignItems: 'center',
    justifyContent: 'center'
  },
  mapInstruction: {
    position: 'absolute',
    bottom: 4,
    left: 6,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4
  },
  instructionText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '800'
  },
  coordinatesRow: {
    flexDirection: 'row',
    gap: 10
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
