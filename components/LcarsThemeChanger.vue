<script setup>
import { computed } from 'vue'

const { theme, setTheme } = useTheme()

const themeOptions = [
  { value: 'standard', label: 'CLASSIC', icon: '●' },
  { value: 'light', label: 'LIGHT', icon: '○' },
  { value: 'dark', label: 'DARK', icon: '◆' }
]

const currentTheme = computed(() => 
  themeOptions.find(t => t.value === theme.value) || themeOptions[0]
)

function selectTheme(value) {
  setTheme(value)
}
</script>

<template>
  <div class="lcars-theme-changer">
    <button
      v-for="option in themeOptions"
      :key="option.value"
      @click="selectTheme(option.value)"
      class="theme-option"
      :class="{ active: theme === option.value }"
      :title="`Theme: ${option.label}`"
    >
      <span class="theme-icon">{{ option.icon }}</span>
      <span class="theme-label">{{ option.label }}</span>
    </button>
  </div>
</template>

<style scoped>
.lcars-theme-changer {
  display: flex;
  gap: 4px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 999px;
  padding: 3px;
  border: 2px solid rgba(255, 255, 255, 0.1);
}

.theme-option {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 0.7rem;
  font-weight: 700;
  transition: all 0.3s ease;
  color: var(--lcars-text-secondary);
  background: transparent;
  cursor: pointer;
  border: none;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
}

.theme-option:hover {
  background: rgba(255, 255, 255, 0.1);
  color: var(--lcars-text);
}

.theme-option.active {
  background: linear-gradient(180deg, var(--lcars-orange), #ff8a2a);
  color: #061016;
  box-shadow: 0 2px 8px rgba(255, 122, 0, 0.3);
}

.theme-icon {
  font-size: 0.9rem;
  line-height: 1;
}

.theme-label {
  font-size: 0.65rem;
}

/* Responsive: hide labels on small screens */
@media (max-width: 640px) {
  .theme-label {
    display: none;
  }
  
  .theme-option {
    padding: 6px 10px;
  }
}
</style>
