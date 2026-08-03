import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { authApi } from '../../api';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, SHADOWS } from '../../constants';

export default function ResetPasswordScreen({ navigation, route }: any) {
  const { userId } = route.params || {};
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleReset = async () => {
    if (!otp.trim() || !password.trim()) {
      Alert.alert('Missing Info', 'Please enter your OTP and new password.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Mismatch', 'Passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      await authApi.resetPassword({ userId, otp, password });
      Alert.alert('Success 🎉', 'Password reset successfully. Please log in.');
      navigation.navigate('Login');
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Password reset failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.black} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Reset Password</Text>
        <Text style={styles.subtitle}>Enter the 6-digit OTP sent to your phone and your new password.</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>OTP CODE</Text>
          <TextInput
            style={styles.input}
            value={otp}
            onChangeText={setOtp}
            keyboardType="number-pad"
            maxLength={6}
            placeholder="123456"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>NEW PASSWORD</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="••••••••"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>CONFIRM NEW PASSWORD</Text>
          <TextInput
            style={styles.input}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            placeholder="••••••••"
          />
        </View>

        <TouchableOpacity style={styles.submitButton} onPress={handleReset} disabled={isLoading} activeOpacity={0.85}>
          {isLoading ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={styles.submitText}>Reset Password</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingTop: 60, paddingHorizontal: SPACING.xl },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.cardBorder },
  content: { padding: SPACING.xl, paddingTop: 30, gap: 16 },
  title: { fontSize: FONT_SIZES['3xl'], fontWeight: '800', color: COLORS.textPrimary },
  subtitle: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, lineHeight: 22 },
  inputGroup: { gap: 6 },
  label: { fontSize: 10, fontWeight: '800', color: COLORS.textMuted, letterSpacing: 1 },
  input: { backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.md, height: 52, paddingHorizontal: SPACING.base, borderWidth: 1, borderColor: COLORS.cardBorder, fontSize: FONT_SIZES.base, color: COLORS.textPrimary, fontWeight: '600' },
  submitButton: { backgroundColor: COLORS.primary, height: 54, borderRadius: BORDER_RADIUS.md, alignItems: 'center', justifyContent: 'center', marginTop: 12, ...SHADOWS.md },
  submitText: { color: COLORS.white, fontSize: FONT_SIZES.md, fontWeight: '800' },
});
