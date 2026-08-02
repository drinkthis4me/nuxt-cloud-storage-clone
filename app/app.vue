<script setup lang="ts">
const { form: userForm, login } = useAppLogin()

const files = shallowRef<File[]>([])

const handleFileSelect = (e: Event) => {
  const input = e.target as HTMLInputElement
  const filesAsArray = Array.from(input?.files || [])
  files.value = files.value.concat(filesAsArray)
}

const { upload } = useAppFileUpload()
const onSubmit = async (e: SubmitEvent) => {
  console.log(e)
  for (const file of files.value) {
    console.log(file)
    await upload(file)
  }
}
</script>

<template>
  <div>
    <form
      class="border p-4"
      @submit.prevent="login"
    >
      <h1 class="text-xl">
        Login
      </h1>
      <label for="email">Email</label>
      <input
        id="email"
        v-model="userForm.email"
        type="text"
      >
      <label for="password">Password</label>
      <input
        id="password"
        v-model="userForm.password"
        type="password"
      >
      <button type="submit">
        Login
      </button>
    </form>

    <form
      class="border p-4"
      @submit.prevent="onSubmit"
    >
      <h1 class="text-lx">
        Upload
      </h1>
      <label for="file">Choose a file:</label>

      <input
        id="file"
        type="file"
        name="file"
        accept="text/plain"
        @change="handleFileSelect"
      >

      <button
        type="submit"
        :disabled="files.length === 0"
      >
        Submit
      </button>
    </form>

    <div>
      <div
        v-for="(file, idx) of files"
        :key="idx"
      >
        <p>Name: {{ file.name }}</p>
        <p>Type: {{ file.type }}</p>
      </div>
    </div>
  </div>
</template>
