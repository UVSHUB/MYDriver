import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  Alert,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { bookingApi } from '../../api';
import { clearBooking } from '../../store/slices/bookingSlice';
import { clearDriver } from '../../store/slices/driverSlice';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS } from '../../constants';

export default function SearchingScreen({ navigation, route }: any) {
  const { bookingId } = route.params;
  const dispatch = useDispatch<AppDispatch>();
  const { activeBooking } = useSelector((state: RootState) => state.booking);

  const [status, setStatus] = useState('Searching for nearby drivers...');
  const [isCancelling, setIsCancelling] = useState(false);

  // Pulse animation
  const pulse1 = useRef(new Animated.Value(0)).current;
  const pulse2 = useRef(new Animated.Value(0)).current;
  const pulse3 = useRef(new Animated.Value(0)).current;
  const rotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animatePulse = (anim: Animated.Value, delay: number) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, { toValue: 1, duration: 1500, easing: Easing.out(Easing.ease), useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0, duration: 0, useNativeDriver: true }),
        ])
      ).start();
    };

    animatePulse(pulse1, 0);
    animatePulse(pulse2, 500);
    animatePulse(pulse3, 1000);

    Animated.loop(
      Animated.timing(rotate, { toValue: 1, duration: 3000, easing: Easing.linear, useNativeDriver: true })
    ).start();

    // Poll for driver match (in production this uses Socket.io)
    const pollInterval = setInterval(async () => {
      try {
        const booking = await bookingApi.getById(bookingId);
        if (booking.status === 'matched' && booking.driverId) {
          clearInterval(pollInterval);
          navigation.replace('DriverMatched', { bookingId });
        } else if (booking.status === 'cancelled') {
          clearInterval(pollInterval);
          Alert.alert('Booking Cancelled', 'Your booking has been cancelled.');
          navigation.navigate('Main');
        }
      } catch {}
    }, 5000);

    const statusMessages = [
      'Searching for nearby drivers...',
      'Contacting available drivers...',
      'Almost there...',
    ];
    let msgIndex = 0;
    const msgInterval = setInterval(() => {
      msgIndex = (msgIndex + 1) % statusMessages.length;
      setStatus(statusMessages[msgIndex]);
    }, 3000);

    return () => {
      clearInterval(pollInterval);
      clearInterval(msgInterval);
    };
  }, []);

  const handleCancel = async () => {
    Alert.alert('Cancel Booking', 'Are you sure you want to cancel?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes, Cancel',
        style: 'destructive',
        onPress: async () => {
          setIsCancelling(true);
          try {
            await bookingApi.cancel(bookingId, 'Cancelled by customer');
            dispatch(clearBooking());
            dispatch(clearDriver());
            navigation.navigate('Main');
          } catch {
            Alert.alert('Error', 'Could not cancel booking.');
          } finally {
            setIsCancelling(false);
          }
        },
      },
    ]);
  };

  const rotateInterpolate = rotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      {/* Pulse rings */}
      <View style={styles.pulseContainer}>
        {[pulse1, pulse2, pulse3].map((anim, i) => (
          <Animated.View
            key={i}
            style={[
              styles.pulseRing,
              {
                opacity: anim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.4, 0.1, 0] }),
                transform: [{ scale: anim.interpolate({ inputRange: [0, 1], outputRange: [0.5, 2.5] }) }],
              },
            ]}
          />
        ))}
        {/* Center icon */}
        <Animated.View style={[styles.centerIcon, { transform: [{ rotate: rotateInterpolate }] }]}>
          <Text style={styles.centerEmoji}>🚗</Text>
        </Animated.View>
      </View>

      {/* Status */}
      <Text style={styles.statusText}>{status}</Text>
      <Text style={styles.subStatusText}>Please wait while we find the best driver for you</Text>

      {/* Estimated wait */}
      <View style={styles.waitCard}>
        <Text style={styles.waitLabel}>Estimated Wait</Text>
        <Text style={styles.waitTime}>3 - 7 minutes</Text>
      </View>

      {/* Cancel */}
      <TouchableOpacity
        style={styles.cancelButton}
        onPress={handleCancel}
        disabled={isCancelling}
      >
        <Text style={styles.cancelText}>{isCancelling ? 'Cancelling...' : 'Cancel Booking'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
  },
  pulseContainer: {
    width: 180,
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING['2xl'],
  },
  pulseRing: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: COLORS.primary,
  },
  centerIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerEmoji: { fontSize: 36 },
  statusText: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '800',
    color: COLORS.white,
    textAlign: 'center',
    marginBottom: 8,
  },
  subStatusText: {
    fontSize: FONT_SIZES.base,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SPACING['2xl'],
  },
  waitCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.base,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    width: '100%',
    marginBottom: SPACING.lg,
  },
  waitLabel: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, marginBottom: 4 },
  waitTime: { fontSize: FONT_SIZES['2xl'], fontWeight: '800', color: COLORS.primary },
  cancelButton: {
    paddingVertical: 14,
    paddingHorizontal: SPACING['2xl'],
  },
  cancelText: {
    color: COLORS.error,
    fontSize: FONT_SIZES.base,
    fontWeight: '700',
  },
});
