<template>
    <card class="card">
        <div class="row">
            <div class="col-sm-6">
                <h3 slot="header" class="card-title">{{ $t('investment.link.get.title') }}</h3>
            </div>
            <div class="col-sm-6">
                <nuxt-link to="/investment/link/add" class="btn btn-link btn-primary float-right">{{
                        $t('investment.link.get.add')
                }}
                </nuxt-link>
            </div>
        </div>
        <div class="table-responsive">
            <base-table :data="investmentLink" thead-classes="text-primary">
                <template slot="columns" slot-scope="{ columns }">
                    <th>{{ $t('investment.link.get.table.header.description') }}</th>
                    <th>{{ $t('investment.link.get.table.header.investment') }}</th>
                    <th class="text-right">{{ $t('investment.link.get.table.header.action') }}</th>
                </template>

                <template slot-scope="{ row, index }" :class="[
                { 'show d-block': !noData },
                { 'd-none': noData }]">
                    <td>{{ row.transaction_name }}</td>
                    <td :class="row.investment_id"></td>
                    <td class="text-right">
                        <el-tooltip :content="$t('investment.link.get.table.link')" effect="light" :open-delay="300"
                            placement="top">
                            <nuxt-link
                                :to="{ path: '/investment/link/add', query: { investment_id: row.investment_id } }"
                                :type="index > 2 ? 'success' : 'neutral'" icon size="sm" class="btn-link btn-neutral">
                                <i class="tim-icons icon-link-72"></i>
                            </nuxt-link>
                        </el-tooltip>
                        <el-tooltip :content="$t('investment.link.get.table.investment')" effect="light"
                            :open-delay="300" placement="top">
                            <nuxt-link to='/investments' :type="index > 2 ? 'success' : 'neutral'" icon size="sm"
                                class="btn-link btn-neutral">
                                <i class="tim-icons icon-chart-bar-32"></i>
                            </nuxt-link>
                        </el-tooltip>
                        <el-tooltip :content="$t('investment.link.get.table.delete')" effect="light" :open-delay="300"
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
                {{ $t('investment.link.get.no-data') }}
            </div>
            <!-- small modal -->
            <modal :show.sync="modals.mini" class="modal-primary" :show-close="true"
                headerClasses="justify-content-center" type="mini">
                <p>{{ $t('investment.link.delete.description') }}</p>
                <template slot="footer">
                    <base-button type="neutral" link @click.native="modals.mini = false">{{
                            $t('investment.link.get.back')
                    }}
                    </base-button>
                    <base-button @click="deleteItem()" type="neutral" link>{{ $t('investment.link.get.delete') }}
                    </base-button>
                </template>
            </modal>
        </div>
    </card>
</template>
<script>
import { BaseTable, BaseProgress, Modal } from '@/components';

export default {
    name: 'investment-link',
    components: {
        BaseTable,
        BaseProgress,
        Modal
    },
    data() {
        return {
            investmentLink: [],
            modals: {
                mini: false
            },
            investmentRuleId: null,
            noData: false
        };
    },
    methods: {
        openModal(investmentRuleId) {
            this.modals.mini = true;
            this.investmentRuleId = investmentRuleId;
        },
        closeModal() {
            this.modals.mini = false;
            this.investmentRuleId = null;
        },
        async deleteItem() {
            // Fetch the current user ID
            let wallet = await this.$wallet.setCurrentWallet(this);

            await this.$axios.$post(process.env.api.deleteItem, {
                pk: wallet.WalletId,
                sk: this.investmentRuleId
            }).then(async () => {
                this.closeModal();
                await this.fetchInvestmentLink();
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
        async fetchInvestmentLink() {
            // Fetch the current user ID
            let wallet = await this.$wallet.setCurrentWallet(this);
            // Fetch Investment ID from parameter
            let selectedInvestmentId = this.$route.query.investment_id;
            // Fetch Data from API
            await this.getInvestmentRules(wallet.WalletId, selectedInvestmentId);
        },
        async getInvestmentRules(walletId, investmentId) {
            await this.$axios.$post(process.env.api.rules.investment, {
                wallet_id: walletId,
                investment_id: investmentId
            }).then(async (response) => {
                this.investmentLink = response;
                // if No Data populate no data
                this.noDataInResponse(response);
                // Fetch Investments
                await this.getInvestments(response);
            }).catch((response) => {
                this.$notify({ type: 'danger', icon: 'tim-icons icon-simple-remove', verticalAlign: 'bottom', horizontalAlign: 'center', message: response });
            });
        },
        async getInvestments(investmentRuleResponse) {
            if (this.$isEmpty(investmentRuleResponse)) {
                return;
            }
            // Fetch the current user ID
            let wallet = await this.$wallet.setCurrentWallet(this);
            await this.$axios.$post(process.env.api.investments, {
                wallet_id: wallet.WalletId,
            }).then((response) => {
                this.assignInvestmentsToTable(response);
            }).catch((response) => {
                this.$notify({ type: 'danger', icon: 'tim-icons icon-simple-remove', verticalAlign: 'bottom', horizontalAlign: 'center', message: response });
            });
        },
        assignInvestmentsToTable(response) {
            if (this.$isEmpty(response)) {
                return;
            }

            for (let i = 0, length = response.length; i < length; i++) {
                let investment = response[i];
                let elements = document.getElementsByClassName(investment.sk);

                if (this.$isEmpty(elements)) {
                    continue;
                }

                for (let j = 0, len = elements.length; j < len; j++) {
                    let element = elements[j];
                    element.textContent = investment.investment_name
                }
            }
        },
    },
    async mounted() {
        await this.fetchInvestmentLink();
    }
};
</script>
<style>
</style>
