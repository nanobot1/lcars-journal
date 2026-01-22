import { deleteJournal } from '~/server/utils/database'

export default defineEventHandler(async (event) => {
  try {
    const id = Number(getRouterParam(event, 'id'))
    await deleteJournal(id, event)
    setResponseStatus(event, 204)
    return null
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to delete journal',
      data: error
    })
  }
})
