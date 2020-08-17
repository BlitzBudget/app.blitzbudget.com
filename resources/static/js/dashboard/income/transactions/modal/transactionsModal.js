"use strict";
(function scopeWrapper($) {

    $('body').on('click', '#transactionsTable .recentTransactionEntry, #recTransTable .recentTransactionEntry, #accSortedTable .recentTransactionEntry, #tagsTable .recentTransactionEntry', function (e) {
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

        // Make the transactions selected
        this.classList.add('transaction-selected');

        /*
         * Delete all tags
         */
        let editTagsChosen = document.querySelectorAll('#edit-transaction-tags .badge');
        // Tags Chosen
        for (let i = 0, len = editTagsChosen.length; i < len; i++) {
            // Push tags to the array
            editTagsChosen[i].remove();
        }

        let transactionsId = this.dataset.target;
        let currentTransaction = window.transactionsCache[transactionsId];
        let categoryId = currentTransaction.category;
        // Set transaction Title
        document.getElementById('transactionLabelInModal').textContent = currentTransaction.description;
        // transaction Balance Update
        document.getElementById('transactionAmountEntry').value = formatToCurrency(currentTransaction.amount);
        // Transaction Category Update
        document.getElementById('transactionCategoryEntry').textContent = window.categoryMap[currentTransaction.category].name;
        // Transaction Description Update
        document.getElementById('transactionDescriptionEntry').value = currentTransaction.description;
        // Transaction Tags Update
        createAllTags(currentTransaction.tags);
        // Close Account Modal
        document.getElementById('accountInformationMdl').classList.add('d-none');
        // Close  Financial Position
        document.getElementsByClassName('transactions-chart')[0].classList.add('d-none');
        // Close Category Modal
        document.getElementById('categoryInformationMdl').classList.add('d-none');
        // Close Transaction Modal
        document.getElementById('transactionInformationMdl').classList.remove('d-none');
        // Transaction Creation Date
        let creationDateUserRelevant = new Date(currentTransaction['creation_date']);
        document.getElementById('transactionCreationDate').textContent = ("0" + creationDateUserRelevant.getDate()).slice(-2) + ' ' + months[creationDateUserRelevant.getMonth()].slice(0, 3) + ' ' + creationDateUserRelevant.getFullYear();
        // Transaction Modal
        document.getElementById('transactionInformationMdl').setAttribute('data-target', transactionsId);
        // Set the value and percentage of the progress bar
        let amountAccumulatedTrans = document.getElementById('amountAccumulatedTrans');
        // Progress Bar percentage
        let progressBarPercentage = 0;
        let remainingAmount = 0;
        if (isNotEmpty(window.categoryMap[categoryId])) {
            progressBarPercentage = round(((Math.abs(currentTransaction.amount) / Math.abs(window.categoryMap[categoryId].categoryTotal)) * 100), 2);
            // Is Not A Number then
            if (isNaN(progressBarPercentage)) {
                progressBarPercentage = 0;
            }
            // Remaining Amount
            remainingAmount = (Math.abs(window.categoryMap[categoryId].categoryTotal) - Math.abs(currentTransaction.amount));
        }
        // Progress bar percentage
        amountAccumulatedTrans.setAttribute('aria-valuenow', progressBarPercentage);
        amountAccumulatedTrans.style.width = progressBarPercentage + '%';
        // Remaining Percentage
        document.getElementById('percentageAchievedTrans').textContent = progressBarPercentage + '%';
        // Remaining in currencys
        document.getElementById('remainingBalanceTrans').textContent = formatToCurrency(remainingAmount);
    });

    // Delete Transactions
    $('body').on('click', '#deleteSvgTransactions', function (e) {
        let transactionId = document.getElementById('transactionInformationMdl').dataset.target;
        // Click the close button
        document.getElementById('transactionHeaderClose').click();
        // Remove transactions
        let categorySortedTrans = document.getElementById('categorySorted-' + transactionId);
        let accountAggre = document.getElementById('accountAggre-' + transactionId);
        let recentTransaction = document.getElementById('recentTransaction-' + transactionId);
        if (isNotEmpty(categorySortedTrans)) {
            categorySortedTrans.classList.add('d-none');
        }
        if (isNotEmpty(accountAggre)) {
            accountAggre.classList.add('d-none');
        }
        if (isNotEmpty(recentTransaction)) {
            recentTransaction.classList.add('d-none');
        }

        let values = {};
        values.walletId = window.currentUser.walletId;
        values.itemId = transactionId;

        // Ajax Requests on Error
        let ajaxData = {};
        ajaxData.isAjaxReq = true;
        ajaxData.type = "POST";
        ajaxData.url = window._config.api.invokeUrl + window._config.api.deleteItem;
        ajaxData.dataType = "json";
        ajaxData.contentType = "application/json;charset=UTF-8";
        ajaxData.data = JSON.stringify(values);
        ajaxData.onSuccess = function (jsonObj) {
            // Transactions are removed.
            if (isNotEmpty(categorySortedTrans)) {
                categorySortedTrans.remove();
            }
            if (isNotEmpty(accountAggre)) {
                accountAggre.remove();
            }
            if (isNotEmpty(recentTransaction)) {
                recentTransaction.remove();
            }

            // Fix category balance
            let userTransaction = window.transactionsCache[transactionId];
            let categoryId = userTransaction.category;
            let catDiv = document.getElementById('categoryBalance-' + categoryId);
            let catBal = window.categoryMap[categoryId].categoryTotal;
            // Calculate current category balance
            let currNewCatBal = catBal - userTransaction.amount;
            catDiv.textContent = formatToCurrency(currNewCatBal);
            /*
             * Update the category total
             */
            window.categoryMap[categoryId].categoryTotal = currNewCatBal;
            // Remove transaction from cache
            delete window.transactionsCache[transactionId];
            // Check if there are any transactions in the category header
            let categoryHeader = document.getElementById('categorySB-' + categoryId);
            if (categoryHeader.childNodes.length == 1) {
                // Ppopulate empty table transaction
                categoryHeader.appendChild(buildEmptyTableEntry('emptyCategoryItem-' + categoryId));
            }
            /*
             * Calculate total income and total expense (minus deleted transaction)
             */
            let totalIncomeTransactions = window.totalIncomeForDate;
            let totalExpensesTransactions = window.totalExpenseForDate;
            if (isEqual(window.categoryMap[categoryId].type, CUSTOM_DASHBOARD_CONSTANTS.expenseCategory)) {
                totalExpensesTransactions = totalExpensesTransactions - userTransaction.amount;
            } else {
                totalIncomeTransactions = totalIncomeTransactions - userTransaction.amount;
            }
            // Income and expense total
            let totalAvailableTransactions = totalIncomeTransactions + totalExpensesTransactions;
            /*
             * Update Pie Chart
             */
            tr.updateTotalAvailableSection(totalIncomeTransactions, totalExpensesTransactions, totalAvailableTransactions);
        }
        ajaxData.onFailure = function (thrownError) {
            manageErrors(thrownError, "There was an error while deleting the transaction. Please try again later!", ajaxData);
            // Un hide the transactions
            categorySortedTrans.classList.remove('d-none');
            accountAggre.classList.remove('d-none');
            recentTransaction.classList.remove('d-none');
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
    });

    $('body').on('click', '#transactionHeaderClose', function (e) {
        // Close Category Modal
        document.getElementById('transactionInformationMdl').classList.add('d-none');
        // Open  Financial Position
        document.getElementsByClassName('transactions-chart')[0].classList.remove('d-none');
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
        // Update the transactions pie chart
        window.transactionsChart.update();
    });

    // On hit enter
    $('body').on("keyup", "#transactionTagsEntry", function (e) {
        var keyCode = e.key;
        if (isEqual(keyCode, 'Enter')) {
            e.preventDefault();
            // Create a new tag
            createANewTag('edit-transaction-tags', this.value);
            // Empty the input value
            this.value = '';
            /*
             * Tags Array update
             */
            let tagsChosen = document.querySelectorAll('#edit-transaction-tags .badge');
            let tagsArray = [];

            // Tags Chosen
            for (let i = 0, len = tagsChosen.length; i < len; i++) {
                let currentTag = tagsChosen[i];
                let badgeText = currentTag.innerText;
                // Push tags to the array
                tagsArray.push(badgeText);
            }
            // Update Tags
            updateTransaction('tags', tagsArray);
        }
    });

    /*
     * Create Tags
     */
    function createAllTags(tagsCreated) {

        if (isEmpty(tagsCreated)) {
            return;
        }

        for (let i = 0, len = tagsCreated.length; i < len; i++) {
            createANewTag('edit-transaction-tags', tagsCreated[i]);
        }
    }

    /*
     * Creates a new tag
     */
    function createANewTag(id, content) {
        let badge = document.createElement('span');
        badge.classList = 'tag badge';
        badge.textContent = content;

        let removeButton = document.createElement('span');
        removeButton.setAttribute('data-role', 'remove');
        removeButton.classList = 'badge-remove';
        badge.appendChild(removeButton);

        let parentElement = document.getElementById(id);
        parentElement.insertBefore(badge, parentElement.childNodes[0]);
    }

    /*
     * Remove the tag
     */
    $('body').on("click", "#edit-transaction-tags .tag.badge .badge-remove", function (e) {
        // Remove the parent element
        this.parentNode.remove();
        // Tags Array update
        let tagsChosen = document.querySelectorAll('#edit-transaction-tags .badge');
        let tagsArray = [];

        // Tags Chosen
        for (let i = 0, len = tagsChosen.length; i < len; i++) {
            let currentTag = tagsChosen[i];
            let badgeText = currentTag.innerText;
            // Push tags to the array
            tagsArray.push(badgeText);
        }
        // Update Tags
        updateTransaction('tags', tagsArray);
    });

    /*
     * Save Description
     */
    // On hit enter
    $('body').on("keyup", "#transactionDescriptionEntry", function (e) {
        var keyCode = e.key;
        if (isEqual(keyCode, 'Enter')) {
            let transactionId = document.getElementById('transactionInformationMdl').dataset.target;
            let desc = this.value;
            e.preventDefault();
            // Edit Description
            updateTransaction('description', desc);
            /*
             * Transactions Description
             */
            let transactionDescriptionEntry = document.getElementById('transactionDescriptionEntry');
            transactionDescriptionEntry.value = desc;
            let categorySorted = document.getElementById('categorySorted-' + transactionId);
            categorySorted = categorySorted.getElementsByClassName('recentTransactionDescription')[0];
            if (isNotEmpty(categorySorted)) {
                categorySorted.textContent = desc;
            }
            let tagsSorted = document.getElementById('overview-transaction-' + transactionId);
            if (isNotEmpty(tagsSorted)) {
                tagsSorted = tagsSorted.getElementsByClassName('recentTransactionDescription')[0];
                if (isNotEmpty(tagsSorted)) {
                    tagsSorted.textContent = desc;
                }
            }
            let accountAggre = document.getElementById('accountAggre-' + transactionId);
            accountAggre = accountAggre.getElementsByClassName('recentTransactionDescription')[0];
            if (isNotEmpty(accountAggre)) {
                accountAggre.textContent = desc;
            }
            let recentTransaction = document.getElementById('recentTransaction-' + transactionId);
            recentTransaction = recentTransaction.getElementsByClassName('recentTransactionDescription')[0];
            if (isNotEmpty(recentTransaction)) {
                recentTransaction.textContent = desc;
            }
            // Focus out
            this.blur();
        }
    });

    /*
     * Save Amount
     */
    $('body').on("keyup", "#transactionAmountEntry", function (e) {
        var keyCode = e.key;

        if (isEqual(keyCode, 'Enter')) {
            let transactionId = document.getElementById('transactionInformationMdl').dataset.target;
            e.preventDefault();
            let amount = this.value;
            if (isBlank(amount)) {
                return false;
            }
            // Convert to Number from Currency
            amount = Math.abs(er.convertToNumberFromCurrency(amount, currentCurrencyPreference));
            if (amount == 0) {
                return false;
            }
            // If expense category then convert to negative
            if (window.categoryMap[window.transactionsCache[transactionId].category].type == CUSTOM_DASHBOARD_CONSTANTS.expenseCategory) {
                // Update as negative amount
                amount *= -1;
            }
            // Edit Amount
            updateTransaction('amount', amount);
            /*
             * Transactions Amount
             */
            let transactionAmountEntry = document.getElementById('transactionAmountEntry');
            let formattedAmount = formatToCurrency(amount);
            transactionAmountEntry.value = formattedAmount;
            let categorySorted = document.getElementById('categorySorted-' + transactionId);
            categorySorted = categorySorted.getElementsByClassName('transactionAmountRT')[0];
            if (isNotEmpty(categorySorted)) {
                categorySorted.textContent = formattedAmount;
            }
            let tagsSorted = document.getElementById('overview-transaction-' + transactionId);
            tagsSorted = tagsSorted.getElementsByClassName('transactionAmountRT')[0];
            if (isNotEmpty(tagsSorted)) {
                tagsSorted.textContent = formattedAmount;
            }
            let accountAggre = document.getElementById('accountAggre-' + transactionId);
            accountAggre = accountAggre.getElementsByClassName('transactionAmountRT')[0];
            if (isNotEmpty(accountAggre)) {
                accountAggre.textContent = formattedAmount;
            }
            let recentTransaction = document.getElementById('recentTransaction-' + transactionId);
            recentTransaction = recentTransaction.getElementsByClassName('transactionAmountRT')[0];
            if (isNotEmpty(recentTransaction)) {
                recentTransaction.textContent = formattedAmount;
            }

            /*
             * Update total Balance
             */
            // Update total avalable balance
            let totalIncomeTransactions = document.getElementById('totalIncomeTransactions').textContent;
            totalIncomeTransactions = window.totalIncomeForDate;
            let totalExpensesTransactions = document.getElementById('totalExpensesTransactions').textContent;
            totalExpensesTransactions = window.totalExpenseForDate;

            /*
             * Update the category total in transaction modal
             */
            let currentTransaction = window.transactionsCache[transactionId];
            let categoryId = currentTransaction.category;
            // Delete the old balance
            window.categoryMap[categoryId].categoryTotal = window.categoryMap[categoryId].categoryTotal - currentTransaction.amount;
            if (isEqual(window.categoryMap[categoryId].type, CUSTOM_DASHBOARD_CONSTANTS.expenseCategory)) {
                totalExpensesTransactions = totalExpensesTransactions - currentTransaction.amount;
            } else {
                totalIncomeTransactions = totalIncomeTransactions - currentTransaction.amount;
            }
            // Set the new amount to the cache
            let oldTransactionAmount = currentTransaction.amount;
            window.transactionsCache[transactionId].amount = amount;
            // Add the new balance
            window.categoryMap[categoryId].categoryTotal = window.categoryMap[categoryId].categoryTotal + window.transactionsCache[transactionId].amount;
            if (isEqual(window.categoryMap[categoryId].type, CUSTOM_DASHBOARD_CONSTANTS.expenseCategory)) {
                totalExpensesTransactions = totalExpensesTransactions + currentTransaction.amount;
            } else {
                totalIncomeTransactions = totalIncomeTransactions + currentTransaction.amount;
            }
            // Update Category Total
            let categoryHeader = document.getElementById('categorySB-' + categoryId);
            // Format to currency and update category header
            categoryHeader.firstElementChild.lastElementChild.textContent = formatToCurrency(window.categoryMap[categoryId].categoryTotal);
            // Set the value and percentage of the progress bar
            let amountAccumulatedTrans = document.getElementById('amountAccumulatedTrans');

            /*
             * Progress Bar percentage
             */
            let progressBarPercentage = 0;
            let remainingAmount = 0;
            if (isNotEmpty(window.categoryMap[categoryId])) {
                progressBarPercentage = round(((Math.abs(currentTransaction.amount) / Math.abs(window.categoryMap[categoryId].categoryTotal)) * 100), 2);
                // Is Not A Number then
                if (isNaN(progressBarPercentage)) {
                    progressBarPercentage = 0;
                }
                // Remaining Amount
                remainingAmount = (Math.abs(window.categoryMap[categoryId].categoryTotal) - Math.abs(currentTransaction.amount));
            }
            // Progress bar percentage
            amountAccumulatedTrans.setAttribute('aria-valuenow', progressBarPercentage);
            amountAccumulatedTrans.style.width = progressBarPercentage + '%';
            // Remaining Percentage
            document.getElementById('percentageAchievedTrans').textContent = progressBarPercentage + '%';
            // Remaining in currencys
            document.getElementById('remainingBalanceTrans').textContent = formatToCurrency(remainingAmount);
            // Focus out
            this.blur();

            /*
             * Update Pie Chart
             */
            let totalAvailableTransactions = totalIncomeTransactions + totalExpensesTransactions;
            tr.updateTotalAvailableSection(totalIncomeTransactions, totalExpensesTransactions, totalAvailableTransactions);

            /*
             * Update the bank balance
             */
            let bankAccountId = window.transactionsCache[transactionId].account;
            bankAccEl = document.getElementById('accountBalance-' + bankAccountId);
            for (let i = 0, length = window.allBankAccountInfoCache.length; i < length; i++) {
                if (window.allBankAccountInfoCache[i].accountId == bankAccountId) {
                    let accBal = window.allBankAccountInfoCache[i]['account_balance'];
                    // Remove the old balance
                    accBal = accBal - oldTransactionAmount;
                    // Add the new balance
                    accBal = accBal + window.transactionsCache[transactionId].amount;
                    // Update the bank account display
                    bankAccEl.textContent = formatToCurrency(accBal);
                    // Update Cache
                    window.allBankAccountInfoCache[i]['account_balance'] = accBal;
                }
            }
        }
    });

    /*
     * Updte Transaction
     */
    function updateTransaction(type, value) {
        // Transactions ID
        let transactionId = document.getElementById('transactionInformationMdl').dataset.target;
        // Update to cache
        window.transactionsCache[transactionId][type] = value;
        let values = {};
        values['walletId'] = window.currentUser.walletId;
        values['transactionId'] = transactionId;
        values[type] = value;

        // Ajax Requests on Error
        let ajaxData = {};
        ajaxData.isAjaxReq = true;
        ajaxData.type = "PATCH";
        ajaxData.url = CUSTOM_DASHBOARD_CONSTANTS.transactionAPIUrl;
        ajaxData.dataType = "json";
        ajaxData.contentType = "application/json;charset=UTF-8";
        ajaxData.data = JSON.stringify(values);
        ajaxData.onSuccess = function (result) {}
        ajaxData.onFailure = function (thrownError) {
            manageErrors(thrownError, "There was an error while updating the transaction. Please try again later!", ajaxData);
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

}(jQuery));
