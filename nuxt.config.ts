// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  
  modules: [
    '@nuxtjs/tailwindcss'
  ],

  css: ['~/assets/css/main.css'],

  app: {
    head: {
      title: 'LCARS Journal & Todo',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Ein persönlicher Arbeitsbereich im LCARS Stil' }
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&display=swap' }
      ]
    }
  },

  // Cloudflare Pages preset
  nitro: {
    preset: 'cloudflare-pages',
    // D1 database bindings will be automatically available via process.env
  },

  // Runtime config for API base URL
  runtimeConfig: {
    public: {
      // In Nitro, API routes are served from the same server at /api
      apiBase: '/api'
    }
  },

  // Vite configuration
  vite: {
    server: {
      port: 3000
    }
  },

  // PostCSS configuration
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {}
    }
  },

  compatibilityDate: '2024-01-22'
})
