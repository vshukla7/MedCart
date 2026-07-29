import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons, FontAwesome5, Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

const getCategoryIcon = (slug, color) => {
  switch (slug) {
    case 'tablets':
      return <MaterialCommunityIcons name="pill" size={26} color="#16A34A" />;
    case 'baby-care':
      return <FontAwesome5 name="baby" size={24} color="#EA580C" />;
    case 'diabetes':
      return <Ionicons name="heart-dislike" size={26} color="#DC2626" />;
    case 'personal-care':
      return <Ionicons name="sparkles" size={26} color="#2563EB" />;
    default:
      return <MaterialCommunityIcons name="medical-bag" size={26} color="#16A34A" />;
  }
};

export const CategoryGrid = ({ categories = [], onSelectCategory, selectedCategory }) => {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Categories</Text>
      </View>
      
      <View style={styles.grid}>
        {categories.map(cat => {
          const isSelected = selectedCategory === cat.slug;
          return (
            <TouchableOpacity
              key={cat._id || cat.slug}
              style={[
                styles.card,
                { backgroundColor: cat.color || theme.card },
                isSelected && styles.selectedCard
              ]}
              onPress={() => onSelectCategory(cat.slug)}
              activeOpacity={0.8}
            >
              <View style={styles.iconContainer}>
                {getCategoryIcon(cat.slug, cat.color)}
              </View>
              <Text style={styles.catName} numberOfLines={1}>{cat.name}</Text>
              {cat.itemCount && (
                <Text style={styles.itemCount}>{cat.itemCount}+ items</Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginVertical: 12
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between'
  },
  card: {
    width: '48.5%',
    padding: 16,
    borderRadius: 20,
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    minHeight: 110,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    marginBottom: 12
  },
  selectedCard: {
    borderWidth: 2,
    borderColor: '#22C55E'
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10
  },
  catName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F2937'
  },
  itemCount: {
    fontSize: 11,
    fontWeight: '500',
    color: '#6B7280',
    marginTop: 2
  }
});
