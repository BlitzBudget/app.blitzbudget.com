<template>
  <div class="fixed-plugin" v-click-outside="closeDropDown">
    <div class="dropdown show-dropdown" :class="{ show: isOpen }">
      <a data-toggle="dropdown" class="settings-icon">
        <i class="fa fa-cog fa-2x" @click="toggleDropDown"> </i>
      </a>
      <ul class="dropdown-menu" :class="{ show: isOpen }">
        <li class="header-title">Sidebar Background</li>
        <li class="adjustments-line">
          <a class="switch-trigger background-color">
            <div class="badge-colors text-center">
              <span v-for="item in sidebarColors" :key="item.color" class="badge filter"
                :class="[`badge-${item.color}`, { active: item.active }]" :data-color="item.color"
                @click="changeSibarBackGroundAndStore(item);"></span>
            </div>
            <div class="clearfix"></div>
          </a>
        </li>

        <li class="header-title">Sidebar Mini</li>
        <li class="adjustments-line">
          <div class="togglebutton switch-sidebar-mini">
            <span class="label-switch">OFF</span>
            <base-switch v-model="sidebarMini" @input="minimizeSidebar"></base-switch>
            <span class="label-switch label-right">ON</span>
          </div>

          <div class="togglebutton switch-change-color mt-3">
            <span class="label-switch">LIGHT MODE</span>
            <base-switch v-model="darkMode" @input="toggleMode"></base-switch>
            <span class="label-switch label-right">DARK MODE</span>
          </div>
        </li>

        <li class="button-container mt-4">
          <nuxt-link to="/support" class="btn btn-default btn-block btn-round">
            Support
          </nuxt-link>
          <nuxt-link to="/ask-us-directly" class="btn btn-primary btn-block btn-round">
            Ask us Directly
          </nuxt-link>
        </li>
      </ul>
    </div>
  </div>
</template>
<script>
import { BaseSwitch } from '@/components';
import constants from '@/components/SidebarPlugin/dashboard/constants';

export default {
  name: 'sidebar-share',
  components: {
    BaseSwitch
  },
  props: {
    backgroundColor: String
  },
  data() {
    return {
      sidebarMini: true,
      darkMode: true,
      isOpen: false,
      sidebarColors: [
        { color: 'primary', active: false, value: 'primary' },
        { color: 'vue', active: true, value: 'vue' },
        { color: 'info', active: false, value: 'blue' },
        { color: 'success', active: false, value: 'green' },
        { color: 'warning', active: false, value: 'orange' },
        { color: 'danger', active: false, value: 'red' }
      ],
      darkModeText: 'dark',
      darkModeClass: 'white-content',
      darkModeStorageItemName: 'dark_mode',
      sidebarBackgroundItemName: 'changeSidebarBackground',
    };
  },
  methods: {
    toggleDropDown() {
      this.isOpen = !this.isOpen;
    },
    closeDropDown() {
      this.isOpen = false;
    },
    openDropDown() {
      this.isOpen = true;
    },
    toggleList(list, itemToActivate) {
      list.forEach(listItem => {
        listItem.active = false;
      });
      itemToActivate.active = true;
    },
    changeSidebarBackground(item) {
      this.$emit('update:backgroundColor', item.value);
      this.toggleList(this.sidebarColors, item);
    },
    changeSibarBackGroundAndStore(item) {
      this.changeSidebarBackground(item);
      this.storeSidebarColor(item);
    },
    toggleMode(type) {
      let docClasses = document.body.classList;
      if (type) {
        docClasses.remove(this.darkModeClass);
      } else {
        docClasses.add(this.darkModeClass);
      }
      // Store Dark mode to local storage
      this.storeDarkMode(type);
    },
    minimizeSidebar() {
      this.$sidebar.toggleMinimize();
    },
    applySidebarMiniSettings() {
      let minimizeSidebar = localStorage.getItem(constants.MINIMIZE_SIDEBAR);
      if (!minimizeSidebar) {
        this.$sidebar.expandSidebar();
        // Change default selection in modal
        this.sidebarMini = false;
      } else {
        this.$sidebar.minimizeSidebar();
      }
    },
    applyDarkModeSettings() {
      let darkMode = localStorage.getItem(this.darkModeStorageItemName);

      let docClasses = document.body.classList;
      if (darkMode === this.darkModeText) {
        docClasses.remove(this.darkModeClass);
      } else {
        docClasses.add(this.darkModeClass);
        // Change default settings in modal
        this.darkMode = false;
      }
    },
    applySidebarBackground() {
      let changeSidebarBackgroundItem = localStorage.getItem(this.sidebarBackgroundItemName);

      if (changeSidebarBackgroundItem) {
        changeSidebarBackgroundItem = JSON.parse(changeSidebarBackgroundItem);
        this.changeSidebarBackground(changeSidebarBackgroundItem);
      }
    },
    applyTheme() {
      this.applySidebarMiniSettings();
      this.applyDarkModeSettings();
      this.applySidebarBackground();
    },
    storeDarkMode(darkModeEnabled) {
      let value = '';
      if (darkModeEnabled) {
        value = this.darkModeText;
      }

      localStorage.setItem(this.darkModeStorageItemName, value);
    },
    storeSidebarColor(item) {
      item = JSON.stringify(item);
      localStorage.setItem(this.sidebarBackgroundItemName, item);
    }
  },
  mounted() {
    // On refresh apply settings from localstorage
    this.applyTheme();
  }
};
</script>
<style scoped lang="scss">
@import '~@/assets/sass/dashboard/custom/variables';

.settings-icon {
  cursor: pointer;
}

.badge-vue {
  background-color: $vue;
}
</style>
