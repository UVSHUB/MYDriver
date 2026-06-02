import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Modal,
  Image,
  Dimensions,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { AuthStackParamList } from '../../types';
import { RootState, AppDispatch } from '../../store';
import { registerUser, loginWithGoogle } from '../../store/slices/authSlice';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS } from '../../constants';

const { height } = Dimensions.get('window');

type Props = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Register'>;
};

interface FormData {
  fullName: string;
  phone: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  fullName?: string;
  phone?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

const getPasswordStrength = (password: string): { strength: number; label: string; color: string } => {
  let strength = 0;
  if (password.length >= 8) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^A-Za-z0-9]/.test(password)) strength++;

  const levels = [
    { label: 'Very Weak', color: COLORS.error },
    { label: 'Weak', color: '#F97316' },
    { label: 'Fair', color: COLORS.warning },
    { label: 'Good', color: '#84CC16' },
    { label: 'Strong', color: COLORS.success },
  ];
  return { strength, ...levels[strength] };
};

export default function RegisterScreen({ navigation }: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading } = useSelector((state: RootState) => state.auth);

  const [form, setForm] = useState<FormData>({
    fullName: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Google Sign-In Sheet States
  const [showGoogleSheet, setShowGoogleSheet] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!form.fullName.trim() || form.fullName.trim().length < 2) {
      newErrors.fullName = 'Please enter your full name (min 2 characters)';
    }
    if (!form.phone.trim() || !/^\+?[0-9]{7,15}$/.test(form.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Enter a valid phone number (e.g. +94771234567)';
    }
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = 'Enter a valid email address';
    }
    if (!form.password || form.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;

    const result = await dispatch(registerUser({
      fullName: form.fullName.trim(),
      phone: form.phone.trim(),
      email: form.email.trim().toLowerCase(),
      password: form.password,
    }));

    if (registerUser.fulfilled.match(result)) {
      navigation.navigate('OTPVerification', {
        userId: result.payload.userId,
        phone: form.phone.trim(),
        mode: 'register',
      });
    } else {
      Alert.alert('Registration Failed', result.payload as string);
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

  const passwordStrength = getPasswordStrength(form.password);

  const renderInput = (
    label: string,
    key: keyof FormData,
    options: {
      placeholder?: string;
      secureTextEntry?: boolean;
      keyboardType?: any;
      onToggle?: () => void;
      showToggle?: boolean;
    } = {}
  ) => (
    <View style={styles.fieldContainer}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputWrapper, errors[key] ? styles.inputError : null]}>
        <TextInput
          style={styles.input}
          value={form[key]}
          onChangeText={(text) => {
            setForm(prev => ({ ...prev, [key]: text }));
            if (errors[key]) setErrors(prev => ({ ...prev, [key]: undefined }));
          }}
          placeholder={options.placeholder || label}
          placeholderTextColor={COLORS.textMuted}
          secureTextEntry={options.secureTextEntry}
          keyboardType={options.keyboardType || 'default'}
          autoCapitalize={key === 'email' ? 'none' : key === 'fullName' ? 'words' : 'none'}
        />
        {options.showToggle && (
          <TouchableOpacity onPress={options.onToggle} style={styles.eyeButton}>
            <Ionicons
              name={options.secureTextEntry ? 'eye-outline' : 'eye-off-outline'}
              size={20}
              color={COLORS.textSecondary}
            />
          </TouchableOpacity>
        )}
      </View>
      {errors[key] && <Text style={styles.errorText}>{errors[key]}</Text>}

      {/* Password strength indicator */}
      {key === 'password' && form.password.length > 0 && (
        <View style={styles.strengthContainer}>
          <View style={styles.strengthBars}>
            {[0, 1, 2, 3].map((i) => (
              <View
                key={i}
                style={[
                  styles.strengthBar,
                  { backgroundColor: i < passwordStrength.strength ? passwordStrength.color : COLORS.surfaceLight },
                ]}
              />
            ))}
          </View>
          <Text style={[styles.strengthLabel, { color: passwordStrength.color }]}>
            {passwordStrength.label}
          </Text>
        </View>
      )}
    </View>
  );

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={20} color={COLORS.black} />
        </TouchableOpacity>

        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Join thousands of happy customers</Text>

        {/* Form */}
        <View style={styles.form}>
          {renderInput('Full Name', 'fullName', { placeholder: 'John Doe' })}
          {renderInput('Phone Number', 'phone', { placeholder: '+94 77 123 4567', keyboardType: 'phone-pad' })}
          {renderInput('Email Address', 'email', { placeholder: 'john@example.com', keyboardType: 'email-address' })}
          {renderInput('Password', 'password', {
            placeholder: '••••••••',
            secureTextEntry: !showPassword,
            showToggle: true,
            onToggle: () => setShowPassword(!showPassword),
          })}
          {renderInput('Confirm Password', 'confirmPassword', {
            placeholder: '••••••••',
            secureTextEntry: !showConfirm,
            showToggle: true,
            onToggle: () => setShowConfirm(!showConfirm),
          })}
        </View>

        {/* Submit */}
        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleRegister}
          disabled={isLoading}
          activeOpacity={0.85}
        >
          {isLoading ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={styles.buttonText}>Create Account</Text>
          )}
        </TouchableOpacity>

        {/* Or Divider */}
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

        {/* Login link */}
        <View style={styles.loginRow}>
          <Text style={styles.loginText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginLink}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* ─── Premium Google Sign-In Bottom Sheet Modal ─────────── */}
      <Modal
        visible={showGoogleSheet}
        transparent={true}
        animationType="slide"
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
  scrollContent: {
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
    letterSpacing: 0.3,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    paddingHorizontal: SPACING.base,
  },
  inputError: {
    borderColor: COLORS.error,
  },
  input: {
    flex: 1,
    height: 52,
    color: COLORS.textPrimary,
    fontSize: FONT_SIZES.base,
  },
  eyeButton: {
    padding: 4,
  },
  errorText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.error,
    marginTop: 2,
  },
  strengthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  strengthBars: {
    flexDirection: 'row',
    gap: 4,
    flex: 1,
  },
  strengthBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  strengthLabel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    minWidth: 70,
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.sm,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
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
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  loginText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.base,
  },
  loginLink: {
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
