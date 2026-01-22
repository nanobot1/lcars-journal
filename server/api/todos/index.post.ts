import { createTodo } from '~/server/utils/database'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    
    if (!body.text || !body.text.trim()) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Text required'
      })
    }

    const todo = await createTodo(
      body.text,
      body.journal_id || null,
      body.priority || 'medium'
    )
    return todo
  } catch (error) {
    if (error.statusCode) throw error
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to create todo',
      data: error
    })
  }
})
