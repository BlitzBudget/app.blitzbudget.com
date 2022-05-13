<template>
    <div class="container login-page">
        <notifications></notifications>
        <div class="row">
            <div class="col-md-12">
                <goal-form @on-submit="addGoal" :class="[
                { 'show d-block': !hasSucceeded },
                { 'd-none': hasSucceeded }]"></goal-form>
            </div>
            <div class="col-md-12 ml-auto-mr-auto">
                <!-- Success Message Tab -->
                <card type="testimonial" header-classes="card-header-avatar" :class="[
                { 'show d-block': hasSucceeded },
                { 'd-none': !hasSucceeded }]">
                    <p class="card-description">
                        {{ $t('support.ask-us-directly.success.description') }}
                    </p>

                    <template slot="footer">
                        <nuxt-link to="/" class="btn btn-primary">
                            {{ $t('support.ask-us-directly.success.button') }}
                        </nuxt-link>
                    </template>
                </card>
            </div>
        </div>
    </div>
</template>
<script>
import GoalForm from '@/components/Goals/AddForm.vue';

export default {
    name: 'validation-forms',
    components: {
        GoalForm,
    },
    data() {
        return {
            goalModel: {},
            hasSucceeded: false
        };
    },
    methods: {
        async addGoal(model) {
            if (!isValid) {
                return;
            }

            this.goalModel = model;
            await this.$axios.$put(process.env.api.goals, {
                walletId: model.walletId,
                targetId: model.targetId,
                targetType: model.targetType,
                targetDate: model.targetDate,
                targetAmount: model.targetAmount,
                monthlyContribution: model.monthlyContribution,
                goalType: model.goalType
            }).then(() => {
                this.hasSucceeded = true;
            }).catch(({ response }) => {
                let errorMessage = this.$lastElement(this.$splitElement(response.data.errorMessage, ':'));
                this.$notify({ type: 'danger', message: errorMessage });
            });
        }
    }
};
</script>
<style>
</style>
