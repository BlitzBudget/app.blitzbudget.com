<template>
    <div class="container login-page">
        <notifications></notifications>
        <div class="row">
            <div class="col-md-12">
                <goal-form @on-submit="editGoal"></goal-form>
            </div>
        </div>
    </div>
</template>
<script>
import GoalForm from '@/components/Goals/EditGoalForm.vue';

export default {
    name: 'edit-goals',
    layout: 'plain',
    components: {
        GoalForm,
    },
    data() {
        return {
            goalModel: {}
        };
    },
    methods: {
        async editGoal(model, isValid, walletId) {
            if (!isValid) {
                return;
            }

            this.goalModel = model;
            await this.$axios.$patch(process.env.api.goals, {
                pk: walletId,
                sk: model.sk,
                target_amount: parseInt(model.targetAmount),
                target_date: model.targetDate,
                goal_name: model.goalName,
                current_amount: parseInt(model.currentAmount),
            }).then(() => {
                this.$notify({ type: 'success', icon: 'tim-icons icon-check-2', verticalAlign: 'bottom', horizontalAlign: 'center', message: $nuxt.$t('goal.edit.success') });
            }).catch((response) => {
                this.$notify({ type: 'danger', icon: 'tim-icons icon-simple-remove', verticalAlign: 'bottom', horizontalAlign: 'center', message: response });
            });
        }
    }
};
</script>
<style>
</style>
