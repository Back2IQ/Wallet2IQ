import { describe, it, expect, beforeEach } from 'vitest';
import {
  calculateDaiScore,
  MOCK_TOKENS,
  MOCK_TRANSACTIONS,
  MOCK_BENEFICIARIES,
  DEFAULT_STATE,
  CHAIN_CONFIG,
  type WalletState,
  type DeadManSwitch,
} from '../lib/wallet-store';
import {
  formatCurrency,
  formatCrypto,
  shortenAddress,
  getTimeUntilTrigger,
} from '../lib/format';

// ─── DAI Score Tests ──────────────────────────────────────────────────────────

describe('calculateDaiScore', () => {
  it('returns 0 for default empty state', () => {
    const score = calculateDaiScore(DEFAULT_STATE);
    expect(score).toBe(0);
  });

  it('adds 20 points for enabled Dead Man\'s Switch', () => {
    const state: WalletState = {
      ...DEFAULT_STATE,
      deadManSwitch: { ...DEFAULT_STATE.deadManSwitch, enabled: true },
    };
    const score = calculateDaiScore(state);
    expect(score).toBeGreaterThanOrEqual(20);
  });

  it('adds 20 points for enabled Shamir config with shares', () => {
    const state: WalletState = {
      ...DEFAULT_STATE,
      shamirConfig: {
        enabled: true,
        totalShares: 3,
        threshold: 2,
        shares: [
          { index: 1, recipientId: 'ben1', delivered: false, deliveryMethod: 'email' },
        ],
      },
    };
    const score = calculateDaiScore(state);
    expect(score).toBeGreaterThanOrEqual(20);
  });

  it('adds 5 points for biometric enabled', () => {
    const state: WalletState = {
      ...DEFAULT_STATE,
      biometricEnabled: true,
    };
    const score = calculateDaiScore(state);
    expect(score).toBe(5);
  });

  it('adds 10 points for emergency protocol enabled', () => {
    const state: WalletState = {
      ...DEFAULT_STATE,
      emergencyProtocol: { ...DEFAULT_STATE.emergencyProtocol, enabled: true },
    };
    const score = calculateDaiScore(state);
    expect(score).toBe(10);
  });

  it('adds 5 points for having at least 1 beneficiary', () => {
    const state: WalletState = {
      ...DEFAULT_STATE,
      beneficiaries: [MOCK_BENEFICIARIES[0]],
    };
    const score = calculateDaiScore(state);
    expect(score).toBeGreaterThanOrEqual(5);
  });

  it('adds 5 more points for having a notary beneficiary', () => {
    const state: WalletState = {
      ...DEFAULT_STATE,
      beneficiaries: MOCK_BENEFICIARIES, // includes notary
    };
    const score = calculateDaiScore(state);
    // 5 (>=1 beneficiary) + 5 (>=2 beneficiaries) + 5 (has notary) = 15
    expect(score).toBeGreaterThanOrEqual(15);
  });

  it('adds 10 points for Level 1 inheritance container', () => {
    const state: WalletState = {
      ...DEFAULT_STATE,
      inheritanceContainer: {
        level: 1,
        version: 1,
        lastUpdated: Date.now(),
        assetInventory: 'test',
        accessArchitecture: 'test',
        heirDesignation: 'test',
        legacyContext: 'test',
        platformInstructions: 'test',
        professionalContacts: 'test',
      },
    };
    const score = calculateDaiScore(state);
    expect(score).toBeGreaterThanOrEqual(10);
  });

  it('caps score at 100', () => {
    const state: WalletState = {
      ...DEFAULT_STATE,
      biometricEnabled: true,
      deadManSwitch: { ...DEFAULT_STATE.deadManSwitch, enabled: true },
      shamirConfig: {
        enabled: true,
        totalShares: 3,
        threshold: 2,
        shares: [{ index: 1, recipientId: 'ben1', delivered: false, deliveryMethod: 'email' }],
      },
      emergencyProtocol: { ...DEFAULT_STATE.emergencyProtocol, enabled: true },
      beneficiaries: MOCK_BENEFICIARIES,
      inheritanceContainer: {
        level: 3,
        version: 1,
        lastUpdated: Date.now(),
        assetInventory: 'test',
        accessArchitecture: 'test',
        heirDesignation: 'test',
        legacyContext: 'test',
        platformInstructions: 'test',
        professionalContacts: 'test',
      },
    };
    const score = calculateDaiScore(state);
    expect(score).toBeLessThanOrEqual(100);
  });
});

// ─── Format Utilities Tests ───────────────────────────────────────────────────

describe('formatCurrency', () => {
  it('formats USD amounts correctly', () => {
    const result = formatCurrency(1234.56);
    expect(result).toContain('1,234');
    expect(result).toContain('.56');
  });

  it('handles zero amount', () => {
    const result = formatCurrency(0);
    expect(result).toContain('0.00');
  });

  it('handles large amounts', () => {
    const result = formatCurrency(1000000);
    expect(result).toContain('1,000,000');
  });
});

describe('formatCrypto', () => {
  it('formats BTC with 4 decimal places by default', () => {
    const result = formatCrypto(0.4821, 'BTC');
    expect(result).toBe('0.4821 BTC');
  });

  it('formats ETH with custom decimals', () => {
    const result = formatCrypto(3.215, 'ETH', 3);
    expect(result).toBe('3.215 ETH');
  });

  it('formats small amounts correctly', () => {
    const result = formatCrypto(0.0001, 'BTC');
    expect(result).toBe('0.0001 BTC');
  });
});

describe('shortenAddress', () => {
  it('shortens a long Ethereum address', () => {
    const address = '0x742d35Cc6634C0532925a3b8D4C9C3A1D9';
    const result = shortenAddress(address);
    expect(result).toContain('...');
    expect(result.length).toBeLessThan(address.length);
  });

  it('returns short addresses unchanged', () => {
    const address = '0x1234';
    const result = shortenAddress(address);
    expect(result).toBe(address);
  });
});

// ─── Dead Man's Switch Tests ──────────────────────────────────────────────────

describe('getTimeUntilTrigger', () => {
  it('returns "Overdue" when next check-in is in the past', () => {
    const dms: DeadManSwitch = {
      enabled: true,
      intervalMonths: 6,
      lastCheckIn: Date.now() - 200 * 24 * 60 * 60 * 1000,
      status: 'warning_3',
      warningsSent: 3,
      nextCheckIn: Date.now() - 1000, // past
    };
    expect(getTimeUntilTrigger(dms)).toBe('Overdue');
  });

  it('returns months when more than 30 days remain', () => {
    const dms: DeadManSwitch = {
      enabled: true,
      intervalMonths: 6,
      lastCheckIn: Date.now(),
      status: 'active',
      warningsSent: 0,
      nextCheckIn: Date.now() + 90 * 24 * 60 * 60 * 1000, // 90 days
    };
    const result = getTimeUntilTrigger(dms);
    expect(result).toContain('Month');
  });

  it('returns days when less than 30 days remain', () => {
    const dms: DeadManSwitch = {
      enabled: true,
      intervalMonths: 6,
      lastCheckIn: Date.now(),
      status: 'warning_1',
      warningsSent: 1,
      nextCheckIn: Date.now() + 15 * 24 * 60 * 60 * 1000, // 15 days
    };
    const result = getTimeUntilTrigger(dms);
    expect(result).toContain('Day');
  });
});

// ─── Mock Data Tests ──────────────────────────────────────────────────────────

describe('MOCK_TOKENS', () => {
  it('contains exactly 6 tokens (one per supported chain)', () => {
    expect(MOCK_TOKENS).toHaveLength(6);
  });

  it('covers all 6 supported chains', () => {
    const chains = MOCK_TOKENS.map(t => t.chain);
    expect(chains).toContain('bitcoin');
    expect(chains).toContain('ethereum');
    expect(chains).toContain('bnb');
    expect(chains).toContain('solana');
    expect(chains).toContain('polygon');
    expect(chains).toContain('avalanche');
  });

  it('all tokens have positive balances and prices', () => {
    MOCK_TOKENS.forEach(token => {
      expect(token.balance).toBeGreaterThan(0);
      expect(token.price).toBeGreaterThan(0);
      expect(token.balanceUSD).toBeGreaterThan(0);
    });
  });
});

describe('MOCK_BENEFICIARIES', () => {
  it('contains heir, notary, and guardian roles', () => {
    const roles = MOCK_BENEFICIARIES.map(b => b.role);
    expect(roles).toContain('heir');
    expect(roles).toContain('notary');
    expect(roles).toContain('guardian');
  });

  it('each beneficiary has a unique key share index', () => {
    const shares = MOCK_BENEFICIARIES.map(b => b.keyShare).filter(Boolean);
    const uniqueShares = new Set(shares);
    expect(uniqueShares.size).toBe(shares.length);
  });
});

describe('CHAIN_CONFIG', () => {
  it('has entries for all 6 chains', () => {
    expect(Object.keys(CHAIN_CONFIG)).toHaveLength(6);
  });

  it('each chain has required fields', () => {
    Object.values(CHAIN_CONFIG).forEach(config => {
      expect(config.name).toBeTruthy();
      expect(config.symbol).toBeTruthy();
      expect(config.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(config.explorerUrl).toContain('https://');
    });
  });
});

// ─── Default State Tests ──────────────────────────────────────────────────────

describe('DEFAULT_STATE', () => {
  it('starts with isSetup false', () => {
    expect(DEFAULT_STATE.isSetup).toBe(false);
  });

  it('starts with owner role', () => {
    expect(DEFAULT_STATE.userRole).toBe('owner');
  });

  it('starts with Dead Man\'s Switch disabled', () => {
    expect(DEFAULT_STATE.deadManSwitch.enabled).toBe(false);
  });

  it('starts with Shamir config disabled', () => {
    expect(DEFAULT_STATE.shamirConfig.enabled).toBe(false);
  });

  it('starts with empty audit log', () => {
    expect(DEFAULT_STATE.auditLog).toHaveLength(0);
  });

  it('starts with empty beneficiaries', () => {
    expect(DEFAULT_STATE.beneficiaries).toHaveLength(0);
  });

  it('starts with DAI score of 0', () => {
    expect(DEFAULT_STATE.daiScore).toBe(0);
  });
});
