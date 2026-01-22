<script setup>
import { ref } from 'vue'

const useStardate = useState('useStardate', () => false)

// Reference to Todo component
const todoRef = ref(null)

// Handle when todos are created from journal
function handleTodosCreated() {
  if (todoRef.value) {
    todoRef.value.loadTodos()
  }
}

useHead({
  title: 'LCARS Journal & Todo',
  meta: [
    { name: 'description', content: 'Ein persönlicher Arbeitsbereich im LCARS Stil' }
  ]
})
</script>

<template>
  <div class="min-h-screen p-6">
    <div class="max-w-5xl mx-auto space-y-6">
      <header class="lcars-top">
        <div class="lcars-node">LCARS</div>
        <div class="flex-1">
          <h1 class="text-3xl font-semibold">Journal & Todo</h1>
          <p class="text-sm text-slate-300">Ein persönlicher Arbeitsbereich — LCARS Stil</p>
        </div>
        <LcarsThemeChanger />
        <NuxtLink to="/about" class="lcars-link">
          Über
        </NuxtLink>
        <LcarsSwitch 
          v-model="useStardate" 
          left-label="DATE" 
          right-label="STAR"
        />
      </header>

      <main class="grid gap-6 md:grid-cols-2">
        <Journal @todos-created="handleTodosCreated" />
        <Todo ref="todoRef" />
      </main>
    </div>
  </div>
</template>

<style scoped>
.lcars-top { gap: 16px }

.lcars-link {
  font-size: 0.75rem;
  padding: 0.5rem 0.75rem;
  color: var(--lcars-tan);
  transition: all 0.2s ease;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.lcars-link:hover {
  color: var(--lcars-blue);
  text-shadow: 0 0 8px var(--lcars-blue);
}
</style>
