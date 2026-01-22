<script>
export default {
  name: 'LcarsModal',
  props: {
    show: {
      type: Boolean,
      default: false,
    },
    title: {
      type: String,
      default: '',
    },
  },
  emits: ['close'],
}
</script>

<template>
  <Teleport to="body">
    <Transition name="lcars-modal">
      <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center lcars-modal-overlay" @click.self="$emit('close')">
        <div class="lcars-modal bg-gradient-to-b from-slate-900 to-slate-950 rounded-lg max-w-2xl w-full mx-4 p-6 shadow-2xl">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-3">
              <div class="lcars-pill">MODAL</div>
              <h3 class="text-2xl font-bold">{{ title }}</h3>
            </div>
            <button @click="$emit('close')" class="lcars-button lcars-small secondary">Schließen</button>
          </div>
          <div class="modal-content">
            <slot></slot>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.lcars-modal-enter-active,
.lcars-modal-leave-active {
  transition: opacity 0.3s ease;
}

.lcars-modal-enter-from,
.lcars-modal-leave-to {
  opacity: 0;
}

.lcars-modal-enter-active .lcars-modal,
.lcars-modal-leave-active .lcars-modal {
  transition: transform 0.3s ease;
}

.lcars-modal-enter-from .lcars-modal {
  transform: scale(0.9) translateY(-20px);
}

.lcars-modal-leave-to .lcars-modal {
  transform: scale(0.9) translateY(20px);
}
</style>
