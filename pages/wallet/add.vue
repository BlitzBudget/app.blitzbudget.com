<template>
    <div class="container login-page">
        <notifications></notifications>
        <div class="row">
            <div class="col-md-12">
                <wallet-add-form @on-submit="addWallet"></wallet-add-form>
            </div>
        </div>
    </div>
</template>
<script>
import WalletAddForm from '@/components/Wallets/AddForm.vue';

export default {
    name: 'add-wallet',
    layout: 'plain',
    components: {
        WalletAddForm,
    },
    data() {
        return {
            walletModel: {}
        };
    },
    methods: {
        async addWallet(model, isValid, userId) {
            if (!isValid) {
                return;
            }

            this.walletModel = model;
            await this.$put(process.env.api.wallets, {
                pk: userId,
                wallet_currency: model.currency,
                wallet_name: model.name
            }).then(() => {
                this.$notify({ type: 'success', icon: 'tim-icons icon-check-2', verticalAlign: 'bottom', horizontalAlign: 'center', message: $nuxt.$t('wallet.add.success') });
            }).catch((response) => {
                this.$notify({ type: 'danger', icon: 'tim-icons icon-simple-remove', verticalAlign: 'bottom', horizontalAlign: 'center', message: response });
            });
        }
    }
};
</script>
<style></style>
