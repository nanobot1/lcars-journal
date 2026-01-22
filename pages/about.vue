<script setup>
definePageMeta({
  layout: 'default'
})

useHead({
  title: 'Über - LCARS Journal & Todo',
  meta: [
    { name: 'description', content: 'Informationen über die LCARS Journal & Todo Anwendung' }
  ]
})
</script>

<template>
  <div class="min-h-screen p-6">
    <div class="max-w-3xl mx-auto space-y-6">
      <div class="lcars-panel">
        <h1 class="text-3xl font-bold mb-4 text-lcars-orange">Über diese Anwendung</h1>
        
        <div class="space-y-4 text-slate-300">
          <p>
            <strong class="text-lcars-blue">LCARS Journal & Todo</strong> ist eine persönliche Produktivitätsanwendung 
            im Stil der Library Computer Access/Retrieval System (LCARS) Benutzeroberfläche aus Star Trek.
          </p>

          <div class="border-l-4 border-lcars-tan pl-4 my-4">
            <h2 class="text-xl font-semibold mb-2 text-lcars-tan">Features</h2>
            <ul class="list-disc list-inside space-y-1">
              <li>Journal-Einträge mit Volltext-Suche</li>
              <li>Todo-Verwaltung mit Prioritäten (Hoch/Mittel/Niedrig)</li>
              <li>Direkte Verknüpfung zwischen Journals und Todos</li>
              <li>Sortierung nach Datum, Alphabet oder Priorität</li>
              <li>Sternenzeit-Anzeige (TNG-Ära)</li>
              <li>Animierte LCARS-Oberfläche</li>
              <li>SQLite-Datenbank mit Fastify Backend</li>
            </ul>
          </div>

          <div class="border-l-4 border-lcars-blue pl-4 my-4">
            <h2 class="text-xl font-semibold mb-2 text-lcars-blue">Technologie-Stack</h2>
            <ul class="list-disc list-inside space-y-1">
              <li><strong>Frontend:</strong> Nuxt 3, Vue 3, TailwindCSS</li>
              <li><strong>Backend:</strong> Fastify, SQLite (sql.js)</li>
              <li><strong>Features:</strong> SSR, Auto-imports, Composables</li>
            </ul>
          </div>

          <div class="mt-6">
            <NuxtLink to="/" class="lcars-button inline-block">
              ← Zurück zur Hauptseite
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.lcars-panel {
  background: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01));
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 12px 30px rgba(0,0,0,0.6);
  border-left: 6px solid var(--lcars-tan);
}
</style>
