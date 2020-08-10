"use strict";
(function scopeWrapper($) {

    $('body').on('click', '#transactionsTable .recentTransactionEntry', function (e) {
        let transactionsId = this.dataset.target;
        // Set transaction Title
        document.getElementById('transactionLabelInModal').textContent = window.transactionsCache[transactionsId].description;
        // transaction Balance Update
        document.getElementById('transactionAmountEntry').textContent = formatToCurrency(window.transactionsCache[transactionsId].amount);
        // Transaction Category Update
        document.getElementById('transactionCategoryEntry').textContent = window.transactionsCache[transactionsId].category;
        // Transaction Description Update
        document.getElementById('transactionDescriptionEntry').textContent = window.transactionsCache[transactionsId].description;
        // Transaction Tags Update
        document.getElementById('transactionTagsEntry').textContent = isNotEmpty(window.transactionsCache[transactionsId].tags) ? window.transactionsCache[transactionsId].tags[0] : "";
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
