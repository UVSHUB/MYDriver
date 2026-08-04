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
  Modal,
  Image,
  Dimensions,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { AuthStackParamList } from '../../types';
import { RootState, AppDispatch } from '../../store';
import { loginUser, loginWithGoogle } from '../../store/slices/authSlice';
import { authApi } from '../../api/auth.api';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS } from '../../constants';

const { height } = Dimensions.get('window');

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

  // Google Sign-In Sheet Simulation State
  const [showGoogleSheet, setShowGoogleSheet] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

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

  const handleGoogleAccountSelect = async (account: { email: string; fullName: string; avatar: string }) => {
    setIsGoogleLoading(true);
    try {
      const result = await dispatch(loginWithGoogle(account));
      if (loginWithGoogle.fulfilled.match(result)) {
        setShowGoogleSheet(false);
      } else {
        Alert.alert('Google Sign-In Failed', result.payload as string || 'An error occurred.');
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to authenticate with Google.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Header */}
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={20} color={COLORS.black} />
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
              <View style={styles.modeTabInner}>
                <Ionicons
                  name={m === 'email' ? 'mail-outline' : 'phone-portrait-outline'}
                  size={15}
                  color={mode === m ? COLORS.white : COLORS.textSecondary}
                  style={{ marginRight: 6 }}
                />
                <Text style={[styles.modeTabText, mode === m && styles.modeTabTextActive]}>
                  {m === 'email' ? 'Email' : 'Phone'}
                </Text>
              </View>
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
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={COLORS.textSecondary}
                  />
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

        {/* Stark Or Divider */}
        <View style={styles.dividerContainer}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Google Sign In Button */}
        <TouchableOpacity
          style={styles.googleButton}
          onPress={() => setShowGoogleSheet(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="logo-google" size={18} color={COLORS.black} style={{ marginRight: 10 }} />
          <Text style={styles.googleButtonText}>Continue with Google</Text>
        </TouchableOpacity>

        {/* Register link */}
        <View style={styles.registerRow}>
          <Text style={styles.registerText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.registerLink}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* ─── Premium Google Sign-In Bottom Sheet Modal ─────────── */}
      <Modal
        visible={showGoogleSheet}
        animationType="slide"
        transparent={true}
        onRequestClose={() => !isGoogleLoading && setShowGoogleSheet(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalDismissArea}
            activeOpacity={1}
            onPress={() => !isGoogleLoading && setShowGoogleSheet(false)}
          />
          <View style={styles.modalContent}>
            {/* Sheet Handle */}
            <View style={styles.modalHandle} />

            <View style={styles.googleHeader}>
              <Ionicons name="logo-google" size={24} color="#EA4335" style={{ marginBottom: 8 }} />
              <Text style={styles.googleTitle}>Sign in with Google</Text>
              <Text style={styles.googleSubtitle}>Choose an account to continue to Driver On Demand</Text>
            </View>

            {isGoogleLoading ? (
              <View style={styles.googleLoadingContainer}>
                <ActivityIndicator size="large" color={COLORS.black} />
                <Text style={styles.googleLoadingText}>Connecting to Google Services...</Text>
              </View>
            ) : (
              <View style={styles.googleAccountsContainer}>
                {/* Account 1 */}
                <TouchableOpacity
                  style={styles.googleAccountRow}
                  onPress={() =>
                    handleGoogleAccountSelect({
                      email: 'john.doe@gmail.com',
                      fullName: 'John Doe',
                      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
                    })
                  }
                >
                  <Image
                    source={{ uri: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200' }}
                    style={styles.googleAvatar}
                  />
                  <View style={styles.googleAccountInfo}>
                    <Text style={styles.googleAccountName}>John Doe</Text>
                    <Text style={styles.googleAccountEmail}>john.doe@gmail.com</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
                </TouchableOpacity>

                {/* Account 2 */}
                <TouchableOpacity
                  style={styles.googleAccountRow}
                  onPress={() =>
                    handleGoogleAccountSelect({
                      email: 'sarah.c@gmail.com',
                      fullName: 'Sarah Connor',
                      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
                    })
                  }
                >
                  <Image
                    source={{ uri: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200' }}
                    style={styles.googleAvatar}
                  />
                  <View style={styles.googleAccountInfo}>
                    <Text style={styles.googleAccountName}>Sarah Connor</Text>
                    <Text style={styles.googleAccountEmail}>sarah.c@gmail.com</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
                </TouchableOpacity>

                {/* Use another account option */}
                <TouchableOpacity
                  style={styles.googleAccountRow}
                  onPress={() =>
                    handleGoogleAccountSelect({
                      email: 'guest.driver@gmail.com',
                      fullName: 'Guest Member',
                      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200',
                    })
                  }
                >
                  <View style={[styles.googleAvatar, styles.googleAvatarIcon]}>
                    <Ionicons name="person-add-outline" size={18} color={COLORS.black} />
                  </View>
                  <View style={styles.googleAccountInfo}>
                    <Text style={[styles.googleAccountName, { fontWeight: '700' }]}>Use another account</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.googleFooter}>
              <Text style={styles.googleFooterText}>
                To continue, Google will share your name, email address, language preference, and profile picture with Driver On Demand.
              </Text>
            </View>
          </View>
        </View>
      </Modal>
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
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.black,
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
  modeTabInner: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modeTabActive: {
    backgroundColor: COLORS.primary,
  },
  modeTabText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
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
    backgroundColor: COLORS.surfaceLight,
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
    backgroundColor: COLORS.surfaceLight,
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
    color: COLORS.black,
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.sm,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.md,
    fontWeight: '800',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.cardBorder,
  },
  dividerText: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZES.sm,
    paddingHorizontal: SPACING.md,
    fontWeight: '600',
  },
  googleButton: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.sm,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.cardBorder,
  },
  googleButtonText: {
    color: COLORS.black,
    fontSize: FONT_SIZES.base,
    fontWeight: '800',
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
    color: COLORS.black,
    fontSize: FONT_SIZES.base,
    fontWeight: '700',
  },

  // ─── Modal Sheet Styles ──────────────────────────────────────────
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },
  modalDismissArea: {
    flex: 1,
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: SPACING.xl,
    paddingBottom: 40,
    maxHeight: height * 0.7,
  },
  modalHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.cardBorder,
    alignSelf: 'center',
    marginVertical: 12,
  },
  googleHeader: {
    alignItems: 'center',
    marginVertical: 16,
  },
  googleTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.black,
  },
  googleSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  googleLoadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    gap: 16,
  },
  googleLoadingText: {
    fontSize: FONT_SIZES.base,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  googleAccountsContainer: {
    marginTop: 12,
    gap: 12,
  },
  googleAccountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  googleAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
  },
  googleAvatarIcon: {
    backgroundColor: COLORS.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleAccountInfo: {
    flex: 1,
    marginLeft: 12,
  },
  googleAccountName: {
    fontSize: FONT_SIZES.base,
    fontWeight: '800',
    color: COLORS.black,
  },
  googleAccountEmail: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  googleFooter: {
    marginTop: 24,
    paddingHorizontal: 8,
  },
  googleFooterText: {
    fontSize: 10,
    color: COLORS.textMuted,
    lineHeight: 15,
    textAlign: 'center',
  },
});
