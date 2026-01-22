import { getTodosByJournal } from '~/server/utils/database'

export default defineEventHandler(async (event) => {
  try {
    const id = Number(getRouterParam(event, 'id'))
    const todos = await getTodosByJournal(id, event)
    return todos
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch todos',
      data: error
    })
  }
})
