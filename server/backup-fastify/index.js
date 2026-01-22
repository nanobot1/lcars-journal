const path = require('path')
const Fastify = require('fastify')
const cors = require('@fastify/cors')
const { initDb } = require('./db')

async function build() {
  const app = Fastify({ logger: true })
  await app.register(cors, { origin: true })

  const db = await initDb(path.join(__dirname, 'database.sqlite'))

  // Health check
  app.get('/api/health', async () => ({ ok: true, timestamp: new Date().toISOString() }))

  // Journals
  app.get('/api/journals', async () => db.getAllJournals())
  
  app.post('/api/journals', async (req, reply) => {
    const { text } = req.body
    if (!text || !text.trim()) {
      return reply.code(400).send({ error: 'Text required' })
    }
    const j = db.createJournal(text)
    return reply.code(201).send(j)
  })
  
  app.put('/api/journals/:id', async (req, reply) => {
    const id = Number(req.params.id)
    const { text } = req.body
    if (!text || !text.trim()) {
      return reply.code(400).send({ error: 'Text required' })
    }
    const j = db.updateJournal(id, text)
    if (!j) {
      return reply.code(404).send({ error: 'Journal not found' })
    }
    return j
  })
  
  app.delete('/api/journals/:id', async (req, reply) => {
    const id = Number(req.params.id)
    db.deleteJournal(id)
    return reply.code(204).send()
  })

  app.get('/api/journals/:id/todos', async (req, reply) => {
    const id = Number(req.params.id)
    return db.getTodosByJournal(id)
  })

  // Todos
  app.get('/api/todos', async () => db.getAllTodos())
  
  app.post('/api/todos', async (req, reply) => {
    const { text, journal_id, priority } = req.body
    if (!text || !text.trim()) {
      return reply.code(400).send({ error: 'Text required' })
    }
    const t = db.createTodo(text, journal_id || null, priority || 'medium')
    return reply.code(201).send(t)
  })
  
  app.put('/api/todos/:id', async (req, reply) => {
    const id = Number(req.params.id)
    const { text, done, priority } = req.body
    const t = db.updateTodo(id, text, done, priority)
    if (!t) {
      return reply.code(404).send({ error: 'Todo not found' })
    }
    return t
  })
  
  app.delete('/api/todos/:id', async (req, reply) => {
    const id = Number(req.params.id)
    db.deleteTodo(id)
    return reply.code(204).send()
  })

  const port = process.env.PORT || 3000
  await app.listen({ port, host: '0.0.0.0' })
  console.log(`🚀 Fastify server listening on http://localhost:${port}`)
}

build().catch(err => {
  console.error('Failed to start server:', err)
  process.exit(1)
})
