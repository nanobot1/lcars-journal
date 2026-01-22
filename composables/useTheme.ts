export const useTheme = () => {
  const theme = useState('lcars-theme', () => 'standard')

  const setTheme = (newTheme: 'standard' | 'light' | 'dark') => {
    theme.value = newTheme
    
    // Update DOM
    if (process.client) {
      const html = document.documentElement
      if (newTheme === 'standard') {
        html.removeAttribute('data-theme')
      } else {
        html.setAttribute('data-theme', newTheme)
      }
      
      // Save to localStorage
      localStorage.setItem('lcars-theme', newTheme)
    }
  }

  const loadTheme = () => {
    if (process.client) {
      const saved = localStorage.getItem('lcars-theme')
      if (saved && ['standard', 'light', 'dark'].includes(saved)) {
        setTheme(saved as 'standard' | 'light' | 'dark')
      }
    }
  }

  const cycleTheme = () => {
    const themes = ['standard', 'light', 'dark'] as const
    const currentIndex = themes.indexOf(theme.value as any)
    const nextIndex = (currentIndex + 1) % themes.length
    setTheme(themes[nextIndex])
  }

  return {
    theme,
    setTheme,
    loadTheme,
    cycleTheme
  }
}
