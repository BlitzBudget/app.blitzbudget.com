import Vue from 'vue';

let userLogout = {
    logout: async (event) => {
        event.$auth.logout();
        localStorage.removeItem(event.$currentUserItemInStorage);
        // TODO auto route to login
    }
}

Vue.prototype.$userLogout = userLogout;