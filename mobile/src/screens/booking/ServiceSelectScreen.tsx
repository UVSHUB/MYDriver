import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { setActiveBooking, clearBooking, setService } from '../../store/slices/bookingSlice';
import { bookingApi } from '../../api';
import { ServiceType } from '../../types';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, SHADOWS, SERVICE_TYPES } from '../../constants';

export default function ServiceSelectScreen({ navigation }: any) {
  const dispatch = useDispatch<AppDispatch>();
  const { selectedService } = useSelector((state: RootState) => state.booking);
  const [selected, setSelected] = useState<ServiceType | null>(selectedService);

  const handleSelect = (id: ServiceType) => {
    setSelected(id);
    dispatch(setService(id));
  };

  const handleNext = () => {
    if (!selected) {
      Alert.alert('Select Service', 'Please select a service type to continue.');
      return;
    }
    navigation.navigate('PickupMap', { serviceType: selected });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Select Service</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Step indicator */}
      <View style={styles.steps}>
        {['Service', 'Pickup', 'Destination', 'Vehicle', 'Summary'].map((step, i) => (
          <React.Fragment key={step}>
            <View style={[styles.step, i === 0 && styles.stepActive]}>
              <Text style={[styles.stepNum, i === 0 && styles.stepNumActive]}>{i + 1}</Text>
            </View>
            {i < 4 && <View style={[styles.stepLine, i === 0 && styles.stepLineActive]} />}
          </React.Fragment>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Text style={styles.subtitle}>What type of driving service do you need?</Text>

        <View style={styles.serviceList}>
          {SERVICE_TYPES.map((service) => (
            <TouchableOpacity
              key={service.id}
              style={[
                styles.serviceCard,
                selected === service.id && { borderColor: service.color, borderWidth: 2 },
              ]}
              onPress={() => handleSelect(service.id)}
              activeOpacity={0.85}
            >
              <View style={[styles.serviceIconBg, { backgroundColor: `${service.color}20` }]}>
                <Text style={styles.serviceEmoji}>{service.icon}</Text>
              </View>
              <View style={styles.serviceInfo}>
                <Text style={styles.serviceName}>{service.title}</Text>
                <Text style={styles.serviceDesc}>{service.description}</Text>
              </View>
              <View style={[
                styles.radioOuter,
                selected === service.id && { borderColor: service.color },
              ]}>
                {selected === service.id && (
                  <View style={[styles.radioInner, { backgroundColor: service.color }]} />
                )}
              </View>
              {selected === service.id && (
                <View style={[styles.selectedBadge, { backgroundColor: service.color }]}>
                  <Text style={styles.selectedBadgeText}>Selected</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Next button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.nextButton, !selected && styles.nextButtonDisabled]}
          onPress={handleNext}
          disabled={!selected}
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
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: { fontSize: 20, color: COLORS.white },
  title: { fontSize: FONT_SIZES.lg, fontWeight: '800', color: COLORS.white },
  steps: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
  },
  step: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  stepActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  stepNum: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: COLORS.textMuted },
  stepNumActive: { color: COLORS.white },
  stepLine: { flex: 1, height: 2, backgroundColor: COLORS.surfaceLight, marginHorizontal: 4 },
  stepLineActive: { backgroundColor: COLORS.primary },
  content: { paddingHorizontal: SPACING.xl, paddingBottom: 100 },
  subtitle: { fontSize: FONT_SIZES.base, color: COLORS.textSecondary, marginBottom: SPACING.lg, lineHeight: 22 },
  serviceList: { gap: 12 },
  serviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.base,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    position: 'relative',
    overflow: 'hidden',
    ...SHADOWS.sm,
  },
  serviceIconBg: {
    width: 52,
    height: 52,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  serviceEmoji: { fontSize: 26 },
  serviceInfo: { flex: 1 },
  serviceName: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.textPrimary },
  serviceDesc: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary, marginTop: 3, lineHeight: 18 },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: COLORS.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  radioInner: { width: 10, height: 10, borderRadius: 5 },
  selectedBadge: {
    position: 'absolute',
    top: 10,
    right: 50,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.full,
  },
  selectedBadgeText: { color: COLORS.white, fontSize: 9, fontWeight: '700' },
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
    borderRadius: BORDER_RADIUS.lg,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.lg,
  },
  nextButtonDisabled: { backgroundColor: COLORS.surfaceLight },
  nextButtonText: { color: COLORS.white, fontSize: FONT_SIZES.md, fontWeight: '700' },
});
