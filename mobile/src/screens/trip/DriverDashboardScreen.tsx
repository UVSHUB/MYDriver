import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Alert,
  Modal,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { RootState } from '../../store';
import { setUserMode } from '../../store/slices/authSlice';
import { driverApi } from '../../api';
import { socketService } from '../../services/socketService';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, SHADOWS } from '../../constants';

const { height } = Dimensions.get('window');

const lightMapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#f5f5f5' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#ffffff' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#616161' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#e9e9e9' }] },
];

export default function DriverDashboardScreen({ navigation }: any) {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);

  const [isOnline, setIsOnline] = useState(false);
  const [coordinates, setCoordinates] = useState({ latitude: 6.9271, longitude: 79.8612 });
  const [incomingRequest, setIncomingRequest] = useState<any>(null);
  const [isAccepting, setIsAccepting] = useState(false);
  const locationSubscription = useRef<Location.LocationSubscription | null>(null);

  // Countdown timer for incoming request
  const [countdown, setCountdown] = useState(15);
  const [stats, setStats] = useState({
    earnings: 24500,
    trips: 18,
    rating: 4.9,
  });

  useEffect(() => {
    let timer: any;
    if (incomingRequest) {
      setCountdown(15);
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setIncomingRequest(null);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [incomingRequest]);

  useEffect(() => {
    // Connect to sockets
    const initSocket = async () => {
      try {
        await socketService.connect();
        
        // Listen for new booking offers
        socketService.on('booking:new-request', (data: any) => {
          console.log('[Socket] Incoming ride offer:', data.booking);
          if (isOnline) {
            setIncomingRequest(data.booking);
          }
        });
      } catch (err) {
        console.error('Socket connection error:', err);
      }
    };

    initSocket();

    return () => {
      stopLocationTracking();
      socketService.off('booking:new-request');
    };
  }, [isOnline]);

  const handleOnlineToggle = async (value: boolean) => {
    setIsOnline(value);
    try {
      await driverApi.updateAvailability(value);
      if (value) {
        await startLocationTracking();
      } else {
        stopLocationTracking();
      }
    } catch (error) {
      setIsOnline(!value);
      Alert.alert('Status Error', 'Could not update online status.');
    }
  };

  const startLocationTracking = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required to accept rides.');
        setIsOnline(false);
        return;
      }

      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const currentCoords = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
      setCoordinates(currentCoords);

      // Emit initial location
      socketService.emit('driver:update-location', {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });

      // Subscribe to location updates
      locationSubscription.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000,
          distanceInterval: 10,
        },
        (updatedLoc) => {
          const newCoords = { latitude: updatedLoc.coords.latitude, longitude: updatedLoc.coords.longitude };
          setCoordinates(newCoords);
          
          // Send location updates to backend socket
          socketService.emit('driver:update-location', {
            latitude: updatedLoc.coords.latitude,
            longitude: updatedLoc.coords.longitude,
          });
        }
      );
    } catch (error) {
      console.error('Error starting location tracking:', error);
    }
  };

  const stopLocationTracking = () => {
    if (locationSubscription.current) {
      locationSubscription.current.remove();
      locationSubscription.current = null;
    }
  };

  const handleAcceptRide = async () => {
    if (!incomingRequest) return;
    setIsAccepting(true);

    try {
      // Find driver ID from state or details
      const profile = await driverApi.getDetails(user?._id || '');
      const driverId = profile._id;

      // Emit accept to sockets
      socketService.emit('driver:accept-booking', {
        bookingId: incomingRequest._id,
        driverId,
      });

      const acceptedBookingId = incomingRequest._id;
      setIncomingRequest(null);
      setIsAccepting(false);
      
      // Navigate to active trip screen
      navigation.navigate('ActiveTrip', { bookingId: acceptedBookingId });
    } catch (error) {
      setIsAccepting(false);
      Alert.alert('Acceptance Error', 'Could not accept this trip.');
    }
  };

  return (
    <View style={styles.container}>
      {/* Top Header Controls */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.modeToggle} onPress={() => dispatch(setUserMode('customer'))}>
          <Ionicons name="swap-horizontal" size={16} color={COLORS.black} style={{ marginRight: 6 }} />
          <Text style={styles.modeToggleText}>Passenger Mode</Text>
        </TouchableOpacity>

        <View style={styles.statusToggle}>
          <Text style={[styles.statusLabel, isOnline && styles.statusOnlineText]}>
            {isOnline ? 'ONLINE' : 'OFFLINE'}
          </Text>
          <Switch
            value={isOnline}
            onValueChange={handleOnlineToggle}
            trackColor={{ false: COLORS.surfaceLight, true: '#34C759' }}
            thumbColor={COLORS.white}
          />
        </View>
      </View>

      {/* Map View */}
      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        region={{
          ...coordinates,
          latitudeDelta: 0.015,
          longitudeDelta: 0.015,
        }}
        customMapStyle={lightMapStyle}
        showsUserLocation
        showsMyLocationButton={false}
      >
        {isOnline && (
          <Marker coordinate={coordinates} title="Your Location">
            <View style={styles.markerContainer}>
              <View style={styles.markerOutline} />
              <View style={styles.markerDot} />
            </View>
          </Marker>
        )}
      </MapView>

      {/* Earnings & Stats Panel */}
      <View style={styles.statsPanel}>
        <Text style={styles.statsTitle}>TODAY'S OVERVIEW</Text>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Earnings</Text>
            <Text style={styles.statValue}>LKR {stats.earnings.toLocaleString()}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Trips</Text>
            <Text style={styles.statValue}>{stats.trips}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Rating</Text>
            <Text style={styles.statValue}>⭐ {stats.rating}</Text>
          </View>
        </View>
      </View>

      {/* Incoming Ride request sheet */}
      <Modal visible={!!incomingRequest} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            
            <Text style={styles.offerTitle}>Incoming Ride Offer</Text>
            
            {incomingRequest && (
              <View style={styles.offerDetails}>
                <View style={styles.passengerRow}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                      {incomingRequest.customerId?.fullName?.charAt(0) || 'P'}
                    </Text>
                  </View>
                  <View>
                    <Text style={styles.passengerName}>
                      {incomingRequest.customerId?.fullName || 'Passenger'}
                    </Text>
                    <Text style={styles.serviceType}>
                      {incomingRequest.serviceType?.toUpperCase().replace(/_/g, ' ')}
                    </Text>
                  </View>
                  <Text style={styles.offerFare}>LKR {incomingRequest.totalCost}</Text>
                </View>

                {/* Locations */}
                <View style={styles.routeContainer}>
                  <View style={styles.routeRow}>
                    <View style={styles.dotGreen} />
                    <Text style={styles.addressText} numberOfLines={1}>
                      {incomingRequest.pickupLocation?.address}
                    </Text>
                  </View>
                  <View style={styles.line} />
                  <View style={styles.routeRow}>
                    <View style={styles.dotRed} />
                    <Text style={styles.addressText} numberOfLines={1}>
                      {incomingRequest.dropLocation?.address}
                    </Text>
                  </View>
                </View>

                <View style={styles.buttonsRow}>
                  <TouchableOpacity 
                    style={styles.declineButton} 
                    onPress={() => setIncomingRequest(null)}
                    disabled={isAccepting}
                  >
                    <Text style={styles.declineText}>Decline</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={styles.acceptButton} 
                    onPress={handleAcceptRide}
                    disabled={isAccepting}
                  >
                    {isAccepting ? (
                      <ActivityIndicator color={COLORS.white} />
                    ) : (
                      <Text style={styles.acceptText}>Accept Offer</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    position: 'absolute',
    top: 60,
    left: SPACING.xl,
    right: SPACING.xl,
    zIndex: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modeToggle: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    ...SHADOWS.sm,
    alignItems: 'center',
  },
  modeToggleText: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.black },
  statusToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    ...SHADOWS.sm,
  },
  statusLabel: { fontSize: 10, fontWeight: '800', color: COLORS.textSecondary, marginRight: 8 },
  statusOnlineText: { color: '#34C759' },
  map: { flex: 1 },
  markerContainer: { alignItems: 'center', justifyContent: 'center' },
  markerOutline: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.15)', alignItems: 'center', justifyContent: 'center',
  },
  markerDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: COLORS.black },
  statsPanel: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    paddingBottom: 36,
    borderTopWidth: 1,
    borderTopColor: COLORS.cardBorder,
    ...SHADOWS.lg,
  },
  statsTitle: { fontSize: 9, fontWeight: '800', color: COLORS.textMuted, letterSpacing: 1, marginBottom: 12 },
  statsRow: { flexDirection: 'row', alignItems: 'center' },
  statCard: { flex: 1, gap: 4 },
  statLabel: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary, fontWeight: '600' },
  statValue: { fontSize: FONT_SIZES.md, fontWeight: '800', color: COLORS.black },
  statDivider: { width: 1, height: 32, backgroundColor: COLORS.cardBorder, marginHorizontal: 12 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.45)', justifyContent: 'flex-end' },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: SPACING.xl,
    paddingBottom: 40,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  modalHandle: {
    width: 36, height: 4, borderRadius: 2,
    backgroundColor: COLORS.cardBorder, alignSelf: 'center', marginVertical: 12,
  },
  offerTitle: { fontSize: FONT_SIZES.lg, fontWeight: '900', color: COLORS.black, textAlign: 'center', marginBottom: 20 },
  offerDetails: { gap: 16 },
  passengerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: FONT_SIZES.lg, color: COLORS.black, fontWeight: '800' },
  passengerName: { fontSize: FONT_SIZES.base, fontWeight: '800', color: COLORS.black },
  serviceType: { fontSize: 10, color: COLORS.textSecondary, fontWeight: '700', marginTop: 2 },
  offerFare: { fontSize: FONT_SIZES.lg, fontWeight: '900', color: COLORS.black, marginLeft: 'auto' },
  routeContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.base,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  routeRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  dotGreen: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.success },
  dotRed: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.error },
  line: { width: 1, height: 16, backgroundColor: COLORS.cardBorder, marginLeft: 3, marginVertical: 4 },
  addressText: { fontSize: FONT_SIZES.sm, color: COLORS.textPrimary, fontWeight: '600' },
  buttonsRow: { flexDirection: 'row', gap: 12, marginTop: 12 },
  declineButton: {
    flex: 1, height: 54, borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: COLORS.cardBorder,
  },
  declineText: { color: COLORS.black, fontSize: FONT_SIZES.base, fontWeight: '700' },
  acceptButton: {
    flex: 2, height: 54, borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center',
  },
  acceptText: { color: COLORS.white, fontSize: FONT_SIZES.base, fontWeight: '800' },
});
