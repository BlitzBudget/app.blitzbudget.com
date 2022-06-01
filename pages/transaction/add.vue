<template>
    <div class="container login-page">
        <notifications></notifications>
        <div class="row">
            <div class="col-md-12">
                <transaction-form @on-submit="addTransaction"></transaction-form>
            </div>
        </div>
    </div>
</template>
<script>
import TransactionForm from '@/components/Transactions/AddForm.vue';

export default {
    name: 'validation-forms',
    layout: 'plain',
    components: {
        TransactionForm,
    },
    data() {
        return {
            transactionModel: {}
        };
    },
    methods: {
        async addTransaction(model, isValid, walletId) {
            if (!isValid) {
                return;
            }

            this.transactionModel = model;
            await this.$axios.$put(process.env.api.transactions, {
                pk: walletId,
                amount: model.amount,
                description: model.description,
            }).then(() => {
                this.$notify({ type: 'success', icon: 'tim-icons icon-check-2', verticalAlign: 'bottom', horizontalAlign: 'center', message: $nuxt.$t('wallet.add.success') });
            }).catch((response) => {
                this.$notify({ type: 'danger', message: response });
            });
        }
    }
};
</script>
<style>
</style>
