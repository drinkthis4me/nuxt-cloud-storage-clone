<script setup lang="ts">
const recentFiles = [
  {
    name: 'Project Proposal.pdf',
    type: 'PDF',
    size: '2.4 MB',
  },
  {
    name: 'Brand Guidelines.fig',
    type: 'FIG',
    size: '8.1 MB',
  },
  {
    name: 'Presentation.pptx',
    type: 'PPT',
    size: '12.6 MB',
  },
]

const companies = [
  'Midnight Lighting',
  'Elite Navigations',
  'Fjord Media',
  'Ansoft',
  'Cruxolutions',
  'Allico',
  'Berrycords',
  'Hogair',
  'Amazonfruit',
  'Smartpoly',
]

const features = [
  {
    icon: '☁️',
    title: 'Store everything',
    description:
      'Keep your documents, photos, videos, and important files securely in one place.',
  },
  {
    icon: '🔗',
    title: 'Share instantly',
    description:
      'Create secure links and share files with your team, clients, or friends in seconds.',
  },
  {
    icon: '🔒',
    title: 'Private & secure',
    description:
      'Your files are protected with encryption and granular access controls.',
  },
]

const plans = [
  {
    name: 'Free',
    description: 'For getting started with cloud storage.',
    price: '$0',
    period: 'forever',
    button: 'Get started',
    highlighted: false,
    features: [
      '10 GB storage',
      'File & folder sharing',
      'Access from any device',
      'Basic file previews',
    ],
  },
  {
    name: 'Plus',
    description: 'For people who need more space and flexibility.',
    price: '$8',
    period: 'per month',
    button: 'Start free trial',
    highlighted: true,
    features: [
      '1 TB storage',
      'Unlimited file sharing',
      'Advanced sharing controls',
      'File version history',
      'Priority support',
    ],
  },
  {
    name: 'Business',
    description: 'For teams that need secure shared storage.',
    price: '$18',
    period: 'per user / month',
    button: 'Start free trial',
    highlighted: false,
    features: [
      '5 TB storage per user',
      'Team shared folders',
      'Advanced permissions',
      'Admin dashboard',
      'Audit logs',
      'Priority support',
    ],
  },
]
</script>

<template>
  <div class="min-h-screen bg-white text-gray-900">
    <!-- Hero -->
    <section class="relative overflow-hidden">
      <div
        class="mx-auto grid max-w-7xl items-center gap-16 px-6 py-10 lg:grid-cols-2 lg:px-8"
      >
        <!-- Hero copy -->
        <div>
          <div
            class="mb-6 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm text-gray-600"
          >
            <span class="h-2 w-2 rounded-full bg-green-500" />
            Your files, everywhere
          </div>

          <h1
            class="max-w-2xl text-5xl font-bold tracking-tight text-gray-950 sm:text-6xl"
          >
            All your files.
            <span class="text-gray-400"> One simple place. </span>
          </h1>

          <p class="mt-6 max-w-xl text-lg leading-8 text-gray-600">
            Store, organize, and share your files securely from anywhere.
            FolderSpace gives you everything you need to keep your digital life
            organized.
          </p>

          <div class="mt-8 flex flex-wrap gap-4">
            <NuxtLink
              class="rounded-xl bg-blue-500 px-6 py-3.5 text-lg font-semibold text-white shadow-lg shadow-gray-900/10 transition hover:-translate-y-0.5 hover:bg-blue-400"
              to="/signup"
            >
              Start for free
              <span class="ml-2">→</span>
            </NuxtLink>

            <button
              class="rounded-xl border border-gray-200 px-6 py-3.5 text-lg font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              See how it works
            </button>
          </div>

          <div class="mt-8 flex items-center gap-6 text-sm text-gray-500">
            <span>✓ No credit card</span>
            <span>✓ 10 GB free</span>
          </div>
        </div>

        <!-- Product preview -->
        <div class="relative">
          <div
            class="absolute -inset-6 rounded-4xl bg-linear-to-br from-gray-100 via-white to-gray-500 blur-2xl"
          />

          <div
            class="relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl shadow-gray-900/10"
          >
            <!-- Fake app header -->
            <div
              class="flex items-center justify-between border-b border-gray-100 px-5 py-4"
            >
              <div class="flex items-center gap-2">
                <div class="h-2.5 w-2.5 rounded-full bg-red-500" />
                <div class="h-2.5 w-2.5 rounded-full bg-amber-400" />
                <div class="h-2.5 w-2.5 rounded-full bg-green-500" />
              </div>

              <div class="h-2 w-24 rounded-full bg-gray-100" />
            </div>

            <div class="flex">
              <!-- Sidebar -->
              <aside
                class="hidden w-40 border-r border-gray-100 p-4 sm:block"
              >
                <button
                  class="mb-6 w-full rounded-lg bg-gray-900 px-3 py-2 text-xs font-medium text-white"
                >
                  + Upload
                </button>

                <div class="space-y-2">
                  <div
                    class="rounded-lg bg-gray-100 px-3 py-2 text-xs font-medium"
                  >
                    All files
                  </div>
                  <div class="px-3 py-2 text-xs text-gray-400">
                    Recent
                  </div>
                  <div class="px-3 py-2 text-xs text-gray-400">
                    Shared
                  </div>
                  <div class="px-3 py-2 text-xs text-gray-400">
                    Favorites
                  </div>
                </div>
              </aside>

              <!-- Files -->
              <div class="min-w-0 flex-1 p-5">
                <div class="mb-5 flex items-center justify-between">
                  <div>
                    <div class="text-sm font-semibold">
                      My Files
                    </div>
                    <div class="mt-1 text-xs text-gray-400">
                      128 files
                    </div>
                  </div>
                </div>

                <div class="grid grid-cols-2 gap-3">
                  <div
                    v-for="file in recentFiles"
                    :key="file.name"
                    class="rounded-xl border border-gray-100 p-3 transition hover:border-gray-200 hover:shadow-sm"
                  >
                    <div
                      class="mb-4 flex h-20 items-center justify-center rounded-lg bg-gray-50 text-2xl"
                    >
                      📄
                    </div>

                    <div class="truncate text-xs font-semibold">
                      {{ file.name }}
                    </div>

                    <div class="mt-1 text-[11px] text-gray-400">
                      {{ file.type }} · {{ file.size }}
                    </div>
                  </div>
                </div>

                <!-- Storage -->
                <div class="mt-5 rounded-xl bg-gray-50 p-4">
                  <div class="flex justify-between text-xs">
                    <span class="font-medium"> Storage </span>

                    <span class="text-gray-500"> 6.4 GB / 10 GB </span>
                  </div>

                  <div
                    class="mt-2 h-2 overflow-hidden rounded-full bg-gray-200"
                  >
                    <div class="h-full w-[64%] rounded-full bg-gray-900" />
                  </div>

                  <div class="mt-2 text-[11px] text-gray-400">
                    3.6 GB remaining
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Logos / trust -->
    <section class="border-y border-gray-100 bg-gray-50/50">
      <div class="mx-auto max-w-7xl px-6 py-8 lg:px-8">
        <p
          class="text-center text-xs font-medium uppercase tracking-widest text-gray-400"
        >
          Trusted by teams who value their files
        </p>

        <div class="relative mt-6 overflow-hidden">
          <!-- Fade edges -->
          <div class="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 bg-linear-to-r from-gray-50/90 to-transparant" />
          <div class="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-linear-to-l from-gray-50/90 to-transparant" />

          <!-- Marquee -->
          <div class="marquee flex w-max">
            <div class="flex items-center gap-12 pr-12">
              <span
                v-for="company in companies"
                :key="company"
                class="text-sm font-semibold text-gray-400"
              >
                {{ company }}
              </span>
            </div>
            <div
              class="flex items-center gap-12 pr-12"
              aria-hidden="true"
            >
              <span
                v-for="company in companies"
                :key="company"
                class="text-sm font-semibold text-gray-400"
              >
                {{ company }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features -->
    <section
      id="features"
      class="py-24 lg:py-32"
    >
      <div class="mx-auto max-w-7xl px-6 lg:px-8">
        <div class="mx-auto max-w-2xl text-center">
          <p class="text-sm font-semibold text-gray-500 uppercase">
            Everything you need
          </p>

          <h2 class="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            A better way to manage your files
          </h2>

          <p class="mt-4 text-lg text-gray-600">
            Simple enough for everyday use. Powerful enough for your entire
            team.
          </p>
        </div>

        <div class="mt-16 grid gap-6 md:grid-cols-3">
          <article
            v-for="feature in features"
            :key="feature.title"
            class="rounded-2xl border border-gray-200 p-8 transition hover:-translate-y-1 hover:shadow-xl hover:shadow-gray-900/5"
          >
            <div
              class="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 text-xl"
            >
              {{ feature.icon }}
            </div>

            <h3 class="mt-6 text-lg font-semibold">
              {{ feature.title }}
            </h3>

            <p class="mt-3 leading-7 text-gray-600">
              {{ feature.description }}
            </p>

            <a
              href="#"
              class="mt-6 inline-flex text-sm font-semibold text-gray-900"
            >
              Learn more
              <span class="ml-2">→</span>
            </a>
          </article>
        </div>
      </div>
    </section>

    <!-- Pricing -->
    <section
      id="pricing"
      class="py-24 lg:py-32"
    >
      <div class="mx-auto max-w-7xl px-6">
        <!-- Heading -->
        <div class="mx-auto max-w-2xl text-center">
          <p class="text-sm font-semibold uppercase tracking-widest text-gray-500">
            Pricing
          </p>

          <h2
            class="mt-3 text-3xl font-bold tracking-tight text-gray-950 sm:text-4xl"
          >
            Simple plans that scale with you
          </h2>

          <p class="mt-4 text-lg leading-8 text-gray-600">
            Start for free and upgrade when you need more storage,
            features, or collaboration.
          </p>
        </div>

        <!-- Plans -->
        <div
          class="mx-auto mt-16 grid max-w-6xl gap-6 lg:grid-cols-3 lg:items-stretch"
        >
          <div
            v-for="plan in plans"
            :key="plan.name"
            class="relative flex flex-col rounded-2xl border bg-white p-8"
            :class="
              plan.highlighted
                ? 'border-gray-900 shadow-xl shadow-gray-900/10'
                : 'border-gray-200'
            "
          >
            <!-- Recommended badge -->
            <div
              v-if="plan.highlighted"
              class="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gray-900 px-4 py-1 text-xs font-semibold text-white"
            >
              Most popular
            </div>

            <!-- Plan header -->
            <div>
              <h3 class="text-lg font-semibold text-gray-950">
                {{ plan.name }}
              </h3>

              <p class="mt-2 min-h-12 text-sm leading-6 text-gray-500">
                {{ plan.description }}
              </p>
            </div>

            <!-- Price -->
            <div class="mt-8">
              <div class="flex items-baseline gap-2">
                <span
                  class="text-4xl font-bold tracking-tight text-gray-950"
                >
                  {{ plan.price }}
                </span>

                <span class="text-sm text-gray-500">
                  / {{ plan.period }}
                </span>
              </div>
            </div>

            <!-- CTA -->
            <button
              type="button"
              class="mt-8 w-full rounded-xl px-4 py-3 text-sm font-semibold transition"
              :class="
                plan.highlighted
                  ? 'bg-gray-900 text-white hover:bg-gray-700'
                  : 'border border-gray-200 bg-white hover:bg-gray-50'
              "
            >
              {{ plan.button }}
            </button>

            <!-- Divider -->
            <div class="my-8 border-t border-gray-100" />

            <!-- Features -->
            <p class="text-sm font-semibold text-gray-900">
              What's included
            </p>

            <ul class="mt-5 space-y-4">
              <li
                v-for="feature in plan.features"
                :key="feature"
                class="flex items-start gap-3 text-sm text-gray-600"
              >
                <svg
                  class="mt-0.5 h-5 w-5 shrink-0 text-gray-900"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fill-rule="evenodd"
                    d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.91 3.91 7.48-9.35a.75.75 0 011.034-.127z"
                    clip-rule="evenodd"
                  />
                </svg>

                <span>{{ feature }}</span>
              </li>
            </ul>
          </div>
        </div>

        <!-- Bottom note -->
        <p class="mt-10 text-center text-sm text-gray-500">
          All plans include secure storage, automatic backups, and access
          from any device.
        </p>
      </div>
    </section>

    <!-- Security -->
    <section
      id="security"
      class="bg-gray-950 text-white scroll-mt-15"
    >
      <div
        class="mx-auto grid max-w-7xl gap-16 px-6 py-24 lg:grid-cols-2 lg:px-8 lg:py-28"
      >
        <div>
          <p class="text-sm font-semibold text-gray-400">
            BUILT FOR PRIVACY
          </p>

          <h2 class="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Your files belong to you.
          </h2>

          <p class="mt-5 max-w-xl text-lg leading-8 text-gray-400">
            Security isn't an add-on. FolderSpace is designed from the ground up
            to keep your files private and protected.
          </p>
        </div>

        <div class="grid gap-4 sm:grid-cols-2">
          <div class="rounded-2xl border border-white/10 bg-white/5 p-6">
            <div class="text-2xl">
              🔐
            </div>
            <h3 class="mt-4 font-semibold">
              End-to-end protection
            </h3>
            <p class="mt-2 text-sm leading-6 text-gray-400">
              Strong encryption keeps your files protected.
            </p>
          </div>

          <div class="rounded-2xl border border-white/10 bg-white/5 p-6">
            <div class="text-2xl">
              🛡️
            </div>
            <h3 class="mt-4 font-semibold">
              Access control
            </h3>
            <p class="mt-2 text-sm leading-6 text-gray-400">
              Decide exactly who can view or edit your files.
            </p>
          </div>

          <div class="rounded-2xl border border-white/10 bg-white/5 p-6">
            <div class="text-2xl">
              ☁️
            </div>
            <h3 class="mt-4 font-semibold">
              Reliable storage
            </h3>
            <p class="mt-2 text-sm leading-6 text-gray-400">
              Your data is safely backed up and always available.
            </p>
          </div>

          <div class="rounded-2xl border border-white/10 bg-white/5 p-6">
            <div class="text-2xl">
              👤
            </div>
            <h3 class="mt-4 font-semibold">
              You stay in control
            </h3>
            <p class="mt-2 text-sm leading-6 text-gray-400">
              Manage permissions and sharing from one place.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section
      id="cta"
      class="py-24 lg:py-32"
    >
      <div class="mx-auto max-w-4xl px-6 text-center lg:px-8">
        <h2 class="text-4xl font-bold tracking-tight sm:text-5xl">
          Your files deserve a better home.
        </h2>

        <p class="mx-auto mt-5 max-w-2xl text-lg text-gray-600">
          Start storing and sharing your files today. Get 10 GB of secure
          cloud storage for free.
        </p>

        <div class="mt-8">
          <NuxtLink
            class="rounded-xl bg-blue-500 px-7 py-4 text-lg font-semibold text-white shadow-lg shadow-gray-900/10 transition hover:-translate-y-0.5 hover:bg-blue-400"
            to="/signup"
          >
            Create your free account
            <span class="ml-2">→</span>
          </NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
html {
  scroll-behavior: smooth;
}

@keyframes marquee {
  from {
      transform: translateX(0);
  }
  to {
      transform: translateX(-50%);
  }
}

.marquee {
  animation: marquee 25s linear infinite;
}

.marquee:hover {
  animation-play-state: paused;
}

@media (prefers-reduced-motion: reduce) {
  .marquee {
    animation: none;
  }
}
</style>
