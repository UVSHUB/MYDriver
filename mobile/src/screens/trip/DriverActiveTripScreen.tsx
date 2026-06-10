import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Linking,
  Platform,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { bookingApi } from '../../api';
import { socketService } from '../../services/socketService';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, SHADOWS } from '../../constants';

const lightMapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#f5f5f5' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#ffffff' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#616161' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#e9e9e9' }] },
];

export default function DriverActiveTripScreen({ navigation, route }: any) {
  const { bookingId } = route.params;
  const [booking, setBooking] = useState<any>(null);
  const [status, setStatus] = useState<string>('matched'); // matched, driver_arrived, trip_started, completed
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    loadBooking();

    // Listen for customer cancellation
    socketService.on('booking:cancelled', () => {
      Alert.alert('Trip Cancelled', 'The passenger has cancelled this request.', [
        { text: 'OK', onPress: () => navigation.navigate('Dashboard') }
      ]);
    });

    return () => {
      socketService.off('booking:cancelled');
    };
  }, []);

  const loadBooking = async () => {
    try {
      const data = await bookingApi.getById(bookingId);
      setBooking(data);
      setStatus(data.status);
    } catch (error) {
      Alert.alert('Error', 'Could not load trip details.');
      navigation.goBack();
    } finally {
      setIsLoading(false);
    }
  };

  const handleCall = () => {
    if (!booking?.customerId?.phone) return;
    Linking.openURL(`tel:${booking.customerId.phone}`);
  };

  const handleNavigate = () => {
    if (!booking) return;
    const loc = status === 'matched' ? booking.pickupLocation : booking.dropLocation;
    const url = Platform.select({
      ios: `maps:0,0?q=${loc.address}@${loc.coordinates.latitude},${loc.coordinates.longitude}`,
      android: `geo:0,0?q=${loc.coordinates.latitude},${loc.coordinates.longitude}(${loc.address})`,
    });
    if (url) Linking.openURL(url);
  };

  const handleStateProgress = async () => {
    setIsUpdating(true);
    try {
      if (status === 'matched') {
        // Driver Arrived
        socketService.emit('driver:arrived', { bookingId });
        setStatus('driver_arrived');
      } else if (status === 'driver_arrived') {
        // Trip Started
        socketService.emit('trip:start', { bookingId });
        setStatus('trip_started');
      } else if (status === 'trip_started') {
        // Trip Completed
        socketService.emit('trip:complete', {
          bookingId,
          actualDistance: booking.estimatedDistance,
          actualDuration: booking.estimatedDuration,
        });
        setStatus('completed');
        Alert.alert('Trip Completed! ✅', 'Earnings have been credited to your wallet.', [
          { text: 'Back to Dashboard', onPress: () => navigation.navigate('Dashboard') }
        ]);
      }
    } catch {
      Alert.alert('Update Failed', 'Failed to update trip status.');
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const pickup = booking?.pickupLocation?.coordinates;
  const drop = booking?.dropLocation?.coordinates;

  return (
    <View style={styles.container}>
      {/* Map View */}
      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        region={{
          latitude: pickup?.latitude || 6.9271,
          longitude: pickup?.longitude || 79.8612,
          latitudeDelta: 0.03,
          longitudeDelta: 0.03,
        }}
        customMapStyle={lightMapStyle}
      >
        {pickup && <Marker coordinate={pickup} title="Pickup" pinColor="green" />}
        {drop && <Marker coordinate={drop} title="Destination" pinColor="red" />}
      </MapView>

      {/* Floating Navigator Options */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.navButton} onPress={handleNavigate}>
          <Ionicons name="navigate-circle" size={20} color={COLORS.black} style={{ marginRight: 6 }} />
          <Text style={styles.navText}>Navigate</Text>
        </TouchableOpacity>
      </View>

      {/* Active Trip Info Box */}
      <View style={styles.detailsCard}>
        <View style={styles.passengerRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {booking?.customerId?.fullName?.charAt(0) || 'P'}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.passengerName}>
              {booking?.customerId?.fullName || 'Passenger'}
            </Text>
            <Text style={styles.tripStatusText}>
              {status === 'matched' ? 'Navigating to Pickup' :
               status === 'driver_arrived' ? 'Waiting for Passenger' : 'On Trip'}
            </Text>
          </View>
          <TouchableOpacity style={styles.phoneButton} onPress={handleCall}>
            <Ionicons name="call" size={22} color={COLORS.black} />
          </TouchableOpacity>
        </View>

        {/* Addresses list */}
        <View style={styles.addresses}>
          <View style={styles.addressRow}>
            <View style={styles.dotGreen} />
            <Text style={styles.addressText} numberOfLines={1}>
              {booking?.pickupLocation?.address}
            </Text>
          </View>
          <View style={styles.vertLine} />
          <View style={styles.addressRow}>
            <View style={styles.dotRed} />
            <Text style={styles.addressText} numberOfLines={1}>
              {booking?.dropLocation?.address}
            </Text>
          </View>
        </View>

        {/* Multi-stage State Button */}
        <TouchableOpacity
          style={[styles.actionButton, isUpdating && { opacity: 0.8 }]}
          onPress={handleStateProgress}
          disabled={isUpdating}
          activeOpacity={0.85}
        >
          {isUpdating ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={styles.actionText}>
              {status === 'matched' ? 'Arrived at Pickup' :
               status === 'driver_arrived' ? 'Start Trip' : 'Complete Trip'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.background },
  map: { flex: 1 },
  header: {
    position: 'absolute',
    top: 60,
    right: SPACING.xl,
    zIndex: 10,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    ...SHADOWS.sm,
  },
  navText: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.black },
  detailsCard: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    paddingBottom: 36,
    borderTopWidth: 1,
    borderTopColor: COLORS.cardBorder,
    ...SHADOWS.lg,
    gap: 16,
  },
  passengerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: FONT_SIZES.lg, color: COLORS.black, fontWeight: '800' },
  passengerName: { fontSize: FONT_SIZES.base, fontWeight: '800', color: COLORS.black },
  tripStatusText: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary, fontWeight: '600', marginTop: 2 },
  phoneButton: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: COLORS.cardBorder,
  },
  addresses: {
    padding: SPACING.base,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  addressRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  dotGreen: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.success },
  dotRed: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.error },
  vertLine: { width: 1, height: 16, backgroundColor: COLORS.cardBorder, marginLeft: 3, marginVertical: 4 },
  addressText: { fontSize: FONT_SIZES.sm, color: COLORS.textPrimary, fontWeight: '600' },
  actionButton: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.sm,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  actionText: { color: COLORS.white, fontSize: FONT_SIZES.base, fontWeight: '800' },
});
