<template>
    <div class="row">
        <div class="col-lg-4 col-md-6 col-12" v-for="(goal, index) in tableData" :key="goal.sk">
            <card class="card-chart card-chart-pie" :data-target="goal.sk">
                <h5 slot="header" class="card-category">{{ goal.goal_name }}</h5>

                <div class="row">
                    <div class="col-6">
                        <div class="chart-area">
                            <pie-chart :chart-data="pieChart1.chartData" :extra-options="pieChart1.extraOptions"
                                :height="120">
                            </pie-chart>
                        </div>
                    </div>

                    <div class="col-6">
                        <h4 class="card-title">
                            <i class="tim-icons  icon-trophy text-success "></i> {{ goal.target_amount }} {{ currency }}
                        </h4>
                        <p class="category">{{ $t('goal.get.targetDate') }} {{ new
                                Date(goal.target_date).toLocaleDateString(
                                    $i18n.locale, {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })
                        }}</p>
                    </div>
                </div>

                <div class="text-right">
                    <el-tooltip :content="$t('budget.get.edit')" effect="light" :open-delay="300" placement="top">
                        <base-button :type="index > 2 ? 'warning' : 'neutral'" icon size="sm" class="btn-link"
                            @click.native="handleEdit(index, goal)">
                            <i class="tim-icons icon-pencil"></i>
                        </base-button>
                    </el-tooltip>
                    <el-tooltip :content="$t('budget.get.delete')" effect="light" :open-delay="300" placement="top">
                        <base-button :type="index > 2 ? 'danger' : 'neutral'" icon size="sm" class="btn-link"
                            @click.native="handleDelete(index, goal)">
                            <i class="tim-icons icon-simple-remove"></i>
                        </base-button>
                    </el-tooltip>
                </div>
            </card>
        </div>
        <div :class="[
        { 'show d-block text-center col-12': noData },
        { 'd-none': !noData }]">
            {{ $t('goal.get.no-data') }}
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
    name: 'display-goals',
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
            pieChart1: {
                chartData: {
                    labels: [1, 2],
                    datasets: [
                        {
                            label: 'Emails',
                            pointRadius: 0,
                            pointHoverRadius: 0,
                            backgroundColor: ['#00c09d', '#e2e2e2'],
                            borderWidth: 0,
                            data: [60, 40]
                        }
                    ]
                },
                extraOptions: chartConfigs.pieChartOptions
            }
        };
    },
    methods: {
        async getGoals(walletId) {
            await this.$axios.$post(process.env.api.goals, {
                wallet_id: walletId,
            }).then((response) => {
                this.tableData = response;
                // Fetch Category information and populate it
                this.fetchCategoryLink();
                // if No Data populate no data
                this.noDataInResponse(response);
                // Loading False
                this.loading = false
            }).catch((response) => {
                this.$notify({ type: 'danger', icon: 'tim-icons icon-simple-remove', verticalAlign: 'bottom', horizontalAlign: 'center', message: response });
            });
        },
        async getCategories(userId) {
            await this.$axios.$post(process.env.api.categories, {
                user_id: userId,
            }).then((response) => {
                // Assign Categories name to the categories
                this.assignCategoriesToTable(response);
            }).catch((response) => {
                let errorMessage = this.$lastElement(this.$splitElement(response.data.errorMessage, ':'));
                this.$notify({ type: 'danger', icon: 'tim-icons icon-simple-remove', verticalAlign: 'bottom', horizontalAlign: 'center', message: errorMessage });
            });
        },
        assignCategoriesToTable(response) {
            if (this.$isEmpty(response)) {
                return;
            }

            for (let i = 0, length = response.length; i < length; i++) {
                let category = response[i];
                let elements = document.getElementsByClassName(category.sk);

                if (this.$isEmpty(elements)) {
                    continue;
                }

                for (let j = 0, len = elements.length; j < len; j++) {
                    let element = elements[j];
                    element.textContent = category.category_type + " : " + category.category_name
                }
            }
        },
        async fetchCategoryLink() {
            // Fetch the current user ID
            let userId = this.$authentication.fetchCurrentUser(this).financialPortfolioId;
            // Fetch Data from API
            await this.getCategories(userId);
        },
        handleEdit(index, row) {
            Swal.fire({
                title: `You want to edit ${row.goal_name}`,
                buttonsStyling: false,
                confirmButtonClass: 'btn btn-info btn-fill'
            });
        },
        handleDelete(index, row) {
            Swal.fire({
                title: this.$nuxt.$t('goal.delete.confirm'),
                text: this.$nuxt.$t('goal.delete.confirmationText'),
                type: 'warning',
                showCancelButton: true,
                confirmButtonClass: 'btn btn-success btn-fill',
                cancelButtonClass: 'btn btn-danger btn-fill',
                confirmButtonText: this.$nuxt.$t('goal.delete.button'),
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
                let deleteDescription = this.$nuxt.$t('goal.delete.success.description');

                this.$notify({ type: 'success', icon: 'tim-icons icon-check-2', verticalAlign: 'bottom', horizontalAlign: 'center', message: deleteDescription + `${row.goal_name}` });
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
    },
    async mounted() {
        // Get Goals
        let wallet = await this.$wallet.setCurrentWallet(this);
        await this.getGoals(wallet.WalletId);
        // Wallet Currency
        this.currency = wallet.WalletCurrency;
    }
};
</script>
<style>
</style>