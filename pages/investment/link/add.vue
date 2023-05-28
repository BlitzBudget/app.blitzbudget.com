<template>
    <div class="container login-page">
        <notifications></notifications>
        <div class="row">
            <div class="col-md-12">
                <investment-link-add-form @on-submit="addInvestmentLink"></investment-link-add-form>
            </div>
        </div>
    </div>
</template>
<script>
import InvestmentLinkAddForm from '@/components/Investments/Link/AddForm.vue';

export default {
    name: 'investment-links-add-form',
    layout: 'plain',
    components: {
        InvestmentLinkAddForm,
    },
    data() {
        return {
            investmentModel: {}
        };
    },
    methods: {
        async addInvestmentLink(model, isValid, walletId) {
            if (!isValid) {
                return;
            }

            this.investmentModel = model;
            await this.$put(process.env.api.rules.investment, {
                pk: walletId,
                transaction_name: model.transactionDescription,
                investment_id: model.investmentId
            }).then(() => {
                this.$notify({ type: 'success', icon: 'tim-icons icon-check-2', verticalAlign: 'bottom', horizontalAlign: 'center', message: $nuxt.$t('investment.link.add.success') });
            }).catch((response) => {
                this.$notify({ type: 'danger', icon: 'tim-icons icon-check-2', verticalAlign: 'bottom', horizontalAlign: 'center', message: response });
            });
        }
    }
};
</script>
