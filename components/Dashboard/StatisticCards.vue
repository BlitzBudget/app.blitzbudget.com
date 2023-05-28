<template>
    <div class="row">
        <div class="col-lg-3 col-md-6" v-for="card in statsCards" :key="card.subTitle">
            <stats-card :title="card.title" :sub-title="card.subTitle" :type="card.type" :icon="card.icon">
                <div slot="footer">
                    <nuxt-link :to="card.footer.url" class="btn-link" :class="card.footer.class">{{ card.footer.title }}
                    </nuxt-link>
                </div>
            </stats-card>
        </div>
        <div class="col-lg-3 col-md-6">
            <stats-card :title="calculateExpenses" :sub-title="$t('overview.statscard.expense.title')" type="danger"
                icon="tim-icons icon-coins">
                <div slot="footer">
                    <nuxt-link to="/transactions" class="btn-link btn-danger">{{ $t('overview.statscard.expense.add') }}
                    </nuxt-link>
                </div>
            </stats-card>
        </div>
        <div class="col-lg-3 col-md-6">
            <stats-card :title="calculateIncome" :sub-title="$t('overview.statscard.income.title')" type="info"
                icon="tim-icons icon-coins">
                <div slot="footer">
                    <nuxt-link to="/transactions" class="btn-link btn-info">{{ $t('overview.statscard.income.add') }}
                    </nuxt-link>
                </div>
            </stats-card>
        </div>
    </div>
</template>
<script>
import StatsCard from '@/components/Cards/StatsCard';

export default {
    name: 'statistice-cards',
    props: ['transactions', 'categories'],
    components: {
        StatsCard
    },
    computed: {
        calculateExpenses() {
            return this.$n(this.averageExpense) + this.currency;
        },
        calculateIncome() {
            // Also loads Expenses
            let transactionCategory = this.segregateTransactionByCategory(this.transactions);
            this.calculateAverages(this.categories, transactionCategory);
            return this.$n(this.averageIncome) + this.currency
        },
    },
    data() {
        return {
            averageIncome: 0,
            averageExpense: 0,
            totalInvestment: 0,
            expenseType: 'Expense',
            totalDebts: 0,
            statsCards: [],
            investmentData: [],
            debtData: [],
            currency: null,
        }
    },
    methods: {
        async getInvestments(walletId) {
            await this.$post(process.env.api.investments, {
                wallet_id: walletId,
            }).then((response) => {
                this.investmentData = response;
                this.calculateInvestments(response);
            }).catch((response) => {
                this.$notify({ type: 'danger', icon: 'tim-icons icon-simple-remove', verticalAlign: 'bottom', horizontalAlign: 'center', message: response });
            });
        },
        calculateInvestments(response) {
            let totalInvestmentAmount = 0;
            for (let i = 0, length = response.length; i < length; i++) {
                let investment = response[i];
                totalInvestmentAmount += investment.current_value;
            }

            // Total Investments
            this.totalInvestment = totalInvestmentAmount;
            this.statsCards.push({
                title: this.$n(this.totalInvestment) + this.currency,
                subTitle: this.$nuxt.$t('overview.statscard.investments.title'),
                type: 'warning',
                icon: 'tim-icons icon-chart-bar-32',
                footer: {
                    url: "/investments",
                    title: this.$nuxt.$t('overview.statscard.investments.add'),
                    class: 'btn-warning'
                }
            })
        },
        async getDebts(walletId) {
            await this.$post(process.env.api.debts, {
                wallet_id: walletId,
            }).then((response) => {
                this.debtData = response;
                // Total Debt
                this.calculateDebt(response);
            }).catch((response) => {
                this.$notify({ type: 'danger', icon: 'tim-icons icon-simple-remove', verticalAlign: 'bottom', horizontalAlign: 'center', message: response });
            });
        },
        calculateDebt(response) {
            let totalDebtAmount = 0;
            for (let i = 0, length = response.length; i < length; i++) {
                let debt = response[i];
                totalDebtAmount += debt.debted_amount - debt.current_value;
            }

            // Total Debt
            this.totalDebts = totalDebtAmount;
            this.statsCards.push({
                title: this.$n(this.totalDebts) + this.currency,
                subTitle: this.$nuxt.$t('overview.statscard.debts.title'),
                type: 'primary',
                icon: 'tim-icons icon-credit-card',
                footer: {
                    url: "/debts",
                    title: this.$nuxt.$t('overview.statscard.debts.add'),
                    class: 'btn-primary'
                }
            })
        },
        calculateAverages(response, transactionCategories) {
            let expenseTotal = 0;
            let incomeTotal = 0;

            if (this.$isNotEmpty(response)) {
                for (let i = 0, length = response.length; i < length; i++) {
                    let category = response[i];
                    let totalTransactionAmount = transactionCategories.get(category.sk);

                    if (this.$isNumeric(totalTransactionAmount)) {
                        let type = category.category_type;
                        if (type == this.expenseType) {
                            expenseTotal += totalTransactionAmount;
                        } else {
                            incomeTotal += totalTransactionAmount;
                        }
                    }
                }
                // Calculate Averages
                this.averageExpense = expenseTotal / 12;
                this.averageIncome = incomeTotal / 12;
            }
        },
        segregateTransactionByCategory(response) {
            let transactionCategories = new Map();
            for (let i = 0, length = response.length; i < length; i++) {
                let transaction = response[i];
                let amount = transactionCategories.get(transaction.category_id);

                if (this.$isEmpty(amount)) {
                    transactionCategories.set(transaction.category_id, transaction.amount);
                } else {
                    let total = amount + transaction.amount;
                    transactionCategories.set(transaction.category_id, total);
                }
            }

            return transactionCategories;
        },
    },
    async mounted() {
        let wallet = await this.$wallet.setCurrentWallet(this);
        // Wallet Currency
        this.currency = wallet.WalletCurrency;

        // Fetch Investments
        await this.getInvestments(wallet.WalletId);

        // Fetch Debt
        await this.getDebts(wallet.WalletId);
    }
}
</script>
<style></style>