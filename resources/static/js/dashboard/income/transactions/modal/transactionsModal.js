"use strict";
(function scopeWrapper($) {

    $('body').on('click', '#transactionsTable .recentTransactionEntry', function (e) {
        let transactionsId = this.dataset.target;
        // Set Category Title
        document.getElementById('transactionLabelInModal').textContent = window.transactionsCache[transactionsId].description;
        // Category Balance Update
        document.getElementById('transactionAmountEntry').textContent = window.transactionsCache[transactionsId].amount;
        // Close Account Modal
        document.getElementById('accountInformationMdl').classList.add('d-none');
        // Close  Financial Position
        document.getElementsByClassName('transactions-chart')[0].classList.add('d-none');
        // Close Category Modal
        document.getElementById('categoryInformationMdl').classList.add('d-none');
        // Close Transaction Modal
        document.getElementById('transactionInformationMdl').classList.remove('d-none');
    });

}(jQuery));
