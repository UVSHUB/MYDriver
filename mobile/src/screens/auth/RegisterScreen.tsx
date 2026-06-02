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
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useDispatch, useSelector } from 'react-redux';
import { AuthStackParamList } from '../../types';
import { RootState, AppDispatch } from '../../store';
import { registerUser } from '../../store/slices/authSlice';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS } from '../../constants';

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
            <Text style={styles.eyeIcon}>{options.secureTextEntry ? '👁️' : '🙈'}</Text>
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
          <Text style={styles.backIcon}>←</Text>
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

        {/* Login link */}
        <View style={styles.loginRow}>
          <Text style={styles.loginText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginLink}>Sign In</Text>
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
  eyeIcon: {
    fontSize: 18,
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
    borderRadius: BORDER_RADIUS.lg,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
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
    color: COLORS.primary,
    fontSize: FONT_SIZES.base,
    fontWeight: '700',
  },
});
