# LCARS Journal & Todo - Nuxt 3

Ein persönlicher Arbeitsbereich im LCARS-Stil mit Nuxt 3, Vue 3 und Nitro Backend.

## 📁 Projekt-Struktur (Nuxt 3 + Nitro)

```
node_vue/
├── app.vue                 # Root-App-Komponente (Layout-System)
├── nuxt.config.ts          # Nuxt-Konfiguration
├── tailwind.config.js      # TailwindCSS mit LCARS-Farben
├── package.json            # Dependencies & Scripts
│
├── assets/
│   └── css/
│       └── main.css        # LCARS-Styling, Animationen
│
├── components/
│   ├── Journal.vue         # Journal-Komponente
│   ├── Todo.vue            # Todo-Komponente
│   ├── LcarsButton.vue     # Wiederverwendbare Buttons
│   ├── LcarsPanel.vue      # Panel-Container
│   ├── LcarsModal.vue      # Modal-Dialoge
│   └── LcarsTabs.vue       # Tab-Navigation
│
├── composables/
│   ├── useJournalAPI.ts    # Journal API Composable
│   └── useTodoAPI.ts       # Todo API Composable
│
├── layouts/
│   └── default.vue         # Standard-Layout
│
├── pages/
│   ├── index.vue           # Hauptseite (/) - Journal & Todo
│   └── about.vue           # Über-Seite (/about)
│
├── utils/
│   └── stardate.ts         # Sternenzeit-Berechnungen
│
└── server/
    ├── api/                # Nitro API Routes (File-based)
    │   ├── health.get.ts
    │   ├── journals/
    │   │   ├── index.get.ts
    │   │   ├── index.post.ts
    │   │   ├── [id].put.ts
    │   │   ├── [id].delete.ts
    │   │   └── [id]/todos.get.ts
    │   └── todos/
    │       ├── index.get.ts
    │       ├── index.post.ts
    │       ├── [id].put.ts
    │       └── [id].delete.ts
    ├── utils/
    │   └── database.ts     # SQLite Datenbank-Layer
    ├── migrate.js          # Datenbank-Migration
    └── database.sqlite     # SQLite Datenbank
```

## 🚀 Installation & Start

### Voraussetzungen
- **Node.js 18+** (Nuxt 3 benötigt mindestens v18)
- npm oder yarn

### Installation

```bash
# Node-Version prüfen
node --version  # Sollte >= 18 sein

# Falls nötig: Node upgraden
nvm install 20
nvm use 20

# Dependencies installieren
npm install
```

### Entwicklungsserver starten

```bash
# Ein Befehl startet ALLES (Nitro ist integriert!)
npm run dev
```

Die Anwendung läuft dann auf:
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:3000/api

## 📝 Verfügbare Routes

- `/` - Hauptseite mit Journal & Todo
- `/about` - Über diese Anwendung
- `/api/*` - Backend API Endpoints (siehe unten)

## 🎨 Features

### ✅ Implementiert
- **Journal-Verwaltung**
  - Erstellen, Bearbeiten, Löschen von Einträgen
  - Volltext-Suche
  - Sortierung (Datum, Alphabet)
  - Todos aus Journal-Text extrahieren

- **Todo-Verwaltung**
  - Erstellen, Bearbeiten, Löschen von Todos
  - Prioritäten (Hoch/Mittel/Niedrig) mit Farbcodierung
  - Status-Filter (Alle/Offen/Erledigt/Aus Journals)
  - Sortierung (Datum, Alphabet, Priorität)
  - Verknüpfung mit Journal-Einträgen

- **LCARS-Design**
  - Authentischer Star Trek LCARS-Stil
  - Animationen (Slide-in, Slide-out)
  - Responsive Design

- **Sternenzeit-Modus**
  - Toggle zwischen Erdzeit und Sternenzeit (TNG-Ära)

- **Nuxt 3 + Nitro Features**
  - Auto-Imports
  - File-based Routing (Frontend + Backend)
  - Layouts-System
  - Composables
  - SSR/SPA Hybrid
  - Integrierter Server (kein separater Backend-Prozess!)

## 🗄️ Backend API (Nitro)

### Endpoints

**Health Check:**
- `GET /api/health` - Server Status

**Journals:**
- `GET /api/journals` - Alle Journal-Einträge
- `POST /api/journals` - Neuen Eintrag erstellen
- `PUT /api/journals/:id` - Eintrag bearbeiten
- `DELETE /api/journals/:id` - Eintrag löschen
- `GET /api/journals/:id/todos` - Verknüpfte Todos

**Todos:**
- `GET /api/todos` - Alle Todos
- `POST /api/todos` - Neues Todo erstellen
- `PUT /api/todos/:id` - Todo bearbeiten (text, done, priority)
- `DELETE /api/todos/:id` - Todo löschen

Siehe `server/NITRO-API.md` für detaillierte API-Dokumentation.

## 🔄 Migration zu Nitro

Das Backend wurde von Fastify zu **Nitro** migriert:

### Vorteile von Nitro:
- ✅ **Ein Server** statt zwei (Nuxt + Backend integriert)
- ✅ **File-based API Routes** (wie Pages)
- ✅ **Universal** (Dev, Production, Edge, Serverless)
- ✅ **Type-Safe** TypeScript-Support
- ✅ **Auto-Imports** für Server-Funktionen

### Migration:
- Alte Fastify-Dateien: `server/backup-fastify/`
- Neue Nitro-Routes: `server/api/`
- Keine CORS-Konfiguration nötig
- Kein separater Server-Prozess

## 🖖 Live Long and Prosper!
