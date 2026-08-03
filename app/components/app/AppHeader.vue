<script setup lang="ts">
const { user } = useUserSession()
</script>

<template>
  <header class="flex items-center justify-between p-4 border-b border-default">
    <AppLogo />

    <AppSearchbar class="w-1/2 mx-10" />

    <AppAvatar
      v-if="user"
      :user
    />
  </header>
</template>
