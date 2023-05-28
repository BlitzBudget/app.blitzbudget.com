const ESLintPlugin = require('eslint-webpack-plugin');

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
        resetAccount: '/profile/reset-account',
        login: '/profile/sign-in',
        userAttribute: '/profile/user-attribute'
      },
      deleteItem: '/delete-item',
      delete: '/delete',
      deleteBatch: '/delete-batch',
      goals: '/goals',
      deleteCategories: '/categories/delete',
      transactions: '/transactions',
      categories: '/categories',
      category: {
        batch: '/categories/batch'
      },
      overview: '/overview',
      bankAccounts: '/bank-accounts',
      budgets: '/budgets',
      recurringTransactions: '/recurring-transaction',
      wallets: '/wallet',
      investments: '/investment',
      debts: '/debt',
      notifications: '/notifications',
      rules: {
        category: '/rules/category',
        investment: '/rules/investment',
        debt: '/rules/debt',
        goal: '/rules/goal',
      }
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
    },
    route: {
      transaction: "transactions",
      confirmRegistration: "confirm-registration",
    },
    navigation: {
      wallets: '/wallets'
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
      { rel: 'stylesheet', href: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.2.1/css/all.min.css' }
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
    '@kevinmarrec/nuxt-pwa',
    '@nuxtjs/i18n',
    '@nuxtjs/auth-next'
  ],
  // PWA module configuration
  pwa: {
    meta: {
      /* meta options */
      name: 'BlitzBudget', // Name of your PWA
      author: 'Nagarjun Nagesh', // Author of the PWA
      description: 'Wealth Builder and Tracker Application', // Description of the PWA
      theme_color: '#ffffff', // Theme color of the PWA
    },
    manifest: {
      /* manifest options */
      name: 'BlitzBudget', // Name of your PWA
      short_name: 'App', // Short name of your PWA
      lang: 'en', // Language of the PWA
      display: 'standalone', // Display mode of the PWA
    },
  },
  runtimeConfig: {
    public: {
      baseURL: process.env.BASE_URL || 'https://api.blitzbudget.com',
    },
  },
  auth: {
    plugins: [],
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
  /**
   * Create a 404 HTML when generating static resources.
   */
  generate: {
    fallback: '404.html'
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
        config.plugins.push(
          new ESLintPlugin({
            extensions: ['js', 'vue'],
            exclude: ['node_modules'],
            // Other ESLint options
          })
        );
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

