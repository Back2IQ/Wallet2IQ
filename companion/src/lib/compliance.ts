/**
 * Compliance Checks — MiCA / BGH / GDPR / AML / Tax / Inheritance.
 *
 * Pure logic. Runs against a declarative CheckInput and returns a
 * structured ComplianceReport that can be rendered as PDF or JSON.
 */

export type Jurisdiction = 'EU' | 'DE' | 'AT' | 'CH' | 'US' | 'UK' | 'OTHER';

export type ComplianceCategory = 'mica' | 'bgh' | 'gdpr' | 'aml' | 'tax' | 'inheritance';

export type Severity = 'critical' | 'warning' | 'info' | 'ok';

export interface ComplianceCheck {
  id: string;
  category: ComplianceCategory;
  title: string;
  description: string;
  severity: Severity;
  passed: boolean;
  actionRequired?: string;
  jurisdictions: Jurisdiction[];
}

export interface ComplianceReport {
  generatedAt: number;
  jurisdiction: Jurisdiction;
  overallStatus: 'compliant' | 'action_required' | 'non_compliant';
  checks: ComplianceCheck[];
  score: number;
}

export interface CheckInput {
  hasBeneficiaries: boolean;
  beneficiaryCount: number;
  hasGuardians: boolean;
  guardianCount: number;
  hasNotary: boolean;
  dmsEnabled: boolean;
  hasInheritanceContainer: boolean;
  keyFragmentsDistributed: boolean;
  encryptionEnabled: boolean;
  totalValueUSD: number;
}

export function runComplianceChecks(input: CheckInput, jurisdiction: Jurisdiction): ComplianceCheck[] {
  const checks: ComplianceCheck[] = [];

  // ── MiCA ─────────────────────────────────────────────────────
  checks.push({
    id: 'mica-key-management',
    category: 'mica',
    title: 'Cryptographic Key Management',
    description: 'Keys derived via BIP-39/32, encrypted with AES-256-GCM at rest (PBKDF2 ≥ 600k).',
    severity: input.encryptionEnabled ? 'ok' : 'critical',
    passed: input.encryptionEnabled,
    actionRequired: input.encryptionEnabled ? undefined : 'Enable wallet encryption',
    jurisdictions: ['EU', 'DE', 'AT'],
  });
  if (input.totalValueUSD > 1000) {
    checks.push({
      id: 'mica-transfer-docs',
      category: 'mica',
      title: 'Transfer Identification',
      description: 'MiCA Art. 76: transfers above €1,000 require sender/recipient identification.',
      severity: 'info',
      passed: true,
      actionRequired: 'Ensure beneficiary addresses are documented in the Inheritance Container',
      jurisdictions: ['EU', 'DE', 'AT'],
    });
  }

  // ── BGH ──────────────────────────────────────────────────────
  checks.push({
    id: 'bgh-inheritance-plan',
    category: 'bgh',
    title: 'Digital Inheritance Plan',
    description: 'BGH III ZR 183/17: digital assets must be inheritable with a designated heir.',
    severity: input.hasBeneficiaries ? 'ok' : 'warning',
    passed: input.hasBeneficiaries,
    actionRequired: input.hasBeneficiaries ? undefined : 'Designate at least one heir',
    jurisdictions: ['DE'],
  });
  checks.push({
    id: 'bgh-access-arch',
    category: 'bgh',
    title: 'Access Architecture Documented',
    description: 'Access methods and recovery procedures must be documented for heirs.',
    severity: input.hasInheritanceContainer ? 'ok' : 'warning',
    passed: input.hasInheritanceContainer,
    actionRequired: input.hasInheritanceContainer ? undefined : 'Create an Inheritance Container',
    jurisdictions: ['DE'],
  });
  checks.push({
    id: 'bgh-key-distribution',
    category: 'bgh',
    title: 'Key Fragment Distribution',
    description: 'Key fragments must be distributed to designated parties (Shamir).',
    severity: input.keyFragmentsDistributed ? 'ok' : 'warning',
    passed: input.keyFragmentsDistributed,
    actionRequired: input.keyFragmentsDistributed ? undefined : 'Generate and distribute Shamir fragments',
    jurisdictions: ['DE', 'AT', 'CH'],
  });

  // ── GDPR ─────────────────────────────────────────────────────
  checks.push({
    id: 'gdpr-data-encryption',
    category: 'gdpr',
    title: 'Data Encryption at Rest',
    description: 'Personal data must be encrypted (GDPR Art. 32).',
    severity: input.encryptionEnabled ? 'ok' : 'critical',
    passed: input.encryptionEnabled,
    jurisdictions: ['EU', 'DE', 'AT'],
  });

  // ── AML ──────────────────────────────────────────────────────
  if (input.totalValueUSD > 10000) {
    checks.push({
      id: 'aml-high-value',
      category: 'aml',
      title: 'High-Value Portfolio Monitoring',
      description: 'AML rules require documented provenance for portfolios > €10,000.',
      severity: input.hasNotary ? 'ok' : 'warning',
      passed: input.hasNotary,
      actionRequired: input.hasNotary ? undefined : 'Connect a notary for provenance anchoring',
      jurisdictions: ['EU', 'DE', 'AT', 'CH', 'UK'],
    });
  }

  // ── Inheritance ──────────────────────────────────────────────
  checks.push({
    id: 'inh-guardians',
    category: 'inheritance',
    title: 'Guardian Network',
    description: 'At least 2 guardians required for social recovery quorum.',
    severity: input.hasGuardians && input.guardianCount >= 2 ? 'ok' : 'warning',
    passed: input.hasGuardians && input.guardianCount >= 2,
    actionRequired:
      input.guardianCount < 2 ? 'Add at least one more guardian to reach quorum' : undefined,
    jurisdictions: ['EU', 'DE', 'AT', 'CH', 'UK', 'US', 'OTHER'],
  });
  checks.push({
    id: 'inh-dms',
    category: 'inheritance',
    title: 'Dead-Man’s Switch',
    description: 'Inactivity sentinel triggers heir workflow automatically.',
    severity: input.dmsEnabled ? 'ok' : 'info',
    passed: input.dmsEnabled,
    actionRequired: input.dmsEnabled ? undefined : 'Enable the Dead-Man’s Switch',
    jurisdictions: ['EU', 'DE', 'AT', 'CH', 'UK', 'US', 'OTHER'],
  });

  return checks.filter((c) => c.jurisdictions.includes(jurisdiction));
}

export function buildReport(input: CheckInput, jurisdiction: Jurisdiction): ComplianceReport {
  const checks = runComplianceChecks(input, jurisdiction);
  const total = checks.length;
  const passed = checks.filter((c) => c.passed).length;
  const criticalsFailing = checks.filter((c) => c.severity === 'critical' && !c.passed).length;
  const score = total === 0 ? 100 : Math.round((passed / total) * 100);

  const overallStatus: ComplianceReport['overallStatus'] =
    criticalsFailing > 0 ? 'non_compliant' : passed === total ? 'compliant' : 'action_required';

  return {
    generatedAt: Date.now(),
    jurisdiction,
    overallStatus,
    checks,
    score,
  };
}
