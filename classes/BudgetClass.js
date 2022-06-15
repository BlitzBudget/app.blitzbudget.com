export default class BudgetClass {
    BudgetPlanned = null;
    Category = null;
    BudgetId = null;
    WalletId = null;

    constructor(budgetPlanned, category, budgetId, walletId) {
        this.WalletId = walletId;
        this.BudgetId = budgetId;
        this.BudgetPlanned = budgetPlanned;
        this.Category = category;
    }

    getCategory() {
        return this.Category;
    }

    getPlanned() {
        return this.BudgetPlanned;
    }

    getId() {
        return this.BudgetId;
    }

    getWalletId() {
        return this.WalletId;
    }
}