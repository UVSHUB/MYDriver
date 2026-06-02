import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, SHADOWS } from '../../constants';
import { reviewApi } from '../../api';

export default function RatingScreen({ navigation, route }: any) {
  const { bookingId } = route.params;
  const { activeBooking } = useSelector((state: RootState) => state.booking);

  const [overallRating, setOverallRating] = useState(0);
  const [categories, setCategories] = useState({
    drivingSkill: 0,
    safety: 0,
    professionalism: 0,
    punctuality: 0,
  });
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const driver = activeBooking?.driverId as any;

  const CATEGORY_LABELS: Record<string, string> = {
    drivingSkill: '🚗 Driving Skill',
    safety: '🛡️ Safety',
    professionalism: '👔 Professionalism',
    punctuality: '⏰ Punctuality',
  };

  const StarRating = ({ value, onSelect, size = 32 }: { value: number; onSelect: (v: number) => void; size?: number }) => (
    <View style={{ flexDirection: 'row', gap: 4 }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity key={star} onPress={() => onSelect(star)}>
          <Text style={{ fontSize: size, color: star <= value ? COLORS.star : COLORS.surfaceLight }}>★</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const handleSubmit = async () => {
    if (overallRating === 0) {
      Alert.alert('Rate Driver', 'Please give an overall rating.');
      return;
    }
    setIsSubmitting(true);
    try {
      await reviewApi.create({
        bookingId,
        rating: overallRating,
        categories: {
          drivingSkill: categories.drivingSkill || overallRating,
          safety: categories.safety || overallRating,
          professionalism: categories.professionalism || overallRating,
          punctuality: categories.punctuality || overallRating,
        },
        comment,
      });
      Alert.alert('Thank You! 🎉', 'Your review has been submitted.', [
        { text: 'Done', onPress: () => navigation.navigate('Main') },
      ]);
    } catch {
      Alert.alert('Error', 'Could not submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.emoji}>⭐</Text>
        <Text style={styles.title}>Rate Your Trip</Text>
        <Text style={styles.subtitle}>How was your experience?</Text>
      </View>

      {/* Driver Card */}
      {driver && (
        <View style={styles.driverCard}>
          <View style={styles.driverAvatar}>
            <Text style={styles.driverAvatarText}>
              {driver.userId?.fullName?.charAt(0) || '?'}
            </Text>
          </View>
          <View>
            <Text style={styles.driverName}>{driver.userId?.fullName || 'Driver'}</Text>
            <Text style={styles.driverMeta}>⭐ {driver.rating?.toFixed(1)} · {driver.totalTrips} trips</Text>
          </View>
        </View>
      )}

      {/* Overall Rating */}
      <View style={styles.overallSection}>
        <Text style={styles.overallLabel}>Overall Rating</Text>
        <StarRating value={overallRating} onSelect={setOverallRating} size={44} />
        <Text style={styles.ratingDesc}>
          {overallRating === 0 ? 'Tap to rate' :
           overallRating <= 2 ? 'Poor' :
           overallRating === 3 ? 'Average' :
           overallRating === 4 ? 'Good' : 'Excellent! 🎉'}
        </Text>
      </View>

      {/* Category Ratings */}
      <View style={styles.categoriesCard}>
        <Text style={styles.categoriesTitle}>Detailed Rating (Optional)</Text>
        {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
          <View key={key} style={styles.categoryRow}>
            <Text style={styles.categoryLabel}>{label}</Text>
            <StarRating
              value={categories[key as keyof typeof categories]}
              onSelect={(v) => setCategories(prev => ({ ...prev, [key]: v }))}
              size={24}
            />
          </View>
        ))}
      </View>

      {/* Quick feedback tags */}
      <View style={styles.tagsSection}>
        <Text style={styles.tagsLabel}>Quick Feedback</Text>
        <View style={styles.tagsRow}>
          {['Great attitude!', 'Safe driver', 'On time', 'Clean vehicle', 'Professional'].map((tag) => (
            <TouchableOpacity
              key={tag}
              style={[styles.tag, comment.includes(tag) && styles.tagActive]}
              onPress={() => setComment(prev =>
                prev.includes(tag) ? prev.replace(tag, '').trim() : `${prev} ${tag}`.trim()
              )}
            >
              <Text style={[styles.tagText, comment.includes(tag) && styles.tagTextActive]}>
                {tag}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Buttons */}
      <TouchableOpacity
        style={[styles.submitButton, isSubmitting && { opacity: 0.7 }]}
        onPress={handleSubmit}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <ActivityIndicator color={COLORS.white} />
        ) : (
          <Text style={styles.submitText}>Submit Review</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Main')} style={styles.skipButton}>
        <Text style={styles.skipText}>Skip for now</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { paddingHorizontal: SPACING.xl, paddingTop: 60, paddingBottom: 40, gap: 20 },
  header: { alignItems: 'center', gap: 8 },
  emoji: { fontSize: 52 },
  title: { fontSize: FONT_SIZES['2xl'], fontWeight: '800', color: COLORS.white },
  subtitle: { fontSize: FONT_SIZES.base, color: COLORS.textSecondary },
  driverCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.base,
    gap: 14,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  driverAvatar: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center',
  },
  driverAvatarText: { fontSize: FONT_SIZES.xl, color: COLORS.white, fontWeight: '700' },
  driverName: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.white },
  driverMeta: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, marginTop: 3 },
  overallSection: {
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.xl,
    gap: 12,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  overallLabel: { fontSize: FONT_SIZES.base, fontWeight: '700', color: COLORS.textSecondary },
  ratingDesc: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: COLORS.star },
  categoriesCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.base,
    gap: 14,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  categoriesTitle: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.textSecondary },
  categoryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  categoryLabel: { fontSize: FONT_SIZES.sm, color: COLORS.textPrimary, fontWeight: '500' },
  tagsSection: { gap: 10 },
  tagsLabel: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.textSecondary },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  tagActive: { backgroundColor: `${COLORS.primary}20`, borderColor: COLORS.primary },
  tagText: { color: COLORS.textSecondary, fontSize: FONT_SIZES.sm, fontWeight: '600' },
  tagTextActive: { color: COLORS.primary },
  submitButton: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.lg,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.lg,
  },
  submitText: { color: COLORS.white, fontSize: FONT_SIZES.md, fontWeight: '700' },
  skipButton: { alignItems: 'center', paddingVertical: 8 },
  skipText: { color: COLORS.textSecondary, fontSize: FONT_SIZES.base },
});
