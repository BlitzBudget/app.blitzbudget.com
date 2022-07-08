import Vue from 'vue';

let userLogout = {
    logout: async (event) => {
        event.$auth.logout();
        localStorage.removeItem(event.$authentication.accessTokenItem);
        localStorage.removeItem(event.$authentication.currentUserItemInStorage);
    }
}

Vue.prototype.$userLogout = userLogout;