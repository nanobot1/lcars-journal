import fs from 'fs'
import path from 'path'
import initSqlJs from 'sql.js'

let db = null
let dbInitialized = false

export async function useDatabase() {
  if (dbInitialized && db) {
    return db
  }

  const SQL = await initSqlJs()
  const dbPath = path.join(process.cwd(), 'server', 'database.sqlite')
  
  // Load existing DB or create new
  if (fs.existsSync(dbPath)) {
    const buffer = fs.readFileSync(dbPath)
    db = new SQL.Database(buffer)
    console.log('✅ Database loaded:', dbPath)
  } else {
    db = new SQL.Database()
    console.log('✅ New database created:', dbPath)
  }

  // Create tables
  db.run(`
    CREATE TABLE IF NOT EXISTS journals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      text TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  db.run(`
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

  db.run(`CREATE INDEX IF NOT EXISTS idx_todos_journal_id ON todos(journal_id)`)
  db.run(`CREATE INDEX IF NOT EXISTS idx_todos_done ON todos(done)`)

  dbInitialized = true
  return db
}

export function saveDatabase() {
  if (!db) return
  const dbPath = path.join(process.cwd(), 'server', 'database.sqlite')
  const data = db.export()
  fs.writeFileSync(dbPath, data)
}

// Journal operations
export async function getAllJournals() {
  const database = await useDatabase()
  const stmt = database.prepare('SELECT * FROM journals ORDER BY created_at DESC')
  const result = []
  while (stmt.step()) {
    result.push(stmt.getAsObject())
  }
  stmt.free()
  return result
}

export async function getJournal(id: number) {
  const database = await useDatabase()
  const stmt = database.prepare('SELECT * FROM journals WHERE id = ?')
  stmt.bind([id])
  const hasRow = stmt.step()
  const result = hasRow ? stmt.getAsObject() : null
  stmt.free()
  return result
}

export async function createJournal(text: string) {
  const database = await useDatabase()
  database.run('INSERT INTO journals (text) VALUES (?)', [text])
  saveDatabase()
  
  // Get the inserted row
  const stmt = database.prepare('SELECT * FROM journals ORDER BY id DESC LIMIT 1')
  stmt.step()
  const row = stmt.getAsObject()
  stmt.free()
  
  return row
}

export async function updateJournal(id: number, text: string) {
  const database = await useDatabase()
  database.run('UPDATE journals SET text = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [text, id])
  saveDatabase()
  return { id, text, updated_at: new Date().toISOString() }
}

export async function deleteJournal(id: number) {
  const database = await useDatabase()
  database.run('DELETE FROM journals WHERE id = ?', [id])
  saveDatabase()
}

// Todo operations
export async function getAllTodos() {
  const database = await useDatabase()
  const stmt = database.prepare('SELECT * FROM todos ORDER BY created_at DESC')
  const result = []
  while (stmt.step()) {
    result.push(stmt.getAsObject())
  }
  stmt.free()
  return result
}

export async function getTodo(id: number) {
  const database = await useDatabase()
  const stmt = database.prepare('SELECT * FROM todos WHERE id = ?')
  stmt.bind([id])
  const hasRow = stmt.step()
  const result = hasRow ? stmt.getAsObject() : null
  stmt.free()
  return result
}

export async function createTodo(text: string, journal_id: number | null = null, priority: string = 'medium') {
  const database = await useDatabase()
  database.run('INSERT INTO todos (text, journal_id, priority) VALUES (?, ?, ?)', [text, journal_id, priority])
  saveDatabase()
  
  // Get the inserted row
  const stmt = database.prepare('SELECT * FROM todos ORDER BY id DESC LIMIT 1')
  stmt.step()
  const row = stmt.getAsObject()
  stmt.free()
  
  return row
}

export async function updateTodo(id: number, updates: any) {
  const database = await useDatabase()
  const current = database.prepare('SELECT * FROM todos WHERE id = ?')
  current.bind([id])
  if (!current.step()) {
    current.free()
    return null
  }
  const row = current.getAsObject()
  current.free()

  const newText = updates.text !== undefined ? updates.text : row.text
  const newDone = updates.done !== undefined ? (updates.done ? 1 : 0) : row.done
  const newPriority = updates.priority !== undefined ? updates.priority : row.priority

  database.run('UPDATE todos SET text = ?, done = ?, priority = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', 
    [newText, newDone, newPriority, id])
  saveDatabase()
  return { id, text: newText, done: newDone, priority: newPriority, journal_id: row.journal_id, updated_at: new Date().toISOString() }
}

export async function deleteTodo(id: number) {
  const database = await useDatabase()
  database.run('DELETE FROM todos WHERE id = ?', [id])
  saveDatabase()
}

export async function getTodosByJournal(journal_id: number) {
  const database = await useDatabase()
  const stmt = database.prepare('SELECT * FROM todos WHERE journal_id = ? ORDER BY created_at ASC')
  stmt.bind([journal_id])
  const result = []
  while (stmt.step()) {
    result.push(stmt.getAsObject())
  }
  stmt.free()
  return result
}
