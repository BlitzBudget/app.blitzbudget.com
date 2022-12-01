<template>
    <div>
        <card type="chart">
            <template slot="header">
                <div class="row">
                    <div class="col-sm-6" :class="isRTL ? 'text-right' : 'text-left'">
                        <h5 class="card-category">{{ new Date().getFullYear() }}</h5>
                        <h2 class="card-title">{{ $t('overview.yearly.title') }}</h2>
                    </div>
                    <div class="col-sm-6 d-flex d-sm-block">
                        <div class="btn-group btn-group-toggle" :class="isRTL ? 'float-left' : 'float-right'"
                            data-toggle="buttons">
                            <label v-for="(option, index) in bigLineChartCategories" :key="option.name"
                                class="btn btn-sm btn-primary btn-simple"
                                :class="{ active: bigLineChart.activeIndex === index }" :id="index">
                                <input type="radio" @click="initBigChart(index)" name="options" autocomplete="off"
                                    :checked="bigLineChart.activeIndex === index" />
                                <span class="d-none d-sm-block">{{ option.name }}</span>
                                <span class="d-block d-sm-none">
                                    <i :class="option.icon"></i>
                                </span>
                            </label>
                        </div>
                    </div>
                </div>
            </template>
            <div class="chart-area">
                <line-chart style="height: 100%" ref="bigChart" :chart-data="bigLineChart.chartData"
                    :gradient-colors="bigLineChart.gradientColors" :gradient-stops="bigLineChart.gradientStops"
                    :extra-options="bigLineChart.extraOptions">
                </line-chart>
            </div>
        </card>
    </div>
</template>
<script>
import config from '@/config';
import * as chartConfigs from '@/components/Charts/config';
import LineChart from '@/components/Charts/LineChart';

export default {
    name: 'transactions-yearly-chart',
    props: ['transactions', 'categories'],
    components: {
        LineChart
    },
    computed: {
        bigLineChartCategories() {
            return this.bigChartTags;
        },
        bigLineChart() {
            // Reset Big Line Chart
            this.resetBigChart();
            // Initialize Big Chart Maps
            let categorizeMap = this.categorizeCategories(this.categories);
            this.calculateNetBigChart(this.transactions);
            this.calculateExpensesByDate(categorizeMap, this.transactions);
            return {
                activeIndex: this.bigChartIndex,
                chartData: {
                    datasets: [{
                        ...this.bigChartDatasetOptions,
                        data: this.bigChartData[this.bigChartIndex]
                    }],
                    labels: this.bigChartLabels[this.bigChartIndex]
                },
                extraOptions: this.extraOptions,
                gradientColors: config.colors.primaryGradient,
                gradientStops: [1, 0.4, 0],
            }
        },
        extraOptions() {
            chartConfigs.purpleChartOptions.scales = {
                yAxes: [{
                    ticks: {
                        callback: (value) => {
                            return `${this.$n(value)} ${this.currency}`;
                        },
                    },
                }],
            };
            chartConfigs.purpleChartOptions.tooltips.callbacks = {
                label: ((tooltipItems) => {
                    return this.$n(tooltipItems.yLabel) + this.currency;
                })
            }
            return chartConfigs.purpleChartOptions;
        },
        isRTL() {
            return this.$rtl.isRTL;
        }
    },
    data() {
        return {
            expenseType: 'Expense',
            incomeType: 'Income',
            bigChartData: [],
            bigChartIndex: 0,
            threeLetterMonths: ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'],
            bigChartLabels: [],
            bigChartDatasetOptions: {
                fill: true,
                borderColor: config.colors.primary,
                borderWidth: 2,
                borderDash: [],
                borderDashOffset: 0.0,
                pointBackgroundColor: config.colors.primary,
                pointBorderColor: 'rgba(255,255,255,0)',
                pointHoverBackgroundColor: config.colors.primary,
                pointBorderWidth: 20,
                pointHoverRadius: 4,
                pointHoverBorderWidth: 15,
                pointRadius: 4,
            },
            bigChartTags: [],
            currency: null
        }
    },
    methods: {
        resetBigChart() {
            this.bigChartData = [];
            this.bigChartLabels = [];
            this.bigChartTags = [];
        },
        initBigChart(index) {
            let chartData = {
                datasets: [{
                    ...this.bigChartDatasetOptions,
                    data: this.bigChartData[index]
                }],
                labels: this.bigChartLabels[index]
            };
            this.$refs.bigChart.updateGradients(chartData);
            this.bigChartIndex = index;
        },
        calculateExpensesByDate(categoriesMap, transactions) {
            if (this.$isEmpty(transactions)) {
                return;
            }

            let expenseChart = new Map();
            let incomeChart = new Map();
            for (let i = 0, length = transactions.length; i < length; i++) {
                let transaction = transactions[i];
                let date = new Date(transaction.creation_date);
                let yearMonth = this.threeLetterMonths[date.getMonth()] + ' ' + date.getFullYear();
                let total = transaction.amount;
                let type = categoriesMap.get(transaction.category_id);

                if (type == this.expenseType) {
                    let expense = expenseChart.get(yearMonth);
                    if (this.$isNotEmpty(expense)) {
                        total = expense + transaction.amount;
                    }

                    expenseChart.set(yearMonth, total);
                } else if (type == this.incomeType) {
                    let income = expenseChart.get(yearMonth);
                    if (this.$isNotEmpty(income)) {
                        total = income + transaction.amount;
                    }

                    incomeChart.set(yearMonth, total);
                }
            }

            this.setExpenseChart(expenseChart);
            this.setIncomeChart(incomeChart);
        },
        setIncomeChart(incomeChart) {
            let data = [];
            let labels = []
            for (const [key, value] of incomeChart) {
                data.push(value);
                labels.push(key);
            }

            if (this.$isEmpty(data)) {
                return;
            }

            // Update the first entry (Net)
            this.bigChartData.push(data);
            this.bigChartLabels.push(labels);
            this.bigChartTags.push({ name: 'Income', icon: 'tim-icons icon-tap-02' });
        },
        setExpenseChart(expenseChart) {
            let data = [];
            let labels = []
            for (const [key, value] of expenseChart) {
                data.push(value);
                labels.push(key);
            }

            if (this.$isEmpty(data)) {
                return;
            }

            // Update the first entry (Net)
            this.bigChartData.push(data);
            this.bigChartLabels.push(labels);
            this.bigChartTags.push({
                name: 'Expenses',
                icon: 'tim-icons icon-gift-2'
            });
        },
        calculateNetBigChart(response) {
            if (this.$isEmpty(response)) {
                return;
            }

            let netChart = new Map();
            for (let i = 0, length = response.length; i < length; i++) {
                let transaction = response[i];
                let date = new Date(transaction.creation_date);
                let yearMonth = this.threeLetterMonths[date.getMonth()] + ' ' + date.getFullYear();
                let net = netChart.get(yearMonth);
                let total = transaction.amount;

                if (this.$isNotEmpty(net)) {
                    total = net + transaction.amount;
                }

                netChart.set(yearMonth, total);
            }

            let data = [];
            let labels = []
            for (const [key, value] of netChart) {
                data.push(value);
                labels.push(key);
            }

            // Update the first entry (Net)
            this.bigChartData.push(data);
            this.bigChartLabels.push(labels);
            this.bigChartTags.push({ name: 'Net', icon: 'tim-icons icon-single-02' });
        },
        categorizeCategories(response) {
            let categoriesMap = new Map();
            for (let i = 0, length = response.length; i < length; i++) {
                let category = response[i];
                let type = category.category_type;
                if (type == this.expenseType) {
                    categoriesMap.set(category.sk, this.expenseType)
                } else {
                    categoriesMap.set(category.sk, this.incomeType);
                }
            }

            return categoriesMap;
        },
    },
    async mounted() {
        let wallet = await this.$wallet.setCurrentWallet(this);
        // Wallet Currency
        this.currency = wallet.WalletCurrency;

        this.initBigChart(0);
    }
}
</script>
<style>

</style>