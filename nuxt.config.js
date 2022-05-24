module.exports = {
  target: 'static',
  /**
   * Environment Variables
   */
  env: {
    api: {
      sendEmailUrl: '/send-email',
      profile: {
        refreshToken: '/profile/refresh-token',
        signup: '/profile/sign-up',
        confirmSignup: '/profile/confirm-sign-up',
        resendConfirmationCode: '/profile/resend-confirmation-code',
        forgotPassword: '/profile/forgot-password',
        confirmForgotPassword: '/profile/confirm-forgot-password',
        deleteUser: '/profile/delete-user',
        changePassword: '/profile/change-password',
      },
      deleteItem: '/delete-item',
      delete: '/delete',
      deleteBatch: '/delete-batch',
      goals: '/goals',
      deleteCategories: '/categories/delete',
      transactions: '/transactions',
      categories: '/categories',
      overview: '/overview',
      bankAccounts: '/bank-accounts',
      budgets: '/budgets',
      recurringTransactions: '/recurring-transaction',
      wallets: '/wallet'
    },
    home: {
      invokeUrl: 'https://www.blitzbudget.com'
    },
    help: {
      invokeUrl: 'https://help.blitzbudget.com',
      html: '/support/modal',
      js: '/js/dashboard/support/support.min.js'
    },
    app: {
      invokeUrl: 'https://app.blitzbudget.com/'
    }
  },
  /*
  ** Headers of the page
  */
  head: {
    title: 'BlitzBudget Financial Analyzer',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: 'BlitzBudget Wealth Dashboard' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css?family=Poppins:200,300,400,600,700,800' },
      { rel: 'stylesheet', href: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.10.2/css/all.min.css' }
    ],
    bodyAttrs: {
      class: 'sidebar-mini' // delete the class to have the sidebar expanded by default. Add `white-content` class here to enable "white" mode.
    }
  },
  router: {
    linkExactActiveClass: 'active',
    middleware: ['auth']
  },
  /*
  ** Customize the progress bar color
  */
  loading: { color: '#3B8070' },
  /*
   ** Global CSS
   */
  css: [
    'assets/css/demo.css',
    'assets/css/nucleo-icons.css',
    'assets/sass/black-dashboard-pro.scss'
  ],
  /*
  ** Plugins to load before mounting the App
  */
  plugins: [
    `~/plugins/dashboard-plugin.js`,
    { src: '~/plugins/full-calendar.js', ssr: false },
    { src: '~/plugins/world-map.js', ssr: false }
  ],
  /*
  ** Nuxt.js dev-modules
  */
  buildModules: [],
  /*
  ** Nuxt.js modules
  */
  modules: [
    '@nuxtjs/pwa',
    'nuxt-i18n',
    '@nuxtjs/axios',
    '@nuxtjs/auth-next'
  ],
  axios: {
    baseURL: 'https://api.blitzbudget.com',
    https: true,
  },
  auth: {
    plugins: ['~/plugins/authentication/auth.js'],
    // Options
    redirect: {
      login: '/login',
      logout: '/login',
      callback: '/login',
      home: '/'
    },
    localStorage: {
      prefix: 'auth.'
    },
    strategies: {
      local: {
        user: {
          property: 'user',
          autoFetch: false
        },
        token: {
          property: 'token'
        },
        endpoints: {
          login: { url: '/profile/sign-in', method: 'post', propertyName: 'AuthenticationResult.IdToken' },
          logout: false,
          user: false
        },
        tokenRequired: true,
        tokenType: 'Bearer'
      }
    }
  },
  i18n: {
    locales: [
      {
        code: 'en',
        file: 'en.js'
      },
      {
        code: 'ar',
        file: 'ar.js'
      }
    ],
    lazy: true,
    langDir: 'lang/',
    defaultLocale: 'en',
  },
  /*
  ** Build configuration
  */
  build: {
    transpile: [/^element-ui/],
    /*
    ** You can extend webpack config here
    */
    extend(config, { isDev, isClient }) {
      /*
   ** Run ESLint on save
   */
      if (isDev && isClient) {
        config.module.rules.push({
          enforce: 'pre',
          test: /\.(js|vue)$/,
          loader: 'eslint-loader',
          exclude: /(node_modules)/
        })
      }
    },
    babel: {
      plugins: [
        [
          'component',
          {
            'libraryName': 'element-ui',
            'styleLibraryName': 'theme-chalk'
          }
        ]
      ]
    }
  }
}

