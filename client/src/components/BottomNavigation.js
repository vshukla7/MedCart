import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useCart } from '../context/CartContext';

export const BottomNavigation = ({ activeTab, onTabPress }) => {
  const { theme } = useTheme();
  const { itemCount } = useCart();

  const tabs = [
    { key: 'home', label: 'Home', icon: 'home-outline', iconActive: 'home' },
    { key: 'categories', label: 'Categories', icon: 'grid-outline', iconActive: 'grid' },
    { key: 'cart', label: 'Cart', icon: 'cart-outline', iconActive: 'cart', badge: itemCount },
    { key: 'orders', label: 'Orders', icon: 'receipt-outline', iconActive: 'receipt' },
    { key: 'profile', label: 'Profile', icon: 'person-outline', iconActive: 'person' }
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.card, borderColor: theme.border }]}>
      {tabs.map(tab => {
        const isActive = activeTab === tab.key;
        return (
          <TouchableOpacity
            key={tab.key}
            style={styles.tabBtn}
            onPress={() => onTabPress(tab.key)}
            activeOpacity={0.7}
          >
            <View style={styles.iconWrap}>
              <Ionicons 
                name={isActive ? tab.iconActive : tab.icon} 
                size={22} 
                color={isActive ? '#22C55E' : theme.textSecondary} 
              />
              {tab.badge > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{tab.badge}</Text>
                </View>
              )}
            </View>
            <Text 
              style={[
                styles.tabLabel, 
                { color: isActive ? '#22C55E' : theme.textSecondary },
                isActive && styles.tabLabelActive
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 10,
    paddingBottom: Platform.OS === 'ios' ? 20 : 5,
    borderTopWidth: 1,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.06,
    shadowRadius: 10
  },
  tabBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1
  },
  iconWrap: {
    position: 'relative'
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: '#EF4444',
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800'
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 3
  },
  tabLabelActive: {
    fontWeight: '800'
  }
});
