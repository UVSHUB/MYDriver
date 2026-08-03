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

export default function LiveTrackingScreen({ navigation, route }: any) {
  const { bookingId } = route.params || {};
  const [booking, setBooking] = useState<any>(null);
  const [status, setStatus] = useState<string>('matched');
  const [driverLoc, setDriverLoc] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadBooking();

    // Socket real-time listeners
    socketService.on('driver:location', (data: any) => {
      if (data.latitude && data.longitude) {
        setDriverLoc({ latitude: data.latitude, longitude: data.longitude });
      }
    });

    socketService.on('driver:arrived', () => {
      setStatus('driver_arrived');
    });

    socketService.on('trip:started', () => {
      setStatus('trip_started');
    });

    socketService.on('trip:completed', () => {
      navigation.replace('TripCompletion', { bookingId });
    });

    return () => {
      socketService.off('driver:location');
      socketService.off('driver:arrived');
      socketService.off('trip:started');
      socketService.off('trip:completed');
    };
  }, []);

  const loadBooking = async () => {
    try {
      const data = await bookingApi.getById(bookingId);
      setBooking(data);
      setStatus(data.status);
      if (data.driverId?.currentLocation?.coordinates) {
        setDriverLoc({
          longitude: data.driverId.currentLocation.coordinates[0],
          latitude: data.driverId.currentLocation.coordinates[1],
        });
      }
    } catch {
      Alert.alert('Error', 'Could not load trip details.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSOS = () => {
    Alert.alert(
      'Emergency SOS',
      'Are you sure you want to trigger emergency SOS? Emergency contacts and dispatch will be notified instantly.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Trigger SOS',
          style: 'destructive',
          onPress: () => {
            socketService.emit('sos:trigger', {
              bookingId,
              location: driverLoc || booking?.pickupLocation?.coordinates,
            });
            Alert.alert('SOS Triggered', 'Emergency alerts sent to support and trusted contacts.');
          },
        },
      ]
    );
  };

  const handleCallDriver = () => {
    const phone = booking?.driverId?.userId?.phone;
    if (phone) Linking.openURL(`tel:${phone}`);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const pickup = booking?.pickupLocation?.coordinates || { latitude: 6.9271, longitude: 79.8612 };
  const drop = booking?.dropLocation?.coordinates;

  return (
    <View style={styles.container}>
      {/* Map View */}
      <MapView
        style={styles.map}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        region={{
          latitude: driverLoc?.latitude || pickup.latitude,
          longitude: driverLoc?.longitude || pickup.longitude,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        }}
        customMapStyle={lightMapStyle}
      >
        <Marker coordinate={pickup} title="Pickup Location" pinColor="green" />
        {drop && <Marker coordinate={drop} title="Destination" pinColor="red" />}
        {driverLoc && (
          <Marker coordinate={driverLoc} title="Driver Position">
            <View style={styles.driverMarker}>
              <Ionicons name="car" size={20} color={COLORS.white} />
            </View>
          </Marker>
        )}
      </MapView>

      {/* Floating Header Controls */}
      <View style={styles.headerControls}>
        <TouchableOpacity style={styles.sosButton} onPress={handleSOS} activeOpacity={0.8}>
          <Text style={styles.sosText}>🆘 SOS</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Info Sheet */}
      <View style={styles.bottomSheet}>
        <View style={styles.statusPill}>
          <View style={styles.pulseDot} />
          <Text style={styles.statusPillText}>
            {status === 'matched' ? 'Driver En Route to Pickup' :
             status === 'driver_arrived' ? 'Driver Has Arrived at Pickup' :
             status === 'trip_started' ? 'Trip in Progress' : 'Trip Completed'}
          </Text>
        </View>

        <View style={styles.driverRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.driverName}>{booking?.driverId?.userId?.fullName || 'Your Driver'}</Text>
            <Text style={styles.vehicleDetails}>
              {booking?.vehicleId?.brand} {booking?.vehicleId?.model} • {booking?.vehicleId?.registrationNumber}
            </Text>
          </View>
          <TouchableOpacity style={styles.callCircle} onPress={handleCallDriver}>
            <Ionicons name="call" size={20} color={COLORS.black} />
          </TouchableOpacity>
        </View>

        <View style={styles.routeCard}>
          <View style={styles.routePoint}>
            <View style={styles.dotGreen} />
            <Text style={styles.routeText} numberOfLines={1}>{booking?.pickupLocation?.address}</Text>
          </View>
          <View style={styles.routeLine} />
          <View style={styles.routePoint}>
            <View style={styles.dotRed} />
            <Text style={styles.routeText} numberOfLines={1}>{booking?.dropLocation?.address}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.background },
  map: { flex: 1 },
  driverMarker: { backgroundColor: COLORS.black, padding: 8, borderRadius: 20, borderWidth: 2, borderColor: COLORS.white },
  headerControls: { position: 'absolute', top: 60, right: SPACING.xl, zIndex: 10 },
  sosButton: { backgroundColor: COLORS.error, paddingHorizontal: 16, paddingVertical: 10, borderRadius: BORDER_RADIUS.full, ...SHADOWS.md },
  sosText: { color: COLORS.white, fontWeight: '900', fontSize: FONT_SIZES.sm },
  bottomSheet: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    paddingBottom: 36,
    borderTopWidth: 1,
    borderTopColor: COLORS.cardBorder,
    ...SHADOWS.lg,
    gap: 16,
  },
  statusPill: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(0,0,0,0.05)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: BORDER_RADIUS.full, alignSelf: 'flex-start' },
  pulseDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.success },
  statusPillText: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: COLORS.textPrimary },
  driverRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  driverName: { fontSize: FONT_SIZES.lg, fontWeight: '800', color: COLORS.textPrimary },
  vehicleDetails: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary, fontWeight: '600', marginTop: 2 },
  callCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.background, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.cardBorder },
  routeCard: { backgroundColor: COLORS.background, padding: SPACING.base, borderRadius: BORDER_RADIUS.md, borderWidth: 1, borderColor: COLORS.cardBorder },
  routePoint: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  dotGreen: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.success },
  dotRed: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.error },
  routeLine: { width: 1, height: 14, backgroundColor: COLORS.cardBorder, marginLeft: 3, marginVertical: 2 },
  routeText: { fontSize: FONT_SIZES.sm, color: COLORS.textPrimary, fontWeight: '600', flex: 1 },
});
