# TPW-Specs — The Essence of the DAIO Wallet

> **Scope.** This document captures the complete technical and conceptual essence of
> the wallet at the heart of the **DAIO** (Digital Asset Inheritance Orchestration)
> project — across its three living forms: the original **DAIO Wallet Pro** (multi-chain
> reference wallet), the **DAIO Security Companion** (12 standalone, bring-your-own-wallet
> security modules), and the **wallet-governance layer migrated into the DAIO Unified
> Platform** (vault protocol, succession sentinel, emergency protocol, governance store).
>
> **Author:** Deniz Kiran / Back2IQ · **License:** CC BY-NC-SA 4.0 (companion: MIT)
> **Status snapshot:** April 2026 codebase, this spec written 2026-06-28.

---

## 1. The One-Sentence Essence

**A non-custodial, client-side, multi-chain crypto wallet whose defining purpose is not
sending money — it is making digital wealth survive the death or incapacity of its owner**,
through a cryptographically enforced succession architecture (Shamir threshold sharing,
dead-man's switch, guardian/heir/notary roles, transfer gates, panic button) that runs
entirely in the browser with zero custody, zero backend, and zero telemetry.

The wallet answers a single hard question that ordinary wallets ignore:
**"What happens to these keys when I am gone?"**

---

## 2. Why It Exists (Problem Frame)

- An estimated **20% of all Bitcoin is permanently lost** for lack of succession infrastructure.
- The problem space is **€800B+** of digital wealth at risk of becoming permanently inaccessible.
- **BGH III ZR 183/17** obliges financial institutions to disclosure duties for digital assets.
- **MiCA** tightens documentation, traceability, and transfer requirements.
- Advisors face **personal liability** for undocumented inheritance processes.
- The baby-boomer wealth transfer peaks **2025–2035**.

Ordinary wallets optimize for the living holder. This wallet optimizes for **continuity** —
the asset outliving the holder's access to it.

---

## 3. Design Philosophy — The Non-Custody Covenant

Five invariants define the wallet's soul. Every feature is in service of these:

1. **No custody.** The system never holds keys or assets. It orchestrates *governance around*
   keys the user controls. ("Bring your own wallet, keep your own keys.")
2. **Client-side only.** All cryptography runs in the browser tab via the Web Crypto API and
   audited pure-JS libraries. No backend, no accounts, no tracking. Network calls happen *only*
   when the user explicitly triggers an on-chain action.
3. **Secrets live in memory, never at rest in plaintext.** The mnemonic, private keys, and
   Shamir shares exist only while unlocked and are wiped on lock.
4. **Threshold over single-point.** No single device, person, or shard can reconstruct a secret.
   Succession requires a quorum (guardians) plus process (notary, time-lock, veto).
5. **Reversibility before finality.** Every escalation (panic, DMS trigger, recovery) is gated by
   time-locks and veto windows so a false trigger can be corrected before irreversible transfer.

A recurring internal motif: tooling must never **become a weapon against its own user**
(target-address validation, veto periods, time-locks all encode this).

---

## 4. The Three Embodiments

| Embodiment | Path | What it is |
|---|---|---|
| **DAIO Wallet Pro** | `src/` (migrated; documented in `AGENTS.md`) | Full multi-chain EVM wallet with inheritance features baked in. |
| **DAIO Security Companion** | `companion/` | 12 standalone, deployable security modules — the security *around* any wallet. MIT-licensed, fork-and-rebrand. |
| **Unified governance layer** | `daio-unified/` + `DAIOCompanionCore.ts` | Wallet-governance features migrated into the unified institutional platform. |

These share one cryptographic and conceptual DNA. The sections below specify each layer,
then the cross-cutting succession architecture that unifies them.

---

## 5. Technology Stack (Canonical)

| Layer | Wallet Pro | Companion | Unified |
|---|---|---|---|
| Framework | React 19.2 | React 19.2 | React 19.2 (+ Router 7.6) |
| Language | TypeScript 5.9 (strict) | TS 5.9 (strict) | TS 5.9 (strict) |
| Build | Vite 7.2 | Vite 7.2 (port 5174) | Vite 7.2 |
| Styling | Tailwind 3.4 + shadcn/ui (New York, 40+ components) | Tailwind 3.4, custom `vault-*`/`signal-*` palette | Tailwind 3.4 + Radix UI |
| State | Zustand 5 (`persist`, `partialize`) | local component state | Zustand 5 (`persist`) |
| Server state | TanStack Query 5 | — | TanStack Query |
| Blockchain | viem 2.46 | viem 2.46 | Web Crypto only |
| Crypto | `@scure/bip39`, `@scure/bip32`, `@noble/secp256k1`, `@noble/hashes` | `@noble/hashes` 2.0, `@noble/secp256k1` 3.0, `@scure/bip32/bip39` | Web Crypto API |
| WalletConnect | `@reown/walletkit` 1.5 | — | — |
| Testing | Vitest 4 (Node env, real Web Crypto) | — | — |
| Charts / PDF | — | — | Recharts, pdf-lib, html-to-image |

**Shared crypto primitives:** AES-256-GCM, PBKDF2, Argon2id, keccak256 / SHA-256 / SHA-3,
secp256k1, BIP-39/BIP-32, Shamir over GF(p) with Feldman VSS.

---

## 6. DAIO Wallet Pro — Core Wallet Spec

A single-page app (no router; `activeTab` state + `renderContent()` switch). Central
truth is the Zustand `walletStore`.

### 6.1 Capabilities
- Multi-chain EVM networks; WalletConnect (Reown) dApp connectivity.
- Token / NFT / DeFi portfolio tracking (Alchemy RPC helpers).
- Send / Swap; transaction simulation; calldata decoding.
- Role-based portals: **Guardian**, **Heir**, **Notary**.
- Inheritance: Dead Man's Switch, Shamir secret sharing, transfer gate, panic button, audit trail.

### 6.2 Key Handling & Crypto Invariants
- **Mnemonic encryption:** AES-GCM with a key derived via **PBKDF2, 600,000 iterations**.
  The encrypted vault `{ciphertext, iv, salt}` persists to `localStorage` (Zustand `persist`).
  Plaintext `mnemonicPlain` is **memory-only** while unlocked.
- **Password hashing:** **Argon2id** (`t=3, m=4096, p=1, dkLen=32`) via `@noble/hashes`,
  with a **PBKDF2 fallback**. Stored hashes carry an `argon2id$` prefix for auto-detection.
- **Private keys:** re-derived from the decrypted mnemonic on unlock; cleared (empty strings) on lock.
- **Brute-force protection:** exponential backoff (`2^attempts` s, capped at 5 min) + sliding-window limiter.
- **Tx rate limiting:** `sendTransaction` throttled against rapid-fire sends.
- **MEV protection:** broadcasts can route through MEV-protected RPCs (e.g. Flashbots Protect on mainnet).
- **XSS:** user strings sanitized via `sanitize()` before render; strict CSP meta in `index.html`.
- **Auto-lock:** after 5 min idle; immediately when tab hidden 30s+ or page frozen.

### 6.3 Architectural Patterns
- **`partialize`** strips `mnemonicPlain`, `privateKey`, `share` from persisted state.
- **viem PublicClient cache** keyed per `chainId`.
- **Custom `NonceManager`** tracks on-chain + locally pending nonces.
- **Shamir** `splitSecret` / `reconstructSecret` distributes mnemonic fragments to heirs/guardians.

### 6.4 Store Topology
`walletStore` (wallet, accounts, networks, DMS, audit) · `accountStore` · `inheritanceStore`
(container / transfer gate) · `securityStore` · `emergencyStore` · `networkStore`.

### 6.5 Hard Invariants for Maintainers
- Never log/expose `mnemonicPlain`, `privateKey`, or shares.
- Never weaken PBKDF2 iterations or Argon2 parameters.
- New stores must separate persisted state from ephemeral secrets.
- New chains require updates in both `blockchain.ts` (`chainMap`, `rpcUrls`) and `walletStore.ts` (`defaultNetworks`).

---

## 7. DAIO Security Companion — 12 Modules

Standalone, client-side, zero-telemetry. Hash-based SPA routing (works on any static host).
Routes: `#/device #/rate #/shamir #/display #/social #/dms #/notary #/honeypot #/detector #/gate #/compliance #/approvals`.

### Keys & Access

**1. Device Binding** — `lib/deviceBinding.ts`
Non-extractable **AES-256-GCM** CryptoKey in IndexedDB (`daio-device-keys` / `keys` / `device-master`),
scoped to origin + device, **12-byte random IV** per op. Ciphertext can't be exported to another
device/browser. API: `getDeviceKey`, `deviceEncrypt`, `deviceDecrypt`, `hasDeviceKey`,
`rotateDeviceKey`, `isDeviceBindingAvailable`. *Caveat:* private-browsing wipes it — pair with
Social Recovery / Shamir backup.

**2. Rate Limiter** — `lib/rateLimit.ts`
Sliding-window + lockout, persisted in `localStorage` (`daio-rl:` prefix) so page reload is not a bypass.

| Action | max | window | cooldown |
|---|---|---|---|
| UNLOCK | 5 | 60s | 120s |
| EMERGENCY | 3 | 300s | 600s |
| RECOVERY | 3 | 600s | 900s |
| SEND_TX | 10 | 60s | 30s |

API: `checkRateLimit`, `recordAttempt`, `resetRateLimit`, `getRateLimitState`.

**3. Shamir Secret Sharing** — `lib/shamir.ts`
Pure BigInt over **GF(p)** with **Feldman VSS**. Field prime
`p = 2^256 − 2^32 − 977` (secp256k1 field), generator `g = 2`. `crypto.getRandomValues` for
coefficients; coefficients wiped after split. Commitments `Cⱼ = g^aⱼ mod p`. Verify:
`g^y ≡ ∏ Cᵢ^(xⁱ) (mod p)`. Reconstruct via Lagrange interpolation at `x=0`. Constraints:
`2 ≤ threshold ≤ total ≤ 255`. API: `splitSecret`, `reconstructSecret`, `verifyShare`.

**4. Secure Display** — `lib/secureDisplay.ts`
Canvas-only secret rendering (no DOM text → defeats extension/clipboard scrapers). 600×240 DPR-scaled,
diagonal watermark (timestamp + session id, ~5% opacity), 80-pixel noise layer, "DO NOT PHOTOGRAPH /
RECORD" footer, optional **auto-destruct** (overwrite with crypto-random ImageData → black → "— DESTROYED —").
API: `renderSecretOnCanvas`, `destroyCanvas`.

### Heirs & Recovery

**5. Social Recovery** — `lib/socialRecovery.ts`
Guardian-quorum recovery with an **owner veto window**. State machine:
`idle → initiated → pending_fragments → fragments_collected → veto_period → (vetoed | executing → completed)`.
Defaults: `vetoPeriodHours 48`, `requiredGuardians 2`, `maxRecoveryAttempts 3`. Veto deadline =
`createdAt + vetoPeriodHours·3600000`. API: `createRecoveryRequest`, `submitFragment`,
`startVetoPeriod`, `vetoRecovery`, `executeRecovery`, `completeRecovery`, `getVetoTimeRemaining`.

**6. Dead-Man's Switch (Succession Sentinel)** — `lib/deadManSwitch.ts`
Inactivity sentinel with a **saturating warning curve**. Status by inactivity vs `thresholdDays`:
`<0.7× healthy · <1.0× warning · <1.5× critical · ≥1.5× triggered` (heir eligible).
Saturation `= min(1, 1 − e^(−α·t/threshold))`, `α=2`. API: `evaluateSentinel`, `recordCheckIn`,
`sentinelStatusTone`.

**7. Notary Anchor** — `lib/notaryAnchor.ts`
**keccak256** document hashing + **unsigned** anchor tx builder (caller signs). Doc types:
death_certificate, court_order, power_of_attorney, identity_document, notarized_declaration, other.
Lifecycle: `pending → hash_computed → anchored → verified | rejected`. ABI:
`anchor(bytes32 documentHash, uint256 timestamp)` via viem `encodeFunctionData`.
API: `hashDocument`, `hashString`, `createAnchorDocument`, `buildAnchorTx`.

### Guards & Monitors

**8. Honeypot Vault** — `lib/honeypot.ts`
Decoy vaults + canary shards (Nash-equilibrium deception: attacker can't tell real from decoy).
Decoy mimics real metadata but with threshold `t−1` and a random fake secret (still a *valid-looking*
Feldman-committed vault). Canary shards use high indices (100+) and flag `isCanary`. Silent alert:
SHA-256 `alertToken` over `ALERT:vaultId:indices:timestamp` on reconstruction attempt.
API: `createDecoyVault`, `createCanaryShards`, `detectCanary`, `generateAlertToken`, `fireHoneypotTrigger`.
(Unified variant adds a **tripwire container** with deliberately lower threshold to warn before the real vault is at risk.)

**9. Secret / PII Detector** — `lib/secretDetector.ts`
Real-time scan for BIP39 seeds (12/15/18/21/24 words, ≥75% in wordlist → critical), ETH private keys
(`0x?[0-9a-f]{64}` critical), BTC WIF, ETH/BTC addresses (medium), JWTs (`eyJ…` high), AWS keys
(`AKIA/ASIA` high), generic API keys (`sk_/pk_/ghp_/xox*/AIza…` high). Redaction: first4 + bullets + last4.
For clipboard guards, log filters, support-chat sanitizers. API: `scanText`, `redactText`, `kindLabel`.

**10. Transfer Gate** — `lib/transferGate.ts`
Pre-tx policy engine (never signs). Defaults: `notaryThresholdUSD 50,000`, `guardianApprovalAlways true`,
`baseTimeLockHours 48`, `emergencyTimeLockHours 72`, `blockedRecipients []`. Decision sets
`requiresNotary` (amount ≥ threshold ∨ emergency ∨ sentinelTriggered), time-lock (emergency/sentinel → 72h
else 48h), guardian approval, and reason codes (`blocked_recipient`, `amount_over_threshold`,
`emergency_flag`, `sentinel_triggered`). API: `evaluateTransfer`.

### Operations

**11. Compliance Dashboard** — `lib/compliance.ts`
Pure-logic evaluation vs **MiCA, BGH, GDPR, AML, tax, inheritance** per jurisdiction
(`EU/DE/AT/CH/US/UK/OTHER`). Sample checks: MiCA key mgmt (AES-256-GCM + PBKDF2 ≥600k), MiCA transfer
docs (>€1,000), BGH inheritance plan / access arch / key distribution, GDPR Art.32 encryption,
AML high-value (>€10,000), ≥2 guardians, DMS enabled. Outputs score `(passed/total)·100` and
`compliant | action_required | non_compliant`. API: `runComplianceChecks`, `buildReport`.

**12. Approvals Scanner** — `lib/approvals.ts`
ERC-20 allowance scan + revoke-tx builder across **5 chains** (1 Ethereum, 137 Polygon, 42161 Arbitrum,
10 Optimism, 8453 Base) with public RPC defaults and a known-spender label table (Uniswap V2/V3/Universal,
0x, 1inch, Metamask). Risk: unlimited (`≥ maxUint256/2`) high · `>10^(decimals+4)` medium · else low.
`buildRevokeTx` encodes `approve(spender, 0)` (unsigned). API: `scanApprovals`, `buildRevokeTx`,
`getSpenderLabel`, `getSupportedChains`.

---

## 8. DAIOCompanionCore — The Governance Orchestrator

`DAIOCompanionCore.ts` (repo root) is the headless orchestration brain that lets *external* wallets
plug into DAIO governance. Singleton export: `companionCore`.

- **Status machine:** `active | escalating | triggered`; tracks `lastCheckIn`.
- **Storage abstraction:** `IStorageBridge { save, get }` — platform-independent persistence.
- **Init/recovery:** `initialize(bridge)` loads `daio_emergency_config`; `recoverStorage(recoveryKey, newPassword)`
  delegates to a bridge's `recoverAndReKey` when available.
- **Emergency config** (`EmergencyConfig`): `targetAddress`, `verificationLevel: none|basic|biometric`
  (didit.me levels), `percentageToTransfer`, `executionDelayHours`, `notificationGuardians`,
  `autoTriggerInactivityDays?`. **Validation guards against weaponization** — rejects malformed target addresses.
- **Panic button** `triggerPanicButton(didToken?)`: requires DID verification when level ≠ none
  (mock didit.me: biometric token must contain `method=biometric` and be >20 chars); on success sets
  status `triggered`, returns `PanicTriggerResponse { action: EMERGENCY_PROTOCOL_ACTIVATED, … }`.
- **Governance score** `getGovernanceScore(inputs)` → `calculateContinuityScore` + recommendation
  (≥80 "optimal", ≥50 "gaps — check shards", else "critical").
- **Sentinel** `checkSentinelStatus(inactivityDays, threshold)`: healthy/warning/critical/triggered at 0.7×/1.0×/1.5×.
- **Transfer gate** `validateTransferRequest(amount, isEmergency)`: notary if `>50,000 ∨ emergency ∨ triggered`;
  guardian approval always; time-lock 72h (emergency/triggered) else 48h.
- **Shards** `generateShards(secret, shares, threshold)` (SSS integration point; "never store shards on the same device").

### Storage bridges (Unified)
- **`LocalStorageBridge`** — plain `localStorage` JSON wrapper (implements `IStorageBridge`).
- **`EncryptedStorageBridge`** — **PBKDF2 100k → SHA-256 → AES-256-GCM**, 12-byte IV per op,
  format `[IV‖ciphertext]` Base64. `generateRecoveryKey()` (URL-safe Base64, 32 bytes),
  `recoverAndReKey(recoveryKey, newPassword, keys)` re-encrypts under a new password.
- **`RecoveryWizard.tsx`** — 3-step UI: generate key → copy/download + offline-confirm checkbox → confirm.
  Warning: without password **and** recovery key, data is permanently lost.
- **`EmergencySettings.tsx`** — UI bound to `companionCore` (init with `LocalStorageBridge`, load/save config);
  defaults to `verificationLevel: biometric`, `executionDelayHours: 48`, `autoTriggerInactivityDays: 30`.

---

## 9. The Unified Governance Layer

### 9.1 Vault Protocol (`modules/vault-protocol/`)
Shamir threshold container system. Apps: Creator, Reconstructor, Verifier, Demo, Honeypot Manager,
Governance (Container/Beneficiaries/Fragments).
- **`shamir.ts`** — field prime `p = 2^256 − 189`, generator `2`; `generateShares`, `reconstructSecret`
  (Lagrange at 0), `generateFeldmanCommitments`, `verifyShare`.
- **`vault-crypto.ts`** — `encryptShard`/`decryptShard` (AES-GCM + PBKDF2), JSON/QR export-import,
  `hashVaultMetadata` + `verifyVaultMetadataIntegrity` (SHA-256).
- **Types:** `VaultConfig`, `Shard {index,value,vaultId,isCanary?}`, `EncryptedShard`,
  `FeldmanCommitments`, `VaultMetadata`, `HoneypotVault`, `ReconstructionAttempt`.
  Display modes: `canvas-timer | split-screen | qr-only`.

> ⚠️ **Note for maintainers:** the companion Shamir uses `p = 2^256−2^32−977` while the unified
> Vault Protocol uses `p = 2^256−189`. Shares from the two systems are **not interchangeable**.

### 9.2 Inheritance Container — 3-Level Documentation
- **L1 Foundation:** asset inventory (sourced from Digital Estate), access architecture, heir designation.
- **L2 Extended:** legacy context (intentions), per-platform instructions.
- **L3 Professional:** notary, lawyer, tax advisor, wealth manager contacts.
Level auto-computes from completeness; each level worth points in the governance score.
"AI Suggest" buttons call `POST /api/chat` (Workers AI) to draft field text.

### 9.3 Succession Sentinel (DMS) + Governance Store (`store/governance.ts`)
Zustand persist store, namespace `daio-governance`.
- **`DeadManSwitch`**: `intervalMonths 3|6|12`, status `inactive|active|warning_1/2/3|triggered`,
  `challengeQuestions[]`. `checkIn(answer?)` rotates challenge by `warningsSent % len`; wrong answer fails.
- **4-stage escalation:** warning_1 (primary) → warning_2 (guardians) → warning_3 (final) → triggered
  (fragments distributed, transfer gate activated).
- **Beneficiaries**: role `heir|guardian|notary`. **Key fragments**: status `distributed|pending|activated`;
  threshold `ceil(n/2)+1`. **Emergency protocol**: `triggerEmergency(reason)` regenerates fragments + advances gate.
- **Transfer gate**: 5 steps — Authorization → Verification → Preparation → Execution → Completion.
- **Audit trail**: capped at last 1000 entries; 30-day activity count surfaced.

### 9.4 DAIO Governance Score (0–100)
| Component | Points |
|---|---|
| Inheritance Container (created / L2 / L3 — 10 each) | 30 |
| Succession Sentinel (active 20 / warning_1 15 / _2 10 / _3 5) | 20 |
| Key Fragments | 20 |
| Beneficiaries (>0, >1, has notary — 5 each) | 15 |
| Emergency Protocol | 10 |
| Digital Estate Risk Assessment | 5 |

`getDaiScore()` / `getDaiScoreBreakdown()`. "Succession Ready" badge at 90+.

### 9.5 Calculator — ROI & Continuity (`modules/calculator/`)
- Expected Prevented Loss `N = V·(p_u − p_d)`.
- Future Value `V_t = V·(1+g)^t`; Future Prevented Loss `N_t = V_t·(p_u − p_d)`.
- ROI `= ((N − C)/C)·100%`.
- Continuity Score `= 20 + selfCustody·0.2 + defi·0.15 + business·0.15 + (15 − riskWithDAIO)·1.5 + horizon`,
  clamped [0,100]; recommendations at 80/60/40 thresholds.

### 9.6 Supporting Modules
Digital Estate (asset inventory + urgency alerts: domains <90 days, undocumented >€10k),
Legacy Proof Lab (SHA-256 hash chain, `hash = SHA256(prevHash + entryJSON)`, tamper detection),
Template Generator (9 phases / 21 templates, EN+DE, JSON export), Portfolio Dashboard
(Continuity Dashboard maturity: 80+ Audit-Ready / 60 Controlled / 40 Defined / <40 Ad-hoc),
Strategic Platform, Document Rewriter, BTC ticker.

---

## 10. The Succession Architecture (Cross-Cutting)

The features above compose into one pipeline — the **Sovereign Guard Architecture**:

```
            ┌─────────────────────── owner alive & active ───────────────────────┐
            │  check-in (proof of life, optional challenge Q) → status: active     │
            └─────────────────────────────────────────────────────────────────────┘
                                    │ inactivity grows
                                    ▼
   Succession Sentinel (DMS):  warning_1 → warning_2 → warning_3 → TRIGGERED
                                    │ (0.7× / 1.0× / 1.5× of thresholdDays)
                                    ▼
   Emergency Protocol:  regenerate key fragments · notify guardians/heirs/notary
                                    │
                                    ▼
   Transfer Gate:  Authorization → Verification → Preparation → Execution → Completion
        guards: notary if amount ≥ $50k ∨ emergency · guardian quorum · 48h/72h time-lock
                                    │
                                    ▼
   Shamir reconstruction by guardian/heir quorum (Feldman-verified shards)
        honeypots/canaries fire silent alerts on illegitimate attempts
                                    ▼
                         Heir gains access · audit trail sealed
```

Parallel paths:
- **Panic Button** — owner-initiated immediate escalation (DID-verified) into the same gate, with *longer* time-locks.
- **Social Recovery** — guardian-quorum key recovery with owner **veto window** (default 48h) to abort.
- **Notary Anchor** — keccak256-hashes legal documents (death certificate, court order) for on-chain proof-of-process.
- **Legacy Proof** — every governance action chained via SHA-256 for tamper-evident provenance.

### Originated concepts (trademarked terms — see `NOTICE.md`)
Sovereign Guard Architecture · Inheritance Container · Legacy Proof Protocol ·
Succession Sentinel System · Transfer Gate Protocol · Panic Button (Emergency Protocol) ·
Heritage Integrity Framework.

---

## 11. Threat Model & Mitigations

| Threat | Mitigation |
|---|---|
| Lost owner / death | Dead-Man's Switch → quorum reconstruction |
| Single-shard compromise | Shamir threshold; no single shard reveals the secret |
| Corrupted/forged shard | Feldman VSS verification before reconstruction |
| Brute-force unlock | Argon2id + exponential backoff + persisted sliding-window limiter |
| Plaintext key theft | Secrets memory-only; AES-GCM at rest; auto-lock; `partialize` |
| Screen scraping of secrets | Canvas-only Secure Display + watermark + auto-destruct |
| Malicious guardian collusion | Owner veto window; notary + time-lock gates |
| False/accidental trigger | Time-locks (48h/72h), veto periods, reversibility-first design |
| Unauthorized vault probing | Honeypot decoys + canary shards → silent alerts |
| Leaked secrets in logs/chat | Secret/PII Detector + redaction |
| Stale token approvals | Approvals Scanner + revoke-tx builder |
| MEV / front-running | MEV-protected RPC routing |
| Tooling weaponized vs owner | Target-address validation, DID gates, veto/time-lock everywhere |
| Tamper of governance history | SHA-256 hash chains (Legacy Proof) |
| Regulatory liability | Compliance engine (MiCA/BGH/GDPR/AML) + exportable evidence |

---

## 12. Known Limitations (Honest Boundaries)

The single root limitation: **the system is purely reactive — it only acts when the user opens the app.**
There is no autonomous server-side clock. Concrete consequences (from `BACKLOG.md`):

- **DMS timer is client-side only** — escalation never advances if nobody opens the app
  (needs Cloudflare Cron + D1 state sync).
- **Key fragments never leave the app** — no delivery channel to guardians/heirs yet.
- **Emergency protocol notifies nobody** — regenerates keys + logs, but no webhook/email/SMS.
- **Transfer Gate is display-only** — the 5-step timeline isn't yet wired to a real state machine.
- **DMS → Emergency → Transfer Gate not connected** — should be one succession-execution pipeline.
- **Compliance report not exportable to PDF** (text export exists in places).
- **No advisor live visibility / no failure tracking** (stale beneficiary, lost fragment) — needs server.

These are deliberately bounded by the **no-backend** invariant; closing them requires an
opt-in server tier (Cloudflare Worker + D1) without breaking the non-custody covenant.

---

## 13. Build, Test & Deploy

```bash
# Wallet Pro
npm install && npm run dev            # dev (start.bat → port 3013)
npm run build                         # tsc check + Vite build → dist/
npm run test                          # Vitest (Node 20+, real Web Crypto)
npm run lint

# Companion
cd companion && npm run dev           # http://localhost:5174
npm run build                         # static SPA → dist/ (HTTPS required for crypto.subtle)

# Unified
cd daio-unified && npm install && npm run dev
```

**Env (Wallet Pro):** `VITE_ALCHEMY_API_KEY`, `VITE_WALLETCONNECT_PROJECT_ID` (both optional, `VITE_`-prefixed).
**Deploy:** any static host (Vercel / Netlify / Cloudflare Pages / nginx with SPA fallback). HTTPS mandatory
(`crypto.subtle` needs a secure context). Companion routing is hash-based — no server config needed.

---

## 14. The Essence, Restated

This is not a wallet that competes on send/swap UX. Its essence is a **covenant with the future**:
that self-custodied digital wealth need not die with its owner, and that this continuity can be
achieved **without ever surrendering custody** — enforced by threshold cryptography, gated by human
quorums and legal process, monitored by deception and detection, and proven by tamper-evident audit.

Every constant (600k PBKDF2 iterations, 48h veto, $50k notary threshold, 1.5× DMS trigger, t-of-N shares)
is a deliberate point on the curve between **security** and **recoverability** — the two-sided sword the
whole system exists to balance.
