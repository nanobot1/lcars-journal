<script setup>
import { ref, watch, onMounted } from 'vue'

const props = defineProps({
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    default: 'info', // info, success, warning, error
    validator: (val) => ['info', 'success', 'warning', 'error'].includes(val)
  },
  duration: {
    type: Number,
    default: 3000
  }
})

const emit = defineEmits(['close'])

const visible = ref(false)
let timeoutId = null

const typeConfig = {
  info: {
    color: 'blue',
    icon: 'ℹ',
    label: 'INFO'
  },
  success: {
    color: 'blue',
    icon: '✓',
    label: 'SUCCESS'
  },
  warning: {
    color: 'orange',
    icon: '⚠',
    label: 'WARNING'
  },
  error: {
    color: 'pink',
    icon: '✕',
    label: 'ERROR'
  }
}

const config = typeConfig[props.type]

function close() {
  visible.value = false
  setTimeout(() => {
    emit('close')
  }, 300) // Wait for animation
}

onMounted(() => {
  // Trigger entrance animation
  setTimeout(() => {
    visible.value = true
  }, 10)

  // Auto-close after duration
  if (props.duration > 0) {
    timeoutId = setTimeout(() => {
      close()
    }, props.duration)
  }
})

// Cleanup
defineExpose({
  close
})
</script>

<template>
  <div 
    class="lcars-toast"
    :class="[`toast-${config.color}`, { 'toast-visible': visible }]"
    @click="close"
  >
    <div class="toast-badge">{{ config.label }}</div>
    <div class="toast-icon">{{ config.icon }}</div>
    <div class="toast-message">{{ message }}</div>
  </div>
</template>

<style scoped>
.lcars-toast {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 32px;
  background: rgba(6, 16, 22, 0.95);
  border: 2px solid;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
  cursor: pointer;
  min-width: 300px;
  max-width: 500px;
  opacity: 0;
  transform: translateX(400px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.lcars-toast.toast-visible {
  opacity: 1;
  transform: translateX(0);
}

.lcars-toast:hover {
  transform: translateX(-4px);
}

.toast-badge {
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 1px;
  padding: 4px 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.1);
  color: rgba(230, 246, 255, 0.7);
  text-transform: uppercase;
}

.toast-icon {
  font-size: 1.25rem;
  line-height: 1;
}

.toast-message {
  flex: 1;
  font-size: 0.9rem;
  color: #e6f6ff;
  font-weight: 500;
}

/* Type colors */
.toast-blue {
  border-color: var(--lcars-blue);
}

.toast-blue .toast-icon {
  color: var(--lcars-blue);
}

.toast-orange {
  border-color: var(--lcars-orange);
}

.toast-orange .toast-icon {
  color: var(--lcars-orange);
}

.toast-pink {
  border-color: var(--lcars-pink);
}

.toast-pink .toast-icon {
  color: var(--lcars-pink);
}
</style>
