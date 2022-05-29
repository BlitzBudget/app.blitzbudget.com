import Vue from 'vue';
import WalletClass from "@/classes/Wallet"
import Swal from 'sweetalert2';

let WalletStore = {
    wallet: null,
    walletItemKey: "currentWallet",
    storeCurrentWallet(currentWallet) {
        currentWallet = JSON.stringify(currentWallet);
        localStorage.setItem(this.walletItemKey, currentWallet)
    },
    async setCurrentWallet(event) {
        if (event.$isNotEmpty(this.wallet)) {
            return this.wallet;
        }

        let walletItem = localStorage.getItem(this.walletItemKey);
        if (event.$isNotEmpty(walletItem)) {
            walletItem = JSON.parse(walletItem);
            this.wallet = new WalletClass(walletItem["wallet_name"], walletItem["wallet_currency"], walletItem["sk"], walletItem["pk"]);
            return this.wallet;
        }

        let userId = event.$authentication.fetchCurrentUser(event).financialPortfolioId
        let wallets = await this.fetchWalletItemFromAPI(userId, event);
        if (event.$isNotEmpty(wallets)) {
            this.storeWalletInLocalStorage(wallets, event);
            this.wallet = new WalletClass(wallets[0]["wallet_name"], wallets[0]["wallet_currency"], wallets[0]["sk"], wallets[0]["pk"]);
            return this.wallet;
        }

        // If no wallet found then redirect to add wallet
        this.redirectToAddWallet(event);
    },
    storeWalletInLocalStorage(result, event) {
        let wallets = result.Wallet;

        if (event.$isNotEmpty(wallets)) {
            event.$wallet.storeCurrentWallet(wallets[0]);
            return;
        }

        if (event.$isNotEmpty(result) && event.$isNotEmpty(result[0])) {
            event.$wallet.storeCurrentWallet(result[0]);
        }
    },
    async fetchWalletItemFromAPI(userId, event) {
        return event.$axios.$post(process.env.api.wallets, {
            user_id: userId,
        }).then((response) => {
            return response;
        }).catch((error) => {
            event.$notify({ type: 'danger', icon: 'tim-icons icon-alert-circle-exc', verticalAlign: 'bottom', horizontalAlign: 'center', message: error });
        });
    },
    redirectToAddWallet(event) {
        let router = event.$router;
        /*
         * If Wallet is empty then redirect to add wallets page
         */
        let timerInterval;
        Swal.fire({
            title: $nuxt.$t('wallet.none.title'),
            html: $nuxt.$t('wallet.none.description'),
            timer: 3000,
            timerProgressBar: true,
            showCloseButton: false,
            showCancelButton: false,
            allowEscapeKey: false,
            allowOutsideClick: false,
            closeOnClickOutside: false,
            buttonsStyling: false,
            showConfirmButton: false,
            onBeforeOpen: () => {
                timerInterval = setInterval(() => {
                    const content = Swal.getContent()
                    if (content) {
                        const b = content.querySelector('b')
                        if (b) {
                            b.textContent = Math.floor(Swal.getTimerLeft() / 1000)
                        }
                    }
                }, 100)
            },
            onClose: () => {
                clearInterval(timerInterval)
            }
        }).then((result) => {
            /* Read more about handling dismissals below */
            if (result.dismiss === Swal.DismissReason.timer) {
                router.push('/wallet/add')
            }
        })
    }
}


Vue.prototype.$wallet = WalletStore;
