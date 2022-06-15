<template>
    <div class="container login-page">
        <notifications></notifications>
        <div class="row">
            <div class="col-md-12">
                <budget-form @on-submit="addBudget"></budget-form>
            </div>
        </div>
    </div>
</template>
<script>
import BudgetForm from '@/components/Budget/EditBudgetForm.vue';

export default {
    name: 'add-budget-form',
    layout: 'plain',
    components: {
        BudgetForm,
    },
    data() {
        return {
            budgetModel: {}
        };
    },
    methods: {
        async addBudget(model, isValid, walletId) {
            if (!isValid) {
                return;
            }

            this.budgetModel = model;
            await this.$axios.$put(process.env.api.budgets, {
                pk: walletId,
                planned: parseInt(model.planned),
                category: model.categoryId,
            }).then(() => {
                this.$notify({ type: 'success', icon: 'tim-icons icon-check-2', verticalAlign: 'bottom', horizontalAlign: 'center', message: $nuxt.$t('budget.add.success') });
            }).catch((response) => {
                this.$notify({ type: 'danger', icon: 'tim-icons icon-simple-remove', verticalAlign: 'bottom', horizontalAlign: 'center', message: response });
            });
        }
    }
};
</script>
<style>
</style>
