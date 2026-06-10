import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { logoutUser, updateUser } from '../../store/slices/authSlice';
import { userApi } from '../../api';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, SHADOWS } from '../../constants';

export default function ProfileScreen({ navigation }: any) {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadProfile = async () => {
    try {
      const data = await userApi.getProfile();
      dispatch(updateUser(data));
    } catch {}
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProfile();
    setRefreshing(false);
  };

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: () => dispatch(logoutUser()) },
    ]);
  };

  const MENU_ITEMS = [
    { icon: '🚗', label: 'My Vehicles', onPress: () => navigation.navigate('Vehicles') },
    { icon: '📋', label: 'Booking History', onPress: () => navigation.navigate('Bookings') },
    { icon: '🆘', label: 'Emergency Contacts', onPress: () => navigation.navigate('EmergencyContacts') },
    { icon: '🔔', label: 'Notifications', onPress: () => navigation.navigate('Notifications') },
    { icon: '⚙️', label: 'Settings', onPress: () => navigation.navigate('Settings') },
    { icon: '❓', label: 'Help & Support', onPress: () => {} },
    { icon: '📜', label: 'Privacy Policy', onPress: () => {} },
    { icon: '🌟', label: 'Rate the App', onPress: () => {} },
  ];

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => navigation.navigate('EditProfile')}
        >
          <Text style={styles.editButtonText}>✏️ Edit</Text>
        </TouchableOpacity>
      </View>

      {/* Profile Card */}
      <View style={styles.profileCard}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.fullName?.charAt(0) || '?'}</Text>
          </View>
          <View style={styles.verifiedBadge}>
            <Text style={styles.verifiedIcon}>✓</Text>
          </View>
        </View>
        <Text style={styles.userName}>{user?.fullName || 'User'}</Text>
        <Text style={styles.userPhone}>{user?.phone}</Text>
        <Text style={styles.userEmail}>{user?.email}</Text>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>💳</Text>
            <Text style={styles.statLabel}>LKR {user?.walletBalance?.toLocaleString() || '0'}</Text>
            <Text style={styles.statSub}>Wallet</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statValue}>⭐</Text>
            <Text style={styles.statLabel}>4.8</Text>
            <Text style={styles.statSub}>Rating</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statValue}>🚗</Text>
            <Text style={styles.statLabel}>12</Text>
            <Text style={styles.statSub}>Trips</Text>
          </View>
        </View>
      </View>

      {/* Menu */}
      <View style={styles.menuSection}>
        {MENU_ITEMS.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.menuItem,
              index < MENU_ITEMS.length - 1 && styles.menuItemBorder,
            ]}
            onPress={item.onPress}
            activeOpacity={0.7}
          >
            <Text style={styles.menuIcon}>{item.icon}</Text>
            <Text style={styles.menuLabel}>{item.label}</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>🚪 Sign Out</Text>
      </TouchableOpacity>

      <Text style={styles.version}>Driver On Demand v1.0.0</Text>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingTop: 60,
    paddingBottom: SPACING.md,
  },
  headerTitle: { fontSize: FONT_SIZES['2xl'], fontWeight: '800', color: COLORS.black },
  editButton: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  editButtonText: { color: COLORS.textPrimary, fontSize: FONT_SIZES.sm, fontWeight: '600' },
  profileCard: {
    marginHorizontal: SPACING.xl,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    marginBottom: SPACING.lg,
    ...SHADOWS.md,
  },
  avatarContainer: { position: 'relative', marginBottom: 12 },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: `${COLORS.primary}50`,
  },
  avatarText: { fontSize: 32, color: COLORS.white, fontWeight: '700' },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.surface,
  },
  verifiedIcon: { fontSize: 12, color: COLORS.white, fontWeight: '700' },
  userName: { fontSize: FONT_SIZES.xl, fontWeight: '800', color: COLORS.black, marginBottom: 4 },
  userPhone: { fontSize: FONT_SIZES.base, color: COLORS.textSecondary, marginBottom: 2 },
  userEmail: { fontSize: FONT_SIZES.sm, color: COLORS.textMuted, marginBottom: SPACING.lg },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    backgroundColor: COLORS.surfaceLight,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.base,
  },
  stat: { flex: 1, alignItems: 'center', gap: 3 },
  statValue: { fontSize: 22 },
  statLabel: { fontSize: FONT_SIZES.sm, fontWeight: '800', color: COLORS.black },
  statSub: { fontSize: FONT_SIZES.xs, color: COLORS.textMuted },
  statDivider: { width: 1, height: 36, backgroundColor: COLORS.cardBorder },
  menuSection: {
    marginHorizontal: SPACING.xl,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    overflow: 'hidden',
    marginBottom: SPACING.base,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: SPACING.base,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cardBorder,
  },
  menuIcon: { fontSize: 20, marginRight: 14, width: 28, textAlign: 'center' },
  menuLabel: { flex: 1, fontSize: FONT_SIZES.base, color: COLORS.textPrimary, fontWeight: '500' },
  menuArrow: { fontSize: 20, color: COLORS.textMuted },
  logoutButton: {
    marginHorizontal: SPACING.xl,
    backgroundColor: `${COLORS.error}15`,
    borderRadius: BORDER_RADIUS.lg,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: `${COLORS.error}30`,
    marginBottom: SPACING.base,
  },
  logoutText: { color: COLORS.error, fontSize: FONT_SIZES.base, fontWeight: '700' },
  version: { textAlign: 'center', color: COLORS.textMuted, fontSize: FONT_SIZES.xs, marginTop: 4 },
});
