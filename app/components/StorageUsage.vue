<template>
  <div>
    <UProgress :model-value="70" />
    <div class="flex justify-end items-center gap-1 mt-1">
      <Icon
        name="i-lucide-cloud"
        size="15px"
      />
      <p class="text-end text-xs text-muted">
        7.32 of 10 GB used
      </p>
    </div>
  </div>
</template>
