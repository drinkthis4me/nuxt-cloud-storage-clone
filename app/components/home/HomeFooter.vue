<template>
  <footer class="border-t border-gray-100 bg-white">
    <div
      class="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-8 text-sm text-gray-500 sm:flex-row sm:items-center sm:justify-between lg:px-8"
    >
      <div class="font-semibold font-serif text-gray-900">
        FolderSpace
      </div>

      <div class="flex gap-6">
        <a
          href="#"
          class="hover:text-gray-900"
        >
          Privacy
        </a>
        <a
          href="#"
          class="hover:text-gray-900"
        >
          Terms
        </a>
        <a
          href="#"
          class="hover:text-gray-900"
        >
          Contact
        </a>
        <a
          href="#"
          class="hover:text-gray-900 flex items-center gap-x-1"
        >
          <Icon name="i-simple-icons-github" />GitHub
        </a>
      </div>

      <ClientOnly>
        <div>© {{ new Date().getFullYear() }} FolderSpace</div>
        <template #fallback>
          <div>FolderSpace</div>
        </template>
      </ClientOnly>
    </div>
  </footer>
</template>
