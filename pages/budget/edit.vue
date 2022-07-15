<template>
    <div class="container login-page">
        <notifications></notifications>
        <div class="row">
            <div class="col-md-12">
                <budget-form @on-submit="editBudget"></budget-form>
            </div>
        </div>
    </div>
</template>
<script>
import BudgetForm from '@/components/Budget/EditBudgetForm.vue';

export default {
    name: 'edit-budget-form',
    layout: 'plain',
    components: {
        BudgetForm,
    },
    data() {
        return {
        };
    },
    methods: {
        async editBudget(model, isValid, walletId) {
            if (!isValid) {
                return;
            }

            await this.$axios.$patch(process.env.api.budgets, {
                pk: walletId,
                sk: model.sk,
                planned: parseFloat(model.planned),
                category: model.categoryId,
            }).then(() => {
                this.$notify({ type: 'success', icon: 'tim-icons icon-check-2', verticalAlign: 'bottom', horizontalAlign: 'center', message: $nuxt.$t('budget.edit.success') });
            }).catch((response) => {
                this.$notify({ type: 'danger', icon: 'tim-icons icon-simple-remove', verticalAlign: 'bottom', horizontalAlign: 'center', message: response });
            });
        }
    }
};
</script>
<style>
</style>
