import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useWallet } from '@/lib/wallet-context';
import { CHAIN_CONFIG } from '@/lib/wallet-store';
import { formatCurrency, formatCrypto, getTimeUntilTrigger, formatDate } from '@/lib/format';

const { width } = Dimensions.get('window');

function DaiScoreRing({ score }: { score: number }) {
  const color = score >= 70 ? '#10B981' : score >= 40 ? '#F59E0B' : '#EF4444';
  const label = score >= 70 ? 'Good' : score >= 40 ? 'Medium' : 'Critical';
  return (
    <View style={[scoreStyles.container, { borderColor: color }]}>
      <Text style={[scoreStyles.score, { color }]}>{score}</Text>
      <Text style={[scoreStyles.label, { color }]}>{label}</Text>
      <Text style={scoreStyles.sub}>DAIO Score</Text>
    </View>
  );
}

const scoreStyles = StyleSheet.create({
  container: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#111827',
  },
  score: {
    fontSize: 22,
    fontWeight: '800',
  },
  label: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  sub: {
    fontSize: 8,
    color: '#6B7280',
    marginTop: 1,
  },
});

export default function DashboardScreen() {
  const { state, checkIn, refreshBalances } = useWallet();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  const topTokens = state.tokens.slice(0, 4);
  const recentTx = state.transactions.slice(0, 3);
  const dmsTimeLeft = getTimeUntilTrigger(state.deadManSwitch);
  const dmsColor = state.deadManSwitch.status === 'active' ? '#10B981' :
    state.deadManSwitch.status === 'warning_1' ? '#F59E0B' :
    state.deadManSwitch.status === 'warning_2' ? '#F97316' :
    state.deadManSwitch.status === 'warning_3' ? '#EF4444' : '#6B7280';

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([checkIn(), refreshBalances()]);
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3B82F6" />}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hello 👋</Text>
            <Text style={styles.walletName}>DAIO Wallet</Text>
          </View>
          <View style={styles.headerRight}>
            <DaiScoreRing score={state.daiScore} />
          </View>
        </View>

        {/* Portfolio Card */}
        <View style={styles.portfolioCard}>
          <Text style={styles.portfolioLabel}>Total Portfolio</Text>
          <Text style={styles.portfolioValue}>{formatCurrency(state.totalPortfolioUSD)}</Text>
          <View style={styles.portfolioChange}>
            <Text style={styles.portfolioChangePositive}>▲ +2.34%</Text>
            <Text style={styles.portfolioChangePeriod}>Today</Text>
          </View>

          {/* Quick Actions */}
          <View style={styles.quickActions}>
            {[
              { icon: '↑', label: 'Send', color: '#3B82F6', route: '/(tabs)/assets' },
              { icon: '↓', label: 'Receive', color: '#10B981', route: '/(tabs)/assets' },
              { icon: '⇄', label: 'Swap', color: '#8B5CF6', route: '/(tabs)/assets' },
              { icon: '📊', label: 'Stake', color: '#F59E0B', route: '/(tabs)/assets' },
            ].map((action) => (
              <TouchableOpacity
                key={action.label}
                style={styles.quickAction}
                onPress={() => router.push(action.route as any)}
              >
                <View style={[styles.quickActionIcon, { backgroundColor: action.color + '20' }]}>
                  <Text style={[styles.quickActionIconText, { color: action.color }]}>{action.icon}</Text>
                </View>
                <Text style={styles.quickActionLabel}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* DAIO Shield Status */}
        <TouchableOpacity
          style={[styles.shieldBanner, { borderColor: dmsColor + '40' }]}
          onPress={() => router.push('/(tabs)/shield' as any)}
        >
          <View style={styles.shieldBannerLeft}>
            <Text style={styles.shieldBannerIcon}>🛡️</Text>
            <View>
              <Text style={styles.shieldBannerTitle}>DAIO Shield</Text>
              <Text style={styles.shieldBannerSubtitle}>
                {state.deadManSwitch.enabled
                  ? `Dead Man's Switch: ${dmsTimeLeft} remaining`
                  : 'Inheritance protection not configured'}
              </Text>
            </View>
          </View>
          <View style={styles.shieldBannerRight}>
            <View style={[styles.shieldStatus, { backgroundColor: dmsColor + '20' }]}>
              <Text style={[styles.shieldStatusText, { color: dmsColor }]}>
                {state.deadManSwitch.enabled ? 'Active' : 'Inactive'}
              </Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </View>
        </TouchableOpacity>

        {/* Proof of Life Required - High Priority */}
        {state.deadManSwitch.status === 'warning_3' && (
          <TouchableOpacity 
            style={styles.polAlert}
            onPress={() => router.push('/proof-of-life' as any)}
          >
            <View style={styles.polIconContainer}>
              <Text style={styles.polIcon}>🚨</Text>
            </View>
            <View style={styles.polContent}>
              <Text style={styles.polTitle}>Proof of Life required!</Text>
              <Text style={styles.polText}>Confirm your identity immediately to stop key distribution.</Text>
            </View>
            <View style={styles.polBtn}>
              <Text style={styles.polBtnText}>NOW →</Text>
            </View>
          </TouchableOpacity>
        )}

        {/* Alerts */}
        {state.daiScore < 50 && state.deadManSwitch.status !== 'warning_3' && (
          <View style={styles.alertCard}>
            <Text style={styles.alertIcon}>⚠️</Text>
            <View style={styles.alertContent}>
              <Text style={styles.alertTitle}>DAIO Score low: {state.daiScore}/100</Text>
              <Text style={styles.alertText}>Configure your inheritance protection to secure your assets</Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/(tabs)/shield' as any)}>
              <Text style={styles.alertAction}>Now →</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Top Assets */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Top Assets</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/assets' as any)}>
              <Text style={styles.sectionAction}>View all →</Text>
            </TouchableOpacity>
          </View>
          {topTokens.map(token => {
            const chain = CHAIN_CONFIG[token.chain];
            const isPositive = token.priceChange24h >= 0;
            return (
              <TouchableOpacity key={token.id} style={styles.tokenRow}>
                <View style={[styles.tokenIcon, { backgroundColor: chain.color + '20' }]}>
                  <Text style={[styles.tokenIconText, { color: chain.color }]}>{chain.icon}</Text>
                </View>
                <View style={styles.tokenInfo}>
                  <Text style={styles.tokenSymbol}>{token.symbol}</Text>
                  <Text style={styles.tokenName}>{token.name}</Text>
                </View>
                <View style={styles.tokenValues}>
                  <Text style={styles.tokenBalance}>{formatCurrency(token.balanceUSD)}</Text>
                  <Text style={[styles.tokenChange, { color: isPositive ? '#10B981' : '#EF4444' }]}>
                    {isPositive ? '▲' : '▼'} {Math.abs(token.priceChange24h).toFixed(2)}%
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Recent Transactions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/history' as any)}>
              <Text style={styles.sectionAction}>All →</Text>
            </TouchableOpacity>
          </View>
          {recentTx.map(tx => {
            const isSend = tx.type === 'send';
            const isSwap = tx.type === 'swap';
            const icon = isSend ? '↑' : isSwap ? '⇄' : '↓';
            const color = isSend ? '#EF4444' : isSwap ? '#8B5CF6' : '#10B981';
            const sign = isSend ? '-' : isSwap ? '~' : '+';
            return (
              <View key={tx.id} style={styles.txRow}>
                <View style={[styles.txIcon, { backgroundColor: color + '20' }]}>
                  <Text style={[styles.txIconText, { color }]}>{icon}</Text>
                </View>
                <View style={styles.txInfo}>
                  <Text style={styles.txType}>
                    {tx.type === 'send' ? 'Sent' : tx.type === 'receive' ? 'Received' : 'Swapped'}
                  </Text>
                  <Text style={styles.txDate}>
                    {formatDate(tx.timestamp)}
                  </Text>
                </View>
                <View style={styles.txValues}>
                  <Text style={[styles.txAmount, { color }]}>
                    {sign}{formatCrypto(tx.amount, tx.symbol, 4)}
                  </Text>
                  <Text style={styles.txUsd}>{formatCurrency(tx.usdValue)}</Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Beneficiaries Preview */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Beneficiaries</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/shield' as any)}>
              <Text style={styles.sectionAction}>Manage →</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.beneficiariesRow}>
            {state.beneficiaries.map((ben, i) => (
              <View key={ben.id} style={styles.beneficiaryChip}>
                <View style={[styles.beneficiaryAvatar, {
                  backgroundColor: ben.role === 'heir' ? '#10B98120' : ben.role === 'notary' ? '#F59E0B20' : '#8B5CF620'
                }]}>
                  <Text style={styles.beneficiaryAvatarText}>
                    {ben.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </Text>
                </View>
                <Text style={styles.beneficiaryName} numberOfLines={1}>{ben.name.split(' ')[0]}</Text>
                <Text style={styles.beneficiaryRole}>
                  {ben.role === 'heir' ? 'Heir' : ben.role === 'notary' ? 'Notary' : 'Guardian'}
                </Text>
              </View>
            ))}
            <TouchableOpacity
              style={styles.addBeneficiary}
              onPress={() => router.push('/(tabs)/shield' as any)}
            >
              <Text style={styles.addBeneficiaryText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0E1A',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
  greeting: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  walletName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#F9FAFB',
  },
  headerRight: {
    alignItems: 'center',
  },
  portfolioCard: {
    marginHorizontal: 20,
    backgroundColor: '#111827',
    borderRadius: 24,
    padding: 24,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#1F2937',
  },
  portfolioLabel: {
    fontSize: 13,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  portfolioValue: {
    fontSize: 36,
    fontWeight: '800',
    color: '#F9FAFB',
    marginBottom: 4,
  },
  portfolioChange: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 24,
  },
  portfolioChangePositive: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '600',
  },
  portfolioChangePeriod: {
    fontSize: 13,
    color: '#6B7280',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickAction: {
    alignItems: 'center',
    flex: 1,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  quickActionIconText: {
    fontSize: 22,
    fontWeight: '700',
  },
  quickActionLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  shieldBanner: {
    marginHorizontal: 20,
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
  },
  shieldBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  shieldBannerIcon: {
    fontSize: 28,
  },
  shieldBannerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#F9FAFB',
  },
  shieldBannerSubtitle: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  shieldBannerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  shieldStatus: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  shieldStatusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  chevron: {
    fontSize: 20,
    color: '#6B7280',
  },
  alertCard: {
    marginHorizontal: 20,
    backgroundColor: '#451A03',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#92400E',
    gap: 12,
  },
  alertIcon: {
    fontSize: 24,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FCD34D',
    marginBottom: 2,
  },
  alertText: {
    fontSize: 12,
    color: '#FDE68A',
    lineHeight: 16,
  },
  alertAction: {
    fontSize: 14,
    color: '#F59E0B',
    fontWeight: '700',
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F9FAFB',
  },
  sectionAction: {
    fontSize: 13,
    color: '#3B82F6',
    fontWeight: '600',
  },
  tokenRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 16,
    marginBottom: 8,
  },
  tokenIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  tokenIconText: {
    fontSize: 20,
    fontWeight: '700',
  },
  tokenInfo: {
    flex: 1,
  },
  tokenSymbol: {
    fontSize: 15,
    fontWeight: '700',
    color: '#F9FAFB',
  },
  tokenName: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  tokenValues: {
    alignItems: 'flex-end',
  },
  tokenBalance: {
    fontSize: 15,
    fontWeight: '700',
    color: '#F9FAFB',
  },
  tokenChange: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 16,
    marginBottom: 8,
  },
  txIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  txIconText: {
    fontSize: 18,
    fontWeight: '700',
  },
  txInfo: {
    flex: 1,
  },
  txType: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F9FAFB',
  },
  txDate: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  txValues: {
    alignItems: 'flex-end',
  },
  txAmount: {
    fontSize: 14,
    fontWeight: '700',
  },
  txUsd: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  beneficiariesRow: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  beneficiaryChip: {
    alignItems: 'center',
    width: 72,
  },
  beneficiaryAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  beneficiaryAvatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F9FAFB',
  },
  beneficiaryName: {
    fontSize: 12,
    color: '#F9FAFB',
    fontWeight: '600',
    textAlign: 'center',
  },
  beneficiaryRole: {
    fontSize: 10,
    color: '#6B7280',
    textAlign: 'center',
  },
  addBeneficiary: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1F2937',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#374151',
    borderStyle: 'dashed',
    marginTop: 0,
    alignSelf: 'flex-start',
  },
  addBeneficiaryText: {
    fontSize: 24,
    color: '#6B7280',
    fontWeight: '300',
  },
  polAlert: {
    marginHorizontal: 20,
    backgroundColor: '#EF4444',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  polIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  polIcon: {
    fontSize: 20,
  },
  polContent: {
    flex: 1,
  },
  polTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 2,
  },
  polText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 11,
    lineHeight: 14,
  },
  polBtn: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginLeft: 8,
  },
  polBtnText: {
    color: '#EF4444',
    fontSize: 11,
    fontWeight: '800',
  },
});
