import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  StatusBar,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { loadStoredAuth } from '../../store/slices/authSlice';
import { RootStackParamList } from '../../types';
import { COLORS, FONT_SIZES, BORDER_RADIUS } from '../../constants';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Splash'>;
};

export default function SplashScreen({ navigation }: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  const logoScale = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const dotAnim1 = useRef(new Animated.Value(0)).current;
  const dotAnim2 = useRef(new Animated.Value(0)).current;
  const dotAnim3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Logo entrance spring animation
    Animated.sequence([
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          tension: 40,
          friction: 6,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();

    // Loading dots animation
    const animateDots = () => {
      Animated.sequence([
        Animated.timing(dotAnim1, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(dotAnim2, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(dotAnim3, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.parallel([
          Animated.timing(dotAnim1, { toValue: 0, duration: 300, useNativeDriver: true }),
          Animated.timing(dotAnim2, { toValue: 0, duration: 300, useNativeDriver: true }),
          Animated.timing(dotAnim3, { toValue: 0, duration: 300, useNativeDriver: true }),
        ]),
      ]).start(() => animateDots());
    };
    animateDots();

    // Load auth state and navigate
    const timer = setTimeout(async () => {
      await dispatch(loadStoredAuth());
    }, 2800);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isAuthenticated !== undefined) {
      const navTimer = setTimeout(() => {
        navigation.replace(isAuthenticated ? 'Main' : 'Auth');
      }, 500);
      return () => clearTimeout(navTimer);
    }
  }, [isAuthenticated]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      {/* Decorative background glow rings for high-end feel */}
      <View style={styles.glowRing1} />
      <View style={styles.glowRing2} />

      {/* App Logo */}
      <Animated.View
        style={[styles.logoWrapper, { transform: [{ scale: logoScale }], opacity: logoOpacity }]}
      >
        <Animated.Image
          source={require('../../../assets/Logo.png')}
          style={styles.logoImage}
          resizeMode="contain"
        />
      </Animated.View>

      {/* App Name Stark Luxury branding */}
      <Animated.View style={{ opacity: textOpacity, alignItems: 'center' }}>
        <Text style={styles.appName}>DRIVER</Text>
        <Text style={styles.appNameAccent}>ON DEMAND</Text>
        <Text style={styles.tagline}>Your Professional Driver Awaits</Text>
      </Animated.View>

      {/* Loading Dots */}
      <View style={styles.dotsContainer}>
        {[dotAnim1, dotAnim2, dotAnim3].map((anim, i) => (
          <Animated.View
            key={i}
            style={[
              styles.dot,
              {
                opacity: anim,
                transform: [{ scale: anim.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1.1] }) }],
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowRing1: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    borderWidth: 1.5,
    borderColor: 'rgba(0, 0, 0, 0.02)',
    top: -50,
    right: -80,
  },
  glowRing2: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.015)',
    bottom: 80,
    left: -60,
  },
  logoWrapper: {
    marginBottom: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImage: {
    width: 140,
    height: 140,
    borderRadius: BORDER_RADIUS.sm,
  },
  appName: {
    fontSize: 34,
    fontWeight: '900',
    color: COLORS.black,
    letterSpacing: -1,
  },
  appNameAccent: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textSecondary,
    letterSpacing: 2,
    marginTop: 2,
  },
  tagline: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    marginTop: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  dotsContainer: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 80,
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.black,
    marginHorizontal: 2,
  },
});
