<template>
    <div class="container confirm-registration-page">
        <notifications></notifications>
        <div class="col-lg-4 col-md-6 ml-auto mr-auto">
            <form @submit.prevent="confirmRegistration">
                <card class="card-login card-white">
                    <template slot="header">
                        <img src="img/card-primary.png" alt="" />
                        <h1 class="card-title">{{ $t('user.confirm-registration.title') }}</h1>
                    </template>

                    <div>
                        <base-input v-validate="'required|email'" :error="getError('email')" v-model="model.email"
                            name="email" :placeholder="$t('user.register.placeholder.email')" autocomplete="username"
                            addon-left-icon="tim-icons icon-email-85">
                        </base-input>

                        <base-input v-validate="'required|min:8'" :error="getError('password')" v-model="model.password"
                            name="password" type="password" :placeholder="$t('user.register.placeholder.password')"
                            autocomplete="current-password" addon-left-icon="tim-icons icon-lock-circle">
                        </base-input>

                        <base-input v-validate="'required|min:6|max:6'" name="VerificationCode"
                            :error="getError('VerificationCode')" v-model="model.confirmationCode"
                            :placeholder="$t('user.confirm-registration.placholder.verificationCode')"
                            autocomplete="VerificationCode" addon-left-icon="tim-icons icon-email-85" autofocus>
                        </base-input>
                    </div>

                    <div slot="footer">
                        <base-button native-type="submit" type="primary" class="mb-3" size="lg" block>
                            {{ $t('user.confirm-registration.verify') }}
                        </base-button>
                        <div class="pull-right">
                            <h6>
                                <nuxt-link class="link footer-link" to="/login">
                                    {{ $t('user.confirm-registration.login') }}
                                </nuxt-link>
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
    name: 'confirm-registration-page',
    layout: 'auth',
    auth: 'guest',
    data() {
        return {
            model: {
                email: '',
                password: '',
                confirmationCode: '',
            }
        };
    },
    methods: {
        getError(fieldName) {
            return this.errors.first(fieldName);
        },
        async confirmRegistration() {
            let isValidForm = await this.$validator.validateAll();
            if (isValidForm) {
                // TIP use this.model to send it to api and perform register call
                this.$axios.$post(process.env.api.profile.confirmSignup, {
                    username: this.model.email,
                    password: this.model.password,
                    confirmationCode: this.model.confirmationCode,
                    doNotCreateWallet: false,
                }).then((response) => {
                    console.log(response);
                    this.$authentication.storeAllTokens(response, this);
                    localStorage.removeItem(this.$authentication.emailItem);
                }).catch((response) => {
                    this.$notify({ type: 'danger', message: response });
                });
            }
        }
    },
    mounted() {
        this.model.confirmationCode = this.$route.query.verify;
        this.model.email = localStorage.getItem(this.$authentication.emailItem);
    }
};
</script>
<style>
.navbar-nav .nav-item p {
    line-height: inherit;
    margin-left: 5px;
}
</style>
