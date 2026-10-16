import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useWallet } from '@/lib/wallet-context';
import type { UserRole } from '@/lib/wallet-store';

const { width } = Dimensions.get('window');

const ROLES: Array<{ id: UserRole; label: string; description: string; icon: string; color: string }> = [
  { id: 'owner', label: 'Wallet Owner', description: 'Manage your digital assets and set up your inheritance rules', icon: '👤', color: '#3B82F6' },
  { id: 'heir', label: 'Heir', description: 'Access inherited digital assets after activation', icon: '🏛️', color: '#10B981' },
  { id: 'guardian', label: 'Guardian', description: 'External emergency trigger for trusted persons', icon: '🛡️', color: '#8B5CF6' },
  { id: 'notary', label: 'Notary', description: 'Management of key shares and death certificate verification', icon: '⚖️', color: '#F59E0B' },
  { id: 'manager', label: 'Manager', description: 'Institutional management of multiple client wallets', icon: '🏢', color: '#6366F1' },
];

const SEED_PHRASE = [
  'abandon', 'ability', 'able', 'about', 'above', 'absent',
  'absorb', 'abstract', 'absurd', 'abuse', 'access', 'accident',
  'account', 'accuse', 'achieve', 'acid', 'acoustic', 'acquire',
  'across', 'act', 'action', 'actor', 'actress', 'actual',
];

type Step = 'welcome' | 'role' | 'create_or_import' | 'seed_phrase' | 'confirm_seed' | 'pin' | 'success';

export default function OnboardingScreen() {
  const router = useRouter();
  const { setupWallet } = useWallet();
  const [step, setStep] = useState<Step>('welcome');
  const [selectedRole, setSelectedRole] = useState<UserRole>('owner');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [seedConfirmed, setSeedConfirmed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [shuffledWords] = useState(() => [...SEED_PHRASE].sort(() => Math.random() - 0.5));

  const handleComplete = async () => {
    if (pin !== confirmPin) {
      Alert.alert('Error', 'PINs do not match');
      return;
    }
    if (pin.length !== 6) {
      Alert.alert('Error', 'PIN must be 6 digits');
      return;
    }
    setIsLoading(true);
    try {
      await setupWallet(selectedRole, pin);
      setStep('success');
    } catch {
      Alert.alert('Error', 'Wallet setup failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleWordSelect = (word: string) => {
    if (selectedWords.includes(word)) {
      setSelectedWords(prev => prev.filter(w => w !== word));
    } else if (selectedWords.length < 4) {
      setSelectedWords(prev => [...prev, word]);
    }
  };

  const renderWelcome = () => (
    <View style={styles.centered}>
      <View style={styles.logoContainer}>
        <Text style={styles.logoIcon}>🛡️</Text>
        <Text style={styles.logoText}>DAIO</Text>
        <Text style={styles.logoSubtext}>Wallet</Text>
      </View>
      <Text style={styles.welcomeTitle}>Welcome to DAIO Wallet</Text>
      <Text style={styles.welcomeSubtitle}>
        The first wallet with integrated inheritance management based on the DAIO principle.
        {'\n\n'}
        <Text style={styles.highlight}>Orchestration without Custody.</Text>
        {'\n'}
        <Text style={styles.muted}>Governance with Defined Liability.</Text>
      </Text>
      <View style={styles.featureList}>
        {[
          { icon: '🔐', text: 'No-Custody Architecture (MiCA compliant)' },
          { icon: '⏱️', text: 'Dead Man\'s Switch with escalation stages' },
          { icon: '🔑', text: 'Shamir Secret Sharing (2-of-3)' },
          { icon: '🚨', text: 'External Emergency Button' },
          { icon: '📋', text: 'Full Audit Trail' },
        ].map((f, i) => (
          <View key={i} style={styles.featureItem}>
            <Text style={styles.featureIcon}>{f.icon}</Text>
            <Text style={styles.featureText}>{f.text}</Text>
          </View>
        ))}
      </View>
      <TouchableOpacity style={styles.primaryButton} onPress={() => setStep('role')}>
        <Text style={styles.primaryButtonText}>Set up now →</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={styles.secondaryButton} 
        onPress={() => router.push('/portal' as any)}
      >
        <Text style={styles.secondaryButtonText}>Access a Portal (Heir / Guardian) →</Text>
      </TouchableOpacity>
    </View>
  );

  const renderRoleSelection = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Choose your Role</Text>
      <Text style={styles.stepSubtitle}>DAIO Wallet supports 5 different user roles in the digital inheritance ecosystem</Text>
      <ScrollView showsVerticalScrollIndicator={false}>
        {ROLES.map(role => (
          <TouchableOpacity
            key={role.id}
            style={[styles.roleCard, selectedRole === role.id && { borderColor: role.color, borderWidth: 2 }]}
            onPress={() => setSelectedRole(role.id)}
          >
            <View style={[styles.roleIconBg, { backgroundColor: role.color + '20' }]}>
              <Text style={styles.roleIcon}>{role.icon}</Text>
            </View>
            <View style={styles.roleInfo}>
              <Text style={styles.roleLabel}>{role.label}</Text>
              <Text style={styles.roleDesc}>{role.description}</Text>
            </View>
            {selectedRole === role.id && (
              <View style={[styles.checkmark, { backgroundColor: role.color }]}>
                <Text style={styles.checkmarkText}>✓</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
      <TouchableOpacity style={styles.primaryButton} onPress={() => setStep('create_or_import')}>
        <Text style={styles.primaryButtonText}>Continue →</Text>
      </TouchableOpacity>
    </View>
  );

  const renderCreateOrImport = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Set up Wallet</Text>
      <Text style={styles.stepSubtitle}>Create a new wallet or import an existing one</Text>
      <View style={styles.optionCards}>
        <TouchableOpacity style={styles.optionCard} onPress={() => setStep('seed_phrase')}>
          <Text style={styles.optionIcon}>✨</Text>
          <Text style={styles.optionTitle}>Create New Wallet</Text>
          <Text style={styles.optionDesc}>Generate a new seed phrase and secure your assets</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.optionCard, styles.optionCardSecondary]} onPress={() => setStep('pin')}>
          <Text style={styles.optionIcon}>📥</Text>
          <Text style={styles.optionTitle}>Import Wallet</Text>
          <Text style={styles.optionDesc}>Import with existing seed phrase or private key</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.securityNote}>
        <Text style={styles.securityNoteIcon}>🔒</Text>
        <Text style={styles.securityNoteText}>
          DAIO Wallet stores your keys exclusively locally on your device. We never have access to your assets.
        </Text>
      </View>
    </View>
  );

  const renderSeedPhrase = () => (
    <View style={styles.stepContainer}>
      <View style={styles.warningBanner}>
        <Text style={styles.warningIcon}>⚠️</Text>
        <Text style={styles.warningText}>Schreibe diese 24 Wörter auf und bewahre sie sicher auf. Zeige sie niemandem.</Text>
      </View>
      <Text style={styles.stepTitle}>Deine Seed-Phrase</Text>
      <View style={styles.seedGrid}>
        {SEED_PHRASE.map((word, i) => (
          <View key={i} style={styles.seedWord}>
            <Text style={styles.seedWordNum}>{i + 1}</Text>
            <Text style={styles.seedWordText}>{word}</Text>
          </View>
        ))}
      </View>
      <TouchableOpacity
        style={[styles.primaryButton, seedConfirmed && styles.primaryButtonActive]}
        onPress={() => {
          setSeedConfirmed(true);
          setStep('confirm_seed');
        }}
      >
        <Text style={styles.primaryButtonText}>Ich habe die Phrase gesichert →</Text>
      </TouchableOpacity>
    </View>
  );

  const renderConfirmSeed = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Seed-Phrase bestätigen</Text>
      <Text style={styles.stepSubtitle}>Wähle die ersten 4 Wörter deiner Seed-Phrase in der richtigen Reihenfolge aus</Text>
      <View style={styles.selectedWordsContainer}>
        {[0, 1, 2, 3].map(i => (
          <View key={i} style={[styles.selectedWordSlot, selectedWords[i] && styles.selectedWordSlotFilled]}>
            <Text style={styles.selectedWordSlotNum}>{i + 1}</Text>
            <Text style={styles.selectedWordSlotText}>{selectedWords[i] || '...'}</Text>
          </View>
        ))}
      </View>
      <View style={styles.wordGrid}>
        {shuffledWords.slice(0, 12).map((word, i) => (
          <TouchableOpacity
            key={i}
            style={[styles.wordChip, selectedWords.includes(word) && styles.wordChipSelected]}
            onPress={() => handleWordSelect(word)}
          >
            <Text style={[styles.wordChipText, selectedWords.includes(word) && styles.wordChipTextSelected]}>{word}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity
        style={[styles.primaryButton, selectedWords.length < 4 && styles.primaryButtonDisabled]}
        onPress={() => selectedWords.length === 4 && setStep('pin')}
        disabled={selectedWords.length < 4}
      >
        <Text style={styles.primaryButtonText}>Bestätigen →</Text>
      </TouchableOpacity>
    </View>
  );

  const renderPin = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>PIN einrichten</Text>
      <Text style={styles.stepSubtitle}>Wähle eine 6-stellige PIN zum Schutz deiner Wallet</Text>
      <View style={styles.pinContainer}>
        <Text style={styles.pinLabel}>PIN eingeben</Text>
        <TextInput
          style={styles.pinInput}
          value={pin}
          onChangeText={setPin}
          keyboardType="numeric"
          maxLength={6}
          secureTextEntry
          placeholder="••••••"
          placeholderTextColor="#4B5563"
        />
        <Text style={styles.pinLabel}>PIN bestätigen</Text>
        <TextInput
          style={styles.pinInput}
          value={confirmPin}
          onChangeText={setConfirmPin}
          keyboardType="numeric"
          maxLength={6}
          secureTextEntry
          placeholder="••••••"
          placeholderTextColor="#4B5563"
        />
      </View>
      <View style={styles.securityNote}>
        <Text style={styles.securityNoteIcon}>🔐</Text>
        <Text style={styles.securityNoteText}>
          Face ID / Touch ID wird nach der PIN-Einrichtung aktiviert. Dein PIN wird niemals in der Cloud gespeichert.
        </Text>
      </View>
      <TouchableOpacity
        style={[styles.primaryButton, (pin.length < 6 || confirmPin.length < 6) && styles.primaryButtonDisabled]}
        onPress={handleComplete}
        disabled={pin.length < 6 || confirmPin.length < 6 || isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.primaryButtonText}>Wallet aktivieren →</Text>
        )}
      </TouchableOpacity>
    </View>
  );

  const renderSuccess = () => (
    <View style={styles.centered}>
      <View style={styles.successIcon}>
        <Text style={{ fontSize: 64 }}>🎉</Text>
      </View>
      <Text style={styles.welcomeTitle}>Wallet bereit!</Text>
      <Text style={styles.welcomeSubtitle}>
        Deine DAIO Wallet ist eingerichtet. Vergiss nicht, deine Nachlassregelung im DAIO Shield zu konfigurieren.
      </Text>
      <View style={styles.nextStepsList}>
        {[
          '✅ Wallet erstellt',
          '⏳ Dead Man\'s Switch konfigurieren',
          '⏳ Begünstigte hinzufügen',
          '⏳ DAIO Score verbessern',
        ].map((item, i) => (
          <Text key={i} style={styles.nextStepItem}>{item}</Text>
        ))}
      </View>
      <TouchableOpacity
        style={styles.primaryButton}
        onPress={() => router.replace('/(tabs)')}
      >
        <Text style={styles.primaryButtonText}>Zur Wallet →</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Progress indicator */}
      {step !== 'welcome' && step !== 'success' && (
        <View style={styles.progressBar}>
          {(['role', 'create_or_import', 'seed_phrase', 'confirm_seed', 'pin'] as Step[]).map((s, i) => (
            <View
              key={s}
              style={[
                styles.progressDot,
                step === s && styles.progressDotActive,
                (['role', 'create_or_import', 'seed_phrase', 'confirm_seed', 'pin'] as Step[]).indexOf(step) > i && styles.progressDotDone,
              ]}
            />
          ))}
        </View>
      )}

      {/* Back button */}
      {step !== 'welcome' && step !== 'success' && (
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            const steps: Step[] = ['welcome', 'role', 'create_or_import', 'seed_phrase', 'confirm_seed', 'pin'];
            const idx = steps.indexOf(step);
            if (idx > 0) setStep(steps[idx - 1]);
          }}
        >
          <Text style={styles.backButtonText}>← Zurück</Text>
        </TouchableOpacity>
      )}

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {step === 'welcome' && renderWelcome()}
        {step === 'role' && renderRoleSelection()}
        {step === 'create_or_import' && renderCreateOrImport()}
        {step === 'seed_phrase' && renderSeedPhrase()}
        {step === 'confirm_seed' && renderConfirmSeed()}
        {step === 'pin' && renderPin()}
        {step === 'success' && renderSuccess()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0E1A',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoIcon: {
    fontSize: 72,
    marginBottom: 8,
  },
  logoText: {
    fontSize: 36,
    fontWeight: '800',
    color: '#3B82F6',
    letterSpacing: 4,
  },
  logoSubtext: {
    fontSize: 18,
    color: '#9CA3AF',
    letterSpacing: 2,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#F9FAFB',
    textAlign: 'center',
    marginBottom: 16,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  highlight: {
    color: '#3B82F6',
    fontWeight: '600',
  },
  muted: {
    color: '#6B7280',
  },
  featureList: {
    width: '100%',
    marginBottom: 32,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#111827',
    borderRadius: 12,
    marginBottom: 8,
  },
  featureIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  featureText: {
    fontSize: 14,
    color: '#D1D5DB',
    flex: 1,
  },
  primaryButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 32,
    width: '100%',
    alignItems: 'center',
    marginTop: 16,
  },
  primaryButtonActive: {
    backgroundColor: '#10B981',
  },
  primaryButtonDisabled: {
    backgroundColor: '#374151',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    backgroundColor: '#111827',
    width: '100%',
    padding: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#1F2937',
  },
  secondaryButtonText: {
    color: '#9CA3AF',
    fontSize: 16,
    fontWeight: '600',
  },
  progressBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingTop: 16,
    gap: 8,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#1F2937',
  },
  progressDotActive: {
    backgroundColor: '#3B82F6',
    width: 24,
  },
  progressDotDone: {
    backgroundColor: '#10B981',
  },
  backButton: {
    padding: 16,
    paddingBottom: 0,
  },
  backButtonText: {
    color: '#3B82F6',
    fontSize: 16,
  },
  stepContainer: {
    flex: 1,
    paddingVertical: 16,
  },
  stepTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#F9FAFB',
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 24,
    lineHeight: 20,
  },
  roleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#1F2937',
  },
  roleIconBg: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  roleIcon: {
    fontSize: 24,
  },
  roleInfo: {
    flex: 1,
  },
  roleLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F9FAFB',
    marginBottom: 4,
  },
  roleDesc: {
    fontSize: 12,
    color: '#9CA3AF',
    lineHeight: 16,
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  optionCards: {
    gap: 16,
    marginBottom: 24,
  },
  optionCard: {
    backgroundColor: '#111827',
    borderRadius: 20,
    padding: 24,
    borderWidth: 2,
    borderColor: '#3B82F6',
    alignItems: 'center',
  },
  optionCardSecondary: {
    borderColor: '#1F2937',
  },
  optionIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F9FAFB',
    marginBottom: 8,
  },
  optionDesc: {
    fontSize: 13,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 18,
  },
  securityNote: {
    flexDirection: 'row',
    backgroundColor: '#0D1B2A',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1E3A5F',
    marginTop: 16,
  },
  securityNoteIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  securityNoteText: {
    fontSize: 13,
    color: '#93C5FD',
    flex: 1,
    lineHeight: 18,
  },
  warningBanner: {
    flexDirection: 'row',
    backgroundColor: '#451A03',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#92400E',
  },
  warningIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  warningText: {
    fontSize: 13,
    color: '#FCD34D',
    flex: 1,
    lineHeight: 18,
  },
  seedGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  seedWord: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111827',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    width: (width - 48 - 16) / 3,
  },
  seedWordNum: {
    fontSize: 10,
    color: '#4B5563',
    marginRight: 6,
    width: 16,
  },
  seedWordText: {
    fontSize: 13,
    color: '#F9FAFB',
    fontFamily: 'monospace',
  },
  selectedWordsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
  selectedWordSlot: {
    flex: 1,
    backgroundColor: '#111827',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1F2937',
    borderStyle: 'dashed',
  },
  selectedWordSlotFilled: {
    borderColor: '#3B82F6',
    borderStyle: 'solid',
  },
  selectedWordSlotNum: {
    fontSize: 10,
    color: '#4B5563',
    marginBottom: 4,
  },
  selectedWordSlotText: {
    fontSize: 12,
    color: '#F9FAFB',
    fontWeight: '600',
  },
  wordGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  wordChip: {
    backgroundColor: '#111827',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#1F2937',
  },
  wordChipSelected: {
    backgroundColor: '#1D4ED8',
    borderColor: '#3B82F6',
  },
  wordChipText: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  wordChipTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  pinContainer: {
    marginBottom: 24,
  },
  pinLabel: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 8,
    marginTop: 16,
  },
  pinInput: {
    backgroundColor: '#111827',
    borderRadius: 12,
    padding: 16,
    fontSize: 24,
    color: '#F9FAFB',
    textAlign: 'center',
    letterSpacing: 12,
    borderWidth: 1,
    borderColor: '#1F2937',
  },
  successIcon: {
    marginBottom: 24,
  },
  nextStepsList: {
    width: '100%',
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    gap: 12,
  },
  nextStepItem: {
    fontSize: 14,
    color: '#D1D5DB',
  },
});
