import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
  Dimensions,
} from 'react-native';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { useDispatch } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { setPickupLocation } from '../../store/slices/bookingSlice';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, SHADOWS, GOOGLE_MAPS_API_KEY } from '../../constants';
import { Location as LocationType } from '../../types';

const { width, height } = Dimensions.get('window');

export default function PickupMapScreen({ navigation, route }: any) {
  const { serviceType } = route.params;
  const dispatch = useDispatch();

  const mapRef = useRef<MapView>(null);
  const autocompleteRef = useRef<any>(null);
  const isProgrammaticMove = useRef(false);

  const [region, setRegion] = useState({
    latitude: 6.9271,
    longitude: 79.8612,
    latitudeDelta: 0.005,
    longitudeDelta: 0.005,
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
        latitudeDelta: 0.003,
        longitudeDelta: 0.003,
      };
      setRegion(newRegion);
      mapRef.current?.animateToRegion(newRegion, 800);
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
        const fullAddress = parts.join(', ') || 'Unknown location';
        setAddress(fullAddress);
        
        // Programmatically update autocomplete search bar text
        autocompleteRef.current?.setAddressText(fullAddress);
      }
    } catch {
      const fallback = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
      setAddress(fallback);
      autocompleteRef.current?.setAddressText(fallback);
    } finally {
      setIsGeocoding(false);
    }
  };

  const handleRegionChange = async (newRegion: typeof region) => {
    setRegion(newRegion);
    // Skip reverse geocoding if the move was triggered programmatically from search selection
    if (isProgrammaticMove.current) {
      return;
    }
    await reverseGeocode(newRegion.latitude, newRegion.longitude);
  };

  const handleSelectAutocomplete = (data: any, details: any = null) => {
    if (details) {
      const lat = details.geometry.location.lat;
      const lng = details.geometry.location.lng;

      const newRegion = {
        latitude: lat,
        longitude: lng,
        latitudeDelta: 0.003,
        longitudeDelta: 0.003,
      };

      isProgrammaticMove.current = true;
      setRegion(newRegion);
      setAddress(data.description);
      autocompleteRef.current?.setAddressText(data.description);

      mapRef.current?.animateToRegion(newRegion, 1000);

      // Reset programmatic move after transition finishes
      setTimeout(() => {
        isProgrammaticMove.current = false;
      }, 1200);
    }
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
      {/* Map view */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Finding your location...</Text>
        </View>
      ) : (
        <MapView
          ref={mapRef}
          style={styles.map}
          provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
          initialRegion={region}
          onRegionChangeComplete={handleRegionChange}
          showsUserLocation
          showsMyLocationButton={false}
          customMapStyle={lightMapStyle}
        />
      )}

      {/* Floating Header & Search Bar Overlay */}
      <View style={styles.floatingHeaderContainer}>
        {/* Back Button */}
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.floatingBackButton} activeOpacity={0.8}>
          <Ionicons name="arrow-back" size={24} color="#E65100" />
        </TouchableOpacity>

        {/* Google Places Search */}
        <GooglePlacesAutocomplete
          ref={autocompleteRef}
          placeholder="Search pickup location in Sri Lanka..."
          onPress={handleSelectAutocomplete}
          query={{
            key: GOOGLE_MAPS_API_KEY,
            language: 'en',
            components: 'country:lk', // Restrict queries to Sri Lanka maps only
          }}
          fetchDetails={true}
          enablePoweredByContainer={false}
          debounce={300}
          styles={{
            container: styles.searchContainer,
            textInputContainer: styles.textInputContainer,
            textInput: styles.textInput,
            listView: styles.listView,
            row: styles.resultRow,
            description: styles.resultDescription,
            separator: styles.separator,
          }}
          renderLeftButton={() => <Ionicons name="search" size={18} color="#8E8E93" style={styles.searchIcon} />}
          onFail={(error) => console.error('[PLACES API ERROR - PICKUP]:', error)}
        />
      </View>

      {/* Premium Red Pin Marker at Center */}
      <View style={styles.pinContainer} pointerEvents="none">
        <View style={styles.pinWrapper}>
          <Ionicons name="location" size={46} color="#FF3B30" />
          <View style={styles.pinInnerDot} />
        </View>
        <View style={styles.pinShadow} />
      </View>

      {/* My Location button */}
      <TouchableOpacity style={styles.myLocationButton} onPress={getCurrentLocation} activeOpacity={0.8}>
        <Ionicons name="locate" size={22} color="#E65100" />
      </TouchableOpacity>

      {/* Bottom Info Card */}
      <View style={styles.bottomCard}>
        <View style={styles.locationRow}>
          <View style={styles.locationPulse}>
            <View style={styles.pulseInner} />
          </View>
          <View style={styles.locationInfo}>
            <Text style={styles.locationLabel}>Pickup Location</Text>
            {isGeocoding ? (
              <ActivityIndicator size="small" color={COLORS.primary} style={{ alignSelf: 'flex-start', marginTop: 4 }} />
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
  map: { flex: 1 },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  loadingText: { color: COLORS.textSecondary, fontSize: FONT_SIZES.base, fontWeight: '600' },
  floatingHeaderContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 56 : 40,
    left: 16,
    right: 16,
    zIndex: 100,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  floatingBackButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#FFE0B2',
  },
  searchContainer: {
    flex: 1,
  },
  textInputContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#FFE0B2',
    height: 48,
    alignItems: 'center',
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  textInput: {
    backgroundColor: 'transparent',
    color: '#1C1C1E',
    fontSize: 13,
    height: 40,
    flex: 1,
    fontWeight: '600',
  },
  searchIcon: {
    marginRight: 8,
  },
  listView: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FFE0B2',
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
    overflow: 'hidden',
  },
  resultRow: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  resultDescription: {
    color: '#1C1C1E',
    fontSize: 13,
    fontWeight: '600',
  },
  separator: {
    backgroundColor: '#FFE0B2',
    height: 0.5,
  },
  pinContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 36, // Elevate marker so point is at exact center
  },
  pinInnerDot: {
    position: 'absolute',
    bottom: 4,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
  pinShadow: {
    width: 14,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(0,0,0,0.25)',
    position: 'absolute',
    bottom: height / 2 + 10,
  },
  myLocationButton: {
    position: 'absolute',
    right: 16,
    bottom: 216,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#FFE0B2',
  },
  bottomCard: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
    shadowColor: '#E65100',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 5,
    borderTopWidth: 1,
    borderTopColor: '#FFE0B2',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  locationPulse: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(230, 81, 0, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E65100',
  },
  locationInfo: { flex: 1 },
  locationLabel: { fontSize: 10, color: '#8E8E93', fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.8 },
  locationAddress: { fontSize: 14, fontWeight: '700', color: '#1C1C1E', lineHeight: 20, marginTop: 2 },
  confirmButton: {
    backgroundColor: '#E65100',
    borderRadius: 12,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#E65100',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  confirmButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
});

