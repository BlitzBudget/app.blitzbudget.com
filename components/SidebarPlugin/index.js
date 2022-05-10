import Sidebar from './SideBar.vue';
import SidebarItem from './SidebarItem.vue';
import constants from './dashboard/constants'

const SidebarStore = {
  showSidebar: false,
  sidebarClass: 'sidebar-mini',
  sidebarLinks: [],
  isMinimized: false,
  displaySidebar(value) {
    this.showSidebar = value;
  },
  toggleMinimize() {
    document.body.classList.toggle(this.sidebarClass);
    // we simulate the window Resize so the charts will get updated in realtime.
    this.animateExpandSidebar();
    this.isMinimized = !this.isMinimized;
    // Store Minimize sidebar in local storage
    this.storeMinimizeSidebar(this.isMinimized);
  },
  animateExpandSidebar() {
    const simulateWindowResize = setInterval(() => {
      window.dispatchEvent(new Event('resize'));
    }, 180);

    // we stop the simulation of Window Resize after the animations are completed
    setTimeout(() => {
      clearInterval(simulateWindowResize);
    }, 1000);

  },
  expandSidebar() {
    document.body.classList.remove(this.sidebarClass);
    // we simulate the window Resize so the charts will get updated in realtime.
    this.animateExpandSidebar();
    this.isMinimized = false;
  },
  minimizeSidebar() {
    document.body.classList.add(this.sidebarClass);
    // we simulate the window Resize so the charts will get updated in realtime.
    this.animateExpandSidebar();
    this.isMinimized = true;
  },
  storeMinimizeSidebar: (minimized) => {
    let value = '';
    if (minimized) {
      value = constants.MINIMIZE_TEXT;
    }

    localStorage.setItem(constants.MINIMIZE_SIDEBAR, value);
  }
};

const SidebarPlugin = {
  install(Vue, options) {
    if (options && options.sidebarLinks) {
      SidebarStore.sidebarLinks = options.sidebarLinks;
    }
    let app = new Vue({
      data: {
        sidebarStore: SidebarStore
      }
    });
    Vue.prototype.$sidebar = app.sidebarStore;
    Vue.component('side-bar', Sidebar);
    Vue.component('sidebar-item', SidebarItem);
  }
};

export default SidebarPlugin;
