import { updateTodo } from '~/server/utils/database'

export default defineEventHandler(async (event) => {
  try {
    const id = Number(getRouterParam(event, 'id'))
    const body = await readBody(event)
    
    const todo = await updateTodo(id, body, event)
    
    if (!todo) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Todo not found'
      })
    }

    return todo
  } catch (error) {
    if (error.statusCode) throw error
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to update todo',
      data: error
    })
  }
})
