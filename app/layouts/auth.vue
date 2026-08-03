<template>
  <UApp>
    <div class="min-h-screen bg-radial from-primary/30">
      <header class="px-8 py-8 w-full flex justify-between">
        <NuxtLink to="/">
          <AppLogo />
        </NuxtLink>

        <UColorModeSelect size="lg" />
      </header>

      <UMain>
        <slot />
      </UMain>
    </div>
  </UApp>
</template>
