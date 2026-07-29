import React from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

export const SearchBar = ({ value, onChangeText, onSubmit, onClear }) => {
  const { theme } = useTheme();

  return (
    <View style={styles.outerContainer}>
      <View style={[styles.inputBox, { backgroundColor: theme.inputBg }]}>
        <Ionicons name="search-outline" size={20} color={theme.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={[styles.input, { color: theme.textPrimary }]}
          placeholder="Search medicines..."
          placeholderTextColor={theme.textSecondary}
          value={value}
          onChangeText={onChangeText}
          onSubmitEditing={onSubmit}
          returnKeyType="search"
        />
        {value ? (
          <TouchableOpacity onPress={onClear} style={styles.clearBtn}>
            <Ionicons name="close-circle" size={18} color={theme.textSecondary} />
          </TouchableOpacity>
        ) : (
          <View style={styles.micBtn}>
            <Feather name="mic" size={16} color={theme.textSecondary} />
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    paddingHorizontal: 20,
    marginVertical: 10
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingHorizontal: 14,
    height: 52
  },
  searchIcon: {
    marginRight: 10
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500'
  },
  clearBtn: {
    padding: 4
  },
  micBtn: {
    padding: 4
  }
});
