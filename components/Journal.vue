<script setup>
import { ref, computed, onMounted, inject } from 'vue'
import { formatDate } from '~/utils/stardate'

const emit = defineEmits(['todos-created'])

const journalAPI = useJournalAPI()
const todoAPI = useTodoAPI()
const toast = useToast()

const entries = ref([])
const text = ref('')
const searchQuery = ref('')
const loading = ref(false)
const error = ref(null)

// Inject global stardate preference
const useStardate = inject('useStardate')

// Helper function to format dates reactively
const getFormattedDate = (dateStr) => {
  return formatDate(dateStr, useStardate?.value)
}
// Modal state
const showModal = ref(false)
const selectedEntry = ref(null)
const todoTexts = ref([])

// Edit state
const editingId = ref(null)
const editText = ref('')

// Sort state
const sortBy = ref('date-desc') // date-desc, date-asc, alpha-asc, alpha-desc

// Delete animation state
const deletingIds = ref(new Set())

async function loadEntries() {
  try {
    loading.value = true
    error.value = null
    const data = await journalAPI.getAll()
    entries.value = data || []
  } catch (err) {
    error.value = err.message
    console.error('Failed to load journals:', err)
    entries.value = []
  } finally {
    loading.value = false
  }
}

async function addEntry() {
  if (!text.value.trim()) return
  if (loading.value) return // Prevent duplicate requests
  try {
    loading.value = true
    const newEntry = await journalAPI.create(text.value.trim())
    entries.value.unshift(newEntry)
    text.value = ''
    toast.success('Journal-Eintrag erstellt')
  } catch (err) {
    error.value = err.message
    toast.error('Fehler beim Erstellen des Eintrags')
    console.error('Failed to create journal:', err)
  } finally {
    loading.value = false
  }
}

async function removeEntry(id) {
  // Prevent duplicate calls - check and add IMMEDIATELY
  if (deletingIds.value.has(id)) {
    return
  }
  deletingIds.value.add(id)
  
  try {
    // Wait for animation to complete
    await new Promise(resolve => setTimeout(resolve, 300))
    await journalAPI.remove(id)
    entries.value = entries.value.filter((e) => e.id !== id)
    toast.info('Journal-Eintrag gelöscht')
  } catch (err) {
    error.value = err.message
    toast.error('Fehler beim Löschen des Eintrags')
    console.error('Failed to delete journal:', err)
  } finally {
    deletingIds.value.delete(id)
  }
}

function startEdit(entry) {
  editingId.value = entry.id
  editText.value = entry.text
}

function cancelEdit() {
  editingId.value = null
  editText.value = ''
}
async function saveEdit() {
  if (!editText.value.trim()) return
  try {
    const updated = await journalAPI.update(editingId.value, editText.value.trim())
    const entry = entries.value.find(e => e.id === editingId.value)
    if (entry) {
      entry.text = updated.text
      entry.updated_at = updated.updated_at
    }
    cancelEdit()
    toast.success('Journal-Eintrag aktualisiert')
  } catch (err) {
    error.value = err.message
    toast.error('Fehler beim Aktualisieren des Eintrags')
    console.error('Failed to update journal:', err)
  }
}

function openTodoModal(entry) {
  selectedEntry.value = entry
  // Split entry text into sentences/lines
  const lines = entry.text
    .split(/[.!?\n]+/)
    .map(l => l.trim())
    .filter(l => l.length > 0)
  todoTexts.value = lines.map(line => ({ text: line, selected: false }))
  showModal.value = true
}

async function createTodosFromEntry() {
  if (!selectedEntry.value) return
  if (loading.value) return // Prevent duplicate requests
  const selected = todoTexts.value.filter(t => t.selected)
  if (selected.length === 0) {
    showModal.value = false
    return
  }

  try {
    loading.value = true
    for (const item of selected) {
      await todoAPI.create(item.text, selectedEntry.value.id)
    }
    showModal.value = false
    selectedEntry.value = null
    todoTexts.value = []
    
    // Emit event to notify parent that todos were created
    emit('todos-created')
    toast.success(`${selected.length} Todo(s) erstellt`)
  } catch (err) {
    error.value = err.message
    toast.error('Fehler beim Erstellen der Todos')
    console.error('Failed to create todos:', err)
  } finally {
    loading.value = false
  }
}

const filteredEntries = computed(() => {
  let result = entries.value || []
  
  // Filter by search
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(entry => 
      entry.text.toLowerCase().includes(query)
    )
  }
  
  // Sort
  const sorted = [...result]
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
  }
  
  return sorted
})

onMounted(() => {
  loadEntries()
})</script>

<template>
  <LcarsPanel title="Persönliche Einträge" badge="JOURNAL" color="blue">
    <div class="space-y-3">
      <textarea
        v-model="text"
        rows="4"
        class="w-full border rounded p-2"
        placeholder="Neuer Eintrag..."
        @keydown.ctrl.enter="addEntry"
      ></textarea>
      <div class="flex justify-between items-center">
        <small class="text-xs text-slate-400">Speichert in lokaler DB (Strg+Enter)</small>
        <LcarsButton @click="addEntry">Hinzufügen</LcarsButton>
      </div>

      <!-- Search bar -->
      <div class="pt-2 space-y-2">
        <div class="flex gap-2">
          <input
            v-model="searchQuery"
            type="text"
            class="flex-1 border rounded p-2"
            placeholder="🔍 Einträge durchsuchen..."
          />
          <select v-model="sortBy" class="border rounded p-2 bg-slate-800 text-slate-200">
            <option value="date-desc">Neueste zuerst</option>
            <option value="date-asc">Älteste zuerst</option>
            <option value="alpha-asc">A → Z</option>
            <option value="alpha-desc">Z → A</option>
          </select>
        </div>
        <small v-if="searchQuery" class="text-xs text-slate-400 block">
          {{ filteredEntries.length }} von {{ entries.length }} Einträgen
        </small>
      </div>

      <div v-if="error" class="text-pink-400 text-sm bg-pink-900/20 p-2 rounded">
        ⚠ {{ error }}
      </div>

      <div v-if="loading" class="text-center py-4 text-slate-400">Lädt...</div>

      <ul class="space-y-2 mt-4 max-h-96 overflow-y-auto lcars-scrollbar pr-2">
        <li
          v-for="entry in filteredEntries"
          :key="entry.id"
          class="py-3 px-3 bg-white/5 rounded-lg border-l-4 border-blue-400"
          :class="deletingIds.has(entry.id) ? 'lcars-slide-out' : 'lcars-animate'"
        >
          <div v-if="editingId === entry.id" class="space-y-2">
            <textarea
              v-model="editText"
              rows="4"
              class="w-full border rounded p-2"
              @keydown.ctrl.enter="saveEdit"
            ></textarea>
            <div class="flex justify-end gap-2">
              <LcarsButton size="small" variant="secondary" @click="cancelEdit">Abbrechen</LcarsButton>
              <LcarsButton size="small" @click="saveEdit">Speichern</LcarsButton>
            </div>
          </div>
          <div v-else class="flex justify-between items-start gap-3">
            <div class="flex-1">
              <div class="text-xs text-slate-400 mb-1">
                {{ getFormattedDate(entry.created_at) }}
              </div>
              <div class="text-sm whitespace-pre-wrap">{{ entry.text }}</div>
            </div>
            <div class="flex gap-2">
              <LcarsButton size="small" variant="secondary" @click="openTodoModal(entry)">
                Todos
              </LcarsButton>
              <LcarsButton size="small" @click="startEdit(entry)">
                Bearbeiten
              </LcarsButton>
              <LcarsButton size="small" variant="danger" @click="removeEntry(entry.id)">
                Löschen
              </LcarsButton>
            </div>
          </div>
        </li>
      </ul>

      <div v-if="filteredEntries.length === 0 && !loading && searchQuery" class="text-center py-8 text-slate-500">
        Keine Einträge gefunden für "{{ searchQuery }}"
      </div>
    </div>

    <!-- Modal for creating todos -->
    <LcarsModal :show="showModal" title="Todos aus Journal erstellen" @close="showModal = false">
      <div class="space-y-3">
        <p class="text-sm text-slate-400">
          Wähle Zeilen/Sätze aus, die zu Todos werden sollen:
        </p>
        <div class="space-y-2 max-h-64 overflow-y-auto">
          <label
            v-for="(item, idx) in todoTexts"
            :key="idx"
            class="flex items-start gap-3 p-2 rounded bg-white/5 cursor-pointer hover:bg-white/10 transition"
          >
            <input type="checkbox" v-model="item.selected" class="mt-1 w-4 h-4" />
            <span class="text-sm flex-1">{{ item.text }}</span>
          </label>
        </div>
        <div class="flex justify-end gap-2 mt-4">
          <LcarsButton variant="secondary" @click="showModal = false">Abbrechen</LcarsButton>
          <LcarsButton @click="createTodosFromEntry">Todos erstellen</LcarsButton>
        </div>
      </div>
    </LcarsModal>
  </LcarsPanel>
</template>
