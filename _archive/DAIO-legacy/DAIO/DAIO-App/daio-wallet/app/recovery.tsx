import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useWallet } from '@/lib/wallet-context';
import { reconstructSecret, isValidShare } from '@/lib/shamir';

export default function RecoveryScreen() {
  const router = useRouter();
  const { state, updateState, addAuditEntry } = useWallet();
  const [shares, setShares] = useState<string[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [isRecovering, setIsRecovering] = useState(false);

  const threshold = state.shamirConfig.threshold || 2;

  const handleAddShare = () => {
    if (!currentInput.trim()) return;
    
    if (!isValidShare(currentInput.trim())) {
      Alert.alert('Invalid Share', 'The provided fragment does not appear to be a valid DAIO recovery fragment.');
      return;
    }

    if (shares.includes(currentInput.trim())) {
      Alert.alert('Duplicate', 'This fragment has already been added.');
      return;
    }

    setShares([...shares, currentInput.trim()]);
    setCurrentInput('');
  };

  const handleRemoveShare = (index: number) => {
    const newShares = [...shares];
    newShares.splice(index, 1);
    setShares(newShares);
  };

  const handleRecover = async () => {
    if (shares.length < threshold) {
      Alert.alert('More fragments needed', `You need at least ${threshold} fragments to reconstruct your key. Currently added: ${shares.length}`);
      return;
    }

    setIsRecovering(true);

    // Simulate complex calculation
    setTimeout(async () => {
      try {
        const reconstructedKey = reconstructSecret(shares);

        if (reconstructedKey) {
          addAuditEntry('RECOVERY_SUCCESS', 'Wallet recovered successfully via Shamir reconstruction', 'critical');

          // In a real app, this would be the actual mnemonic or private key.
          // For the demo, we just unlock the wallet and let them reset the PIN.
          await updateState({ isLocked: false });

          Alert.alert(
            'Recovery Successful',
            'Your access has been restored. Please set a new security PIN immediately.',
            [{ text: 'OK', onPress: () => router.push('/(tabs)') }]
          );
        } else {
          addAuditEntry('RECOVERY_FAILED', 'Failed to reconstruct key from provided fragments', 'warning');
          Alert.alert('Recovery Failed', 'The provided fragments could not be combined to reconstruct your key.');
        }
      } catch (e) {
        console.error('[Recovery] Error during key reconstruction:', e);
        Alert.alert('Recovery Error', 'An unexpected error occurred during recovery.');
      } finally {
        setIsRecovering(false);
      }
    }, 2000);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.title}>Reconstruct Access</Text>
          <Text style={styles.subtitle}>
            Enter your recovery fragments from your heirs, guardians, or notaries.
          </Text>
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${Math.min(100, (shares.length / threshold) * 100)}%` }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>
            {shares.length} of {threshold} fragments collected
          </Text>
        </View>

        <View style={styles.inputSection}>
          <Text style={styles.label}>Paste Recovery Fragment</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              value={currentInput}
              onChangeText={setCurrentInput}
              placeholder="SHARE_1_..."
              placeholderTextColor="#4B5563"
              multiline
              numberOfLines={3}
            />
          </View>
          <TouchableOpacity 
            style={[styles.addBtn, !currentInput.trim() && styles.btnDisabled]} 
            onPress={handleAddShare}
            disabled={!currentInput.trim()}
          >
            <Text style={styles.addBtnText}>Add Fragment</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.sharesSection}>
          <Text style={styles.sectionTitle}>Collected Fragments</Text>
          {shares.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>No fragments added yet.</Text>
            </View>
          ) : (
            shares.map((share, index) => (
              <View key={index} style={styles.shareCard}>
                <View style={styles.shareInfo}>
                  <Text style={styles.shareLabel}>Fragment #{index + 1}</Text>
                  <Text style={styles.shareText} numberOfLines={1}>{share}</Text>
                </View>
                <TouchableOpacity onPress={() => handleRemoveShare(index)}>
                  <Text style={styles.removeText}>Remove</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>

        <TouchableOpacity 
          style={[
            styles.recoverBtn, 
            (shares.length < threshold || isRecovering) && styles.btnDisabled
          ]} 
          onPress={handleRecover}
          disabled={shares.length < threshold || isRecovering}
        >
          <Text style={styles.recoverBtnText}>
            {isRecovering ? 'Processing...' : 'Reconstruct Key →'}
          </Text>
        </TouchableOpacity>

        <View style={styles.infoBox}>
          <Text style={styles.infoBoxText}>
            ⚖️ <Text style={styles.bold}>Security Note:</Text> Reconstructing your key is an irreversible action that will be recorded in the audit log.
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
  progressContainer: { marginBottom: 32 },
  progressBar: { height: 8, backgroundColor: '#1F2937', borderRadius: 4, marginBottom: 8, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#3B82F6' },
  progressText: { color: '#3B82F6', fontSize: 14, fontWeight: '600' },
  inputSection: { marginBottom: 32 },
  label: { color: '#F9FAFB', fontSize: 15, fontWeight: '600', marginBottom: 12 },
  input: {
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#374151',
    borderRadius: 12,
    padding: 16,
    color: '#F9FAFB',
    fontSize: 14,
    fontFamily: 'monospace',
    textAlignVertical: 'top',
  },
  inputRow: { marginBottom: 12 },
  addBtn: { backgroundColor: '#1F2937', padding: 16, borderRadius: 12, alignItems: 'center' },
  addBtnText: { color: '#F9FAFB', fontWeight: '600' },
  sharesSection: { marginBottom: 32 },
  sectionTitle: { color: '#9CA3AF', fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 },
  shareCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#111827',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#1F2937',
  },
  shareInfo: { flex: 1 },
  shareLabel: { color: '#3B82F6', fontSize: 12, fontWeight: '700', marginBottom: 2 },
  shareText: { color: '#6B7280', fontSize: 12, fontFamily: 'monospace' },
  removeText: { color: '#EF4444', fontSize: 13, fontWeight: '600', marginLeft: 12 },
  emptyCard: { padding: 32, alignItems: 'center', backgroundColor: '#111827', borderRadius: 12, borderStyle: 'dashed', borderWidth: 1, borderColor: '#374151' },
  emptyText: { color: '#6B7280' },
  recoverBtn: { backgroundColor: '#3B82F6', padding: 18, borderRadius: 16, alignItems: 'center', marginBottom: 24 },
  recoverBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  btnDisabled: { opacity: 0.5 },
  infoBox: { backgroundColor: '#1E1B4B', padding: 16, borderRadius: 12 },
  infoBoxText: { color: '#A5B4FC', fontSize: 13, lineHeight: 18 },
  bold: { fontWeight: '700' },
});
