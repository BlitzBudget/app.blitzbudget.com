<template>
    <div class="container login-page">
        <notifications></notifications>
        <div class="row">
            <div class="col-md-12">
                <debt-form @on-submit="editDebt"></debt-form>
            </div>
        </div>
    </div>
</template>
<script>
import DebtForm from '@/components/Debts/EditDebtForm.vue';

export default {
    name: 'edit-debts',
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
        async editDebt(model, isValid, walletId) {
            if (!isValid) {
                return;
            }

            this.debtModel = model;
            await this.$axios.$patch(process.env.api.debts, {
                pk: walletId,
                sk: model.sk,
                debted_amount: parseFloat(model.debtAmount),
                debt_name: model.debtName,
                current_value: parseFloat(model.currentValue),
            }).then(() => {
                this.$notify({ type: 'success', icon: 'tim-icons icon-check-2', verticalAlign: 'bottom', horizontalAlign: 'center', message: $nuxt.$t('debt.edit.success') });
            }).catch((response) => {
                this.$notify({ type: 'danger', icon: 'tim-icons icon-simple-remove', verticalAlign: 'bottom', horizontalAlign: 'center', message: response });
            });
        }
    }
};
</script>
<style>
</style>
