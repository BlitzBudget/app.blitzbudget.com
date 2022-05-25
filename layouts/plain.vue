<template>
  <div>
    <base-nav v-model="showMenu" type="white" :transparent="true" menu-classes="justify-content-end"
      class="auth-navbar fixed-top">
      <div slot="brand" class="navbar-wrapper">
        <a class="navbar-brand" href="#" v-if="title">{{ title }}</a>
      </div>

      <ul class="navbar-nav">
        <li class="nav-item">
          <a href="#" class="nav-link text-primary" @click="$router.go(-1)">
            <i class="tim-icons icon-minimal-left"></i> Back to Dashboard
          </a>
        </li>
        <nuxt-link class="nav-item" tag="li" to="/category">
          <a class="nav-link">
            <i class="tim-icons icon-laptop"></i> Category
          </a>
        </nuxt-link>

        <nuxt-link class="nav-item" tag="li" to="/wallet">
          <a class="nav-link">
            <i class="tim-icons icon-single-02"></i> Wallets
          </a>
        </nuxt-link>
      </ul>
    </base-nav>

    <div class="wrapper wrapper-full-page">
      <div class="full-page" :class="pageClass">
        <div class="content">
          <zoom-center-transition :duration="pageTransitionDuration" mode="out-in">
            <nuxt></nuxt>
          </zoom-center-transition>
        </div>
        <footer class="footer">
          <div class="container-fluid">
            <nav>
              <ul class="nav">
                <li class="nav-item">
                  <a href="https://www.blitzbudget.com" target="_blank" rel="noopener" class="nav-link">
                    Blitz Budget
                  </a>
                </li>
                <li class="nav-item">
                  <nuxt-link to="/support" rel="noopener" class="nav-link">
                    Support
                  </nuxt-link>
                </li>
                <li class="nav-item">
                  <a href="http://blog.blitzbudget.com" target="_blank" rel="noopener" class="nav-link">
                    Blog
                  </a>
                </li>
              </ul>
            </nav>
            <div class="copyright">
              &copy; {{ year }}, made with
              <i class="tim-icons icon-heart-2"></i> by
              <a href="https://www.blitzbudget.com" target="_blank" rel="noopener">Blitz Budget</a>
              for a better financial life.
            </div>
          </div>
        </footer>
      </div>
    </div>
  </div>
</template>
<script>
import { BaseNav } from '@/components';
import { ZoomCenterTransition } from 'vue2-transitions';

export default {
  components: {
    BaseNav,
    ZoomCenterTransition
  },
  props: {
    backgroundColor: {
      type: String,
      default: 'black'
    }
  },
  data() {
    return {
      showMenu: false,
      menuTransitionDuration: 250,
      pageTransitionDuration: 200,
      year: new Date().getFullYear(),
      pageClass: 'login-page'
    };
  },
  computed: {
    title() {
      let parts = this.$route.path.split('/')
      let name = parts[parts.length - 1]
      return `${name} Page`;
    }
  },
  methods: {
    closeMenu() {
      document.body.classList.remove('nav-open');
      this.showMenu = false;
    }
  },
  beforeDestroy() {
    this.closeMenu();
  },
  beforeRouteUpdate(to, from, next) {
    // Close the mobile menu first then transition to next page
    if (this.showMenu) {
      this.closeMenu();
      setTimeout(() => {
        next();
      }, this.menuTransitionDuration);
    } else {
      next();
    }
  }
};
</script>
<style lang="scss">
.navbar.auth-navbar {
  top: 0;
}

$scaleSize: 0.8;

@keyframes zoomIn8 {
  from {
    opacity: 0;
    transform: scale3d($scaleSize, $scaleSize, $scaleSize);
  }

  100% {
    opacity: 1;
  }
}

.wrapper-full-page .zoomIn {
  animation-name: zoomIn8;
}

@keyframes zoomOut8 {
  from {
    opacity: 1;
  }

  to {
    opacity: 0;
    transform: scale3d($scaleSize, $scaleSize, $scaleSize);
  }
}

.wrapper-full-page .zoomOut {
  animation-name: zoomOut8;
}
</style>
