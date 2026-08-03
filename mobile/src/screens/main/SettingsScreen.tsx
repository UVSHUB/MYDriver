import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS } from '../../constants';

export default function SettingsScreen({ navigation }: any) {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [locationServices, setLocationServices] = useState(true);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings ⚙️</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionHeader}>PREFERENCES</Text>
        
        <View style={styles.settingCard}>
          <View style={styles.row}>
            <View style={styles.iconCircle}>
              <Ionicons name="notifications-outline" size={22} color={COLORS.black} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.settingTitle}>Push Notifications</Text>
              <Text style={styles.settingDesc}>Ride status updates & promotions</Text>
            </View>
            <Switch value={notifications} onValueChange={setNotifications} trackColor={{ true: COLORS.black }} />
          </View>
        </View>

        <View style={styles.settingCard}>
          <View style={styles.row}>
            <View style={styles.iconCircle}>
              <Ionicons name="moon-outline" size={22} color={COLORS.black} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.settingTitle}>Dark Mode</Text>
              <Text style={styles.settingDesc}>Use high contrast dark theme</Text>
            </View>
            <Switch value={darkMode} onValueChange={setDarkMode} trackColor={{ true: COLORS.black }} />
          </View>
        </View>

        <View style={styles.settingCard}>
          <View style={styles.row}>
            <View style={styles.iconCircle}>
              <Ionicons name="location-outline" size={22} color={COLORS.black} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.settingTitle}>Location Services</Text>
              <Text style={styles.settingDesc}>Required for driver matching & navigation</Text>
            </View>
            <Switch value={locationServices} onValueChange={setLocationServices} trackColor={{ true: COLORS.black }} />
          </View>
        </View>

        <Text style={[styles.sectionHeader, { marginTop: SPACING.xl }]}>SUPPORT & ABOUT</Text>

        <TouchableOpacity style={styles.settingCard} onPress={() => Alert.alert('Terms of Service', 'Driver On Demand v1.0.0 terms and conditions.')}>
          <View style={styles.row}>
            <View style={styles.iconCircle}>
              <Ionicons name="document-text-outline" size={22} color={COLORS.black} />
            </View>
            <Text style={[styles.settingTitle, { flex: 1 }]}>Terms & Privacy Policy</Text>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingCard} onPress={() => Alert.alert('Support', 'Contact support at support@mydriver.app')}>
          <View style={styles.row}>
            <View style={styles.iconCircle}>
              <Ionicons name="help-circle-outline" size={22} color={COLORS.black} />
            </View>
            <Text style={[styles.settingTitle, { flex: 1 }]}>Help & Support</Text>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
          </View>
        </TouchableOpacity>

        <Text style={styles.versionText}>Driver On Demand v1.0.0 (Build 100)</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cardBorder,
    gap: 16,
  },
  backButton: { padding: 4 },
  headerTitle: { fontSize: FONT_SIZES.xl, fontWeight: '800', color: COLORS.textPrimary },
  content: { padding: SPACING.xl, gap: 12 },
  sectionHeader: { fontSize: 10, fontWeight: '800', color: COLORS.textMuted, letterSpacing: 1.2, marginBottom: 4 },
  settingCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.base,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  settingTitle: { fontSize: FONT_SIZES.base, fontWeight: '700', color: COLORS.textPrimary },
  settingDesc: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary, marginTop: 2 },
  versionText: { textAlign: 'center', color: COLORS.textMuted, fontSize: FONT_SIZES.xs, marginTop: SPACING['2xl'], fontWeight: '600' },
});
