<template>
  <base-nav v-model="showMenu" class="navbar-absolute top-navbar" type="white" :transparent="true">
    <div slot="brand" class="navbar-wrapper">
      <div class="navbar-minimize d-inline">
        <sidebar-toggle-button />
      </div>
      <div class="navbar-toggle d-inline" :class="{ toggled: $sidebar.showSidebar }">
        <button type="button" class="navbar-toggler" @click="toggleSidebar">
          <span class="navbar-toggler-bar bar1"></span>
          <span class="navbar-toggler-bar bar2"></span>
          <span class="navbar-toggler-bar bar3"></span>
        </button>
      </div>
      <a class="navbar-brand" href="#pablo">{{ routeName }}</a>
    </div>

    <ul class="navbar-nav" :class="$rtl.isRTL ? 'mr-auto' : 'ml-auto'">
      <div class="search-bar input-group" @click="searchModalVisible = true">
        <button class="btn btn-link" id="search-button" data-toggle="modal" data-target="#searchModal">
          <i class="tim-icons icon-zoom-split"></i>
        </button>
        <!-- You can choose types of search input -->
      </div>
      <modal :show.sync="searchModalVisible" class="modal-search" id="searchModal" :centered="false" :show-close="true">
        <input slot="header" v-model="searchQuery" type="text" class="form-control" id="inlineFormInputGroup"
          placeholder="SEARCH" />
        <filter-nav-url :searchQuery="searchQuery"></filter-nav-url>
      </modal>
      <base-dropdown tag="li" :menu-on-right="!$rtl.isRTL" title-tag="a" title-classes="nav-link" class="nav-item">
        <template slot="title">
          <div class="notification d-none d-lg-block d-xl-block"></div>
          <i class="tim-icons icon-sound-wave"></i>
          <p class="d-lg-none">New Notifications</p>
        </template>
        <li class="nav-link" v-for="notification in notifications" :key="notification.sk">
          <div class="nav-item dropdown-item">{{ notification.notification }}</div>
        </li>
      </base-dropdown>
      <base-dropdown tag="li" :menu-on-right="!$rtl.isRTL" title-tag="a" class="nav-item" title-classes="nav-link"
        menu-classes="dropdown-navbar">
        <template slot="title">
          <div class="photo"><img src="img/mike.jpg" /></div>
          <b class="caret d-none d-lg-block d-xl-block"></b>
          <p class="d-lg-none">Log out</p>
        </template>
        <li class="nav-link">
          <nuxt-link to="/user/profile" class="nav-item dropdown-item">
            Profile
          </nuxt-link>
        </li>
        <li class="nav-link">
          <nuxt-link to="/categories" class="nav-item dropdown-item">
            Categories
          </nuxt-link>
        </li>
        <li class="nav-link">
          <nuxt-link to="/wallets" class="nav-item dropdown-item">
            Wallets
          </nuxt-link>
        </li>
        <div class="dropdown-divider"></div>
        <li class="nav-link">
          <a href="#" class="nav-item dropdown-item" @click="logoutUser">Log out</a>
        </li>
      </base-dropdown>
    </ul>
  </base-nav>
</template>
<script>
import { CollapseTransition } from 'vue2-transitions';
import { BaseNav, Modal } from '@/components';
import SidebarToggleButton from './SidebarToggleButton';
import FilterNavUrl from './DashboardNavComponents/FilterNavURL';

export default {
  components: {
    SidebarToggleButton,
    CollapseTransition,
    BaseNav,
    Modal,
    FilterNavUrl
  },
  computed: {
    routeName() {
      const { path } = this.$route;
      let parts = path.split('/')
      return parts.map(p => this.capitalizeFirstLetter(p)).join(' ');
    },
    isRTL() {
      return this.$rtl.isRTL;
    }
  },
  data() {
    return {
      activeNotifications: false,
      showMenu: false,
      searchModalVisible: false,
      searchQuery: '',
      notifications: []
    };
  },
  methods: {
    capitalizeFirstLetter(string) {
      if (!string || typeof string !== 'string') {
        return ''
      }
      return string.charAt(0).toUpperCase() + string.slice(1);
    },
    closeDropDown() {
      this.activeNotifications = false;
    },
    toggleSidebar() {
      this.$sidebar.displaySidebar(!this.$sidebar.showSidebar);
    },
    toggleMenu() {
      this.showMenu = !this.showMenu;
    },
    async logoutUser() {
      console.log("logging out user");
      await this.$userLogout.logout(this);
    },
    async getNotifications(walletId) {
      await this.$axios.$post(process.env.api.notifications, {
        wallet_id: walletId,
      }).then((response) => {
        this.notifications = response;
      }).catch((response) => {
        this.$notify({ type: 'danger', icon: 'tim-icons icon-simple-remove', verticalAlign: 'bottom', horizontalAlign: 'center', message: response });
      });
    }
  },
  async mounted() {
    let wallet = await this.$wallet.setCurrentWallet(this);
    // Fetch Notifications from API
    await this.getNotifications(wallet.WalletId);
  }
};
</script>
<style scoped>
.top-navbar {
  top: 0px;
}
</style>
