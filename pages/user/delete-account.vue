<template>
    <div class="container">
        <notifications></notifications>
        <div class="row">
            <div class="col-md-8 ml-auto mr-auto">
                <delete-account-form @on-submit="verifyPassword" :class="[
                { 'show d-block': !hasSucceeded },
                { 'd-none': hasSucceeded }]">
                </delete-account-form>
                <!-- Success Message Tab -->
                <card type="testimonial" header-classes="card-header-avatar" :class="[
                { 'show d-block': hasSucceeded },
                { 'd-none': !hasSucceeded }]">
                    <p class="card-description">
                        {{ $t('user.delete-account.success.description') }}
                    </p>

                    <template slot="footer">
                        <nuxt-link to="/" class="btn btn-primary">
                            {{ $t('user.delete-account.success.button') }}
                        </nuxt-link>
                    </template>
                </card>
            </div>
        </div>
    </div>
</template>
<script>
import DeleteAccountForm from '@/components/UserProfile/DeleteAccountForm.vue';

export default {
    name: 'delete-account-page',
    layout: 'plain',
    components: {
        DeleteAccountForm,
    },
    data() {
        return {
            deleteModel: {},
            hasSucceeded: false,
            model: {
                password: null
            }
        };
    },
    methods: {
        async deleteAccount() {
            let event = this;
            let user = this.$authentication.fetchCurrentUser(this);
            let accessToken = this.$authentication.fetchAccessToken();
            await this.$axios.$post(process.env.api.profile.resetAccount, {
                walletId: user.financialPortfolioId,
                userName: user.email,
                accessToken: accessToken,
                deleteAccount: true,
            }).then(() => {
                // Delete Wallet Account
                event.$wallet.resetWallet(event);
                // Log the user out
                this.$userLogout.logout(this);
            }).catch(({ response }) => {
                let errorMessage = this.$lastElement(this.$splitElement(response.data.errorMessage, ':'));
                this.$notify({ type: 'danger', icon: 'tim-icons icon-simple-remove', verticalAlign: 'bottom', horizontalAlign: 'center', message: errorMessage });
            });
        },
        async verifyPassword(isValid, model) {
            if (!isValid) {
                return;
            }

            let email = this.$authentication.fetchCurrentUser(this).email;
            await this.$axios.$post(process.env.api.profile.login, {
                username: email,
                password: model.password,
                checkPassword: true
            }).then(async () => {
                await this.deleteAccount();
            }).catch(({ response }) => {
                let errorMessage = this.$lastElement(this.$splitElement(response.data.errorMessage, ':'));
                this.$notify({ type: 'danger', icon: 'tim-icons icon-simple-remove', verticalAlign: 'bottom', horizontalAlign: 'center', message: errorMessage });
            });
        }
    }
};
</script>
<style>
</style>
