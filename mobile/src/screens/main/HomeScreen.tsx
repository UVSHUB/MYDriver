import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  RefreshControl,
  Dimensions,
  StatusBar,
  FlatList,
  Image,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, SHADOWS, SERVICE_TYPES } from '../../constants';
import { Driver } from '../../types';
import { driverApi } from '../../api';
import { setNearbyDrivers } from '../../store/slices/driverSlice';

const { width } = Dimensions.get('window');

const PROMOTIONS = [
  { id: '1', title: '30% Off First Ride', subtitle: 'Use code FIRSTRIDE', color: ['#2563EB', '#1D4ED8'], emoji: '🎉' },
  { id: '2', title: 'Refer & Earn LKR 200', subtitle: 'Invite friends today', color: ['#10B981', '#059669'], emoji: '🎁' },
  { id: '3', title: 'Airport Special', subtitle: 'Flat rate any airport', color: ['#8B5CF6', '#7C3AED'], emoji: '✈️' },
];

const getGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
};

export default function HomeScreen({ navigation }: any) {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { nearbyDrivers } = useSelector((state: RootState) => state.driver);

  const [refreshing, setRefreshing] = useState(false);
  const [promoIndex, setPromoIndex] = useState(0);
  const promoFlatRef = useRef<FlatList>(null);
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const cardsAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(headerOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(cardsAnim, { toValue: 1, tension: 60, friction: 9, useNativeDriver: true }),
    ]).start();

    loadNearbyDrivers();

    // Auto-scroll promotions
    const promoTimer = setInterval(() => {
      setPromoIndex(prev => {
        const next = (prev + 1) % PROMOTIONS.length;
        promoFlatRef.current?.scrollToIndex({ index: next, animated: true });
        return next;
      });
    }, 3500);

    return () => clearInterval(promoTimer);
  }, []);

  const loadNearbyDrivers = async () => {
    try {
      // Default Colombo coords for demo
      const drivers = await driverApi.getNearby(6.9271, 79.8612, 10);
      dispatch(setNearbyDrivers(drivers));
    } catch (error) {
      console.log('Could not load nearby drivers');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNearbyDrivers();
    setRefreshing(false);
  };

  const renderServiceCard = (service: typeof SERVICE_TYPES[0], index: number) => (
    <Animated.View
      key={service.id}
      style={{
        opacity: cardsAnim,
        transform: [{
          translateY: cardsAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [30, 0],
          }),
        }],
      }}
    >
      <TouchableOpacity
        style={[styles.serviceCard, { borderTopColor: service.color }]}
        onPress={() => navigation.navigate('BookingFlow', { screen: 'ServiceSelect', params: { preselected: service.id } })}
        activeOpacity={0.85}
      >
        <View style={[styles.serviceIconBg, { backgroundColor: `${service.color}20` }]}>
          <Text style={styles.serviceIcon}>{service.icon}</Text>
        </View>
        <Text style={styles.serviceTitle}>{service.title}</Text>
        <Text style={styles.serviceDesc}>{service.description}</Text>
        <View style={[styles.serviceArrow, { backgroundColor: service.color }]}>
          <Text style={styles.serviceArrowText}>→</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderDriverCard = ({ item: driver }: { item: Driver }) => (
    <View style={styles.driverCard}>
      <View style={styles.driverAvatar}>
        {driver.userId.avatar ? (
          <Image source={{ uri: driver.userId.avatar }} style={styles.driverImage} />
        ) : (
          <Text style={styles.driverAvatarText}>
            {driver.userId.fullName?.charAt(0) || '?'}
          </Text>
        )}
        <View style={styles.onlineIndicator} />
      </View>
      <Text style={styles.driverName} numberOfLines={1}>{driver.userId.fullName}</Text>
      <View style={styles.driverRating}>
        <Text style={styles.starIcon}>⭐</Text>
        <Text style={styles.ratingText}>{driver.rating.toFixed(1)}</Text>
      </View>
      <Text style={styles.driverExp}>{driver.experience}yr exp</Text>
      <Text style={styles.driverTrips}>{driver.totalTrips} trips</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
      >
        {/* ─── Header ─────────────────────────────────── */}
        <Animated.View style={[styles.header, { opacity: headerOpacity }]}>
          <View>
            <Text style={styles.greeting}>{getGreeting()},</Text>
            <Text style={styles.userName}>{user?.fullName?.split(' ')[0] || 'User'} 👋</Text>
          </View>
          <TouchableOpacity
            style={styles.notifButton}
            onPress={() => navigation.navigate('Notifications')}
          >
            <Text style={styles.notifIcon}>🔔</Text>
            <View style={styles.notifDot} />
          </TouchableOpacity>
        </Animated.View>

        {/* ─── Location Bar ──────────────────────────── */}
        <View style={styles.locationBar}>
          <View style={styles.locationDot} />
          <View style={styles.locationContent}>
            <Text style={styles.locationLabel}>Current Location</Text>
            <Text style={styles.locationText} numberOfLines={1}>
              Detecting your location...
            </Text>
          </View>
          <TouchableOpacity style={styles.locationEdit}>
            <Text style={styles.locationEditIcon}>📍</Text>
          </TouchableOpacity>
        </View>

        {/* ─── Search Bar ────────────────────────────── */}
        <TouchableOpacity
          style={styles.searchBar}
          onPress={() => navigation.navigate('BookingFlow', { screen: 'ServiceSelect' })}
          activeOpacity={0.8}
        >
          <Text style={styles.searchIcon}>🔍</Text>
          <Text style={styles.searchPlaceholder}>Where do you want to go?</Text>
        </TouchableOpacity>

        {/* ─── Services ──────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Our Services</Text>
          <View style={styles.servicesGrid}>
            {SERVICE_TYPES.map((service, index) => renderServiceCard(service, index))}
          </View>
        </View>

        {/* ─── Nearby Drivers ────────────────────────── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Nearby Drivers</Text>
            <View style={styles.availableBadge}>
              <View style={styles.availableDot} />
              <Text style={styles.availableText}>{nearbyDrivers.length} available</Text>
            </View>
          </View>

          {nearbyDrivers.length > 0 ? (
            <FlatList
              data={nearbyDrivers}
              renderItem={renderDriverCard}
              keyExtractor={(item) => item._id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingRight: SPACING.xl }}
              ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
            />
          ) : (
            <View style={styles.emptyDrivers}>
              <Text style={styles.emptyDriversText}>🚗 Loading nearby drivers...</Text>
            </View>
          )}
        </View>

        {/* ─── Promotions ────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Offers & Promotions</Text>
          <FlatList
            ref={promoFlatRef}
            data={PROMOTIONS}
            keyExtractor={(item) => item.id}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            snapToInterval={width - SPACING.xl * 2}
            decelerationRate="fast"
            renderItem={({ item }) => (
              <View style={[styles.promoCard, { backgroundColor: item.color[0] }]}>
                <Text style={styles.promoEmoji}>{item.emoji}</Text>
                <Text style={styles.promoTitle}>{item.title}</Text>
                <Text style={styles.promoSubtitle}>{item.subtitle}</Text>
                <TouchableOpacity style={styles.promoButton}>
                  <Text style={styles.promoButtonText}>Claim Now →</Text>
                </TouchableOpacity>
                <View style={[styles.promoCircle, { backgroundColor: item.color[1] }]} />
              </View>
            )}
            ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
          />
          <View style={styles.promoDots}>
            {PROMOTIONS.map((_, i) => (
              <View
                key={i}
                style={[styles.promoDot, i === promoIndex && styles.promoActiveDot]}
              />
            ))}
          </View>
        </View>

        <View style={{ height: SPACING['2xl'] }} />
      </ScrollView>
    </View>
  );
}

const CARD_WIDTH = (width - SPACING.xl * 2 - 12) / 2;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingTop: 60,
    paddingBottom: SPACING.base,
  },
  greeting: {
    fontSize: FONT_SIZES.base,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  userName: {
    fontSize: FONT_SIZES['2xl'],
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: -0.3,
  },
  notifButton: {
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  notifIcon: {
    fontSize: 20,
  },
  notifDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.error,
    borderWidth: 2,
    borderColor: COLORS.background,
  },
  locationBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: SPACING.xl,
    marginBottom: 12,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  locationDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.secondary,
    marginRight: 10,
  },
  locationContent: {
    flex: 1,
  },
  locationLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  locationText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textPrimary,
    fontWeight: '500',
    marginTop: 2,
  },
  locationEdit: {
    padding: 4,
  },
  locationEditIcon: {
    fontSize: 18,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: SPACING.xl,
    marginBottom: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.base,
    borderWidth: 1,
    borderColor: COLORS.primary,
    gap: 10,
  },
  searchIcon: {
    fontSize: 18,
  },
  searchPlaceholder: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZES.base,
    flex: 1,
  },
  section: {
    marginBottom: SPACING.xl,
    paddingLeft: SPACING.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: SPACING.xl,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: -0.3,
    marginBottom: SPACING.md,
  },
  availableBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: `${COLORS.secondary}20`,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
  },
  availableDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.secondary,
  },
  availableText: {
    color: COLORS.secondary,
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingRight: SPACING.xl,
  },
  serviceCard: {
    width: CARD_WIDTH,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.base,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    borderTopWidth: 3,
    ...SHADOWS.md,
  },
  serviceIconBg: {
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  serviceIcon: {
    fontSize: 22,
  },
  serviceTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  serviceDesc: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    lineHeight: 16,
  },
  serviceArrow: {
    width: 28,
    height: 28,
    borderRadius: BORDER_RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    alignSelf: 'flex-end',
  },
  serviceArrowText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
  },
  driverCard: {
    width: 110,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  driverAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    position: 'relative',
  },
  driverImage: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  driverAvatarText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 1,
    right: 1,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.secondary,
    borderWidth: 2,
    borderColor: COLORS.surface,
  },
  driverName: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
    textAlign: 'center',
  },
  driverRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  starIcon: {
    fontSize: 10,
  },
  ratingText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.warning,
    fontWeight: '700',
  },
  driverExp: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginTop: 3,
  },
  driverTrips: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  emptyDrivers: {
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.xl,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  emptyDriversText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.sm,
  },
  promoCard: {
    width: width - SPACING.xl * 2,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    minHeight: 140,
    overflow: 'hidden',
    position: 'relative',
  },
  promoEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  promoTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: -0.3,
  },
  promoSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
    marginBottom: 16,
  },
  promoButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.full,
  },
  promoButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
  },
  promoCircle: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    opacity: 0.3,
    right: -20,
    bottom: -30,
  },
  promoDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginTop: 12,
    paddingRight: SPACING.xl,
  },
  promoDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.surfaceLight,
  },
  promoActiveDot: {
    backgroundColor: COLORS.primary,
    width: 18,
  },
});
