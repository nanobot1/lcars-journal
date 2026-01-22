export const useToast = () => {
  const toasts = useState('toasts', () => [])

  const show = (message, type = 'info', duration = 3000) => {
    const id = Date.now() + Math.random()
    const toast = {
      id,
      message,
      type,
      duration
    }
    
    toasts.value.push(toast)
    
    // Note: Auto-remove is handled by the LcarsToast component
    // The component will emit 'close' event after duration + animation

    return id
  }

  const remove = (id) => {
    const index = toasts.value.findIndex(t => t.id === id)
    if (index > -1) {
      toasts.value.splice(index, 1)
    }
  }

  // Convenience methods
  const success = (message, duration) => show(message, 'success', duration)
  const error = (message, duration) => show(message, 'error', duration)
  const warning = (message, duration) => show(message, 'warning', duration)
  const info = (message, duration) => show(message, 'info', duration)

  return {
    toasts,
    show,
    remove,
    success,
    error,
    warning,
    info
  }
}
