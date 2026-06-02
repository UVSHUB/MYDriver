import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useDispatch, useSelector } from 'react-redux';
import { AuthStackParamList } from '../../types';
import { RootState, AppDispatch } from '../../store';
import { loginUser } from '../../store/slices/authSlice';
import { authApi } from '../../api/auth.api';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS } from '../../constants';

type Props = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Login'>;
};

export default function LoginScreen({ navigation }: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading } = useSelector((state: RootState) => state.auth);

  const [mode, setMode] = useState<'email' | 'phone'>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isPhoneLoading, setIsPhoneLoading] = useState(false);

  const handleEmailLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Error', 'Please enter your email and password.');
      return;
    }

    const result = await dispatch(loginUser({ email: email.trim().toLowerCase(), password }));

    if (loginUser.rejected.match(result)) {
      const payload = result.payload as any;
      if (typeof payload === 'object' && payload?.requiresVerification) {
        navigation.navigate('OTPVerification', {
          userId: payload.userId,
          phone: payload.phone || '',
          mode: 'login',
        });
      } else {
        Alert.alert('Login Failed', result.payload as string);
      }
    }
  };

  const handlePhoneLogin = async () => {
    if (!phone.trim()) {
      Alert.alert('Error', 'Please enter your phone number.');
      return;
    }
    setIsPhoneLoading(true);
    try {
      const data = await authApi.loginWithPhone(phone.trim());
      navigation.navigate('OTPVerification', {
        userId: data.userId,
        phone: phone.trim(),
        mode: 'login',
      });
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to send OTP.');
    } finally {
      setIsPhoneLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Header */}
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Sign in to continue your journey</Text>

        {/* Mode Toggle */}
        <View style={styles.modeToggle}>
          {(['email', 'phone'] as const).map((m) => (
            <TouchableOpacity
              key={m}
              style={[styles.modeTab, mode === m && styles.modeTabActive]}
              onPress={() => setMode(m)}
            >
              <Text style={[styles.modeTabText, mode === m && styles.modeTabTextActive]}>
                {m === 'email' ? '📧 Email' : '📱 Phone'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {mode === 'email' ? (
          <View style={styles.form}>
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Email Address</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="john@example.com"
                placeholderTextColor={COLORS.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.passwordWrapper}>
                <TextInput
                  style={styles.passwordInput}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="••••••••"
                  placeholderTextColor={COLORS.textMuted}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
                  <Text>{showPassword ? '🙈' : '👁️'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              onPress={() => navigation.navigate('ForgotPassword')}
              style={styles.forgotContainer}
            >
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleEmailLogin}
              disabled={isLoading}
              activeOpacity={0.85}
            >
              {isLoading ? <ActivityIndicator color={COLORS.white} /> : <Text style={styles.buttonText}>Sign In</Text>}
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.form}>
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Phone Number</Text>
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                placeholder="+94 77 123 4567"
                placeholderTextColor={COLORS.textMuted}
                keyboardType="phone-pad"
              />
            </View>

            <TouchableOpacity
              style={[styles.button, isPhoneLoading && styles.buttonDisabled]}
              onPress={handlePhoneLogin}
              disabled={isPhoneLoading}
              activeOpacity={0.85}
            >
              {isPhoneLoading ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <Text style={styles.buttonText}>Send OTP</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Register link */}
        <View style={styles.registerRow}>
          <Text style={styles.registerText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.registerLink}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    paddingHorizontal: SPACING.xl,
    paddingTop: 60,
    paddingBottom: 40,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  backIcon: {
    fontSize: 20,
    color: COLORS.white,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: FONT_SIZES.base,
    color: COLORS.textSecondary,
    marginTop: 6,
    marginBottom: 28,
  },
  modeToggle: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: 4,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  modeTab: {
    flex: 1,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BORDER_RADIUS.sm,
  },
  modeTabActive: {
    backgroundColor: COLORS.primary,
  },
  modeTabText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },
  modeTabTextActive: {
    color: COLORS.white,
  },
  form: {
    gap: 16,
  },
  fieldContainer: {
    gap: 6,
  },
  label: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  input: {
    height: 52,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    paddingHorizontal: SPACING.base,
    color: COLORS.textPrimary,
    fontSize: FONT_SIZES.base,
  },
  passwordWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    paddingHorizontal: SPACING.base,
  },
  passwordInput: {
    flex: 1,
    height: 52,
    color: COLORS.textPrimary,
    fontSize: FONT_SIZES.base,
  },
  eyeButton: {
    padding: 4,
  },
  forgotContainer: {
    alignSelf: 'flex-end',
    marginTop: -4,
  },
  forgotText: {
    color: COLORS.primary,
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.lg,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
    marginTop: 4,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
  },
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 28,
  },
  registerText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.base,
  },
  registerLink: {
    color: COLORS.primary,
    fontSize: FONT_SIZES.base,
    fontWeight: '700',
  },
});
