import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useCart } from '../context/CartContext';
import { fetchCategories, fetchMedicines } from '../services/api';

export const CategoriesScreen = ({ initialCategory = 'all', onSelectMedicine }) => {
  const { theme } = useTheme();
  const { addToCart } = useCart();
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [medicines, setMedicines] = useState([]);

  useEffect(() => {
    const load = async () => {
      const cats = await fetchCategories();
      setCategories(cats);
    };
    load();
  }, []);

  useEffect(() => {
    const loadMeds = async () => {
      const list = await fetchMedicines({ category: selectedCategory });
      setMedicines(list);
    };
    loadMeds();
  }, [selectedCategory]);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.textPrimary }]}>Medicine Categories</Text>
      </View>

      {/* Category Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
        <TouchableOpacity
          style={[
            styles.tab,
            { backgroundColor: selectedCategory === 'all' ? '#22C55E' : theme.inputBg }
          ]}
          onPress={() => setSelectedCategory('all')}
        >
          <Text style={[styles.tabText, { color: selectedCategory === 'all' ? '#FFFFFF' : theme.textPrimary }]}>
            All Medicines
          </Text>
        </TouchableOpacity>
        {categories.map(cat => {
          const isSelected = selectedCategory === cat.slug;
          return (
            <TouchableOpacity
              key={cat._id || cat.slug}
              style={[
                styles.tab,
                { backgroundColor: isSelected ? '#22C55E' : theme.inputBg }
              ]}
              onPress={() => setSelectedCategory(cat.slug)}
            >
              <Text style={[styles.tabText, { color: isSelected ? '#FFFFFF' : theme.textPrimary }]}>
                {cat.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Medicine Grid */}
      <ScrollView contentContainerStyle={styles.gridList} showsVerticalScrollIndicator={false}>
        <View style={styles.grid}>
          {medicines.map(med => (
            <TouchableOpacity
              key={med._id}
              style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}
              onPress={() => onSelectMedicine(med)}
              activeOpacity={0.8}
            >
              <Image source={{ uri: med.image }} style={styles.image} resizeMode="cover" />
              
              {med.requiresPrescription && (
                <View style={styles.rxBadge}>
                  <Text style={styles.rxText}>Rx Required</Text>
                </View>
              )}

              <Text style={[styles.name, { color: theme.textPrimary }]} numberOfLines={2}>
                {med.name}
              </Text>

              <Text style={[styles.generic, { color: theme.textSecondary }]} numberOfLines={1}>
                {med.genericName || med.category}
              </Text>

              <View style={styles.bottomRow}>
                <View>
                  <Text style={styles.price}>₹{med.price}</Text>
                  {med.originalPrice && (
                    <Text style={[styles.origPrice, { color: theme.textSecondary }]}>
                      ₹{med.originalPrice}
                    </Text>
                  )}
                </View>

                <TouchableOpacity
                  style={styles.addBtn}
                  onPress={() => addToCart(med, 1)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="cart" size={16} color="#FFFFFF" />
                  <Text style={styles.addBtnText}>Add</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </View>
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
    paddingBottom: 10
  },
  title: {
    fontSize: 22,
    fontWeight: '800'
  },
  tabsScroll: {
    paddingHorizontal: 20,
    gap: 10,
    paddingBottom: 12
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 20
  },
  tabText: {
    fontSize: 13,
    fontWeight: '700'
  },
  gridList: {
    paddingHorizontal: 20,
    paddingBottom: 30
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12
  },
  card: {
    width: '48%',
    borderRadius: 20,
    padding: 12,
    borderWidth: 1,
    position: 'relative'
  },
  image: {
    width: '100%',
    height: 100,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    marginBottom: 8
  },
  rxBadge: {
    position: 'absolute',
    top: 18,
    right: 18,
    backgroundColor: '#EF4444',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6
  },
  rxText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800'
  },
  name: {
    fontSize: 13,
    fontWeight: '700',
    minHeight: 34
  },
  generic: {
    fontSize: 11,
    fontWeight: '500',
    marginVertical: 4
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6
  },
  price: {
    fontSize: 15,
    fontWeight: '800',
    color: '#22C55E'
  },
  origPrice: {
    fontSize: 10,
    textDecorationLine: 'line-through'
  },
  addBtn: {
    backgroundColor: '#22C55E',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 4
  },
  addBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700'
  }
});
