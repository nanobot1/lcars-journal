<script setup>
import { onMounted } from 'vue'

// Provide globally accessible state
const useStardate = useState('useStardate', () => false)
provide('useStardate', useStardate)

// Toast system
const { toasts, remove } = useToast()

// Theme system - load saved theme on mount
const { loadTheme } = useTheme()
onMounted(() => {
  loadTheme()
})
</script>

<template>
  <div>
    <NuxtPage />
    
    <!-- Toast Container -->
    <div class="lcars-toast-container">
      <TransitionGroup name="toast">
        <LcarsToast
          v-for="toast in toasts"
          :key="toast.id"
          :message="toast.message"
          :type="toast.type"
          :duration="toast.duration"
          @close="remove(toast.id)"
        />
      </TransitionGroup>
    </div>
  </div>
</template>

<style>
.lcars-toast-container {
  position: fixed;
  top: 24px;
  right: 24px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 12px;
  pointer-events: none;
}

.lcars-toast-container > * {
  pointer-events: auto;
}

/* Toast transition animations */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(400px);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(400px) scale(0.8);
}

.toast-move {
  transition: transform 0.3s ease;
}
</style>
