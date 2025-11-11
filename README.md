# 📅 Veranstaltungspicker

> Ein interaktives Veranstaltungsmanagement-System für Moodle Database Activity

![Version](https://img.shields.io/badge/version-2.0-blue.svg)
![Moodle](https://img.shields.io/badge/moodle-4.x-orange.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

---

## 📋 Inhaltsverzeichnis

- [Übersicht](#-übersicht)
- [Features](#-features)
- [Screenshots](#-screenshots)
- [Installation](#-installation)
- [Verwendung](#-verwendung)
- [Konfiguration](#-konfiguration)
- [Moodle-Anpassungen](#-moodle-anpassungen)
  - [Moodle-Standard-Filter ausblenden](#moodle-standard-filter-ausblenden)
  - [Schreibrechte für Teilnehmende entziehen](#schreibrechte-für-teilnehmende-entziehen)
- [Technische Details](#-technische-details)
- [Browser-Kompatibilität](#-browser-kompatibilität)
- [Troubleshooting](#-troubleshooting)
- [Entwicklung](#-entwicklung)
- [Changelog](#-changelog)
- [Credits](#-credits)

---

## Übersicht

Der **Veranstaltungspicker** ist eine Moodle Database Activity, das eine Oberfläche für die Verwaltung, Anzeige Auswahl von Veranstaltungen bietet.

### Entwickelt für:
- **Barcamps**
- **Seminare und Workshops**
- **Webinare und Online-Veranstaltungen**
- **Interne Schulungen**

---

## Features

### Benutzeroberfläche
- **Modernes, responsives Design** - Optimiert für Desktop, Tablet und Mobile
- **Farbcodierte Zielgruppen** - Visuelle Unterscheidung durch Badge und Border
- **Spalten-Layout** - Events gruppiert nach Tagen
- **Card-Design** - Übersichtliche Event-Karten mit Hover-Effekten

### ⭐ Favoriten-System
- **Favoriten markieren** - Events per Klick als Favorit speichern
- **Persistente Speicherung** - LocalStorage-basiert, browserübergreifend
- **Favoriten-Counter** - Anzeige der Anzahl gespeicherter Favoriten
- **Favoriten-Filter** - Nur Favoriten anzeigen
- **Bulk-Export** - Alle Favoriten als ICS-Datei exportieren

### 🔍 Filter-System
- **Filter nach Tag** - Automatisch generierte Datumsauswahl
- **Filter nach Zielgruppe** - Einsteiger, Fortgeschrittene, Hauptamtliche, etc.
- **Filter nach Startzeit** - Schnellfilter für Uhrzeiten
- **Nur Favoriten** - Checkbox-Filter
- **Live-Update** - Sofortige Aktualisierung ohne Reload

### ICS-Kalender-Export
- **Einzelexport** - Jedes Event als .ics Datei
- **Massenexport** - Alle Favoriten in einer Datei
- **Zeitzone** - Korrekte Europe/Berlin Timezone
- **Erinnerungen** - Automatische Erinnerung 15 Min. vor Beginn
- **Kompatibilität** - Outlook, Google Calendar, Apple Calendar

### Responsive Design
- **Mobile-First** - Optimiert für Smartphones
- **Tablet-optimiert** - Angepasstes Layout für Tablets
- **Desktop** - Volle Features auf großen Bildschirmen

### 🎨 Zielgruppen-System
| Zielgruppe | Badge-Farbe | Border-Farbe |
|------------|-------------|--------------|
| Interessierte | Grau | Grau |
| Einsteiger | Grün | Grün |
| Fortgeschrittene | Türkis | Türkis |
| Hauptamtliche | Gelb | Gelb |

### ⚙️ Automatische Funktionen
- **Auto-Load** - Zeigt automatisch alle Einträge (9999+)
- **Leere Felder ausblenden** - Versteckt nicht ausgefüllte Felder
- **Referent*innen-Formatierung** - Intelligente Anzeige von 1-3 Referent*innen
- **Datum-Formatierung** - Deutsche Datumsanzeige mit Wochentag

---

## Screenshots

### Desktop-Ansicht (Listenansicht)
```
┌─────────────────────────────────────────────────────────────┐
│ Veranstaltungen          [Favoriten als ICS exportieren] 🌟 │
├─────────────────────────────────────────────────────────────┤
│ Filter: [Tag ▼] [Zielgruppe ▼] [Startzeit ▼] [☑ Favoriten] │
├───────────────┬───────────────┬───────────────┬─────────────┤
│ Montag 11.11. │ Dienstag 12.  │ Mittwoch 13.  │ Donnerstag  │
│ ┌───────────┐ │ ┌───────────┐ │ ┌───────────┐ │ ┌─────────┐ │
│ │ Event 1   │ │ │ Event 4   │ │ │ Event 6   │ │ │ Event 8 │ │
│ │ 09:00 Uhr │ │ │ 11:00 Uhr │ │ │ 14:00 Uhr │ │ │ ...     │ │
│ │ ☆ 🗓️      │ │ │ ★ 🗓️      │ │ │ ☆ 🗓️      │ │ │         │ │
│ └───────────┘ │ └───────────┘ │ └───────────┘ │ └─────────┘ │
│ ┌───────────┐ │ ┌───────────┐ │               │             │
│ │ Event 2   │ │ │ Event 5   │ │               │             │
│ └───────────┘ │ └───────────┘ │               │             │
└───────────────┴───────────────┴───────────────┴─────────────┘
```

### Mobile-Ansicht
```
┌─────────────────────┐
│ Veranstaltungen     │
│ [Export 🌟] 2 Fav.  │
├─────────────────────┤
│ Filter              │
│ [Tag ▼]             │
│ [Zielgruppe ▼]      │
│ [Startzeit ▼]       │
│ [☑ Favoriten]       │
├─────────────────────┤
│ Montag 11.11.       │
│ ┌─────────────────┐ │
│ │ Event 1         │ │
│ │ 09:00-10:30 Uhr │ │
│ │ ☆ 🗓️            │ │
│ │ Einsteiger      │ │
│ └─────────────────┘ │
│ ┌─────────────────┐ │
│ │ Event 2         │ │
│ └─────────────────┘ │
└─────────────────────┘
```

---

## Installation

### Voraussetzungen
- Moodle 4.x oder höher
- Moodle Database Activity Plugin
- Moderner Browser (Chrome, Firefox, Safari, Edge)

### Schritt 1: Moodle Database Activity erstellen

1. In Moodle: **Aktivität oder Material anlegen** → **Datenbank**
2. Name vergeben (z.B. "Veranstaltungspicker")
3. Speichern

### Schritt 2: Datenbankvorlage importieren

1. zip Datei aus dem gibthub generieren (ohne Readme und Licence) und unter Datenbankvorlage hochladen

**Template-Dateien:**
- `listtemplateheader.html` → **Listenvorlagen-Kopfzeile**
- `listtemplate.html` → **Listenvorlage**
- `listtemplatefooter.html` → **Listenvorlagen-Fußzeile**
- `singletemplate.html` → **Einzelvorlage**
- `addtemplate.html` → **Hinzufügen-Vorlage**
- `csstemplate.css` → **CSS**
- `jstemplate.js` → **JavaScript**
- `preset.xml` → **Datenbankfelder**

### Schritt 3: Veranstaltungen anlegen

Folgende Felder (Datenbank → Felder) stehen zur Verfügung:

| Feldname | Typ | Beschreibung |
|----------|-----|--------------|
| Titel | Text | Titel der Veranstaltung (Pflicht) |
| Untertitel | Text | Zusätzliche Beschreibung |
| Inhalt | Textbereich | Detaillierte Beschreibung |
| Datum | Datum | Veranstaltungsdatum (Format: YYYY-MM-DD) |
| Startuhrzeit | Text | Startzeit (Format: HH:MM) |
| Enduhrzeit | Text | Endzeit (Format: HH:MM) |
| Zielgruppe | Menü | Dropdown mit: Interessierte, Einsteiger, Fortgeschrittene, Hauptamtliche |
| Veranstaltungstyp | Menü | Dropdown mit: Webinar, Workshop, Vortrag, Schulung |
| Seminarnummer | Text | Interne Nummer |
| Referent*in 1 | Text | Name der/des ersten Referent*in |
| Info Referent*in 1 | Text | Funktion/Info |
| Kontakt Referent*in 1 | Text | E-Mail oder Tel. |
| Referent*in 2 | Text | Optional |
| Info Referent*in 2 | Text | Optional |
| Kontakt Referent*in 2 | Text | Optional |
| Referent*in 3 | Text | Optional |
| Info Referent*in 3 | Text | Optional |
| Kontakt Referent*in 3 | Text | Optional |
| Link zur Anmeldung | URL | Anmeldelink |
| Bemerkung | Textbereich | Interne Notizen |

### Schritt 4: Einstellungen anpassen

**Datenbank → Einstellungen:**
- **Einträge pro Seite:** 100 (wird automatisch auf 9999 gesetzt)
- **Maximale Anzahl an Einträgen:** 0 (unbegrenzt)
- **Kommentare:** Deaktiviert (optional)
- **Bewertungen:** Deaktiviert (optional)

---

## Verwendung

### Für Endbenutzer

#### Veranstaltungen anzeigen
1. Datenbank öffnen
2. Events werden automatisch nach Tagen gruppiert angezeigt
3. Scrolle oder nutze Filter

#### Favoriten setzen
1. Klicke auf das **Stern-Symbol** (☆) bei einem Event
2. Stern wird gefüllt (★) = Favorit gespeichert
3. Erneutes Klicken entfernt Favorit

#### Filter verwenden
1. Wähle Filter aus Dropdown-Menüs:
   - **Tag:** Zeige nur Events an einem bestimmten Datum
   - **Zielgruppe:** Filtere nach Zielgruppe
   - **Startzeit:** Filtere nach Beginnzeit
   - **Nur Favoriten:** Zeige nur gespeicherte Favoriten
2. Filter werden sofort angewendet (kein Button nötig)

#### ICS-Export
**Einzelnes Event:**
1. Klicke auf **🗓️-Symbol** beim Event
2. .ics-Datei wird heruntergeladen
3. In Kalender-App öffnen

**Alle Favoriten:**
1. Klicke auf **"Favoriten als ICS exportieren"** (oben rechts)
2. Alle Favoriten werden in einer Datei exportiert
3. In Kalender-App importieren

#### Einzelansicht
1. Klicke auf Event-Titel
2. Zeigt vollständige Details:
   - Komplette Beschreibung
   - Alle Referent*innen mit Kontaktdaten
   - Seminarnummer
   - Veranstaltungstyp
   - Bemerkungen

### Für Administratoren

#### Neue Veranstaltung hinzufügen
1. **Datenbank → Eintrag hinzufügen**
2. Formular ausfüllen:
   - **Pflichtfelder:** Titel, Datum, Startuhrzeit, Enduhrzeit
   - **Optional:** Alle anderen Felder
3. Speichern

#### Veranstaltung bearbeiten
1. In der Einzelansicht: **✏️ Bearbeiten** klicken
2. Felder anpassen
3. Speichern

#### Veranstaltung löschen
1. Veranstaltung öffnen
2. **Löschen** klicken
3. Bestätigen

---

## ⚙️ Konfiguration

### CSS-Anpassungen

Das System verwendet **CSS Custom Properties** für einfache Anpassungen.

```css
/* In csstemplate.css */
:root {
  /* Hauptfarbe ändern */
  --color-primary: #0066cc;        /* Deine Farbe */
  --color-primary-dark: #0052a3;   /* Dunklere Variante */
  
  /* Abstände anpassen */
  --spacing-lg: 20px;              /* Große Abstände */
  --spacing-md: 15px;              /* Mittlere Abstände */
  
  /* Zielgruppen-Farben */
  --color-audience-beginner: #28a745;    /* Einsteiger */
  --color-audience-advanced: #17a2b8;    /* Fortgeschrittene */
  --color-audience-staff: #ffc107;       /* Hauptamtliche */
}
```

### JavaScript-Konfiguration

```javascript
/* In jstemplate.js */
const CONFIG = {
  storageKey: 'veranstaltungspicker_favorites',  // LocalStorage Key
  maxRetries: 10,                                 // Filter-Init Versuche
  retryDelay: 300,                                // Verzögerung in ms
  initDelay: 300                                  // Init-Verzögerung
};
```

### Zielgruppen anpassen

**Im Moodle Database Field "Zielgruppe" (Menü):**
```
Interessierte
Einsteiger
Fortgeschrittene
Hauptamtliche
```

**In `listtemplateheader.html` Filter anpassen:**
```html
<select id="filter-zielgruppe" name="zielgruppe" class="filter-select">
  <option value="">Alle</option>
  <option value="Interessierte">Interessierte</option>
  <option value="Einsteiger">Einsteiger</option>
  <option value="Fortgeschrittene">Fortgeschrittene</option>
  <option value="Hauptamtliche">Hauptamtliche</option>
  <!-- Neue Optionen hier hinzufügen -->
</select>
```

**Farben in `csstemplate.css` anpassen:**
```css
:root {
  --color-audience-beginner: #28a745;   /* Grün */
  --color-audience-advanced: #17a2b8;   /* Türkis */
  --color-audience-staff: #ffc107;      /* Gelb */
  /* Neue Farbe hinzufügen */
  --color-audience-custom: #e83e8c;     /* Pink */
}
```

---

## 🎛️ Moodle-Anpassungen

### Moodle-Standard-Filter ausblenden

Um die eingebauten Moodle-Filter und -Steuerelemente auszublenden und nur die benutzerdefinierten Filter anzuzeigen, fügen Sie folgenden CSS-Code im Moodle-Theme unter **Darstellung → Zusätzliches HTML → Im `<head>`-Bereich** ein:

```css
/*
 * Moodle-Standard-Filterelemente ausblenden
 * WICHTIG: cmid-178159 durch Deine eigene Datenbank-CMID ersetzen!
 * Die CMID findest Du in der URL: /mod/data/view.php?id=178159
 */

/* Suchformular der Datenbank (Standard-Suchfeld) */
body.path-mod-data.cmid-178159 .searchform,

/* Datenbankeinstellungen-Widget */
body.path-mod-data.cmid-178159 .datapreferences,

/* "Einträge pro Seite"-Dropdown */
body.path-mod-data.cmid-178159 .entriesperpage,

/* Standard-Paginierung (Seitennummern 1, 2, 3...) */
body.path-mod-data.cmid-178159 .paging,

/* Alternative Paginierung (falls Theme unterschiedlich) */
/* body.path-mod-data.cmid-178159 .pagination, */

/* Moodle 4.x View-Controls Container */
body.path-mod-data.cmid-178159 [data-region="viewcontrols"],

/* Moodle 4.x Suchbereich */
body.path-mod-data.cmid-178159 [data-region="search"],

/* Moodle 4.x Paging-Bereich */
body.path-mod-data.cmid-178159 [data-region="paging"],

/* Moodle 4.x Sortier-Bereich */
body.path-mod-data.cmid-178159 [data-region="sort"],

/* "Erweiterte Suche"-Button */
body.path-mod-data.cmid-178159 [data-action="advanced-search"],

/* Erweiterte Suche Container */
body.path-mod-data.cmid-178159 .advancedsearch,
body.path-mod-data.cmid-178159 form#advancedsearch,

/* Inline-Filter-Formular */
body.path-mod-data.cmid-178159 .form-inline.datafilters,

/* Alternative Data-Filter-Container */
body.path-mod-data.cmid-178159 .data-filters,

/* Bootstrap Margin-Klassen (oft für Spacing genutzt) */
body.path-mod-data.cmid-178159 .mb-3,
body.path-mod-data.cmid-178159 .mt-3 {
  display: none !important;
}
```

#### So findest Du Deine CMID:

1. Öffnen Sie Ihre Datenbank-Aktivität in Moodle
2. Schauen Sie in die Browser-URL
3. Suchen Sie nach `id=XXXXXX` (z.B. `id=178159`)
4. Ersetzen Sie in obigem CSS alle `cmid-178159` durch Ihre eigene ID (z.B. `cmid-123456`)

#### CSS-Selektoren Erklärung:

| CSS-Selektor | Was wird ausgeblendet |
|--------------|----------------------|
| `.searchform` | Standard-Suchformular von Moodle |
| `.datapreferences` | Einstellungs-Widget für Darstellung |
| `.entriesperpage` | Dropdown "Einträge pro Seite" |
| `.paging` | Seitennummern-Navigation (1, 2, 3...) |
| `[data-region="viewcontrols"]` | Gesamter View-Controls-Container (Moodle 4.x) |
| `[data-region="search"]` | Such-Bereich (Moodle 4.x) |
| `[data-region="paging"]` | Paging-Bereich (Moodle 4.x) |
| `[data-region="sort"]` | Sortier-Bereich (Moodle 4.x) |
| `[data-action="advanced-search"]` | "Erweiterte Suche"-Button |
| `.advancedsearch` | Erweiterte Suche Formular |
| `.form-inline.datafilters` | Inline-Filter (falls vorhanden) |
| `.data-filters` | Alternative Filter-Container |
| `.mb-3`, `.mt-3` | Bootstrap Margins (oft für Spacing) |

### Schreibrechte für Teilnehmende entziehen

Um Teilnehmenden das Erstellen und Bearbeiten von Einträgen zu verbieten (nur Lese-Zugriff):

#### Methode 1: Über Rollenberechtigungen (empfohlen)

1. **Datenbank öffnen**
   - Navigieren Sie zu Ihrer Datenbank-Aktivität

2. **Berechtigungen aufrufen**
   - Klicken Sie auf das **Zahnrad-Symbol** (⚙️) oben rechts
   - Wählen Sie **Mehr...** (falls nötig)
   - Klicken Sie auf **Berechtigungen** oder **Rollen lokal zuweisen**

3. **Rolle bearbeiten**
   - Klicken Sie auf **Berechtigungen überschreiben** (oder **Override permissions**)
   - Wählen Sie die Rolle **Student/Teilnehmer** (oder **Authenticated user**)

4. **Fähigkeiten deaktivieren**
   
   Suchen Sie nach folgenden Capabilities und setzen Sie diese auf **Verhindern** (❌):
   
   | Capability | Beschreibung |
   |-----------|--------------|
   | `mod/data:writeentry` | Einträge erstellen |
   | `mod/data:manageentries` | Einträge verwalten (eigene bearbeiten) |
   | `mod/data:managetemplate` | Templates bearbeiten |
   | `mod/data:approve` | Einträge genehmigen |
   
   Behalten Sie diese Berechtigung als **Erlauben** (✅):
   
   | Capability | Beschreibung |
   |-----------|--------------|
   | `mod/data:viewentry` | Einträge ansehen |

5. **Speichern**
   - Klicken Sie auf **Änderungen speichern**


#### Tipp: Mehrere Datenbanken verwalten

Wenn Sie mehrere Veranstaltungspicker-Datenbanken haben, können Sie das CSS kombinieren:

```css
/* Für mehrere Datenbanken gleichzeitig */
body.path-mod-data.cmid-178159,
body.path-mod-data.cmid-123456,
body.path-mod-data.cmid-789012 {
  .searchform,
  .datapreferences,
  .entriesperpage,
  [data-region="viewcontrols"] {
    display: none !important;
  }
}
```

---

## Technische Details

### Architektur

```
Veranstaltungspicker
├── Frontend (Browser)
│   ├── HTML Templates (Moodle Database)
│   ├── CSS (Styling + Variables)
│   └── JavaScript (Logik + Interaktion)
├── Storage
│   └── LocalStorage (Favoriten)
└── Backend (Moodle)
    └── Database Activity (Daten)
```

### JavaScript-Module

| Modul | Verantwortung |
|-------|--------------|
| `FavoritesManager` | Favoriten speichern/laden/toggle |
| `DateFormatter` | Datum/Zeit-Formatierung |
| `ICSGenerator` | Kalender-Dateien erstellen |
| `EventFormatter` | Event-Cards formatieren |
| `EventManager` | Event-Logik + DOM-Manipulation |
| `FilterManager` | Filter-Funktionalität |
| `PaginationManager` | Auto-Load aller Einträge |

### Utility-Funktionen

```javascript
// HTML-Tags entfernen
stripHTML(html) → string

// Entry-ID extrahieren (mit Fallbacks)
extractEntryId(element) → string|null

// Entry-ID validieren
isValidEntryId(id) → boolean
```

### Event-Flow

```
1. Seite lädt
   ↓
2. PaginationManager setzt perpage=9999
   ↓
3. EventManager sammelt Events aus DOM
   ↓
4. Events werden nach Tag gruppiert
   ↓
5. Spalten-Layout wird gerendert
   ↓
6. EventFormatter formatiert alle Cards
   ↓
7. FilterManager initialisiert Filter
   ↓
8. FavoritesManager lädt gespeicherte Favoriten
   ↓
9. UI wird aktualisiert
```

### Datenfluss

```
Moodle Database Fields
         ↓
    HTML Template
         ↓
   DOM (data-attributes)
         ↓
  JavaScript (EventManager)
         ↓
   Event Objects Array
         ↓
  Grouped by Day Object
         ↓
   Rendered Columns
         ↓
     User Interface
```
