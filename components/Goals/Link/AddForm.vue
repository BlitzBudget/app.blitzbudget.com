<template>
    <form>
        <card footer-classes="text-left">
            <div slot="header">
                <h4 class="card-title">{{ $t('goal.link.add.title') }}</h4>
            </div>
            <div>
                <el-tooltip :content="$t('goal.link.add.tooltip')" effect="light" :open-delay="300" placement="top">
                    <base-input :label="$t('goal.link.add.transactionDescription')" required
                        v-model="model.transactionDescription" v-validate="modelValidations.transactionDescription"
                        :error="getError('transactionDescription')" name="transactionDescription" autofocus>
                    </base-input>
                </el-tooltip>

                <base-input :label="$t('goal.link.add.goalId')" required :error="getError('goalId')" name="goalId">
                    <el-select v-model="model.goalId" class="select-primary" name="goalId"
                        v-validate="modelValidations.goalId" :loading="loadingDataForSelect" :clearable="clearable"
                        autocomplete="on" :filterable="filterable">
                        <el-option v-for="goal in goals" class="select-primary" :label="getGoalValue(goal)" :value="goal.sk"
                            :key="goal.sk" :selected="isSelected(goal)">
                        </el-option>
                    </el-select>
                </base-input>

                <div class="small form-goal">{{ $t('goal.link.add.required-fields') }}</div>
            </div>

            <template slot="footer">
                <base-button native-type="submit" @click.native.prevent="validate" type="primary">{{
                                    $t('goal.link.add.submit')
                                    }}</base-button>
                <nuxt-link class="float-right" :to="{ path: '/goal/goal-link', query: { goal_id: this.selectedGoalId } }">
                    {{
                                        $t('goal.link.add.viewGoalRule')
                                        }}</nuxt-link>
            </template>
        </card>
    </form>
</template>
<script>
import { Select, Option } from 'element-ui';

export default {
    components: {
        [Select.name]: Select,
        [Option.name]: Option
    },
    data() {
        return {
            selectedGoalId: '',
            filterable: true,
            clearable: true,
            model: {
                transactionDescription: null,
                goalId: null,
            },
            modelValidations: {
                transactionDescription: {
                    required: true
                },
                goalId: {
                    required: true
                }
            },
            goals: [],
            loadingDataForSelect: true
        };
    },
    methods: {
        getGoalValue(goal) {
            return goal.goal_name
        },
        isSelected(goal) {
            return (goal.sk === this.selectedGoalId);
        },
        getError(fieldName) {
            return this.errors.first(fieldName);
        },
        async validate() {
            // Fetch the current wallet Id
            let wallet = await this.$wallet.setCurrentWallet(this);

            this.$validator.validateAll().then(isValid => {
                this.$emit('on-submit', this.model, isValid, wallet.WalletId);
            });
        },
        async getGoals(walletId) {
            await this.$post(process.env.api.goals, {
                wallet_id: walletId,
            }).then((response) => {
                this.goals = response;
                // Change loading to false
                this.loadingDataForSelect = false
            }).catch((response) => {
                let errorMessage = this.$lastElement(this.$splitElement(response.data.errorMessage, ':'));
                this.$notify({ type: 'danger', icon: 'tim-icons icon-simple-remove', verticalAlign: 'bottom', horizontalAlign: 'center', message: errorMessage });
            });
        }
    },
    async mounted() {
        // Set the selcted goal ID
        this.selectedGoalId = this.$route.query.goal_id;
        this.model.goalId = this.selectedGoalId;
        // Set Transaction Description to input
        this.model.transactionDescription = this.$route.query.transaction_description;
        // Fetch the wallet ID
        let wallet = await this.$wallet.setCurrentWallet(this);
        // Fetch Data from API
        await this.getGoals(wallet.WalletId);
    }
};
</script>
<style></style>