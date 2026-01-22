# Cloudflare Pages Deployment Guide

Diese Anleitung zeigt dir, wie du die LCARS Journal & Todo App auf Cloudflare Pages mit D1 Database deployen kannst.

## Voraussetzungen

- [Cloudflare Account](https://dash.cloudflare.com/sign-up) (kostenlos)
- [Node.js 20+](https://nodejs.org/) installiert
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/) installiert

```bash
npm install -g wrangler
```

## Schritt 1: Wrangler einrichten

Login in deinen Cloudflare Account:

```bash
wrangler login
```

## Schritt 2: D1 Database erstellen

Erstelle eine neue D1 Datenbank:

```bash
wrangler d1 create lcars-journal-db
```

Du erhältst eine Ausgabe wie diese:

```
✅ Successfully created DB 'lcars-journal-db'

[[d1_databases]]
binding = "DB"
database_name = "lcars-journal-db"
database_id = "xxxx-xxxx-xxxx-xxxx"
```

**Speichere die `database_id` - du brauchst sie später!**

## Schritt 3: Schema in D1 initialisieren

Führe die Migration aus:

```bash
wrangler d1 execute lcars-journal-db --file=server/migrations/0001_init.sql
```

Überprüfe, dass die Tabellen erstellt wurden:

```bash
wrangler d1 execute lcars-journal-db --command="SELECT name FROM sqlite_master WHERE type='table'"
```

## Schritt 4: Git Repository vorbereiten

Stelle sicher, dass dein Code in einem Git-Repository ist:

```bash
# Falls noch nicht initialisiert
git init
git add .
git commit -m "Prepare for Cloudflare deployment"

# Push zu GitHub/GitLab
git remote add origin <dein-repo-url>
git push -u origin main
```

## Schritt 5: Cloudflare Pages Project erstellen

### Option A: Via Cloudflare Dashboard (empfohlen)

1. Gehe zu [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigiere zu **Workers & Pages** → **Create application** → **Pages** → **Connect to Git**
3. Wähle dein Repository aus
4. Konfiguration:
   - **Project name**: `lcars-journal` (oder beliebig)
   - **Production branch**: `main`
   - **Build command**: `npm run build`
   - **Build output directory**: `.output/public`
   - **Root directory**: `/` (leer lassen)

5. **Environment Variables** (wichtig!):
   - Keine zusätzlichen ENV-Variablen nötig (D1 binding wird separat konfiguriert)

6. Klicke auf **Save and Deploy**

### Option B: Via Wrangler CLI

Erstelle eine `wrangler.toml` Datei im Root-Verzeichnis:

```toml
name = "lcars-journal"
compatibility_date = "2024-01-22"
pages_build_output_dir = ".output/public"

[[d1_databases]]
binding = "DB"
database_name = "lcars-journal-db"
database_id = "DEINE-DATABASE-ID-HIER"  # Ersetze mit deiner ID aus Schritt 2
```

Dann deploye:

```bash
npm run build
wrangler pages deploy .output/public --project-name=lcars-journal
```

## Schritt 6: D1 Binding konfigurieren

Im Cloudflare Dashboard:

1. Gehe zu deinem Pages Project → **Settings** → **Functions**
2. Scrolle zu **D1 database bindings**
3. Klicke auf **Add binding**
   - **Variable name**: `DB`
   - **D1 database**: Wähle `lcars-journal-db`
4. Speichern

## Schritt 7: Redeploy

Nachdem du das D1 Binding hinzugefügt hast, triggere einen neuen Deploy:

- **Via Dashboard**: Gehe zu **Deployments** → **Retry deployment**
- **Via Git**: Push einen neuen Commit

```bash
git commit --allow-empty -m "Trigger redeploy"
git push
```

## Schritt 8: Fertig! 🎉

Deine App ist jetzt live unter:

```
https://lcars-journal.pages.dev
```

(oder deine gewählte Domain)

---

## Lokale Entwicklung

Die App funktioniert lokal weiterhin mit SQLite:

```bash
export NVM_DIR="$HOME/Library/Application Support/Herd/config/nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm use 20
npm run dev
```

Die `database-unified.ts` erkennt automatisch die Umgebung und verwendet:
- **Lokal**: SQLite (`server/database.sqlite`)
- **Cloudflare**: D1 Database

---

## Troubleshooting

### Build schlägt fehl

Stelle sicher, dass:
- Node 20+ verwendet wird
- `npm install` ohne Fehler durchläuft
- `npm run build` lokal funktioniert

### Database nicht erreichbar

Prüfe:
- D1 Binding ist korrekt konfiguriert (`DB` als Variable name)
- Migration wurde ausgeführt
- Database ID ist korrekt in wrangler.toml

### Lokaler Dev-Server

Falls der lokale Server Probleme hat:

```bash
rm -rf .nuxt node_modules/.vite
npm install
npm run dev
```

---

## Custom Domain (optional)

1. Gehe zu deinem Pages Project → **Custom domains**
2. Klicke auf **Set up a custom domain**
3. Folge den Anweisungen

---

## Limits (Free Tier)

Cloudflare D1 Free Tier:
- ✅ 10 GB Daten
- ✅ 5 Million Reads/Monat
- ✅ 100.000 Writes/Monat

Mehr als genug für persönliche Nutzung! 🚀

---

## Nächste Schritte

- [ ] Custom Domain hinzufügen
- [ ] Analytics aktivieren
- [ ] Backup-Strategie einrichten
- [ ] Production Monitoring
