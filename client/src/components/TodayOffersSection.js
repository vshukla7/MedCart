import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useCart } from '../context/CartContext';

export const TodayOffersSection = ({ offers = [], onSelectMedicine }) => {
  const { theme } = useTheme();
  const { addToCart } = useCart();

  if (!offers.length) return null;

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.titleRow}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Today's Offers</Text>
          <View style={styles.fireBadge}>
            <Text style={styles.fireText}>🔥 Hot Deals</Text>
          </View>
        </View>
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollList}
      >
        {offers.map(med => (
          <TouchableOpacity
            key={med._id}
            style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}
            onPress={() => onSelectMedicine(med)}
            activeOpacity={0.85}
          >
            <View style={styles.imageWrap}>
              <Image source={{ uri: med.image }} style={styles.image} resizeMode="cover" />
              {med.discount && (
                <View style={styles.discountBadge}>
                  <Text style={styles.discountText}>{med.discount}</Text>
                </View>
              )}
            </View>

            <View style={styles.details}>
              <Text style={[styles.name, { color: theme.textPrimary }]} numberOfLines={2}>{med.name}</Text>
              
              <View style={styles.priceRow}>
                <Text style={styles.price}>₹{med.price}</Text>
                {med.originalPrice && (
                  <Text style={[styles.originalPrice, { color: theme.textSecondary }]}>₹{med.originalPrice}</Text>
                )}
              </View>

              <TouchableOpacity
                style={styles.addBtn}
                onPress={() => addToCart(med, 1)}
                activeOpacity={0.7}
              >
                <Ionicons name="add-circle" size={18} color="#FFFFFF" />
                <Text style={styles.addBtnText}>Add to Cart</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 14
  },
  headerRow: {
    paddingHorizontal: 20,
    marginBottom: 12
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3
  },
  fireBadge: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12
  },
  fireText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#EF4444'
  },
  scrollList: {
    paddingHorizontal: 20,
    gap: 14
  },
  card: {
    width: 170,
    borderRadius: 20,
    padding: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2
  },
  imageWrap: {
    width: '100%',
    height: 110,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#F1F5F9',
    position: 'relative'
  },
  image: {
    width: '100%',
    height: '100%'
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#22C55E',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8
  },
  discountText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800'
  },
  details: {
    marginTop: 10
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    height: 38,
    lineHeight: 18
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    marginVertical: 6
  },
  price: {
    fontSize: 16,
    fontWeight: '800',
    color: '#22C55E'
  },
  originalPrice: {
    fontSize: 12,
    textDecorationLine: 'line-through'
  },
  addBtn: {
    backgroundColor: '#22C55E',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 12,
    gap: 4
  },
  addBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700'
  }
});
