import Constants from 'expo-constants';
import { NativeModules } from 'react-native';

// App Colors - Premium Dark Orange Theme
export const COLORS = {
  // Primary Palette (Vibrant Dark Orange Controls)
  primary: '#E65100',
  primaryLight: '#FFF3E0',
  primaryDark: '#BF360C',

  // Secondary (Vibrant Accent Colors)
  secondary: '#FF6D00',
  secondaryLight: '#FFE0B2',
  secondaryDark: '#B53D00',

  // Background & Surfaces
  background: '#FFFFFF',      // Pure clean white background
  surface: '#FFF3E0',         // Soft peach-orange surface
  surfaceLight: '#FFE0B2',    // Light peach surface
  card: '#FFFFFF',            // Pure white cards
  cardBorder: '#FFE0B2',      // Hairline orange-peach dividers

  // Light theme fallback
  backgroundLight: '#FFFFFF',
  surfaceLightTheme: '#FFF3E0',
  cardLight: '#FFFFFF',

  // Typography
  textPrimary: '#000000',     // Stark black text
  textSecondary: '#55555C',   // Charcoal grey
  textMuted: '#8E8E93',       // Soft muted light grey
  textDark: '#000000',
  textDarkSecondary: '#1C1C1E',

  // Status Colors (Subtle premium design)
  success: '#248A3D',         // Clean Dark Green
  warning: '#FF9500',         // Clean Amber
  error: '#FF3B30',           // Clean Coral Red
  info: '#007AFF',            // Clean Royal Blue

  // Clean flat gradient simulation
  gradientStart: '#FFFFFF',
  gradientEnd: '#FFF3E0',
  gradientBlue: ['#E65100', '#FF8F00'],
  gradientGreen: ['#248A3D', '#1B6029'],
  gradientEmergency: ['#FF3B30', '#C62828'],

  // Service Card Accents
  driveHome: '#E65100',
  hireDriver: '#E65100',
  emergency: '#FF3B30',       // Red for safety
  airport: '#E65100',

  // Rating
  star: '#FFCC00',

  // Common
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
  overlay: 'rgba(0, 0, 0, 0.4)',
  overlayLight: 'rgba(0, 0, 0, 0.15)',
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
  sm: 10,     // Smooth corners for modern UI elements
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 40,
  full: 9999,
};

export const SHADOWS = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
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
