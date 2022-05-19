<template>
  <div class="container login-page">
    <notifications></notifications>
    <div class="col-lg-4 col-md-6 ml-auto mr-auto">
      <form @submit.prevent="login">
        <card class="card-login card-white">
          <template slot="header">
            <img src="img/card-primary.png" alt="" />
            <h1 class="card-title">{{ $t('user.login.title') }}</h1>
          </template>

          <div>
            <base-input v-validate="'required|email'" name="email" :error="getError('email')" v-model="model.email"
              :placeholder="$t('user.login.placholder.email')" autocomplete="username"
              addon-left-icon="tim-icons icon-email-85">
            </base-input>

            <base-input v-validate="'required|min:8'" name="password" :error="getError('password')"
              v-model="model.password" type="password" autocomplete="current-password"
              :placeholder="$t('user.login.placholder.password')" addon-left-icon="tim-icons icon-lock-circle">
            </base-input>
          </div>

          <div slot="footer">
            <base-button native-type="submit" type="primary" class="mb-3" size="lg" block>
              {{ $t('user.login.get-started') }}
            </base-button>
            <div class="pull-left">
              <h6>
                <nuxt-link class="link footer-link" to="/user/forgot-password">
                  {{ $t('user.login.forgot-password') }}
                </nuxt-link>
              </h6>
            </div>

            <div class="pull-right">
              <h6><a href="https://help.blitzbudget.com/" class="link footer-link">{{ $t('user.login.need-help') }}</a>
              </h6>
            </div>
          </div>
        </card>
      </form>
    </div>
  </div>
</template>
<script>
export default {
  name: 'login-page',
  layout: 'auth',
  auth: 'guest',
  data() {
    return {
      model: {
        email: '',
        password: '',
        subscribe: true,
      }
    };
  },
  methods: {
    getError(fieldName) {
      return this.errors.first(fieldName);
    },
    async login() {
      let isValidForm = await this.$validator.validateAll();
      if (isValidForm) {
        await this.$authentication.loginUser(this);
      }
    }
  }
};
</script>
<style>
.navbar-nav .nav-item p {
  line-height: inherit;
  margin-left: 5px;
}
</style>
