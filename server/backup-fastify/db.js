const fs = require('fs')
const path = require('path')
const initSqlJs = require('sql.js')

let db = null

async function initDb(dbPath) {
  const SQL = await initSqlJs()
  
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

  // Auto-save function
  const saveDb = () => {
    const data = db.export()
    fs.writeFileSync(dbPath, data)
  }

  return {
    // Journals
    getAllJournals: () => {
      const stmt = db.prepare('SELECT * FROM journals ORDER BY created_at DESC')
      const result = []
      while (stmt.step()) {
        result.push(stmt.getAsObject())
      }
      stmt.free()
      return result
    },

    getJournal: (id) => {
      const stmt = db.prepare('SELECT * FROM journals WHERE id = ?')
      stmt.bind([id])
      const hasRow = stmt.step()
      const result = hasRow ? stmt.getAsObject() : null
      stmt.free()
      return result
    },

    createJournal: (text) => {
      db.run('INSERT INTO journals (text) VALUES (?)', [text])
      saveDb()
      const id = db.exec('SELECT last_insert_rowid() as id')[0].values[0][0]
      return { id, text, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
    },

    updateJournal: (id, text) => {
      db.run('UPDATE journals SET text = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [text, id])
      saveDb()
      return { id, text, updated_at: new Date().toISOString() }
    },

    deleteJournal: (id) => {
      db.run('DELETE FROM journals WHERE id = ?', [id])
      saveDb()
    },

    // Todos
    getAllTodos: () => {
      const stmt = db.prepare('SELECT * FROM todos ORDER BY created_at DESC')
      const result = []
      while (stmt.step()) {
        result.push(stmt.getAsObject())
      }
      stmt.free()
      return result
    },

    getTodo: (id) => {
      const stmt = db.prepare('SELECT * FROM todos WHERE id = ?')
      stmt.bind([id])
      const hasRow = stmt.step()
      const result = hasRow ? stmt.getAsObject() : null
      stmt.free()
      return result
    },

    createTodo: (text, journal_id = null, priority = 'medium') => {
      db.run('INSERT INTO todos (text, journal_id, priority) VALUES (?, ?, ?)', [text, journal_id, priority])
      saveDb()
      const result = db.exec('SELECT last_insert_rowid() as id')[0]
      const id = result ? result.values[0][0] : null
      return { id, text, done: 0, priority, journal_id, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
    },

    updateTodo: (id, text, done, priority) => {
      const current = db.prepare('SELECT * FROM todos WHERE id = ?')
      current.bind([id])
      if (!current.step()) {
        current.free()
        return null
      }
      const row = current.getAsObject()
      current.free()

      const newText = text !== undefined ? text : row.text
      const newDone = done !== undefined ? (done ? 1 : 0) : row.done
      const newPriority = priority !== undefined ? priority : row.priority

      db.run('UPDATE todos SET text = ?, done = ?, priority = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [newText, newDone, newPriority, id])
      saveDb()
      return { id, text: newText, done: newDone, priority: newPriority, journal_id: row.journal_id, updated_at: new Date().toISOString() }
    },

    deleteTodo: (id) => {
      db.run('DELETE FROM todos WHERE id = ?', [id])
      saveDb()
    },

    getTodosByJournal: (journal_id) => {
      const stmt = db.prepare('SELECT * FROM todos WHERE journal_id = ? ORDER BY created_at ASC')
      stmt.bind([journal_id])
      const result = []
      while (stmt.step()) {
        result.push(stmt.getAsObject())
      }
      stmt.free()
      return result
    },

    close: () => {
      saveDb()
      db.close()
    },
  }
}

module.exports = { initDb }
