/**
 * Migration script to add priority column to existing todos
 * Run this once if you have an existing database without the priority column
 */
const path = require('path')
const fs = require('fs')
const initSqlJs = require('sql.js')

async function migrate() {
  const dbPath = path.join(__dirname, 'database.sqlite')
  
  if (!fs.existsSync(dbPath)) {
    console.log('No existing database found. No migration needed.')
    return
  }

  const SQL = await initSqlJs()
  const buffer = fs.readFileSync(dbPath)
  const db = new SQL.Database(buffer)

  console.log('Checking if migration is needed...')

  try {
    // Try to select priority column
    db.exec('SELECT priority FROM todos LIMIT 1')
    console.log('✅ Priority column already exists. No migration needed.')
  } catch (err) {
    // Column doesn't exist, add it
    console.log('Adding priority column to todos table...')
    db.run("ALTER TABLE todos ADD COLUMN priority TEXT DEFAULT 'medium'")
    
    // Save the database
    const data = db.export()
    fs.writeFileSync(dbPath, data)
    
    console.log('✅ Migration complete! Priority column added.')
  }

  db.close()
}

migrate().catch(err => {
  console.error('Migration failed:', err)
  process.exit(1)
})
