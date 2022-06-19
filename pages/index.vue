<template>
  <div class="row">
    <!-- Big Chart -->
    <div class="col-12">
      <transactions-yearly-chart :transactions="transactions" :categories="categories"></transactions-yearly-chart>
    </div>
    <!-- Stats Cards -->
    <div class="col-12">
      <statistic-cards :transactions="transactions" :categories="categories"></statistic-cards>
    </div>
    <div class="col-lg-5">
      <card type="tasks" :header-classes="{ 'text-right': isRTL }">
        <template slot="header">
          <h6 class="title d-inline">Tasks (5)</h6>
          <p class="card-category d-inline">Today</p>
          <base-dropdown menu-on-right="" tag="div" title-classes="btn btn-link btn-icon"
            :class="{ 'float-left': isRTL }">
            <i slot="title" class="tim-icons icon-settings-gear-63"></i>
            <a class="dropdown-item" href="#pablo"> Action </a>
            <a class="dropdown-item" href="#pablo"> Another action </a>
            <a class="dropdown-item" href="#pablo"> Something else </a>
          </base-dropdown>
        </template>
        <div class="table-full-width table-responsive">
          <task-list></task-list>
        </div>
      </card>
    </div>
  </div>
</template>
<script>
import LineChart from '@/components/Charts/LineChart';
import BarChart from '@/components/Charts/BarChart';
import TaskList from '@/components/Dashboard/TaskList';
import StatsCard from '@/components/Cards/StatsCard';
import StatisticCards from '@/components/Dashboard/StatisticCards';
import TransactionsYearlyChart from '~/components/Dashboard/TransactionsYearlyChart.vue';


export default {
  name: 'dashboard',
  components: {
    LineChart,
    BarChart,
    StatsCard,
    TaskList,
    StatisticCards,
    TransactionsYearlyChart
  },
  data() {
    return {
      startsWithDate: null,
      endsWithDate: null,
      currency: null,
      transactions: [],
      categories: [],
    }
  },
  computed: {
    enableRTL() {
      return this.$route.query.enableRTL;
    },
    isRTL() {
      return this.$rtl.isRTL;
    }
  },
  methods: {
    async fetchOverview() {
      // Set Date for Fetching Transactios
      this.setDatesToFetchTransaction();

      let wallet = await this.$wallet.setCurrentWallet(this);
      // Wallet Currency
      this.currency = wallet.WalletCurrency;

      // Get Transactions
      await this.getTransactions(wallet.WalletId);

    },
    setDatesToFetchTransaction() {
      let date = new Date();

      this.setEndsWithDate(date);
      this.setStartsWithDate(date);
    },
    setEndsWithDate(date) {
      let endsWithDate = new Date(date.getFullYear(), 12, 1);
      this.endsWithDate = endsWithDate.toISOString().substring(0, 10);
    },
    setStartsWithDate(date) {
      let startsWithDate = new Date(date.getFullYear(), 0, 0);
      this.startsWithDate = startsWithDate.toISOString().substring(0, 10);
    },
    async getTransactions(walletId) {
      await this.$axios.$post(process.env.api.transactions, {
        wallet_id: walletId,
        starts_with_date: this.startsWithDate,
        ends_with_date: this.endsWithDate
      }).then(async (response) => {
        // Fetch Category Link
        await this.fetchCategoryLink(response);
      }).catch((response) => {
        this.$notify({ type: 'danger', icon: 'tim-icons icon-simple-remove', verticalAlign: 'bottom', horizontalAlign: 'center', message: response });
      });
    },
    async getCategories(userId, transactions) {
      await this.$axios.$post(process.env.api.categories, {
        user_id: userId,
      }).then((response) => {
        this.categories = response;
        this.transactions = transactions;
      }).catch((response) => {
        let errorMessage = this.$lastElement(this.$splitElement(response.data.errorMessage, ':'));
        this.$notify({ type: 'danger', icon: 'tim-icons icon-simple-remove', verticalAlign: 'bottom', horizontalAlign: 'center', message: errorMessage });
      });
    },
    async fetchCategoryLink(transactions) {
      // Fetch the current user ID
      let userId = this.$authentication.fetchCurrentUser(this).financialPortfolioId;
      // Fetch Data from API
      await this.getCategories(userId, transactions);
    }
  },
  async mounted() {
    // Fetch Data from API
    await this.fetchOverview();
  }
}
</script>
<style>
</style>
