<template>
    <div class="container login-page">
        <notifications></notifications>
        <div class="row">
            <div class="col-md-12">
                <goal-form @on-submit="addGoal"></goal-form>
            </div>
        </div>
    </div>
</template>
<script>
import GoalForm from '@/components/Goals/AddGoalForm.vue';

export default {
    name: 'add-goals',
    components: {
        GoalForm,
    },
    data() {
        return {
            goalModel: {}
        };
    },
    methods: {
        async addGoal(model, isValid, walletId) {
            if (!isValid) {
                return;
            }

            this.goalModel = model;
            await this.$axios.$put(process.env.api.goals, {
                pk: walletId,
                target_amount: parseInt(model.targetAmount),
                target_date: model.targetDate,
                goal_name: model.goalName,
                goal_achieved: false,
                current_amount: 0,
            }).then(() => {
                this.$notify({ type: 'success', icon: 'tim-icons icon-check-2', verticalAlign: 'bottom', horizontalAlign: 'center', message: $nuxt.$t('goal.add.success') });
            }).catch((response) => {
                this.$notify({ type: 'danger', icon: 'tim-icons icon-simple-remove', verticalAlign: 'bottom', horizontalAlign: 'center', message: response });
            });
        }
    }
};
</script>
<style>
</style>
