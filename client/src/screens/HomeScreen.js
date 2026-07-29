import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, RefreshControl, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Header } from '../components/Header';
import { SearchBar } from '../components/SearchBar';
import { CategoryGrid } from '../components/CategoryGrid';
import { TodayOffersSection } from '../components/TodayOffersSection';
import { PopularMedicinesSection } from '../components/PopularMedicinesSection';
import { UploadPrescriptionCard } from '../components/UploadPrescriptionCard';
import { OrderTrackingCard } from '../components/OrderTrackingCard';
import { fetchCategories, fetchMedicines } from '../services/api';

export const HomeScreen = ({ 
  onSelectCategory, 
  onSelectMedicine, 
  onOpenProfile,
  onOpenOrders,
  onOpenChat
}) => {
  const { theme } = useTheme();
  const [categories, setCategories] = useState([]);
  const [offers, setOffers] = useState([]);
  const [popularMedicines, setPopularMedicines] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    const cats = await fetchCategories();
    const todayOffers = await fetchMedicines({ offer: 'true' });
    const popular = await fetchMedicines({ popular: 'true' });

    setCategories(cats);
    setOffers(todayOffers);
    setPopularMedicines(popular);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleSearch = async (text) => {
    setSearchQuery(text);
    if (text.trim().length > 0) {
      const res = await fetchMedicines({ search: text });
      setSearchResults(res);
    } else {
      setSearchResults([]);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning 👋';
    if (hour < 17) return 'Good Afternoon ☀️';
    return 'Good Evening 🌙';
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Header onOpenProfile={onOpenProfile} onOpenChat={onOpenChat} />
      
      <SearchBar 
        value={searchQuery}
        onChangeText={handleSearch}
        onClear={() => handleSearch('')}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#22C55E" />
        }
      >
        {searchQuery.trim().length > 0 ? (
          <View style={styles.searchContainer}>
            <Text style={[styles.searchTitle, { color: theme.textPrimary }]}>
              Search Results for "{searchQuery}" ({searchResults.length})
            </Text>
            <View style={styles.searchResultsGrid}>
              {searchResults.map(med => (
                <TouchableOpacity 
                  key={med._id} 
                  style={[styles.searchResultCard, { backgroundColor: theme.card, borderColor: theme.border }]}
                  onPress={() => onSelectMedicine(med)}
                >
                  <Text style={[styles.medName, { color: theme.textPrimary }]}>{med.name}</Text>
                  <Text style={styles.medPrice}>₹{med.price}</Text>
                </TouchableOpacity>
              ))}
              {searchResults.length === 0 && (
                <Text style={[styles.noResults, { color: theme.textSecondary }]}>
                  No medicines found matching your search.
                </Text>
              )}
            </View>
          </View>
        ) : (
          <>
            <Text style={[styles.greeting, { color: theme.textSecondary }]}>{getGreeting()}</Text>

            {/* Today's Offers (Horizontal Scroll) */}
            <TodayOffersSection 
              offers={offers} 
              onSelectMedicine={onSelectMedicine} 
            />

            {/* Categories (Grid) */}
            <CategoryGrid 
              categories={categories} 
              onSelectCategory={onSelectCategory} 
            />

            {/* Upload Prescription CTA (WhatsApp) */}
            <UploadPrescriptionCard />

            {/* Order Tracking Progress Card */}
            <OrderTrackingCard onTrackPress={onOpenOrders} />

            {/* Popular Medicines */}
            <PopularMedicinesSection 
              medicines={popularMedicines} 
              onSelectMedicine={onSelectMedicine} 
            />
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginVertical: 10
  },
  searchTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12
  },
  greeting: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
    paddingHorizontal: 20,
    paddingTop: 12
  },
  searchResultsGrid: {
    gap: 10
  },
  searchResultCard: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  medName: {
    fontSize: 14,
    fontWeight: '600'
  },
  medPrice: {
    fontSize: 15,
    fontWeight: '800',
    color: '#22C55E'
  },
  noResults: {
    fontSize: 14,
    textAlign: 'center',
    marginVertical: 20
  },
  scrollContent: {
    paddingBottom: 20
  }
});
