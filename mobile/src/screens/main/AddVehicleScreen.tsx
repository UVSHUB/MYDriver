import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { vehicleApi } from '../../api';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, SHADOWS } from '../../constants';

const VEHICLE_CLASSES = [
  { id: 'sedan', label: 'Sedan' },
  { id: 'suv', label: 'SUV' },
  { id: 'hatchback', label: 'Hatchback' },
  { id: 'luxury', label: 'Luxury' },
  { id: 'van', label: 'Van' },
];

export default function AddVehicleScreen({ navigation }: any) {
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [color, setColor] = useState('');
  const [vehicleClass, setVehicleClass] = useState('sedan');
  const [isLoading, setIsLoading] = useState(false);

  const handleCreate = async () => {
    if (!brand.trim() || !model.trim() || !registrationNumber.trim() || !color.trim()) {
      Alert.alert('Missing Fields', 'Please fill in all vehicle details.');
      return;
    }

    setIsLoading(true);
    try {
      await vehicleApi.create({
        brand,
        model,
        registrationNumber,
        color,
        type: vehicleClass,
      });
      Alert.alert('Success 🎉', 'Vehicle added successfully!');
      navigation.goBack();
    } catch {
      Alert.alert('Error', 'Failed to add vehicle. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add New Vehicle</Text>
      </View>

      <ScrollView contentContainerStyle={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>MAKE / BRAND</Text>
          <TextInput style={styles.input} value={brand} onChangeText={setBrand} placeholder="e.g. Toyota, Honda, BMW" />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>MODEL</Text>
          <TextInput style={styles.input} value={model} onChangeText={setModel} placeholder="e.g. Camry, Civic, X5" />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>LICENSE PLATE NUMBER</Text>
          <TextInput style={styles.input} value={registrationNumber} onChangeText={setRegistrationNumber} placeholder="e.g. WP CAB-1234" autoCapitalize="characters" />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>COLOR</Text>
          <TextInput style={styles.input} value={color} onChangeText={setColor} placeholder="e.g. Pearl White, Metallic Black" />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>VEHICLE TYPE</Text>
          <View style={styles.classSelector}>
            {VEHICLE_CLASSES.map(item => (
              <TouchableOpacity
                key={item.id}
                style={[styles.classChip, vehicleClass === item.id && styles.classChipActive]}
                onPress={() => setVehicleClass(item.id)}
              >
                <Text style={[styles.classChipText, vehicleClass === item.id && styles.classChipTextActive]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.saveButton} onPress={handleCreate} disabled={isLoading} activeOpacity={0.85}>
          {isLoading ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={styles.saveButtonText}>Save Vehicle</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, justifyContent: 'space-between' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cardBorder,
    gap: 16,
  },
  backButton: { padding: 4 },
  headerTitle: { fontSize: FONT_SIZES.xl, fontWeight: '800', color: COLORS.textPrimary },
  form: { padding: SPACING.xl, gap: 20 },
  inputGroup: { gap: 6 },
  label: { fontSize: 10, fontWeight: '800', color: COLORS.textMuted, letterSpacing: 1 },
  input: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    height: 52,
    paddingHorizontal: SPACING.base,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    fontSize: FONT_SIZES.base,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  classSelector: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  classChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  classChipActive: { backgroundColor: COLORS.black, borderColor: COLORS.black },
  classChipText: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: COLORS.textPrimary },
  classChipTextActive: { color: COLORS.white },
  footer: { padding: SPACING.xl, paddingBottom: 36 },
  saveButton: {
    backgroundColor: COLORS.primary,
    height: 54,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.md,
  },
  saveButtonText: { color: COLORS.white, fontSize: FONT_SIZES.md, fontWeight: '800' },
});
