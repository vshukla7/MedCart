import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Alert, TextInput, Animated, ActivityIndicator } from 'react-native';
import { Ionicons, FontAwesome5, Feather } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { useTheme } from '../context/ThemeContext';
import { useCart } from '../context/CartContext';
import { useOrders } from '../context/OrderContext';
import { updateUserProfile } from '../services/api';

const isExpoGo = Constants.executionEnvironment === 'storeClient';

if (!isExpoGo) {
  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
  } catch (e) {}
}

// step: 'address_setup' | 'checkout' | 'success'
export const CheckoutModal = ({ visible, onClose, onSuccessOrder, currentUser, onUpdateUser }) => {
  const { theme } = useTheme();
  const { cartItems, grandTotal, subtotal, deliveryCharge, clearCart } = useCart();
  const { placeOrder } = useOrders();

  const hasAddress = !!(currentUser?.address?.trim());

  // ─── Step state ────────────────────────────────────────────────────────────
  const [step, setStep] = useState(hasAddress ? 'checkout' : 'address_setup');

  // ─── Address setup fields ─────────────────────────────────────────────────
  const [setupName, setSetupName]   = useState(currentUser?.name || '');
  const [setupPhone, setSetupPhone] = useState(currentUser?.phone || '');
  const [setupAddr, setSetupAddr]   = useState('');
  const [isSavingAddr, setIsSavingAddr] = useState(false);

  // ─── Checkout fields ──────────────────────────────────────────────────────
  const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery (COD)');
  const [addressName, setAddressName]   = useState('');
  const [addressPhone, setAddressPhone] = useState('');
  const [addressText, setAddressText]   = useState('');

  const [isPlacing, setIsPlacing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null);

  const scaleAnim = useRef(new Animated.Value(0)).current;

  // Sync when modal opens or currentUser changes
  useEffect(() => {
    if (visible && currentUser) {
      const addr = currentUser.address?.trim() || '';
      setStep(addr ? 'checkout' : 'address_setup');

      // Address setup defaults
      setSetupName(currentUser.name || '');
      setSetupPhone(currentUser.phone || '');
      setSetupAddr(addr);

      // Checkout defaults
      setAddressName(currentUser.name || '');
      setAddressPhone(currentUser.phone || '');
      setAddressText(addr);

      setIsSuccess(false);
      setPlacedOrder(null);
      scaleAnim.setValue(0);
    }
  }, [visible, currentUser]);

  // Success spring animation
  useEffect(() => {
    if (isSuccess) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 40,
        friction: 6,
        useNativeDriver: true,
      }).start();
    }
  }, [isSuccess]);

  // ─── Save address & advance to checkout ───────────────────────────────────
  const handleSaveAddress = async () => {
    if (!setupName.trim()) {
      Alert.alert('Required', 'Please enter your full name.');
      return;
    }
    if (!setupPhone.trim()) {
      Alert.alert('Required', 'Please enter your phone number.');
      return;
    }
    if (!setupAddr.trim()) {
      Alert.alert('Required', 'Please enter your delivery address.');
      return;
    }

    setIsSavingAddr(true);
    try {
      const payload = {
        name: setupName.trim(),
        address: setupAddr.trim(),
        latitude: currentUser?.latitude || 19.0760,
        longitude: currentUser?.longitude || 72.8777,
      };
      const res = await updateUserProfile(currentUser._id, payload);
      if (res.success) {
        // Propagate updated user to App state so it persists
        if (onUpdateUser) {
          onUpdateUser({ ...currentUser, ...payload });
        }
        // Pre-fill checkout fields with the new address
        setAddressName(setupName.trim());
        setAddressPhone(setupPhone.trim());
        setAddressText(setupAddr.trim());
        setStep('checkout');
      } else {
        Alert.alert('Error', res.message || 'Could not save address. Please try again.');
      }
    } catch (e) {
      Alert.alert('Error', 'Something went wrong saving your address.');
    } finally {
      setIsSavingAddr(false);
    }
  };

  // ─── Place order ──────────────────────────────────────────────────────────
  const triggerOrderNotification = async (order) => {
    if (isExpoGo) return;
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') return;
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `📦 Order Placed: #${order.orderNumber}`,
          body: `Your order for ₹${order.grandTotal} is successfully placed and is pending verification.`,
          sound: true,
        },
        trigger: null,
      });
    } catch (e) {
      console.error('[Notification Error]', e);
    }
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
        deliveryCharge,
        grandTotal,
        paymentMethod,
        shippingAddress: {
          fullName: addressName.trim(),
          phone: addressPhone.trim(),
          street: addressText.trim(),
          city: 'Mumbai',
          postalCode: '400001',
          latitude: currentUser?.latitude || 19.0760,
          longitude: currentUser?.longitude || 72.8777,
        },
      };
      const newOrder = await placeOrder(orderPayload);
      clearCart();
      setPlacedOrder(newOrder);
      setIsSuccess(true);
      setStep('success');
      triggerOrderNotification(newOrder);
    } catch (e) {
      Alert.alert('Checkout Error', 'Unable to place order. Please try again.');
    } finally {
      setIsPlacing(false);
    }
  };

  const handleGoToOrders = () => {
    onClose();
    if (onSuccessOrder && placedOrder) onSuccessOrder(placedOrder);
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.cardContainer, { backgroundColor: theme.card }]}>

          {/* ── Header ── */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.textPrimary }]}>
              {step === 'address_setup' ? 'Set Delivery Address' : step === 'success' ? 'Order Placed' : 'Checkout'}
            </Text>
            {step !== 'success' && (
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close-circle" size={26} color={theme.textSecondary} />
              </TouchableOpacity>
            )}
          </View>

          {/* ── Step: Address Setup ── */}
          {step === 'address_setup' && (
            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              {/* Info banner */}
              <View style={[styles.infoBanner, { backgroundColor: theme.inputBg, borderColor: '#22C55E' }]}>
                <Ionicons name="location" size={20} color="#22C55E" />
                <Text style={[styles.infoBannerText, { color: theme.textPrimary }]}>
                  We need your delivery address to confirm your first order. This will be saved to your profile.
                </Text>
              </View>

              <View style={styles.formContainer}>
                <View style={styles.inputBox}>
                  <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Full Name *</Text>
                  <TextInput
                    style={[styles.textInput, { backgroundColor: theme.inputBg, color: theme.textPrimary, borderColor: theme.border }]}
                    value={setupName}
                    onChangeText={setSetupName}
                    placeholder="Your full name"
                    placeholderTextColor={theme.textSecondary}
                  />
                </View>

                <View style={styles.inputBox}>
                  <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Phone Number *</Text>
                  <TextInput
                    style={[styles.textInput, { backgroundColor: theme.inputBg, color: theme.textPrimary, borderColor: theme.border }]}
                    value={setupPhone}
                    onChangeText={setSetupPhone}
                    placeholder="+91 XXXXX XXXXX"
                    placeholderTextColor={theme.textSecondary}
                    keyboardType="phone-pad"
                  />
                </View>

                <View style={styles.inputBox}>
                  <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Delivery Address *</Text>
                  <TextInput
                    style={[styles.textInputArea, { backgroundColor: theme.inputBg, color: theme.textPrimary, borderColor: theme.border }]}
                    value={setupAddr}
                    onChangeText={setSetupAddr}
                    placeholder="House/Flat No., Street, Area, City, Pincode"
                    placeholderTextColor={theme.textSecondary}
                    multiline
                    numberOfLines={3}
                  />
                </View>
              </View>

              <TouchableOpacity
                style={[styles.placeOrderBtn, isSavingAddr && { opacity: 0.7 }]}
                onPress={handleSaveAddress}
                disabled={isSavingAddr}
                activeOpacity={0.85}
              >
                {isSavingAddr
                  ? <ActivityIndicator color="#FFFFFF" />
                  : <>
                      <Feather name="map-pin" size={16} color="#FFFFFF" />
                      <Text style={styles.placeOrderText}>Save Address & Continue</Text>
                    </>
                }
              </TouchableOpacity>
            </ScrollView>
          )}

          {/* ── Step: Checkout ── */}
          {step === 'checkout' && (
            <>
              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Shipping Details</Text>
                <View style={styles.formContainer}>
                  <View style={styles.inputBox}>
                    <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Recipient Name</Text>
                    <TextInput
                      style={[styles.textInput, { backgroundColor: theme.inputBg, color: theme.textPrimary, borderColor: theme.border }]}
                      value={addressName}
                      onChangeText={setAddressName}
                      placeholder="Name of person receiving the order"
                      placeholderTextColor={theme.textSecondary}
                    />
                  </View>

                  <View style={styles.inputBox}>
                    <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Phone Number</Text>
                    <TextInput
                      style={[styles.textInput, { backgroundColor: theme.inputBg, color: theme.textPrimary, borderColor: theme.border }]}
                      value={addressPhone}
                      onChangeText={setAddressPhone}
                      placeholder="Contact number for delivery person to call"
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
                </View>

                <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Payment Method</Text>
                <View style={[styles.paymentOption, { backgroundColor: theme.inputBg, borderColor: '#22C55E' }]}>
                  <View style={styles.payLeft}>
                    <FontAwesome5 name="money-bill-wave" size={18} color="#F59E0B" />
                    <Text style={[styles.payTitle, { color: theme.textPrimary }]}>Cash on Delivery (COD)</Text>
                  </View>
                  <Ionicons name="checkmark-circle" size={20} color="#22C55E" />
                </View>

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
            </>
          )}

          {/* ── Step: Success ── */}
          {step === 'success' && placedOrder && (
            <View style={styles.successContainer}>
              <Animated.View style={[styles.successIconCircle, { transform: [{ scale: scaleAnim }] }]}>
                <Ionicons name="checkmark-circle" size={88} color="#22C55E" />
              </Animated.View>

              <Text style={[styles.successTitle, { color: theme.textPrimary }]}>Order Placed Successfully! 🎉</Text>
              <Text style={[styles.successSubtitle, { color: theme.textSecondary }]}>
                Your medicine order has been received. Our pharmacist will contact the recipient to verify any required prescriptions.
              </Text>

              <View style={[styles.successSummaryBox, { backgroundColor: theme.inputBg, borderColor: theme.border }]}>
                <Text style={[styles.summaryBoxHeading, { color: theme.textPrimary }]}>Delivery Information</Text>

                <View style={styles.summaryBoxRow}>
                  <Text style={[styles.summaryBoxLabel, { color: theme.textSecondary }]}>Order ID:</Text>
                  <Text style={[styles.summaryBoxVal, { color: theme.textPrimary }]}>#{placedOrder.orderNumber}</Text>
                </View>
                <View style={styles.summaryBoxRow}>
                  <Text style={[styles.summaryBoxLabel, { color: theme.textSecondary }]}>Recipient Name:</Text>
                  <Text style={[styles.summaryBoxVal, { color: theme.textPrimary }]}>{placedOrder.shippingAddress?.fullName}</Text>
                </View>
                <View style={styles.summaryBoxRow}>
                  <Text style={[styles.summaryBoxLabel, { color: theme.textSecondary }]}>Contact Phone:</Text>
                  <Text style={[styles.summaryBoxVal, { color: theme.textPrimary }]}>{placedOrder.shippingAddress?.phone}</Text>
                </View>
                <View style={styles.summaryBoxRow}>
                  <Text style={[styles.summaryBoxLabel, { color: theme.textSecondary }]}>Total Price:</Text>
                  <Text style={[styles.summaryBoxVal, { color: '#22C55E', fontWeight: '800' }]}>₹{placedOrder.grandTotal}</Text>
                </View>
              </View>

              <TouchableOpacity style={styles.successBtn} onPress={handleGoToOrders} activeOpacity={0.8}>
                <Text style={styles.successBtnText}>Go to My Orders</Text>
                <Feather name="arrow-right" size={18} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          )}

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
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
    marginBottom: 10
  },
  placeOrderText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800'
  },
  successContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 14
  },
  successIconCircle: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '900',
    textAlign: 'center'
  },
  successSubtitle: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 8
  },
  successSummaryBox: {
    width: '100%',
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    gap: 8,
    marginTop: 6
  },
  summaryBoxHeading: {
    fontSize: 13,
    fontWeight: '800',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
    paddingBottom: 6,
    marginBottom: 2
  },
  summaryBoxRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  summaryBoxLabel: {
    fontSize: 12,
    fontWeight: '600'
  },
  summaryBoxVal: {
    fontSize: 13,
    fontWeight: '700'
  },
  successBtn: {
    backgroundColor: '#22C55E',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    borderRadius: 16,
    gap: 8,
    width: '100%',
    marginTop: 10,
    shadowColor: '#22C55E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4
  },
  successBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800'
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    marginBottom: 16
  },
  infoBannerText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18
  }
});
