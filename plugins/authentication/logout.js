import Vue from 'vue';

let userLogout = {
    logout: async (event) => {
        event.$auth.logout();
        localStorage.clear();
    }
}

Vue.prototype.$userLogout = userLogout;