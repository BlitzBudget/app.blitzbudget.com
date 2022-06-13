<template>
    <div class="row">
        <div class="col-lg-4 col-md-6 col-12" v-for="(debt, index) in tableData" :key="debt.sk">
            <card class="card-chart card-chart-pie" :data-target="debt.sk">
                <h5 slot="header" class="card-category">{{ debt.debt_name }}</h5>

                <div class="row">
                    <div class="col-6">
                        <div class="chart-area">
                            <pie-chart :chart-data="calculatePieChart(debt)" :extra-options="extraOptions"
                                :height="120">
                            </pie-chart>
                        </div>
                    </div>

                    <div class="col-6">
                        <h4 class="card-title">
                            <i class="tim-icons icon-credit-card text-success "></i> {{ $n(debt.current_value) }} {{
                                    currency
                            }}
                        </h4>
                        <p class="category">{{ $t('debt.get.debted-amount') }} {{ $n(debt.debted_amount) }}
                            {{ currency }}
                        </p>
                    </div>
                </div>

                <div class="text-right">
                    <el-tooltip :content="$t('budget.get.edit')" effect="light" :open-delay="300" placement="top">
                        <base-button :type="index > 2 ? 'warning' : 'neutral'" icon size="sm" class="btn-link"
                            @click.native="handleEdit(index, debt)">
                            <i class="tim-icons icon-pencil"></i>
                        </base-button>
                    </el-tooltip>
                    <el-tooltip :content="$t('budget.get.delete')" effect="light" :open-delay="300" placement="top">
                        <base-button :type="index > 2 ? 'danger' : 'neutral'" icon size="sm" class="btn-link"
                            @click.native="handleDelete(index, debt)">
                            <i class="tim-icons icon-simple-remove"></i>
                        </base-button>
                    </el-tooltip>
                </div>
            </card>
        </div>
        <div :class="[
        { 'show d-block text-center col-12': noData },
        { 'd-none': !noData }]">
            {{ $t('debt.get.no-data') }}
        </div>
        <div :class="[
        { 'show d-block text-center col-12': loading },
        { 'd-none': !loading }]">
            {{ $t('budget.get.loading') }}
        </div>
    </div>
</template>
<script>
import { BaseTable, BaseProgress } from '@/components';
import Swal from 'sweetalert2';
import PieChart from '@/components/Charts/PieChart';
import * as chartConfigs from '@/components/Charts/config';

export default {
    name: 'display-debts',
    components: {
        BaseTable,
        BaseProgress,
        PieChart
    },
    data() {
        return {
            tableData: [],
            currency: null,
            categories: [],
            noData: false,
            loading: true,
            extraOptions: chartConfigs.pieChartOptions
        };
    },
    methods: {
        async getDebts(walletId) {
            await this.$axios.$post(process.env.api.debts, {
                wallet_id: walletId,
            }).then((response) => {
                this.tableData = response;
                // if No Data populate no data
                this.noDataInResponse(response);
                // Loading False
                this.loading = false
            }).catch((response) => {
                this.$notify({ type: 'danger', icon: 'tim-icons icon-simple-remove', verticalAlign: 'bottom', horizontalAlign: 'center', message: response });
            });
        },
        handleEdit(index, row) {
            Swal.fire({
                title: `You want to edit ${row.debt_name}`,
                buttonsStyling: false,
                confirmButtonClass: 'btn btn-info btn-fill'
            });
        },
        handleDelete(index, row) {
            Swal.fire({
                title: this.$nuxt.$t('debt.delete.confirm'),
                text: this.$nuxt.$t('debt.delete.confirmationText'),
                type: 'warning',
                showCancelButton: true,
                confirmButtonClass: 'btn btn-success btn-fill',
                cancelButtonClass: 'btn btn-danger btn-fill',
                confirmButtonText: this.$nuxt.$t('debt.delete.button'),
                buttonsStyling: false
            }).then(async result => {
                if (result.value) {
                    await this.deleteItem(row);
                }
            });
        },
        async deleteItem(row) {
            // Fetch the current user ID
            let wallet = await this.$wallet.setCurrentWallet(this);

            await this.$axios.$post(process.env.api.deleteItem, {
                pk: wallet.WalletId,
                sk: row.sk
            }).then(async () => {
                this.deleteRow(row);
                let deleteDescription = this.$nuxt.$t('debt.delete.success.description');

                this.$notify({ type: 'success', icon: 'tim-icons icon-check-2', verticalAlign: 'bottom', horizontalAlign: 'center', message: deleteDescription + `${row.debt_name}` });
            }).catch((response) => {
                this.$notify({ type: 'danger', icon: 'tim-icons icon-simple-remove', verticalAlign: 'bottom', horizontalAlign: 'center', message: response });
                this.closeModal();
            });
        },
        deleteRow(row) {
            let indexToDelete = this.tableData.findIndex(
                tableRow => tableRow.id === row.id
            );
            if (indexToDelete >= 0) {
                this.tableData.splice(indexToDelete, 1);
            }
        },
        noDataInResponse(response) {
            if (this.$isEmpty(response)) {
                this.noData = true;
            }
        },
        calculatePieChart(debt) {
            let pending_amount = debt.debted_amount - debt.current_value;
            return {
                labels: [this.$nuxt.$t('debt.get.repaid'), this.$nuxt.$t('debt.get.pending')],
                datasets: [
                    {
                        label: 'Debts',
                        pointRadius: 0,
                        pointHoverRadius: 0,
                        backgroundColor: ['#00c09d', '#e2e2e2'],
                        borderWidth: 0,
                        data: [debt.current_value, pending_amount]
                    }
                ]
            }
        }
    },
    async mounted() {
        // Get Debts
        let wallet = await this.$wallet.setCurrentWallet(this);
        await this.getDebts(wallet.WalletId);
        // Wallet Currency
        this.currency = wallet.WalletCurrency;
    }
};
</script>
<style>
</style>