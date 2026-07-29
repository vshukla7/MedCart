import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { loginUser, registerUser, forgotPasswordUser } from '../services/api';

export const LoginScreen = ({ onLoginSuccess }) => {
  const { theme } = useTheme();
  
  // Modes: 'login', 'register', 'forgot'
  const [mode, setMode] = useState('login');
  
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const formatPhoneNumber = (text) => {
    // Basic phone formatter to help users format like +91 99999 99999
    let cleaned = ('' + text).replace(/\D/g, '');
    if (cleaned.startsWith('91') && cleaned.length > 2) {
      cleaned = cleaned.substring(2);
    }
    if (cleaned.length === 0) return '';
    if (cleaned.length <= 5) return `+91 ${cleaned}`;
    return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5, 10)}`;
  };

  const handlePhoneChange = (text) => {
    // If user is clearing, allow it
    if (text.length < phone.length) {
      setPhone(text);
      return;
    }
    setPhone(formatPhoneNumber(text));
  };

  const handleAction = async () => {
    if (!phone) {
      Alert.alert('Error', 'Please enter your phone number.');
      return;
    }

    setLoading(true);

    try {
      if (mode === 'login') {
        if (!password) {
          Alert.alert('Error', 'Please enter your password.');
          setLoading(false);
          return;
        }
        const res = await loginUser(phone.trim(), password);
        if (res.success) {
          onLoginSuccess(res.user);
        } else {
          Alert.alert('Login Failed', res.message || 'Invalid credentials');
        }
      } else if (mode === 'register') {
        if (!name) {
          Alert.alert('Error', 'Please enter your name.');
          setLoading(false);
          return;
        }
        if (!password || password.length < 6) {
          Alert.alert('Error', 'Password must be at least 6 characters long.');
          setLoading(false);
          return;
        }
        const res = await registerUser(phone.trim(), password, name);
        if (res.success) {
          Alert.alert('Success', 'Registered successfully! Logging you in...');
          onLoginSuccess(res.user);
        } else {
          Alert.alert('Registration Failed', res.message || 'Could not register');
        }
      } else if (mode === 'forgot') {
        if (!newPassword || newPassword.length < 6) {
          Alert.alert('Error', 'New password must be at least 6 characters.');
          setLoading(false);
          return;
        }
        if (newPassword !== confirmPassword) {
          Alert.alert('Error', 'Passwords do not match.');
          setLoading(false);
          return;
        }
        const res = await forgotPasswordUser(phone.trim(), newPassword);
        if (res.success) {
          Alert.alert('Success', 'Password updated successfully! You can login now.');
          setMode('login');
          setPassword('');
          setNewPassword('');
          setConfirmPassword('');
        } else {
          Alert.alert('Failed', res.message || 'Could not update password');
        }
      }
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Something went wrong. Please check connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: theme.background }]} keyboardShouldPersistTaps="handled">
      <View style={styles.header}>
        <View style={styles.logoCircle}>
          <Feather name="plus-square" size={32} color="#FFFFFF" />
        </View>
        <Text style={[styles.title, { color: theme.textPrimary }]}>MedCart Pharmacy</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          {mode === 'login' && 'Log in with your phone and password'}
          {mode === 'register' && 'Create your account to start ordering'}
          {mode === 'forgot' && 'Reset your password using your phone number'}
        </Text>
      </View>

      <View style={styles.form}>
        {/* Name (Register Mode only) */}
        {mode === 'register' && (
          <View style={styles.inputWrapper}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Full Name</Text>
            <View style={[styles.inputBox, { backgroundColor: theme.inputBg, borderColor: theme.border }]}>
              <Feather name="user" size={18} color={theme.textSecondary} />
              <TextInput
                style={[styles.input, { color: theme.textPrimary }]}
                placeholder="John Doe"
                placeholderTextColor={theme.textSecondary}
                value={name}
                onChangeText={setName}
              />
            </View>
          </View>
        )}

        {/* Phone Number */}
        <View style={styles.inputWrapper}>
          <Text style={[styles.label, { color: theme.textSecondary }]}>Phone Number</Text>
          <View style={[styles.inputBox, { backgroundColor: theme.inputBg, borderColor: theme.border }]}>
            <Feather name="phone" size={18} color={theme.textSecondary} />
            <TextInput
              style={[styles.input, { color: theme.textPrimary }]}
              placeholder="+91 99999 99999"
              placeholderTextColor={theme.textSecondary}
              value={phone}
              onChangeText={handlePhoneChange}
              keyboardType="phone-pad"
            />
          </View>
        </View>

        {/* Password (Login and Register) */}
        {mode !== 'forgot' && (
          <View style={styles.inputWrapper}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Password</Text>
            <View style={[styles.inputBox, { backgroundColor: theme.inputBg, borderColor: theme.border }]}>
              <Feather name="lock" size={18} color={theme.textSecondary} />
              <TextInput
                style={[styles.input, { color: theme.textPrimary }]}
                placeholder="••••••"
                placeholderTextColor={theme.textSecondary}
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Feather name={showPassword ? 'eye-off' : 'eye'} size={18} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Forgot Password New Passwords */}
        {mode === 'forgot' && (
          <>
            <View style={styles.inputWrapper}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>New Password</Text>
              <View style={[styles.inputBox, { backgroundColor: theme.inputBg, borderColor: theme.border }]}>
                <Feather name="lock" size={18} color={theme.textSecondary} />
                <TextInput
                  style={[styles.input, { color: theme.textPrimary }]}
                  placeholder="••••••"
                  placeholderTextColor={theme.textSecondary}
                  secureTextEntry={!showPassword}
                  value={newPassword}
                  onChangeText={setNewPassword}
                />
              </View>
            </View>

            <View style={styles.inputWrapper}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>Confirm New Password</Text>
              <View style={[styles.inputBox, { backgroundColor: theme.inputBg, borderColor: theme.border }]}>
                <Feather name="lock" size={18} color={theme.textSecondary} />
                <TextInput
                  style={[styles.input, { color: theme.textPrimary }]}
                  placeholder="••••••"
                  placeholderTextColor={theme.textSecondary}
                  secureTextEntry={!showPassword}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
              </View>
            </View>
          </>
        )}

        {/* Forgot Password Link in Login Mode */}
        {mode === 'login' && (
          <TouchableOpacity style={styles.forgotBtn} onPress={() => setMode('forgot')}>
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>
        )}

        {/* Submit Button */}
        <TouchableOpacity style={styles.submitBtn} onPress={handleAction} disabled={loading} activeOpacity={0.85}>
          {loading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.submitText}>
              {mode === 'login' && 'Log In'}
              {mode === 'register' && 'Sign Up'}
              {mode === 'forgot' && 'Reset Password'}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Switch Modes */}
      <View style={styles.switchModeContainer}>
        {mode === 'login' && (
          <Text style={{ color: theme.textSecondary }}>
            Don't have an account?{' '}
            <Text style={styles.linkText} onPress={() => { setMode('register'); setPassword(''); }}>
              Sign Up
            </Text>
          </Text>
        )}
        {mode === 'register' && (
          <Text style={{ color: theme.textSecondary }}>
            Already have an account?{' '}
            <Text style={styles.linkText} onPress={() => { setMode('login'); setPassword(''); }}>
              Log In
            </Text>
          </Text>
        )}
        {mode === 'forgot' && (
          <Text style={styles.linkText} onPress={() => setMode('login')}>
            Back to Log In
          </Text>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40
  },
  header: {
    alignItems: 'center',
    marginBottom: 36
  },
  logoCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#22C55E',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#22C55E',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    textAlign: 'center'
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 6,
    paddingHorizontal: 20
  },
  form: {
    gap: 16
  },
  inputWrapper: {
    gap: 6
  },
  label: {
    fontSize: 13,
    fontWeight: '800'
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 16,
    gap: 10
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 14,
    fontWeight: '600'
  },
  forgotBtn: {
    alignSelf: 'flex-end',
    marginTop: -4
  },
  forgotText: {
    color: '#22C55E',
    fontSize: 13,
    fontWeight: '800'
  },
  submitBtn: {
    backgroundColor: '#22C55E',
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowColor: '#22C55E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4
  },
  submitText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800'
  },
  switchModeContainer: {
    alignItems: 'center',
    marginTop: 24
  },
  linkText: {
    color: '#22C55E',
    fontWeight: '800'
  }
});
