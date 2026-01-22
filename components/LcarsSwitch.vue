<script setup>
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  leftLabel: {
    type: String,
    default: 'OFF'
  },
  rightLabel: {
    type: String,
    default: 'ON'
  }
})

const emit = defineEmits(['update:modelValue'])

function toggle() {
  emit('update:modelValue', !props.modelValue)
}
</script>

<template>
  <button 
    @click="toggle"
    class="lcars-switch"
    :class="{ 'active': modelValue }"
    type="button"
  >
    <span 
      class="lcars-switch-option left"
      :class="{ 'active': !modelValue }"
    >
      {{ leftLabel }}
    </span>
    <span 
      class="lcars-switch-option right"
      :class="{ 'active': modelValue }"
    >
      {{ rightLabel }}
    </span>
  </button>
</template>

<style scoped>
.lcars-switch {
  display: inline-flex;
  align-items: stretch;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 999px;
  padding: 2px;
  gap: 2px;
  border: 2px solid rgba(255, 255, 255, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
  overflow: hidden;
}

.lcars-switch:hover {
  border-color: rgba(255, 255, 255, 0.2);
}

.lcars-switch-option {
  padding: 8px 16px;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 700;
  transition: all 0.3s ease;
  color: rgba(230, 246, 255, 0.4);
  background: transparent;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.lcars-switch-option.active {
  background: linear-gradient(180deg, var(--lcars-orange), #ff8a2a);
  color: #061016;
  box-shadow: 0 4px 8px rgba(255, 122, 0, 0.3);
}

.lcars-switch-option.left.active {
  background: linear-gradient(180deg, var(--lcars-blue), #20c6ff);
  box-shadow: 0 4px 8px rgba(70, 224, 255, 0.3);
}
</style>
