<template>
    <card class="card">
        <div class="row">
            <div class="col-sm-6">
                <h3 slot="header" class="card-title">{{ $t('goal.link.get.title') }}</h3>
            </div>
            <div class="col-sm-6">
                <nuxt-link to="/goal/link/add" class="btn btn-link btn-primary float-right">{{
                        $t('goal.link.get.add')
                }}
                </nuxt-link>
            </div>
        </div>
        <div class="table-responsive">
            <base-table :data="goalLink" thead-classes="text-primary">
                <template slot="columns" slot-scope="{ columns }">
                    <th>{{ $t('goal.link.get.table.header.description') }}</th>
                    <th>{{ $t('goal.link.get.table.header.goal') }}</th>
                    <th class="text-right">{{ $t('goal.link.get.table.header.action') }}</th>
                </template>

                <template slot-scope="{ row, index }" :class="[
                { 'show d-block': !noData },
                { 'd-none': noData }]">
                    <td>{{ row.transaction_name }}</td>
                    <td :class="row.goal_id"></td>
                    <td class="text-right">
                        <el-tooltip :content="$t('goal.link.get.table.link')" effect="light" :open-delay="300"
                            placement="top">
                            <nuxt-link :to="{ path: '/goal/link/add', query: { goal_id: row.goal_id } }"
                                :type="index > 2 ? 'success' : 'neutral'" icon size="sm" class="btn-link btn-neutral">
                                <i class="tim-icons icon-link-72"></i>
                            </nuxt-link>
                        </el-tooltip>
                        <el-tooltip :content="$t('goal.link.get.table.goal')" effect="light" :open-delay="300"
                            placement="top">
                            <nuxt-link to='/goals' :type="index > 2 ? 'success' : 'neutral'" icon size="sm"
                                class="btn-link btn-neutral">
                                <i class="tim-icons icon-components"></i>
                            </nuxt-link>
                        </el-tooltip>
                        <el-tooltip :content="$t('goal.link.get.table.delete')" effect="light" :open-delay="300"
                            placement="top">
                            <base-button @click="openModal(row.sk)" :type="index > 2 ? 'danger' : 'neutral'" icon
                                size="sm" class="btn-link">
                                <i class="tim-icons icon-simple-remove"></i>
                            </base-button>
                        </el-tooltip>
                    </td>
                </template>
            </base-table>
            <div :class="[
            { 'show d-block text-center': noData },
            { 'd-none': !noData }]">
                {{ $t('goal.link.get.no-data') }}
            </div>
            <!-- small modal -->
            <modal :show.sync="modals.mini" class="modal-primary" :show-close="true"
                headerClasses="justify-content-center" type="mini">
                <div slot="header" class="modal-profile">
                    <i class="tim-icons icon-single-02"></i>
                </div>
                <p>{{ $t('goal.link.delete.description') }}</p>
                <template slot="footer">
                    <base-button type="neutral" link @click.native="modals.mini = false">{{
                            $t('goal.link.get.back')
                    }}
                    </base-button>
                    <base-button @click="deleteItem()" type="neutral" link>{{ $t('goal.link.get.delete') }}
                    </base-button>
                </template>
            </modal>
        </div>
    </card>
</template>
<script>
import { BaseTable, BaseProgress, Modal } from '@/components';

export default {
    name: 'goal-link',
    components: {
        BaseTable,
        BaseProgress,
        Modal
    },
    data() {
        return {
            goalLink: [],
            modals: {
                mini: false
            },
            goalRuleId: null,
            noData: false
        };
    },
    methods: {
        openModal(goalRuleId) {
            this.modals.mini = true;
            this.goalRuleId = goalRuleId;
        },
        closeModal() {
            this.modals.mini = false;
            this.goalRuleId = null;
        },
        async deleteItem() {
            // Fetch the current user ID
            let wallet = await this.$wallet.setCurrentWallet(this);

            await this.$axios.$post(process.env.api.deleteItem, {
                pk: wallet.WalletId,
                sk: this.goalRuleId
            }).then(async () => {
                this.closeModal();
                await this.fetchGoalLink();
            }).catch((response) => {
                this.$notify({ type: 'danger', icon: 'tim-icons icon-simple-remove', verticalAlign: 'bottom', horizontalAlign: 'center', message: response });
                this.closeModal();
            });
        },
        noDataInResponse(response) {
            if (this.$isEmpty(response)) {
                this.noData = true;
            }
        },
        async fetchGoalLink() {
            // Fetch the current user ID
            let wallet = await this.$wallet.setCurrentWallet(this);
            // Fetch Goal ID from parameter
            let selectedGoalId = this.$route.query.goal_id;
            // Fetch Data from API
            await this.getGoalRules(wallet.WalletId, selectedGoalId);
        },
        async getGoalRules(walletId, goalId) {
            await this.$axios.$post(process.env.api.rules.goal, {
                wallet_id: walletId,
                goal_id: goalId
            }).then(async (response) => {
                this.goalLink = response;
                // if No Data populate no data
                this.noDataInResponse(response);
                // Fetch Goals
                await this.getGoals(response);
            }).catch((response) => {
                this.$notify({ type: 'danger', icon: 'tim-icons icon-simple-remove', verticalAlign: 'bottom', horizontalAlign: 'center', message: response });
            });
        },
        async getGoals(goalRuleResponse) {
            if (this.$isEmpty(goalRuleResponse)) {
                return;
            }

            // Fetch the current user ID
            let wallet = await this.$wallet.setCurrentWallet(this);
            await this.$axios.$post(process.env.api.goals, {
                wallet_id: wallet.WalletId,
            }).then((response) => {
                this.assignGoalsToTable(response);
            }).catch((response) => {
                this.$notify({ type: 'danger', icon: 'tim-icons icon-simple-remove', verticalAlign: 'bottom', horizontalAlign: 'center', message: response });
            });
        },
        assignGoalsToTable(response) {
            if (this.$isEmpty(response)) {
                return;
            }

            for (let i = 0, length = response.length; i < length; i++) {
                let goal = response[i];
                let elements = document.getElementsByClassName(goal.sk);

                if (this.$isEmpty(elements)) {
                    continue;
                }

                for (let j = 0, len = elements.length; j < len; j++) {
                    let element = elements[j];
                    element.textContent = goal.goal_name
                }
            }
        },
    },
    async mounted() {
        await this.fetchGoalLink();
    }
};
</script>
<style>
</style>
