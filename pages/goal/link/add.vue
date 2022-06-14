<template>
    <div class="container login-page">
        <notifications></notifications>
        <div class="row">
            <div class="col-md-12">
                <goal-link-add-form @on-submit="addGoalLink"></goal-link-add-form>
            </div>
        </div>
    </div>
</template>
<script>
import GoalLinkAddForm from '@/components/Goals/Link/AddForm.vue';

export default {
    name: 'goal-links-add-form',
    layout: 'plain',
    components: {
        GoalLinkAddForm,
    },
    data() {
        return {
            goalModel: {}
        };
    },
    methods: {
        async addGoalLink(model, isValid, walletId) {
            if (!isValid) {
                return;
            }

            this.goalModel = model;
            await this.$axios.$put(process.env.api.rules.goal, {
                pk: walletId,
                transaction_name: model.transactionDescription,
                goal_id: model.goalId
            }).then(() => {
                this.$notify({ type: 'success', icon: 'tim-icons icon-check-2', verticalAlign: 'bottom', horizontalAlign: 'center', message: $nuxt.$t('goal.link.add.success') });
            }).catch((response) => {
                this.$notify({ type: 'danger', icon: 'tim-icons icon-check-2', verticalAlign: 'bottom', horizontalAlign: 'center', message: response });
            });
        }
    }
};
</script>
