<template>
    <div class="row">
        <div class="col-lg-4 col-md-6 col-12" v-for="(investment, index) in tableData" :key="investment.sk">
            <card class="card-chart card-chart-pie" :data-target="investment.sk">
                <h5 slot="header" class="card-category">{{ investment.investment_name }}</h5>

                <div class="row">
                    <div class="col-6">
                        <div class="chart-area">
                            <bar-chart :chart-data="calculatePieChart(investment)" :extra-options="extraOptions"
                                :gradient-colors="gradientColors" :gradient-stops="gradientStops" :height="200">
                            </bar-chart>
                        </div>
                    </div>

                    <div class="col-6">
                        <h4 class="card-title">
                            <i class="tim-icons  icon-chart-bar-32 text-primary"></i> {{ investment.current_value }} {{
                                                        currency
                                                        }}
                        </h4>
                        <p class="category">{{ $t('investment.get.invested-amount') }} {{ investment.invested_amount }}
                            {{ currency }}
                        </p>
                    </div>
                </div>

                <div class="text-right">
                    <el-tooltip :content="$t('category.get.table.link')" effect="light" :open-delay="300" placement="top">
                        <nuxt-link to="/investment/investment-link" :class="index > 2 ? 'btn-success' : 'btn-neutral'" icon
                            size="sm" class="btn-link">
                            <i class="tim-icons icon-link-72"></i>
                        </nuxt-link>
                    </el-tooltip>
                    <el-tooltip :content="$t('budget.get.edit')" effect="light" :open-delay="300" placement="top">
                        <nuxt-link :class="index > 2 ? 'btn-warning' : 'btn-neutral'" icon size="sm" class="btn-link"
                            :to="{ name: 'investment-edit___' + $i18n.locale, params: { investment_id: investment.sk, invested_amount: investment.invested_amount, current_value: investment.current_value, investment_name: investment.investment_name } }">
                            <i class="tim-icons icon-pencil"></i>
                        </nuxt-link>
                    </el-tooltip>
                    <el-tooltip :content="$t('budget.get.delete')" effect="light" :open-delay="300" placement="top">
                        <base-button :type="index > 2 ? 'danger' : 'neutral'" icon size="sm" class="btn-link"
                            @click.native="handleDelete(investment)">
                            <i class="tim-icons icon-simple-remove"></i>
                        </base-button>
                    </el-tooltip>
                </div>
            </card>
        </div>
        <div :class="[
                { 'show d-block text-center col-12': noData },
                { 'd-none': !noData }]">
            {{ $t('investment.get.no-data') }}
        </div>
        <div :class="[
                { 'show d-block text-center col-12': loading },
                { 'd-none': !loading }]">
            {{ $t('investment.get.loading') }}
        </div>
    </div>
</template>
<script>
import { BaseTable, BaseProgress } from '@/components';
import Swal from 'sweetalert2';
import config from '@/config';
import BarChart from '@/components/Charts/BarChart';
import * as chartConfigs from '@/components/Charts/config';

export default {
    name: 'display-investments',
    components: {
        BaseTable,
        BaseProgress,
        BarChart
    },
    data() {
        return {
            tableData: [],
            currency: null,
            categories: [],
            noData: false,
            loading: true,
            gradientColors: config.colors.purpleGradient,
            gradientStops: [1, 0]
        };
    },
    computed: {
        extraOptions() {
            chartConfigs.barChartOptionsGradient.tooltips.callbacks = {
                label: function (tooltipItems, _data) {
                    return tooltipItems.label + ' : ' + tooltipItems.yLabel;
                }
            }
            return chartConfigs.barChartOptionsGradient;
        }
    },
    methods: {
        async getInvestments(walletId) {
            await this.$post(process.env.api.investments, {
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
        handleDelete(row) {
            Swal.fire({
                title: this.$nuxt.$t('investment.delete.confirm'),
                text: this.$nuxt.$t('investment.delete.confirmationText'),
                type: 'warning',
                showCancelButton: true,
                confirmButtonClass: 'btn btn-success btn-fill',
                cancelButtonClass: 'btn btn-danger btn-fill',
                confirmButtonText: this.$nuxt.$t('investment.delete.button'),
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

            await this.$post(process.env.api.deleteItem, {
                pk: wallet.WalletId,
                sk: row.sk
            }).then(async () => {
                this.deleteRow(row);
                let deleteDescription = this.$nuxt.$t('investment.delete.success.description');

                this.$notify({ type: 'success', icon: 'tim-icons icon-check-2', verticalAlign: 'bottom', horizontalAlign: 'center', message: deleteDescription + `${row.investment_name}` });
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
        calculatePieChart(investment) {
            return {
                labels: [this.$nuxt.$t('investment.get.invested'), this.$nuxt.$t('investment.get.current')],
                datasets: [
                    {
                        label: 'Investments',
                        fill: true,
                        borderColor: config.colors.danger,
                        borderWidth: 2,
                        borderDash: [],
                        borderDashOffset: 0.0,
                        data: [investment.invested_amount, investment.current_value]
                    }
                ]
            }
        }
    },
    async mounted() {
        // Get Investments
        let wallet = await this.$wallet.setCurrentWallet(this);
        // Wallet Currency
        this.currency = wallet.WalletCurrency;
        await this.getInvestments(wallet.WalletId);
    }
};
</script>
<style></style>