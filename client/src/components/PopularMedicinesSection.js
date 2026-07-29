import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useCart } from '../context/CartContext';

export const PopularMedicinesSection = ({ medicines = [], onSelectMedicine }) => {
  const { theme } = useTheme();
  const { addToCart } = useCart();

  if (!medicines.length) return null;

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Popular Medicines</Text>
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollList}
      >
        {medicines.map(med => (
          <TouchableOpacity
            key={med._id}
            style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}
            onPress={() => onSelectMedicine(med)}
            activeOpacity={0.85}
          >
            <Image source={{ uri: med.image }} style={styles.image} resizeMode="cover" />

            <View style={styles.info}>
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={12} color="#F59E0B" />
                <Text style={[styles.ratingText, { color: theme.textSecondary }]}>
                  {med.rating || '4.8'} ({med.reviewsCount || 120})
                </Text>
              </View>

              <Text style={[styles.name, { color: theme.textPrimary }]} numberOfLines={1}>
                {med.name}
              </Text>

              <View style={styles.bottomRow}>
                <Text style={styles.price}>₹{med.price}</Text>

                <TouchableOpacity
                  style={styles.quickAddBtn}
                  onPress={() => addToCart(med, 1)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="add" size={18} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10
  },
  headerRow: {
    paddingHorizontal: 20,
    marginBottom: 12
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3
  },
  scrollList: {
    paddingHorizontal: 20,
    gap: 12
  },
  card: {
    width: 220,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 18,
    borderWidth: 1,
    gap: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6
  },
  image: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: '#F1F5F9'
  },
  info: {
    flex: 1
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2
  },
  ratingText: {
    fontSize: 11,
    fontWeight: '600'
  },
  name: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 4
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  price: {
    fontSize: 15,
    fontWeight: '800',
    color: '#22C55E'
  },
  quickAddBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#22C55E',
    alignItems: 'center',
    justifyContent: 'center'
  }
});
