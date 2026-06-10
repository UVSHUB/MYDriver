import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { setVehicle, setTripEstimate } from '../../store/slices/bookingSlice';
import { vehicleApi } from '../../api';
import { Vehicle } from '../../types';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, SHADOWS } from '../../constants';

export default function VehicleInfoScreen({ navigation, route }: any) {
  const { serviceType, pickupLocation, dropLocation } = route.params;
  const dispatch = useDispatch<AppDispatch>();
  const { selectedVehicleId } = useSelector((state: RootState) => state.booking);

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(selectedVehicleId);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    try {
      const data = await vehicleApi.getAll();
      setVehicles(data);
      if (data.length > 0 && !selectedId) {
        const defaultV = data.find((v: Vehicle) => v.isDefault) || data[0];
        setSelectedId(defaultV._id);
        dispatch(setVehicle(defaultV._id));
      }
    } catch (error) {
      Alert.alert('Error', 'Could not load your vehicles.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelect = (id: string) => {
    setSelectedId(id);
    dispatch(setVehicle(id));
  };

  const handleNext = async () => {
    if (!selectedId) {
      Alert.alert('Select Vehicle', 'Please select or add a vehicle.');
      return;
    }

    // Estimate distance (placeholder - in production use Google Directions API)
    const distance = Math.random() * 15 + 2; // 2-17 km
    const duration = Math.round(distance * 3 + 10); // rough estimate

    const BASE_RATES: Record<string, number> = {
      drive_me_home: 150, hire_driver: 200, emergency: 250, airport: 180,
    };
    const driverFee = Math.round((BASE_RATES[serviceType] || 150) + distance * 50);
    const platformFee = Math.round(driverFee * 0.1);
    const totalCost = driverFee + platformFee;

    dispatch(setTripEstimate({
      distance: Math.round(distance * 10) / 10,
      duration,
      driverFee,
      platformFee,
      totalCost,
    }));

    navigation.navigate('TripSummary', {
      serviceType,
      pickupLocation,
      dropLocation,
      vehicleId: selectedId,
      estimatedDistance: Math.round(distance * 10) / 10,
      estimatedDuration: duration,
    });
  };

  const VEHICLE_ICONS: Record<string, string> = {
    sedan: '🚗', suv: '🚙', van: '🚐', truck: '🚚', luxury: '🏎️', other: '🚘',
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Your Vehicle</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('Profile', { screen: 'Vehicles' })}
          style={styles.addButton}
        >
          <Text style={styles.addButtonText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.subtitle}>Select the vehicle the driver will operate</Text>

        {isLoading ? (
          <ActivityIndicator color={COLORS.primary} style={{ marginTop: 40 }} />
        ) : vehicles.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🚗</Text>
            <Text style={styles.emptyTitle}>No vehicles yet</Text>
            <Text style={styles.emptySubtitle}>Add your vehicle to continue</Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => navigation.navigate('Profile', { screen: 'AddVehicle' })}
            >
              <Text style={styles.emptyButtonText}>Add Vehicle</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.vehicleList}>
            {vehicles.map((vehicle) => (
              <TouchableOpacity
                key={vehicle._id}
                style={[
                  styles.vehicleCard,
                  selectedId === vehicle._id && styles.vehicleCardSelected,
                ]}
                onPress={() => handleSelect(vehicle._id)}
                activeOpacity={0.85}
              >
                <View style={styles.vehicleIconBg}>
                  <Text style={styles.vehicleIcon}>{VEHICLE_ICONS[vehicle.type] || '🚗'}</Text>
                </View>
                <View style={styles.vehicleInfo}>
                  <Text style={styles.vehicleName}>{vehicle.brand} {vehicle.model}</Text>
                  <Text style={styles.vehicleReg}>{vehicle.registrationNumber}</Text>
                  <View style={styles.vehicleMeta}>
                    <View style={[styles.colorDot, { backgroundColor: vehicle.color.toLowerCase() }]} />
                    <Text style={styles.vehicleColor}>{vehicle.color}</Text>
                    {vehicle.year && <Text style={styles.vehicleYear}>· {vehicle.year}</Text>}
                  </View>
                </View>
                {vehicle.isDefault && (
                  <View style={styles.defaultBadge}>
                    <Text style={styles.defaultBadgeText}>Default</Text>
                  </View>
                )}
                <View style={[
                  styles.radioOuter,
                  selectedId === vehicle._id && { borderColor: COLORS.primary },
                ]}>
                  {selectedId === vehicle._id && <View style={styles.radioInner} />}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.nextButton, !selectedId && styles.nextButtonDisabled]}
          onPress={handleNext}
          disabled={!selectedId}
        >
          <Text style={styles.nextButtonText}>Continue →</Text>
        </TouchableOpacity>
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
    width: 40, height: 40, borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center',
  },
  backIcon: { fontSize: 20, color: COLORS.black },
  title: { fontSize: FONT_SIZES.lg, fontWeight: '800', color: COLORS.textPrimary },
  addButton: {
    backgroundColor: COLORS.primary, borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: 14, paddingVertical: 8,
  },
  addButtonText: { color: COLORS.white, fontSize: FONT_SIZES.sm, fontWeight: '700' },
  content: { paddingHorizontal: SPACING.xl, paddingBottom: 100 },
  subtitle: { fontSize: FONT_SIZES.base, color: COLORS.textSecondary, marginBottom: SPACING.lg },
  vehicleList: { gap: 12 },
  vehicleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.base,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    ...SHADOWS.sm,
  },
  vehicleCardSelected: { borderColor: COLORS.primary, borderWidth: 2 },
  vehicleIconBg: {
    width: 52, height: 52, borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.surfaceLight, alignItems: 'center', justifyContent: 'center', marginRight: 14,
  },
  vehicleIcon: { fontSize: 26 },
  vehicleInfo: { flex: 1 },
  vehicleName: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.textPrimary },
  vehicleReg: { fontSize: FONT_SIZES.sm, color: COLORS.primary, fontWeight: '600', marginTop: 3 },
  vehicleMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  colorDot: { width: 10, height: 10, borderRadius: 5 },
  vehicleColor: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary },
  vehicleYear: { fontSize: FONT_SIZES.xs, color: COLORS.textMuted },
  defaultBadge: {
    backgroundColor: `${COLORS.secondary}20`, borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: 8, paddingVertical: 3, marginRight: 10,
  },
  defaultBadgeText: { color: COLORS.secondary, fontSize: 9, fontWeight: '700' },
  radioOuter: {
    width: 22, height: 22, borderRadius: 11, borderWidth: 2,
    borderColor: COLORS.cardBorder, alignItems: 'center', justifyContent: 'center',
  },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.primary },
  emptyState: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyEmoji: { fontSize: 64 },
  emptyTitle: { fontSize: FONT_SIZES.xl, fontWeight: '700', color: COLORS.textPrimary },
  emptySubtitle: { fontSize: FONT_SIZES.base, color: COLORS.textSecondary },
  emptyButton: {
    backgroundColor: COLORS.primary, borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.xl, paddingVertical: 14, marginTop: 8,
  },
  emptyButtonText: { color: COLORS.white, fontSize: FONT_SIZES.base, fontWeight: '700' },
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0, padding: SPACING.xl,
    backgroundColor: COLORS.background, borderTopWidth: 1, borderTopColor: COLORS.cardBorder,
  },
  nextButton: {
    backgroundColor: COLORS.primary, borderRadius: BORDER_RADIUS.lg,
    height: 56, alignItems: 'center', justifyContent: 'center', ...SHADOWS.lg,
  },
  nextButtonDisabled: { backgroundColor: COLORS.surfaceLight },
  nextButtonText: { color: COLORS.white, fontSize: FONT_SIZES.md, fontWeight: '700' },
});
