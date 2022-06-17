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
import TransactionForm from '@/components/Transactions/AddTransactionForm.vue';

export default {
    name: 'add-transaction-form',
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
                amount: parseInt(model.amount),
                description: model.description,
                category_id: model.categoryId,
                creation_date: model.creationDate,
                tags: model.tags
            }).then(() => {
                this.$notify({ type: 'success', icon: 'tim-icons icon-check-2', verticalAlign: 'bottom', horizontalAlign: 'center', message: $nuxt.$t('transaction.add.success') });
            }).catch((response) => {
                this.$notify({ type: 'danger', icon: 'tim-icons icon-simple-remove', verticalAlign: 'bottom', horizontalAlign: 'center', message: response });
            });
        }
    }
};
</script>
<style>
</style>
