import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useCart } from '../context/CartContext';

export const CartScreen = ({ onProceedCheckout, onBrowseMedicines }) => {
  const { theme } = useTheme();
  const { 
    cartItems, 
    updateQuantity, 
    removeFromCart, 
    subtotal, 
    deliveryCharge, 
    grandTotal 
  } = useCart();

  if (cartItems.length === 0) {
    return (
      <View style={[styles.emptyContainer, { backgroundColor: theme.background }]}>
        <View style={styles.emptyIconCircle}>
          <Ionicons name="cart-outline" size={60} color="#22C55E" />
        </View>
        <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>Your Cart is Empty</Text>
        <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
          Looks like you haven't added any medicines to your cart yet.
        </Text>
        <TouchableOpacity style={styles.browseBtn} onPress={onBrowseMedicines}>
          <Text style={styles.browseBtnText}>Explore Pharmacy</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.textPrimary }]}>My Shopping Cart</Text>
        <Text style={[styles.countBadge, { color: theme.textSecondary }]}>({cartItems.length} items)</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Cart Item Cards */}
        {cartItems.map(item => (
          <View 
            key={item._id} 
            style={[styles.itemCard, { backgroundColor: theme.card, borderColor: theme.border }]}
          >
            <Image source={{ uri: item.image }} style={styles.itemImage} resizeMode="cover" />

            <View style={styles.itemInfo}>
              <View style={styles.itemTopRow}>
                <Text style={[styles.itemName, { color: theme.textPrimary }]} numberOfLines={1}>
                  {item.name}
                </Text>
                <TouchableOpacity onPress={() => removeFromCart(item._id)}>
                  <Ionicons name="trash-outline" size={18} color="#EF4444" />
                </TouchableOpacity>
              </View>

              <Text style={styles.itemPrice}>₹{item.price}</Text>

              <View style={styles.qtyRow}>
                <View style={[styles.qtyBox, { backgroundColor: theme.inputBg }]}>
                  <TouchableOpacity onPress={() => updateQuantity(item._id, -1)} style={styles.qtyBtn}>
                    <Feather name="minus" size={14} color={theme.textPrimary} />
                  </TouchableOpacity>
                  <Text style={[styles.qtyText, { color: theme.textPrimary }]}>{item.quantity}</Text>
                  <TouchableOpacity onPress={() => updateQuantity(item._id, 1)} style={styles.qtyBtn}>
                    <Feather name="plus" size={14} color={theme.textPrimary} />
                  </TouchableOpacity>
                </View>

                <Text style={[styles.itemSubtotal, { color: theme.textPrimary }]}>
                  ₹{item.price * item.quantity}
                </Text>
              </View>
            </View>
          </View>
        ))}

        {/* Delivery Promo */}
        <View style={styles.freeDelBanner}>
          <Ionicons name="car-outline" size={20} color="#16A34A" />
          <Text style={styles.freeDelText}>
            🎉 Flat ₹20 Cash on Delivery charge applied
          </Text>
        </View>

        {/* Price Breakdown Summary */}
        <View style={[styles.summaryCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.summaryTitle, { color: theme.textPrimary }]}>Order Summary</Text>

          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Subtotal</Text>
            <Text style={[styles.summaryValue, { color: theme.textPrimary }]}>₹{subtotal}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Delivery Fee</Text>
            <Text style={[styles.summaryValue, { color: deliveryCharge === 0 ? '#22C55E' : theme.textPrimary }]}>
              {deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge}`}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.summaryRow}>
            <Text style={[styles.grandTotalLabel, { color: theme.textPrimary }]}>Total Payable</Text>
            <Text style={styles.grandTotalValue}>₹{grandTotal}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Checkout Action Button */}
      <View style={[styles.footer, { borderColor: theme.border }]}>
        <View>
          <Text style={[styles.footerTotalLabel, { color: theme.textSecondary }]}>Grand Total</Text>
          <Text style={styles.footerTotalVal}>₹{grandTotal}</Text>
        </View>

        <TouchableOpacity style={styles.checkoutBtn} onPress={onProceedCheckout} activeOpacity={0.85}>
          <Text style={styles.checkoutText}>Proceed to Checkout</Text>
          <Feather name="arrow-right" size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
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
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8
  },
  title: {
    fontSize: 22,
    fontWeight: '800'
  },
  countBadge: {
    fontSize: 14,
    fontWeight: '600'
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 12
  },
  itemCard: {
    flexDirection: 'row',
    borderRadius: 18,
    padding: 12,
    borderWidth: 1,
    gap: 12,
    alignItems: 'center'
  },
  itemImage: {
    width: 70,
    height: 70,
    borderRadius: 14,
    backgroundColor: '#F1F5F9'
  },
  itemInfo: {
    flex: 1
  },
  itemTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  itemName: {
    fontSize: 14,
    fontWeight: '700',
    flex: 1,
    marginRight: 8
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '800',
    color: '#22C55E',
    marginVertical: 4
  },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4
  },
  qtyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 12
  },
  qtyBtn: {
    padding: 2
  },
  qtyText: {
    fontSize: 13,
    fontWeight: '800'
  },
  itemSubtotal: {
    fontSize: 14,
    fontWeight: '800'
  },
  freeDelBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    padding: 12,
    borderRadius: 14,
    gap: 8,
    marginVertical: 4
  },
  freeDelText: {
    color: '#15803D',
    fontSize: 12,
    fontWeight: '700'
  },
  summaryCard: {
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    gap: 10
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  summaryLabel: {
    fontSize: 13,
    fontWeight: '500'
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '700'
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 4
  },
  grandTotalLabel: {
    fontSize: 15,
    fontWeight: '800'
  },
  grandTotalValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#22C55E'
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1
  },
  footerTotalLabel: {
    fontSize: 11,
    fontWeight: '600'
  },
  footerTotalVal: {
    fontSize: 20,
    fontWeight: '800',
    color: '#22C55E'
  },
  checkoutBtn: {
    backgroundColor: '#22C55E',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderRadius: 16,
    gap: 8
  },
  checkoutText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800'
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30
  },
  emptyIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 8
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24
  },
  browseBtn: {
    backgroundColor: '#22C55E',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 16
  },
  browseBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800'
  }
});
