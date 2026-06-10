import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { useDispatch } from 'react-redux';
import { setDropLocation } from '../../store/slices/bookingSlice';
import { Location } from '../../types';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, GOOGLE_MAPS_API_KEY } from '../../constants';

const RECENT_SEARCHES = [
  { id: '1', name: 'Bandaranaike International Airport', address: 'Katunayake, Sri Lanka', emoji: '✈️' },
  { id: '2', name: 'Colombo City Center', address: 'Fort, Colombo 01', emoji: '🏙️' },
  { id: '3', name: 'Galle Face Hotel', address: 'Galle Face, Colombo 03', emoji: '🏨' },
];

export default function DestinationScreen({ navigation, route }: any) {
  const { serviceType, pickupLocation } = route.params;
  const dispatch = useDispatch();

  const handleSelect = (location: Location) => {
    dispatch(setDropLocation(location));
    navigation.navigate('VehicleInfo', {
      serviceType,
      pickupLocation,
      dropLocation: location,
    });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Set Destination</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Google Places Autocomplete */}
      <GooglePlacesAutocomplete
        placeholder="Search for a destination..."
        onPress={(data, details = null) => {
          const location: Location = {
            address: data.description,
            coordinates: {
              latitude: details?.geometry?.location?.lat || 0,
              longitude: details?.geometry?.location?.lng || 0,
            },
            placeId: data.place_id,
          };
          handleSelect(location);
        }}
        query={{
          key: GOOGLE_MAPS_API_KEY,
          language: 'en',
          components: 'country:lk',
        }}
        fetchDetails
        styles={{
          container: styles.autocompleteContainer,
          textInputContainer: styles.textInputContainer,
          textInput: styles.textInput,
          listView: styles.listView,
          row: styles.resultRow,
          description: styles.resultDescription,
          separator: styles.separator,
        }}
        renderLeftButton={() => <Text style={styles.searchIcon}>🔍</Text>}
        enablePoweredByContainer={false}
        nearbyPlacesAPI="GooglePlacesSearch"
        debounce={300}
      />

      {/* Recent Searches */}
      <View style={styles.recentSection}>
        <Text style={styles.recentTitle}>Recent Searches</Text>
        {RECENT_SEARCHES.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.recentItem}
            onPress={() => handleSelect({
              address: `${item.name}, ${item.address}`,
              coordinates: { latitude: 6.9271, longitude: 79.8612 }, // placeholder
            })}
          >
            <View style={styles.recentIconBg}>
              <Text style={styles.recentEmoji}>{item.emoji}</Text>
            </View>
            <View style={styles.recentInfo}>
              <Text style={styles.recentName}>{item.name}</Text>
              <Text style={styles.recentAddress}>{item.address}</Text>
            </View>
            <Text style={styles.recentArrow}>→</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.xl,
    paddingTop: 60,
    paddingBottom: SPACING.md,
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
  title: { fontSize: FONT_SIZES.lg, fontWeight: '800', color: COLORS.textPrimary },
  autocompleteContainer: {
    paddingHorizontal: SPACING.xl,
    zIndex: 10,
  },
  textInputContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
  },
  textInput: {
    backgroundColor: 'transparent',
    color: COLORS.textPrimary,
    fontSize: FONT_SIZES.base,
    height: 50,
    flex: 1,
  },
  searchIcon: { fontSize: 18, marginRight: 6 },
  listView: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    marginTop: 4,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    overflow: 'hidden',
  },
  resultRow: {
    backgroundColor: COLORS.surface,
    paddingVertical: 14,
    paddingHorizontal: SPACING.base,
  },
  resultDescription: {
    color: COLORS.textPrimary,
    fontSize: FONT_SIZES.base,
  },
  separator: { backgroundColor: COLORS.cardBorder, height: 1 },
  recentSection: {
    paddingHorizontal: SPACING.xl,
    marginTop: SPACING.xl,
  },
  recentTitle: {
    fontSize: FONT_SIZES.base,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.base,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  recentIconBg: {
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  recentEmoji: { fontSize: 22 },
  recentInfo: { flex: 1 },
  recentName: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.textPrimary },
  recentAddress: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary, marginTop: 2 },
  recentArrow: { color: COLORS.textMuted, fontSize: 16 },
});
