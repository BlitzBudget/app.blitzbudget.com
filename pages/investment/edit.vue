<template>
    <div class="container login-page">
        <notifications></notifications>
        <div class="row">
            <div class="col-md-12">
                <investment-form @on-submit="editInvestment"></investment-form>
            </div>
        </div>
    </div>
</template>
<script>
import InvestmentForm from '@/components/Investments/EditInvestmentForm.vue';

export default {
    name: 'edit-investments',
    layout: 'plain',
    components: {
        InvestmentForm,
    },
    data() {
        return {
            investmentModel: {}
        };
    },
    methods: {
        async editInvestment(model, isValid, walletId) {
            if (!isValid) {
                return;
            }

            this.investmentModel = model;
            await this.$axios.$patch(process.env.api.investments, {
                pk: walletId,
                sk: model.sk,
                invested_amount: parseInt(model.investedAmount),
                current_value: parseInt(model.currentValue),
                investment_name: model.investmentName,
            }).then(() => {
                this.$notify({ type: 'success', icon: 'tim-icons icon-check-2', verticalAlign: 'bottom', horizontalAlign: 'center', message: $nuxt.$t('investment.edit.success') });
            }).catch((response) => {
                this.$notify({ type: 'danger', icon: 'tim-icons icon-simple-remove', verticalAlign: 'bottom', horizontalAlign: 'center', message: response });
            });
        }
    }
};
</script>
<style>
</style>
