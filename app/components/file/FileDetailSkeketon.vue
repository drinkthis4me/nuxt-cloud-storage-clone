<template>
  <div class="flex justify-center">
    <div class="w-full max-w-120 flex flex-col gap-4 p-8 border border-gray-500 rounded-xl">
      <div class="flex justify-end">
        <div class="h-5 w-5" />
      </div>

      <div class="flex justify-center">
        <div class="w-[12em] h-[12em]">
          <USkeleton class="h-full" />
        </div>
      </div>

      <div class="mt-2 flex justify-center">
        <USkeleton class="h-5 w-40" />
      </div>

      <div>
        <UButton
          size="xl"
          block
          loading
        />
      </div>
    </div>
  </div>
</template>
