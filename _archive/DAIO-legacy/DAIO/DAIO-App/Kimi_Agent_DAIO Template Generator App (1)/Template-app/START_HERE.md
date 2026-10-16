# 🚀 Back2IQ - Ahead by Design
## DAIO Value Explorer - Schnellstart-Anleitung

### 📋 Voraussetzungen

Bevor Sie die App starten, stellen Sie sicher, dass folgende Software installiert ist:

- **Node.js** (Version 18 oder höher)
  - Download: https://nodejs.org/
  - Beinhaltet automatisch npm (Node Package Manager)

### 🎯 Schnellstart

#### Option 1: PowerShell Script (Empfohlen)
Doppelklicken Sie einfach auf:
```
start-app.ps1
```

#### Option 2: Windows Batch Datei
Alternativ können Sie auch verwenden:
```
start-app.bat
```

### 🔄 Was passiert beim Start?

1. **Systemprüfung**: Das Script prüft ob Node.js und npm installiert sind
2. **Abhängigkeiten**: Falls noch nicht vorhanden, werden alle benötigten Pakete installiert
3. **Start**: Die Entwicklungsumgebung wird automatisch gestartet
4. **Öffnung**: Ihr Browser öffnet automatisch die App unter http://localhost:5173

### 🛠 Manuelles Starten (falls benötigt)

Falls die automatischen Scripts nicht funktionieren:

```bash
# 1. Abhängigkeiten installieren
npm install

# 2. Entwicklungsserver starten
npm run dev
```

### 📊 App-Funktionen

Die **DAIO Value Explorer** App ermöglicht:

- **Portfolio-Wert-Berechnung** in EUR, USD, CHF oder GBP
- **Asset-Allokation** für verschiedene Kategorien:
  - Self-Custody Krypto
  - Tokenisierte RWA
  - DeFi Positionen
  - NFTs
  - Geschäftskonten
  - Andere Assets

- **Risikoanalyse** mit und ohne DAIO
- **Zeithorizont** und **Wachstumsrate** Einstellungen
- **Kosteneinschätzung** für DAIO-Implementierung
- **Visuelle Diagramme** und **Echtzeit-Berechnungen**

### ⚠️ Fehlerbehebung

**Problem: "Node.js ist nicht installiert"**
- Lösung: Laden Sie Node.js von https://nodejs.org/ herunter und installieren Sie es

**Problem: "Installation fehlgeschlagen"**
- Lösung: 
  1. Öffnen Sie PowerShell/Befehlszeile als Administrator
  2. Führen Sie `npm install` manuell aus
  3. Bei anhaltenden Problemen: Löschen Sie den `node_modules` Ordner und versuchen Sie es erneut

**Problem: "Port 5173 wird bereits verwendet"**
- Lösung: Schließen Sie andere laufende Entwicklungsserver oder ändern Sie den Port in `vite.config.ts`

### 📞 Support

Bei weiteren Fragen oder Problemen:
- Prüfen Sie die Konsole-Ausgabe für detaillierte Fehlermeldungen
- Stellen Sie sicher, dass alle Voraussetzungen erfüllt sind
- Löschen Sie bei Installationsproblemen den `node_modules` Ordner und starten Sie neu

---

**Back2IQ - Ahead by Design**  
*Innovative Digital Asset Governance Solutions*