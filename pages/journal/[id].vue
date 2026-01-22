<script setup>
import { ref, onMounted, inject } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { formatDate } from '~/utils/stardate'

const route = useRoute()
const router = useRouter()
const journalAPI = useJournalAPI()
const todoAPI = useTodoAPI()
const toast = useToast()

const journal = ref(null)
const todos = ref([])
const loading = ref(true)
const error = ref(null)

// Inject global stardate preference
const useStardate = inject('useStardate')

// Helper function to format dates reactively
const getFormattedDate = (dateStr) => {
  return formatDate(dateStr, useStardate?.value)
}

// Edit state
const editing = ref(false)
const editText = ref('')

// Modal state
const showTodoModal = ref(false)
const todoTexts = ref([])

async function loadJournal() {
  try {
    loading.value = true
    error.value = null
    const id = Number(route.params.id)
    
    // Load journal and its todos
    const [journalData, todosData] = await Promise.all([
      journalAPI.getById(id),
      journalAPI.getTodos(id)
    ])
    
    journal.value = journalData
    todos.value = todosData || []
    
    if (!journalData) {
      error.value = 'Journal nicht gefunden'
    }
  } catch (err) {
    error.value = err.message
    console.error('Failed to load journal:', err)
  } finally {
    loading.value = false
  }
}

function startEdit() {
  editText.value = journal.value.text
  editing.value = true
}

function cancelEdit() {
  editing.value = false
  editText.value = ''
}

async function saveEdit() {
  if (!editText.value.trim()) return
  try {
    const updated = await journalAPI.update(journal.value.id, editText.value.trim())
    journal.value.text = updated.text
    journal.value.updated_at = updated.updated_at
    editing.value = false
    toast.success('Journal-Eintrag aktualisiert')
  } catch (err) {
    error.value = err.message
    toast.error('Fehler beim Aktualisieren')
    console.error('Failed to update journal:', err)
  }
}

async function deleteJournal() {
  if (!confirm('Wirklich löschen?')) return
  try {
    await journalAPI.remove(journal.value.id)
    toast.info('Journal-Eintrag gelöscht')
    router.push('/')
  } catch (err) {
    error.value = err.message
    toast.error('Fehler beim Löschen')
    console.error('Failed to delete journal:', err)
  }
}

function openTodoModal() {
  // Split journal text into sentences/lines
  const lines = journal.value.text
    .split(/[.!?\n]+/)
    .map(l => l.trim())
    .filter(l => l.length > 0)
  todoTexts.value = lines.map(line => ({ text: line, selected: false }))
  showTodoModal.value = true
}

async function createTodosFromJournal() {
  const selected = todoTexts.value.filter(t => t.selected)
  if (selected.length === 0) {
    showTodoModal.value = false
    return
  }

  try {
    for (const item of selected) {
      await todoAPI.create(item.text, journal.value.id)
    }
    showTodoModal.value = false
    todoTexts.value = []
    
    // Reload todos
    await loadJournal()
    toast.success(`${selected.length} Todo(s) erstellt`)
  } catch (err) {
    error.value = err.message
    toast.error('Fehler beim Erstellen der Todos')
    console.error('Failed to create todos:', err)
  }
}

function goBack() {
  router.push('/')
}

onMounted(() => {
  loadJournal()
})
</script>

<template>
  <div class="container mx-auto p-4 max-w-4xl">
    <div class="mb-4">
      <LcarsButton size="small" variant="secondary" @click="goBack">
        ← Zurück zur Liste
      </LcarsButton>
    </div>

    <div v-if="loading" class="text-center py-12 text-slate-400">
      Lädt Journal-Eintrag...
    </div>

    <div v-else-if="error" class="text-center py-12">
      <div class="text-pink-400 text-lg bg-pink-900/20 p-4 rounded">
        ⚠ {{ error }}
      </div>
      <LcarsButton class="mt-4" @click="goBack">Zurück</LcarsButton>
    </div>

    <div v-else-if="journal" class="space-y-6">
      <!-- Journal Detail -->
      <LcarsPanel title="Journal-Eintrag" badge="DETAIL" color="blue">
        <div class="space-y-4">
          <div class="text-xs text-slate-400">
            Erstellt: {{ getFormattedDate(journal.created_at) }}
            <span v-if="journal.updated_at !== journal.created_at" class="ml-4">
              Aktualisiert: {{ getFormattedDate(journal.updated_at) }}
            </span>
          </div>

          <div v-if="editing" class="space-y-3">
            <textarea
              v-model="editText"
              rows="12"
              class="w-full border rounded p-3"
              @keydown.ctrl.enter="saveEdit"
            ></textarea>
            <div class="flex justify-end gap-2">
              <LcarsButton variant="secondary" @click="cancelEdit">Abbrechen</LcarsButton>
              <LcarsButton @click="saveEdit">Speichern</LcarsButton>
            </div>
          </div>

          <div v-else>
            <div class="prose prose-invert max-w-none">
              <div class="whitespace-pre-wrap text-slate-200 leading-relaxed">{{ journal.text }}</div>
            </div>

            <div class="flex gap-2 mt-6 pt-4 border-t border-white/10">
              <LcarsButton @click="openTodoModal">
                Todos erstellen
              </LcarsButton>
              <LcarsButton @click="startEdit">
                Bearbeiten
              </LcarsButton>
              <LcarsButton variant="danger" @click="deleteJournal">
                Löschen
              </LcarsButton>
            </div>
          </div>
        </div>
      </LcarsPanel>

      <!-- Associated Todos -->
      <LcarsPanel 
        v-if="todos.length > 0" 
        title="Verknüpfte Todos" 
        :badge="`${todos.length}`" 
        color="orange"
      >
        <ul class="space-y-2">
          <li
            v-for="todo in todos"
            :key="todo.id"
            class="py-2 px-3 bg-white/5 rounded border-l-4"
            :class="{
              'border-pink-400': todo.priority === 'high',
              'border-orange-400': todo.priority === 'medium',
              'border-blue-400': todo.priority === 'low'
            }"
          >
            <div class="flex items-center gap-3">
              <input
                type="checkbox"
                :checked="todo.done"
                disabled
                class="w-4 h-4"
              />
              <span class="flex-1 text-sm" :class="{ 'line-through text-slate-500': todo.done }">
                {{ todo.text }}
              </span>
              <span class="text-xs text-slate-400 uppercase">
                {{ todo.priority }}
              </span>
            </div>
          </li>
        </ul>
      </LcarsPanel>
    </div>

    <!-- Modal for creating todos -->
    <LcarsModal :show="showTodoModal" title="Todos aus Journal erstellen" @close="showTodoModal = false">
      <div class="space-y-3">
        <p class="text-sm text-slate-400">
          Wähle Zeilen/Sätze aus, die zu Todos werden sollen:
        </p>
        <div class="space-y-2 max-h-64 overflow-y-auto lcars-scrollbar">
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
          <LcarsButton variant="secondary" @click="showTodoModal = false">Abbrechen</LcarsButton>
          <LcarsButton @click="createTodosFromJournal">Todos erstellen</LcarsButton>
        </div>
      </div>
    </LcarsModal>
  </div>
</template>
