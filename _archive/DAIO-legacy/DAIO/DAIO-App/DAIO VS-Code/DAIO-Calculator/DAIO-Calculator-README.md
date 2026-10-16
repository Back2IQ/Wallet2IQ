# DAIO Value Explorer Calculator

Der DAIO Value Explorer Calculator hilft Ihnen dabei, den potenziellen Wert und Nutzen einer DAIO-Implementierung für Ihre digitale Vermögensverwaltung zu bewerten.

## Schnellstart

### One-Click Start (Empfohlen)

Doppelklicken Sie einfach auf eine der folgenden Dateien:

**Für Windows-Benutzer (CMD):**
- `start-daio-calculator.bat` - Startet die Anwendung mit CMD-Befehlen

**Für PowerShell-Benutzer:**
- `start-daio-calculator.ps1` - Startet die Anwendung mit PowerShell

### One-Click Stop (Server beenden)

Wenn Sie alle Entwicklungsserver auf einmal beenden möchten:

**Für Windows-Benutzer (CMD):**
- `kill-all-dev-servers.bat` - Beendet alle Node.js und Entwicklungsserver

**Für PowerShell-Benutzer:**
- `kill-all-dev-servers.ps1` - Beendet alle Entwicklungsserver und prüft freie Ports

Beide Dateien:
- Beenden alle Node.js-Prozesse
- Schließen Prozesse auf typischen Entwicklungsports (3000, 3001, 3002, 5173, 8080, 8000)
- Prüfen, ob die Ports danach frei sind

### Manueller Start

Alternativ können Sie auch den klassischen Ansatz verwenden:

```bash
npm install
npm run dev
```

Dann im Browser öffnen: http://localhost:3001

## Funktionsweise

Der Rechner verwendet verschiedene Parameter, um die potenziellen Risikominderungen und Renditen durch eine DAIO-Implementierung zu berechnen:

- **Gesamtwert**: Ihr Gesamtvermögenswert
- **Allokation**: Verteilung Ihres Vermögens auf verschiedene Kategorien
- **Risiko ohne DAIO**: Bewertetes Risiko Ihrer aktuellen Struktur
- **Risiko mit DAIO**: Geschätztes reduziertes Risiko mit DAIO
- **Laufzeit**: Zeitraum für die Projektion
- **Wachstumsrate**: Jährliche Wachstumsrate Ihres Vermögens
- **DAIO-Kosten**: Einmalige Kosten für die DAIO-Implementierung

## Wichtige Hinweise zur Dateneingabe

- Alle Werte müssen positiv sein
- Die Allokationswerte müssen insgesamt 100% ergeben
- Das Risiko mit DAIO sollte immer niedriger sein als das Risiko ohne DAIO
- Die Laufzeit muss größer als 0 Jahre sein
- Die Risikowerte müssen zwischen 0 und 100 liegen
- Alle Allokationswerte müssen zwischen 0 und 100 liegen

## Standardwerte

Der Rechner startet mit folgenden Standardwerten:
- Gesamtwert: 1.000.000 €
- Selbstverwahrte Kryptowährungen: 30%
- Tokenisierte Real-World Assets: 25%
- DeFi-Positionen: 20%
- NFTs: 10%
- Geschäftsaccounts: 10%
- Andere Assets: 5%
- Risiko ohne DAIO: 12%
- Risiko mit DAIO: 4%
- Laufzeit: 10 Jahre
- Wachstumsrate: 7%
- DAIO-Kosten: 15.000 €

## Fehlerbehandlung

Wenn ungültige Eingaben gemacht werden, zeigt der Rechner eine entsprechende Fehlermeldung an und verhindert Berechnungen, die zu ungenauen oder irreführenden Ergebnissen führen würden.

## Haftungsausschluss

Diese Berechnungen sind Schätzungen basierend auf konservativen Annahmen. Die tatsächlichen Ergebnisse können variieren. Dieses Tool dient Bildungszwecken und stellt keine Finanzberatung dar.