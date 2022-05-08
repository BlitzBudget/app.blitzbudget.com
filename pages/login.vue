<template>
  <div class="container login-page">
    <div class="col-lg-4 col-md-6 ml-auto mr-auto">
      <form @submit.prevent="login">
        <card class="card-login card-white">
          <template slot="header">
            <img src="img//card-primary.png" alt="" />
            <h1 class="card-title">Log in</h1>
          </template>

          <div>
            <base-input v-validate="'required|email'" name="email" :error="getError('email')" v-model="model.email"
              placeholder="Email" autocomplete="username" addon-left-icon="tim-icons icon-email-85">
            </base-input>

            <base-input v-validate="'required|min:5'" name="password" :error="getError('password')"
              v-model="model.password" type="password" autocomplete="current-password" placeholder="Password"
              addon-left-icon="tim-icons icon-lock-circle">
            </base-input>
          </div>

          <div slot="footer">
            <base-button native-type="submit" type="primary" class="mb-3" size="lg" block>
              Get Started
            </base-button>
            <div class="pull-left">
              <h6>
                <nuxt-link class="link footer-link" to="/register">
                  Create Account
                </nuxt-link>
              </h6>
            </div>

            <div class="pull-right">
              <h6><a href="https://help.blitzbudget.com/" class="link footer-link">Need Help?</a></h6>
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
  data() {
    return {
      model: {
        email: '',
        password: '',
        subscribe: true
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
        // TIP use this.model to send it to api and perform login call
        // Simple POST request with a JSON body using fetch
        const requestOptions = {
          method: "POST",
          headers: { "Content-Type": "application/json;charset=UTF-8" },
          body: JSON.stringify({ username: this.model.email.toLowerCase(), password: this.model.password, checkPassword: false })
        };

        await fetch(process.env.api.invokeUrl + process.env.api.profile.signin, requestOptions).then(async response => {
          const result = await response.json();

          // check for error response
          if (!response.ok) {
            // get error message from body or default to response statusText
            const error = (data && data.message) || response.statusText;
            return Promise.reject(error);
          }

          this.storeAuthToken(result);
          this.storeRefreshToken(result);
          this.storeAccessToken(result);
          this.retrieveUserAttributes(result);
          this.$router.push('/');
        })
          .catch(error => {
            this.errorMessage = error;
            console.log("There was an error!", error);
            this.$notify({
              type: 'danger',
              message: error.errorMessage,
              icon: 'tim-icons icon-bell-55'
            });
          });
      }
    },
    storeAuthToken(result) {
      // Set JWT Token For authentication
      let idToken = JSON.stringify(result.AuthenticationResult.IdToken);
      idToken = idToken.substring(1, idToken.length - 1);
      localStorage.setItem('idToken', idToken);
      window.authHeader = idToken;
    },
    storeRefreshToken(result) {
      // Set JWT Token For authentication
      let refreshToken = JSON.stringify(result.AuthenticationResult.RefreshToken);
      refreshToken = refreshToken.substring(1, refreshToken.length - 1);
      localStorage.setItem('refreshToken', refreshToken);
      window.refreshToken = refreshToken;
    },
    storeAccessToken(result) {
      // Set JWT Token For authentication
      let accessToken = JSON.stringify(result.AuthenticationResult.AccessToken);
      accessToken = accessToken.substring(1, accessToken.length - 1);
      localStorage.setItem('accessToken', accessToken);
      window.accessToken = accessToken;
    },
    retrieveUserAttributes(result) {
      let userAttributes = result.UserAttributes;
      let currentUserLocal = {};
      // SUCCESS Scenarios
      for (const element of userAttributes) {
        let name = element.Name;

        if (name.includes('custom:')) {

          // if custom values then remove custom: 
          let elemName = this.$splitElement(name, ':');
          elemName = this.$lastElement(elemName);
          currentUserLocal[elemName] = element.Value;
        } else {
          currentUserLocal[name] = element.Value;
        }
      }

      // Current User to global variable
      window.currentUser = currentUserLocal;
      // We save the item in the localStorage.
      localStorage.setItem("currentUserSI", JSON.stringify(currentUser));
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
