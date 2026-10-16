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

export default function GuardianPortal() {
  const router = useRouter();
  const { state } = useWallet();
  const [confirmed, setConfirmed] = useState(false);

  const dmsStatus = state.deadManSwitch.status;
  const isWarning = dmsStatus.startsWith('warning');
  const isTriggered = dmsStatus === 'triggered';

  const handleConfirm = () => {
    setConfirmed(true);
    Alert.alert('✅ Proof of Contact Recorded', 'Your confirmation has been saved. This will be visible in the owner\'s audit log.');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.replace('/portal' as any)}>
          <Text style={styles.backBtnText}>← Exit Portal</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.title}>Guardian Portal</Text>
          <Text style={styles.subtitle}>
            Welcome, Dr. James Wilson. You are a designated Guardian for the DAIO Wallet "Legacy 2024".
          </Text>
        </View>

        <View style={[styles.statusCard, { borderColor: isTriggered ? '#EF4444' : isWarning ? '#F59E0B' : '#10B981' }]}>
          <View style={styles.statusRow}>
            <View>
              <Text style={styles.statusLabel}>Current Inactivity Level</Text>
              <Text style={[styles.statusValue, { color: isTriggered ? '#EF4444' : isWarning ? '#F59E0B' : '#10B981' }]}>
                {isTriggered ? 'Triggered (100%)' : isWarning ? 'Warning Active (90%)' : 'Normal Operations (Active)'}
              </Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: isTriggered ? '#EF444420' : isWarning ? '#F59E0B20' : '#10B98120' }]}>
              <Text style={[styles.statusBadgeText, { color: isTriggered ? '#EF4444' : isWarning ? '#F59E0B' : '#10B981' }]}>
                {dmsStatus}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Guardian Duties</Text>
          <View style={styles.dutyCard}>
            <Text style={styles.dutyTitle}>1. Monitor Activity</Text>
            <Text style={styles.dutyDesc}>You will receive alerts if the owner remains inactive for more than 75% of the check-in interval.</Text>
          </View>
          
          <View style={styles.dutyCard}>
            <Text style={styles.dutyTitle}>2. Confirm Contact</Text>
            <Text style={styles.dutyDesc}>If you have proof of the owner's life outside the app, you can provide a "Guardian Check-In" to reset the timer.</Text>
            <TouchableOpacity 
              style={[styles.confirmBtn, confirmed && styles.btnConfirmed]} 
              onPress={handleConfirm}
              disabled={confirmed}
            >
              <Text style={styles.confirmBtnText}>{confirmed ? 'Confirmed ✓' : 'Confirm Proof of Contact'}</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.dutyCard}>
            <Text style={styles.dutyTitle}>3. Key Fragment Release</Text>
            <Text style={styles.dutyDesc}>In the event of a full trigger, your role is to verify the heirs' identity before the final fragments are released.</Text>
          </View>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            🛡️ <Text style={styles.bold}>Trust Anchor:</Text> As a guardian, you are a critical part of the human-in-the-loop security. Your actions are permanently logged.
          </Text>
        </View>
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
  statusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statusLabel: { fontSize: 13, color: '#9CA3AF', fontWeight: '700', textTransform: 'uppercase', marginBottom: 4 },
  statusValue: { fontSize: 18, fontWeight: '800' },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  statusBadgeText: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase' },
  section: { marginBottom: 32 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#F9FAFB', marginBottom: 16 },
  dutyCard: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#1F2937',
  },
  dutyTitle: { fontSize: 16, fontWeight: '700', color: '#F9FAFB', marginBottom: 8 },
  dutyDesc: { fontSize: 14, color: '#9CA3AF', lineHeight: 20, marginBottom: 16 },
  confirmBtn: { backgroundColor: '#3B82F6', padding: 14, borderRadius: 12, alignItems: 'center' },
  confirmBtnText: { color: '#FFFFFF', fontWeight: '700' },
  btnConfirmed: { backgroundColor: '#10B981' },
  infoBox: { backgroundColor: '#1E1B4B', padding: 16, borderRadius: 12 },
  infoText: { color: '#A5B4FC', fontSize: 13, lineHeight: 18 },
  bold: { fontWeight: '700' },
});
