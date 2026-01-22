<script>
export default {
  name: 'LcarsTabs',
  props: {
    tabs: {
      type: Array,
      required: true, // [{ label: 'Tab 1', value: 'tab1' }, ...]
    },
    modelValue: {
      type: String,
      required: true,
    },
  },
  emits: ['update:modelValue'],
}
</script>

<template>
  <div class="flex gap-2 mb-4 flex-wrap">
    <button
      v-for="tab in tabs"
      :key="tab.value"
      :class="[
        'lcars-button',
        'lcars-small',
        modelValue === tab.value ? '' : 'secondary opacity-60',
      ]"
      @click="$emit('update:modelValue', tab.value)"
    >
      {{ tab.label }}
    </button>
  </div>
</template>
