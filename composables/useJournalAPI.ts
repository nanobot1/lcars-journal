/**
 * Composable for Journal API operations
 */
export const useJournalAPI = () => {
  const config = useRuntimeConfig()
  const apiBase = config.public.apiBase

  const getAll = async () => {
    return await $fetch(`${apiBase}/journals`)
  }

  const create = async (text: string) => {
    return await $fetch(`${apiBase}/journals`, {
      method: 'POST',
      body: { text }
    })
  }

  const update = async (id: number, text: string) => {
    return await $fetch(`${apiBase}/journals/${id}`, {
      method: 'PUT',
      body: { text }
    })
  }

  const remove = async (id: number) => {
    await $fetch(`${apiBase}/journals/${id}`, {
      method: 'DELETE'
    })
  }

  const getTodos = async (id: number) => {
    return await $fetch(`${apiBase}/journals/${id}/todos`)
  }

  return {
    getAll,
    create,
    update,
    remove,
    getTodos
  }
}
