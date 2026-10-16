import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Switch,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useWallet } from '@/lib/wallet-context';
import { CHAIN_CONFIG, type UserRole } from '@/lib/wallet-store';
import { useTranslation } from '@/lib/i18n';

// ROLE_LABELS are resolved dynamically inside the component via t()

const ROLE_ICONS: Record<UserRole, string> = {
  owner: '👤',
  heir: '🏛️',
  guardian: '🛡️',
  notary: '⚖️',
  manager: '🏢',
};

type SubScreen = 'main' | 'security' | 'network' | 'compliance' | 'about' | 'guardian_portal' | 'heir_portal' | 'notary_portal';

// ─── Guardian Portal ──────────────────────────────────────────────────────────
function GuardianPortal({ onBack }: { onBack: () => void }) {
  const { state, addAuditEntry } = useWallet();
  const [showTrigger, setShowTrigger] = useState(false);
  const [reason, setReason] = useState('');
  const [confirm, setConfirm] = useState('');

  const handleTrigger = () => {
    if (confirm !== 'EMERGENCY') {
      Alert.alert('Error', 'Please type "EMERGENCY"');
      return;
    }
    addAuditEntry('GUARDIAN_EMERGENCY', `Guardian triggered emergency: ${reason}`, 'critical');
    setShowTrigger(false);
    Alert.alert('🚨 Emergency Triggered', 'The wallet owner will be notified 3 times. After 24h without reaction, the encrypted key fragments will be sent.');
  };

  return (
    <ScrollView style={styles.subScreen} showsVerticalScrollIndicator={false}>
      <TouchableOpacity style={styles.backBtn} onPress={onBack}>
        <Text style={styles.backBtnText}>← Back</Text>
      </TouchableOpacity>
      <Text style={styles.subTitle}>Guardian Portal</Text>
      <Text style={styles.subSubtitle}>
        As a guardian, you can trigger an emergency without having access to the assets yourself. This is the separation of governance and custody.
      </Text>

      <View style={styles.guardianInfo}>
        <Text style={styles.guardianInfoTitle}>Your Powers as a Guardian</Text>
        {[
          '🚨 Trigger Emergency Protocol',
          '📧 Receive Notifications',
          '✅ Confirm Identity',
          '🚫 No access to assets',
          '🚫 No keys or seed phrases',
        ].map((item, i) => (
          <Text key={i} style={[styles.guardianInfoItem, item.startsWith('🚫') && { color: '#EF4444' }]}>
            {item}
          </Text>
        ))}
      </View>

      <TouchableOpacity
        style={styles.emergencyBtn}
        onPress={() => setShowTrigger(true)}
      >
        <Text style={styles.emergencyBtnIcon}>🚨</Text>
        <Text style={styles.emergencyBtnText}>TRIGGER EMERGENCY</Text>
        <Text style={styles.emergencyBtnSub}>Use only in a real emergency</Text>
      </TouchableOpacity>

      <View style={styles.infoBox}>
        <Text style={styles.infoBoxIcon}>⚖️</Text>
        <Text style={styles.infoBoxText}>
          Triggering an emergency is fully documented in the audit trail and is legally traceable. Abuse can have criminal consequences.
        </Text>
      </View>

      <Modal visible={showTrigger} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { borderTopColor: '#EF4444', borderTopWidth: 3 }]}>
            <View style={styles.modalHandle} />
            <Text style={[styles.modalTitle, { color: '#EF4444' }]}>🚨 Confirm Emergency</Text>
            <Text style={styles.modalLabel}>Reason</Text>
            <TextInput
              style={styles.modalInput}
              value={reason}
              onChangeText={setReason}
              placeholder="Describe the emergency..."
              placeholderTextColor="#4B5563"
              multiline
            />
            <Text style={styles.modalLabel}>Type "EMERGENCY" to confirm</Text>
            <TextInput
              style={styles.modalInput}
              value={confirm}
              onChangeText={setConfirm}
              placeholder="EMERGENCY"
              placeholderTextColor="#4B5563"
              autoCapitalize="characters"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setShowTrigger(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalConfirmBtn, { backgroundColor: '#DC2626' }]} onPress={handleTrigger}>
                <Text style={styles.modalConfirmText}>TRIGGER</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

// ─── Heir Portal ──────────────────────────────────────────────────────────────
function HeirPortal({ onBack }: { onBack: () => void }) {
  return (
    <ScrollView style={styles.subScreen} showsVerticalScrollIndicator={false}>
      <TouchableOpacity style={styles.backBtn} onPress={onBack}>
        <Text style={styles.backBtnText}>← Back</Text>
      </TouchableOpacity>
      <Text style={styles.subTitle}>Heir Portal</Text>
      <Text style={styles.subSubtitle}>
        As an heir, you have access to this portal once the inheritance case has occurred and the Notarial Multisig Trigger has been activated.
      </Text>

      <View style={styles.statusCard}>
        <Text style={styles.statusCardIcon}>⏳</Text>
        <Text style={styles.statusCardTitle}>Waiting for Activation</Text>
        <Text style={styles.statusCardDesc}>
          The heir portal is activated when the notary verifies the death certificate and releases Key 1.
        </Text>
      </View>

      <Text style={styles.sectionLabel}>Transfer Gate Protocol</Text>
      {[
        { step: 1, label: 'Authorization', desc: 'Notary verifies death certificate', status: 'pending' },
        { step: 2, label: 'Verification', desc: 'Heir identities confirmed', status: 'pending' },
        { step: 3, label: 'Preparation', desc: 'Key fragments merged', status: 'pending' },
        { step: 4, label: 'Execution', desc: 'Asset transfer initiated', status: 'pending' },
        { step: 5, label: 'Completion', desc: 'Full documentation', status: 'pending' },
      ].map(step => (
        <View key={step.step} style={styles.gateStep}>
          <View style={[styles.gateStepNum, step.status === 'done' && styles.gateStepNumDone]}>
            <Text style={styles.gateStepNumText}>{step.step}</Text>
          </View>
          <View style={styles.gateStepInfo}>
            <Text style={styles.gateStepLabel}>{step.label}</Text>
            <Text style={styles.gateStepDesc}>{step.desc}</Text>
          </View>
          <Text style={styles.gateStepStatus}>
            {step.status === 'done' ? '✅' : '⏳'}
          </Text>
        </View>
      ))}

      <View style={styles.infoBox}>
        <Text style={styles.infoBoxIcon}>🔒</Text>
        <Text style={styles.infoBoxText}>
          Four-eyes principle at every gate. Full audit trail for all steps. Compliant with BGH III ZR 183/17 and MiCA.
        </Text>
      </View>
    </ScrollView>
  );
}

// ─── Notary Portal ────────────────────────────────────────────────────────────
function NotaryPortal({ onBack }: { onBack: () => void }) {
  const { addAuditEntry } = useWallet();
  const [showUpload, setShowUpload] = useState(false);

  const handleVerify = () => {
    addAuditEntry('NOTARY_VERIFICATION', 'Notary verified death certificate and released Key 1', 'critical');
    Alert.alert('✅ Verified', 'Death certificate accepted. Key 1 has been released. Transfer Gate Protocol Stage 1 completed.');
    setShowUpload(false);
  };

  return (
    <ScrollView style={styles.subScreen} showsVerticalScrollIndicator={false}>
      <TouchableOpacity style={styles.backBtn} onPress={onBack}>
        <Text style={styles.backBtnText}>← Back</Text>
      </TouchableOpacity>
      <Text style={styles.subTitle}>Notary Interface</Text>
      <Text style={styles.subSubtitle}>
        As a notary, you hold Key 1 of the Notarial Multisig Trigger. You activate the inheritance case by verifying the death certificate.
      </Text>

      <View style={styles.keyCard}>
        <Text style={styles.keyCardIcon}>🔑</Text>
        <Text style={styles.keyCardTitle}>Key 1 – Notarial Key</Text>
        <Text style={styles.keyCardDesc}>Safely stored · Not yet activated</Text>
        <View style={styles.keyCardStatus}>
          <View style={styles.keyStatusDot} />
          <Text style={styles.keyStatusText}>Ready for Activation</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.uploadBtn}
        onPress={() => setShowUpload(true)}
      >
        <Text style={styles.uploadBtnIcon}>📄</Text>
        <Text style={styles.uploadBtnText}>Verify Death Certificate</Text>
        <Text style={styles.uploadBtnSub}>Upload and check document</Text>
      </TouchableOpacity>

      <Text style={styles.sectionLabel}>Notarial Duties</Text>
      {[
        'Verify identity of the deceased',
        'Check authenticity of the death certificate',
        'Confirm heir identities',
        'Release Key 1 only after full verification',
        'Document all actions in the Audit Trail',
      ].map((duty, i) => (
        <View key={i} style={styles.dutyItem}>
          <Text style={styles.dutyIcon}>⚖️</Text>
          <Text style={styles.dutyText}>{duty}</Text>
        </View>
      ))}

      <View style={styles.infoBox}>
        <Text style={styles.infoBoxIcon}>📜</Text>
        <Text style={styles.infoBoxText}>
          The Notarial Multisig Trigger System uses existing legal infrastructure. No proprietary monitoring system, no false alarms. Activation only by real death certificate.
        </Text>
      </View>

      <Modal visible={showUpload} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Verify Death Certificate</Text>
            <Text style={styles.modalDesc}>
              Confirm that you have checked the death certificate and verified the identity of the deceased.
            </Text>
            <View style={styles.uploadArea}>
              <Text style={styles.uploadAreaIcon}>📄</Text>
              <Text style={styles.uploadAreaText}>Upload Document</Text>
              <Text style={styles.uploadAreaSub}>(Demo: Click to simulate)</Text>
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setShowUpload(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalConfirmBtn} onPress={handleVerify}>
                <Text style={styles.modalConfirmText}>✅ Verify</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

// ─── Security Screen ──────────────────────────────────────────────────────────
function SecurityScreen({ onBack }: { onBack: () => void }) {
  const { state, updateState, addAuditEntry } = useWallet();
  const [biometric, setBiometric] = useState(state.biometricEnabled);

  const handleBiometricToggle = async (val: boolean) => {
    setBiometric(val);
    await updateState({ biometricEnabled: val });
    addAuditEntry('SECURITY_BIOMETRIC', `Biometrics ${val ? 'activated' : 'deactivated'}`, 'info');
  };

  return (
    <ScrollView style={styles.subScreen} showsVerticalScrollIndicator={false}>
      <TouchableOpacity style={styles.backBtn} onPress={onBack}>
        <Text style={styles.backBtnText}>← Back</Text>
      </TouchableOpacity>
      <Text style={styles.subTitle}>Security</Text>

      <View style={styles.settingRow}>
        <View>
          <Text style={styles.settingLabel}>Face ID / Touch ID</Text>
          <Text style={styles.settingDesc}>Biometric Authentication</Text>
        </View>
        <Switch
          value={biometric}
          onValueChange={handleBiometricToggle}
          trackColor={{ false: '#374151', true: '#1D4ED8' }}
          thumbColor={biometric ? '#3B82F6' : '#6B7280'}
        />
      </View>

      {[
        { icon: '🔐', label: 'Change PIN', desc: 'Update 6-digit PIN' },
        { icon: '🔑', label: 'Show Seed Phrase', desc: 'Secure environment only' },
        { icon: '📱', label: 'Connected Devices', desc: '1 device active' },
        { icon: '🚪', label: 'End All Sessions', desc: 'Logout all sessions' },
      ].map(item => (
        <TouchableOpacity
          key={item.label}
          style={styles.settingItem}
          onPress={() => Alert.alert(item.label, 'This feature is not available in the demo.')}
        >
          <Text style={styles.settingItemIcon}>{item.icon}</Text>
          <View style={styles.settingItemInfo}>
            <Text style={styles.settingLabel}>{item.label}</Text>
            <Text style={styles.settingDesc}>{item.desc}</Text>
          </View>
          <Text style={styles.settingChevron}>›</Text>
        </TouchableOpacity>
      ))}

      <View style={styles.securityNote}>
        <Text style={styles.securityNoteIcon}>🔒</Text>
        <Text style={styles.securityNoteText}>
          All keys are stored exclusively locally in the Secure Enclave (iOS) or Android Keystore. No cloud synchronization of keys.
        </Text>
      </View>
    </ScrollView>
  );
}

// ─── Compliance Screen ────────────────────────────────────────────────────────
function ComplianceScreen({ onBack }: { onBack: () => void }) {
  return (
    <ScrollView style={styles.subScreen} showsVerticalScrollIndicator={false}>
      <TouchableOpacity style={styles.backBtn} onPress={onBack}>
        <Text style={styles.backBtnText}>← Back</Text>
      </TouchableOpacity>
      <Text style={styles.subTitle}>Compliance & Legal</Text>

      {[
        {
          title: 'MiCA Compliance',
          icon: '🇪🇺',
          content: 'DAIO Wallet is not a CASP (Crypto Asset Service Provider) under MiCA because it does not hold assets. The no-custody architecture eliminates the requirement for a CASP license.',
          status: '✅ Compliant',
          statusColor: '#10B981',
        },
        {
          title: 'BGH III ZR 183/17',
          icon: '⚖️',
          content: 'The Federal Court of Justice ruling establishes information duties for digital assets regardless of custody. DAIO implements these duties through the Heritage Integrity Framework.',
          status: '✅ Considered',
          statusColor: '#10B981',
        },
        {
          title: 'GDPR / DSGVO',
          icon: '🔐',
          content: 'All personal data is stored exclusively locally on the device. No transmission to external servers without explicit consent.',
          status: '✅ Compliant',
          statusColor: '#10B981',
        },
        {
          title: 'Heritage Integrity Framework',
          icon: '📋',
          content: 'The internal quality assurance system for digital estates. Full audit trail, four-eyes principle, segregation of duties.',
          status: '✅ Implemented',
          statusColor: '#10B981',
        },
        {
          title: 'Defined Liability Principle',
          icon: '📊',
          content: 'Instead of "no liability" (impossible), DAIO offers "defined liability": known, limited and manageable liability through documented governance processes.',
          status: 'ℹ️ Core Principle',
          statusColor: '#3B82F6',
        },
      ].map(item => (
        <View key={item.title} style={styles.complianceCard}>
          <View style={styles.complianceHeader}>
            <Text style={styles.complianceIcon}>{item.icon}</Text>
            <Text style={styles.complianceTitle}>{item.title}</Text>
            <View style={[styles.complianceStatus, { backgroundColor: item.statusColor + '20' }]}>
              <Text style={[styles.complianceStatusText, { color: item.statusColor }]}>{item.status}</Text>
            </View>
          </View>
          <Text style={styles.complianceContent}>{item.content}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

// ─── Main Settings Screen ─────────────────────────────────────────────────────
export default function SettingsScreen() {
  const { state, resetWallet } = useWallet();
  const router = useRouter();
  const [subScreen, setSubScreen] = useState<SubScreen>('main');
  const { t, lang, setLang } = useTranslation();

  const ROLE_LABELS: Record<UserRole, string> = {
    owner: t('roles.owner'),
    heir: t('roles.heir'),
    guardian: t('roles.guardian'),
    notary: t('roles.notary'),
    manager: t('roles.manager'),
  };

  if (subScreen === 'security') return <SafeAreaView style={styles.container}><SecurityScreen onBack={() => setSubScreen('main')} /></SafeAreaView>;
  if (subScreen === 'compliance') return <SafeAreaView style={styles.container}><ComplianceScreen onBack={() => setSubScreen('main')} /></SafeAreaView>;
  if (subScreen === 'guardian_portal') return <SafeAreaView style={styles.container}><GuardianPortal onBack={() => setSubScreen('main')} /></SafeAreaView>;
  if (subScreen === 'heir_portal') return <SafeAreaView style={styles.container}><HeirPortal onBack={() => setSubScreen('main')} /></SafeAreaView>;
  if (subScreen === 'notary_portal') return <SafeAreaView style={styles.container}><NotaryPortal onBack={() => setSubScreen('main')} /></SafeAreaView>;

  const handleReset = () => {
    Alert.alert(
      t('settings.resetConfirmTitle'),
      t('settings.resetConfirmMsg'),
      [
        { text: t('settings.cancel'), style: 'cancel' },
        {
          text: t('settings.reset'),
          style: 'destructive',
          onPress: async () => {
            await resetWallet();
            router.replace('/onboarding' as any);
          },
        },
      ]
    );
  };

  const rolePortals: Array<{ role: UserRole; screen: SubScreen; label: string; desc: string }> = [
    { role: 'guardian', screen: 'guardian_portal', label: ROLE_LABELS.guardian + ' Portal', desc: lang === 'de' ? 'Notfallknopf und Benachrichtigungen' : 'Emergency button and notifications' },
    { role: 'heir', screen: 'heir_portal', label: ROLE_LABELS.heir + ' Portal', desc: lang === 'de' ? 'Transfer Gate Protokoll' : 'Transfer Gate Protocol' },
    { role: 'notary', screen: 'notary_portal', label: ROLE_LABELS.notary + ' Interface', desc: lang === 'de' ? 'Schlüssel 1 und Sterbeurkunden-Verifizierung' : 'Key 1 and death certificate verification' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>{t('settings.title')}</Text>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileAvatar}>
            <Text style={styles.profileAvatarText}>
              {ROLE_ICONS[state.userRole]}
            </Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileRole}>{ROLE_LABELS[state.userRole]}</Text>
            <Text style={styles.profileAddress}>0x742d...A1D9</Text>
            <View style={styles.profileBadge}>
              <Text style={styles.profileBadgeText}>DAIO Score: {state.daiScore}/100</Text>
            </View>
          </View>
        </View>

        {/* Role-specific portals */}
        <Text style={styles.sectionTitle}>{t('settings.rolePortals')}</Text>
        {rolePortals.map(portal => (
          <TouchableOpacity
            key={portal.role}
            style={[styles.menuItem, state.userRole === portal.role && styles.menuItemActive]}
            onPress={() => setSubScreen(portal.screen)}
          >
            <Text style={styles.menuItemIcon}>{ROLE_ICONS[portal.role]}</Text>
            <View style={styles.menuItemInfo}>
              <Text style={styles.menuItemLabel}>{portal.label}</Text>
              <Text style={styles.menuItemDesc}>{portal.desc}</Text>
            </View>
            {state.userRole === portal.role && (
              <View style={styles.activeRoleBadge}>
                <Text style={styles.activeRoleBadgeText}>{t('settings.yourRole')}</Text>
              </View>
            )}
            <Text style={styles.menuChevron}>›</Text>
          </TouchableOpacity>
        ))}

        {/* Settings Groups */}
        <Text style={styles.sectionTitle}>{t('settings.security')}</Text>
        <TouchableOpacity style={styles.menuItem} onPress={() => setSubScreen('security')}>
          <Text style={styles.menuItemIcon}>🔐</Text>
          <View style={styles.menuItemInfo}>
            <Text style={styles.menuItemLabel}>{t('settings.securitySettings')}</Text>
            <Text style={styles.menuItemDesc}>{t('settings.securityDesc')}</Text>
          </View>
          <Text style={styles.menuChevron}>›</Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>{t('settings.network')}</Text>
        {Object.entries(CHAIN_CONFIG).map(([chain, config]) => (
          <View key={chain} style={styles.networkItem}>
            <View style={[styles.networkDot, { backgroundColor: config.color }]} />
            <Text style={styles.networkName}>{config.name}</Text>
            <Text style={styles.networkStatus}>Mainnet ✓</Text>
          </View>
        ))}

        <Text style={styles.sectionTitle}>{t('settings.compliance')}</Text>
        <TouchableOpacity style={styles.menuItem} onPress={() => setSubScreen('compliance')}>
          <Text style={styles.menuItemIcon}>⚖️</Text>
          <View style={styles.menuItemInfo}>
            <Text style={styles.menuItemLabel}>{t('settings.complianceOverview')}</Text>
            <Text style={styles.menuItemDesc}>{t('settings.complianceDesc')}</Text>
          </View>
          <Text style={styles.menuChevron}>›</Text>
        </TouchableOpacity>

        {/* Language toggle */}
        <Text style={styles.sectionTitle}>{t('settings.language')}</Text>
        <View style={styles.menuItem}>
          <Text style={styles.menuItemIcon}>🌐</Text>
          <View style={styles.menuItemInfo}>
            <Text style={styles.menuItemLabel}>{lang === 'de' ? 'Deutsch' : 'English'}</Text>
          </View>
          <View style={langToggleStyles.row}>
            <TouchableOpacity
              onPress={() => setLang('de')}
              style={[langToggleStyles.btn, lang === 'de' && langToggleStyles.btnActive]}
            >
              <Text style={[langToggleStyles.btnText, lang === 'de' && langToggleStyles.btnTextActive]}>DE</Text>
            </TouchableOpacity>
            <Text style={langToggleStyles.sep}>|</Text>
            <TouchableOpacity
              onPress={() => setLang('en')}
              style={[langToggleStyles.btn, lang === 'en' && langToggleStyles.btnActive]}
            >
              <Text style={[langToggleStyles.btnText, lang === 'en' && langToggleStyles.btnTextActive]}>EN</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.sectionTitle}>{t('settings.about')}</Text>
        <View style={styles.aboutCard}>
          <Text style={styles.aboutVersion}>DAIO Wallet v2.0</Text>
          <Text style={styles.aboutTagline}>Orchestration without Custody.</Text>
          <Text style={styles.aboutTagline}>Governance with Defined Liability.</Text>
          <Text style={styles.aboutDesc}>
            Based on the DAIO Playbook v2.0 (February 2026). Implements the Sovereign Guard 2.0 architecture with a complete Heritage Integrity Framework.
          </Text>
          <View style={styles.aboutLinks}>
            {['Privacy Policy', 'Terms of Use', 'Imprint'].map(link => (
              <TouchableOpacity key={link} style={styles.aboutLink}>
                <Text style={styles.aboutLinkText}>{link}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Danger Zone */}
        <View style={styles.dangerZone}>
          <Text style={styles.dangerTitle}>⚠️ {t('settings.dangerZone')}</Text>
          <TouchableOpacity style={styles.dangerBtn} onPress={handleReset}>
            <Text style={styles.dangerBtnText}>{t('settings.resetWallet')}</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0E1A' },
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16 },
  title: { fontSize: 28, fontWeight: '800', color: '#F9FAFB' },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    backgroundColor: '#111827',
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    gap: 16,
    borderWidth: 1,
    borderColor: '#1F2937',
  },
  profileAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#1D4ED8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileAvatarText: { fontSize: 32 },
  profileInfo: { flex: 1 },
  profileRole: { fontSize: 18, fontWeight: '700', color: '#F9FAFB', marginBottom: 4 },
  profileAddress: { fontSize: 13, color: '#9CA3AF', fontFamily: 'monospace', marginBottom: 8 },
  profileBadge: {
    backgroundColor: '#F59E0B20',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  profileBadgeText: { fontSize: 12, color: '#F59E0B', fontWeight: '700' },
  sectionTitle: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '700',
    paddingHorizontal: 20,
    marginBottom: 8,
    marginTop: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 16,
    marginBottom: 8,
    gap: 12,
  },
  menuItemActive: { borderWidth: 1, borderColor: '#3B82F6' },
  menuItemIcon: { fontSize: 24, width: 32 },
  menuItemInfo: { flex: 1 },
  menuItemLabel: { fontSize: 15, fontWeight: '600', color: '#F9FAFB', marginBottom: 2 },
  menuItemDesc: { fontSize: 12, color: '#9CA3AF' },
  activeRoleBadge: { backgroundColor: '#1D4ED8', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  activeRoleBadgeText: { fontSize: 11, color: '#93C5FD', fontWeight: '700' },
  menuChevron: { fontSize: 22, color: '#6B7280' },
  networkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    backgroundColor: '#111827',
    borderRadius: 12,
    padding: 14,
    marginBottom: 6,
    gap: 12,
  },
  networkDot: { width: 10, height: 10, borderRadius: 5 },
  networkName: { flex: 1, fontSize: 14, color: '#F9FAFB', fontWeight: '600' },
  networkStatus: { fontSize: 12, color: '#10B981' },
  aboutCard: {
    marginHorizontal: 20,
    backgroundColor: '#111827',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1F2937',
  },
  aboutVersion: { fontSize: 18, fontWeight: '800', color: '#F9FAFB', marginBottom: 4 },
  aboutTagline: { fontSize: 13, color: '#3B82F6', fontStyle: 'italic', marginBottom: 2 },
  aboutDesc: { fontSize: 13, color: '#9CA3AF', lineHeight: 18, marginTop: 8, marginBottom: 16 },
  aboutLinks: { flexDirection: 'row', gap: 16 },
  aboutLink: {},
  aboutLinkText: { fontSize: 13, color: '#3B82F6' },
  dangerZone: {
    marginHorizontal: 20,
    marginTop: 24,
    backgroundColor: '#1A0A0A',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#7F1D1D',
  },
  dangerTitle: { fontSize: 14, color: '#EF4444', fontWeight: '700', marginBottom: 12 },
  dangerBtn: {
    backgroundColor: '#7F1D1D',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  dangerBtnText: { color: '#EF4444', fontSize: 15, fontWeight: '700' },
  // Sub screens
  subScreen: { flex: 1, paddingHorizontal: 20 },
  backBtn: { paddingVertical: 16 },
  backBtnText: { color: '#3B82F6', fontSize: 16 },
  subTitle: { fontSize: 26, fontWeight: '800', color: '#F9FAFB', marginBottom: 8 },
  subSubtitle: { fontSize: 14, color: '#9CA3AF', marginBottom: 24, lineHeight: 20 },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  settingLabel: { fontSize: 15, fontWeight: '600', color: '#F9FAFB', marginBottom: 2 },
  settingDesc: { fontSize: 12, color: '#9CA3AF' },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 16,
    marginBottom: 8,
    gap: 12,
  },
  settingItemIcon: { fontSize: 22, width: 32 },
  settingItemInfo: { flex: 1 },
  settingChevron: { fontSize: 22, color: '#6B7280' },
  securityNote: {
    flexDirection: 'row',
    backgroundColor: '#0D1B2A',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1E3A5F',
    gap: 10,
    marginTop: 8,
  },
  securityNoteIcon: { fontSize: 18 },
  securityNoteText: { fontSize: 13, color: '#93C5FD', flex: 1, lineHeight: 18 },
  sectionLabel: { fontSize: 14, color: '#9CA3AF', fontWeight: '600', marginBottom: 12, marginTop: 8 },
  complianceCard: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#1F2937',
  },
  complianceHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  complianceIcon: { fontSize: 22 },
  complianceTitle: { fontSize: 15, fontWeight: '700', color: '#F9FAFB', flex: 1 },
  complianceStatus: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  complianceStatusText: { fontSize: 11, fontWeight: '700' },
  complianceContent: { fontSize: 13, color: '#9CA3AF', lineHeight: 18 },
  guardianInfo: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  guardianInfoTitle: { fontSize: 15, fontWeight: '700', color: '#F9FAFB', marginBottom: 12 },
  guardianInfoItem: { fontSize: 14, color: '#D1D5DB', marginBottom: 8 },
  emergencyBtn: {
    backgroundColor: '#7F1D1D',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#EF4444',
  },
  emergencyBtnIcon: { fontSize: 48, marginBottom: 8 },
  emergencyBtnText: { fontSize: 20, fontWeight: '900', color: '#EF4444', letterSpacing: 2 },
  emergencyBtnSub: { fontSize: 12, color: '#FCA5A5', marginTop: 4 },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#0D1B2A',
    borderRadius: 14,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#1E3A5F',
    gap: 10,
  },
  infoBoxIcon: { fontSize: 18 },
  infoBoxText: { fontSize: 13, color: '#93C5FD', flex: 1, lineHeight: 18 },
  statusCard: {
    backgroundColor: '#111827',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#F59E0B40',
  },
  statusCardIcon: { fontSize: 48, marginBottom: 12 },
  statusCardTitle: { fontSize: 18, fontWeight: '700', color: '#F59E0B', marginBottom: 8 },
  statusCardDesc: { fontSize: 14, color: '#9CA3AF', textAlign: 'center', lineHeight: 20 },
  gateStep: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111827',
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    gap: 12,
  },
  gateStepNum: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1F2937',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gateStepNumDone: { backgroundColor: '#10B981' },
  gateStepNumText: { fontSize: 16, fontWeight: '700', color: '#F9FAFB' },
  gateStepInfo: { flex: 1 },
  gateStepLabel: { fontSize: 14, fontWeight: '600', color: '#F9FAFB' },
  gateStepDesc: { fontSize: 12, color: '#9CA3AF' },
  gateStepStatus: { fontSize: 20 },
  keyCard: {
    backgroundColor: '#111827',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#F59E0B40',
  },
  keyCardIcon: { fontSize: 48, marginBottom: 12 },
  keyCardTitle: { fontSize: 18, fontWeight: '700', color: '#F9FAFB', marginBottom: 4 },
  keyCardDesc: { fontSize: 13, color: '#9CA3AF', marginBottom: 12 },
  keyCardStatus: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  keyStatusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#10B981' },
  keyStatusText: { fontSize: 13, color: '#10B981', fontWeight: '600' },
  uploadBtn: {
    backgroundColor: '#111827',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#3B82F6',
    borderStyle: 'dashed',
  },
  uploadBtnIcon: { fontSize: 40, marginBottom: 8 },
  uploadBtnText: { fontSize: 16, fontWeight: '700', color: '#3B82F6' },
  uploadBtnSub: { fontSize: 12, color: '#9CA3AF', marginTop: 4 },
  dutyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111827',
    borderRadius: 12,
    padding: 12,
    marginBottom: 6,
    gap: 10,
  },
  dutyIcon: { fontSize: 18 },
  dutyText: { fontSize: 14, color: '#D1D5DB', flex: 1 },
  uploadArea: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#374151',
    borderStyle: 'dashed',
  },
  uploadAreaIcon: { fontSize: 48, marginBottom: 8 },
  uploadAreaText: { fontSize: 16, color: '#9CA3AF', fontWeight: '600' },
  uploadAreaSub: { fontSize: 12, color: '#4B5563', marginTop: 4 },
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
  modalTitle: { fontSize: 22, fontWeight: '700', color: '#F9FAFB', marginBottom: 8 },
  modalDesc: { fontSize: 14, color: '#9CA3AF', marginBottom: 16, lineHeight: 20 },
  modalLabel: { fontSize: 13, color: '#9CA3AF', marginBottom: 8, marginTop: 12 },
  modalInput: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#374151',
  },
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
});

const langToggleStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  sep: { fontSize: 14, color: '#4B5563', paddingHorizontal: 2 },
  btn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: '#1F2937',
  },
  btnActive: { backgroundColor: '#1D4ED8' },
  btnText: { fontSize: 13, fontWeight: '700', color: '#9CA3AF' },
  btnTextActive: { color: '#fff' },
});
