import { updateJournal } from '~/server/utils/database'

export default defineEventHandler(async (event) => {
  try {
    const id = Number(getRouterParam(event, 'id'))
    const body = await readBody(event)
    
    if (!body.text || !body.text.trim()) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Text required'
      })
    }

    const journal = await updateJournal(id, body.text)
    return journal
  } catch (error) {
    if (error.statusCode) throw error
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to update journal',
      data: error
    })
  }
})
