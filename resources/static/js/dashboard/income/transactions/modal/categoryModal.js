"use strict";
(function scopeWrapper($) {

    // On Click Category Header display information
    $('body').on('click', '.categoryInfoTable .categorySortGrp', function (e) {
        // Account modal id
        let categoryInfoTable = this.closest('.categoryInfoTable');
        let categoryId = categoryInfoTable.getAttribute('data-target');
        // Fetch the total number of transactions for the account
        let recentTransactionEntry = categoryInfoTable.getElementsByClassName('recentTransactionEntry');
        // Set the number of transactions if present
        let numberOfTransactionsDiv = document.getElementById('numberOfTransInCat');
        numberOfTransactionsDiv.textContent = isEmpty(recentTransactionEntry) ? 0 : recentTransactionEntry.length;
        // Set Account Title
        document.getElementById('categoryLabelInModal').textContent = document.getElementById('categoryTitle-' + categoryId).textContent;
        // Account Balance Update
        document.getElementById('categoryAmountEntry').textContent = document.getElementById('categoryBalance-' + categoryId).textContent;
        // Close Account Modal
        document.getElementById('accountInformationMdl').classList.add('d-none');
        // Close  Financial Position
        document.getElementsByClassName('transactions-chart')[0].classList.add('d-none');
        // Open Category Modal
        document.getElementById('categoryInformationMdl').classList.remove('d-none');
        // Set the value and percentage of the progress bar
        let amountAccumulatedCat = document.getElementById('amountAccumulatedCat');
        // Progress Bar percentage
        let progressBarPercentage = 0;
        let remainingAmount = 0;
        if (isNotEmpty(window.userBudgetMap[categoryId])) {
            progressBarPercentage = ((Math.abs(window.userBudgetMap[categoryId].used) / Math.abs(window.userBudgetMap[categoryId].planned)) * 100);
            // Is Not A Number then
            if (isNaN(progressBarPercentage)) {
                progressBarPercentage = 0;
            }
            // Remaining Amount
            remainingAmount = (Math.abs(window.userBudgetMap[categoryId].planned) - Math.abs(window.userBudgetMap[categoryId].used));
        }
        // Progress bar percentage
        amountAccumulatedCat.setAttribute('aria-valuenow', progressBarPercentage);
        amountAccumulatedCat.style.width = progressBarPercentage + '%';
        // Remaining Percentage
        document.getElementById('percentageAchievedCat').textContent = progressBarPercentage + '%';
        // Remaining in currencys
        document.getElementById('remainingBalanceCat').textContent = formatToCurrency(remainingAmount);
    });

    // Close Accoount modal
    $('body').on('click', '#categoryHeaderClose', function (e) {
        // Close Category Modal
        document.getElementById('categoryInformationMdl').classList.add('d-none');
        // Open  Financial Position
        document.getElementsByClassName('transactions-chart')[0].classList.remove('d-none');
    });

}(jQuery));
