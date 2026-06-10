import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { RootState, AppDispatch } from '../../store';
import { setService } from '../../store/slices/bookingSlice';
import { ServiceType } from '../../types';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, SERVICE_TYPES } from '../../constants';

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
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} activeOpacity={0.8}>
          <Ionicons name="arrow-back" size={22} color={COLORS.black} />
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
        <Text style={styles.subtitle}>Select the exact professional driving solution required for your vehicle.</Text>

        <View style={styles.serviceList}>
          {SERVICE_TYPES.map((service) => {
            const isMCOIcon = service.id === 'emergency';
            const isSelected = selected === service.id;
            return (
              <TouchableOpacity
                key={service.id}
                style={[
                  styles.serviceCard,
                  isSelected && styles.serviceCardSelected,
                ]}
                onPress={() => handleSelect(service.id)}
                activeOpacity={0.85}
              >
                <View style={styles.serviceIconBg}>
                  {isMCOIcon ? (
                    <MaterialCommunityIcons name={service.iconName as any} size={24} color={COLORS.error} />
                  ) : (
                    <Ionicons name={service.iconName as any} size={24} color={COLORS.black} />
                  )}
                </View>
                <View style={styles.serviceInfo}>
                  <Text style={styles.serviceName}>{service.title}</Text>
                  <Text style={styles.serviceDesc}>{service.description}</Text>
                </View>
                <View style={[
                  styles.radioOuter,
                  isSelected && styles.radioOuterSelected,
                ]}>
                  {isSelected && (
                    <View style={styles.radioInner} />
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Next button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.nextButton, !selected && styles.nextButtonDisabled]}
          onPress={handleNext}
          disabled={!selected}
          activeOpacity={0.9}
        >
          <Text style={styles.nextButtonText}>Continue</Text>
          <Ionicons name="arrow-forward" size={18} color={selected ? COLORS.white : COLORS.textMuted} style={{ marginLeft: 8 }} />
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
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  title: { fontSize: FONT_SIZES.lg, fontWeight: '800', color: COLORS.black, letterSpacing: -0.5 },
  steps: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    marginBottom: SPACING.sm,
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
  stepActive: { backgroundColor: COLORS.black, borderColor: COLORS.black },
  stepNum: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: COLORS.textMuted },
  stepNumActive: { color: COLORS.white },
  stepLine: { flex: 1, height: 1.5, backgroundColor: COLORS.surfaceLight, marginHorizontal: 4 },
  stepLineActive: { backgroundColor: COLORS.black },
  content: { paddingHorizontal: SPACING.xl, paddingBottom: 120 },
  subtitle: { fontSize: FONT_SIZES.base, color: COLORS.textSecondary, marginBottom: SPACING.lg, lineHeight: 22 },
  serviceList: { gap: 12 },
  serviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.sm,
    padding: SPACING.base,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    position: 'relative',
    overflow: 'hidden',
  },
  serviceCardSelected: {
    borderColor: COLORS.black,
    borderWidth: 1.5,
  },
  serviceIconBg: {
    width: 52,
    height: 52,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  serviceInfo: { flex: 1 },
  serviceName: { fontSize: FONT_SIZES.base, fontWeight: '800', color: COLORS.black, letterSpacing: -0.3 },
  serviceDesc: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, marginTop: 4, lineHeight: 18 },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: COLORS.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  radioOuterSelected: {
    borderColor: COLORS.black,
  },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.black },
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
    borderRadius: BORDER_RADIUS.sm,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButtonDisabled: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.cardBorder },
  nextButtonText: { color: COLORS.white, fontSize: FONT_SIZES.base, fontWeight: '800' },
});
