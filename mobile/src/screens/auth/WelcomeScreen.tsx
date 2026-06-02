import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
  StatusBar,
  ImageBackground,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../types';
import { COLORS, BORDER_RADIUS, FONT_SIZES, SPACING } from '../../constants';

const { width, height } = Dimensions.get('window');

type Props = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Welcome'>;
};

export default function WelcomeScreen({ navigation }: Props) {
  const loginPressAnim = useRef(new Animated.Value(1)).current;
  const registerPressAnim = useRef(new Animated.Value(1)).current;

  const handlePress = (anim: Animated.Value, callback: () => void) => {
    Animated.sequence([
      Animated.timing(anim, { toValue: 0.96, duration: 100, useNativeDriver: true }),
      Animated.timing(anim, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start(callback);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      {/* Decorative background */}
      <View style={styles.bgCircle1} />
      <View style={styles.bgCircle2} />
      <View style={styles.bgCircle3} />

      {/* Header illustration area */}
      <View style={styles.illustrationContainer}>
        <View style={styles.cardsRow}>
          {[
            { emoji: '🏠', label: 'Drive Me Home', color: COLORS.driveHome },
            { emoji: '🚗', label: 'Hire Driver', color: COLORS.hireDriver },
            { emoji: '✈️', label: 'Airport', color: COLORS.airport },
          ].map((item, i) => (
            <View key={i} style={[styles.miniCard, { backgroundColor: item.color }]}>
              <Text style={styles.miniCardEmoji}>{item.emoji}</Text>
              <Text style={styles.miniCardLabel}>{item.label}</Text>
            </View>
          ))}
        </View>
        <View style={styles.mapMock}>
          <View style={styles.mapPin} />
          <View style={[styles.mapRoad, { width: 120, top: '50%' }]} />
          <View style={[styles.mapRoad, { width: 80, top: '35%', left: '40%', transform: [{ rotate: '45deg' }] }]} />
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title}>Your Personal{'\n'}Driver Awaits</Text>
        <Text style={styles.subtitle}>
          Safe, reliable, and professional drivers at your fingertips. Anytime, anywhere.
        </Text>

        {/* Feature badges */}
        <View style={styles.badges}>
          {['⚡ Instant Match', '🛡️ Safe & Secure', '⭐ Top Drivers'].map((badge, i) => (
            <View key={i} style={styles.badge}>
              <Text style={styles.badgeText}>{badge}</Text>
            </View>
          ))}
        </View>

        {/* Buttons */}
        <View style={styles.buttons}>
          <Animated.View style={{ transform: [{ scale: registerPressAnim }] }}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => handlePress(registerPressAnim, () => navigation.navigate('Register'))}
              activeOpacity={0.9}
            >
              <Text style={styles.primaryButtonText}>Get Started</Text>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View style={{ transform: [{ scale: loginPressAnim }] }}>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => handlePress(loginPressAnim, () => navigation.navigate('Login'))}
              activeOpacity={0.9}
            >
              <Text style={styles.secondaryButtonText}>I already have an account</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>

        <Text style={styles.terms}>
          By continuing, you agree to our{' '}
          <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
          <Text style={styles.termsLink}>Privacy Policy</Text>
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  bgCircle1: {
    position: 'absolute',
    width: 350,
    height: 350,
    borderRadius: 175,
    backgroundColor: COLORS.primary,
    opacity: 0.06,
    top: -100,
    right: -100,
  },
  bgCircle2: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: COLORS.secondary,
    opacity: 0.06,
    top: 200,
    left: -80,
  },
  bgCircle3: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: COLORS.airport,
    opacity: 0.04,
    bottom: 200,
    right: -40,
  },
  illustrationContainer: {
    height: height * 0.42,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  cardsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  miniCard: {
    width: 95,
    height: 75,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    opacity: 0.9,
  },
  miniCardEmoji: {
    fontSize: 24,
  },
  miniCardLabel: {
    color: COLORS.white,
    fontSize: 9,
    fontWeight: '700',
    marginTop: 4,
    textAlign: 'center',
  },
  mapMock: {
    width: 300,
    height: 110,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  mapPin: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
    top: '40%',
    left: '45%',
    borderWidth: 3,
    borderColor: COLORS.white,
  },
  mapRoad: {
    position: 'absolute',
    height: 2,
    backgroundColor: COLORS.surfaceLight,
    opacity: 0.5,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.md,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.white,
    lineHeight: 40,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: FONT_SIZES.base,
    color: COLORS.textSecondary,
    lineHeight: 22,
    marginTop: 12,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 16,
  },
  badge: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  badgeText: {
    color: COLORS.textPrimary,
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
  },
  buttons: {
    gap: 12,
    marginTop: 28,
  },
  primaryButton: {
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
  },
  primaryButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  secondaryButton: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  secondaryButtonText: {
    color: COLORS.textPrimary,
    fontSize: FONT_SIZES.base,
    fontWeight: '600',
  },
  terms: {
    fontSize: 11,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 18,
  },
  termsLink: {
    color: COLORS.primary,
    fontWeight: '600',
  },
});
