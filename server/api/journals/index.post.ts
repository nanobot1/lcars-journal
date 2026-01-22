import { createJournal } from '~/server/utils/database'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    
    if (!body.text || !body.text.trim()) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Text required'
      })
    }

    const journal = await createJournal(body.text, event)
    return journal
  } catch (error) {
    if (error.statusCode) throw error
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to create journal',
      data: error
    })
  }
})
