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
            <h3 class="info-title mb-md-0">Budget</h3>
            <p class="description">
              Finding it hard to save? Try to budget with the help of our budget manager!
            </p>
          </div>
        </div>
        <div class="info-area info-horizontal mt-md-4">
          <div class="icon icon-primary">
            <i class="tim-icons icon-triangle-right-17"></i>
          </div>
          <div class="description">
            <h3 class="info-title mb-md-0">Goals</h3>
            <p class="description">
              Dream of achieving a worthwhile goal? Create a goal and start tracking your savings towards it.
            </p>
          </div>
        </div>
        <div class="info-area info-horizontal mt-md-4">
          <div class="icon icon-info">
            <i class="tim-icons icon-trophy"></i>
          </div>
          <div class="description">
            <h3 class="info-title mb-md-0">Categorize</h3>
            <p class="description">
              Planning for a trip? Find it hard to keep track of an expense? Create a category!
            </p>
          </div>
        </div>
      </div>

      <div class="col-md-7 mr-auto">
        <form @submit.prevent="register">
          <card class="card-register card-white">
            <template slot="header">
              <img class="card-img" src="img/card-primary.png" alt="Card image" />
              <h4 class="card-title">Register</h4>
            </template>

            <base-input v-validate="'required'" :error="getError('Full Name')" v-model="model.fullName" name="Full Name"
              placeholder="Full Name" addon-left-icon="tim-icons icon-single-02">
            </base-input>

            <base-input v-validate="'required|email'" :error="getError('email')" v-model="model.email" name="email"
              placeholder="Email" autocomplete="username" addon-left-icon="tim-icons icon-email-85">
            </base-input>

            <base-input v-validate="'required|min:8'" :error="getError('password')" v-model="model.password"
              name="password" type="password" placeholder="Password" autocomplete="current-password"
              addon-left-icon="tim-icons icon-lock-circle">
            </base-input>

            <base-checkbox class="text-left">
              I agree to the <a href="#something">terms and conditions</a>.
            </base-checkbox>

            <base-button native-type="submit" slot="footer" type="primary" round block size="lg">
              Get Started
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
        password: ''
      }
    };
  },
  methods: {
    getError(fieldName) {
      return this.errors.first(fieldName);
    },
    async register() {
      let isValidForm = await this.$validator.validateAll();
      if (isValidForm) {
        // TIP use this.model to send it to api and perform register call
        this.$axios.$post(process.env.api.profile.signup, {
          username: this.model.email,
          password: this.model.password,
          checkPassword: false,
          firstname: this.model.fullName,
          lastname: ''
        }).catch(({ response }) => {
          let errorMessage = this.$lastElement(this.$splitElement(response.data.errorMessage, ':'));
          this.$notify({ type: 'danger', message: errorMessage });
        });

        // TODO handle errors
        // TODO handle success  
      }
    }
  }
};
</script>
<style>
</style>
