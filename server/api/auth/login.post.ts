export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { username, password } = body

    // Simple hardcoded credentials (in production, use a proper auth system)
    if (username === 'admin' && password === 'password12345') {
      await setUserSession(event, {
        user: {
          username: 'admin'
        }
      })

      return {
        success: true,
        user: { username: 'admin' }
      }
    }

    throw createError({
      statusCode: 401,
      statusMessage: 'Ungültige Anmeldedaten'
    })
  } catch (error) {
    if (error.statusCode) throw error
    throw createError({
      statusCode: 500,
      statusMessage: 'Login fehlgeschlagen',
      data: error
    })
  }
})
