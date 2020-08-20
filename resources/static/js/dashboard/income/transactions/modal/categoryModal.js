"use strict";
(function scopeWrapper($) {
    let currentCategoryId = '';

    // On Click Category Header display information
    $('body').on('click', '.categoryInfoTable .categorySortGrp', function (e) {
        // Account modal id
        let categoryInfoTable = this.closest('.categoryInfoTable');
        let categoryId = categoryInfoTable.getAttribute('data-target');
        // Current Selected Category ID
        currentCategoryId = categoryId;
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
        // Close  Transaction Information Modal
        document.getElementById('transactionInformationMdl').classList.add('d-none');
        // Hide Recurring transactions modal
        document.getElementById('recurringTransactionInformationMdl').classList.add('d-none');
        // Set the value and percentage of the progress bar
        let amountAccumulatedCat = document.getElementById('amountAccumulatedCat');
        // Progress Bar percentage
        let progressBarPercentage = 0;
        let remainingAmount = 0;
        if (isNotEmpty(window.userBudgetMap[categoryId])) {
            progressBarPercentage = round(((Math.abs(window.userBudgetMap[categoryId].used) / Math.abs(window.userBudgetMap[categoryId].planned)) * 100), 2);
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
        // Remove all classlist that contains the selected transactions
        let selectedTransactions = document.querySelectorAll('.transaction-selected');
        /*
         * Delete all classlist with transactions selected
         */
        // Tags Chosen
        for (let i = 0, len = selectedTransactions.length; i < len; i++) {
            // remove the class
            selectedTransactions[i].classList.remove('transaction-selected');
        }
    });

    // Close Accoount modal
    $('body').on('click', '#categoryHeaderClose', function (e) {
        // Close Category Modal
        document.getElementById('categoryInformationMdl').classList.add('d-none');
        // Open  Financial Position
        document.getElementsByClassName('transactions-chart')[0].classList.remove('d-none');
        // Update the transactions pie chart
        window.transactionsChart.update();
    });

    // Delete Category functionality
    $('body').on('click', '#deleteSvgCategory', function (e) {

        Swal.fire({
            title: 'Are you sure?',
            text: "All your transactions and budgets related with the categories, including the categories itself will be deleted!",
            icon: 'warning',
            inputAttributes: {
                autocapitalize: 'on'
            },
            showCancelButton: true,
            showCloseButton: true,
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'No, keep it',
            confirmButtonClass: "btn btn-info",
            cancelButtonClass: "btn btn-secondary",
            buttonsStyling: false,
            showLoaderOnConfirm: true,
        }).then(function (result) {
            // Hide the validation message if present
            Swal.resetValidationMessage()
            // If the Delete Button is pressed
            if (result.value) {

                let values = {};
                values.walletId = window.currentUser.walletId;
                values.category = currentCategoryId;

                // Ajax Requests on Error
                let ajaxData = {};
                ajaxData.isAjaxReq = true;
                ajaxData.type = "POST";
                ajaxData.url = window._config.api.invokeUrl + window._config.api.deleteCategories;
                ajaxData.dataType = "json";
                ajaxData.contentType = "application/json;charset=UTF-8";
                ajaxData.data = JSON.stringify(values);
                ajaxData.onSuccess = function (jsonObj) {
                    // Click the transactions page
                    document.getElementById('transactionsPage').click();
                }
                ajaxData.onFailure = function (thrownError) {
                    manageErrors(thrownError, "There was an error while deleting the financial account. Please try again later!", ajaxData);
                }
                jQuery.ajax({
                    url: ajaxData.url,
                    beforeSend: function (xhr) {
                        xhr.setRequestHeader("Authorization", authHeader);
                    },
                    type: ajaxData.type,
                    dataType: ajaxData.dataType,
                    contentType: ajaxData.contentType,
                    data: ajaxData.data,
                    success: ajaxData.onSuccess,
                    error: ajaxData.onFailure
                });
            }

        });
    });

}(jQuery));
