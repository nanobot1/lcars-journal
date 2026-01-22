<script setup>
import { ref, computed, onMounted, inject } from 'vue'
import { formatDate } from '~/utils/stardate'

const todoAPI = useTodoAPI()
const toast = useToast()

// Expose loadTodos function to parent
defineExpose({
  loadTodos
})

const items = ref([])
const newText = ref('')
const newPriority = ref('medium')
const searchQuery = ref('')
const loading = ref(false)
const error = ref(null)
const activeTab = ref('all')

// Inject global stardate preference
const useStardate = inject('useStardate')

// Helper function to format dates reactively
const getFormattedDate = (dateStr) => {
  return formatDate(dateStr, useStardate?.value)
}

// Edit state
const editingId = ref(null)
const editText = ref('')

// Sort state
const sortBy = ref('date-desc') // date-desc, date-asc, alpha-asc, alpha-desc, priority

// Delete animation state
const deletingIds = ref(new Set())

const tabs = [
  { label: 'Alle', value: 'all' },
  { label: 'Offen', value: 'open' },
  { label: 'Erledigt', value: 'done' },
  { label: 'Aus Journals', value: 'journal' },
]

async function loadTodos() {
  try {
    loading.value = true
    error.value = null
    const data = await todoAPI.getAll()
    items.value = data || []
  } catch (err) {
    error.value = err.message
    console.error('Failed to load todos:', err)
    items.value = []
  } finally {
    loading.value = false
  }
}

async function addItem() {
  if (!newText.value.trim()) return
  if (loading.value) return // Prevent duplicate requests
  try {
    loading.value = true
    const newItem = await todoAPI.create(newText.value.trim(), null, newPriority.value)
    items.value.unshift(newItem)
    newText.value = ''
    newPriority.value = 'medium'
    toast.success('Todo erstellt')
  } catch (err) {
    error.value = err.message
    toast.error('Fehler beim Erstellen des Todos')
    console.error('Failed to create todo:', err)
  } finally {
    loading.value = false
  }
}

async function toggle(id) {
  const item = items.value.find((i) => i.id === id)
  if (!item) return
  try {
    const updated = await todoAPI.update(id, { done: !item.done })
    Object.assign(item, updated)
    toast.info(updated.done ? 'Todo abgeschlossen' : 'Todo wiedereröffnet')
  } catch (err) {
    error.value = err.message
    toast.error('Fehler beim Aktualisieren des Todos')
    console.error('Failed to toggle todo:', err)
  }
}

async function removeItem(id) {
  // Prevent duplicate calls - check and add IMMEDIATELY
  if (deletingIds.value.has(id)) {
    return
  }
  deletingIds.value.add(id)
  
  try {
    // Wait for animation to complete
    await new Promise(resolve => setTimeout(resolve, 300))
    await todoAPI.remove(id)
    items.value = items.value.filter((i) => i.id !== id)
    toast.info('Todo gelöscht')
  } catch (err) {
    error.value = err.message
    toast.error('Fehler beim Löschen des Todos')
    console.error('Failed to delete todo:', err)
  } finally {
    deletingIds.value.delete(id)
  }
}

function startEdit(item) {
  editingId.value = item.id
  editText.value = item.text
}

function cancelEdit() {
  editingId.value = null
  editText.value = ''
}

async function saveEdit() {
  if (!editText.value.trim()) return
  try {
    const updated = await todoAPI.update(editingId.value, { text: editText.value.trim() })
    const item = items.value.find(i => i.id === editingId.value)
    if (item) {
      item.text = updated.text
      item.updated_at = updated.updated_at
    }
    cancelEdit()
    toast.success('Todo aktualisiert')
  } catch (err) {
    error.value = err.message
    toast.error('Fehler beim Aktualisieren des Todos')
    console.error('Failed to update todo:', err)
  }
}

async function changePriority(id, priority) {
  const item = items.value.find((i) => i.id === id)
  if (!item) return
  try {
    const updated = await todoAPI.update(id, { priority })
    Object.assign(item, updated)
    const priorityLabels = { high: 'Hoch', medium: 'Mittel', low: 'Niedrig' }
    toast.info(`Priorität geändert: ${priorityLabels[priority]}`)
  } catch (err) {
    error.value = err.message
    toast.error('Fehler beim Ändern der Priorität')
    console.error('Failed to update priority:', err)
  }
}

function getPriorityColor(priority) {
  switch (priority) {
    case 'high': return 'border-pink-500'
    case 'medium': return 'border-orange-400'
    case 'low': return 'border-blue-400'
    default: return 'border-orange-400'
  }
}

const filteredItems = computed(() => {
  let filtered = items.value || []
  
  // Filter by tab
  switch (activeTab.value) {
    case 'open':
      filtered = filtered.filter((i) => !i.done)
      break
    case 'done':
      filtered = filtered.filter((i) => i.done)
      break
    case 'journal':
      filtered = filtered.filter((i) => i.journal_id !== null)
      break
  }
  
  // Filter by search query
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter((i) => i.text.toLowerCase().includes(query))
  }
  
  // Sort
  const sorted = [...filtered]
  switch (sortBy.value) {
    case 'date-asc':
      sorted.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
      break
    case 'date-desc':
      sorted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      break
    case 'alpha-asc':
      sorted.sort((a, b) => (a.text || '').localeCompare(b.text || ''))
      break
    case 'alpha-desc':
      sorted.sort((a, b) => (b.text || '').localeCompare(a.text || ''))
      break
    case 'priority':
      const priorityOrder = { high: 0, medium: 1, low: 2 }
      sorted.sort((a, b) => priorityOrder[a.priority || 'medium'] - priorityOrder[b.priority || 'medium'])
      break
  }
  
  return sorted
})

const remaining = computed(() => (items.value || []).filter((i) => !i.done).length)

onMounted(() => {
  loadTodos()
})
</script>

<template>
  <LcarsPanel title="Aufgaben" badge="TODO" color="orange">
    <div class="space-y-3">
      <div class="flex gap-2">
        <input
          v-model="newText"
          type="text"
          class="flex-1 border rounded p-2"
          placeholder="Neue Aufgabe..."
          @keyup.enter="addItem"
        />
        <select v-model="newPriority" class="border rounded p-2 bg-slate-800 text-slate-200">
          <option value="high">Hoch</option>
          <option value="medium">Mittel</option>
          <option value="low">Niedrig</option>
        </select>
        <LcarsButton @click="addItem">Add</LcarsButton>
      </div>

      <div class="flex justify-between items-center">
        <div class="text-xs text-slate-400">Verbleibend: {{ remaining }}</div>
      </div>

      <div v-if="error" class="text-pink-400 text-sm bg-pink-900/20 p-2 rounded">
        ⚠ {{ error }}
      </div>

      <div v-if="loading" class="text-center py-4 text-slate-400">Lädt...</div>

      <LcarsTabs v-model="activeTab" :tabs="tabs" />

      <!-- Search bar -->
      <div class="space-y-2">
        <div class="flex gap-2">
          <input
            v-model="searchQuery"
            type="text"
            class="flex-1 border rounded p-2"
            placeholder="🔍 Todos durchsuchen..."
          />
          <select v-model="sortBy" class="border rounded p-2 bg-slate-800 text-slate-200">
            <option value="date-desc">Neueste zuerst</option>
            <option value="date-asc">Älteste zuerst</option>
            <option value="alpha-asc">A → Z</option>
            <option value="alpha-desc">Z → A</option>
            <option value="priority">Priorität</option>
          </select>
        </div>
        <small v-if="searchQuery" class="text-xs text-slate-400 block">
          {{ filteredItems.length }} gefunden
        </small>
      </div>

      <ul class="space-y-2 mt-4 max-h-96 overflow-y-auto lcars-scrollbar pr-2">
        <li
          v-for="it in filteredItems"
          :key="it.id"
          class="py-2 px-3 bg-white/5 rounded-lg border-l-4"
          :class="[getPriorityColor(it.priority), deletingIds.has(it.id) ? 'lcars-slide-out' : 'lcars-animate']"
        >
          <div v-if="editingId === it.id" class="space-y-2">
            <input
              v-model="editText"
              type="text"
              class="w-full border rounded p-2"
              @keydown.enter="saveEdit"
            />
            <div class="flex justify-end gap-2">
              <LcarsButton size="small" variant="secondary" @click="cancelEdit">Abbrechen</LcarsButton>
              <LcarsButton size="small" @click="saveEdit">Speichern</LcarsButton>
            </div>
          </div>
          <div v-else class="flex items-center justify-between gap-3">
            <label class="flex items-center gap-3 flex-1 cursor-pointer">
              <input type="checkbox" :checked="it.done" @change="toggle(it.id)" class="w-4 h-4" />
              <div class="flex-1">
                <span :class="{ 'line-through text-slate-500': it.done }">
                  {{ it.text }}
                </span>
                <div class="text-xs text-slate-500 mt-0.5">
                  {{ getFormattedDate(it.created_at) }}
                </div>
              </div>
              <span v-if="it.journal_id" class="lcars-badge">J-{{ it.journal_id }}</span>
            </label>
            <div class="flex items-center gap-2">
              <select
                :value="it.priority || 'medium'"
                @change="changePriority(it.id, $event.target.value)"
                class="text-xs border rounded px-1 py-0.5 bg-slate-800 text-slate-200"
              >
                <option value="high">Hoch</option>
                <option value="medium">Mittel</option>
                <option value="low">Niedrig</option>
              </select>
              <LcarsButton size="small" @click="startEdit(it)">
                Edit
              </LcarsButton>
              <LcarsButton size="small" variant="secondary" @click="removeItem(it.id)">
                Löschen
              </LcarsButton>
            </div>
          </div>
        </li>
      </ul>

      <div v-if="filteredItems.length === 0 && !loading" class="text-center py-8 text-slate-500">
        <span v-if="searchQuery">Keine Todos gefunden für "{{ searchQuery }}"</span>
        <span v-else>Keine Todos {{ activeTab === 'open' ? 'offen' : activeTab === 'done' ? 'erledigt' : activeTab === 'journal' ? 'aus Journals' : '' }}</span>
      </div>
    </div>
  </LcarsPanel>
</template>
