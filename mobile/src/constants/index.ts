// App Colors - Primary Design System
export const COLORS = {
  // Primary Palette
  primary: '#2563EB',
  primaryLight: '#3B82F6',
  primaryDark: '#1D4ED8',

  // Secondary
  secondary: '#10B981',
  secondaryLight: '#34D399',
  secondaryDark: '#059669',

  // Dark backgrounds
  background: '#0F172A',
  surface: '#1E293B',
  surfaceLight: '#334155',
  card: '#1E293B',
  cardBorder: '#334155',

  // Light theme
  backgroundLight: '#F8FAFC',
  surfaceLightTheme: '#FFFFFF',
  cardLight: '#FFFFFF',

  // Text
  textPrimary: '#F1F5F9',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  textDark: '#0F172A',
  textDarkSecondary: '#475569',

  // Status Colors
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',

  // Gradient Colors
  gradientStart: '#0F172A',
  gradientEnd: '#1E293B',
  gradientBlue: ['#2563EB', '#1D4ED8'],
  gradientGreen: ['#10B981', '#059669'],
  gradientEmergency: ['#EF4444', '#DC2626'],

  // Service Card Colors
  driveHome: '#2563EB',
  hireDriver: '#10B981',
  emergency: '#EF4444',
  airport: '#8B5CF6',

  // Rating
  star: '#F59E0B',

  // Common
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
  overlay: 'rgba(0, 0, 0, 0.6)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',
};

export const FONTS = {
  regular: 'Inter-Regular',
  medium: 'Inter-Medium',
  semiBold: 'Inter-SemiBold',
  bold: 'Inter-Bold',
  extraBold: 'Inter-ExtraBold',
};

export const FONT_SIZES = {
  xs: 10,
  sm: 12,
  base: 14,
  md: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 28,
  '4xl': 32,
  '5xl': 40,
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
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  full: 9999,
};

export const SHADOWS = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
};

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api';
export const SOCKET_URL = process.env.EXPO_PUBLIC_SOCKET_URL || 'http://localhost:5000';
export const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_KEY || 'YOUR_GOOGLE_MAPS_API_KEY';

export const SERVICE_TYPES = [
  {
    id: 'drive_me_home' as const,
    title: 'Drive Me Home',
    description: 'Safe ride to your home',
    icon: '🏠',
    color: COLORS.driveHome,
    gradient: ['#2563EB', '#1D4ED8'],
  },
  {
    id: 'hire_driver' as const,
    title: 'Hire Driver',
    description: 'Personal driver for hours',
    icon: '🚗',
    color: COLORS.hireDriver,
    gradient: ['#10B981', '#059669'],
  },
  {
    id: 'emergency' as const,
    title: 'Emergency Driver',
    description: 'Immediate assistance',
    icon: '🚨',
    color: COLORS.emergency,
    gradient: ['#EF4444', '#DC2626'],
  },
  {
    id: 'airport' as const,
    title: 'Airport Driver',
    description: 'Airport pickup & drop',
    icon: '✈️',
    color: COLORS.airport,
    gradient: ['#8B5CF6', '#7C3AED'],
  },
];

export const STORAGE_KEYS = {
  ACCESS_TOKEN: '@dod_access_token',
  REFRESH_TOKEN: '@dod_refresh_token',
  USER: '@dod_user',
  THEME: '@dod_theme',
  LANGUAGE: '@dod_language',
};
