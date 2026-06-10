import React, { useState } from 'react';
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
import { Ionicons } from '@expo/vector-icons';
import { RootState, AppDispatch } from '../../store';
import { setActiveBooking } from '../../store/slices/bookingSlice';
import { bookingApi } from '../../api';
import { SERVICE_TYPES, COLORS, FONT_SIZES, SPACING, BORDER_RADIUS } from '../../constants';

export default function TripSummaryScreen({ navigation, route }: any) {
  const { serviceType, pickupLocation, dropLocation, vehicleId, estimatedDistance, estimatedDuration } = route.params;
  const dispatch = useDispatch<AppDispatch>();
  const { driverFee, platformFee, totalCost } = useSelector((state: RootState) => state.booking);

  const [paymentMethod, setPaymentMethod] = useState<'wallet' | 'payhere'>('wallet');
  const [isLoading, setIsLoading] = useState(false);

  const service = SERVICE_TYPES.find(s => s.id === serviceType);

  const handleConfirmBooking = async () => {
    setIsLoading(true);
    try {
      const booking = await bookingApi.create({
        vehicleId,
        serviceType,
        pickupLocation,
        dropLocation,
        estimatedDistance,
        estimatedDuration,
        paymentMethod,
      });

      dispatch(setActiveBooking(booking));
      navigation.navigate('TripFlow', { screen: 'Searching', params: { bookingId: booking._id } });
    } catch (error: any) {
      Alert.alert('Booking Failed', error.response?.data?.message || 'Could not create booking. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (minutes: number): string => {
    if (minutes < 60) return `${minutes} min`;
    return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
  };

  const PAYMENT_METHODS = [
    { id: 'wallet' as const, label: 'Wallet Balance', iconName: 'card-outline' as const, desc: 'Deduct directly from your wallet' },
    { id: 'payhere' as const, label: 'PayHere (Sri Lanka)', iconName: 'business-outline' as const, desc: 'Pay via Card/Mobile wallet' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} activeOpacity={0.8}>
          <Ionicons name="arrow-back" size={22} color={COLORS.black} />
        </TouchableOpacity>
        <Text style={styles.title}>Trip Summary</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Service */}
        {service && (
          <View style={styles.serviceChip}>
            <Ionicons name={service.iconName as any} size={16} color={COLORS.black} />
            <Text style={styles.serviceLabel}>{service.title}</Text>
          </View>
        )}

        {/* Route */}
        <View style={styles.routeCard}>
          <View style={styles.routeRow}>
            <View style={styles.routeDotGreen} />
            <View style={styles.routeInfo}>
              <Text style={styles.routeLabel}>PICKUP LOCATION</Text>
              <Text style={styles.routeAddress} numberOfLines={2}>{pickupLocation.address}</Text>
            </View>
          </View>
          <View style={styles.routeVertLine} />
          <View style={styles.routeRow}>
            <View style={styles.routeDotRed} />
            <View style={styles.routeInfo}>
              <Text style={styles.routeLabel}>DESTINATION</Text>
              <Text style={styles.routeAddress} numberOfLines={2}>{dropLocation.address}</Text>
            </View>
          </View>
        </View>

        {/* Trip stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{estimatedDistance} km</Text>
            <Text style={styles.statLabel}>Distance</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{formatTime(estimatedDuration)}</Text>
            <Text style={styles.statLabel}>Duration</Text>
          </View>
        </View>

        {/* Fare Breakdown */}
        <View style={styles.fareCard}>
          <Text style={styles.fareSectionTitle}>FARE BREAKDOWN</Text>
          <View style={styles.fareRow}>
            <Text style={styles.fareLabel}>Driver Fee</Text>
            <Text style={styles.fareValue}>LKR {driverFee}</Text>
          </View>
          <View style={styles.fareRow}>
            <Text style={styles.fareLabel}>Platform Fee</Text>
            <Text style={styles.fareValue}>LKR {platformFee}</Text>
          </View>
          <View style={styles.fareDivider} />
          <View style={styles.fareRow}>
            <Text style={styles.fareTotalLabel}>Total</Text>
            <Text style={styles.fareTotalValue}>LKR {totalCost}</Text>
          </View>
        </View>

        {/* Payment Method */}
        <View style={styles.paymentSection}>
          <Text style={styles.sectionLabel}>PAYMENT METHOD</Text>
          {PAYMENT_METHODS.map((pm) => {
            const isActive = paymentMethod === pm.id;
            return (
              <TouchableOpacity
                key={pm.id}
                style={[styles.paymentOption, isActive && styles.paymentOptionActive]}
                onPress={() => setPaymentMethod(pm.id)}
                activeOpacity={0.85}
              >
                <Ionicons name={pm.iconName} size={24} color={COLORS.black} style={{ marginRight: 4 }} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.paymentLabel}>{pm.label}</Text>
                  <Text style={styles.paymentDesc}>{pm.desc}</Text>
                </View>
                <View style={[styles.radioOuter, isActive && styles.radioOuterActive]}>
                  {isActive && <View style={styles.radioInner} />}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Confirm Button */}
      <View style={styles.footer}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total Amount</Text>
          <Text style={styles.totalAmount}>LKR {totalCost}</Text>
        </View>
        <TouchableOpacity
          style={[styles.confirmButton, isLoading && styles.confirmButtonDisabled]}
          onPress={handleConfirmBooking}
          disabled={isLoading}
          activeOpacity={0.9}
        >
          {isLoading ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={styles.confirmButtonText}>Confirm & Book</Text>
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
    paddingTop: 64,
    paddingBottom: SPACING.md,
  },
  backButton: {
    width: 44, height: 44, borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: COLORS.cardBorder,
  },
  title: { fontSize: FONT_SIZES.lg, fontWeight: '800', color: COLORS.black, letterSpacing: -0.5 },
  content: { paddingHorizontal: SPACING.xl, paddingBottom: 160, gap: 16 },
  serviceChip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 8,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  serviceLabel: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.black },
  routeCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.sm,
    padding: SPACING.base,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  routeRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  routeDotGreen: {
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: COLORS.success, marginTop: 4,
  },
  routeDotRed: {
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: COLORS.error, marginTop: 4,
  },
  routeVertLine: {
    width: 1.5, height: 24, backgroundColor: COLORS.surfaceLight,
    marginLeft: 4, marginVertical: 4,
  },
  routeInfo: { flex: 1 },
  routeLabel: { fontSize: 9, color: COLORS.textMuted, fontWeight: '700', letterSpacing: 1, marginBottom: 4 },
  routeAddress: { fontSize: FONT_SIZES.sm, color: COLORS.textPrimary, fontWeight: '600', lineHeight: 20 },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.sm,
    padding: SPACING.base,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  statCard: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: FONT_SIZES.xl, fontWeight: '800', color: COLORS.black, letterSpacing: -0.5 },
  statLabel: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary, marginTop: 4, fontWeight: '600' },
  statDivider: { width: 1, backgroundColor: COLORS.cardBorder, marginHorizontal: 16 },
  fareCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.sm,
    padding: SPACING.base,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    gap: 10,
  },
  fareSectionTitle: { fontSize: 9, fontWeight: '700', color: COLORS.textMuted, letterSpacing: 1, marginBottom: 4 },
  fareRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  fareLabel: { fontSize: FONT_SIZES.base, color: COLORS.textSecondary, fontWeight: '600' },
  fareValue: { fontSize: FONT_SIZES.base, fontWeight: '700', color: COLORS.black },
  fareDivider: { height: 1.5, backgroundColor: COLORS.cardBorder },
  fareTotalLabel: { fontSize: FONT_SIZES.lg, fontWeight: '800', color: COLORS.black },
  fareTotalValue: { fontSize: FONT_SIZES.xl, fontWeight: '800', color: COLORS.black, letterSpacing: -0.5 },
  paymentSection: { gap: 10 },
  sectionLabel: { fontSize: 9, fontWeight: '700', color: COLORS.textMuted, letterSpacing: 1 },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.sm,
    padding: SPACING.base,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    gap: 12,
  },
  paymentOptionActive: { borderColor: COLORS.black, borderWidth: 1.5 },
  paymentLabel: { fontSize: FONT_SIZES.base, fontWeight: '800', color: COLORS.black },
  paymentDesc: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary, marginTop: 2 },
  radioOuter: {
    width: 22, height: 22, borderRadius: 11, borderWidth: 1.5,
    borderColor: COLORS.cardBorder, alignItems: 'center', justifyContent: 'center',
    marginLeft: 8,
  },
  radioOuterActive: { borderColor: COLORS.black },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.black },
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0, padding: SPACING.xl,
    backgroundColor: COLORS.background, borderTopWidth: 1, borderTopColor: COLORS.cardBorder, gap: 12,
  },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, fontWeight: '600' },
  totalAmount: { fontSize: FONT_SIZES.xl, fontWeight: '800', color: COLORS.black, letterSpacing: -0.5 },
  confirmButton: {
    backgroundColor: COLORS.primary, borderRadius: BORDER_RADIUS.sm,
    height: 56, alignItems: 'center', justifyContent: 'center',
  },
  confirmButtonDisabled: { opacity: 0.6 },
  confirmButtonText: { color: COLORS.white, fontSize: FONT_SIZES.base, fontWeight: '800' },
});
