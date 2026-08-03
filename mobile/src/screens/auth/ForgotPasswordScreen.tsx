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

export default function ForgotPasswordScreen({ navigation }: any) {
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendOTP = async () => {
    if (!phone.trim()) {
      Alert.alert('Required', 'Please enter your registered phone number.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await authApi.forgotPassword(phone);
      Alert.alert('OTP Sent 📲', 'We sent a verification code to your phone.');
      navigation.navigate('ResetPassword', { userId: res.userId, phone });
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Could not process request.');
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
        <View style={styles.iconCircle}>
          <Ionicons name="key-outline" size={32} color={COLORS.black} />
        </View>
        <Text style={styles.title}>Forgot Password?</Text>
        <Text style={styles.subtitle}>Enter your phone number below to receive a password reset verification code.</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>PHONE NUMBER</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            placeholder="+94 77 123 4567"
          />
        </View>

        <TouchableOpacity style={styles.submitButton} onPress={handleSendOTP} disabled={isLoading} activeOpacity={0.85}>
          {isLoading ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={styles.submitText}>Send Reset Code →</Text>
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
  content: { padding: SPACING.xl, paddingTop: 40, gap: 16 },
  iconCircle: { width: 64, height: 64, borderRadius: 32, backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.cardBorder, marginBottom: 8 },
  title: { fontSize: FONT_SIZES['3xl'], fontWeight: '800', color: COLORS.textPrimary },
  subtitle: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, lineHeight: 22 },
  inputGroup: { gap: 6, marginTop: 12 },
  label: { fontSize: 10, fontWeight: '800', color: COLORS.textMuted, letterSpacing: 1 },
  input: { backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.md, height: 52, paddingHorizontal: SPACING.base, borderWidth: 1, borderColor: COLORS.cardBorder, fontSize: FONT_SIZES.base, color: COLORS.textPrimary, fontWeight: '600' },
  submitButton: { backgroundColor: COLORS.primary, height: 54, borderRadius: BORDER_RADIUS.md, alignItems: 'center', justifyContent: 'center', marginTop: 12, ...SHADOWS.md },
  submitText: { color: COLORS.white, fontSize: FONT_SIZES.md, fontWeight: '800' },
});
