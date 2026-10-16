import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useWallet } from '@/lib/wallet-context';
import * as LocalAuthentication from 'expo-local-authentication';
import * as Haptics from 'expo-haptics';

export default function ProofOfLifeScreen() {
  const { state, checkIn, addAuditEntry } = useWallet();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handlePoL = async () => {
    setLoading(true);
    try {
      // 1. Biometric Authentication
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      if (hasHardware) {
        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: 'Proof of Life Bestätigung',
          fallbackLabel: 'PIN verwenden',
        });
        
        if (!result.success) {
          setLoading(false);
          return;
        }
      }

      // 2. Perform Check-In
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await checkIn();
      addAuditEntry('PROOF_OF_LIFE', 'Kritischer Proof of Life via Biometrie bestätigt', 'critical');
      
      Alert.alert(
        '✅ Identität bestätigt',
        'Dein Dead Man\'s Switch wurde zurückgesetzt. Alle Warnungen wurden aufgehoben.',
        [{ text: 'Zum Dashboard', onPress: () => router.replace('/(tabs)/' as any) }]
      );
    } catch (error) {
      Alert.alert('Fehler', 'Die Bestätigung konnte nicht durchgeführt werden.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>🚨</Text>
        </View>
        
        <Text style={styles.title}>Proof of Life erforderlich</Text>
        <Text style={styles.subtitle}>
          Dein Dead Man's Switch hat die kritische Stufe erreicht. Bitte bestätige deine Identität, um den automatischen Key-Versand zu stoppen.
        </Text>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Status: Stufe 3 (Kritisch)</Text>
          <Text style={styles.infoText}>
            Ohne Bestätigung werden deine verschlüsselten Schlüsselfragmente in Kürze an deine Erben freigegeben.
          </Text>
        </View>

        <TouchableOpacity 
          style={[styles.actionBtn, loading && styles.disabledBtn]} 
          onPress={handlePoL}
          disabled={loading}
        >
          <Text style={styles.actionBtnText}>
            {loading ? 'Verifiziere...' : 'Identität bestätigen'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.cancelBtn} 
          onPress={() => router.back()}
        >
          <Text style={styles.cancelBtnText}>Später erinnern</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0E1A',
  },
  content: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#EF444420',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  icon: {
    fontSize: 48,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#F9FAFB',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
  },
  infoCard: {
    width: '100%',
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#EF444440',
    marginBottom: 40,
  },
  infoTitle: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  infoText: {
    color: '#9CA3AF',
    fontSize: 14,
    lineHeight: 20,
  },
  actionBtn: {
    width: '100%',
    height: 56,
    backgroundColor: '#3B82F6',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  disabledBtn: {
    opacity: 0.6,
  },
  actionBtnText: {
    color: '#F9FAFB',
    fontSize: 18,
    fontWeight: '700',
  },
  cancelBtn: {
    padding: 12,
  },
  cancelBtnText: {
    color: '#6B7280',
    fontSize: 16,
  },
});
