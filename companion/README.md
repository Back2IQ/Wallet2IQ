# DAIO Security Companion

A standalone, deployment-ready security layer extracted from the DAIO Wallet codebase.
12 production-grade modules for wallet operators, inheritance planners, and security engineers —
all self-contained, all client-side, zero telemetry.

> **Scope.** This is not a wallet. It's the security *around* a wallet: key handling, heir
> workflows, compliance, monitoring, and transfer guards. Bring your own wallet, keep your own
> keys, plug these modules in where you need them.

## Modules

### Keys & Access
- **Device Binding** — Non-extractable AES-256-GCM key bound to origin + device (IndexedDB CryptoKey).
- **Rate Limiter** — Sliding-window limiter persisted in localStorage so page reload is not a bypass.
- **Shamir Secret Sharing** — Pure BigInt GF(p) implementation with Feldman VSS verification.
- **Secure Display** — Canvas-only secret rendering (no DOM text), watermarked, with auto-destruct.

### Heirs & Recovery
- **Social Recovery** — Guardian-quorum recovery with an owner veto window.
- **Dead-Man's Switch** — Inactivity sentinel with saturating warning curve.
- **Notary Anchor** — keccak256 document hash + unsigned anchor transaction.

### Guards & Monitors
- **Honeypot Vault** — Decoy vault with canary shards; silent alerts on reconstruction attempts.
- **Secret / PII Detector** — Real-time scan for BIP39 seeds, private keys, JWTs, API tokens.
- **Transfer Gate** — Pre-tx policy engine: notary threshold, guardian quorum, time-lock.

### Operations
- **Compliance Dashboard** — Live evaluation against MiCA, BGH, GDPR, AML, inheritance rules per jurisdiction.
- **Approvals Scanner** — ERC-20 allowance scan + revoke-tx builder across 5 chains.

## Quickstart

```bash
npm install
npm run dev        # http://localhost:5174
npm run build      # production build → dist/
npm run preview    # serve the built app locally
```

## Deployment

The built `dist/` folder is a static SPA. Deploy to any static host:

| Host | Command |
| --- | --- |
| Vercel | `vercel --prod` (zero-config, detects Vite) |
| Netlify | drag-drop `dist/` into the UI, or `netlify deploy --prod --dir=dist` |
| Cloudflare Pages | `wrangler pages deploy dist` |
| nginx | point root to `dist/`, add `try_files $uri /index.html;` |

Set HTTPS — the `crypto.subtle` APIs require a secure context.

## Architecture

- **React 19** + **Vite 7** + **TypeScript 5.9** (strict mode, `@/*` path alias).
- **Tailwind CSS 3.4** with custom `vault-*` and `signal-*` palettes for the institutional dark look.
- **`@noble/hashes`**, **`@noble/secp256k1`**, **`@scure/bip32`** — audited pure-JS crypto.
- **`viem`** for EVM reads + unsigned transaction building (approvals, notary anchor).
- **Zero** network calls unless you explicitly trigger an on-chain scan.

No backend. No accounts. No tracking. Every module runs entirely in the browser tab.

## Routes

The app uses hash-based routing so it works on any static host without server config:

```
#/device       #/rate        #/shamir       #/display
#/social       #/dms         #/notary
#/honeypot     #/detector    #/gate
#/compliance   #/approvals
```

## Use cases

- **Wallet operators** — bundle as an in-app "security" tab.
- **Inheritance planners / notaries** — demonstrable digital-asset succession tooling.
- **Enterprise custody** — compliance evidence and transfer-gate policy.
- **Security teams** — support-chat secret redactor, approval hygiene audits.
- **Educational** — every module ships with an inline explainer and deterministic demo.

## License

MIT — fork, rebrand, self-host. See [LICENSE](./LICENSE).
