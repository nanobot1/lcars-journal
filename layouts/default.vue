<script setup>
import { onMounted, ref } from 'vue'

// Auth
const { loggedIn, user, clear } = useUserSession()
const router = useRouter()

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

// Logout function
async function handleLogout() {
  try {
    await $fetch('/api/auth/logout', { method: 'POST' })
    clear()
    await navigateTo('/login')
  } catch (err) {
    console.error('Logout error:', err)
  }
}
</script>

<template>
  <div>
    <!-- Top Bar with Logout (only shown when logged in) -->
    <div v-if="loggedIn" class="fixed top-4 right-4 z-50 flex items-center gap-3">
      <div class="text-xs text-slate-400 uppercase">
        <span class="text-blue-400">●</span> {{ user?.username }}
      </div>
      <button
        @click="handleLogout"
        class="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white text-xs uppercase font-bold rounded transition"
      >
        Abmelden
      </button>
    </div>

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
