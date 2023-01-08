<template>
  <div :data="this.filteredData">
    <div v-for="navigation in filteredData" :key="navigation.url" class="text-center">
      <nuxt-link :to="navigation.url" class="dropdown-item">{{ navigation.title }}</nuxt-link>
    </div>
  </div>
</template>

<script>

export default {
  name: 'filter-nav-url',
  components: {
  },
  props: {
    required: Boolean,
    searchQuery: {
      type: String,
      description: 'Search Query'
    }
  },
  model: {
    event: 'change'
  },
  data() {
    return {
      filteredData: [],
      navigation: [
        {
          "title": "View Budgets",
          "url": "/budgets"
        },
        {
          "title": "Add Budget",
          "url": "/budget/add"
        },
        {
          "title": "View Categories",
          "url": "/categories"
        },
        {
          "title": "Add Category",
          "url": "/category/add"
        },
        {
          "title": "View Category Link",
          "url": "/category/category-link"
        },
        {
          "title": "Add Category Link",
          "url": "/category/link/add"
        },
        {
          "title": "View Debts",
          "url": "/debts"
        },
        {
          "title": "Add Debt",
          "url": "/debt/add"
        },
        {
          "title": "View Debt Link",
          "url": "/debt/debt-link"
        },
        {
          "title": "Add Debt Link",
          "url": "/debt/link/add"
        },
        {
          "title": "View Goals",
          "url": "/goals"
        },
        {
          "title": "Add Goal",
          "url": "/goal/add"
        },
        {
          "title": "View Goal Link",
          "url": "/goal/goal-link"
        },
        {
          "title": "Add Goal Link",
          "url": "/goal/link/add"
        },
        {
          "title": "View Investments",
          "url": "/investments"
        },
        {
          "title": "Add Investment",
          "url": "/investment/add"
        },
        {
          "title": "View Investment Link",
          "url": "/investment/investment-link"
        },
        {
          "title": "Add Investment Link",
          "url": "/investment/link/add"
        },
        {
          "title": "View Transactions",
          "url": "/transactions"
        },
        {
          "title": "Add Transaction",
          "url": "/transaction/add"
        },
        {
          "title": "View Transaction Links",
          "url": "/transaction/transaction-link"
        },
        {
          "title": "View User Profile",
          "url": "/user/profile"
        },
        {
          "title": "Change Password",
          "url": "/user/change-password"
        },
        {
          "title": "Delete Account",
          "url": "/user/delete-account"
        },
        {
          "title": "Reset Account",
          "url": "/user/reset-account"
        },
        {
          "title": "Wallet",
          "url": "/wallets"
        },
        {
          "title": "Add Wallet",
          "url": "/wallet/add"
        }
      ]
    };
  },
  watch: {
    // On Change to Search Query Execute the function below
    searchQuery: function (val) {
      this.filterData();
    }
  },
  methods: {
    filterData() {
      if (!this.searchQuery) {
        this.filteredData = [];
        return;
      }

      let filteredDataArray = [];
      for (const element of this.navigation) {
        let navigationData = element;

        if (navigationData.title.includes(this.searchQuery)) {
          filteredDataArray.push(navigationData)
        }

        if (navigationData.url.includes(this.searchQuery)) {
          filteredDataArray.push(navigationData)
        }
      }

      this.filteredData = filteredDataArray
    }
  },
  mounted() {
  }
};
</script>
