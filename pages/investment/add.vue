<template>
    <div class="container login-page">
        <notifications></notifications>
        <div class="row">
            <div class="col-md-12">
                <investment-form @on-submit="addInvestment"></investment-form>
            </div>
        </div>
    </div>
</template>
<script>
import InvestmentForm from '@/components/Investments/AddInvestmentForm.vue';

export default {
    name: 'add-investments',
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
        async addInvestment(model, isValid, walletId) {
            if (!isValid) {
                return;
            }

            this.investmentModel = model;
            await this.$axios.$put(process.env.api.investments, {
                pk: walletId,
                invested_amount: parseFloat(model.investedAmount),
                current_value: parseFloat(model.currentValue),
                investment_name: model.investmentName,
            }).then(() => {
                this.$notify({ type: 'success', icon: 'tim-icons icon-check-2', verticalAlign: 'bottom', horizontalAlign: 'center', message: $nuxt.$t('investment.add.success') });
            }).catch((response) => {
                this.$notify({ type: 'danger', icon: 'tim-icons icon-simple-remove', verticalAlign: 'bottom', horizontalAlign: 'center', message: response });
            });
        }
    }
};
</script>
<style>
</style>
