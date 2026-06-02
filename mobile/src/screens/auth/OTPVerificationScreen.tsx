import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { AuthStackParamList } from '../../types';
import { RootState, AppDispatch } from '../../store';
import { verifyOTP } from '../../store/slices/authSlice';
import { authApi } from '../../api/auth.api';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS } from '../../constants';

type Props = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'OTPVerification'>;
  route: RouteProp<AuthStackParamList, 'OTPVerification'>;
};

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 60;

export default function OTPVerificationScreen({ navigation, route }: Props) {
  const { userId, phone, mode } = route.params;
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading } = useSelector((state: RootState) => state.auth);

  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [countdown, setCountdown] = useState(RESEND_COOLDOWN);
  const [canResend, setCanResend] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const inputs = useRef<(TextInput | null)[]>([]);
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          setCanResend(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  };

  const handleChange = (text: string, index: number) => {
    if (text.length > 1) {
      // Handle paste
      const pastedOtp = text.slice(0, OTP_LENGTH).split('');
      const newOtp = [...otp];
      pastedOtp.forEach((char, i) => {
        if (i < OTP_LENGTH) newOtp[i] = char;
      });
      setOtp(newOtp);
      inputs.current[Math.min(pastedOtp.length - 1, OTP_LENGTH - 1)]?.focus();
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);
    if (text && index < OTP_LENGTH - 1) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      const newOtp = [...otp];
      newOtp[index - 1] = '';
      setOtp(newOtp);
      inputs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpString = otp.join('');
    if (otpString.length < OTP_LENGTH) {
      shake();
      return;
    }

    const result = await dispatch(verifyOTP({ userId, otp: otpString }));

    if (verifyOTP.fulfilled.match(result)) {
      // Navigation handled by root navigator
    } else {
      shake();
      setOtp(Array(OTP_LENGTH).fill(''));
      inputs.current[0]?.focus();
      Alert.alert('Invalid OTP', result.payload as string || 'Please check the code and try again.');
    }
  };

  const handleResend = async () => {
    if (!canResend || isResending) return;
    setIsResending(true);
    try {
      await authApi.resendOTP(userId);
      setCountdown(RESEND_COOLDOWN);
      setCanResend(false);
      setOtp(Array(OTP_LENGTH).fill(''));
      Alert.alert('OTP Sent', 'A new verification code has been sent to your phone.');

      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) { setCanResend(true); clearInterval(timer); return 0; }
          return prev - 1;
        });
      }, 1000);
    } catch {
      Alert.alert('Error', 'Failed to resend OTP. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={20} color={COLORS.black} />
      </TouchableOpacity>

      {/* Security Vector Icon instead of Emoji */}
      <View style={styles.iconContainer}>
        <Ionicons name="shield-checkmark" size={32} color={COLORS.black} />
      </View>

      <Text style={styles.title}>Verify Phone</Text>
      <Text style={styles.subtitle}>
        Enter the 6-digit code sent to{'\n'}
        <Text style={styles.phone}>{phone}</Text>
      </Text>

      {/* OTP Input */}
      <Animated.View
        style={[styles.otpContainer, { transform: [{ translateX: shakeAnim }] }]}
      >
        {Array(OTP_LENGTH).fill(0).map((_, i) => (
          <TextInput
            key={i}
            ref={(ref) => { inputs.current[i] = ref; }}
            style={[
              styles.otpInput,
              otp[i] ? styles.otpInputFilled : null,
            ]}
            value={otp[i]}
            onChangeText={(text) => handleChange(text, i)}
            onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, i)}
            keyboardType="number-pad"
            maxLength={OTP_LENGTH}
            textAlign="center"
            selectionColor={COLORS.primary}
            placeholderTextColor={COLORS.textMuted}
          />
        ))}
      </Animated.View>

      {/* Verify Button */}
      <TouchableOpacity
        style={[styles.button, isLoading && styles.buttonDisabled]}
        onPress={handleVerify}
        disabled={isLoading}
        activeOpacity={0.85}
      >
        {isLoading ? (
          <ActivityIndicator color={COLORS.white} />
        ) : (
          <Text style={styles.buttonText}>Verify Code</Text>
        )}
      </TouchableOpacity>

      {/* Resend */}
      <View style={styles.resendContainer}>
        {canResend ? (
          <TouchableOpacity onPress={handleResend} disabled={isResending}>
            <Text style={styles.resendText}>
              {isResending ? 'Sending...' : 'Resend Code'}
            </Text>
          </TouchableOpacity>
        ) : (
          <Text style={styles.countdown}>
            Resend in <Text style={styles.countdownNumber}>{countdown}s</Text>
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.xl,
    paddingTop: 60,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 24,
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
    marginTop: 8,
    marginBottom: 40,
    lineHeight: 22,
  },
  phone: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 36,
  },
  otpInput: {
    width: 48,
    height: 56,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1.5,
    borderColor: COLORS.cardBorder,
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.black,
    textAlign: 'center',
  },
  otpInputFilled: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.sm,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.md,
    fontWeight: '800',
  },
  resendContainer: {
    alignItems: 'center',
    marginTop: 24,
  },
  resendText: {
    color: COLORS.primary,
    fontSize: FONT_SIZES.base,
    fontWeight: '700',
  },
  countdown: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.base,
  },
  countdownNumber: {
    color: COLORS.primary,
    fontWeight: '700',
  },
});
