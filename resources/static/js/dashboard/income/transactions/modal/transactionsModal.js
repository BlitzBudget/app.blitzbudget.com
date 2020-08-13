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
        if (isNotEmpty(categorySortedTrans)) {
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
            categorySortedTrans.remove();
            accountAggre.remove();
            recentTransaction.remove();
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
            return false;
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
            e.preventDefault();
            // Edit Description
            updateTransaction('description', this.value);
        }
        /*
         * Transactions Description
         */
        let transactionAmountEntry = document.getElementById('transactionDescriptionEntry');
        let formattedAmount = formatToCurrency(amount);
        transactionAmountEntry.textContent = formattedAmount;
        let categorySorted = document.querySelectorAll('#categorySorted-' + transactionId + ' .recentTransactionDescription');
        if (isNotEmpty(categorySorted)) {
            categorySorted.textContent = formattedAmount;
        }
        let tagsSorted = document.querySelectorAll('#overview-transaction-' + transactionId + ' .recentTransactionDescription');
        if (isNotEmpty(tagsSorted)) {
            tagsSorted.textContent = formattedAmount;
        }
        let accountAggre = document.querySelectorAll('#accountAggre-' + transactionId + ' .recentTransactionDescription');
        if (isNotEmpty(accountAggre)) {
            accountAggre.textContent = formattedAmount;
        }
        let recentTransaction = document.querySelectorAll('#recentTransaction-' + transactionId + ' .recentTransactionDescription');
        if (isNotEmpty(recentTransaction)) {
            recentTransaction.textContent = formattedAmount;
        }
    });

    /*
     * Save Amount
     */
    $('body').on("keyup", "#transactionAmountEntry", function (e) {
        let transactionId = document.getElementById('transactionInformationMdl').dataset.target;
        var keyCode = e.key;

        if (isEqual(keyCode, 'Enter')) {
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
        }
        /*
         * Transactions Amount
         */
        let transactionAmountEntry = document.getElementById('transactionAmountEntry');
        let formattedAmount = formatToCurrency(amount);
        transactionAmountEntry.textContent = formattedAmount;
        let categorySorted = document.querySelectorAll('#categorySorted-' + transactionId + ' .transactionAmountRT');
        if (isNotEmpty(categorySorted)) {
            categorySorted.textContent = formattedAmount;
        }
        let tagsSorted = document.querySelectorAll('#overview-transaction-' + transactionId + ' .transactionAmountRT');
        if (isNotEmpty(tagsSorted)) {
            tagsSorted.textContent = formattedAmount;
        }
        let accountAggre = document.querySelectorAll('#accountAggre-' + transactionId + ' .transactionAmountRT');
        if (isNotEmpty(accountAggre)) {
            accountAggre.textContent = formattedAmount;
        }
        let recentTransaction = document.querySelectorAll('#recentTransaction-' + transactionId + ' .transactionAmountRT');
        if (isNotEmpty(recentTransaction)) {
            recentTransaction.textContent = formattedAmount;
        }
    });

    /*
     * Updte Transaction
     */
    function updateTransaction(type, value) {
        let values = {};
        values['walletId'] = window.currentUser.walletId;
        values['transactionId'] = document.getElementById('transactionInformationMdl').dataset.target;
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
