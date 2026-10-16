import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useWallet } from '@/lib/wallet-context';
import { CHAIN_CONFIG, type Chain } from '@/lib/wallet-store';
import { formatCurrency, formatCrypto, shortenAddress, formatDate } from '@/lib/format';

type FilterType = 'all' | 'send' | 'receive' | 'swap';

export default function HistoryScreen() {
  const { state } = useWallet();
  const [filter, setFilter] = useState<FilterType>('all');
  const [selectedTx, setSelectedTx] = useState<typeof state.transactions[0] | null>(null);

  const filtered = filter === 'all'
    ? state.transactions
    : state.transactions.filter(tx => tx.type === filter);

  const filters: Array<{ id: FilterType; label: string }> = [
    { id: 'all', label: 'All' },
    { id: 'receive', label: 'Received' },
    { id: 'send', label: 'Sent' },
    { id: 'swap', label: 'Swapped' },
  ];

  const getTxIcon = (type: string) => {
    if (type === 'send') return '↑';
    if (type === 'receive') return '↓';
    if (type === 'swap') return '⇄';
    return '•';
  };

  const getTxColor = (type: string) => {
    if (type === 'send') return '#EF4444';
    if (type === 'receive') return '#10B981';
    if (type === 'swap') return '#8B5CF6';
    return '#6B7280';
  };

  const getTxLabel = (type: string) => {
    if (type === 'send') return 'Sent';
    if (type === 'receive') return 'Received';
    if (type === 'swap') return 'Swapped';
    return type;
  };

  const getStatusColor = (status: string) => {
    if (status === 'confirmed') return '#10B981';
    if (status === 'pending') return '#F59E0B';
    return '#EF4444';
  };

  const getStatusLabel = (status: string) => {
    if (status === 'confirmed') return 'Confirmed';
    if (status === 'pending') return 'Pending';
    return 'Failed';
  };

  // Group by date
  const grouped: Record<string, typeof state.transactions> = {};
  filtered.forEach(tx => {
    const date = formatDate(tx.timestamp, 'longDate');
    if (!grouped[date]) grouped[date] = [];
    grouped[date].push(tx);
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Transactions</Text>
          <Text style={styles.subtitle}>{state.transactions.length} Transactions</Text>
        </View>

        {/* Filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
          {filters.map(f => (
            <TouchableOpacity
              key={f.id}
              style={[styles.filterChip, filter === f.id && styles.filterChipActive]}
              onPress={() => setFilter(f.id)}
            >
              <Text style={[styles.filterChipText, filter === f.id && styles.filterChipTextActive]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{formatCurrency(
              state.transactions.filter(t => t.type === 'receive').reduce((s, t) => s + t.usdValue, 0)
            )}</Text>
            <Text style={styles.statLabel}>Received</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: '#EF4444' }]}>{formatCurrency(
              state.transactions.filter(t => t.type === 'send').reduce((s, t) => s + t.usdValue, 0)
            )}</Text>
            <Text style={styles.statLabel}>Sent</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{state.transactions.length}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
        </View>

        {/* Transaction Groups */}
        {Object.entries(grouped).map(([date, txs]) => (
          <View key={date} style={styles.group}>
            <Text style={styles.groupDate}>{date}</Text>
            {txs.map(tx => {
              const color = getTxColor(tx.type);
              const chain = CHAIN_CONFIG[tx.chain as Chain];
              return (
                <TouchableOpacity
                  key={tx.id}
                  style={styles.txCard}
                  onPress={() => setSelectedTx(tx)}
                >
                  <View style={[styles.txIcon, { backgroundColor: color + '20' }]}>
                    <Text style={[styles.txIconText, { color }]}>{getTxIcon(tx.type)}</Text>
                  </View>
                  <View style={styles.txInfo}>
                    <View style={styles.txTopRow}>
                      <Text style={styles.txType}>{getTxLabel(tx.type)}</Text>
                      <Text style={[styles.txAmount, { color }]}>
                        {tx.type === 'send' ? '-' : '+'}{formatCrypto(tx.amount, tx.symbol, 4)}
                      </Text>
                    </View>
                    <View style={styles.txBottomRow}>
                      <View style={[styles.chainBadge, { backgroundColor: chain.color + '20' }]}>
                        <Text style={[styles.chainBadgeText, { color: chain.color }]}>{chain.symbol}</Text>
                      </View>
                      <Text style={styles.txTime}>
                        {formatDate(tx.timestamp, 'time')}
                      </Text>
                      <View style={[styles.statusBadge, { backgroundColor: getStatusColor(tx.status) + '20' }]}>
                        <Text style={[styles.statusText, { color: getStatusColor(tx.status) }]}>
                          {getStatusLabel(tx.status)}
                        </Text>
                      </View>
                      <Text style={styles.txUSD}>{formatCurrency(tx.usdValue)}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}

        {filtered.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={styles.emptyText}>No transactions found</Text>
          </View>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>

      {/* Transaction Detail Modal */}
      <Modal visible={!!selectedTx} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            {selectedTx && (
              <>
                <View style={styles.txDetailHeader}>
                  <View style={[styles.txDetailIcon, { backgroundColor: getTxColor(selectedTx.type) + '20' }]}>
                    <Text style={[styles.txDetailIconText, { color: getTxColor(selectedTx.type) }]}>
                      {getTxIcon(selectedTx.type)}
                    </Text>
                  </View>
                  <Text style={styles.txDetailTitle}>{getTxLabel(selectedTx.type)}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(selectedTx.status) + '20' }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(selectedTx.status) }]}>
                      {getStatusLabel(selectedTx.status)}
                    </Text>
                  </View>
                </View>

                <Text style={styles.txDetailAmount}>
                  {selectedTx.type === 'send' ? '-' : '+'}{formatCrypto(selectedTx.amount, selectedTx.symbol, 6)}
                </Text>
                <Text style={styles.txDetailUSD}>{formatCurrency(selectedTx.usdValue)}</Text>

                <View style={styles.txDetailRows}>
                  {[
                    { label: 'From', value: shortenAddress(selectedTx.from, 8) },
                    { label: 'To', value: shortenAddress(selectedTx.to, 8) },
                    { label: 'Network', value: CHAIN_CONFIG[selectedTx.chain as Chain].name },
                    { label: 'Fee', value: selectedTx.fee !== undefined && selectedTx.fee !== null ? `${selectedTx.fee} ${selectedTx.symbol}` : 'N/A' },
                    { label: 'Date', value: formatDate(selectedTx.timestamp) },
                    { label: 'TX Hash', value: shortenAddress(selectedTx.txHash, 8) },
                  ].map(row => (
                    <View key={row.label} style={styles.txDetailRow}>
                      <Text style={styles.txDetailLabel}>{row.label}</Text>
                      <Text style={styles.txDetailValue}>{row.value}</Text>
                    </View>
                  ))}
                </View>

                <TouchableOpacity style={styles.explorerBtn}>
                  <Text style={styles.explorerBtnText}>🔍 View in Explorer</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.closeBtn} onPress={() => setSelectedTx(null)}>
                  <Text style={styles.closeBtnText}>Close</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0E1A' },
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16 },
  title: { fontSize: 28, fontWeight: '800', color: '#F9FAFB' },
  subtitle: { fontSize: 14, color: '#9CA3AF', marginTop: 4 },
  filterRow: { paddingLeft: 20, marginBottom: 16 },
  filterChip: {
    backgroundColor: '#111827',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#1F2937',
  },
  filterChipActive: { backgroundColor: '#1D4ED8', borderColor: '#3B82F6' },
  filterChipText: { fontSize: 13, color: '#9CA3AF', fontWeight: '600' },
  filterChipTextActive: { color: '#fff' },
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: 20,
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  statCard: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 16, fontWeight: '700', color: '#10B981', marginBottom: 4 },
  statLabel: { fontSize: 11, color: '#6B7280' },
  statDivider: { width: 1, backgroundColor: '#1F2937', marginHorizontal: 8 },
  group: { marginHorizontal: 20, marginBottom: 16 },
  groupDate: { fontSize: 13, color: '#6B7280', fontWeight: '600', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  txCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 16,
    marginBottom: 8,
  },
  txIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  txIconText: { fontSize: 20, fontWeight: '700' },
  txInfo: { flex: 1 },
  txTopRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  txType: { fontSize: 15, fontWeight: '600', color: '#F9FAFB' },
  txAmount: { fontSize: 15, fontWeight: '700' },
  txBottomRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  chainBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  chainBadgeText: { fontSize: 10, fontWeight: '700' },
  txTime: { fontSize: 12, color: '#6B7280' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  statusText: { fontSize: 11, fontWeight: '700' },
  txUSD: { fontSize: 12, color: '#6B7280', marginLeft: 'auto' },
  emptyState: { alignItems: 'center', paddingVertical: 64 },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyText: { fontSize: 16, color: '#6B7280' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: '#111827',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: 40,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#374151',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  txDetailHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  txDetailIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  txDetailIconText: { fontSize: 24, fontWeight: '700' },
  txDetailTitle: { fontSize: 20, fontWeight: '700', color: '#F9FAFB', flex: 1 },
  txDetailAmount: { fontSize: 32, fontWeight: '800', color: '#F9FAFB', textAlign: 'center', marginBottom: 4 },
  txDetailUSD: { fontSize: 16, color: '#9CA3AF', textAlign: 'center', marginBottom: 24 },
  txDetailRows: { backgroundColor: '#1F2937', borderRadius: 16, padding: 16, marginBottom: 16 },
  txDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  txDetailLabel: { fontSize: 13, color: '#6B7280' },
  txDetailValue: { fontSize: 13, color: '#F9FAFB', fontWeight: '600', fontFamily: 'monospace' },
  explorerBtn: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  explorerBtnText: { color: '#3B82F6', fontSize: 15, fontWeight: '600' },
  closeBtn: {
    backgroundColor: '#374151',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  closeBtnText: { color: '#9CA3AF', fontSize: 15, fontWeight: '600' },
});
