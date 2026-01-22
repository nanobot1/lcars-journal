# Nitro Server API Structure

## 📁 API Routes

Nuxt verwendet Nitro als Server-Engine. Alle API-Routen werden automatisch aus dem `server/api/` Verzeichnis generiert.

### Verzeichnisstruktur

```
server/
├── api/
│   ├── health.get.ts                     # GET /api/health
│   ├── journals/
│   │   ├── index.get.ts                  # GET /api/journals
│   │   ├── index.post.ts                 # POST /api/journals
│   │   ├── [id].put.ts                   # PUT /api/journals/:id
│   │   ├── [id].delete.ts                # DELETE /api/journals/:id
│   │   └── [id]/
│   │       └── todos.get.ts              # GET /api/journals/:id/todos
│   └── todos/
│       ├── index.get.ts                  # GET /api/todos
│       ├── index.post.ts                 # POST /api/todos
│       ├── [id].put.ts                   # PUT /api/todos/:id
│       └── [id].delete.ts                # DELETE /api/todos/:id
└── utils/
    └── database.ts                       # Datenbank-Funktionen

```

## 🔌 API Endpoints

### Health Check
```
GET /api/health
Response: { ok: true, timestamp: "...", server: "Nitro" }
```

### Journals

#### Get All Journals
```
GET /api/journals
Response: Journal[]
```

#### Create Journal
```
POST /api/journals
Body: { text: string }
Response: { id, text, created_at, updated_at }
```

#### Update Journal
```
PUT /api/journals/:id
Body: { text: string }
Response: { id, text, updated_at }
```

#### Delete Journal
```
DELETE /api/journals/:id
Response: 204 No Content
```

#### Get Journal Todos
```
GET /api/journals/:id/todos
Response: Todo[]
```

### Todos

#### Get All Todos
```
GET /api/todos
Response: Todo[]
```

#### Create Todo
```
POST /api/todos
Body: { 
  text: string, 
  journal_id?: number, 
  priority?: 'high' | 'medium' | 'low' 
}
Response: { id, text, done, priority, journal_id, created_at, updated_at }
```

#### Update Todo
```
PUT /api/todos/:id
Body: { 
  text?: string, 
  done?: boolean, 
  priority?: 'high' | 'medium' | 'low' 
}
Response: { id, text, done, priority, journal_id, updated_at }
```

#### Delete Todo
```
DELETE /api/todos/:id
Response: 204 No Content
```

## 🗄️ Datenbank

Die Datenbank-Funktionen befinden sich in `server/utils/database.ts` und verwenden SQLite (sql.js).

### Verfügbare Funktionen

**Database Management:**
- `useDatabase()` - Initialisiert und gibt DB-Instanz zurück
- `saveDatabase()` - Speichert DB auf Festplatte

**Journals:**
- `getAllJournals()`
- `getJournal(id)`
- `createJournal(text)`
- `updateJournal(id, text)`
- `deleteJournal(id)`

**Todos:**
- `getAllTodos()`
- `getTodo(id)`
- `createTodo(text, journal_id?, priority?)`
- `updateTodo(id, updates)`
- `deleteTodo(id)`
- `getTodosByJournal(journal_id)`

## 🚀 Vorteile von Nitro

1. **Integriert**: Läuft im gleichen Prozess wie Nuxt (kein separater Server)
2. **File-based Routing**: API-Routen automatisch aus Dateistruktur
3. **Universal**: Funktioniert in Dev, Production, Edge, Serverless
4. **Type-Safe**: TypeScript-Support out of the box
5. **Auto-Imports**: `defineEventHandler`, `readBody`, etc. verfügbar

## 📝 Entwicklung

```bash
# Ein einziger Befehl startet alles
npm run dev

# Frontend + Backend laufen zusammen auf Port 3000
# API ist erreichbar unter: http://localhost:3000/api/*
```

## 🔄 Migration von Fastify

Die alte Fastify-Implementierung wurde nach `server/backup-fastify/` verschoben.

**Hauptunterschiede:**

| Fastify | Nitro |
|---------|-------|
| Separater Server | Integriert in Nuxt |
| `app.get('/route', ...)` | `server/api/route.get.ts` |
| `req.body` | `await readBody(event)` |
| `req.params.id` | `getRouterParam(event, 'id')` |
| `reply.code(404)` | `throw createError({ statusCode: 404 })` |
| CORS Plugin | Automatisch gehandhabt |

## 🧪 Testing

```bash
# API testen mit curl
curl http://localhost:3000/api/health
curl http://localhost:3000/api/journals
curl -X POST http://localhost:3000/api/journals \
  -H "Content-Type: application/json" \
  -d '{"text":"Test entry"}'
```
