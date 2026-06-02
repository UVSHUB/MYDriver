// ─── Auth Types ────────────────────────────────────────────────

export interface User {
  _id: string;
  fullName: string;
  phone: string;
  email: string;
  avatar?: string;
  role: 'customer' | 'driver' | 'admin';
  isVerified: boolean;
  walletBalance: number;
  language: string;
  darkMode: boolean;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

// ─── Vehicle Types ─────────────────────────────────────────────

export interface Vehicle {
  _id: string;
  userId: string;
  brand: string;
  model: string;
  year?: number;
  registrationNumber: string;
  color: string;
  type: 'sedan' | 'suv' | 'van' | 'truck' | 'luxury' | 'other';
  isDefault: boolean;
  createdAt: string;
}

// ─── Location Types ────────────────────────────────────────────

export interface Location {
  address: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  placeId?: string;
}

// ─── Booking Types ─────────────────────────────────────────────

export type BookingStatus =
  | 'pending'
  | 'searching'
  | 'matched'
  | 'driver_arrived'
  | 'trip_started'
  | 'completed'
  | 'cancelled';

export type ServiceType = 'drive_me_home' | 'hire_driver' | 'emergency' | 'airport';

export interface Booking {
  _id: string;
  customerId: string;
  driverId?: Driver;
  vehicleId: Vehicle;
  serviceType: ServiceType;
  status: BookingStatus;
  pickupLocation: Location;
  dropLocation: Location;
  estimatedDistance: number;
  estimatedDuration: number;
  driverFee: number;
  platformFee: number;
  totalCost: number;
  currency: string;
  paymentMethod: string;
  paymentStatus: 'pending' | 'paid' | 'refunded';
  cancellationReason?: string;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
}

// ─── Driver Types ──────────────────────────────────────────────

export interface Driver {
  _id: string;
  userId: {
    _id: string;
    fullName: string;
    avatar?: string;
    phone?: string;
  };
  rating: number;
  totalRatings: number;
  experience: number;
  isAvailable: boolean;
  currentLocation?: {
    coordinates: [number, number];
    heading?: number;
    updatedAt: string;
  };
  vehicleClasses: string[];
  totalTrips: number;
}

// ─── Notification Types ────────────────────────────────────────

export interface AppNotification {
  _id: string;
  userId: string;
  title: string;
  body: string;
  type: 'driver_assigned' | 'driver_arrived' | 'trip_started' | 'trip_completed' | 'promotion' | 'general';
  data?: Record<string, string>;
  isRead: boolean;
  createdAt: string;
}

// ─── Review Types ──────────────────────────────────────────────

export interface Review {
  _id: string;
  bookingId: string;
  customerId: {
    _id: string;
    fullName: string;
    avatar?: string;
  };
  driverId: string;
  rating: number;
  categories: {
    drivingSkill: number;
    safety: number;
    professionalism: number;
    punctuality: number;
  };
  comment?: string;
  createdAt: string;
}

// ─── Emergency Contact ─────────────────────────────────────────

export interface EmergencyContact {
  _id: string;
  userId: string;
  name: string;
  phone: string;
  relationship: string;
}

// ─── API Response Types ────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    total: number;
    page: number;
    pages: number;
    limit: number;
  };
}

// ─── Navigation Types ──────────────────────────────────────────

export type RootStackParamList = {
  Splash: undefined;
  Auth: undefined;
  Main: undefined;
  TripFlow: undefined;
};

export type AuthStackParamList = {
  Welcome: undefined;
  Register: undefined;
  OTPVerification: { userId: string; phone: string; mode: 'register' | 'login' | 'forgot' };
  Login: undefined;
  ForgotPassword: undefined;
  ResetPassword: { userId: string; otp: string };
};

export type MainTabParamList = {
  Home: undefined;
  BookingFlow: undefined;
  Wallet: undefined;
  Profile: undefined;
};

export type BookingStackParamList = {
  ServiceSelect: undefined;
  PickupMap: { serviceType: ServiceType };
  Destination: { serviceType: ServiceType; pickupLocation: Location };
  VehicleInfo: { serviceType: ServiceType; pickupLocation: Location; dropLocation: Location };
  TripSummary: {
    serviceType: ServiceType;
    pickupLocation: Location;
    dropLocation: Location;
    vehicleId: string;
    estimatedDistance: number;
    estimatedDuration: number;
  };
};

export type TripStackParamList = {
  Searching: { bookingId: string };
  DriverMatched: { bookingId: string };
  LiveTracking: { bookingId: string };
  ActiveTrip: { bookingId: string };
  TripCompletion: { bookingId: string };
  Rating: { bookingId: string };
};
