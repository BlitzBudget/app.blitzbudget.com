window._config = {
  api: {
    invokeUrl: 'https://api.blitzbudget.com', // e.g. https://rc7nyt4tql.execute-api.us-west-2.amazonaws.com/prod,
    sendEmailUrl: '/send-email',
    profile: {
      refreshToken: '/profile/refresh-token',
      signin: '/profile/sign-in',
      signup: '/profile/sign-up',
      confirmSignup: '/profile/confirm-sign-up',
      resendConfirmationCode: '/profile/resend-confirmation-code',
      forgotPassword: '/profile/forgot-password',
      confirmForgotPassword: '/profile/confirm-forgot-password',
      deleteUser: '/profile/delete-user',
      changePassword: '/profile/change-password'
    },
    deleteItem: '/delete-item',
    delete: '/delete',
    deleteBatch: '/delete-batch',
    goals: '/goals',
    deleteCategories: '/categories/delete'
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
  wallet: {
    invokeUrl: 'wallets'
  }
}

Object.freeze(window._config)
Object.seal(window._config)
Object.preventExtensions(window._config)
