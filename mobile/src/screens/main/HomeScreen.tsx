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
  ActivityIndicator,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { RootState, AppDispatch } from '../../store';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, SHADOWS, SERVICE_TYPES } from '../../constants';
import { Driver } from '../../types';
import { driverApi } from '../../api';
import { setNearbyDrivers } from '../../store/slices/driverSlice';

const { width } = Dimensions.get('window');

const PROMOTIONS = [
  { id: '1', title: '30% Off Premium', subtitle: 'Use code LUXRIDE', icon: 'pricetag-outline' as const },
  { id: '2', title: 'Refer a Friend', subtitle: 'Earn rewards instantly', icon: 'gift-outline' as const },
  { id: '3', title: 'Airport Transfers', subtitle: 'Flat rates available', icon: 'airplane-outline' as const },
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

  const renderServiceCard = (service: typeof SERVICE_TYPES[0], index: number) => {
    const isMCOIcon = service.id === 'emergency';
    return (
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
          style={styles.serviceCard}
          onPress={() => navigation.navigate('BookingFlow', { screen: 'ServiceSelect', params: { preselected: service.id } })}
          activeOpacity={0.9}
        >
          <View style={styles.serviceIconBg}>
            {isMCOIcon ? (
              <MaterialCommunityIcons name={service.iconName as any} size={26} color={COLORS.error} />
            ) : (
              <Ionicons name={service.iconName as any} size={26} color={COLORS.white} />
            )}
          </View>
          <Text style={styles.serviceTitle}>{service.title}</Text>
          <Text style={styles.serviceDesc}>{service.description}</Text>
          <View style={styles.serviceArrow}>
            <Ionicons name="arrow-forward-outline" size={14} color={COLORS.white} />
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

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
        <Ionicons name="star" size={11} color={COLORS.star} />
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
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.white} />}
      >
        {/* ─── Header ─────────────────────────────────── */}
        <Animated.View style={[styles.header, { opacity: headerOpacity }]}>
          <View>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <Text style={styles.userName}>{user?.fullName?.split(' ')[0] || 'User'}</Text>
          </View>
          <TouchableOpacity
            style={styles.notifButton}
            onPress={() => navigation.navigate('Notifications')}
            activeOpacity={0.8}
          >
            <Ionicons name="notifications-outline" size={22} color={COLORS.white} />
            <View style={styles.notifDot} />
          </TouchableOpacity>
        </Animated.View>

        {/* ─── Location Bar ──────────────────────────── */}
        <View style={styles.locationBar}>
          <Ionicons name="location-sharp" size={18} color={COLORS.white} style={{ marginRight: 8 }} />
          <View style={styles.locationContent}>
            <Text style={styles.locationLabel}>CURRENT LOCATION</Text>
            <Text style={styles.locationText} numberOfLines={1}>
              Detecting your location...
            </Text>
          </View>
          <TouchableOpacity style={styles.locationEdit} activeOpacity={0.7}>
            <Ionicons name="chevron-forward" size={16} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* ─── Search Bar ────────────────────────────── */}
        <TouchableOpacity
          style={styles.searchBar}
          onPress={() => navigation.navigate('BookingFlow', { screen: 'ServiceSelect' })}
          activeOpacity={0.9}
        >
          <Ionicons name="search" size={20} color={COLORS.white} />
          <Text style={styles.searchPlaceholder}>Where to?</Text>
        </TouchableOpacity>

        {/* ─── Services ──────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Services</Text>
          <View style={styles.servicesGrid}>
            {SERVICE_TYPES.map((service, index) => renderServiceCard(service, index))}
          </View>
        </View>

        {/* ─── Nearby Drivers ────────────────────────── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Drivers Nearby</Text>
            <View style={styles.availableBadge}>
              <View style={styles.availableDot} />
              <Text style={styles.availableText}>{nearbyDrivers.length} active</Text>
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
              <ActivityIndicator color={COLORS.white} size="small" style={{ marginRight: 8 }} />
              <Text style={styles.emptyDriversText}>Searching for nearby drivers...</Text>
            </View>
          )}
        </View>

        {/* ─── Promotions ────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Exclusive Offers</Text>
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
              <View style={styles.promoCard}>
                <View style={styles.promoHeader}>
                  <Ionicons name={item.icon} size={28} color={COLORS.white} />
                  <Text style={styles.promoTitle}>{item.title}</Text>
                </View>
                <Text style={styles.promoSubtitle}>{item.subtitle}</Text>
                <TouchableOpacity style={styles.promoButton} activeOpacity={0.8}>
                  <Text style={styles.promoButtonText}>Claim Offer</Text>
                  <Ionicons name="arrow-forward" size={14} color={COLORS.black} style={{ marginLeft: 4 }} />
                </TouchableOpacity>
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
    paddingTop: 64,
    paddingBottom: SPACING.base,
  },
  greeting: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    fontWeight: '600',
  },
  userName: {
    fontSize: FONT_SIZES['3xl'],
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: -0.8,
    marginTop: 2,
  },
  notifButton: {
    width: 46,
    height: 46,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  notifDot: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.error,
  },
  locationBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: SPACING.xl,
    marginBottom: 16,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.sm,
    padding: SPACING.base,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  locationContent: {
    flex: 1,
  },
  locationLabel: {
    fontSize: 9,
    color: COLORS.textMuted,
    fontWeight: '700',
    letterSpacing: 1,
  },
  locationText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textPrimary,
    fontWeight: '600',
    marginTop: 1,
  },
  locationEdit: {
    paddingLeft: 8,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: SPACING.xl,
    marginBottom: SPACING.xl,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.sm,
    padding: SPACING.base,
    borderWidth: 1,
    borderColor: COLORS.white, // Ultra high-contrast outline
    gap: 12,
  },
  searchPlaceholder: {
    color: COLORS.white,
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
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
    fontSize: FONT_SIZES.xl,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: -0.5,
    marginBottom: SPACING.xs,
  },
  availableBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(52, 199, 89, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
  },
  availableDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.success,
  },
  availableText: {
    color: COLORS.success,
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
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
    borderRadius: BORDER_RADIUS.sm,
    padding: SPACING.base,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    justifyContent: 'space-between',
    minHeight: 160,
  },
  serviceIconBg: {
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  serviceTitle: {
    fontSize: FONT_SIZES.base,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: -0.2,
  },
  serviceDesc: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    lineHeight: 16,
    marginTop: 4,
    flexGrow: 1,
  },
  serviceArrow: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: COLORS.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    alignSelf: 'flex-end',
  },
  driverCard: {
    width: 120,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.sm,
    padding: SPACING.base,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  driverAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    position: 'relative',
  },
  driverImage: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  driverAvatarText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.lg,
    fontWeight: '800',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.success,
    borderWidth: 2,
    borderColor: COLORS.surface,
  },
  driverName: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: 4,
    textAlign: 'center',
  },
  driverRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },
  ratingText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.white,
    fontWeight: '800',
  },
  driverExp: {
    fontSize: 10,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  driverTrips: {
    fontSize: 9,
    color: COLORS.textMuted,
    marginTop: 2,
    fontWeight: '600',
  },
  emptyDrivers: {
    height: 80,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.xl,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  emptyDriversText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },
  promoCard: {
    width: width - SPACING.xl * 2,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    padding: SPACING.xl,
    minHeight: 150,
    justifyContent: 'space-between',
  },
  promoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  promoTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: -0.3,
  },
  promoSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    lineHeight: 18,
    marginTop: 8,
    marginBottom: 16,
  },
  promoButton: {
    backgroundColor: COLORS.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: BORDER_RADIUS.sm,
    alignSelf: 'flex-start',
  },
  promoButtonText: {
    color: COLORS.black,
    fontSize: FONT_SIZES.sm,
    fontWeight: '800',
  },
  promoDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginTop: 14,
    paddingRight: SPACING.xl,
  },
  promoDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.surfaceLight,
  },
  promoActiveDot: {
    backgroundColor: COLORS.white,
    width: 20,
  },
});
