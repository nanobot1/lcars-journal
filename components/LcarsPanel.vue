<script>
export default {
  name: 'LcarsPanel',
  props: {
    title: String,
    badge: String,
    color: {
      type: String,
      default: 'tan', // tan, blue, orange, pink
    },
  },
  computed: {
    borderColor() {
      const colors = {
        tan: 'border-l-[#ffd8a8]',
        blue: 'border-l-[#46e0ff]',
        orange: 'border-l-[#ff7a00]',
        pink: 'border-l-[#ff8fcf]',
      }
      return colors[this.color] || colors.tan
    },
  },
}
</script>

<template>
  <section :class="`lcars-panel ${borderColor}`">
    <div v-if="title || badge" class="flex items-center gap-3 mb-4">
      <div v-if="badge" class="lcars-pill">{{ badge }}</div>
      <h2 v-if="title" class="text-xl font-medium">{{ title }}</h2>
    </div>
    <slot></slot>
  </section>
</template>
