import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { setBalance } from '../../store/slices/walletSlice';
import { userApi } from '../../api';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, SHADOWS } from '../../constants';

const MOCK_TRANSACTIONS = [
  { id: '1', type: 'debit', amount: 850, description: 'Airport Driver - Trip', date: '2024-01-15T10:30:00Z' },
  { id: '2', type: 'credit', amount: 500, description: 'Wallet Top-up', date: '2024-01-14T09:00:00Z' },
  { id: '3', type: 'debit', amount: 320, description: 'Drive Me Home - Trip', date: '2024-01-13T23:15:00Z' },
  { id: '4', type: 'credit', amount: 1000, description: 'Wallet Top-up', date: '2024-01-10T11:00:00Z' },
];

const ADD_AMOUNTS = [500, 1000, 2000, 5000];

export default function WalletScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { balance, isLoading } = useSelector((state: RootState) => state.wallet);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadWallet();
  }, []);

  const loadWallet = async () => {
    try {
      const data = await userApi.getWallet();
      dispatch(setBalance(data.balance));
    } catch {}
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadWallet();
    setRefreshing(false);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Wallet</Text>
      </View>

      {/* Balance Card */}
      <View style={styles.balanceCard}>
        <View style={styles.balanceBg1} />
        <View style={styles.balanceBg2} />
        <Text style={styles.balanceLabel}>Total Balance</Text>
        <Text style={styles.balanceAmount}>
          LKR {(user?.walletBalance || balance || 0).toLocaleString()}
        </Text>
        <Text style={styles.balanceSub}>Available to spend</Text>
        <View style={styles.balanceActions}>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionIcon}>📤</Text>
            <Text style={styles.actionLabel}>Send</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, styles.actionButtonPrimary]}>
            <Text style={styles.actionIcon}>➕</Text>
            <Text style={[styles.actionLabel, { color: COLORS.white }]}>Top Up</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionIcon}>📊</Text>
            <Text style={styles.actionLabel}>History</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Quick Add */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Top-Up</Text>
        <View style={styles.quickAddRow}>
          {ADD_AMOUNTS.map((amount) => (
            <TouchableOpacity key={amount} style={styles.quickAddChip}>
              <Text style={styles.quickAddText}>+{amount}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Payment Methods */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Payment Methods</Text>
        <View style={styles.paymentCard}>
          {[
            { icon: '💳', name: 'Credit / Debit Card', sub: 'Visa, Mastercard' },
            { icon: '🏦', name: 'PayHere', sub: 'Sri Lanka local payments' },
            { icon: '🍎', name: 'Apple Pay', sub: 'Quick & secure' },
          ].map((pm, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.paymentMethod, i < 2 && styles.paymentMethodBorder]}
            >
              <View style={styles.pmIconBg}>
                <Text style={styles.pmIcon}>{pm.icon}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.pmName}>{pm.name}</Text>
                <Text style={styles.pmSub}>{pm.sub}</Text>
              </View>
              <Text style={styles.pmArrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Transaction History */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Transactions</Text>
        <View style={styles.transactionCard}>
          {MOCK_TRANSACTIONS.map((tx, i) => (
            <View
              key={tx.id}
              style={[styles.txRow, i < MOCK_TRANSACTIONS.length - 1 && styles.txBorder]}
            >
              <View style={[styles.txIconBg, { backgroundColor: tx.type === 'credit' ? `${COLORS.secondary}20` : `${COLORS.error}15` }]}>
                <Text style={styles.txIcon}>{tx.type === 'credit' ? '⬇️' : '⬆️'}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.txDesc} numberOfLines={1}>{tx.description}</Text>
                <Text style={styles.txDate}>{formatDate(tx.date)}</Text>
              </View>
              <Text style={[
                styles.txAmount,
                { color: tx.type === 'credit' ? COLORS.secondary : COLORS.error },
              ]}>
                {tx.type === 'credit' ? '+' : '-'} LKR {tx.amount}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    paddingHorizontal: SPACING.xl,
    paddingTop: 60,
    paddingBottom: SPACING.md,
  },
  headerTitle: { fontSize: FONT_SIZES['2xl'], fontWeight: '800', color: COLORS.white },
  balanceCard: {
    marginHorizontal: SPACING.xl,
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: SPACING.lg,
  },
  balanceBg1: {
    position: 'absolute', width: 200, height: 200, borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.05)', top: -60, right: -40,
  },
  balanceBg2: {
    position: 'absolute', width: 150, height: 150, borderRadius: 75,
    backgroundColor: 'rgba(255,255,255,0.05)', bottom: -30, left: 20,
  },
  balanceLabel: { fontSize: FONT_SIZES.sm, color: 'rgba(255,255,255,0.7)', fontWeight: '600', marginBottom: 8 },
  balanceAmount: { fontSize: 36, fontWeight: '800', color: COLORS.white, letterSpacing: -1 },
  balanceSub: { fontSize: FONT_SIZES.xs, color: 'rgba(255,255,255,0.6)', marginTop: 4, marginBottom: SPACING.lg },
  balanceActions: { flexDirection: 'row', gap: 10 },
  actionButton: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: 10,
    alignItems: 'center',
    gap: 4,
  },
  actionButtonPrimary: { backgroundColor: 'rgba(255,255,255,0.25)' },
  actionIcon: { fontSize: 20 },
  actionLabel: { fontSize: FONT_SIZES.xs, color: 'rgba(255,255,255,0.9)', fontWeight: '600' },
  section: { paddingHorizontal: SPACING.xl, marginBottom: SPACING.lg },
  sectionTitle: { fontSize: FONT_SIZES.lg, fontWeight: '800', color: COLORS.white, marginBottom: SPACING.md },
  quickAddRow: { flexDirection: 'row', gap: 10 },
  quickAddChip: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  quickAddText: { color: COLORS.primary, fontSize: FONT_SIZES.sm, fontWeight: '800' },
  paymentCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    overflow: 'hidden',
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.base,
    gap: 12,
  },
  paymentMethodBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.cardBorder },
  pmIconBg: {
    width: 44, height: 44, borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.surfaceLight, alignItems: 'center', justifyContent: 'center',
  },
  pmIcon: { fontSize: 22 },
  pmName: { fontSize: FONT_SIZES.base, fontWeight: '600', color: COLORS.textPrimary },
  pmSub: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary, marginTop: 2 },
  pmArrow: { fontSize: 20, color: COLORS.textMuted },
  transactionCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    overflow: 'hidden',
  },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.base,
    gap: 12,
  },
  txBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.cardBorder },
  txIconBg: {
    width: 40, height: 40, borderRadius: BORDER_RADIUS.sm,
    alignItems: 'center', justifyContent: 'center',
  },
  txIcon: { fontSize: 18 },
  txDesc: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: COLORS.textPrimary },
  txDate: { fontSize: FONT_SIZES.xs, color: COLORS.textMuted, marginTop: 2 },
  txAmount: { fontSize: FONT_SIZES.sm, fontWeight: '700' },
});
