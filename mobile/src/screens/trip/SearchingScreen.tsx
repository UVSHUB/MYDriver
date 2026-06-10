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
import { Ionicons } from '@expo/vector-icons';
import { RootState, AppDispatch } from '../../store';
import { bookingApi } from '../../api';
import { clearBooking } from '../../store/slices/bookingSlice';
import { clearDriver } from '../../store/slices/driverSlice';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS } from '../../constants';

export default function SearchingScreen({ navigation, route }: any) {
  const { bookingId } = route.params;
  const dispatch = useDispatch<AppDispatch>();
  const { activeBooking } = useSelector((state: RootState) => state.booking);

  const [status, setStatus] = useState('Locating nearby drivers...');
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
          Animated.timing(anim, { toValue: 1, duration: 2000, easing: Easing.out(Easing.ease), useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0, duration: 0, useNativeDriver: true }),
        ])
      ).start();
    };

    animatePulse(pulse1, 0);
    animatePulse(pulse2, 600);
    animatePulse(pulse3, 1200);

    Animated.loop(
      Animated.timing(rotate, { toValue: 1, duration: 4000, easing: Easing.linear, useNativeDriver: true })
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
      'Matching with drivers...',
      'Assigning high-rated partner...',
      'Confirming trip dispatch...',
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
    Alert.alert('Cancel Dispatch', 'Are you sure you want to cancel your ride request?', [
      { text: 'No, Keep Waiting', style: 'cancel' },
      {
        text: 'Yes, Cancel Request',
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
                opacity: anim.interpolate({ inputRange: [0, 0.4, 1], outputRange: [0.6, 0.15, 0] }),
                transform: [{ scale: anim.interpolate({ inputRange: [0, 1], outputRange: [0.6, 2.8] }) }],
              },
            ]}
          />
        ))}
        {/* Center icon */}
        <Animated.View style={[styles.centerIcon, { transform: [{ rotate: rotateInterpolate }] }]}>
          <Ionicons name="car-outline" size={36} color={COLORS.black} />
        </Animated.View>
      </View>

      {/* Status */}
      <Text style={styles.statusText}>{status}</Text>
      <Text style={styles.subStatusText}>Finding the nearest executive driver to pick you up.</Text>

      {/* Estimated wait */}
      <View style={styles.waitCard}>
        <Text style={styles.waitLabel}>ESTIMATED WAIT TIME</Text>
        <Text style={styles.waitTime}>3 - 6 mins</Text>
      </View>

      {/* Cancel */}
      <TouchableOpacity
        style={styles.cancelButton}
        onPress={handleCancel}
        disabled={isCancelling}
        activeOpacity={0.8}
      >
        <Text style={styles.cancelText}>{isCancelling ? 'Cancelling...' : 'Cancel Request'}</Text>
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
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING['3xl'],
  },
  pulseRing: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: COLORS.black, // Sleek black pulse
  },
  centerIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  statusText: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '800',
    color: COLORS.black,
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subStatusText: {
    fontSize: FONT_SIZES.base,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SPACING['3xl'],
  },
  waitCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.sm,
    padding: SPACING.base,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    width: '100%',
    marginBottom: SPACING.xl,
  },
  waitLabel: {
    fontSize: 9,
    color: COLORS.textMuted,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 6,
  },
  waitTime: { fontSize: FONT_SIZES['2xl'], fontWeight: '800', color: COLORS.black, letterSpacing: -0.5 },
  cancelButton: {
    height: 56,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.sm,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    color: COLORS.error,
    fontSize: FONT_SIZES.base,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
});
