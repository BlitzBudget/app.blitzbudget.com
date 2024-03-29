import Vue from 'vue';

let authentication = {
    currentUserItemInStorage: "currentUserItem",
    accessTokenItem: 'accessToken',
    emailItem: 'email',
    currentUser: {},
    loginUser: async (event) => {
        try {
            let response = await event.$auth.loginWith('local', {
                data: {
                    email: event.model.email,
                    password: event.model.password
                }
            });
            let resp = response.data;
            event.$authentication.storeAllTokens(resp, event);
        } catch ({ response }) {
            let errorMessage = $nuxt.$t('login.error')
            if (event.$isNotEmpty(response)) {
                errorMessage = event.$lastElement(event.$splitElement(response.data.message, ':'));
            }
            event.$notify({ type: 'danger', timeout: 10000, icon: 'tim-icons icon-alert-circle-exc', verticalAlign: 'bottom', horizontalAlign: 'center', message: errorMessage });
        }
    },
    storeAllTokens(resp, event) {
        let idToken = event.$authentication.storeAuthToken(resp);
        let refreshToken = event.$authentication.storeRefreshToken(resp);
        event.$authentication.storeAccessToken(resp, event);
        event.$authentication.retrieveUserAttributes(resp, event);
        event.$auth.setUserToken(idToken, refreshToken)
        event.$wallet.storeWalletInLocalStorage(resp, event);
    },
    storeAuthToken(result) {
        // Set JWT Token For authentication
        let idToken = JSON.stringify(result.AuthenticationResult.IdToken);
        idToken = idToken.substring(1, idToken.length - 1);
        return idToken;
    },
    storeRefreshToken(result) {
        // Set JWT Token For authentication
        let refreshToken = JSON.stringify(result.AuthenticationResult.RefreshToken);
        refreshToken = refreshToken.substring(1, refreshToken.length - 1);
        return refreshToken;
    },
    storeAccessToken(result, event) {
        // Set JWT Token For authentication
        let accessToken = JSON.stringify(result.AuthenticationResult.AccessToken);
        let bearerToken = 'Bearer ' + accessToken;
        accessToken = accessToken.substring(1, accessToken.length - 1);
        localStorage.setItem(this.accessTokenItem, accessToken);
        event.$axios.setHeader('Authorization', bearerToken);
        event.$axios.setToken(bearerToken)
        event.$auth.ctx.app.$axios.setHeader('Authorization', bearerToken);
    },
    retrieveUserAttributes(result, event) {
        let userAttributes = result.UserAttributes;
        let currentUserLocal = {};
        // SUCCESS Scenarios
        for (const element of userAttributes) {
            let name = element.Name;

            if (name.includes('custom:')) {

                // if custom values then remove custom: 
                let elemName = event.$splitElement(name, ':');
                elemName = event.$lastElement(elemName);
                currentUserLocal[elemName] = element.Value;
            } else {
                currentUserLocal[name] = element.Value;
            }
        }

        // Current User to global variable
        this.currentUser = currentUserLocal;
        // We save the item in the localStorage.
        localStorage.setItem(this.currentUserItemInStorage, JSON.stringify(currentUserLocal));
        event.$auth.setUser(currentUserLocal);
    },
    fetchCurrentUser(event) {
        if (event.$isNotEmpty(this.currentUser)) {
            return this.currentUser;
        }

        // If not present then fetch from local storage
        let currentUser = localStorage.getItem(this.currentUserItemInStorage);
        if (event.$isNotEmpty(currentUser)) {
            currentUser = JSON.parse(currentUser);
            this.currentUser = currentUser;
            return currentUser;
        }

        // If Current user info is empty 
        // Logout User
        event.$userLogout.logout(event);
    },
    fetchAccessToken() {
        return localStorage.getItem(this.accessTokenItem);
    },
    setUsername(name) {
        // Current User to global variable
        this.currentUser.name = name;
        // We save the item in the localStorage.
        localStorage.setItem(this.currentUserItemInStorage, JSON.stringify(this.currentUser));
    }
}

Vue.prototype.$authentication = authentication;