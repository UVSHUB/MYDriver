import Constants from 'expo-constants';
import { NativeModules } from 'react-native';

// App Colors - Executive Modern Theme (Uber / Bolt Style)
export const COLORS = {
  // Primary Palette (Midnight Obsidian Black)
  primary: '#111827',
  primaryLight: '#F1F5F9',
  primaryDark: '#0F172A',

  // Secondary (Electric Amber Accent)
  secondary: '#FF5500',
  secondaryLight: '#FFF7ED',
  secondaryDark: '#EA580C',

  // Background & Surfaces (Clean Off-White & Pure Crisp Cards)
  background: '#F8FAFC',      // Ultra-clean slate off-white background
  surface: '#FFFFFF',         // Pure pristine white cards & sheets
  surfaceLight: '#F1F5F9',    // Light cool slate container
  card: '#FFFFFF',            // Pure white cards
  cardBorder: '#E2E8F0',      // Hairline subtle slate border

  // Light theme fallback
  backgroundLight: '#F8FAFC',
  surfaceLightTheme: '#FFFFFF',
  cardLight: '#FFFFFF',

  // Typography (Slate Palette)
  textPrimary: '#0F172A',     // Deep Obsidian Slate
  textSecondary: '#475569',   // Slate Body Gray
  textMuted: '#94A3B8',       // Muted Light Slate
  textDark: '#0F172A',
  textDarkSecondary: '#334155',

  // Status Colors (Executive Modern)
  success: '#10B981',         // Vibrant Emerald Green
  warning: '#F59E0B',         // Amber Gold
  error: '#EF4444',           // Coral Red
  info: '#3B82F6',            // Electric Blue

  // Clean flat gradient simulation
  gradientStart: '#FFFFFF',
  gradientEnd: '#F8FAFC',
  gradientBlue: ['#111827', '#1E293B'],
  gradientGreen: ['#10B981', '#059669'],
  gradientEmergency: ['#EF4444', '#DC2626'],

  // Service Card Accents
  driveHome: '#111827',
  hireDriver: '#111827',
  emergency: '#EF4444',       // Red for safety
  airport: '#111827',

  // Rating
  star: '#F59E0B',

  // Common
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
  overlay: 'rgba(15, 23, 42, 0.5)',
  overlayLight: 'rgba(15, 23, 42, 0.12)',
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
