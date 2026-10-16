import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useWallet } from '@/lib/wallet-context';

export default function HeirPortal() {
  const router = useRouter();
  const { state } = useWallet();
  const [requested, setRequested] = useState(false);

  const dmsStatus = state.deadManSwitch.status;
  const isTriggered = dmsStatus === 'triggered';

  const handleRequest = () => {
    if (!isTriggered) {
      Alert.alert(
        'Access Denied', 
        'The Dead Man\'s Switch is currently ACTIVE. Inheritance fragments are only released if the owner has been inactive for the defined period.'
      );
      return;
    }
    setRequested(true);
    Alert.alert('✅ Request Sent', 'Notaries and Guardians have been notified. Once they confirm, your fragment will be visible.');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.replace('/portal' as any)}>
          <Text style={styles.backBtnText}>← Exit Portal</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.title}>Heir Portal</Text>
          <Text style={styles.subtitle}>
            Welcome, Sarah Miller. You are a designated heir for the DAIO Wallet "Legacy 2024".
          </Text>
        </View>

        <View style={[styles.statusCard, { borderColor: isTriggered ? '#EF4444' : '#10B981' }]}>
          <Text style={styles.statusLabel}>Owner Status</Text>
          <Text style={[styles.statusValue, { color: isTriggered ? '#EF4444' : '#10B981' }]}>
            {isTriggered ? 'Triggered (Inactive)' : 'Active (No Action Required)'}
          </Text>
          <Text style={styles.statusDesc}>
            {isTriggered 
              ? 'The grace period has expired. You can now request your share.' 
              : 'The owner is still active. No inheritance fragments can be accessed.'}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Shares</Text>
          <View style={styles.shareCard}>
            <View style={styles.shareHeader}>
              <Text style={styles.shareIcon}>🔑</Text>
              <View>
                <Text style={styles.shareName}>Fragment #1</Text>
                <Text style={styles.shareId}>Sarah Miller (SARAH-2024-ETH)</Text>
              </View>
            </View>
            
            {requested && isTriggered ? (
              <View style={styles.shareContent}>
                <Text style={styles.shareKey}>SHARE_1_bW9jay1zZWNyZXQta2V5LTIwMjQ=</Text>
                <TouchableOpacity 
                  style={styles.copyBtn}
                  onPress={() => Alert.alert('📋 Copied', 'Fragment copied to clipboard.')}
                >
                  <Text style={styles.copyBtnText}>Copy to Clipboard</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity 
                style={[styles.requestBtn, !isTriggered && styles.btnDisabled]} 
                onPress={handleRequest}
              >
                <Text style={styles.requestBtnText}>Request Fragment</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Inheritance Protocol</Text>
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              • {state.shamirConfig.threshold}-of-{state.shamirConfig.totalShares} Threshold required
            </Text>
            <Text style={styles.infoText}>• Governance: Automated (DMS)</Text>
            <Text style={styles.infoText}>• Encryption: AES-256 (P2P)</Text>
          </View>
        </View>

        {requested && isTriggered && (
          <TouchableOpacity 
            style={styles.recoveryBtn}
            onPress={() => router.push('/recovery' as any)}
          >
            <Text style={styles.recoveryBtnText}>Open Recovery Tool →</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0E1A' },
  content: { padding: 24 },
  backBtn: { marginBottom: 24 },
  backBtnText: { color: '#9CA3AF', fontSize: 16 },
  header: { marginBottom: 32 },
  title: { fontSize: 28, fontWeight: '800', color: '#F9FAFB', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#9CA3AF', lineHeight: 22 },
  statusCard: {
    backgroundColor: '#111827',
    borderRadius: 20,
    padding: 24,
    borderWidth: 2,
    marginBottom: 32,
  },
  statusLabel: { fontSize: 13, color: '#9CA3AF', fontWeight: '700', textTransform: 'uppercase', marginBottom: 4 },
  statusValue: { fontSize: 20, fontWeight: '800', marginBottom: 8 },
  statusDesc: { fontSize: 14, color: '#6B7280', lineHeight: 20 },
  section: { marginBottom: 32 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#F9FAFB', marginBottom: 16 },
  shareCard: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1F2937',
  },
  shareHeader: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 20 },
  shareIcon: { fontSize: 28 },
  shareName: { fontSize: 18, fontWeight: '700', color: '#F9FAFB' },
  shareId: { fontSize: 12, color: '#6B7280' },
  requestBtn: { backgroundColor: '#10B981', padding: 16, borderRadius: 12, alignItems: 'center' },
  requestBtnText: { color: '#FFFFFF', fontWeight: '700' },
  shareContent: { gap: 12 },
  shareKey: { 
    backgroundColor: '#0A0E1A', 
    padding: 16, 
    borderRadius: 12, 
    color: '#10B981', 
    fontSize: 12, 
    fontFamily: 'monospace',
    borderWidth: 1,
    borderColor: '#10B98140',
  },
  copyBtn: { backgroundColor: '#1F2937', padding: 12, borderRadius: 10, alignItems: 'center' },
  copyBtnText: { color: '#F9FAFB', fontSize: 14, fontWeight: '600' },
  btnDisabled: { opacity: 0.4 },
  infoBox: { backgroundColor: '#111827', padding: 20, borderRadius: 16, gap: 12 },
  infoText: { color: '#9CA3AF', fontSize: 14 },
  recoveryBtn: { backgroundColor: '#3B82F6', padding: 18, borderRadius: 16, alignItems: 'center' },
  recoveryBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});
