import Vue from 'vue';

let authentication = {
    currentUserItemInStorage: "currentUserItem",
    loginUser: async (event) => {
        try {
            let response = await event.$auth.loginWith('local', {
                data: {
                    username: event.model.email,
                    password: event.model.password
                }
            });
            console.log(response);
            let resp = response.data;
            let idToken = event.$authentication.storeAuthToken(resp);
            let refreshToken = event.$authentication.storeRefreshToken(resp);
            event.$authentication.storeAccessToken(resp, event);
            event.$authentication.retrieveUserAttributes(resp, event);
            event.$auth.setUserToken(idToken, refreshToken)
        } catch (err) {
            console.log(err);
            event.$notify({ type: 'danger', verticalAlign: 'bottom', horizontalAlign: 'center', message: $nuxt.$t('login.error') });
        }
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
        accessToken = accessToken.substring(1, accessToken.length - 1);
        localStorage.setItem('accessToken', accessToken);
        event.$axios.setHeader('Authorization', 'Bearer ' + accessToken);
        event.$auth.ctx.app.$axios.setHeader('Authorization', 'Bearer ' + accessToken);
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
        window.currentUser = currentUserLocal;
        // We save the item in the localStorage.
        localStorage.setItem(event.$currentUserItemInStorage, JSON.stringify(currentUser));
        event.$auth.setUser(currentUser);
    }
}

Vue.prototype.$authentication = authentication;