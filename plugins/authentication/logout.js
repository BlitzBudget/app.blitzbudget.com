import Vue from 'vue';

let userLogout = {
    logout: async (event) => {
        event.$auth.logout();
        localStorage.removeItem(event.$currentUserItemInStorage);
        event.$router.push('/login');
        // TODO auto route to login
    }
}

Vue.prototype.$userLogout = userLogout;