import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Alert } from 'react-native';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

export const UploadPrescriptionCard = () => {
  const { theme } = useTheme();

  const handleUploadPrescription = async () => {
    const phoneNumber = '919876543210';
    const message = encodeURIComponent('Hello MedCart Pharmacy! 💊\nI would like to submit my prescription image for order fulfillment.');
    const whatsappUrl = `whatsapp://send?phone=${phoneNumber}&text=${message}`;
    const webWhatsappUrl = `https://api.whatsapp.com/send?phone=${phoneNumber}&text=${message}`;

    try {
      const supported = await Linking.canOpenURL(whatsappUrl);
      if (supported) {
        await Linking.openURL(whatsappUrl);
      } else {
        await Linking.openURL(webWhatsappUrl);
      }
    } catch (err) {
      Alert.alert(
        'Prescription Upload',
        'Redirecting to MedCart WhatsApp Desk to submit your prescription image...',
        [
          { 
            text: 'Open WhatsApp', 
            onPress: () => Linking.openURL(webWhatsappUrl) 
          },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
    }
  };

  return (
    <View style={styles.outerContainer}>
      <View style={[styles.card, { backgroundColor: '#DCFCE7', borderColor: '#BBF7D0' }]}>
        <View style={styles.contentRow}>
          <View style={styles.iconCircle}>
            <Ionicons name="document-text" size={24} color="#16A34A" />
          </View>

          <View style={styles.textContainer}>
            <Text style={styles.title}>Have a Doctor's Prescription?</Text>
            <Text style={styles.subtitle}>
              Tap below to send your prescription photo directly via WhatsApp!
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.ctaButton}
          onPress={handleUploadPrescription}
          activeOpacity={0.85}
        >
          <FontAwesome name="whatsapp" size={22} color="#FFFFFF" style={styles.waIcon} />
          <Text style={styles.ctaText}>Upload Prescription via WhatsApp</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    paddingHorizontal: 20,
    marginVertical: 14
  },
  card: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.5,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    gap: 12
  },
  iconCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 1
  },
  textContainer: {
    flex: 1
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: '#14532D',
    marginBottom: 2
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#15803D',
    lineHeight: 16
  },
  ctaButton: {
    backgroundColor: '#22C55E',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    elevation: 3,
    shadowColor: '#22C55E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8
  },
  waIcon: {
    marginRight: 8
  },
  ctaText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.2
  }
});
