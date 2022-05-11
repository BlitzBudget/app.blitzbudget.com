import Vue from 'vue';

let userLogout = {
    logout: async (event) => {
        event.$auth.logout();
        localStorage.removeItem(event.$currentUserItemInStorage);
    }
}

Vue.prototype.$userLogout = userLogout;