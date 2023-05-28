<template>
    <div class="container login-page">
        <notifications></notifications>
        <div class="row">
            <div class="col-md-12">
                <debt-form @on-submit="addDebt"></debt-form>
            </div>
        </div>
    </div>
</template>
<script>
import DebtForm from '@/components/Debts/AddDebtForm.vue';

export default {
    name: 'add-debts',
    layout: 'plain',
    components: {
        DebtForm,
    },
    data() {
        return {
            debtModel: {}
        };
    },
    methods: {
        async addDebt(model, isValid, walletId) {
            if (!isValid) {
                return;
            }

            this.debtModel = model;
            await this.$put(process.env.api.debts, {
                pk: walletId,
                debted_amount: parseFloat(model.debtAmount),
                debt_name: model.debtName,
                current_value: parseFloat(model.currentValue),
            }).then(() => {
                this.$notify({ type: 'success', icon: 'tim-icons icon-check-2', verticalAlign: 'bottom', horizontalAlign: 'center', message: $nuxt.$t('debt.add.success') });
            }).catch((response) => {
                this.$notify({ type: 'danger', icon: 'tim-icons icon-simple-remove', verticalAlign: 'bottom', horizontalAlign: 'center', message: response });
            });
        }
    }
};
</script>
<style></style>
