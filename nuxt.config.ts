// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    'nuxt-auth-utils',
    '@nuxt/ui',
    '@vueuse/nuxt',
    '@pinia/nuxt',
  ],

  devtools: { enabled: true },

  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    minio: {
      accessKey: process.env.MINIO_ACCESS_KEY,
      secretKey: process.env.MINIO_SECRET_KEY,
      bucket: process.env.MINIO_BUCKET,
      endpoint: process.env.MINIO_ENDPOINT,
      region: process.env.MINIO_REGION,
    },
    databaseUrl: process.env.DATABASE_URL,

    public: {
      appUrl: 'http://localhost:3000',
    },
  },

  routeRules: {
    'app/': { ssr: false },
    'app/**': { ssr: false },
    'share/**': { ssr: false },
  },

  compatibilityDate: '2025-07-15',

  eslint: {
    config: {
      stylistic: true,
    },
  },
})
