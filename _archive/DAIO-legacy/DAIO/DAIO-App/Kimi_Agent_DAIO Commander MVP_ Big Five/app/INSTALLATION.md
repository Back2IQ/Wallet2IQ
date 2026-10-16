# DAIO Commander Installation

## Systemvoraussetzungen

- **Node.js** Version 18 oder höher (https://nodejs.org)
- **Windows 10/11**, macOS 12+ oder Linux

## Schnellstart

### Methode 1: One-Click Start (Empfohlen)
Doppelklicken Sie auf `start-app.bat`

Dieses Skript:
1. Überprüft Ihre Node.js-Installation
2. Installiert automatisch alle Abhängigkeiten
3. Startet die Anwendung auf http://localhost:3010

### Methode 2: Manuelle Installation

```bash
# 1. Abhängigkeiten installieren
npm install

# 2. Entwicklungsserver starten
npm run dev
```

## Problemlösung

### Fehler: "node_modules nicht gefunden"
```bash
npm install
```

### Fehler: "vite nicht gefunden"
```bash
npm install vite @vitejs/plugin-react -D
```

### Fehler bei der Installation
1. Löschen Sie den `node_modules`-Ordner
2. Löschen Sie die `package-lock.json`-Datei
3. Führen Sie `npm cache clean --force` aus
4. Starten Sie die Installation erneut

## Anwendung starten

Nach erfolgreicher Installation:
- Die Anwendung ist unter http://localhost:3010 erreichbar
- Das Branding zeigt "Back2IQ - Ahead by Design"
- Alle Demo-Daten sind vorbelegt

## Branding

Die Anwendung verwendet standardmäßig das Back2IQ-Branding:
- **Name**: Back2IQ
- **Tagline**: Ahead by Design
- **Farbschema**: Dunkelblau/Cyan

## Daten

Die Anwendung enthält 50 Demo-Fälle mit:
- 35 Fälle: Nur Krypto-Assets (70%)
- 10 Fälle: Krypto + NFTs (20%)
- 5 Fälle: Krypto + Gaming-Assets (10%)
- Durchschnittliches Vermögen: €890.000

## Support

Bei Problemen:
1. Überprüfen Sie die Node.js-Version (`node --version`)
2. Stellen Sie sicher, dass Port 3010 nicht belegt ist
3. Löschen Sie `node_modules` und installieren Sie neu