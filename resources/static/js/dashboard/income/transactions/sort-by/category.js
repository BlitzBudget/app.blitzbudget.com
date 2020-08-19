"use strict";
(function scopeWrapper($) {

    // Click on sort by creation date
    $('body').on('click', '#categorySortBy', function (e) {
        // Change title of in the dropdown
        let sortByDiv = document.getElementById('sortByBtnTit');
        sortByDiv.setAttribute('data-i18n', 'transactions.dynamic.sort.category');
        sortByDiv.textContent = isNotEmpty(window.translationData) ? window.translationData.transactions.dynamic.sort.category : "Category";
        // hide the recent transactions
        document.getElementById('recentTransactions').classList.add('d-none');
        // hide the accountTable
        document.getElementById('accountTable').classList.add('d-none');
        // Hide Recurring transactions modal
        document.getElementById('recurringTransactionInformationMdl').classList.add('d-none');
        // Hide all account tables loaded
        let accSortedTable = document.getElementById('accSortedTable');
        accSortedTable.classList.add('d-none');
        accSortedTable.classList.remove('d-table');
        // show the category view
        let transactionsTable = document.getElementById('transactionsTable');
        transactionsTable.classList.add('d-table');
        transactionsTable.classList.remove('d-none');
        // Open Account Modal
        document.getElementById('accountInformationMdl').classList.add('d-none');
        // Close Category Modal
        document.getElementById('categoryInformationMdl').classList.add('d-none');
        // Toggle  Financial Position
        document.getElementsByClassName('transactions-chart')[0].classList.remove('d-none');
        // show the future transactions
        let futureTransactionsTable = document.getElementById('futureTransactionsTable');
        futureTransactionsTable.classList.add('d-none');
        futureTransactionsTable.classList.remove('d-table');
        // show the tags sortby
        let tabsTable = document.getElementById('tagsTable');
        tabsTable.classList.add('d-none');
        tabsTable.classList.remove('d-table');
    });

}(jQuery));
