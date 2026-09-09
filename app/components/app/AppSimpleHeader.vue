<template>
  <header class="px-8 py-8 w-full flex justify-between">
    <NuxtLink to="/">
      <AppLogo />
    </NuxtLink>

    <ClientOnly>
      <UColorModeSelect size="lg" />
      <template #fallback>
        <div class="h-10 w-32 animate-pulse bg-gray-200 dark:bg-gray-800 rounded-md" />
      </template>
    </ClientOnly>
  </header>
</template>
