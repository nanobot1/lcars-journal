import { getAllJournals } from '~/server/utils/database'

export default defineEventHandler(async (event) => {
  try {
    const journals = await getAllJournals()
    return journals
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch journals',
      data: error
    })
  }
})
