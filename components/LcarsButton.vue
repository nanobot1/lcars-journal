<script>
export default {
  name: 'LcarsButton',
  props: {
    variant: {
      type: String,
      default: 'primary', // primary (orange), secondary (blue), danger (pink)
    },
    size: {
      type: String,
      default: 'medium', // small, medium, large
    },
    pill: {
      type: Boolean,
      default: true,
    },
  },
  computed: {
    classes() {
      const base = 'lcars-button font-bold transition-all duration-150 active:scale-95 cursor-pointer'
      const variants = {
        primary: '',
        secondary: 'secondary',
        danger: 'bg-gradient-to-b from-pink-400 to-pink-500',
      }
      const sizes = {
        small: 'lcars-small',
        medium: 'px-4 py-2 text-sm',
        large: 'px-6 py-3 text-base',
      }
      return `${base} ${variants[this.variant] || ''} ${sizes[this.size] || ''}`
    },
  },
}
</script>

<template>
  <button :class="classes" @click="$emit('click', $event)">
    <slot></slot>
  </button>
</template>
