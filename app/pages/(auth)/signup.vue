<script setup lang="ts">
definePageMeta({
  layout: 'auth',
  middleware: 'guest',
})

const benefits = [
  {
    icon: 'i-lucide-shield',
    title: 'Open source and audited',
  },
  {
    icon: 'i-lucide-monitor-smartphone',
    title: 'Works on all devices',
  },
  {
    icon: 'i-lucide-cloud',
    title: 'Free with 10 GB storage',
  },
  {
    icon: 'i-lucide-handshake',
    title: 'Collaboration by file sharing',
  },
]
</script>

<template>
  <div class="">
    <UContainer>
      <div class="flex justify-center">
        <FormSignUp class="w-screen md:w-xl lg:w-lg lg:rounded-r-none" />

        <div class="hidden lg:flex flex-col justify-between max-w-87.5 p-10 border border-l-0 border-accented rounded-r-xl bg-white dark:bg-neutral-900">
          <h1 class="text-xl font-bold">
            FolderSpace benefits
          </h1>
          <div class="flex flex-col gap-2 mt-4">
            <p
              v-for="benefit of benefits"
              :key="benefit.title"
            >
              <UIcon
                :name="benefit.icon"
                class="mr-2 text-primary"
              />
              {{ benefit.title }}
            </p>
          </div>

          <p>Join now with people who have chosen FolderSpace to share files online.</p>
        </div>
      </div>
    </UContainer>
  </div>
</template>
