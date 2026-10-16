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
  Switch,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useWallet } from '@/lib/wallet-context';
import { calculateDaiScore, type Beneficiary } from '@/lib/wallet-store';
import { getTimeUntilTrigger, formatDate } from '@/lib/format';

const { width } = Dimensions.get('window');

type SubScreen = 'main' | 'dms' | 'shamir' | 'emergency' | 'beneficiaries' | 'container' | 'gate' | 'compliance' | 'audit' | 'score';

// ─── DAIO Score Ring ──────────────────────────────────────────────────────────
function ScoreRing({ score }: { score: number }) {
  const color = score >= 70 ? '#10B981' : score >= 40 ? '#F59E0B' : '#EF4444';
  const label = score >= 70 ? 'Well Protected' : score >= 40 ? 'Needs Improvement' : 'Critically Unprotected';
  return (
    <View style={scoreStyles.container}>
      <View style={[scoreStyles.ring, { borderColor: color }]}>
        <Text style={[scoreStyles.score, { color }]}>{score}</Text>
        <Text style={scoreStyles.max}>/100</Text>
      </View>
      <Text style={[scoreStyles.label, { color }]}>{label}</Text>
      <Text style={scoreStyles.sub}>DAIO Readiness Score</Text>
    </View>
  );
}

const scoreStyles = StyleSheet.create({
  container: { alignItems: 'center', paddingVertical: 16 },
  ring: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#111827',
    marginBottom: 12,
  },
  score: { fontSize: 40, fontWeight: '900' },
  max: { fontSize: 14, color: '#6B7280', marginTop: -4 },
  label: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  sub: { fontSize: 12, color: '#6B7280' },
});

// ─── Dead Man's Switch Screen ─────────────────────────────────────────────────
function DeadManSwitchScreen({ onBack }: { onBack: () => void }) {
  const { state, updateState, addAuditEntry } = useWallet();
  const dms = state.deadManSwitch;
  const [enabled, setEnabled] = useState(dms.enabled);
  const [interval, setInterval] = useState<3 | 6 | 12>(dms.intervalMonths);

  const statusColors = {
    inactive: '#6B7280',
    active: '#10B981',
    warning_1: '#F59E0B',
    warning_2: '#F97316',
    warning_3: '#EF4444',
    triggered: '#DC2626',
  };

  const statusLabels = {
    inactive: 'Inactive',
    active: 'Active – All OK',
    warning_1: 'Warning 1: 75% Inactivity reached',
    warning_2: 'Warning 2: 90% Inactivity reached',
    warning_3: 'Proof of Life required (Level 3)',
    triggered: 'TRIGGERED – Key distribution completed',
  };

  const handleSave = async () => {
    const now = Date.now();
    const intervalMs = interval * 30 * 24 * 60 * 60 * 1000;
    const nextCheckIn = now + intervalMs;
    await updateState({
      deadManSwitch: {
        ...dms,
        enabled,
        intervalMonths: interval,
        lastCheckIn: now,
        nextCheckIn,
        status: enabled ? 'active' : 'inactive',
        warningsSent: 0,
      },
    });
    addAuditEntry('DMS_CONFIG', `Dead Man's Switch ${enabled ? 'activated' : 'deactivated'}, Interval: ${interval} Months`, 'info');
    Alert.alert('✅ Saved', `Dead Man's Switch ${enabled ? 'activated' : 'deactivated'}`);
    onBack();
  };

  const handleCheckIn = async () => {
    const now = Date.now();
    const intervalMs = interval * 30 * 24 * 60 * 60 * 1000;
    await updateState({
      deadManSwitch: {
        ...dms,
        lastCheckIn: now,
        nextCheckIn: now + intervalMs,
        status: 'active',
        warningsSent: 0,
      },
    });
    addAuditEntry('PROOF_OF_LIFE', 'Manual Check-In performed (Proof of Life)', 'info');
    Alert.alert('✅ Check-In successful', `DMS has been reset. Next Check-In in ${interval} months.`);
  };

  return (
    <ScrollView style={styles.subScreen} showsVerticalScrollIndicator={false}>
      <TouchableOpacity style={styles.backBtn} onPress={onBack}>
        <Text style={styles.backBtnText}>← Back</Text>
      </TouchableOpacity>
      <Text style={styles.subTitle}>Dead Man's Switch</Text>
      <Text style={styles.subSubtitle}>
        "Orchestration without Custody": We never hold your keys. In case of inactivity, encrypted fragments are sent to your heirs.
      </Text>

      {/* Status Card */}
      <View style={[styles.statusCard, { borderColor: statusColors[dms.status] + '40', backgroundColor: dms.status === 'warning_3' ? '#EF444410' : '#111827' }]}>
        <View style={[styles.statusDot, { backgroundColor: statusColors[dms.status] } ]} />
        <View style={styles.statusInfo}>
          <Text style={[styles.statusLabel, { color: statusColors[dms.status] }]}>
            {statusLabels[dms.status]}
          </Text>
          {dms.enabled && (
            <Text style={styles.statusDetail}>
              Status: {dms.status === 'warning_3' ? 'CRITICAL - PoL Required' : 'Secured'}
            </Text>
          )}
        </View>
        {dms.enabled && dms.status !== 'triggered' && (
          <TouchableOpacity style={[styles.checkInBtn, dms.status === 'warning_3' && { backgroundColor: '#EF4444' }]} onPress={handleCheckIn}>
            <Text style={styles.checkInBtnText}>Check-In ✓</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Enable Toggle */}
      <View style={styles.settingRow}>
        <View>
          <Text style={styles.settingLabel}>Activate Dead Man's Switch</Text>
          <Text style={styles.settingDesc}>Automatic Governance Escalation</Text>
        </View>
        <Switch
          value={enabled}
          onValueChange={setEnabled}
          trackColor={{ false: '#374151', true: '#1D4ED8' }}
          thumbColor={enabled ? '#3B82F6' : '#6B7280'}
        />
      </View>

      {/* Vacation Mode */}
      <View style={[styles.settingRow, { borderTopWidth: 1, borderTopColor: '#1F2937', paddingTop: 16 }]}>
        <View>
          <Text style={styles.settingLabel}>Vacation Mode (Security Pause)</Text>
          <Text style={styles.settingDesc}>Pauses escalation during absence</Text>
        </View>
        <Switch
          value={false}
          onValueChange={() => Alert.alert('ℹ️ Info', 'Vacation Mode requires a return date. This feature will be unlocked in the next update.')}
          trackColor={{ false: '#374151', true: '#10B981' }}
          thumbColor={'#6B7280'}
        />
      </View>

      {/* Interval Selection */}
      <Text style={styles.sectionLabel}>Check Interval (Sovereignty)</Text>
      <View style={styles.intervalRow}>
        {([3, 6, 12] as const).map(months => (
          <TouchableOpacity
            key={months}
            style={[styles.intervalChip, interval === months && styles.intervalChipActive]}
            onPress={() => setInterval(months)}
          >
            <Text style={[styles.intervalChipText, interval === months && styles.intervalChipTextActive]}>
              {months} Months
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Escalation Steps */}
      <Text style={styles.sectionLabel}>Waterproof Escalation Chain</Text>
      <View style={styles.escalationSteps}>
        {[
          { step: 1, label: 'Warning 1 (75%)', desc: `Soft alert via App & Email`, icon: '📧', color: '#F59E0B' },
          { step: 2, label: 'Warning 2 (90%)', desc: `Critical alert + SMS`, icon: '📱', color: '#F97316' },
          { step: 3, label: 'Proof of Life (100%)', desc: `14-day Grace Period`, icon: '🚨', color: '#EF4444' },
          { step: 4, label: 'Final Trigger', desc: `Irreversible key delivery`, icon: '🔑', color: '#DC2626' },
        ].map(step => (
          <View key={step.step} style={styles.escalationStep}>
            <View style={[styles.escalationIcon, { backgroundColor: step.color + '20' }]}>
              <Text style={styles.escalationIconText}>{step.icon}</Text>
            </View>
            <View style={styles.escalationInfo}>
              <Text style={styles.escalationLabel}>{step.label}</Text>
              <Text style={styles.escalationDesc}>{step.desc}</Text>
            </View>
            <View style={[styles.escalationBadge, { backgroundColor: step.color + '20' }]}>
              <Text style={[styles.escalationBadgeText, { color: step.color }]}>Level {step.step}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Proof of Life Note */}
      <View style={styles.infoBox}>
        <Text style={styles.infoBoxIcon}>ℹ️</Text>
        <Text style={styles.infoBoxText}>
          <Text style={styles.infoBoxBold}>Proof of Life:</Text> Every login counts as a check-in and resets the timer. You can also manually confirm your activity via the "Check-In" button.
        </Text>
      </View>

      <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
        <Text style={styles.saveBtnText}>Save Settings</Text>
      </TouchableOpacity>
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

// ─── Shamir Secret Sharing Screen ─────────────────────────────────────────────
function ShamirScreen({ onBack }: { onBack: () => void }) {
  const { state, updateState, addAuditEntry } = useWallet();
  const shamir = state.shamirConfig;
  const [enabled, setEnabled] = useState(shamir.enabled);
  const [totalShares, setTotalShares] = useState(shamir.totalShares);
  const [threshold, setThreshold] = useState(shamir.threshold);

  const handleSave = async () => {
    await updateState({
      shamirConfig: {
        ...shamir,
        enabled,
        totalShares,
        threshold,
        shares: state.beneficiaries.slice(0, totalShares).map((b, i) => ({
          index: i + 1,
          recipientId: b.id,
          delivered: false,
          deliveryMethod: b.role === 'notary' ? 'notary' : 'email',
        })),
      },
    });
    addAuditEntry('SHAMIR_CONFIG', `Shamir Secret Sharing configured: ${threshold}-of-${totalShares}`, 'info');
    Alert.alert('✅ Configured', `${threshold}-of-${totalShares} Shamir Secret Sharing activated`);
    onBack();
  };

  return (
    <ScrollView style={styles.subScreen} showsVerticalScrollIndicator={false}>
      <TouchableOpacity style={styles.backBtn} onPress={onBack}>
        <Text style={styles.backBtnText}>← Back</Text>
      </TouchableOpacity>
      <Text style={styles.subTitle}>Shamir Secret Sharing</Text>
      <Text style={styles.subSubtitle}>
        Your master key is split into {totalShares} fragments. Only {threshold} fragments together can reconstruct the key. Each fragment is useless on its own.
      </Text>

      {/* Visual Diagram */}
      <View style={styles.shamirDiagram}>
        <View style={styles.shamirKey}>
          <Text style={styles.shamirKeyIcon}>🔑</Text>
          <Text style={styles.shamirKeyLabel}>Master Key</Text>
        </View>
        <Text style={styles.shamirArrow}>↓ Split</Text>
        <View style={styles.shamirShares}>
          {Array.from({ length: totalShares }).map((_, i) => (
            <View key={i} style={[styles.shamirShare, i < threshold && styles.shamirShareActive]}>
              <Text style={styles.shamirShareText}>{i + 1}</Text>
            </View>
          ))}
        </View>
        <Text style={styles.shamirNote}>{threshold} of {totalShares} fragments required</Text>
        <Text style={styles.shamirArrow}>↓ Reconstruct</Text>
        <View style={styles.shamirKey}>
          <Text style={styles.shamirKeyIcon}>🔓</Text>
          <Text style={styles.shamirKeyLabel}>Access Restored</Text>
        </View>
      </View>

      <View style={styles.settingRow}>
        <View>
          <Text style={styles.settingLabel}>Activate Shamir Secret Sharing</Text>
          <Text style={styles.settingDesc}>Split key among multiple people</Text>
        </View>
        <Switch
          value={enabled}
          onValueChange={setEnabled}
          trackColor={{ false: '#374151', true: '#1D4ED8' }}
          thumbColor={enabled ? '#3B82F6' : '#6B7280'}
        />
      </View>

      <Text style={styles.sectionLabel}>Number of Fragments (Total)</Text>
      <View style={styles.intervalRow}>
        {[3, 5, 7].map(n => (
          <TouchableOpacity
            key={n}
            style={[styles.intervalChip, totalShares === n && styles.intervalChipActive]}
            onPress={() => {
              setTotalShares(n);
              setThreshold(Math.ceil(n / 2));
            }}
          >
            <Text style={[styles.intervalChipText, totalShares === n && styles.intervalChipTextActive]}>
              {n} Parts
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.sectionLabel}>Threshold (Minimum for Reconstruction)</Text>
      <View style={styles.intervalRow}>
        {Array.from({ length: totalShares - 1 }, (_, i) => i + 2).map(n => (
          <TouchableOpacity
            key={n}
            style={[styles.intervalChip, threshold === n && styles.intervalChipActive]}
            onPress={() => setThreshold(n)}
          >
            <Text style={[styles.intervalChipText, threshold === n && styles.intervalChipTextActive]}>
              {n}-of-{totalShares}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Recipient Assignment */}
      <Text style={styles.sectionLabel}>Fragment Recipients</Text>
      {state.beneficiaries.slice(0, totalShares).map((ben, i) => (
        <View key={ben.id} style={styles.recipientRow}>
          <View style={[styles.shareNum, { backgroundColor: i < threshold ? '#1D4ED8' : '#1F2937' }]}>
            <Text style={styles.shareNumText}>{i + 1}</Text>
          </View>
          <View style={styles.recipientInfo}>
            <Text style={styles.recipientName}>{ben.name}</Text>
            <Text style={styles.recipientEmail}>{ben.email}</Text>
          </View>
          <View style={styles.deliveryBadge}>
            <Text style={styles.deliveryText}>
              {ben.role === 'notary' ? '⚖️ Notary' : '📧 Email'}
            </Text>
          </View>
        </View>
      ))}

      {/* Encryption Note */}
      <View style={styles.infoBox}>
        <Text style={styles.infoBoxIcon}>🔒</Text>
        <Text style={styles.infoBoxText}>
          <Text style={styles.infoBoxBold}>Encryption:</Text> Each fragment is encrypted with AES-256 and the predefined password before being sent. The password must be communicated to the recipients offline.
        </Text>
      </View>

      <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
        <Text style={styles.saveBtnText}>Save Configuration</Text>
      </TouchableOpacity>
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

// ─── Emergency Protocol Screen ────────────────────────────────────────────────
function EmergencyScreen({ onBack }: { onBack: () => void }) {
  const { state, updateState, addAuditEntry } = useWallet();
  const ep = state.emergencyProtocol;
  const [enabled, setEnabled] = useState(ep.enabled);
  const [showTrigger, setShowTrigger] = useState(false);
  const [reason, setReason] = useState('');
  const [confirmCode, setConfirmCode] = useState('');

  const handleSave = async () => {
    await updateState({
      emergencyProtocol: {
        ...ep,
        enabled,
        guardians: state.beneficiaries.filter(b => b.role === 'guardian').map(b => b.id),
      },
    });
    addAuditEntry('EMERGENCY_CONFIG', `Emergency protocol ${enabled ? 'activated' : 'deactivated'}`, 'warning');
    Alert.alert('✅ Saved', 'Emergency protocol configured');
    onBack();
  };

  const handleEmergencyTrigger = async () => {
    if (confirmCode !== 'EMERGENCY') {
      Alert.alert('Error', 'Please enter EMERGENCY to confirm');
      return;
    }
    await updateState({
      emergencyProtocol: {
        ...ep,
        lastTriggered: Date.now(),
        reason,
      },
    });
    addAuditEntry('EMERGENCY_TRIGGERED', `Emergency triggered: ${reason}`, 'critical');
    setShowTrigger(false);
    Alert.alert(
      '🚨 Emergency Triggered',
      'All Guardians have been notified. The process has been documented in the Audit Trail.',
      [{ text: 'OK', onPress: onBack }]
    );
  };

  return (
    <ScrollView style={styles.subScreen} showsVerticalScrollIndicator={false}>
      <TouchableOpacity style={styles.backBtn} onPress={onBack}>
        <Text style={styles.backBtnText}>← Back</Text>
      </TouchableOpacity>
      <Text style={styles.subTitle}>Emergency Protocol</Text>
      <Text style={styles.subSubtitle}>
        External emergency button for trusted contacts. Can be triggered in case of theft, extortion, or accident without Guardians having access to the assets.
      </Text>

      {/* Emergency Button */}
      <TouchableOpacity
        style={styles.emergencyButton}
        onPress={() => setShowTrigger(true)}
      >
        <Text style={styles.emergencyButtonIcon}>🚨</Text>
        <Text style={styles.emergencyButtonText}>TRIGGER EMERGENCY</Text>
        <Text style={styles.emergencyButtonSub}>Use only in a real emergency</Text>
      </TouchableOpacity>

      <View style={styles.settingRow}>
        <View>
          <Text style={styles.settingLabel}>Enable Emergency Protocol</Text>
          <Text style={styles.settingDesc}>Guardians can trigger an emergency</Text>
        </View>
        <Switch
          value={enabled}
          onValueChange={setEnabled}
          trackColor={{ false: '#374151', true: '#7F1D1D' }}
          thumbColor={enabled ? '#EF4444' : '#6B7280'}
        />
      </View>

      {/* Guardians */}
      <Text style={styles.sectionLabel}>Authorized Guardians</Text>
      {state.beneficiaries.filter(b => b.role === 'guardian').map(ben => (
        <View key={ben.id} style={styles.guardianCard}>
          <View style={styles.guardianAvatar}>
            <Text style={styles.guardianAvatarText}>
              {ben.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </Text>
          </View>
          <View style={styles.guardianInfo}>
            <Text style={styles.guardianName}>{ben.name}</Text>
            <Text style={styles.guardianContact}>{ben.email}</Text>
            {ben.phone && <Text style={styles.guardianContact}>{ben.phone}</Text>}
          </View>
          <View style={styles.guardianBadge}>
            <Text style={styles.guardianBadgeText}>🛡️ Guardian</Text>
          </View>
        </View>
      ))}

      {/* Protocol Steps */}
      <Text style={styles.sectionLabel}>Emergency Procedure</Text>
      {[
        { step: 1, icon: '🚨', label: 'Guardian triggers emergency', desc: 'With confirmation and reason' },
        { step: 2, icon: '📧', label: 'Owner gets 3 warnings', desc: 'Email, SMS, Push Notification' },
        { step: 3, icon: '⏳', label: '24h Waiting period', desc: 'Owner can cancel emergency' },
        { step: 4, icon: '🔑', label: 'Key fragments sent', desc: 'Encrypted to beneficiaries' },
        { step: 5, icon: '📋', label: 'Audit Trail documented', desc: 'Full traceability' },
      ].map(step => (
        <View key={step.step} style={styles.escalationStep}>
          <View style={[styles.escalationIcon, { backgroundColor: '#EF444420' }]}>
            <Text style={styles.escalationIconText}>{step.icon}</Text>
          </View>
          <View style={styles.escalationInfo}>
            <Text style={styles.escalationLabel}>{step.label}</Text>
            <Text style={styles.escalationDesc}>{step.desc}</Text>
          </View>
        </View>
      ))}

      <View style={[styles.infoBox, { borderColor: '#EF444440' }]}>
        <Text style={styles.infoBoxIcon}>⚖️</Text>
        <Text style={styles.infoBoxText}>
          <Text style={styles.infoBoxBold}>Regulatory Clarity:</Text> The Emergency Protocol is not a custody service under MiCA. The wallet never holds assets or keys. It exclusively orchestrates the governance process.
        </Text>
      </View>

      <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
        <Text style={styles.saveBtnText}>Save Settings</Text>
      </TouchableOpacity>
      <View style={{ height: 40 }} />

      {/* Emergency Trigger Modal */}
      <Modal visible={showTrigger} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { borderTopColor: '#EF4444', borderTopWidth: 3 }]}>
            <View style={styles.modalHandle} />
            <Text style={[styles.modalTitle, { color: '#EF4444' }]}>🚨 Confirm Emergency</Text>
            <Text style={styles.modalDesc}>
              This process will notify all Guardians and Beneficiaries and be documented in the Audit Trail.
            </Text>
            <Text style={styles.modalLabel}>Reason for Emergency</Text>
            <TextInput
              style={styles.modalInput}
              value={reason}
              onChangeText={setReason}
              placeholder="e.g. Theft, extortion, medical emergency..."
              placeholderTextColor="#4B5563"
              multiline
              numberOfLines={3}
            />
            <Text style={styles.modalLabel}>Confirmation: Type "EMERGENCY"</Text>
            <TextInput
              style={styles.modalInput}
              value={confirmCode}
              onChangeText={setConfirmCode}
              placeholder="EMERGENCY"
              placeholderTextColor="#4B5563"
              autoCapitalize="characters"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setShowTrigger(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalConfirmBtn, { backgroundColor: '#DC2626' }]}
                onPress={handleEmergencyTrigger}
              >
                <Text style={styles.modalConfirmText}>🚨 TRIGGER</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

// ─── Beneficiaries Screen ─────────────────────────────────────────────────────
function BeneficiariesScreen({ onBack }: { onBack: () => void }) {
  const { state, updateState, addAuditEntry } = useWallet();
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newRole, setNewRole] = useState<'heir' | 'guardian' | 'notary'>('heir');

  const roleColors = { heir: '#10B981', guardian: '#8B5CF6', notary: '#F59E0B' };
  const roleLabels = { heir: 'Heir', guardian: 'Guardian', notary: 'Notary' };
  const roleIcons = { heir: '🏛️', guardian: '🛡️', notary: '⚖️' };

  const handleAdd = async () => {
    if (!newName || !newEmail) {
      Alert.alert('Error', 'Name and Email are required');
      return;
    }
    const newBen: Beneficiary = {
      id: `ben_${Date.now()}`,
      name: newName,
      email: newEmail,
      phone: newPhone || undefined,
      role: newRole,
      notified: false,
    };
    await updateState({ beneficiaries: [...state.beneficiaries, newBen] });
    addAuditEntry('BENEFICIARY_ADDED', `Beneficiary added: ${newName} (${roleLabels[newRole]})`, 'info');
    setShowAdd(false);
    setNewName(''); setNewEmail(''); setNewPhone('');
  };

  const handleRemove = (id: string) => {
    Alert.alert('Remove?', 'Really remove beneficiary?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          await updateState({ beneficiaries: state.beneficiaries.filter(b => b.id !== id) });
          addAuditEntry('BENEFICIARY_REMOVED', `Beneficiary removed`, 'warning');
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.subScreen} showsVerticalScrollIndicator={false}>
      <TouchableOpacity style={styles.backBtn} onPress={onBack}>
        <Text style={styles.backBtnText}>← Back</Text>
      </TouchableOpacity>
      <View style={styles.subHeader}>
        <Text style={styles.subTitle}>Beneficiaries</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowAdd(true)}>
          <Text style={styles.addBtnText}>+ Add</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.subSubtitle}>
        Manage heirs, guardians, and notaries. Each role has defined rights and responsibilities within the DAIO framework.
      </Text>

      {/* Role Legend */}
      <View style={styles.roleLegend}>
        {Object.entries(roleLabels).map(([role, label]) => (
          <View key={role} style={styles.roleLegendItem}>
            <Text style={styles.roleLegendIcon}>{roleIcons[role as keyof typeof roleIcons]}</Text>
            <View>
              <Text style={[styles.roleLegendLabel, { color: roleColors[role as keyof typeof roleColors] }]}>{label}</Text>
              <Text style={styles.roleLegendDesc}>
                {role === 'heir' ? 'Receives Assets' : role === 'guardian' ? 'Emergency Trigger' : 'Key 1 Holder'}
              </Text>
            </View>
          </View>
        ))}
      </View>

      {state.beneficiaries.map(ben => (
        <View key={ben.id} style={styles.beneficiaryCard}>
          <View style={[styles.benAvatar, { backgroundColor: roleColors[ben.role] + '20' }]}>
            <Text style={styles.benAvatarText}>
              {ben.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </Text>
          </View>
          <View style={styles.benInfo}>
            <View style={styles.benNameRow}>
              <Text style={styles.benName}>{ben.name}</Text>
              <View style={[styles.roleBadge, { backgroundColor: roleColors[ben.role] + '20' }]}>
                <Text style={[styles.roleBadgeText, { color: roleColors[ben.role] }]}>
                  {roleIcons[ben.role]} {roleLabels[ben.role]}
                </Text>
              </View>
            </View>
            <Text style={styles.benEmail}>{ben.email}</Text>
            {ben.phone && <Text style={styles.benPhone}>{ben.phone}</Text>}
            {ben.keyShare && (
              <Text style={styles.benKeyShare}>🔑 Key Fragment #{ben.keyShare}</Text>
            )}
          </View>
          <TouchableOpacity style={styles.removeBtn} onPress={() => handleRemove(ben.id)}>
            <Text style={styles.removeBtnText}>✕</Text>
          </TouchableOpacity>
        </View>
      ))}

      {state.beneficiaries.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>👥</Text>
          <Text style={styles.emptyText}>No beneficiaries yet</Text>
        </View>
      )}

      <View style={{ height: 40 }} />

      {/* Add Modal */}
      <Modal visible={showAdd} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Add Beneficiary</Text>
            <Text style={styles.modalLabel}>Role</Text>
            <View style={styles.roleSelector}>
              {(['heir', 'guardian', 'notary'] as const).map(role => (
                <TouchableOpacity
                  key={role}
                  style={[styles.roleSelectorChip, newRole === role && { backgroundColor: roleColors[role] + '30', borderColor: roleColors[role] }]}
                  onPress={() => setNewRole(role)}
                >
                  <Text style={styles.roleSelectorText}>{roleIcons[role]} {roleLabels[role]}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.modalLabel}>Name *</Text>
            <TextInput style={styles.modalInput} value={newName} onChangeText={setNewName} placeholder="Full Name" placeholderTextColor="#4B5563" />
            <Text style={styles.modalLabel}>Email *</Text>
            <TextInput style={styles.modalInput} value={newEmail} onChangeText={setNewEmail} placeholder="email@example.com" placeholderTextColor="#4B5563" keyboardType="email-address" autoCapitalize="none" />
            <Text style={styles.modalLabel}>Phone (optional)</Text>
            <TextInput style={styles.modalInput} value={newPhone} onChangeText={setNewPhone} placeholder="+1 555 1234567" placeholderTextColor="#4B5563" keyboardType="phone-pad" />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setShowAdd(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalConfirmBtn} onPress={handleAdd}>
                <Text style={styles.modalConfirmText}>Add →</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

// ─── Inheritance Container Screen ──────────────────────────────────────────────
function ContainerScreen({ onBack }: { onBack: () => void }) {
  const { state, updateState, addAuditEntry } = useWallet();
  const container = state.inheritanceContainer || {
    level: 1,
    version: 1,
    lastUpdated: Date.now(),
    assetInventory: '',
    accessArchitecture: '',
    heirDesignation: '',
    legacyContext: '',
    platformInstructions: '',
    professionalContacts: '',
  };

  const [level, setLevel] = useState(container.level);
  const [assetInventory, setAssetInventory] = useState(container.assetInventory);
  const [accessArchitecture, setAccessArchitecture] = useState(container.accessArchitecture);
  const [heirDesignation, setHeirDesignation] = useState(container.heirDesignation);

  const handleSave = async () => {
    await updateState({
      inheritanceContainer: {
        ...container,
        level,
        assetInventory,
        accessArchitecture,
        heirDesignation,
        lastUpdated: Date.now(),
        version: container.version + 1,
      },
    });
    addAuditEntry('CONTAINER_UPDATED', `Inheritance Container updated (Level ${level})`, 'info');
    Alert.alert('✅ Saved', 'Inheritance Container has been updated.');
    onBack();
  };

  return (
    <ScrollView style={styles.subScreen} showsVerticalScrollIndicator={false}>
      <TouchableOpacity style={styles.backBtn} onPress={onBack}>
        <Text style={styles.backBtnText}>← Back</Text>
      </TouchableOpacity>
      <Text style={styles.subTitle}>Inheritance Container</Text>
      <Text style={styles.subSubtitle}>
        Document your assets and access instructions for your heirs. This information is stored encrypted on your device.
      </Text>

      <View style={styles.settingRow}>
        <View>
          <Text style={styles.settingLabel}>Protection Level</Text>
          <Text style={styles.settingDesc}>Depth of documentation</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 4 }}>
          {[1, 2, 3].map(l => (
            <TouchableOpacity
              key={l}
              style={[styles.levelChip, level === l && styles.levelChipActive]}
              onPress={() => setLevel(l as 1 | 2 | 3)}
            >
              <Text style={[styles.levelChipText, level === l && styles.levelChipTextActive]}>L{l}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <Text style={styles.sectionLabel}>Asset Inventory</Text>
      <TextInput
        style={styles.textArea}
        value={assetInventory}
        onChangeText={setAssetInventory}
        placeholder="List your wallets, exchanges, and physical backups..."
        placeholderTextColor="#4B5563"
        multiline
        numberOfLines={4}
      />

      <Text style={styles.sectionLabel}>Access Architecture</Text>
      <TextInput
        style={styles.textArea}
        value={accessArchitecture}
        onChangeText={setAccessArchitecture}
        placeholder="How can your heirs find the keys? (e.g. Safety deposit box, lawyer...)"
        placeholderTextColor="#4B5563"
        multiline
        numberOfLines={4}
      />

      <Text style={styles.sectionLabel}>Heir Designation</Text>
      <TextInput
        style={styles.textArea}
        value={heirDesignation}
        onChangeText={setHeirDesignation}
        placeholder="Specific distribution instructions..."
        placeholderTextColor="#4B5563"
        multiline
        numberOfLines={4}
      />

      <View style={styles.infoBox}>
        <Text style={styles.infoBoxIcon}>🔒</Text>
        <Text style={styles.infoBoxText}>
          <Text style={styles.infoBoxBold}>Zero Knowledge:</Text> This data is never sent to our servers. It is only included in the encrypted key fragments sent during a DMS trigger.
        </Text>
      </View>

      <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
        <Text style={styles.saveBtnText}>Save Container</Text>
      </TouchableOpacity>
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

// ─── Transfer Gate Protocol Screen ─────────────────────────────────────────────
function TransferGateScreen({ onBack }: { onBack: () => void }) {
  const steps = [
    { step: 1, label: 'Authorization', desc: 'Proof of Life failure or manual emergency trigger confirmed.', status: 'done' },
    { step: 2, label: 'Verification', desc: 'Grace period (14 days) or Guardian cooling-off period (24h).', status: 'active' },
    { step: 3, label: 'Preparation', desc: 'Collection of key fragments and validation of recipient addresses.', status: 'pending' },
    { step: 4, label: 'Execution', desc: 'Automated delivery of encrypted key fragments to beneficiaries.', status: 'pending' },
    { step: 5, label: 'Completion', desc: 'Full audit documentation and archive of the transfer process.', status: 'pending' },
  ];

  return (
    <ScrollView style={styles.subScreen} showsVerticalScrollIndicator={false}>
      <TouchableOpacity style={styles.backBtn} onPress={onBack}>
        <Text style={styles.backBtnText}>← Back</Text>
      </TouchableOpacity>
      <Text style={styles.subTitle}>Transfer Gate Protocol</Text>
      <Text style={styles.subSubtitle}>
        The 5-step horizontal protocol that governs the irreversible delivery of access rights.
      </Text>

      <View style={styles.timeline}>
        {steps.map((s, i) => (
          <View key={s.step} style={styles.timelineStep}>
            <View style={styles.timelineLeft}>
              <View style={[styles.timelineDot, s.status === 'done' && styles.timelineDotDone, s.status === 'active' && styles.timelineDotActive]} />
              {i < steps.length - 1 && <View style={styles.timelineLine} />}
            </View>
            <View style={styles.timelineRight}>
              <View style={styles.timelineHeader}>
                <Text style={[styles.timelineLabel, s.status === 'active' && { color: '#3B82F6' }]}>{s.label}</Text>
                <View style={[styles.statusBadgeSmall, s.status === 'done' && { backgroundColor: '#10B98120' }, s.status === 'active' && { backgroundColor: '#3B82F620' }]}>
                  <Text style={[styles.statusBadgeTextSmall, s.status === 'done' && { color: '#10B981' }, s.status === 'active' && { color: '#3B82F6' }]}>
                    {s.status.toUpperCase()}
                  </Text>
                </View>
              </View>
              <Text style={styles.timelineDesc}>{s.desc}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.infoBoxIcon}>⚡</Text>
        <Text style={styles.infoBoxText}>
          <Text style={styles.infoBoxBold}>Safety First:</Text> Once Step 4 starts, the process is irreversible. The Transfer Gate ensures no single person can trigger this alone.
        </Text>
      </View>

      <TouchableOpacity style={styles.saveBtn} onPress={onBack}>
        <Text style={styles.saveBtnText}>Close</Text>
      </TouchableOpacity>
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

// ─── Compliance Screen ────────────────────────────────────────────────────────
function ComplianceScreen({ onBack }: { onBack: () => void }) {
  const frameworks = [
    { title: 'MiCA Compliance', status: 'Compliant', desc: 'No custody of assets or keys. Orchestration only.', icon: '🇪🇺' },
    { title: 'BGH III ZR 183/17', status: 'Core Principle', desc: 'Full digital inheritance legal framework implementation.', icon: '⚖️' },
    { title: 'GDPR / DS-GVO', status: 'Compliant', desc: 'Zero-knowledge encryption for all sensitive data.', icon: '🔒' },
    { title: 'Heritage Integrity', status: 'Certified', desc: 'DAIO-certified protocol for immutable asset handover.', icon: '📜' },
    { title: 'Defined Liability', status: 'Legal Notice', desc: 'Clear separation between software and asset management.', icon: '📝' },
  ];

  return (
    <ScrollView style={styles.subScreen} showsVerticalScrollIndicator={false}>
      <TouchableOpacity style={styles.backBtn} onPress={onBack}>
        <Text style={styles.backBtnText}>← Back</Text>
      </TouchableOpacity>
      <Text style={styles.subTitle}>Regulatory Compliance</Text>
      <Text style={styles.subSubtitle}>
        Legal frameworks and standards that ensure the DAIO Wallet is "Waterproof" and legally sound.
      </Text>

      {frameworks.map(f => (
        <View key={f.title} style={styles.complianceCard}>
          <View style={styles.complianceHeader}>
            <Text style={styles.complianceIcon}>{f.icon}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.complianceTitle}>{f.title}</Text>
              <View style={styles.complianceBadge}>
                <Text style={styles.complianceBadgeText}>{f.status}</Text>
              </View>
            </View>
          </View>
          <Text style={styles.complianceDesc}>{f.desc}</Text>
        </View>
      ))}

      <View style={styles.infoBox}>
        <Text style={styles.infoBoxIcon}>ℹ️</Text>
        <Text style={styles.infoBoxText}>
          DAIO operates under the "Orchestration without Custody" principle, ensuring it does not fall under financial service licensing for asset custody.
        </Text>
      </View>

      <TouchableOpacity style={styles.saveBtn} onPress={onBack}>
        <Text style={styles.saveBtnText}>Close</Text>
      </TouchableOpacity>
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

// ─── Audit Trail Screen ────────────────────────────────────────────────────────
function AuditScreen({ onBack }: { onBack: () => void }) {
  const { state } = useWallet();
  const severityColors = { info: '#3B82F6', warning: '#F59E0B', critical: '#EF4444' };
  const severityIcons = { info: 'ℹ️', warning: '⚠️', critical: '🚨' };

  return (
    <ScrollView style={styles.subScreen} showsVerticalScrollIndicator={false}>
      <TouchableOpacity style={styles.backBtn} onPress={onBack}>
        <Text style={styles.backBtnText}>← Back</Text>
      </TouchableOpacity>
      <Text style={styles.subTitle}>Audit Trail</Text>
      <Text style={styles.subSubtitle}>
        Full, immutable logging of all security-relevant actions. Compliant with Heritage Integrity Framework.
      </Text>

      {state.auditLog.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📋</Text>
          <Text style={styles.emptyText}>No entries yet</Text>
          <Text style={styles.emptySubtext}>Actions will be logged here</Text>
        </View>
      )}

      {state.auditLog.map(entry => (
        <View key={entry.id} style={[styles.auditEntry, { borderLeftColor: severityColors[entry.severity] }]}>
          <View style={styles.auditHeader}>
            <Text style={styles.auditIcon}>{severityIcons[entry.severity]}</Text>
            <Text style={[styles.auditAction, { color: severityColors[entry.severity] }]}>{entry.action}</Text>
            <Text style={styles.auditTime}>
              {formatDate(entry.timestamp)}
            </Text>
          </View>
          <Text style={styles.auditDetails}>{entry.details}</Text>
          <Text style={styles.auditActor}>Actor: {entry.actor}</Text>
        </View>
      ))}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

// ─── Main Shield Screen ────────────────────────────────────────────────────────
export default function ShieldScreen() {
  const { state } = useWallet();
  const [subScreen, setSubScreen] = useState<SubScreen>('main');

  if (subScreen === 'dms') return (
    <SafeAreaView style={styles.container}>
      <DeadManSwitchScreen onBack={() => setSubScreen('main')} />
    </SafeAreaView>
  );
  if (subScreen === 'shamir') return (
    <SafeAreaView style={styles.container}>
      <ShamirScreen onBack={() => setSubScreen('main')} />
    </SafeAreaView>
  );
  if (subScreen === 'emergency') return (
    <SafeAreaView style={styles.container}>
      <EmergencyScreen onBack={() => setSubScreen('main')} />
    </SafeAreaView>
  );
  if (subScreen === 'beneficiaries') return (
    <SafeAreaView style={styles.container}>
      <BeneficiariesScreen onBack={() => setSubScreen('main')} />
    </SafeAreaView>
  );
  if (subScreen === 'container') return (
    <SafeAreaView style={styles.container}>
      <ContainerScreen onBack={() => setSubScreen('main')} />
    </SafeAreaView>
  );
  if (subScreen === 'gate') return (
    <SafeAreaView style={styles.container}>
      <TransferGateScreen onBack={() => setSubScreen('main')} />
    </SafeAreaView>
  );
  if (subScreen === 'compliance') return (
    <SafeAreaView style={styles.container}>
      <ComplianceScreen onBack={() => setSubScreen('main')} />
    </SafeAreaView>
  );
  if (subScreen === 'audit') return (
    <SafeAreaView style={styles.container}>
      <AuditScreen onBack={() => setSubScreen('main')} />
    </SafeAreaView>
  );

  const scoreColor = state.daiScore >= 70 ? '#10B981' : state.daiScore >= 40 ? '#F59E0B' : '#EF4444';

  const menuItems = [
    {
      id: 'container' as SubScreen,
      icon: '📦',
      title: 'Inheritance Container',
      desc: state.inheritanceContainer
        ? `Level ${state.inheritanceContainer.level} · Last updated ${formatDate(state.inheritanceContainer.lastUpdated, 'date')}`
        : 'Not documented yet',
      status: state.inheritanceContainer ? 'active' : 'inactive',
      color: '#3B82F6',
    },
    {
      id: 'dms' as SubScreen,
      icon: '⏱️',
      title: 'Dead Man\'s Switch',
      desc: state.deadManSwitch.enabled
        ? `Active · ${getTimeUntilTrigger(state.deadManSwitch)} remaining`
        : 'Not configured',
      status: state.deadManSwitch.enabled ? 'active' : 'inactive',
      color: '#3B82F6',
    },
    {
      id: 'shamir' as SubScreen,
      icon: '🔑',
      title: 'Shamir Secret Sharing',
      desc: state.shamirConfig.enabled
        ? `${state.shamirConfig.threshold}-of-${state.shamirConfig.totalShares} fragments`
        : 'Keys not split',
      status: state.shamirConfig.enabled ? 'active' : 'inactive',
      color: '#8B5CF6',
    },
    {
      id: 'emergency' as SubScreen,
      icon: '🚨',
      title: 'Emergency Protocol',
      desc: state.emergencyProtocol.enabled
        ? `${state.beneficiaries.filter(b => b.role === 'guardian').length} Guardian(s) authorized`
        : 'Emergency button inactive',
      status: state.emergencyProtocol.enabled ? 'active' : 'inactive',
      color: '#EF4444',
    },
    {
      id: 'beneficiaries' as SubScreen,
      icon: '👥',
      title: 'Beneficiaries',
      desc: `${state.beneficiaries.length} person(s) configured`,
      status: state.beneficiaries.length > 0 ? 'active' : 'inactive',
      color: '#10B981',
    },
    {
      id: 'audit' as SubScreen,
      icon: '📋',
      title: 'Audit Trail',
      desc: `${state.auditLog.length} entries · Heritage Integrity Framework`,
      status: 'info',
      color: '#F59E0B',
    },
    {
      id: 'gate' as SubScreen,
      icon: '⚡',
      title: 'Transfer Gate Protocol',
      desc: 'Immutable asset handover process',
      status: 'info',
      color: '#3B82F6',
    },
    {
      id: 'compliance' as SubScreen,
      icon: '🛡️',
      title: 'Compliance & Legal',
      desc: 'MiCA, BGH and GDPR standards',
      status: 'active',
      color: '#10B981',
    },
  ];

  // Score breakdown
  const scoreItems = [
    { label: 'Inheritance Container', points: state.inheritanceContainer ? 30 : 0, max: 30 },
    { label: 'Dead Man\'s Switch', points: state.deadManSwitch.enabled ? 20 : 0, max: 20 },
    { label: 'Shamir Secret Sharing', points: state.shamirConfig.enabled ? 20 : 0, max: 20 },
    { label: 'Beneficiaries', points: Math.min(state.beneficiaries.length * 5, 15), max: 15 },
    { label: 'Emergency Protocol', points: state.emergencyProtocol.enabled ? 10 : 0, max: 10 },
    { label: 'Biometrics', points: state.biometricEnabled ? 5 : 0, max: 5 },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>DAIO Shield</Text>
          <Text style={styles.subtitle}>Inheritance & Emergency Protection</Text>
        </View>

        {/* Score */}
        <View style={styles.scoreCard}>
          <ScoreRing score={state.daiScore} />
          <View style={styles.scoreBreakdown}>
            {scoreItems.map(item => (
              <View key={item.label} style={styles.scoreItem}>
                <Text style={styles.scoreItemLabel}>{item.label}</Text>
                <View style={styles.scoreItemBar}>
                  <View style={[styles.scoreItemFill, {
                    width: `${(item.points / item.max) * 100}%` as any,
                    backgroundColor: item.points === item.max ? '#10B981' : item.points > 0 ? '#F59E0B' : '#374151',
                  }]} />
                </View>
                <Text style={[styles.scoreItemPoints, { color: item.points === item.max ? '#10B981' : item.points > 0 ? '#F59E0B' : '#6B7280' }]}>
                  {item.points}/{item.max}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Four Immutable Principles */}
        <View style={styles.principlesCard}>
          <Text style={styles.principlesTitle}>The 4 Immutable Principles</Text>
          {[
            { icon: '🚫', title: 'No Custody', desc: 'DAIO never touches your assets or keys' },
            { icon: '👤', title: 'Client Sovereignty', desc: 'You decide what is documented and who has access' },
            { icon: '✅', title: 'Honesty About Limits', desc: 'Clear communication about possibilities and limits' },
            { icon: '⚖️', title: 'Regulatory Honesty', desc: 'MiCA-compliant, considering BGH III ZR 183/17' },
          ].map(p => (
            <View key={p.title} style={styles.principleItem}>
              <Text style={styles.principleIcon}>{p.icon}</Text>
              <View>
                <Text style={styles.principleTitle}>{p.title}</Text>
                <Text style={styles.principleDesc}>{p.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Menu Items */}
        {menuItems.map(item => (
          <TouchableOpacity
            key={item.id}
            style={styles.menuCard}
            onPress={() => setSubScreen(item.id)}
          >
            <View style={[styles.menuIcon, { backgroundColor: item.color + '20' }]}>
              <Text style={styles.menuIconText}>{item.icon}</Text>
            </View>
            <View style={styles.menuInfo}>
              <Text style={styles.menuTitle}>{item.title}</Text>
              <Text style={styles.menuDesc}>{item.desc}</Text>
            </View>
            <View style={styles.menuRight}>
              <View style={[styles.menuStatus, {
                backgroundColor: item.status === 'active' ? '#10B98120' : item.status === 'info' ? '#F59E0B20' : '#EF444420',
              }]}>
                <Text style={[styles.menuStatusText, {
                  color: item.status === 'active' ? '#10B981' : item.status === 'info' ? '#F59E0B' : '#EF4444',
                }]}>
                  {item.status === 'active' ? '✓' : item.status === 'info' ? 'i' : '!'}
                </Text>
              </View>
              <Text style={styles.menuChevron}>›</Text>
            </View>
          </TouchableOpacity>
        ))}

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0E1A' },
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16 },
  title: { fontSize: 28, fontWeight: '800', color: '#F9FAFB' },
  subtitle: { fontSize: 14, color: '#9CA3AF', marginTop: 4 },
  scoreCard: {
    marginHorizontal: 20,
    backgroundColor: '#111827',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#1F2937',
  },
  scoreBreakdown: { marginTop: 16 },
  scoreItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 8 },
  scoreItemLabel: { fontSize: 12, color: '#9CA3AF', width: 140 },
  scoreItemBar: { flex: 1, height: 6, backgroundColor: '#1F2937', borderRadius: 3, overflow: 'hidden' },
  scoreItemFill: { height: 6, borderRadius: 3 },
  scoreItemPoints: { fontSize: 12, fontWeight: '700', width: 36, textAlign: 'right' },
  principlesCard: {
    marginHorizontal: 20,
    backgroundColor: '#0D1B2A',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#1E3A5F',
  },
  principlesTitle: { fontSize: 14, fontWeight: '700', color: '#93C5FD', marginBottom: 12 },
  principleItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 10 },
  principleIcon: { fontSize: 18, width: 24 },
  principleTitle: { fontSize: 13, fontWeight: '700', color: '#F9FAFB', marginBottom: 2 },
  principleDesc: { fontSize: 12, color: '#9CA3AF', lineHeight: 16 },
  menuCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    backgroundColor: '#111827',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#1F2937',
  },
  menuIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  menuIconText: { fontSize: 24 },
  menuInfo: { flex: 1 },
  menuTitle: { fontSize: 16, fontWeight: '700', color: '#F9FAFB', marginBottom: 4 },
  menuDesc: { fontSize: 12, color: '#9CA3AF', lineHeight: 16 },
  menuRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  menuStatus: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  menuStatusText: { fontSize: 12, fontWeight: '800' },
  menuChevron: { fontSize: 22, color: '#6B7280' },
  // Sub screens
  subScreen: { flex: 1, paddingHorizontal: 20 },
  backBtn: { paddingVertical: 16 },
  backBtnText: { color: '#3B82F6', fontSize: 16 },
  subHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  subTitle: { fontSize: 26, fontWeight: '800', color: '#F9FAFB', marginBottom: 8 },
  subSubtitle: { fontSize: 14, color: '#9CA3AF', marginBottom: 24, lineHeight: 20 },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    gap: 12,
  },
  statusDot: { width: 12, height: 12, borderRadius: 6 },
  statusInfo: { flex: 1 },
  statusLabel: { fontSize: 15, fontWeight: '700' },
  statusDetail: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
  checkInBtn: {
    backgroundColor: '#10B98120',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  checkInBtnText: { color: '#10B981', fontSize: 13, fontWeight: '700' },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  settingLabel: { fontSize: 15, fontWeight: '600', color: '#F9FAFB', marginBottom: 4 },
  settingDesc: { fontSize: 12, color: '#9CA3AF' },
  levelChip: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#1F2937',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#374151',
  },
  levelChipActive: { backgroundColor: '#3B82F6', borderColor: '#60A5FA' },
  levelChipText: { fontSize: 12, fontWeight: '700', color: '#9CA3AF' },
  levelChipTextActive: { color: '#fff' },
  textArea: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 16,
    color: '#F9FAFB',
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#1F2937',
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  sectionLabel: { fontSize: 14, color: '#9CA3AF', fontWeight: '600', marginBottom: 12, marginTop: 8 },
  intervalRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  intervalChip: {
    flex: 1,
    backgroundColor: '#111827',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1F2937',
  },
  intervalChipActive: { backgroundColor: '#1D4ED8', borderColor: '#3B82F6' },
  intervalChipText: { fontSize: 13, color: '#9CA3AF', fontWeight: '600' },
  intervalChipTextActive: { color: '#fff' },
  escalationSteps: { marginBottom: 20 },
  escalationStep: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111827',
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    gap: 12,
  },
  escalationIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  escalationIconText: { fontSize: 22 },
  escalationInfo: { flex: 1 },
  escalationLabel: { fontSize: 14, fontWeight: '600', color: '#F9FAFB', marginBottom: 2 },
  escalationDesc: { fontSize: 12, color: '#9CA3AF' },
  escalationBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  escalationBadgeText: { fontSize: 11, fontWeight: '700' },
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
  infoBoxBold: { fontWeight: '700' },
  saveBtn: {
    backgroundColor: '#3B82F6',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  shamirDiagram: {
    backgroundColor: '#111827',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  shamirKey: { alignItems: 'center', marginVertical: 8 },
  shamirKeyIcon: { fontSize: 32, marginBottom: 4 },
  shamirKeyLabel: { fontSize: 13, color: '#9CA3AF', fontWeight: '600' },
  shamirArrow: { fontSize: 14, color: '#6B7280', marginVertical: 8 },
  shamirShares: { flexDirection: 'row', gap: 8, marginVertical: 8 },
  shamirShare: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1F2937',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#374151',
  },
  shamirShareActive: { backgroundColor: '#1D4ED8', borderColor: '#3B82F6' },
  shamirShareText: { fontSize: 16, fontWeight: '700', color: '#F9FAFB' },
  shamirNote: { fontSize: 12, color: '#9CA3AF', marginTop: 4 },
  recipientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111827',
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    gap: 12,
  },
  shareNum: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareNumText: { fontSize: 14, fontWeight: '800', color: '#fff' },
  recipientInfo: { flex: 1 },
  recipientName: { fontSize: 14, fontWeight: '600', color: '#F9FAFB' },
  recipientEmail: { fontSize: 12, color: '#9CA3AF' },
  deliveryBadge: { backgroundColor: '#1F2937', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  deliveryText: { fontSize: 12, color: '#9CA3AF' },
  emergencyButton: {
    backgroundColor: '#7F1D1D',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#EF4444',
  },
  emergencyButtonIcon: { fontSize: 48, marginBottom: 8 },
  emergencyButtonText: { fontSize: 20, fontWeight: '900', color: '#EF4444', letterSpacing: 2 },
  emergencyButtonSub: { fontSize: 12, color: '#FCA5A5', marginTop: 4 },
  guardianCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 16,
    marginBottom: 8,
    gap: 12,
  },
  guardianAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#8B5CF620',
    alignItems: 'center',
    justifyContent: 'center',
  },
  guardianAvatarText: { fontSize: 18, fontWeight: '700', color: '#8B5CF6' },
  guardianInfo: { flex: 1 },
  guardianName: { fontSize: 15, fontWeight: '600', color: '#F9FAFB' },
  guardianContact: { fontSize: 12, color: '#9CA3AF' },
  guardianBadge: { backgroundColor: '#8B5CF620', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  guardianBadgeText: { fontSize: 12, color: '#8B5CF6', fontWeight: '600' },
  roleLegend: {
    flexDirection: 'row',
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    justifyContent: 'space-around',
  },
  roleLegendItem: { alignItems: 'center', gap: 4 },
  roleLegendIcon: { fontSize: 24 },
  roleLegendLabel: { fontSize: 12, fontWeight: '700' },
  roleLegendDesc: { fontSize: 10, color: '#6B7280', textAlign: 'center' },
  beneficiaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 16,
    marginBottom: 8,
    gap: 12,
  },
  benAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  benAvatarText: { fontSize: 18, fontWeight: '700', color: '#F9FAFB' },
  benInfo: { flex: 1 },
  benNameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' },
  benName: { fontSize: 15, fontWeight: '600', color: '#F9FAFB' },
  roleBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  roleBadgeText: { fontSize: 11, fontWeight: '700' },
  benEmail: { fontSize: 12, color: '#9CA3AF' },
  benPhone: { fontSize: 12, color: '#9CA3AF' },
  benKeyShare: { fontSize: 11, color: '#3B82F6', marginTop: 2 },
  removeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#EF444420',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeBtnText: { color: '#EF4444', fontSize: 14, fontWeight: '700' },
  addBtn: {
    backgroundColor: '#1D4ED8',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  addBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  emptyState: { alignItems: 'center', paddingVertical: 48 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 16, color: '#6B7280', fontWeight: '600' },
  emptySubtext: { fontSize: 13, color: '#4B5563', marginTop: 4 },
  auditEntry: {
    backgroundColor: '#111827',
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    borderLeftWidth: 3,
  },
  auditHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  auditIcon: { fontSize: 16 },
  auditAction: { fontSize: 13, fontWeight: '700', flex: 1 },
  auditTime: { fontSize: 11, color: '#6B7280' },
  auditDetails: { fontSize: 13, color: '#D1D5DB', lineHeight: 18, marginBottom: 4 },
  auditActor: { fontSize: 11, color: '#6B7280' },
  // Timeline styles
  timeline: { marginBottom: 24, paddingLeft: 4 },
  timelineStep: { flexDirection: 'row', minHeight: 70 },
  timelineLeft: { alignItems: 'center', width: 24, marginRight: 16 },
  timelineDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#374151', zIndex: 1 },
  timelineDotActive: { backgroundColor: '#3B82F6', borderWidth: 2, borderColor: '#60A5FA' },
  timelineDotDone: { backgroundColor: '#10B981' },
  timelineLine: { width: 2, flex: 1, backgroundColor: '#1F2937', marginVertical: 4 },
  timelineRight: { flex: 1, paddingBottom: 20 },
  timelineHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  timelineLabel: { fontSize: 15, fontWeight: '700', color: '#F9FAFB' },
  statusBadgeSmall: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  statusBadgeTextSmall: { fontSize: 9, fontWeight: '800' },
  timelineDesc: { fontSize: 13, color: '#9CA3AF', lineHeight: 18 },
  // Compliance styles
  complianceCard: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#1F2937',
  },
  complianceHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  complianceIcon: { fontSize: 24 },
  complianceTitle: { fontSize: 15, fontWeight: '700', color: '#F9FAFB', marginBottom: 2 },
  complianceBadge: { alignSelf: 'flex-start', backgroundColor: '#10B98120', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  complianceBadgeText: { fontSize: 11, fontWeight: '700', color: '#10B981' },
  complianceDesc: { fontSize: 13, color: '#9CA3AF', lineHeight: 18 },
  roleSelector: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  roleSelectorChip: {
    flex: 1,
    backgroundColor: '#1F2937',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#374151',
  },
  roleSelectorText: { fontSize: 12, color: '#9CA3AF', fontWeight: '600' },
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
