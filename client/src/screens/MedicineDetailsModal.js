import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, Image, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useCart } from '../context/CartContext';

export const MedicineDetailsModal = ({ visible, medicine, onClose }) => {
  const { theme } = useTheme();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [activeMedicine, setActiveMedicine] = useState(null);

  React.useEffect(() => {
    if (medicine) {
      setActiveMedicine(medicine);
      setQuantity(1);
    }
  }, [medicine]);

  const handleAdd = () => {
    if (activeMedicine) {
      addToCart(activeMedicine, quantity);
    }
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.overlay}>
        {activeMedicine && (
          <View style={[styles.modalCard, { backgroundColor: theme.card }]}>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Ionicons name="close-circle" size={28} color={theme.textSecondary} />
            </TouchableOpacity>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Image source={{ uri: activeMedicine.image }} style={styles.image} resizeMode="cover" />

              <View style={styles.body}>
                {activeMedicine.requiresPrescription && (
                  <View style={styles.rxBanner}>
                    <Ionicons name="warning-outline" size={16} color="#EF4444" />
                    <Text style={styles.rxText}>Prescription Required for this Medicine</Text>
                  </View>
                )}

                <Text style={[styles.name, { color: theme.textPrimary }]}>{activeMedicine.name}</Text>
                <Text style={[styles.generic, { color: theme.textSecondary }]}>
                  {activeMedicine.genericName || activeMedicine.category} • {activeMedicine.manufacturer || 'MedCart Labs'}
                </Text>

                <View style={styles.ratingRow}>
                  <Ionicons name="star" size={16} color="#F59E0B" />
                  <Text style={[styles.rating, { color: theme.textPrimary }]}>{activeMedicine.rating || '4.8'}</Text>
                  <Text style={[styles.reviews, { color: theme.textSecondary }]}>({activeMedicine.reviewsCount || 150} reviews)</Text>
                </View>

                <View style={styles.divider} />

                <Text style={[styles.sectionHeading, { color: theme.textPrimary }]}>Description</Text>
                <Text style={[styles.description, { color: theme.textSecondary }]}>
                  {activeMedicine.description || 'High quality certified pharmaceutical product. Always take under medical guidance.'}
                </Text>

                {activeMedicine.dosage && (
                  <>
                    <Text style={[styles.sectionHeading, { color: theme.textPrimary }]}>Recommended Dosage</Text>
                    <Text style={[styles.dosageText, { color: theme.textSecondary }]}>{activeMedicine.dosage}</Text>
                  </>
                )}

                <View style={styles.divider} />

                {/* Quantity Picker */}
                <View style={styles.qtyRow}>
                  <Text style={[styles.qtyLabel, { color: theme.textPrimary }]}>Select Quantity:</Text>
                  <View style={[styles.qtySelector, { backgroundColor: theme.inputBg }]}>
                    <TouchableOpacity 
                      onPress={() => setQuantity(q => Math.max(1, q - 1))}
                      style={styles.qtyBtn}
                    >
                      <Feather name="minus" size={18} color={theme.textPrimary} />
                    </TouchableOpacity>
                    <Text style={[styles.qtyVal, { color: theme.textPrimary }]}>{quantity}</Text>
                    <TouchableOpacity 
                      onPress={() => setQuantity(q => q + 1)}
                      style={styles.qtyBtn}
                    >
                      <Feather name="plus" size={18} color={theme.textPrimary} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </ScrollView>

            {/* Bottom Action Footer */}
            <View style={[styles.footer, { borderColor: theme.border }]}>
              <View>
                <Text style={[styles.totalLabel, { color: theme.textSecondary }]}>Total Price</Text>
                <Text style={styles.totalPrice}>₹{activeMedicine.price * quantity}</Text>
              </View>

              <TouchableOpacity style={styles.addToCartBtn} onPress={handleAdd} activeOpacity={0.85}>
                <Ionicons name="cart" size={20} color="#FFFFFF" />
                <Text style={styles.addToCartText}>Add to Cart</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end'
  },
  modalCard: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '85%',
    paddingTop: 16
  },
  closeBtn: {
    position: 'absolute',
    top: 14,
    right: 14,
    zIndex: 10
  },
  image: {
    width: '100%',
    height: 200,
    backgroundColor: '#F1F5F9'
  },
  body: {
    padding: 20
  },
  rxBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    padding: 10,
    borderRadius: 12,
    gap: 6,
    marginBottom: 12
  },
  rxText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '700'
  },
  name: {
    fontSize: 20,
    fontWeight: '800'
  },
  generic: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 4
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8
  },
  rating: {
    fontSize: 14,
    fontWeight: '700'
  },
  reviews: {
    fontSize: 12
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 16
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 6
  },
  description: {
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 12
  },
  dosageText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#16A34A'
  },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 8
  },
  qtyLabel: {
    fontSize: 15,
    fontWeight: '700'
  },
  qtySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 16
  },
  qtyBtn: {
    padding: 4
  },
  qtyVal: {
    fontSize: 16,
    fontWeight: '800'
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1
  },
  totalLabel: {
    fontSize: 11,
    fontWeight: '600'
  },
  totalPrice: {
    fontSize: 22,
    fontWeight: '800',
    color: '#22C55E'
  },
  addToCartBtn: {
    backgroundColor: '#22C55E',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 16,
    gap: 8
  },
  addToCartText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800'
  }
});
