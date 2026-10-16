import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useWallet } from '@/lib/wallet-context';

export default function PortalGateway() {
  const router = useRouter();
  const { setupWallet } = useWallet();

  const handleRoleSelect = async (role: 'heir' | 'guardian' | 'notary') => {
    // For demo: auto-setup as the chosen role
    // In production, this would involve invitation links and authentication
    if (role === 'heir') {
      router.push('/portal/heir' as any);
    } else {
      router.push('/portal/guardian' as any);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.replace('/onboarding')}>
          <Text style={styles.backBtnText}>← Back to Onboarding</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.title}>DAIO Portals</Text>
          <Text style={styles.subtitle}>
            Select your role to access the decentralized inheritance orchestration.
          </Text>
        </View>

        <View style={styles.roleGrid}>
          <TouchableOpacity 
            style={styles.roleCard}
            onPress={() => handleRoleSelect('heir')}
          >
            <View style={[styles.roleIcon, { backgroundColor: '#10B98120' }]}>
              <Text style={styles.roleIconText}>🎓</Text>
            </View>
            <Text style={styles.roleTitle}>Heir Portal</Text>
            <Text style={styles.roleDesc}>
              Request and reconstruct inheritance fragments after the DMS is triggered.
            </Text>
            <Text style={styles.roleAction}>Enter Portal →</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.roleCard}
            onPress={() => handleRoleSelect('guardian')}
          >
            <View style={[styles.roleIcon, { backgroundColor: '#3B82F620' }]}>
              <Text style={styles.roleIconText}>🛡️</Text>
            </View>
            <Text style={styles.roleTitle}>Guardian Portal</Text>
            <Text style={styles.roleDesc}>
              Monitor the status and confirm emergency protocols if requested.
            </Text>
            <Text style={styles.roleAction}>Enter Portal →</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.roleCard}
            onPress={() => handleRoleSelect('notary')}
          >
            <View style={[styles.roleIcon, { backgroundColor: '#F59E0B20' }]}>
              <Text style={styles.roleIconText}>⚖️</Text>
            </View>
            <Text style={styles.roleTitle}>Notary Portal</Text>
            <Text style={styles.roleDesc}>
              Legally verify and release the final encryption keys for the heirs.
            </Text>
            <Text style={styles.roleAction}>Enter Portal →</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoBoxText}>
            ℹ️ <Text style={styles.bold}>How it works:</Text> Portals are decentralized interfaces. You only see information that the owner has explicitly shared with your role.
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
  title: { fontSize: 32, fontWeight: '900', color: '#F9FAFB', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#9CA3AF', lineHeight: 22 },
  roleGrid: { gap: 16, marginBottom: 32 },
  roleCard: {
    backgroundColor: '#111827',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#1F2937',
  },
  roleIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  roleIconText: { fontSize: 24 },
  roleTitle: { fontSize: 20, fontWeight: '700', color: '#F9FAFB', marginBottom: 8 },
  roleDesc: { fontSize: 14, color: '#9CA3AF', lineHeight: 20, marginBottom: 16 },
  roleAction: { color: '#3B82F6', fontWeight: '700', fontSize: 14 },
  infoBox: { backgroundColor: '#1F2937', padding: 16, borderRadius: 12 },
  infoBoxText: { color: '#9CA3AF', fontSize: 13, lineHeight: 18 },
  bold: { fontWeight: '700', color: '#F9FAFB' },
});
