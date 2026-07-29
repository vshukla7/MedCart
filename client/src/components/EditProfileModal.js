import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { updateUserProfile } from '../services/api';

export const EditProfileModal = ({ visible, onClose, currentUser, onUpdateUser }) => {
  const { theme } = useTheme();
  const [name, setName] = useState(currentUser?.name || '');
  const [address, setAddress] = useState(currentUser?.address || '');
  const [lat, setLat] = useState(currentUser?.latitude?.toString() || '19.0760');
  const [lng, setLng] = useState(currentUser?.longitude?.toString() || '72.8777');
  const [loading, setLoading] = useState(false);

  // Sync state if currentUser changes
  React.useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || '');
      setAddress(currentUser.address || '');
      setLat(currentUser.latitude?.toString() || '19.0760');
      setLng(currentUser.longitude?.toString() || '72.8777');
    }
  }, [currentUser, visible]);

  // Simulate Map Click Pin Movement
  const handleMapPinPress = () => {
    // Generate slight random offset around Mumbai to simulate map pin select
    const randomLat = (19.05 + Math.random() * 0.05).toFixed(4);
    const randomLng = (72.85 + Math.random() * 0.05).toFixed(4);
    setLat(randomLat);
    setLng(randomLng);
    Alert.alert('Pin Dropped', `Coordinates updated to Lat: ${randomLat}, Lng: ${randomLng}`);
  };

  const handleSave = async () => {
    if (!name.trim() || !address.trim()) {
      Alert.alert('Error', 'Name and Address cannot be empty');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: name.trim(),
        address: address.trim(),
        latitude: parseFloat(lat) || 19.0760,
        longitude: parseFloat(lng) || 72.8777
      };
      const res = await updateUserProfile(currentUser._id, payload);
      if (res.success) {
        // Update user state globally
        onUpdateUser({
          ...currentUser,
          ...payload
        });
        Alert.alert('Success', 'Profile details updated successfully');
        onClose();
      } else {
        Alert.alert('Error', res.message || 'Could not update profile');
      }
    } catch (e) {
      Alert.alert('Error', 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.modalCard, { backgroundColor: theme.card }]}>
          
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.textPrimary }]}>Edit Delivery Details</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close-circle" size={24} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>

          {loading && <ActivityIndicator size="large" color="#22C55E" style={{ marginVertical: 10 }} />}

          {/* Form */}
          <View style={styles.form}>
            <View style={styles.inputBox}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>Full Name</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.inputBg, color: theme.textPrimary, borderColor: theme.border }]}
                value={name}
                onChangeText={setName}
                placeholder="Enter your name"
                placeholderTextColor={theme.textSecondary}
              />
            </View>

            <View style={styles.inputBox}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>Delivery Address</Text>
              <TextInput
                style={[styles.textArea, { backgroundColor: theme.inputBg, color: theme.textPrimary, borderColor: theme.border }]}
                value={address}
                onChangeText={setAddress}
                placeholder="Enter complete shipping address"
                placeholderTextColor={theme.textSecondary}
                multiline
                numberOfLines={3}
              />
            </View>

            {/* Premium Custom Map Simulator Component */}
            <Text style={[styles.label, { color: theme.textSecondary }]}>Locate Delivery Coordinates on Map</Text>
            <TouchableOpacity 
              style={[styles.mapContainer, { borderColor: theme.border }]} 
              onPress={handleMapPinPress}
              activeOpacity={0.9}
            >
              {/* Map background grid */}
              <View style={styles.mapGrid}>
                {/* Simulated streets */}
                <View style={styles.simStreet1} />
                <View style={styles.simStreet2} />
                <View style={styles.simStreet3} />
                {/* Map Pins */}
                <View style={styles.pinCircle}>
                  <Ionicons name="location" size={24} color="#EF4444" />
                </View>
                {/* Instruction banner */}
                <View style={styles.mapInstruction}>
                  <Text style={styles.instructionText}>Tap inside map to reposition pin 📍</Text>
                </View>
              </View>
            </TouchableOpacity>

            <View style={styles.coordRow}>
              <View style={styles.coordCol}>
                <Text style={[styles.label, { color: theme.textSecondary }]}>Latitude</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.inputBg, color: theme.textPrimary, borderColor: theme.border }]}
                  value={lat}
                  onChangeText={setLat}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.coordCol}>
                <Text style={[styles.label, { color: theme.textSecondary }]}>Longitude</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.inputBg, color: theme.textPrimary, borderColor: theme.border }]}
                  value={lng}
                  onChangeText={setLng}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.8}>
              <Feather name="check" size={16} color="#FFFFFF" />
              <Text style={styles.saveBtnText}>Save Address Details</Text>
            </TouchableOpacity>
          </View>
        </View>
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
    padding: 20,
    minHeight: 520,
    gap: 16
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  title: {
    fontSize: 18,
    fontWeight: '800'
  },
  closeBtn: {
    padding: 4
  },
  form: {
    gap: 12
  },
  inputBox: {
    gap: 6
  },
  label: {
    fontSize: 11,
    fontWeight: '800'
  },
  input: {
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 13,
    fontWeight: '600'
  },
  textArea: {
    height: 68,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    fontWeight: '600',
    textAlignVertical: 'top'
  },
  mapContainer: {
    height: 120,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    backgroundColor: '#E2F0D9', // Greenish map base
    position: 'relative'
  },
  mapGrid: {
    flex: 1,
    position: 'relative'
  },
  simStreet1: {
    position: 'absolute',
    left: '30%',
    top: 0,
    bottom: 0,
    width: 20,
    backgroundColor: '#FFFFFF',
    opacity: 0.8
  },
  simStreet2: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '40%',
    height: 20,
    backgroundColor: '#FFFFFF',
    opacity: 0.8
  },
  simStreet3: {
    position: 'absolute',
    left: '65%',
    top: 0,
    bottom: 0,
    width: 16,
    backgroundColor: '#FFFFFF',
    opacity: 0.8
  },
  pinCircle: {
    position: 'absolute',
    left: '48%',
    top: '32%',
    alignItems: 'center',
    justifyContent: 'center'
  },
  mapInstruction: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6
  },
  instructionText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800'
  },
  coordRow: {
    flexDirection: 'row',
    gap: 12
  },
  coordCol: {
    flex: 1,
    gap: 6
  },
  saveBtn: {
    backgroundColor: '#22C55E',
    height: 44,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 10
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800'
  }
});
