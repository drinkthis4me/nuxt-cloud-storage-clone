<script setup lang="ts">
definePageMeta({
  layout: 'auth',
  middleware: 'guest',
})
</script>

<template>
  <div class="">
    <UContainer>
      <div class="flex justify-center items-center">
        <FormLogIn />
      </div>
    </UContainer>
  </div>
</template>
