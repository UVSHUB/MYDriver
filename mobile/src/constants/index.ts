import Constants from 'expo-constants';
import { NativeModules } from 'react-native';

// App Colors - Orange x White x Black Theme
export const COLORS = {
  // Primary Palette (Electric Orange Accent & Action)
  primary: '#FF5500',
  primaryLight: '#FFF5F0',
  primaryDark: '#D94800',

  // Secondary Palette (Obsidian Deep Black)
  secondary: '#09090B',
  secondaryLight: '#18181B',
  secondaryDark: '#000000',

  // Background & Surfaces (Crisp White & Off-White Cards)
  background: '#F9FAFB',      // Ultra-clean light gray/off-white background
  surface: '#FFFFFF',         // Pure pristine white cards & sheets
  surfaceLight: '#FFF5F0',    // Soft light orange tinted container
  card: '#FFFFFF',            // Pure white cards
  cardBorder: '#E5E7EB',      // Subtle clean hairline border

  // Light theme fallback
  backgroundLight: '#F9FAFB',
  surfaceLightTheme: '#FFFFFF',
  cardLight: '#FFFFFF',

  // Typography (Jet Black & Slate Body)
  textPrimary: '#09090B',     // Jet Black
  textSecondary: '#4B5563',   // Medium Slate Gray
  textMuted: '#9CA3AF',       // Muted Light Gray
  textDark: '#09090B',
  textDarkSecondary: '#27272A',

  // Status Colors
  success: '#10B981',         // Vibrant Emerald Green
  warning: '#F59E0B',         // Amber Gold
  error: '#EF4444',           // Coral Red
  info: '#3B82F6',            // Electric Blue

  // Clean flat gradient simulation
  gradientStart: '#FFFFFF',
  gradientEnd: '#F9FAFB',
  gradientBlue: ['#FF5500', '#D94800'],
  gradientGreen: ['#10B981', '#059669'],
  gradientEmergency: ['#EF4444', '#DC2626'],

  // Service Card Accents
  driveHome: '#FF5500',
  hireDriver: '#09090B',
  emergency: '#EF4444',       // Red for safety
  airport: '#FF5500',

  // Rating
  star: '#F59E0B',

  // Common
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
  overlay: 'rgba(9, 9, 11, 0.6)',
  overlayLight: 'rgba(9, 9, 11, 0.15)',
};

export const FONTS = {
  regular: 'System',
  medium: 'System',
  semiBold: 'System',
  bold: 'System',
  extraBold: 'System',
};

export const FONT_SIZES = {
  xs: 11,
  sm: 13,
  base: 15,
  md: 17,
  lg: 19,
  xl: 22,
  '2xl': 26,
  '3xl': 30,
  '4xl': 36,
  '5xl': 44,
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
  '5xl': 64,
};

export const BORDER_RADIUS = {
  sm: 10,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 40,
  full: 9999,
};

export const SHADOWS = {
  sm: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  lg: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },
};

const getHostIP = (): string => {
  // 1. Try React Native's bundle URL (100% guaranteed on emulator & physical dev devices)
  const scriptURL = NativeModules.SourceCode?.scriptURL;
  if (typeof scriptURL === 'string' && scriptURL.startsWith('http')) {
    const match = scriptURL.match(/http:\/\/([0-9a-fA-F\.:]+)/);
    if (match && match[1]) {
      const ip = match[1].split(':')[0];
      if (ip && ip !== '127.0.0.1' && ip !== 'localhost') {
        return ip;
      }
    }
  }

  // 2. Fallback to Expo's hostUri config
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const ip = hostUri.split(':')[0];
    if (ip && ip !== '127.0.0.1' && ip !== 'localhost') {
      return ip;
    }
  }

  // 3. Fallback to Expo manifest2 debuggerHost
  const debuggerHost = (Constants.manifest2 as any)?.extra?.expoGo?.debuggerHost;
  if (debuggerHost) {
    const ip = debuggerHost.split(':')[0];
    if (ip && ip !== '127.0.0.1' && ip !== 'localhost') {
      return ip;
    }
  }

  return 'localhost';
};

const hostIP = getHostIP();
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || `http://${hostIP}:5050/api`;
export const SOCKET_URL = process.env.EXPO_PUBLIC_SOCKET_URL || `http://${hostIP}:5050`;
export const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_KEY || 'YOUR_GOOGLE_MAPS_API_KEY';

export const SERVICE_TYPES = [
  {
    id: 'drive_me_home' as const,
    title: 'Drive Me Home',
    description: 'A personal driver will drive your vehicle back safely.',
    iconName: 'home-outline', // Ionicons
    color: COLORS.driveHome,
  },
  {
    id: 'hire_driver' as const,
    title: 'Hire Driver',
    description: 'Rent a professional driver by the hour.',
    iconName: 'car-outline', // Ionicons
    color: COLORS.hireDriver,
  },
  {
    id: 'emergency' as const,
    title: 'Emergency',
    description: 'Immediate designated driver assignment.',
    iconName: 'shield-alert-outline', // MaterialCommunityIcons
    color: COLORS.emergency,
  },
  {
    id: 'airport' as const,
    title: 'Airport Transfer',
    description: 'Stress-free transit to or from the airport terminal.',
    iconName: 'airplane-outline', // Ionicons
    color: COLORS.airport,
  },
];

export const STORAGE_KEYS = {
  ACCESS_TOKEN: '@dod_access_token',
  REFRESH_TOKEN: '@dod_refresh_token',
  USER: '@dod_user',
  THEME: '@dod_theme',
  LANGUAGE: '@dod_language',
};
