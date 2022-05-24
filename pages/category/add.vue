<template>
    <div class="container login-page">
        <notifications></notifications>
        <div class="row">
            <div class="col-md-12">
                <wallet-add-form @on-submit="addWallet" :class="[
                { 'show d-block': !hasSucceeded },
                { 'd-none': hasSucceeded }]"></wallet-add-form>
            </div>
            <div class="col-md-12 ml-auto-mr-auto">
                <!-- Success Message Tab -->
                <card type="testimonial" header-classes="card-header-avatar" :class="[
                { 'show d-block': hasSucceeded },
                { 'd-none': !hasSucceeded }]">
                    <p class="card-description">
                        {{ $t('support.ask-us-directly.success.description') }}
                    </p>

                    <template slot="footer">
                        <nuxt-link to="/" class="btn btn-primary">
                            {{ $t('support.ask-us-directly.success.button') }}
                        </nuxt-link>
                    </template>
                </card>
            </div>
        </div>
    </div>
</template>
<script>
import WalletAddForm from '@/components/Wallets/AddForm.vue';

export default {
    name: 'validation-forms',
    components: {
        WalletAddForm,
    },
    data() {
        return {
            walletModel: {},
            hasSucceeded: false
        };
    },
    methods: {
        async addWallet(model, isValid, userId) {
            if (!isValid) {
                return;
            }

            this.walletModel = model;
            await this.$axios.$put(process.env.api.wallets, {
                pk: userId,
                wallet_currency: model.currency,
                wallet_name: model.name
            }).then(() => {
                this.hasSucceeded = true;
            }).catch(({ response }) => {
                let errorMessage = this.$lastElement(this.$splitElement(response.data.errorMessage, ':'));
                this.$notify({ type: 'danger', message: errorMessage });
            });
        }
    }
};
</script>
<style>
</style>
