export default class WalletClass {
    WalletName = null;
    WalletCurrency = null;
    WalletId = null;
    UserId = null;

    constructor(walletName, walletCurrency, walletId, userId) {
        this.UserId = userId;
        this.WalletId = walletId;
        this.WalletName = walletName;
        this.WalletCurrency = walletCurrency;
    }

    getCurrency() {
        return this.WalletCurrency;
    }

    getName() {
        return this.WalletName;
    }

    getId() {
        return this.WalletId;
    }

    getUserId() {
        return this.UserId;
    }
}