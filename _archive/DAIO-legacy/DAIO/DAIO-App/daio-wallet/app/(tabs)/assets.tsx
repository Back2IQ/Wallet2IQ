import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useWallet } from '@/lib/wallet-context';
import { CHAIN_CONFIG, type Chain } from '@/lib/wallet-store';
import { formatCurrency, formatCrypto, shortenAddress } from '@/lib/format';
import QRCode from 'react-native-qrcode-svg';

const { width } = Dimensions.get('window');

const MOCK_ADDRESS = '0x742d35Cc6634C0532925a3b8D4C9C3E5B2F4A1D9';
const MOCK_BTC_ADDRESS = 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh';

type ModalType = 'send' | 'receive' | 'swap' | null;

export default function AssetsScreen() {
  const { state } = useWallet();
  const [selectedChain, setSelectedChain] = useState<Chain | 'all'>('all');
  const [modal, setModal] = useState<ModalType>(null);
  const [sendAmount, setSendAmount] = useState('');
  const [sendAddress, setSendAddress] = useState('');
  const [selectedToken, setSelectedToken] = useState(state.tokens[0]);

  const chains: Array<{ id: Chain | 'all'; label: string }> = [
    { id: 'all', label: 'All' },
    { id: 'bitcoin', label: 'BTC' },
    { id: 'ethereum', label: 'ETH' },
    { id: 'bnb', label: 'BNB' },
    { id: 'solana', label: 'SOL' },
    { id: 'polygon', label: 'MATIC' },
    { id: 'avalanche', label: 'AVAX' },
  ];

  const filteredTokens = selectedChain === 'all'
    ? state.tokens
    : state.tokens.filter(t => t.chain === selectedChain);

  const totalFiltered = filteredTokens.reduce((sum, t) => sum + t.balanceUSD, 0);

  const handleSend = () => {
    if (!sendAmount || !sendAddress) {
      Alert.alert('Error', 'Please enter amount and address');
      return;
    }
    Alert.alert(
      'Confirm Transaction',
      `${sendAmount} ${selectedToken.symbol} to ${shortenAddress(sendAddress)}?\n\nAmount: ${formatCurrency(parseFloat(sendAmount) * selectedToken.price)}\nFee: ~0.001 ${selectedToken.symbol}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send',
          style: 'destructive',
          onPress: () => {
            setModal(null);
            setSendAmount('');
            setSendAddress('');
            Alert.alert('✅ Sent', 'Transaction has been submitted and is being confirmed.');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Assets</Text>
          <Text style={styles.totalValue}>{formatCurrency(totalFiltered)}</Text>
        </View>

        {/* Chain Filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chainFilter}>
          {chains.map(chain => (
            <TouchableOpacity
              key={chain.id}
              style={[styles.chainChip, selectedChain === chain.id && styles.chainChipActive]}
              onPress={() => setSelectedChain(chain.id)}
            >
              {chain.id !== 'all' && (
                <View style={[styles.chainDot, { backgroundColor: CHAIN_CONFIG[chain.id as Chain].color }]} />
              )}
              <Text style={[styles.chainChipText, selectedChain === chain.id && styles.chainChipTextActive]}>
                {chain.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Action Buttons */}
        <View style={styles.actionRow}>
          {[
            { label: 'Send', icon: '↑', color: '#3B82F6', action: () => setModal('send') },
            { label: 'Receive', icon: '↓', color: '#10B981', action: () => setModal('receive') },
            { label: 'Swap', icon: '⇄', color: '#8B5CF6', action: () => setModal('swap') },
          ].map(btn => (
            <TouchableOpacity key={btn.label} style={styles.actionBtn} onPress={btn.action}>
              <View style={[styles.actionBtnIcon, { backgroundColor: btn.color + '20' }]}>
                <Text style={[styles.actionBtnIconText, { color: btn.color }]}>{btn.icon}</Text>
              </View>
              <Text style={styles.actionBtnLabel}>{btn.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Token List */}
        <View style={styles.tokenList}>
          {filteredTokens.map(token => {
            const chain = CHAIN_CONFIG[token.chain];
            const isPositive = token.priceChange24h >= 0;
            const allocation = (token.balanceUSD / state.totalPortfolioUSD) * 100;
            return (
              <TouchableOpacity
                key={token.id}
                style={styles.tokenCard}
                onPress={() => {
                  setSelectedToken(token);
                  setModal('send');
                }}
              >
                <View style={styles.tokenCardTop}>
                  <View style={[styles.tokenIcon, { backgroundColor: chain.color + '20' }]}>
                    <Text style={[styles.tokenIconText, { color: chain.color }]}>{chain.icon}</Text>
                  </View>
                  <View style={styles.tokenInfo}>
                    <View style={styles.tokenNameRow}>
                      <Text style={styles.tokenSymbol}>{token.symbol}</Text>
                      <View style={[styles.chainBadge, { backgroundColor: chain.color + '20' }]}>
                        <Text style={[styles.chainBadgeText, { color: chain.color }]}>{chain.name}</Text>
                      </View>
                    </View>
                    <Text style={styles.tokenBalance}>{formatCrypto(token.balance, token.symbol)}</Text>
                  </View>
                  <View style={styles.tokenValues}>
                    <Text style={styles.tokenUSD}>{formatCurrency(token.balanceUSD)}</Text>
                    <Text style={[styles.tokenChange, { color: isPositive ? '#10B981' : '#EF4444' }]}>
                      {isPositive ? '▲' : '▼'} {Math.abs(token.priceChange24h).toFixed(2)}%
                    </Text>
                  </View>
                </View>
                {/* Allocation bar */}
                <View style={styles.allocationBar}>
                  <View style={[styles.allocationFill, { width: `${allocation}%` as any, backgroundColor: chain.color }]} />
                </View>
                <View style={styles.tokenCardBottom}>
                  <Text style={styles.tokenPrice}>Price: {formatCurrency(token.price)}</Text>
                  <Text style={styles.tokenAllocation}>{allocation.toFixed(1)}% Portfolio</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>

      {/* Send Modal */}
      <Modal visible={modal === 'send'} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Send</Text>

            <Text style={styles.modalLabel}>Select Token</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tokenSelector}>
              {state.tokens.map(t => (
                <TouchableOpacity
                  key={t.id}
                  style={[styles.tokenSelectorChip, selectedToken.id === t.id && styles.tokenSelectorChipActive]}
                  onPress={() => setSelectedToken(t)}
                >
                  <Text style={styles.tokenSelectorText}>{t.symbol}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.modalLabel}>Recipient Address</Text>
            <TextInput
              style={styles.modalInput}
              value={sendAddress}
              onChangeText={setSendAddress}
              placeholder="0x... or bc1..."
              placeholderTextColor="#4B5563"
              autoCapitalize="none"
            />

            <Text style={styles.modalLabel}>Amount ({selectedToken.symbol})</Text>
            <TextInput
              style={styles.modalInput}
              value={sendAmount}
              onChangeText={setSendAmount}
              placeholder="0.00"
              placeholderTextColor="#4B5563"
              keyboardType="numeric"
            />
            {sendAmount && (
              <Text style={styles.modalHint}>
                ≈ {formatCurrency(parseFloat(sendAmount || '0') * selectedToken.price)}
              </Text>
            )}

            <View style={styles.modalBalanceRow}>
              <Text style={styles.modalBalanceLabel}>Available:</Text>
              <Text style={styles.modalBalanceValue}>{formatCrypto(selectedToken.balance, selectedToken.symbol)}</Text>
              <TouchableOpacity onPress={() => setSendAmount(selectedToken.balance.toString())}>
                <Text style={styles.modalMaxBtn}>MAX</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setModal(null)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalConfirmBtn} onPress={handleSend}>
                <Text style={styles.modalConfirmText}>Send →</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Receive Modal */}
      <Modal visible={modal === 'receive'} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Receive</Text>
            <View style={styles.qrContainer}>
              <QRCode
                value={MOCK_ADDRESS}
                size={200}
                backgroundColor="#111827"
                color="#F9FAFB"
              />
            </View>
            <View style={styles.addressBox}>
              <Text style={styles.addressText} numberOfLines={2}>{MOCK_ADDRESS}</Text>
              <TouchableOpacity style={styles.copyBtn}>
                <Text style={styles.copyBtnText}>📋 Copy</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.receiveNote}>
              Only send compatible assets to this address. Incorrect assets may be permanently lost.
            </Text>
            <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setModal(null)}>
              <Text style={styles.modalCancelText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Swap Modal */}
      <Modal visible={modal === 'swap'} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Swap</Text>
            <View style={styles.swapContainer}>
              <View style={styles.swapBox}>
                <Text style={styles.swapLabel}>From</Text>
                <View style={styles.swapRow}>
                  <Text style={styles.swapToken}>ETH</Text>
                  <TextInput
                    style={styles.swapInput}
                    placeholder="0.00"
                    placeholderTextColor="#4B5563"
                    keyboardType="numeric"
                  />
                </View>
                <Text style={styles.swapBalance}>Balance: 3.215 ETH</Text>
              </View>
              <View style={styles.swapArrow}>
                <Text style={styles.swapArrowText}>⇅</Text>
              </View>
              <View style={styles.swapBox}>
                <Text style={styles.swapLabel}>To</Text>
                <View style={styles.swapRow}>
                  <Text style={styles.swapToken}>BTC</Text>
                  <Text style={styles.swapOutputAmount}>≈ 0.0892</Text>
                </View>
                <Text style={styles.swapBalance}>Rate: 1 ETH ≈ 0.0278 BTC</Text>
              </View>
            </View>
            <View style={styles.swapInfo}>
              <Text style={styles.swapInfoText}>Slippage: 0.5% · Fee: 0.3%</Text>
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setModal(null)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalConfirmBtn}
                onPress={() => {
                  setModal(null);
                  Alert.alert('✅ Swap Initiated', 'Your swap is being processed.');
                }}
              >
                <Text style={styles.modalConfirmText}>Swap →</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0E1A' },
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16 },
  title: { fontSize: 28, fontWeight: '800', color: '#F9FAFB', marginBottom: 4 },
  totalValue: { fontSize: 22, fontWeight: '700', color: '#3B82F6' },
  chainFilter: { paddingLeft: 20, marginBottom: 16 },
  chainChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111827',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#1F2937',
    gap: 6,
  },
  chainChipActive: { backgroundColor: '#1D4ED8', borderColor: '#3B82F6' },
  chainDot: { width: 8, height: 8, borderRadius: 4 },
  chainChipText: { fontSize: 13, color: '#9CA3AF', fontWeight: '600' },
  chainChipTextActive: { color: '#fff' },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: '#111827',
    borderRadius: 20,
    padding: 16,
  },
  actionBtn: { alignItems: 'center', flex: 1 },
  actionBtnIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  actionBtnIconText: { fontSize: 24, fontWeight: '700' },
  actionBtnLabel: { fontSize: 12, color: '#9CA3AF', fontWeight: '600' },
  tokenList: { paddingHorizontal: 20 },
  tokenCard: {
    backgroundColor: '#111827',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#1F2937',
  },
  tokenCardTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  tokenIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  tokenIconText: { fontSize: 22, fontWeight: '700' },
  tokenInfo: { flex: 1 },
  tokenNameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  tokenSymbol: { fontSize: 16, fontWeight: '700', color: '#F9FAFB' },
  chainBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  chainBadgeText: { fontSize: 10, fontWeight: '700' },
  tokenBalance: { fontSize: 13, color: '#9CA3AF' },
  tokenValues: { alignItems: 'flex-end' },
  tokenUSD: { fontSize: 16, fontWeight: '700', color: '#F9FAFB' },
  tokenChange: { fontSize: 12, fontWeight: '600', marginTop: 2 },
  allocationBar: {
    height: 3,
    backgroundColor: '#1F2937',
    borderRadius: 2,
    marginBottom: 8,
    overflow: 'hidden',
  },
  allocationFill: { height: 3, borderRadius: 2 },
  tokenCardBottom: { flexDirection: 'row', justifyContent: 'space-between' },
  tokenPrice: { fontSize: 12, color: '#6B7280' },
  tokenAllocation: { fontSize: 12, color: '#6B7280' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
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
  modalTitle: { fontSize: 22, fontWeight: '700', color: '#F9FAFB', marginBottom: 20 },
  modalLabel: { fontSize: 13, color: '#9CA3AF', marginBottom: 8, marginTop: 12 },
  modalInput: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#374151',
  },
  modalHint: { fontSize: 13, color: '#6B7280', marginTop: 6 },
  modalBalanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  modalBalanceLabel: { fontSize: 13, color: '#6B7280' },
  modalBalanceValue: { fontSize: 13, color: '#F9FAFB', flex: 1 },
  modalMaxBtn: { fontSize: 13, color: '#3B82F6', fontWeight: '700' },
  modalButtons: { flexDirection: 'row', gap: 12, marginTop: 24 },
  modalCancelBtn: {
    flex: 1,
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  modalCancelText: { color: '#9CA3AF', fontSize: 16, fontWeight: '600' },
  modalConfirmBtn: {
    flex: 1,
    backgroundColor: '#3B82F6',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  modalConfirmText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  tokenSelector: { marginBottom: 4 },
  tokenSelectorChip: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
  },
  tokenSelectorChipActive: { backgroundColor: '#1D4ED8' },
  tokenSelectorText: { color: '#F9FAFB', fontSize: 14, fontWeight: '600' },
  qrContainer: {
    alignItems: 'center',
    backgroundColor: '#1A2235',
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
  },
  addressBox: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  addressText: {
    flex: 1,
    fontSize: 13,
    color: '#9CA3AF',
    fontFamily: 'monospace',
  },
  copyBtn: {
    backgroundColor: '#374151',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  copyBtnText: { fontSize: 13, color: '#F9FAFB' },
  receiveNote: { fontSize: 12, color: '#6B7280', textAlign: 'center', marginBottom: 16, lineHeight: 18 },
  swapContainer: { gap: 0, marginBottom: 16 },
  swapBox: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 16,
  },
  swapLabel: { fontSize: 12, color: '#6B7280', marginBottom: 8 },
  swapRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  swapToken: { fontSize: 20, fontWeight: '700', color: '#F9FAFB' },
  swapInput: { fontSize: 24, color: '#F9FAFB', textAlign: 'right', flex: 1 },
  swapOutputAmount: { fontSize: 24, fontWeight: '700', color: '#F9FAFB' },
  swapBalance: { fontSize: 12, color: '#6B7280', marginTop: 4 },
  swapArrow: {
    alignItems: 'center',
    paddingVertical: 8,
    backgroundColor: '#111827',
    zIndex: 1,
  },
  swapArrowText: { fontSize: 24, color: '#3B82F6' },
  swapInfo: { backgroundColor: '#1F2937', borderRadius: 12, padding: 12, marginBottom: 16 },
  swapInfoText: { fontSize: 13, color: '#9CA3AF', textAlign: 'center' },
});
