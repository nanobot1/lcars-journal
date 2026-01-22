<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

definePageMeta({
  layout: false
})

const router = useRouter()
const { loggedIn, fetch: fetchSession } = useUserSession()

// Redirect if already logged in
if (loggedIn.value) {
  navigateTo('/')
}

const username = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

async function handleLogin() {
  if (!username.value || !password.value) {
    error.value = 'Bitte Benutzername und Passwort eingeben'
    return
  }

  loading.value = true
  error.value = ''

  try {
    const response = await $fetch('/api/auth/login', {
      method: 'POST',
      body: {
        username: username.value,
        password: password.value
      }
    })

    if (response.success) {
      // Refresh session
      await fetchSession()
      // Redirect to home
      await navigateTo('/')
    }
  } catch (err) {
    error.value = err.data?.message || err.message || 'Login fehlgeschlagen'
    console.error('Login error:', err)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-slate-950 flex items-center justify-center p-4">
    <div class="w-full max-w-md">
      <!-- LCARS Header -->
      <div class="mb-8 text-center">
        <h1 class="text-4xl font-bold text-orange-400 font-orbitron mb-2">
          LCARS JOURNAL
        </h1>
        <div class="text-blue-400 text-sm uppercase tracking-widest">
          Zugriffskontrolle
        </div>
      </div>

      <!-- Login Panel -->
      <div class="bg-slate-900 border-4 border-blue-500 rounded-lg overflow-hidden">
        <!-- Panel Header -->
        <div class="bg-blue-500 px-6 py-3 flex items-center justify-between">
          <span class="text-black font-bold text-lg uppercase font-orbitron">
            Anmeldung
          </span>
          <span class="text-black text-xs uppercase font-mono">
            AUTH-001
          </span>
        </div>

        <!-- Login Form -->
        <div class="p-8 space-y-6">
          <!-- Error Message -->
          <div 
            v-if="error" 
            class="bg-pink-900/30 border-l-4 border-pink-400 p-4 text-pink-300 text-sm"
          >
            ⚠ {{ error }}
          </div>

          <!-- Info Box -->
          <div class="bg-blue-900/30 border-l-4 border-blue-400 p-4 text-blue-200 text-sm">
            <div class="font-bold mb-1">Standard-Anmeldedaten:</div>
            <div class="font-mono text-xs">
              Benutzer: <span class="text-blue-300">admin</span><br>
              Passwort: <span class="text-blue-300">password12345</span>
            </div>
          </div>

          <form @submit.prevent="handleLogin" class="space-y-4">
            <!-- Username -->
            <div>
              <label 
                for="username" 
                class="block text-slate-300 text-sm font-medium mb-2 uppercase tracking-wide"
              >
                Benutzername
              </label>
              <input
                id="username"
                v-model="username"
                type="text"
                class="w-full px-4 py-3 bg-slate-800 border-2 border-slate-600 rounded text-slate-100 
                       focus:border-blue-400 focus:outline-none transition"
                placeholder="admin"
                autocomplete="username"
                :disabled="loading"
              />
            </div>

            <!-- Password -->
            <div>
              <label 
                for="password" 
                class="block text-slate-300 text-sm font-medium mb-2 uppercase tracking-wide"
              >
                Passwort
              </label>
              <input
                id="password"
                v-model="password"
                type="password"
                class="w-full px-4 py-3 bg-slate-800 border-2 border-slate-600 rounded text-slate-100 
                       focus:border-blue-400 focus:outline-none transition"
                placeholder="••••••••••••"
                autocomplete="current-password"
                :disabled="loading"
                @keydown.enter="handleLogin"
              />
            </div>

            <!-- Submit Button -->
            <button
              type="submit"
              :disabled="loading"
              class="w-full py-3 px-6 bg-orange-500 hover:bg-orange-600 disabled:bg-slate-600 
                     text-black font-bold uppercase tracking-wider rounded transition
                     disabled:cursor-not-allowed disabled:text-slate-400"
            >
              <span v-if="loading">Anmeldung läuft...</span>
              <span v-else>Anmelden</span>
            </button>
          </form>
        </div>

        <!-- Panel Footer -->
        <div class="bg-slate-800 px-6 py-2 text-xs text-slate-500 text-center font-mono">
          STARFLEET COMMAND • LCARS 47.0
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Additional LCARS styling if needed */
</style>
