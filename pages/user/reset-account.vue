<template>
    <div class="container">
        <notifications></notifications>
        <div class="row">
            <div class="col-md-8 ml-auto mr-auto">
                <reset-account-form @on-submit="verifyPassword" :class="[
                    { 'show d-block': !hasSucceeded },
                    { 'd-none': hasSucceeded }]">
                </reset-account-form>
                <!-- Success Message Tab -->
                <card type="testimonial" header-classes="card-header-avatar" :class="[
                    { 'show d-block': hasSucceeded },
                    { 'd-none': !hasSucceeded }]">
                    <p class="card-description">
                        {{ $t('user.reset-account.success.description') }}
                    </p>

                    <template slot="footer">
                        <nuxt-link to="/" class="btn btn-primary">
                            {{ $t('user.reset-account.success.button') }}
                        </nuxt-link>
                    </template>
                </card>
            </div>
        </div>
    </div>
</template>
<script>
import ResetAccountForm from '@/components/UserProfile/ResetAccountForm.vue';

export default {
    name: 'reset-account-page',
    layout: 'plain',
    components: {
        ResetAccountForm,
    },
    data() {
        return {
            resetModel: {},
            hasSucceeded: false,
            model: {
                password: null
            }
        };
    },
    methods: {
        async resetAccount() {
            let event = this;
            let userId = this.$authentication.fetchCurrentUser(this).financialPortfolioId;
            await this.$axios.$post(process.env.api.profile.resetAccount, {
                walletId: userId,
                deleteAccount: false,
            }).then(() => {
                // Reset Wallet Account
                event.$wallet.resetWallet(event);
                this.hasSucceeded = true;
            }).catch(({ response }) => {
                let errorMessage = this.$lastElement(this.$splitElement(response.data.message, ':'));
                this.$notify({ type: 'danger', icon: 'tim-icons icon-simple-remove', verticalAlign: 'bottom', horizontalAlign: 'center', message: errorMessage });
            });
        },
        async verifyPassword(isValid, model) {
            if (!isValid) {
                return;
            }

            let email = this.$authentication.fetchCurrentUser(this).email;
            await this.$axios.$post(process.env.api.profile.login, {
                email: email,
                password: model.password,
            }).then(async () => {
                await this.resetAccount();
            }).catch(({ response }) => {
                let errorMessage = this.$lastElement(this.$splitElement(response.data.message, ':'));
                this.$notify({ type: 'danger', icon: 'tim-icons icon-simple-remove', verticalAlign: 'bottom', horizontalAlign: 'center', message: errorMessage });
            });
        }
    }
};
</script>
<style></style>
