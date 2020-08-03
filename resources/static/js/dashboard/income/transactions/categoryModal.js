"use strict";
(function scopeWrapper($) {

    // On Click Category Header display information
    $('body').on('click', '.categoryInfoTable .recentTransactionDateGrp', function (e) {
        // Account modal id
        let categoryInfoTable = this.closest('.categoryInfoTable');
        let categoryId = categoryInfoTable.getAttribute('data-target');
        // Fetch the total number of transactions for the account
        let recentTransactionEntry = categoryInfoTable.getElementsByClassName('recentTransactionEntry');
        // Set the number of transactions if present
        let numberOfTransactionsDiv = document.getElementById('numberOfTransInCat');
        numberOfTransactionsDiv.textContent = isEmpty(recentTransactionEntry) ? 0 : recentTransactionEntry.length;
        // Set Account Title
        document.getElementById('categoryLabelInModal').textContent = document.getElementById('categoryTitle-' + accountId).textContent;
        // Account Balance Update
        document.getElementById('categoryAmountEntry').textContent = document.getElementById('categoryBalance-' + accountId).textContent;
        // Close Account Modal
        document.getElementById('accountInformationMdl').classList.add('d-none');
        // Close  Financial Position
        document.getElementsByClassName('transactions-chart')[0].classList.add('d-none');
        // Open Category Modal
        document.getElementById('categoryInformationMdl').classList.remove('d-none');
    });

}(jQuery));
