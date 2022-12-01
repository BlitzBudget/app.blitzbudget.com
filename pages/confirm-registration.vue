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
                            autocomplete="current-password" addon-left-icon="tim-icons icon-lock-circle"
                            show-or-hide-password="true">
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
                                <base-button class="btn btn-link btn-primary" @click.native="resendVerificationCode">
                                    {{ $t('user.confirm-registration.resendVerificationCode') }}
                                </base-button>
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
            hiddenResend: false,
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
                    email: this.model.email,
                    new_password: this.model.password,
                    confirmation_code: this.model.confirmationCode,
                }).then((response) => {
                    console.log(response);
                    this.$authentication.storeAllTokens(response, this);
                    localStorage.removeItem(this.$authentication.emailItem);
                }).catch(({ response }) => {
                    let errorMessage = this.$lastElement(this.$splitElement(response.data.message, ':'));
                    this.$notify({ type: 'danger', icon: 'tim-icons icon-simple-remove', verticalAlign: 'bottom', horizontalAlign: 'center', message: errorMessage });
                });
            }
        },
        async resendVerificationCode() {
            // Validate email
            let isValidForm = await this.$validator.validate('email');

            if (!isValidForm) {
                this.$notify({ type: 'danger', icon: 'tim-icons icon-simple-remove', verticalAlign: 'bottom', horizontalAlign: 'center', message: "Email field is required to resend verification code" });
                return;
            }
            // TIP use this.model to send it to api and perform register call
            this.$axios.$post(process.env.api.profile.resendConfirmationCode, {
                email: this.model.email,
            }).then((response) => {
                console.log(response);
                hideResendButton();
                this.$notify({ type: 'success', icon: 'tim-icons icon-check-2', verticalAlign: 'bottom', horizontalAlign: 'center', message: $nuxt.$t('user.confirm-registration.resend') });
            }).catch(({ response }) => {
                let errorMessage = this.$lastElement(this.$splitElement(response.data.errorMessage, ':'));
                this.$notify({ type: 'danger', icon: 'tim-icons icon-simple-remove', verticalAlign: 'bottom', horizontalAlign: 'center', message: errorMessage });
            });
        },
        hideResendButton() {
            this.hiddenResend = true
            setTimeout(() => {
                this.hiddenResend = false
            }, 60000);
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

.confirm-registration-page .btn.btn-link.btn-primary:hover,
.confirm-registration-page .btn.btn-link.btn-primary:focus,
.confirm-registration-page .btn.btn-link.btn-primary:active {
    color: #e14eca !important;
}
</style>
