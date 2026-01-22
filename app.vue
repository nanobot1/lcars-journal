<script setup>
// Global state setup
const useStardate = useState('useStardate', () => false)
provide('useStardate', useStardate)
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
