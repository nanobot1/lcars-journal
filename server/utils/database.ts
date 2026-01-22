// Cloudflare D1 compatible database layer with local SQLite fallback

// Local SQLite setup (for development)
let localDb = null
let dbInitialized = false

async function getLocalDatabase() {
  if (dbInitialized && localDb) {
    return localDb
  }

  const fs = await import('fs')
  const path = await import('path')
  const initSqlJs = (await import('sql.js')).default
  
  const SQL = await initSqlJs()
  const dbPath = path.join(process.cwd(), 'server', 'database.sqlite')
  
  // Load existing DB or create new
  if (fs.existsSync(dbPath)) {
    const buffer = fs.readFileSync(dbPath)
    localDb = new SQL.Database(buffer)
    console.log('✅ Local SQLite loaded:', dbPath)
  } else {
    localDb = new SQL.Database()
    console.log('✅ New local SQLite created:', dbPath)
  }

  // Create tables
  localDb.run(`
    CREATE TABLE IF NOT EXISTS journals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      text TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  localDb.run(`
    CREATE TABLE IF NOT EXISTS todos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      text TEXT NOT NULL,
      done INTEGER DEFAULT 0,
      priority TEXT DEFAULT 'medium',
      journal_id INTEGER NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (journal_id) REFERENCES journals(id) ON DELETE SET NULL
    )
  `)

  localDb.run(`CREATE INDEX IF NOT EXISTS idx_todos_journal_id ON todos(journal_id)`)
  localDb.run(`CREATE INDEX IF NOT EXISTS idx_todos_done ON todos(done)`)

  dbInitialized = true
  return localDb
}

function saveLocalDatabase() {
  if (!localDb) return
  const fs = require('fs')
  const path = require('path')
  const dbPath = path.join(process.cwd(), 'server', 'database.sqlite')
  const data = localDb.export()
  fs.writeFileSync(dbPath, data)
}

// Get database connection (D1 or local SQLite)
async function useDatabase(event?: any) {
  // Check if D1 is available (Cloudflare Pages/Workers)
  if (event?.context?.cloudflare?.env?.DB) {
    console.log('✅ Using Cloudflare D1 database')
    return event.context.cloudflare.env.DB
  }
  // Fallback to local SQLite
  console.log('✅ Using local SQLite database')
  return getLocalDatabase()
}

// Execute query (unified interface for both D1 and SQLite)
async function executeQuery(db: any, query: string, params: any[] = []) {
  if (db.prepare) {
    // Cloudflare D1
    const stmt = db.prepare(query).bind(...params)
    return await stmt.all()
  } else {
    // Local SQLite
    const stmt = db.prepare(query)
    if (params.length > 0) {
      stmt.bind(params)
    }
    const result = []
    while (stmt.step()) {
      result.push(stmt.getAsObject())
    }
    stmt.free()
    return { results: result }
  }
}

async function executeRun(db: any, query: string, params: any[] = []) {
  if (db.prepare) {
    // Cloudflare D1
    const stmt = db.prepare(query).bind(...params)
    return await stmt.run()
  } else {
    // Local SQLite
    db.run(query, params)
    saveLocalDatabase()
    return { success: true }
  }
}

// Journal operations
export async function getAllJournals(event?: any) {
  const db = await useDatabase(event)
  const result = await executeQuery(db, 'SELECT * FROM journals ORDER BY created_at DESC')
  return result.results || result
}

export async function getJournal(id: number, event?: any) {
  const db = await useDatabase(event)
  const result = await executeQuery(db, 'SELECT * FROM journals WHERE id = ?', [id])
  const rows = result.results || result
  return rows.length > 0 ? rows[0] : null
}

export async function createJournal(text: string, event?: any) {
  const db = await useDatabase(event)
  await executeRun(db, 'INSERT INTO journals (text) VALUES (?)', [text])
  
  // Get the inserted row
  const result = await executeQuery(db, 'SELECT * FROM journals ORDER BY id DESC LIMIT 1')
  const rows = result.results || result
  return rows[0]
}

export async function updateJournal(id: number, text: string, event?: any) {
  const db = await useDatabase(event)
  await executeRun(db, 'UPDATE journals SET text = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [text, id])
  return { id, text, updated_at: new Date().toISOString() }
}

export async function deleteJournal(id: number, event?: any) {
  const db = await useDatabase(event)
  await executeRun(db, 'DELETE FROM journals WHERE id = ?', [id])
}

// Todo operations
export async function getAllTodos(event?: any) {
  const db = await useDatabase(event)
  const result = await executeQuery(db, 'SELECT * FROM todos ORDER BY created_at DESC')
  return result.results || result
}

export async function getTodo(id: number, event?: any) {
  const db = await useDatabase(event)
  const result = await executeQuery(db, 'SELECT * FROM todos WHERE id = ?', [id])
  const rows = result.results || result
  return rows.length > 0 ? rows[0] : null
}

export async function createTodo(text: string, journal_id: number | null = null, priority: string = 'medium', event?: any) {
  const db = await useDatabase(event)
  await executeRun(db, 'INSERT INTO todos (text, journal_id, priority) VALUES (?, ?, ?)', [text, journal_id, priority])
  
  // Get the inserted row
  const result = await executeQuery(db, 'SELECT * FROM todos ORDER BY id DESC LIMIT 1')
  const rows = result.results || result
  return rows[0]
}

export async function updateTodo(id: number, updates: any, event?: any) {
  const db = await useDatabase(event)
  
  // Get current todo
  const currentResult = await executeQuery(db, 'SELECT * FROM todos WHERE id = ?', [id])
  const rows = currentResult.results || currentResult
  if (rows.length === 0) return null
  
  const row = rows[0]
  const newText = updates.text !== undefined ? updates.text : row.text
  const newDone = updates.done !== undefined ? (updates.done ? 1 : 0) : row.done
  const newPriority = updates.priority !== undefined ? updates.priority : row.priority

  await executeRun(db, 'UPDATE todos SET text = ?, done = ?, priority = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', 
    [newText, newDone, newPriority, id])
  
  return { id, text: newText, done: newDone, priority: newPriority, journal_id: row.journal_id, updated_at: new Date().toISOString() }
}

export async function deleteTodo(id: number, event?: any) {
  const db = await useDatabase(event)
  await executeRun(db, 'DELETE FROM todos WHERE id = ?', [id])
}

export async function getTodosByJournal(journal_id: number, event?: any) {
  const db = await useDatabase(event)
  const result = await executeQuery(db, 'SELECT * FROM todos WHERE journal_id = ? ORDER BY created_at ASC', [journal_id])
  return result.results || result
}
