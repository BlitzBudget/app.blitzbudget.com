<template>
    <div class="container login-page">
        <notifications></notifications>
        <div class="row">
            <div class="col-md-12">
                <transaction-form @on-submit="addTransaction" :class="[
                { 'show d-block': !hasSucceeded },
                { 'd-none': hasSucceeded }]"></transaction-form>
            </div>
            <div class="col-md-12 ml-auto-mr-auto">
                <!-- Success Message Tab -->
                <card type="testimonial" header-classes="card-header-avatar" :class="[
                { 'show d-block': hasSucceeded },
                { 'd-none': !hasSucceeded }]">
                    <p class="card-description">
                        {{ $t('transaction.add.success.description') }}
                    </p>

                    <template slot="footer">
                        <nuxt-link to="/transactions" class="btn btn-primary">
                            {{ $t('transaction.add.success.button') }}
                        </nuxt-link>
                    </template>
                </card>
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
            transactionModel: {},
            hasSucceeded: false
        };
    },
    methods: {
        async addTransaction(model) {
            if (!isValid) {
                return;
            }

            this.transactionModel = model;
            await this.$axios.$put(process.env.api.transactions, {
                pk: model.walletId,
                sk: model.targetId,
                description: model.targetType,
                targetDate: model.targetDate,
                targetAmount: model.targetAmount,
                monthlyContribution: model.monthlyContribution,
                transactionType: model.transactionType
            }).then(() => {
                this.hasSucceeded = true;
            }).catch((response) => {
                this.$notify({ type: 'danger', message: response });
            });
        }
    }
};
</script>
<style>
</style>
