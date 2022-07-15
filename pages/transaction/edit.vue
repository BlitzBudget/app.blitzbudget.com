<template>
    <div class="container login-page">
        <notifications></notifications>
        <div class="row">
            <div class="col-md-12">
                <transaction-form @on-submit="editTransaction"></transaction-form>
            </div>
        </div>
    </div>
</template>
<script>
import TransactionForm from '@/components/Transactions/EditTransactionForm.vue';

export default {
    name: 'edit-transaction-form',
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
        async editTransaction(model, isValid, walletId) {
            if (!isValid) {
                return;
            }

            this.transactionModel = model;
            await this.$axios.$patch(process.env.api.transactions, {
                pk: walletId,
                sk: model.sk,
                amount: parseFloat(model.amount),
                description: model.description,
                category_id: model.categoryId,
                tags: model.tags
            }).then(() => {
                this.$notify({ type: 'success', icon: 'tim-icons icon-check-2', verticalAlign: 'bottom', horizontalAlign: 'center', message: $nuxt.$t('transaction.edit.success') });
            }).catch((response) => {
                this.$notify({ type: 'danger', icon: 'tim-icons icon-simple-remove', verticalAlign: 'bottom', horizontalAlign: 'center', message: response });
            });
        }
    }
};
</script>
<style>
</style>
