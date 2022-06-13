<template>
    <div class="container login-page">
        <notifications></notifications>
        <div class="row">
            <div class="col-md-12">
                <debt-link-add-form @on-submit="addDebtLink"></debt-link-add-form>
            </div>
        </div>
    </div>
</template>
<script>
import DebtLinkAddForm from '@/components/Debts/Link/AddForm.vue';

export default {
    name: 'debt-links-add-form',
    layout: 'plain',
    components: {
        DebtLinkAddForm,
    },
    data() {
        return {
            debtModel: {}
        };
    },
    methods: {
        async addDebtLink(model, isValid, walletId) {
            if (!isValid) {
                return;
            }

            this.debtModel = model;
            await this.$axios.$put(process.env.api.rules.debt, {
                pk: walletId,
                transaction_name: model.transactionDescription,
                debt_id: model.debtId
            }).then(() => {
                this.$notify({ type: 'success', icon: 'tim-icons icon-check-2', verticalAlign: 'bottom', horizontalAlign: 'center', message: $nuxt.$t('debt.link.add.success') });
            }).catch((response) => {
                this.$notify({ type: 'danger', icon: 'tim-icons icon-check-2', verticalAlign: 'bottom', horizontalAlign: 'center', message: response });
            });
        }
    }
};
</script>
