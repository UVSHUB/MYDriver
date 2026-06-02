import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { Text, View } from 'react-native';
import { COLORS, FONT_SIZES } from '../constants';
import { Ionicons } from '@expo/vector-icons';

// Auth Screens
import SplashScreen from '../screens/auth/SplashScreen';
import WelcomeScreen from '../screens/auth/WelcomeScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import OTPVerificationScreen from '../screens/auth/OTPVerificationScreen';
import LoginScreen from '../screens/auth/LoginScreen';

// Main Screens
import HomeScreen from '../screens/main/HomeScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import WalletScreen from '../screens/main/WalletScreen';

// Booking Screens
import ServiceSelectScreen from '../screens/booking/ServiceSelectScreen';
import PickupMapScreen from '../screens/booking/PickupMapScreen';
import DestinationScreen from '../screens/booking/DestinationScreen';
import VehicleInfoScreen from '../screens/booking/VehicleInfoScreen';
import TripSummaryScreen from '../screens/booking/TripSummaryScreen';

// Trip Screens
import SearchingScreen from '../screens/trip/SearchingScreen';
import RatingScreen from '../screens/trip/RatingScreen';
import {
  RootStackParamList,
  AuthStackParamList,
  MainTabParamList,
  BookingStackParamList,
  TripStackParamList,
} from '../types';

const RootStack = createNativeStackNavigator<RootStackParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const MainTab = createBottomTabNavigator<MainTabParamList>();
const BookingStack = createNativeStackNavigator<BookingStackParamList>();
const TripStack = createNativeStackNavigator<TripStackParamList>();
const ProfileStack = createNativeStackNavigator<any>();

// ─── Auth Navigator ─────────────────────────────────────────────

const AuthNavigator = () => (
  <AuthStack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
    <AuthStack.Screen name="Welcome" component={WelcomeScreen} />
    <AuthStack.Screen name="Register" component={RegisterScreen} />
    <AuthStack.Screen name="OTPVerification" component={OTPVerificationScreen} />
    <AuthStack.Screen name="Login" component={LoginScreen} />
    <AuthStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    <AuthStack.Screen name="ResetPassword" component={ResetPasswordScreen} />
  </AuthStack.Navigator>
);

// ─── Booking Flow Navigator ─────────────────────────────────────

const BookingFlowNavigator = () => (
  <BookingStack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
    <BookingStack.Screen name="ServiceSelect" component={ServiceSelectScreen} />
    <BookingStack.Screen name="PickupMap" component={PickupMapScreen} />
    <BookingStack.Screen name="Destination" component={DestinationScreen} />
    <BookingStack.Screen name="VehicleInfo" component={VehicleInfoScreen} />
    <BookingStack.Screen name="TripSummary" component={TripSummaryScreen} />
  </BookingStack.Navigator>
);

// ─── Trip Flow Navigator ────────────────────────────────────────

const TripFlowNavigator = () => (
  <TripStack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
    <TripStack.Screen name="Searching" component={SearchingScreen} />
    <TripStack.Screen name="DriverMatched" component={DriverMatchedScreen} />
    <TripStack.Screen name="LiveTracking" component={LiveTrackingScreen} />
    <TripStack.Screen name="TripCompletion" component={TripCompletionScreen} />
    <TripStack.Screen name="Rating" component={RatingScreen} />
  </TripStack.Navigator>
);

// ─── Profile Stack ──────────────────────────────────────────────

const ProfileNavigator = () => (
  <ProfileStack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
    <ProfileStack.Screen name="ProfileMain" component={ProfileScreen} />
    <ProfileStack.Screen name="EditProfile" component={EditProfileScreen} />
    <ProfileStack.Screen name="Vehicles" component={VehiclesScreen} />
    <ProfileStack.Screen name="AddVehicle" component={AddVehicleScreen} />
    <ProfileStack.Screen name="EmergencyContacts" component={EmergencyContactsScreen} />
    <ProfileStack.Screen name="Settings" component={SettingsScreen} />
    <ProfileStack.Screen name="Notifications" component={NotificationsScreen} />
  </ProfileStack.Navigator>
);

// ─── Tab Icon ───────────────────────────────────────────────────

const TabIcon = ({ iconName, label, focused }: { iconName: keyof typeof Ionicons.glyphMap; label: string; focused: boolean }) => (
  <View style={{ alignItems: 'center', gap: 4 }}>
    <Ionicons
      name={focused ? iconName : (`${iconName}-outline` as any)}
      size={22}
      color={focused ? COLORS.primary : COLORS.textMuted}
    />
    <Text style={{
      fontSize: 10,
      fontWeight: focused ? '700' : '500',
      color: focused ? COLORS.primary : COLORS.textMuted,
      letterSpacing: -0.1,
    }}>{label}</Text>
  </View>
);

// ─── Main Tab Navigator ─────────────────────────────────────────

const MainNavigator = () => (
  <MainTab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarStyle: {
        backgroundColor: COLORS.surface,
        borderTopColor: COLORS.cardBorder,
        borderTopWidth: 1,
        height: 80,
        paddingBottom: 20,
        paddingTop: 10,
      },
      tabBarShowLabel: false,
    }}
  >
    <MainTab.Screen
      name="Home"
      component={HomeScreen}
      options={{ tabBarIcon: ({ focused }) => <TabIcon iconName="home" label="Home" focused={focused} /> }}
    />
    <MainTab.Screen
      name="BookingFlow"
      component={BookingFlowNavigator}
      options={{ tabBarIcon: ({ focused }) => <TabIcon iconName="car" label="Ride" focused={focused} /> }}
    />
    <MainTab.Screen
      name="Wallet"
      component={WalletScreen}
      options={{ tabBarIcon: ({ focused }) => <TabIcon iconName="wallet" label="Wallet" focused={focused} /> }}
    />
    <MainTab.Screen
      name="Profile"
      component={ProfileNavigator}
      options={{ tabBarIcon: ({ focused }) => <TabIcon iconName="person" label="Account" focused={focused} /> }}
    />
  </MainTab.Navigator>
);

// ─── Placeholder Screens ─────────────────────────────────────────

const PlaceholderScreen = ({ title }: { title: string }) => (
  <View style={{ flex: 1, backgroundColor: COLORS.background, alignItems: 'center', justifyContent: 'center' }}>
    <Text style={{ color: COLORS.white, fontSize: 20, fontWeight: '700' }}>{title}</Text>
    <Text style={{ color: COLORS.textSecondary, marginTop: 8 }}>Coming soon...</Text>
  </View>
);

const ForgotPasswordScreen = () => <PlaceholderScreen title="Forgot Password" />;
const ResetPasswordScreen = () => <PlaceholderScreen title="Reset Password" />;
const DriverMatchedScreen = () => <PlaceholderScreen title="Driver Matched! 🎉" />;
const LiveTrackingScreen = () => <PlaceholderScreen title="Live Tracking 📍" />;
const TripCompletionScreen = () => <PlaceholderScreen title="Trip Complete ✅" />;
const EditProfileScreen = () => <PlaceholderScreen title="Edit Profile" />;
const VehiclesScreen = () => <PlaceholderScreen title="My Vehicles 🚗" />;
const AddVehicleScreen = () => <PlaceholderScreen title="Add Vehicle +" />;
const EmergencyContactsScreen = () => <PlaceholderScreen title="Emergency Contacts 🆘" />;
const SettingsScreen = () => <PlaceholderScreen title="Settings ⚙️" />;
const NotificationsScreen = () => <PlaceholderScreen title="Notifications 🔔" />;

// ─── Root Navigator ─────────────────────────────────────────────

export const AppNavigator = () => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        <RootStack.Screen name="Splash" component={SplashScreen} />
        {isAuthenticated ? (
          <>
            <RootStack.Screen name="Main" component={MainNavigator} />
            <RootStack.Screen name="TripFlow" component={TripFlowNavigator} options={{ animation: 'slide_from_bottom' }} />
          </>
        ) : (
          <RootStack.Screen name="Auth" component={AuthNavigator} />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
};
