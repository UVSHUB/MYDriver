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
  {
    id: '1',
    title: 'WEEKEND\nDRIVE OFFERS!',
    subtitle: 'Get your driver to pilot your vehicle.',
    discount: '15%',
    label: 'HOT PICKS UP',
  },
  {
    id: '2',
    title: 'NIGHT OUT\nSPECIAL RATE!',
    subtitle: 'Enjoy your evening, we drive you home.',
    discount: '20%',
    label: 'EXCLUSIVE',
  },
  {
    id: '3',
    title: 'AIRPORT\nTRANSFERS!',
    subtitle: 'Flat rates available for direct transit.',
    discount: '10%',
    label: 'FLAT RATE',
  },
];

const getGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour < 12) return 'GOOD MORNING,';
  if (hour < 17) return 'GOOD AFTERNOON,';
  return 'GOOD EVENING,';
};

export default function HomeScreen({ navigation }: any) {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { nearbyDrivers } = useSelector((state: RootState) => state.driver);

  const [refreshing, setRefreshing] = useState(false);
  const [promoIndex, setPromoIndex] = useState(0);
  const promoFlatRef = useRef<FlatList>(null);
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const contentAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(headerOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(contentAnim, { toValue: 1, tension: 50, friction: 9, useNativeDriver: true }),
    ]).start();

    loadNearbyDrivers();

    // Auto-scroll promotions
    const promoTimer = setInterval(() => {
      setPromoIndex(prev => {
        const next = (prev + 1) % PROMOTIONS.length;
        promoFlatRef.current?.scrollToIndex({ index: next, animated: true });
        return next;
      });
    }, 4500);

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

  const handleServicePress = (serviceId: string) => {
    navigation.navigate('BookingFlow', {
      screen: 'PickupMap',
      params: { serviceType: serviceId }
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF3E0" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
        style={styles.scrollView}
      >
        {/* ─── Promotions Banner (Top Section) ───────────────── */}
        <View style={styles.promoContainer}>
          <FlatList
            ref={promoFlatRef}
            data={PROMOTIONS}
            keyExtractor={(item) => item.id}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => {
              const index = Math.round(e.nativeEvent.contentOffset.x / width);
              setPromoIndex(index);
            }}
            renderItem={({ item }) => (
              <View style={styles.promoSlide}>
                <View style={styles.promoCard}>
                  <View style={styles.promoLeft}>
                    <View style={styles.logoRow}>
                      <Ionicons name="car-sport" size={14} color={COLORS.primary} style={{ marginRight: 4 }} />
                      <Text style={styles.logoText}>Logo</Text>
                    </View>
                    <Text style={styles.promoTitle}>{item.title}</Text>
                    <Text style={styles.promoSubtitle}>{item.subtitle}</Text>
                    <TouchableOpacity style={styles.shopNowButton} activeOpacity={0.8}>
                      <Text style={styles.shopNowText}>SHOP NOW</Text>
                    </TouchableOpacity>
                    <Text style={styles.promoUrl}>www.mydriver.lk</Text>
                  </View>
                  <View style={styles.promoRight}>
                    <View style={styles.couponBorder}>
                      <Text style={styles.couponLabel}>{item.label}</Text>
                      <Text style={styles.couponDiscount}>{item.discount}</Text>
                      <Text style={styles.couponOffText}>OFF</Text>
                    </View>
                  </View>
                </View>
              </View>
            )}
          />
          {/* Promo Dot Indicators */}
          <View style={styles.promoDots}>
            {PROMOTIONS.map((_, i) => (
              <View
                key={i}
                style={[styles.promoDot, i === promoIndex && styles.promoActiveDot]}
              />
            ))}
          </View>
        </View>

        {/* ─── Main Content Sheet ──────────────────────────── */}
        <Animated.View
          style={[
            styles.contentSheet,
            {
              opacity: contentAnim,
              transform: [{
                translateY: contentAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [40, 0],
                }),
              }],
            },
          ]}
        >
          {/* Header (Greeting & Profile on Left, Notif on Right) */}
          <View style={styles.header}>
            <View style={styles.profileRow}>
              <View style={styles.avatarContainer}>
                <Image
                  source={{ uri: user?.avatar || 'https://randomuser.me/api/portraits/men/32.jpg' }}
                  style={styles.avatar}
                />
              </View>
              <View style={styles.greetingTextContainer}>
                <Text style={styles.greeting}>{getGreeting()}</Text>
                <Text style={styles.userName}>{user?.fullName?.split(' ')[0] || 'John'}</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.notifButton}
              onPress={() => navigation.navigate('Profile', { screen: 'Notifications' })}
              activeOpacity={0.8}
            >
              <Ionicons name="notifications-outline" size={22} color="#D35400" />
              <View style={styles.notifDot} />
            </TouchableOpacity>
          </View>

          {/* Quick Actions Row (Services) */}
          <View style={styles.servicesRow}>
            {SERVICE_TYPES.map((service) => {
              const isEmergency = service.id === 'emergency';
              return (
                <TouchableOpacity
                  key={service.id}
                  style={styles.serviceItem}
                  onPress={() => handleServicePress(service.id)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.serviceCircle, isEmergency && styles.emergencyCircle]}>
                    {isEmergency ? (
                      <MaterialCommunityIcons name="shield-alert-outline" size={26} color={COLORS.error} />
                    ) : (
                      <Ionicons name={service.iconName as any} size={26} color={COLORS.primary} />
                    )}
                  </View>
                  <Text style={styles.serviceLabel}>
                    {service.title.replace(' ', '\n')}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Premium Packages Banner */}
          <View style={styles.premiumBanner}>
            <View style={styles.premiumLeftAccent} />
            <View style={styles.premiumContent}>
              <Text style={styles.premiumTitle}>
                GET A <Text style={{ color: '#D4AF37', fontWeight: '900' }}>PREMIUM</Text> DRIVER FOR YOUR VEHICLE: UNLOCK ALL BENEFITS
              </Text>
              <View style={styles.goldStarsRow}>
                <Ionicons name="star" size={12} color="#D4AF37" />
                <Ionicons name="star" size={12} color="#D4AF37" style={{ marginHorizontal: 2 }} />
                <Ionicons name="star" size={12} color="#D4AF37" />
              </View>
            </View>
          </View>
          <View style={styles.premiumIndicator}>
            <View style={styles.premiumDashActive} />
            <View style={styles.premiumDash} />
            <View style={styles.premiumDash} />
          </View>

          {/* Location Selection Card */}
          <View style={styles.locationCard}>
            <View style={styles.locationInputRow}>
              <View style={styles.pinIconContainer}>
                <Ionicons name="location-sharp" size={22} color="#E65100" />
              </View>
              <TouchableOpacity
                style={styles.textInputTouchable}
                onPress={() => navigation.navigate('BookingFlow', { screen: 'PickupMap', params: { serviceType: 'drive_me_home' } })}
                activeOpacity={0.8}
              >
                <Text style={styles.textInputPlaceholder}>
                  Enter Destination for Driver to Pick You & Your Car
                </Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={() => navigation.navigate('BookingFlow', { screen: 'PickupMap', params: { serviceType: 'drive_me_home' } })}
              activeOpacity={0.9}
            >
              <Text style={styles.confirmButtonText}>Confirm Location</Text>
            </TouchableOpacity>
          </View>

          {/* Drivers Nearby */}
          <View style={styles.nearbySection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Drivers Nearby</Text>
              <View style={styles.activeBadge}>
                <Text style={styles.activeBadgeText}>• 5 ACTIVE</Text>
              </View>
            </View>
            <View style={styles.searchingBox}>
              <ActivityIndicator color={COLORS.primary} size="small" style={{ marginBottom: 8 }} />
              <Text style={styles.searchingText}>Searching for nearby drivers...</Text>
            </View>
          </View>
        </Animated.View>
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    backgroundColor: '#FFF3E0',
  },
  promoContainer: {
    paddingTop: 48,
    paddingBottom: 16,
    backgroundColor: '#FFF3E0',
    alignItems: 'center',
  },
  promoSlide: {
    width: width,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  promoCard: {
    width: width - 32,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#E65100',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  promoLeft: {
    width: '60%',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  logoText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#8E8E93',
    textTransform: 'uppercase',
  },
  promoTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1C1C1E',
    lineHeight: 22,
    marginBottom: 4,
  },
  promoSubtitle: {
    fontSize: 11,
    color: '#55555C',
    marginBottom: 12,
  },
  shopNowButton: {
    backgroundColor: '#000000',
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  shopNowText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '800',
  },
  promoUrl: {
    fontSize: 9,
    color: '#8E8E93',
  },
  promoRight: {
    width: '35%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  couponBorder: {
    borderWidth: 1.5,
    borderColor: '#FFD180',
    borderStyle: 'dashed',
    borderRadius: 12,
    backgroundColor: '#FFF8E1',
    paddingHorizontal: 10,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  couponLabel: {
    fontSize: 7,
    fontWeight: '800',
    color: '#E65100',
    marginBottom: 2,
    textAlign: 'center',
  },
  couponDiscount: {
    fontSize: 26,
    fontWeight: '900',
    color: '#E65100',
    lineHeight: 30,
  },
  couponOffText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#E65100',
  },
  promoDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    gap: 6,
  },
  promoDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFE0B2',
  },
  promoActiveDot: {
    backgroundColor: '#E65100',
    width: 18,
  },
  contentSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 20,
    paddingTop: 24,
    marginTop: -8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#FFE0B2',
    overflow: 'hidden',
    marginRight: 12,
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  greetingTextContainer: {
    justifyContent: 'center',
  },
  greeting: {
    fontSize: 10,
    color: '#8E8E93',
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  userName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1C1C1E',
    letterSpacing: -0.5,
    marginTop: 1,
  },
  notifButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#FFE0B2',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  notifDot: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FF3B30',
  },
  servicesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  serviceItem: {
    width: (width - 40 - 24) / 4,
    alignItems: 'center',
  },
  serviceCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#FFF3E0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    shadowColor: '#E65100',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  emergencyCircle: {
    backgroundColor: '#FFEBEE',
  },
  serviceLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1C1C1E',
    textAlign: 'center',
    lineHeight: 14,
  },
  premiumBanner: {
    width: '100%',
    backgroundColor: '#FFFDF0',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F3C04F',
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#F3C04F',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 1,
  },
  premiumLeftAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 6,
    backgroundColor: '#F3C04F',
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  premiumContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  premiumTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#5D4037',
    textAlign: 'center',
    lineHeight: 16,
    letterSpacing: 0.5,
  },
  goldStarsRow: {
    flexDirection: 'row',
    marginTop: 8,
    justifyContent: 'center',
  },
  premiumIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
    gap: 4,
  },
  premiumDashActive: {
    width: 14,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#F3C04F',
  },
  premiumDash: {
    width: 6,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#FFE082',
  },
  locationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#FFE0B2',
    padding: 16,
    marginBottom: 24,
    shadowColor: '#E65100',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  locationInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  pinIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FFF3E0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#FFE0B2',
  },
  textInputTouchable: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderColor: '#FFE0B2',
    borderRadius: 12,
    paddingHorizontal: 12,
    justifyContent: 'center',
    backgroundColor: '#FAF9F6',
  },
  textInputPlaceholder: {
    fontSize: 11,
    color: '#8E8E93',
    fontWeight: '600',
    lineHeight: 14,
  },
  confirmButton: {
    backgroundColor: '#E65100',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#E65100',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  nearbySection: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1C1C1E',
    letterSpacing: -0.4,
  },
  activeBadge: {
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFD180',
  },
  activeBadgeText: {
    color: '#E65100',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  searchingBox: {
    backgroundColor: '#F5F5F7',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    paddingVertical: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  searchingText: {
    color: '#8E8E93',
    fontSize: 12,
    fontWeight: '700',
  },
});

