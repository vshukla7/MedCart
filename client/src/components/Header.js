import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

const PHONE_NUMBER = '919876543210';

export const Header = ({ onOpenProfile }) => {
  const { theme, isDarkMode, toggleTheme } = useTheme();

  const handleChatPress = async () => {
    const whatsappUrl = `whatsapp://send?phone=${PHONE_NUMBER}`;
    const webWhatsappUrl = `https://api.whatsapp.com/send?phone=${PHONE_NUMBER}`;
    try {
      const supported = await Linking.canOpenURL(whatsappUrl);
      if (supported) {
        await Linking.openURL(whatsappUrl);
      } else {
        await Linking.openURL(webWhatsappUrl);
      }
    } catch (err) {
      await Linking.openURL(webWhatsappUrl);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.left}>
        <View style={styles.brandRow}>
          <Text style={styles.appName}>MedCart</Text>
        </View>
      </View>

      <View style={styles.rightActions}>
        <TouchableOpacity 
          style={[styles.iconBtn, { backgroundColor: theme.inputBg }]} 
          onPress={handleChatPress}
          activeOpacity={0.7}
        >
          <Ionicons name="chatbubble-ellipses-outline" size={20} color={theme.textPrimary} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.iconBtn, { backgroundColor: theme.inputBg }]} 
          onPress={toggleTheme}
          activeOpacity={0.7}
        >
          <Feather name={isDarkMode ? 'sun' : 'moon'} size={20} color={theme.textPrimary} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.avatarBtn} 
          onPress={onOpenProfile}
          activeOpacity={0.7}
        >
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>JD</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  left: {
    flex: 1
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  appName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#22C55E',
    letterSpacing: -0.5
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center'
  },
  avatarBtn: {
    marginLeft: 2
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#22C55E',
    alignItems: 'center',
    justifyContent: 'center'
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14
  }
});
