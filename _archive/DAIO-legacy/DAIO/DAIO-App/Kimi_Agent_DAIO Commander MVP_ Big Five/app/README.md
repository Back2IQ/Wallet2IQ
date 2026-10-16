# DAIO Commander MVP

**Digitale Asset-Inheritance Orchestration** – Die erste vollständige Lösung für digitale Erbfolge-Planung in Deutschland.

## Schnellstart

### Windows
Doppelklicken Sie auf `DAIO-Commander.bat`

### macOS / Linux
```bash
./DAIO-Commander.sh
```

### Alternativ (alle Plattformen)
```bash
npm install
npm run build
npm run electron:dev
```

---

## Features

### Big Five Asset-Klassen
1. **Bitcoin (BTC)** – Vollständige Wallet-Erfassung
2. **Ethereum (ETH)** – Inkl. Smart Contract-Check
3. **Stablecoins (USDC/USDT/DAI)** – Nach Plattform kategorisiert
4. **NFTs** – Manuelle Validierung mit Utility-Nachweis
5. **Gaming-Assets** – AGB-konforme Liquidationsstruktur

### Global Loss Estimator
- Echtzeit-Berechnung basierend auf 50 Demo-Fällen
- Hochrechnung für Deutschland: €47Mrd jährliche Verluste
- Potenziell gerettet: €33Mrd durch DAIO
- Interaktive Visualisierungen mit Recharts

### White-Label Support
- Toggle zwischen Back2IQ und F&P Kapitalstrukturen Branding
- Dynamische Farbschemata (#1e3a5f Blau, #d4af37 Gold)
- Template-Generator für druckfertige Dokumente

---

## Systemvoraussetzungen

- **Node.js** 18+ (https://nodejs.org)
- **npm** 9+ (wird mit Node.js installiert)
- **Betriebssystem:** Windows 10+, macOS 12+, oder Linux

---

## Installation

### 1. Node.js installieren
Falls noch nicht installiert, laden Sie Node.js von https://nodejs.org herunter.

### 2. DAIO Commander entpacken
Entpacken Sie das DAIO-Commander.zip in einen Ordner Ihrer Wahl.

### 3. Anwendung starten

#### Windows:
Doppelklicken Sie auf `DAIO-Commander.bat`

#### macOS:
```bash
cd /pfad/zu/daio-commander
./DAIO-Commander.sh
```

#### Linux:
```bash
cd /pfad/zu/daio-commander
./DAIO-Commander.sh
```

Beim ersten Start werden automatisch alle Abhängigkeiten installiert.

---

## Entwickler-Installation

```bash
# Repository klonen oder entpacken
cd daio-commander

# Dependencies installieren
npm install

# Development Server starten
npm run dev

# Electron Development
npm run electron:dev

# Production Build
npm run build
```

---

## Projektstruktur

```
daio-commander/
├── DAIO-Commander.bat      # Windows Starter
├── DAIO-Commander.sh       # macOS/Linux Starter
├── start-electron.js       # Node.js Starter
├── electron/               # Electron Hauptprozess
│   ├── main.js            # Hauptprozess-Entry
│   └── preload.js         # IPC-Bridge
├── src/
│   ├── components/        # React Komponenten
│   ├── pages/             # Seiten-Komponenten (7 Seiten)
│   ├── data/              # Demo-Daten (50 Fälle)
│   ├── hooks/             # Custom Hooks
│   ├── types/             # TypeScript Typen
│   ├── config/            # Branding-Konfiguration
│   ├── App.tsx            # Haupt-App
│   └── main.tsx           # React Entry
├── dist/                  # Build-Output
├── package.json
├── vite.config.ts
└── README.md
```

---

## 7-Seiten-Struktur

1. **Landing** – "Die unvollständige Bilanz"
2. **Asset Discovery** – Big Five erfassen
3. **Hidden Asset Scanner** – Radar-Animation zur Enthüllung
4. **Global Loss Estimator** – Live-Hochrechnung
5. **Template Generator** – White-Label Dokumente
6. **Data Value** – Strategischer Vorteil
7. **Partnership** – F&P Kooperation

---

## Demo-Daten

50 vorbevölkerte Fälle:
- 70% nur Krypto (BTC/ETH/Stable)
- 20% +NFTs (Ø €150K)
- 10% +Gaming (Ø €85K)
- Durchschnittliches Vermögen: €890K

---

## Tastenkürzel

- `?` – Hilfe anzeigen
- `→` – Nächste Seite
- `←` – Vorherige Seite

---

## Branding

### Back2IQ (Default)
- Primary: #0f172a (Slate 900)
- Secondary: #06b6d4 (Cyan 500)
- Accent: #22d3ee (Cyan 400)

### F&P Kapitalstrukturen
- Primary: #1e3a5f (F&P Blau)
- Secondary: #d4af37 (F&P Gold)
- Accent: #c9a227 (Gold dunkler)

---

## Technischer Stack

- **Frontend:** React 19 + TypeScript
- **Styling:** Tailwind CSS 3.4 + shadcn/ui
- **Animationen:** Framer Motion
- **Charts:** Recharts
- **Desktop:** Electron 40
- **State:** Zustand (React Hooks)
- **Speicher:** LocalStorage (Session-Persistenz)

---

## Fehlerbehebung

### "node_modules nicht gefunden"
Führen Sie `npm install` manuell aus.

### "Build fehlgeschlagen"
Löschen Sie den `dist`-Ordner und starten Sie erneut.

### Electron startet nicht
Stellen Sie sicher, dass Node.js korrekt installiert ist:
```bash
node --version
npm --version
```

---

## Lizenz

Proprietär – Back2IQ GmbH

---

## Kontakt

**Back2IQ** – ahead by design  
partner@back2iq.de

**F&P Kapitalstrukturen**  
info@fp-kapital.de

---

*Entwickelt für das Strategische Partnerschafts-Meeting am 18.02.2026*

**Version:** 1.0.0 MVP  
**Release:** Februar 2026
