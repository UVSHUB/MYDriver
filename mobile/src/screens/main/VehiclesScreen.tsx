import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { vehicleApi } from '../../api';
import { Vehicle } from '../../types';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, SHADOWS } from '../../constants';

export default function VehiclesScreen({ navigation }: any) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadVehicles();
    });
    return unsubscribe;
  }, [navigation]);

  const loadVehicles = async () => {
    try {
      const data = await vehicleApi.getAll();
      setVehicles(data || []);
    } catch {
      Alert.alert('Error', 'Could not load saved vehicles.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert('Remove Vehicle', 'Are you sure you want to remove this vehicle?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          try {
            await vehicleApi.delete(id);
            setVehicles(prev => prev.filter(v => v._id !== id));
          } catch {
            Alert.alert('Error', 'Could not delete vehicle.');
          }
        },
      },
    ]);
  };

  const renderItem = ({ item }: { item: Vehicle }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.iconCircle}>
          <Ionicons name="car-sport" size={24} color={COLORS.black} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.brandTitle}>{item.brand} {item.model}</Text>
          <Text style={styles.plateText}>{item.registrationNumber}</Text>
          <Text style={styles.classText}>{(item.type || 'sedan').toUpperCase()} • {item.color}</Text>
        </View>
        <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(item._id)}>
          <Ionicons name="trash-outline" size={20} color={COLORS.error} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Vehicles</Text>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={vehicles}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="car-outline" size={48} color={COLORS.textMuted} />
              <Text style={styles.emptyText}>No vehicles registered yet</Text>
              <Text style={styles.emptySubText}>Add your personal car to hire a driver anytime.</Text>
            </View>
          }
        />
      )}

      {/* Add Vehicle Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('AddVehicle')}
          activeOpacity={0.85}
        >
          <Ionicons name="add" size={22} color={COLORS.white} />
          <Text style={styles.addButtonText}>Add New Vehicle</Text>
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
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  listContent: { padding: SPACING.xl, gap: 14 },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    ...SHADOWS.sm,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  brandTitle: { fontSize: FONT_SIZES.base, fontWeight: '800', color: COLORS.textPrimary },
  plateText: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.textSecondary, marginTop: 2 },
  classText: { fontSize: 10, color: COLORS.textMuted, marginTop: 4, fontWeight: '700' },
  deleteButton: { padding: 8 },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingTop: 80, gap: 10, paddingHorizontal: 40 },
  emptyText: { fontSize: FONT_SIZES.lg, fontWeight: '800', color: COLORS.textPrimary },
  emptySubText: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 20 },
  footer: { padding: SPACING.xl, paddingBottom: 36 },
  addButton: {
    backgroundColor: COLORS.primary,
    height: 54,
    borderRadius: BORDER_RADIUS.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    ...SHADOWS.md,
  },
  addButtonText: { color: COLORS.white, fontSize: FONT_SIZES.md, fontWeight: '800' },
});
