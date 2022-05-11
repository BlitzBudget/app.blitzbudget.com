
let WalletStore = {
    walletId: '',
    walletItemKey: "currentWallet",
    storeCurrentWallet(currentWallet) {
        currentWallet = JSON.stringify(currentWallet);
        localStorage.setItem(this.walletItemKey, currentWallet)
    },
    getCurrentWallet() {
        let walletItem = localStorage.getItem(this.walletItemKey);
        walletItem = JSON.parse(walletItem);
        return walletItem;
    }
}

const Wallet = {
    install(Vue) {
        let app = new Vue({
            data: {
                walletStore: WalletStore
            }
        });
        Vue.prototype.$wallet = app.walletStore;
    }
};

export default Wallet;