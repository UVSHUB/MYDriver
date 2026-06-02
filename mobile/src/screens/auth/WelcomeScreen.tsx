import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
  StatusBar,
  Easing,
  Image,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthStackParamList } from '../../types';
import { COLORS, BORDER_RADIUS, FONT_SIZES, SPACING, API_BASE_URL } from '../../constants';

const { width, height } = Dimensions.get('window');

type Props = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Welcome'>;
};

export default function WelcomeScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();

  // Entrance motion animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  // Concentric radar pulse ring animations
  const pulse1 = useRef(new Animated.Value(0)).current;
  const pulse2 = useRef(new Animated.Value(0)).current;
  const pulse3 = useRef(new Animated.Value(0)).current;
  const radarSweep = useRef(new Animated.Value(0)).current;

  // Scale interactive states for premium taps
  const startBtnScale = useRef(new Animated.Value(1)).current;
  const loginBtnScale = useRef(new Animated.Value(1)).current;

  // Developer Settings Overrides
  const [logoTaps, setLogoTaps] = useState(0);
  const [showDevModal, setShowDevModal] = useState(false);
  const [devIp, setDevIp] = useState('');
  const [activeIp, setActiveIp] = useState('');

  useEffect(() => {
    // Staggered screen entry
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 800, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();

    // Loop concentric pulses
    const runPulse = (anim: Animated.Value, delay: number) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, { toValue: 1, duration: 2500, easing: Easing.out(Easing.ease), useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0, duration: 0, useNativeDriver: true }),
        ])
      ).start();
    };
    runPulse(pulse1, 0);
    runPulse(pulse2, 800);
    runPulse(pulse3, 1600);

    // Continuous radial sweep rotation
    Animated.loop(
      Animated.timing(radarSweep, { toValue: 1, duration: 4000, easing: Easing.linear, useNativeDriver: true })
    ).start();
  }, []);

  // Check active IP configuration dynamically
  useEffect(() => {
    const loadIP = async () => {
      const saved = await AsyncStorage.getItem('@api_ip_override');
      if (saved) {
        setActiveIp(saved);
        setDevIp(saved);
      } else {
        const match = API_BASE_URL.match(/http:\/\/([0-9a-fA-F\.:]+)/);
        setActiveIp(match && match[1] ? match[1].split(':')[0] : 'localhost');
      }
    };
    loadIP();
  }, [showDevModal]);

  const handlePress = (anim: Animated.Value, callback: () => void) => {
    Animated.sequence([
      Animated.timing(anim, { toValue: 0.96, duration: 100, useNativeDriver: true }),
      Animated.timing(anim, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start(callback);
  };

  const handleLogoTap = () => {
    setLogoTaps(prev => {
      const next = prev + 1;
      if (next >= 5) {
        setShowDevModal(true);
        return 0;
      }
      return next;
    });
  };

  const radarRotation = radarSweep.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: Math.max(insets.bottom, 16) }]}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      {/* Subtle backdrop ambient glows */}
      <View style={styles.glowTopRight} />
      <View style={styles.glowBottomLeft} />

      {/* ─── Grand Centered Brand Hero Element ───────────────── */}
      <View style={styles.heroContainer}>
        {/* Pulsing Concentric Radar Rings spreading outwards from the logo */}
        {[pulse1, pulse2, pulse3].map((anim, i) => (
          <Animated.View
            key={i}
            style={[
              styles.radarPulseRing,
              {
                opacity: anim.interpolate({ inputRange: [0, 0.4, 1], outputRange: [0.15, 0.04, 0] }),
                transform: [{ scale: anim.interpolate({ inputRange: [0, 1], outputRange: [0.6, 2.4] }) }],
              },
            ]}
          />
        ))}

        {/* Concentric subtle vector design circles */}
        <View style={styles.radarGridRing1} />
        <View style={styles.radarGridRing2} />

        {/* Dynamic Sweeping Radar Sensor Line */}
        <Animated.View style={[styles.radarSweepLine, { transform: [{ rotate: radarRotation }] }]} />

        {/* Large Centered Custom Logo Container with dev mode tap mapping */}
        <TouchableOpacity
          onPress={handleLogoTap}
          activeOpacity={0.92}
          style={styles.logoTouchable}
        >
          <Animated.View style={[styles.logoWrapper, { opacity: fadeAnim }]}>
            <Image
              source={require('../../../assets/Logo.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </Animated.View>
        </TouchableOpacity>
      </View>

      {/* ─── Luxury Stark Typography & Actions Area ─────────── */}
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <Text style={styles.title}>Your Executive{'\n'}Driver Awaits</Text>
        <Text style={styles.subtitle}>
          Hire certified, highly-rated professional drivers to drive your own vehicle safely and comfortably.
        </Text>

        {/* Minimal flat high-contrast badges */}
        <View style={styles.badges}>
          {[
            { icon: 'flash' as const, label: 'Instant Dispatch' },
            { icon: 'shield-checkmark' as const, label: 'Certified Safety' },
            { icon: 'star' as const, label: '5-Star Standards' },
          ].map((badge, i) => (
            <View key={i} style={styles.badge}>
              <Ionicons name={badge.icon} size={12} color={COLORS.black} style={{ marginRight: 6 }} />
              <Text style={styles.badgeText}>{badge.label}</Text>
            </View>
          ))}
        </View>

        {/* Premium Actions */}
        <View style={styles.buttons}>
          <Animated.View style={{ transform: [{ scale: startBtnScale }] }}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => handlePress(startBtnScale, () => navigation.navigate('Register'))}
              activeOpacity={0.9}
            >
              <Text style={styles.primaryButtonText}>Get Started</Text>
              <Ionicons name="arrow-forward" size={16} color={COLORS.white} style={{ marginLeft: 6 }} />
            </TouchableOpacity>
          </Animated.View>

          <Animated.View style={{ transform: [{ scale: loginBtnScale }] }}>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => handlePress(loginBtnScale, () => navigation.navigate('Login'))}
              activeOpacity={0.8}
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

        {/* Dynamic Dev Config Status Text at the bottom */}
        <Text style={styles.devConfigLabel}>
          Dod Developer Mode • API: http://{activeIp}:5050
        </Text>
      </Animated.View>

      {/* ─── Developer Settings IP Configuration Modal ─────────── */}
      <Modal
        visible={showDevModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDevModal(false)}
      >
        <View style={styles.devOverlay}>
          <View style={styles.devCard}>
            <Text style={styles.devTitle}>Developer Settings</Text>
            <Text style={styles.devSubtitle}>
              Configure your computer's local IP address to enable network routing for physical devices.
            </Text>

            <TextInput
              style={styles.devInput}
              value={devIp}
              onChangeText={setDevIp}
              placeholder="e.g. 192.168.1.15"
              placeholderTextColor={COLORS.textMuted}
              keyboardType="numeric"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <View style={styles.devActions}>
              <TouchableOpacity
                style={styles.devSaveButton}
                onPress={async () => {
                  if (devIp.trim()) {
                    await AsyncStorage.setItem('@api_ip_override', devIp.trim());
                    Alert.alert('Configuration Saved', `API host routed to http://${devIp.trim()}:5050`);
                  } else {
                    await AsyncStorage.removeItem('@api_ip_override');
                    Alert.alert('Configuration Reset', 'API host restored to automatic detection.');
                  }
                  setShowDevModal(false);
                }}
              >
                <Text style={styles.devSaveText}>Save Configuration</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.devCancelButton}
                onPress={() => setShowDevModal(false)}
              >
                <Text style={styles.devCancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  glowTopRight: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'rgba(0, 0, 0, 0.015)',
    top: -60,
    right: -60,
  },
  glowBottomLeft: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(0, 0, 0, 0.01)',
    bottom: -60,
    left: -60,
  },
  heroContainer: {
    height: height * 0.36,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginTop: 20,
  },
  logoTouchable: {
    position: 'absolute',
    zIndex: 10,
  },
  radarPulseRing: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: COLORS.black,
  },
  radarGridRing1: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.035)',
    borderStyle: 'dashed',
  },
  radarGridRing2: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.045)',
  },
  radarSweepLine: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    borderRightWidth: 1.5,
    borderRightColor: 'rgba(0, 0, 0, 0.08)',
  },
  logoWrapper: {
    width: 140,
    height: 140,
    borderRadius: 30,
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: 'rgba(0, 0, 0, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
  },
  logoImage: {
    width: 120,
    height: 120,
    borderRadius: 22,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: FONT_SIZES['3xl'],
    fontWeight: '900',
    color: COLORS.black,
    lineHeight: 38,
    letterSpacing: -0.8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: FONT_SIZES.base,
    color: COLORS.textSecondary,
    lineHeight: 22,
    marginTop: 10,
    textAlign: 'center',
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 18,
    justifyContent: 'center',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  badgeText: {
    color: COLORS.black,
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  buttons: {
    width: '100%',
    gap: 12,
    marginTop: 26,
  },
  primaryButton: {
    backgroundColor: COLORS.black,
    borderRadius: BORDER_RADIUS.sm,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.base,
    fontWeight: '800',
  },
  secondaryButton: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.sm,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  secondaryButtonText: {
    color: COLORS.black,
    fontSize: FONT_SIZES.base,
    fontWeight: '800',
  },
  terms: {
    fontSize: 9.5,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 18,
    lineHeight: 15,
    fontWeight: '600',
  },
  termsLink: {
    color: COLORS.black,
    fontWeight: '700',
  },
  devConfigLabel: {
    fontSize: 8.5,
    color: COLORS.textMuted,
    marginTop: 18,
    fontWeight: '600',
    letterSpacing: 0.3,
    opacity: 0.7,
  },

  // ─── Modal Overlay styles ─────────────────────────────────────────
  devOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  devCard: {
    width: '100%',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.xl,
    borderWidth: 1.5,
    borderColor: 'rgba(0, 0, 0, 0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 12,
  },
  devTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.black,
    marginBottom: 8,
  },
  devSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    lineHeight: 18,
    marginBottom: 18,
  },
  devInput: {
    height: 52,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1.5,
    borderColor: COLORS.cardBorder,
    paddingHorizontal: SPACING.base,
    fontSize: FONT_SIZES.base,
    color: COLORS.black,
    marginBottom: 20,
  },
  devActions: {
    gap: 10,
  },
  devSaveButton: {
    backgroundColor: COLORS.black,
    height: 52,
    borderRadius: BORDER_RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  devSaveText: {
    color: COLORS.white,
    fontWeight: '800',
    fontSize: FONT_SIZES.base,
  },
  devCancelButton: {
    backgroundColor: COLORS.surface,
    height: 52,
    borderRadius: BORDER_RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  devCancelText: {
    color: COLORS.black,
    fontWeight: '700',
    fontSize: FONT_SIZES.base,
  },
});
