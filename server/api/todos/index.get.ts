import { getAllTodos } from '~/server/utils/database'

export default defineEventHandler(async (event) => {
  try {
    const todos = await getAllTodos()
    return todos
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch todos',
      data: error
    })
  }
})
