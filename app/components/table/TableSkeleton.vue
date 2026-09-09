<template>
  <div class="w-full border border-accented rounded-lg overflow-hidden shadow-lg p-4 flex flex-col gap-4 bg-default">
    <div class="flex items-center justify-between pb-3 border-b border-accented">
      <USkeleton class="h-5 w-56" />
      <USkeleton class="h-5 w-32 hidden md:block" />
      <USkeleton class="h-5 w-12 hidden md:block" />
      <USkeleton class="h-5 w-20 hidden lg:block" />
    </div>

    <div class="flex flex-col divide-y divide-accented">
      <div
        v-for="i in 5"
        :key="i"
        class="flex items-center justify-between py-3"
      >
        <div class="flex items-center gap-3">
          <USkeleton class="h-8 w-8 rounded-full" />
          <USkeleton class="h-4 w-48" />
        </div>
        <USkeleton class="h-4 w-32 hidden md:block" />
        <USkeleton class="h-4 w-12 hidden md:block" />
        <USkeleton class="h-4 w-20 rounded-md hidden lg:block" />
      </div>
    </div>
  </div>
</template>
