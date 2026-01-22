/**
 * Composable for Todo API operations
 */
export const useTodoAPI = () => {
  const config = useRuntimeConfig()
  const apiBase = config.public.apiBase

  const getAll = async () => {
    return await $fetch(`${apiBase}/todos`)
  }

  const create = async (text: string, journal_id: number | null = null, priority: string = 'medium') => {
    return await $fetch(`${apiBase}/todos`, {
      method: 'POST',
      body: { text, journal_id, priority }
    })
  }

  const update = async (id: number, updates: any) => {
    return await $fetch(`${apiBase}/todos/${id}`, {
      method: 'PUT',
      body: updates
    })
  }

  const remove = async (id: number) => {
    await $fetch(`${apiBase}/todos/${id}`, {
      method: 'DELETE'
    })
  }

  return {
    getAll,
    create,
    update,
    remove
  }
}
