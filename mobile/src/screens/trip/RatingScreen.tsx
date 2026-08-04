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
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
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
  const [tipAmount, setTipAmount] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const driver = activeBooking?.driverId as any;

  const CATEGORY_LABELS: Record<string, string> = {
    drivingSkill: 'Driving Skill',
    safety: 'Safety & Comfort',
    professionalism: 'Driver Professionalism',
    punctuality: 'Punctuality',
  };

  const StarRating = ({ value, onSelect, size = 32 }: { value: number; onSelect: (v: number) => void; size?: number }) => (
    <View style={{ flexDirection: 'row', gap: 6 }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity key={star} onPress={() => onSelect(star)} activeOpacity={0.7}>
          <Ionicons
            name={star <= value ? "star" : "star-outline"}
            size={size}
            color={star <= value ? COLORS.star : COLORS.surfaceLight}
          />
        </TouchableOpacity>
      ))}
    </View>
  );

  const handleSubmit = async () => {
    if (overallRating === 0) {
      Alert.alert('Rate Trip', 'Please select an overall rating.');
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
      Alert.alert('Review Submitted 🎉', 'Thank you for your valuable feedback!', [
        { text: 'Done', onPress: () => navigation.navigate('Main') },
      ]);
    } catch {
      Alert.alert('Error', 'Could not submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Ionicons name="star" size={54} color={COLORS.star} style={{ marginBottom: SPACING.sm }} />
        <Text style={styles.title}>Rate Your Trip</Text>
        <Text style={styles.subtitle}>Your feedback helps maintain executive standards.</Text>
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
        <Text style={styles.overallLabel}>OVERALL RATING</Text>
        <StarRating value={overallRating} onSelect={setOverallRating} size={42} />
        <Text style={styles.ratingDesc}>
          {overallRating === 0 ? 'Tap stars to rate' :
           overallRating <= 2 ? 'Needs Improvement' :
           overallRating === 3 ? 'Average' :
           overallRating === 4 ? 'Very Good' : 'Exceptional Standard!'}
        </Text>
      </View>

      {/* Category Ratings */}
      <View style={styles.categoriesCard}>
        <Text style={styles.categoriesTitle}>DETAILED PERFORMANCE</Text>
        {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
          <View key={key} style={styles.categoryRow}>
            <Text style={styles.categoryLabel}>{label}</Text>
            <StarRating
              value={categories[key as keyof typeof categories]}
              onSelect={(v) => setCategories(prev => ({ ...prev, [key]: v }))}
              size={22}
            />
          </View>
        ))}
      </View>

      {/* Quick feedback tags */}
      <View style={styles.tagsSection}>
        <Text style={styles.tagsLabel}>ADD QUICK COMMENT</Text>
        <View style={styles.tagsRow}>
          {['Safe driving', 'Punctual arrival', 'Great attitude', 'Clean vehicle', 'Professional conduct'].map((tag) => (
            <TouchableOpacity
              key={tag}
              style={[styles.tag, comment.includes(tag) && styles.tagActive]}
              onPress={() => setComment(prev =>
                prev.includes(tag) ? prev.replace(tag, '').trim() : `${prev} ${tag}`.trim()
              )}
              activeOpacity={0.8}
            >
              <Text style={[styles.tagText, comment.includes(tag) && styles.tagTextActive]}>
                {tag}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Driver Tip Selection */}
      <View style={styles.tipSection}>
        <Text style={styles.tagsLabel}>ADD DRIVER TIP (100% GOES TO DRIVER)</Text>
        <View style={styles.tipRow}>
          {[0, 100, 200, 500].map((amt) => (
            <TouchableOpacity
              key={amt}
              style={[styles.tipChip, tipAmount === amt && styles.tipChipActive]}
              onPress={() => setTipAmount(amt)}
              activeOpacity={0.8}
            >
              <Text style={[styles.tipChipTxt, tipAmount === amt && styles.tipChipTxtActive]}>
                {amt === 0 ? 'No Tip' : `LKR ${amt}`}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.submitButton, isSubmitting && { opacity: 0.7 }]}
          onPress={handleSubmit}
          disabled={isSubmitting}
          activeOpacity={0.9}
        >
          {isSubmitting ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={styles.submitText}>Submit Review</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Main')} style={styles.skipButton} activeOpacity={0.7}>
          <Text style={styles.skipText}>Skip feedback</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { paddingHorizontal: SPACING.xl, paddingTop: 64, paddingBottom: 40, gap: 20 },
  header: { alignItems: 'center', gap: 4, marginBottom: SPACING.md },
  title: { fontSize: FONT_SIZES['2xl'], fontWeight: '800', color: COLORS.black, letterSpacing: -0.5 },
  subtitle: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, textAlign: 'center' },
  driverCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.sm,
    padding: SPACING.base,
    gap: 14,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  driverAvatar: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: COLORS.surfaceLight, alignItems: 'center', justifyContent: 'center',
  },
  driverAvatarText: { fontSize: FONT_SIZES.lg, color: COLORS.black, fontWeight: '800' },
  driverName: { fontSize: FONT_SIZES.md, fontWeight: '800', color: COLORS.black },
  driverMeta: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary, marginTop: 4 },
  overallSection: {
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.sm,
    padding: SPACING.xl,
    gap: 12,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  overallLabel: { fontSize: 9, fontWeight: '700', color: COLORS.textMuted, letterSpacing: 1 },
  ratingDesc: { fontSize: FONT_SIZES.base, fontWeight: '800', color: COLORS.black, marginTop: 4 },
  categoriesCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.sm,
    padding: SPACING.base,
    gap: 14,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  categoriesTitle: { fontSize: 9, fontWeight: '700', color: COLORS.textMuted, letterSpacing: 1 },
  categoryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  categoryLabel: { fontSize: FONT_SIZES.sm, color: COLORS.black, fontWeight: '600' },
  tagsSection: { gap: 10 },
  tagsLabel: { fontSize: 9, fontWeight: '700', color: COLORS.textMuted, letterSpacing: 1 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  tagActive: { backgroundColor: COLORS.black, borderColor: COLORS.black },
  tagText: { color: COLORS.textSecondary, fontSize: FONT_SIZES.sm, fontWeight: '600' },
  tagTextActive: { color: COLORS.white },
  tipSection: { gap: 10 },
  tipRow: { flexDirection: 'row', gap: 8 },
  tipChip: {
    flex: 1,
    height: 44,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  tipChipTxt: { fontSize: FONT_SIZES.xs, fontWeight: '800', color: COLORS.textPrimary },
  tipChipTxtActive: { color: COLORS.white },
  buttonContainer: { gap: 8, marginTop: SPACING.md },
  submitButton: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.sm,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitText: { color: COLORS.white, fontSize: FONT_SIZES.base, fontWeight: '800' },
  skipButton: { alignItems: 'center', paddingVertical: 12 },
  skipText: { color: COLORS.textSecondary, fontSize: FONT_SIZES.sm, fontWeight: '600' },
});
