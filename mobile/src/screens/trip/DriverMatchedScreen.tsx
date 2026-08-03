import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { bookingApi } from '../../api';
import { socketService } from '../../services/socketService';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, SHADOWS } from '../../constants';

export default function DriverMatchedScreen({ navigation, route }: any) {
  const { bookingId } = route.params || {};
  const [booking, setBooking] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadBooking();

    // Socket listener for driver arrival or cancellation
    socketService.on('driver:arrived', () => {
      navigation.replace('LiveTracking', { bookingId });
    });

    socketService.on('trip:started', () => {
      navigation.replace('LiveTracking', { bookingId });
    });

    return () => {
      socketService.off('driver:arrived');
      socketService.off('trip:started');
    };
  }, []);

  const loadBooking = async () => {
    try {
      const data = await bookingApi.getById(bookingId);
      setBooking(data);
    } catch {
      Alert.alert('Error', 'Could not fetch matched driver details.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCallDriver = () => {
    const phone = booking?.driverId?.userId?.phone;
    if (phone) {
      Linking.openURL(`tel:${phone}`);
    } else {
      Alert.alert('Notice', 'Driver phone number unavailable.');
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading driver information...</Text>
      </View>
    );
  }

  const driverUser = booking?.driverId?.userId || {};
  const driver = booking?.driverId || {};

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Header Success Badge */}
        <View style={styles.successBadge}>
          <Ionicons name="checkmark-circle" size={54} color={COLORS.success} />
          <Text style={styles.title}>Driver Assigned!</Text>
          <Text style={styles.subtitle}>Your driver is heading to your pickup location.</Text>
        </View>

        {/* Driver Card */}
        <View style={styles.driverCard}>
          <View style={styles.driverHeader}>
            <View style={styles.avatarContainer}>
              {driverUser.avatar ? (
                <Image source={{ uri: driverUser.avatar }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarInitials}>{driverUser.fullName?.charAt(0) || 'D'}</Text>
                </View>
              )}
            </View>
            <View style={styles.driverMeta}>
              <Text style={styles.driverName}>{driverUser.fullName || 'Professional Driver'}</Text>
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={14} color={COLORS.star} />
                <Text style={styles.ratingText}>{(driver.rating || 5.0).toFixed(1)}</Text>
                <Text style={styles.ratingCount}>({driver.totalTrips || 0} rides)</Text>
              </View>
              <Text style={styles.experience}>{driver.experience || 3} years experience</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Vehicle Info */}
          <View style={styles.vehicleRow}>
            <Ionicons name="car-sport" size={24} color={COLORS.black} />
            <View style={{ flex: 1 }}>
              <Text style={styles.vehicleModel}>{booking?.vehicleId?.brand || 'Toyota'} {booking?.vehicleId?.model || 'Camry'}</Text>
              <Text style={styles.plateNumber}>{booking?.vehicleId?.registrationNumber || 'WP CBA-1234'}</Text>
            </View>
            <Text style={styles.etaBadge}>ETA 4 mins</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.callButton} onPress={handleCallDriver} activeOpacity={0.8}>
            <Ionicons name="call" size={20} color={COLORS.black} />
            <Text style={styles.callButtonText}>Call Driver</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Track Live Location CTA */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.trackButton}
          onPress={() => navigation.replace('LiveTracking', { bookingId })}
          activeOpacity={0.85}
        >
          <Text style={styles.trackButtonText}>Track Live Location →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, justifyContent: 'space-between' },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.background, gap: 12 },
  loadingText: { color: COLORS.textSecondary, fontSize: FONT_SIZES.base },
  content: { paddingHorizontal: SPACING.xl, paddingTop: 64 },
  successBadge: { alignItems: 'center', marginBottom: SPACING['2xl'] },
  title: { fontSize: FONT_SIZES['2xl'], fontWeight: '800', color: COLORS.textPrimary, marginTop: 12 },
  subtitle: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, textAlign: 'center', marginTop: 4 },
  driverCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    ...SHADOWS.md,
  },
  driverHeader: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatarContainer: { width: 60, height: 60, borderRadius: 30, overflow: 'hidden' },
  avatar: { width: 60, height: 60 },
  avatarPlaceholder: { width: 60, height: 60, borderRadius: 30, backgroundColor: COLORS.black, alignItems: 'center', justifyContent: 'center' },
  avatarInitials: { color: COLORS.white, fontSize: FONT_SIZES.xl, fontWeight: '800' },
  driverMeta: { flex: 1 },
  driverName: { fontSize: FONT_SIZES.lg, fontWeight: '800', color: COLORS.textPrimary },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  ratingText: { fontSize: FONT_SIZES.sm, fontWeight: '800', color: COLORS.textPrimary },
  ratingCount: { fontSize: FONT_SIZES.xs, color: COLORS.textMuted },
  experience: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary, marginTop: 2 },
  divider: { height: 1, backgroundColor: COLORS.cardBorder, marginVertical: SPACING.md },
  vehicleRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  vehicleModel: { fontSize: FONT_SIZES.base, fontWeight: '700', color: COLORS.textPrimary },
  plateNumber: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary, fontWeight: '600', marginTop: 2 },
  etaBadge: { backgroundColor: COLORS.black, color: COLORS.white, fontSize: FONT_SIZES.xs, fontWeight: '800', paddingHorizontal: 10, paddingVertical: 6, borderRadius: BORDER_RADIUS.sm, overflow: 'hidden' },
  actionRow: { marginTop: SPACING.xl, flexDirection: 'row', gap: 12 },
  callButton: { flex: 1, height: 50, borderRadius: BORDER_RADIUS.md, borderWidth: 1, borderColor: COLORS.cardBorder, backgroundColor: COLORS.surface, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  callButtonText: { color: COLORS.black, fontSize: FONT_SIZES.base, fontWeight: '700' },
  footer: { padding: SPACING.xl, paddingBottom: 36 },
  trackButton: { backgroundColor: COLORS.primary, height: 54, borderRadius: BORDER_RADIUS.md, alignItems: 'center', justifyContent: 'center', ...SHADOWS.md },
  trackButtonText: { color: COLORS.white, fontSize: FONT_SIZES.md, fontWeight: '800' },
});
