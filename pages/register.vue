<template>
  <div class="container register-page">
    <notifications></notifications>
    <div class="row">
      <div class="col-md-5 ml-auto">
        <div class="info-area info-horizontal mt-5">
          <div class="icon icon-warning">
            <i class="tim-icons icon-wifi"></i>
          </div>
          <div class="description">
            <h3 class="info-title mb-md-0">{{ $t('user.register.info.first.title') }}</h3>
            <p class="description">
              {{ $t('user.register.info.first.description') }}
            </p>
          </div>
        </div>
        <div class="info-area info-horizontal mt-md-4">
          <div class="icon icon-primary">
            <i class="tim-icons icon-triangle-right-17"></i>
          </div>
          <div class="description">
            <h3 class="info-title mb-md-0">{{ $t('user.register.info.second.title') }}</h3>
            <p class="description">
              {{ $t('user.register.info.second.description') }}
            </p>
          </div>
        </div>
        <div class="info-area info-horizontal mt-md-4">
          <div class="icon icon-info">
            <i class="tim-icons icon-trophy"></i>
          </div>
          <div class="description">
            <h3 class="info-title mb-md-0">{{ $t('user.register.info.third.title') }}</h3>
            <p class="description">
              {{ $t('user.register.info.third.description') }}
            </p>
          </div>
        </div>
      </div>

      <div class="col-md-7 mr-auto">
        <form @submit.prevent="register">
          <card class="card-register card-white">
            <template slot="header">
              <img class="card-img" src="img/card-primary.png" alt="Card image" />
              <h4 class="card-title">{{ $t('user.register.title') }}</h4>
            </template>

            <base-input v-validate="'required'" :error="getError('Full Name')" v-model="model.fullName" name="Full Name"
              :placeholder="$t('user.register.placeholder.fullname')" addon-left-icon="tim-icons icon-single-02"
              autofocus>
            </base-input>

            <base-input v-validate="'required|email'" :error="getError('email')" v-model="model.email" name="email"
              :placeholder="$t('user.register.placeholder.email')" autocomplete="username"
              addon-left-icon="tim-icons icon-email-85">
            </base-input>

            <base-input v-validate="'required|min:8'" :error="getError('password')" v-model="model.password"
              name="password" type="password" :placeholder="$t('user.register.placeholder.password')"
              autocomplete="current-password" addon-left-icon="tim-icons icon-lock-circle" show-or-hide-password="true">
            </base-input>

            <base-checkbox class="text-left" v-validate="'required'" :error="getError('checkbox')" name="checkbox"
              v-model="model.checkbox">
              {{ $t('user.register.terms.firstpart') }}<a href="www.blitzbudget.com/terms" target="_blank">{{
                              $t('user.register.terms.secondpart')
                              }}</a>.
            </base-checkbox>

            <base-button native-type="submit" slot="footer" type="primary" round block size="lg">
              {{ $t('user.register.button') }}
            </base-button>
          </card>
        </form>
      </div>
    </div>
  </div>
</template>
<script>
import { BaseCheckbox } from '@/components';

export default {
  name: 'register-page',
  layout: 'auth',
  auth: 'guest',
  components: {
    BaseCheckbox
  },
  data() {
    return {
      model: {
        email: '',
        fullName: '',
        password: '',
        checkbox: null
      }
    };
  },
  methods: {
    getError(fieldName) {
      return this.errors.first(fieldName);
    },
    async register() {
      let isValidForm = await this.$validator.validateAll();
      let { firstName, lastName } = this.extractNames(this.model.fullName)
      if (isValidForm) {
        // TIP use this.model to send it to api and perform register call
        this.$post(process.env.api.profile.signup, {
          email: this.model.email,
          password: this.model.password,
          name: firstName,
          lastName: lastName
        }).then(() => {
          localStorage.setItem(this.$authentication.emailItem, this.model.email);
          this.$router.push({ path: process.env.route.confirmRegistration });
        }).catch(({ response }) => {
          let errorMessage = this.$lastElement(this.$splitElement(response.data.message, ':'));
          this.$notify({ type: 'danger', icon: 'tim-icons icon-simple-remove', verticalAlign: 'bottom', horizontalAlign: 'center', message: errorMessage });
        });
      }
    },
    extractNames(fullName) {
      let nameArray = fullName.split(" ");
      let firstName = nameArray.shift();
      let lastName = nameArray.join(" ");
      return { firstName, lastName };
    },
  }
};
</script>
<style></style>
