import { getJournal } from '~/server/utils/database'

export default defineEventHandler(async (event) => {
  try {
    const id = Number(getRouterParam(event, 'id'))
    const journal = await getJournal(id, event)
    
    if (!journal) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Journal not found'
      })
    }

    return journal
  } catch (error) {
    if (error.statusCode) throw error
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch journal',
      data: error
    })
  }
})
