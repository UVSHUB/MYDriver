import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { useDispatch } from 'react-redux';
import { setPickupLocation } from '../../store/slices/bookingSlice';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, SHADOWS, GOOGLE_MAPS_API_KEY } from '../../constants';
import { Location as LocationType } from '../../types';

export default function PickupMapScreen({ navigation, route }: any) {
  const { serviceType } = route.params;
  const dispatch = useDispatch();

  const [region, setRegion] = useState({
    latitude: 6.9271,
    longitude: 79.8612,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });
  const [address, setAddress] = useState('Getting your location...');
  const [isLoading, setIsLoading] = useState(true);
  const [isGeocoding, setIsGeocoding] = useState(false);

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is needed to find your position.');
        setIsLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const newRegion = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      };
      setRegion(newRegion);
      await reverseGeocode(location.coords.latitude, location.coords.longitude);
    } catch (error) {
      Alert.alert('Location Error', 'Could not get your location. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const reverseGeocode = async (latitude: number, longitude: number) => {
    setIsGeocoding(true);
    try {
      const results = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (results.length > 0) {
        const r = results[0];
        const parts = [r.name, r.street, r.district, r.city].filter(Boolean);
        setAddress(parts.join(', ') || 'Unknown location');
      }
    } catch {
      setAddress(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
    } finally {
      setIsGeocoding(false);
    }
  };

  const handleRegionChange = async (newRegion: typeof region) => {
    setRegion(newRegion);
    await reverseGeocode(newRegion.latitude, newRegion.longitude);
  };

  const handleConfirmLocation = () => {
    const location: LocationType = {
      address,
      coordinates: {
        latitude: region.latitude,
        longitude: region.longitude,
      },
    };
    dispatch(setPickupLocation(location));
    navigation.navigate('Destination', { serviceType, pickupLocation: location });
  };

  return (
    <View style={styles.container}>
      {/* Header overlay */}
      <View style={styles.headerOverlay}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Set Pickup Location</Text>
      </View>

      {/* Map */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Finding your location...</Text>
        </View>
      ) : (
        <MapView
          style={styles.map}
          provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
          region={region}
          onRegionChangeComplete={handleRegionChange}
          showsUserLocation
          showsMyLocationButton={false}
          customMapStyle={lightMapStyle}
        />
      )}

      {/* Center pin */}
      <View style={styles.pinContainer} pointerEvents="none">
        <View style={styles.pin}>
          <Text style={styles.pinEmoji}>📍</Text>
        </View>
        <View style={styles.pinShadow} />
      </View>

      {/* My Location button */}
      <TouchableOpacity style={styles.myLocationButton} onPress={getCurrentLocation}>
        <Text style={styles.myLocationIcon}>🎯</Text>
      </TouchableOpacity>

      {/* Bottom card */}
      <View style={styles.bottomCard}>
        <View style={styles.locationRow}>
          <View style={styles.locationDot} />
          <View style={styles.locationInfo}>
            <Text style={styles.locationLabel}>Pickup Location</Text>
            {isGeocoding ? (
              <ActivityIndicator size="small" color={COLORS.primary} />
            ) : (
              <Text style={styles.locationAddress} numberOfLines={2}>{address}</Text>
            )}
          </View>
        </View>
        <TouchableOpacity style={styles.confirmButton} onPress={handleConfirmLocation} activeOpacity={0.85}>
          <Text style={styles.confirmButtonText}>Confirm Pickup →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const lightMapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#f5f5f5' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#ffffff' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#616161' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#e9e9e9' }] },
];

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingTop: 60,
    paddingBottom: SPACING.md,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cardBorder,
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: { fontSize: 20, color: COLORS.black },
  headerTitle: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: COLORS.textPrimary },
  map: { flex: 1 },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  loadingText: { color: COLORS.textSecondary, fontSize: FONT_SIZES.base },
  pinContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pin: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: -12,
  },
  pinEmoji: { fontSize: 42 },
  pinShadow: {
    width: 16,
    height: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  myLocationButton: {
    position: 'absolute',
    right: SPACING.xl,
    bottom: 220,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.md,
  },
  myLocationIcon: { fontSize: 22 },
  bottomCard: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    paddingBottom: 36,
    borderTopWidth: 1,
    borderTopColor: COLORS.cardBorder,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.base,
    gap: 12,
  },
  locationDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.secondary,
    marginTop: 4,
  },
  locationInfo: { flex: 1 },
  locationLabel: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary, fontWeight: '600', marginBottom: 4 },
  locationAddress: { fontSize: FONT_SIZES.base, fontWeight: '600', color: COLORS.textPrimary, lineHeight: 22 },
  confirmButton: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.lg,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.lg,
  },
  confirmButtonText: { color: COLORS.white, fontSize: FONT_SIZES.md, fontWeight: '700' },
});
