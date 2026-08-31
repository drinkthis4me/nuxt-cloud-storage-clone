<template>
  <header class="px-8 py-8 w-full flex justify-between">
    <NuxtLink to="/">
      <AppLogo />
    </NuxtLink>

    <ClientOnly>
      <UColorModeSelect size="lg" />
    </ClientOnly>
  </header>
</template>
