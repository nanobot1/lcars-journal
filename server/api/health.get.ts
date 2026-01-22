export default defineEventHandler(async (event) => {
  return {
    ok: true,
    timestamp: new Date().toISOString(),
    server: 'Nitro'
  }
})
