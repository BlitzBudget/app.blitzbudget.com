<template>
    <card class="card">
        <div class="row">
            <div class="col-sm-6">
                <h3 slot="header" class="card-title">{{ $t('debt.link.get.title') }}</h3>
            </div>
            <div class="col-sm-6">
                <nuxt-link to="/debt/link/add" class="btn btn-link btn-primary float-right">{{
                                    $t('debt.link.get.add')
                                    }}
                </nuxt-link>
            </div>
        </div>
        <div class="table-responsive">
            <base-table :data="debtLink" thead-classes="text-primary">
                <template slot="columns" slot-scope="{ columns }">
                    <th>{{ $t('debt.link.get.table.header.description') }}</th>
                    <th>{{ $t('debt.link.get.table.header.debt') }}</th>
                    <th class="text-right">{{ $t('debt.link.get.table.header.action') }}</th>
                </template>

                <template slot-scope="{ row, index }" :class="[
                                { 'show d-block': !noData },
                                { 'd-none': noData }]">
                    <td>{{ row.transaction_name }}</td>
                    <td :class="row.debt_id"></td>
                    <td class="text-right">
                        <el-tooltip :content="$t('debt.link.get.table.link')" effect="light" :open-delay="300"
                            placement="top">
                            <nuxt-link :to="{ path: '/debt/link/add', query: { debt_id: row.debt_id } }"
                                :type="index > 2 ? 'success' : 'neutral'" icon size="sm" class="btn-link btn-neutral">
                                <i class="tim-icons icon-link-72"></i>
                            </nuxt-link>
                        </el-tooltip>
                        <el-tooltip :content="$t('debt.link.get.table.debt')" effect="light" :open-delay="300"
                            placement="top">
                            <nuxt-link to='/debts' :type="index > 2 ? 'success' : 'neutral'" icon size="sm"
                                class="btn-link btn-neutral">
                                <i class="tim-icons icon-credit-card"></i>
                            </nuxt-link>
                        </el-tooltip>
                        <el-tooltip :content="$t('debt.link.get.table.delete')" effect="light" :open-delay="300"
                            placement="top">
                            <base-button @click="openModal(row.sk)" :type="index > 2 ? 'danger' : 'neutral'" icon size="sm"
                                class="btn-link">
                                <i class="tim-icons icon-simple-remove"></i>
                            </base-button>
                        </el-tooltip>
                    </td>
                </template>
            </base-table>
            <div :class="[
                        { 'show d-block text-center': noData },
                        { 'd-none': !noData }]">
                {{ $t('debt.link.get.no-data') }}
            </div>
            <!-- small modal -->
            <modal :show.sync="modals.mini" class="modal-primary" :show-close="true" headerClasses="justify-content-center"
                type="mini">
                <p>{{ $t('debt.link.delete.description') }}</p>
                <template slot="footer">
                    <base-button type="neutral" link @click.native="modals.mini = false">{{
                                            $t('debt.link.get.back')
                                            }}
                    </base-button>
                    <base-button @click="deleteItem()" type="neutral" link>{{ $t('debt.link.get.delete') }}
                    </base-button>
                </template>
            </modal>
        </div>
    </card>
</template>
<script>
import { BaseTable, BaseProgress, Modal } from '@/components';

export default {
    name: 'debt-link',
    components: {
        BaseTable,
        BaseProgress,
        Modal
    },
    data() {
        return {
            debtLink: [],
            modals: {
                mini: false
            },
            debtRuleId: null,
            noData: false
        };
    },
    methods: {
        openModal(debtRuleId) {
            this.modals.mini = true;
            this.debtRuleId = debtRuleId;
        },
        closeModal() {
            this.modals.mini = false;
            this.debtRuleId = null;
        },
        async deleteItem() {
            // Fetch the current user ID
            let wallet = await this.$wallet.setCurrentWallet(this);

            await this.$post(process.env.api.deleteItem, {
                pk: wallet.WalletId,
                sk: this.debtRuleId
            }).then(async () => {
                this.closeModal();
                await this.fetchDebtLink();
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
        async fetchDebtLink() {
            // Fetch the current user ID
            let wallet = await this.$wallet.setCurrentWallet(this);
            // Fetch Debt ID from parameter
            let selectedDebtId = this.$route.query.debt_id;
            // Fetch Data from API
            await this.getDebtRules(wallet.WalletId, selectedDebtId);
        },
        async getDebtRules(walletId, debtId) {
            await this.$post(process.env.api.rules.debt, {
                wallet_id: walletId,
                debt_id: debtId
            }).then(async (response) => {
                this.debtLink = response;
                // if No Data populate no data
                this.noDataInResponse(response);
                // Fetch Debts
                await this.getDebts(response);
            }).catch((response) => {
                this.$notify({ type: 'danger', icon: 'tim-icons icon-simple-remove', verticalAlign: 'bottom', horizontalAlign: 'center', message: response });
            });
        },
        async getDebts(debtRuleResponse) {
            if (this.$isEmpty(debtRuleResponse)) {
                return;
            }

            // Fetch the current user ID
            let wallet = await this.$wallet.setCurrentWallet(this);
            await this.$post(process.env.api.debts, {
                wallet_id: wallet.WalletId,
            }).then((response) => {
                this.assignDebtsToTable(response);
            }).catch((response) => {
                this.$notify({ type: 'danger', icon: 'tim-icons icon-simple-remove', verticalAlign: 'bottom', horizontalAlign: 'center', message: response });
            });
        },
        assignDebtsToTable(response) {
            if (this.$isEmpty(response)) {
                return;
            }

            for (let i = 0, length = response.length; i < length; i++) {
                let debt = response[i];
                let elements = document.getElementsByClassName(debt.sk);

                if (this.$isEmpty(elements)) {
                    continue;
                }

                for (let j = 0, len = elements.length; j < len; j++) {
                    let element = elements[j];
                    element.textContent = debt.debt_name;
                }
            }
        },
    },
    async mounted() {
        await this.fetchDebtLink();
    }
};
</script>
<style></style>
