<script setup lang="ts">
</script>

<template>
  <header class="flex items-center justify-between p-4 border-b border-default">
    <NuxtLink to="/app">
      <AppLogo />
    </NuxtLink>

    <AppSearchbar class="w-1/2 mx-10" />

    <AppAvatar />
  </header>
</template>
