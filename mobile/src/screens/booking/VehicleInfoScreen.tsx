import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  TextInput,
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
  const [isSaving, setIsSaving] = useState(false);

  // Custom text input states
  const [customName, setCustomName] = useState('');
  const [customPlate, setCustomPlate] = useState('');

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
        setCustomName(`${defaultV.brand} ${defaultV.model}`);
        setCustomPlate(defaultV.registrationNumber);
      }
    } catch (error) {
      console.log('Could not load vehicles');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelect = (vehicle: Vehicle) => {
    setSelectedId(vehicle._id);
    dispatch(setVehicle(vehicle._id));
    setCustomName(`${vehicle.brand} ${vehicle.model}`);
    setCustomPlate(vehicle.registrationNumber);
  };

  const handleNext = async () => {
    if (!customName.trim() || !customPlate.trim()) {
      Alert.alert('Vehicle Info Required', 'Please enter your vehicle name and number plate.');
      return;
    }

    setIsSaving(true);
    let vehicleIdToUse = selectedId;

    try {
      // Check if there is an existing vehicle that matches the brand/model & plate
      const matchingSavedVehicle = vehicles.find(
        (v) =>
          `${v.brand} ${v.model}`.toLowerCase() === customName.trim().toLowerCase() &&
          v.registrationNumber.toLowerCase() === customPlate.trim().toLowerCase()
      );

      if (matchingSavedVehicle) {
        vehicleIdToUse = matchingSavedVehicle._id;
      } else {
        // Parse brand/model
        const nameParts = customName.trim().split(' ');
        const brand = nameParts[0] || 'Custom';
        const model = nameParts.slice(1).join(' ') || brand;

        // Create new vehicle on the backend
        const newVehicle = await vehicleApi.create({
          brand,
          model,
          registrationNumber: customPlate.trim().toUpperCase(),
          color: 'Black',
          type: 'sedan',
          isDefault: vehicles.length === 0,
        });

        vehicleIdToUse = newVehicle._id;
        setVehicles((prev) => [...prev, newVehicle]);
      }

      dispatch(setVehicle(vehicleIdToUse as string));

      // Calculate distance/fare estimates
      const distance = Math.random() * 15 + 2; // 2-17 km
      const duration = Math.round(distance * 3 + 10); // rough estimate

      const BASE_RATES: Record<string, number> = {
        drive_me_home: 150,
        hire_driver: 200,
        emergency: 250,
        airport: 180,
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
        vehicleId: vehicleIdToUse,
        estimatedDistance: Math.round(distance * 10) / 10,
        estimatedDuration: duration,
      });
    } catch (error) {
      Alert.alert('Error', 'Could not save vehicle info. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const VEHICLE_ICONS: Record<string, string> = {
    sedan: '🚗',
    suv: '🚙',
    van: '🚐',
    truck: '🚚',
    luxury: '🏎️',
    other: '🚘',
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} activeOpacity={0.8}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Vehicle Details</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.subtitle}>Enter the vehicle details the driver will operate</Text>

        {/* TextInput Form for Fast Custom Entry */}
        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Vehicle Name (Brand & Model)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Toyota Prius"
              placeholderTextColor="#8E8E93"
              value={customName}
              onChangeText={(text) => {
                setCustomName(text);
                // Reset selectedId if they start typing manually (unless it matches a selection)
                if (selectedId) setSelectedId(null);
              }}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Number Plate</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. WP CAD-1234"
              placeholderTextColor="#8E8E93"
              value={customPlate}
              onChangeText={(text) => {
                setCustomPlate(text);
                if (selectedId) setSelectedId(null);
              }}
              autoCapitalize="characters"
            />
          </View>
        </View>

        {/* Saved Vehicles Section (Only if user has registered vehicles) */}
        {isLoading ? (
          <ActivityIndicator color={COLORS.primary} style={{ marginTop: 24 }} />
        ) : (
          vehicles.length > 0 && (
            <View style={styles.savedSection}>
              <Text style={styles.savedTitle}>Or Choose a Saved Vehicle</Text>
              <View style={styles.vehicleList}>
                {vehicles.map((vehicle) => {
                  const isSelected = selectedId === vehicle._id;
                  return (
                    <TouchableOpacity
                      key={vehicle._id}
                      style={[
                        styles.vehicleCard,
                        isSelected && styles.vehicleCardSelected,
                      ]}
                      onPress={() => handleSelect(vehicle)}
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
                        </View>
                      </View>
                      <View style={[
                        styles.radioOuter,
                        isSelected && { borderColor: COLORS.primary },
                      ]}>
                        {isSelected && <View style={styles.radioInner} />}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )
        )}
      </ScrollView>

      {/* Footer Continue Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.nextButton,
            (!customName.trim() || !customPlate.trim()) && styles.nextButtonDisabled,
          ]}
          onPress={handleNext}
          disabled={isSaving || !customName.trim() || !customPlate.trim()}
          activeOpacity={0.9}
        >
          {isSaving ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.nextButtonText}>Search Driver →</Text>
          )}
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
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  backIcon: { fontSize: 20, color: COLORS.primary },
  title: { fontSize: FONT_SIZES.lg, fontWeight: '800', color: COLORS.textPrimary, letterSpacing: -0.5 },
  content: { paddingHorizontal: SPACING.xl, paddingBottom: 120 },
  subtitle: { fontSize: 13, color: COLORS.textSecondary, marginBottom: SPACING.lg },
  formContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#FFE0B2',
    padding: 16,
    marginBottom: 24,
    shadowColor: '#E65100',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#FFE0B2',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 14,
    color: '#1C1C1E',
    backgroundColor: '#FAF9F6',
  },
  savedSection: {
    marginTop: 8,
  },
  savedTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 14,
    letterSpacing: -0.2,
  },
  vehicleList: { gap: 12 },
  vehicleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.base,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    shadowColor: '#E65100',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  vehicleCardSelected: { borderColor: COLORS.primary, borderWidth: 1.5 },
  vehicleIconBg: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  vehicleIcon: { fontSize: 22 },
  vehicleInfo: { flex: 1 },
  vehicleName: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary },
  vehicleReg: { fontSize: 12, color: COLORS.primary, fontWeight: '600', marginTop: 3 },
  vehicleMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  colorDot: { width: 8, height: 8, borderRadius: 4 },
  vehicleColor: { fontSize: 11, color: COLORS.textSecondary },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: COLORS.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.primary },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: SPACING.xl,
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderTopColor: COLORS.cardBorder,
  },
  nextButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#E65100',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  nextButtonDisabled: { backgroundColor: COLORS.surfaceLight, shadowOpacity: 0, elevation: 0 },
  nextButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
});

