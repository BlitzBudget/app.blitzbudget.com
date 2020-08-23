"use strict";
(function scopeWrapper($) {

    $('body').on('click', '#futureTransactionsTable .recurTransEntry', function (e) {
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
        let editTagsChosen = document.querySelectorAll('#edit-recurring-transaction-tags .badge');
        // Tags Chosen
        for (let i = 0, len = editTagsChosen.length; i < len; i++) {
            // Push tags to the array
            editTagsChosen[i].remove();
        }

        let recurringTransactionsId = this.dataset.target;
        let currentRecurringTrans = window.recurringTransactionCache[recurringTransactionsId];
        let categoryId = currentRecurringTrans.category;
        // Set transaction Title
        document.getElementById('recurringTransactionLabelInModal').textContent = currentRecurringTrans.description;
        // transaction Balance Update
        document.getElementById('recurringTransactionAmountEntry').value = formatToCurrency(currentRecurringTrans.amount);
        // Transaction Category Update
        document.getElementById('recurringTransactionCategoryEntry').textContent = currentRecurringTrans['category_name'];
        // Transaction Description Update
        document.getElementById('recurringTransactionDescriptionEntry').value = currentRecurringTrans.description;
        // Transaction Tags Update
        createAllTags(currentRecurringTrans.tags);
        // Close Account Modal
        document.getElementById('accountInformationMdl').classList.add('d-none');
        // Close  Financial Position
        document.getElementsByClassName('transactions-chart')[0].classList.add('d-none');
        // Close Category Modal
        document.getElementById('categoryInformationMdl').classList.add('d-none');
        // Close Transaction Modal
        document.getElementById('transactionInformationMdl').classList.add('d-none');
        // Show Recurring transactions modal
        document.getElementById('recurringTransactionInformationMdl').classList.remove('d-none');
        // Transaction Modal
        document.getElementById('recurringTransactionInformationMdl').setAttribute('data-target', recurringTransactionsId);
        // Transaction Creation Date
        let creationDateUserRelevant = new Date(currentRecurringTrans['creation_date']);
        document.getElementById('recurringTransactionCreationDate').textContent = ("0" + creationDateUserRelevant.getDate()).slice(-2) + ' ' + months[creationDateUserRelevant.getMonth()].slice(0, 3) + ' ' + creationDateUserRelevant.getFullYear();
    });

    // Delete Transactions
    $('body').on('click', '#deleteSvgRecurringTransactions', function (e) {
        let recurringTransactionId = document.getElementById('recurringTransactionInformationMdl').dataset.target;
        // Click the close button
        document.getElementById('recurringTransactionHeaderClose').click();
        // Remove transactions
        let recurTransaction = document.getElementById('recurTransaction-' + recurringTransactionId);

        if (isNotEmpty(recurTransaction)) {
            recurTransaction.classList.add('d-none');
        }

        let values = {};
        values.walletId = window.currentUser.walletId;
        values.itemId = recurringTransactionId;

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
            if (isNotEmpty(recurTransaction)) {
                recurTransaction.remove();
            }

            // Replace with Empty Recurrence
            let recurrenceValue = window.recurringTransactionCache[recurringTransactionId].recurrence;
            let recurrenceValueEl = document.getElementById('recurTransSB-' + recurrenceValue);
            let recurrenceValueEntry = recurrenceValueEl.getElementsByClassName('recentTransactionEntry');
            if (recurrenceValueEntry.length == 0) {
                // Build empty account entry
                recurrenceValueEl.appendChild(er_a.buildEmptyTableEntry('emptyRecurrenceItem-' + recurrenceValue));
            }
        }
        ajaxData.onFailure = function (thrownError) {
            manageErrors(thrownError, "There was an error while deleting the recurring transaction. Please try again later!", ajaxData);
            // Un hide the transactions
            recurTransaction.classList.remove('d-none');
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

    $('body').on('click', '#recurringTransactionHeaderClose', function (e) {
        // Close Category Modal
        document.getElementById('recurringTransactionInformationMdl').classList.add('d-none');
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
    $('body').on("keyup", "#recurringTransactionTagsEntry", function (e) {
        var keyCode = e.key;
        if (isEqual(keyCode, 'Enter')) {
            e.preventDefault();
            // Create a new tag
            createANewTag('edit-recurring-transaction-tags', this.value);
            // Empty the input value
            this.value = '';
            /*
             * Tags Array update
             */
            let tagsChosen = document.querySelectorAll('#edit-recurring-transaction-tags .badge');
            let tagsArray = [];

            // Tags Chosen
            for (let i = 0, len = tagsChosen.length; i < len; i++) {
                let currentTag = tagsChosen[i];
                let badgeText = currentTag.innerText;
                // Push tags to the array
                tagsArray.push(badgeText);
            }
            // Update Tags
            updateRecurringTransaction('tags', tagsArray);
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
            createANewTag('edit-recurring-transaction-tags', tagsCreated[i]);
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
    $('body').on("click", "#edit-recurring-transaction-tags .tag.badge .badge-remove", function (e) {
        // Remove the parent element
        this.parentNode.remove();
        // Tags Array update
        let tagsChosen = document.querySelectorAll('#edit-recurring-transaction-tags .badge');
        let tagsArray = [];

        // Tags Chosen
        for (let i = 0, len = tagsChosen.length; i < len; i++) {
            let currentTag = tagsChosen[i];
            let badgeText = currentTag.innerText;
            // Push tags to the array
            tagsArray.push(badgeText);
        }
        // Update Tags
        updateRecurringTransaction('tags', tagsArray);
    });

    /*
     * Save Description
     */
    // On hit enter
    $('body').on("keyup", "#recurringTransactionDescriptionEntry", function (e) {
        var keyCode = e.key;
        if (isEqual(keyCode, 'Enter')) {
            let recurringTransactionId = document.getElementById('recurringTransactionInformationMdl').dataset.target;
            let desc = this.value;
            e.preventDefault();
            // Edit Description
            updateRecurringTransaction('description', desc);
            /*
             * Transactions Description
             */
            let recurringTransactionDescriptionEntry = document.getElementById('recurringTransactionDescriptionEntry');
            recurringTransactionDescriptionEntry.value = desc;

            /*
             * Update Recurring transactions display
             */
            let recurTransEl = document.getElementById('recurTransaction-' + recurringTransactionId);
            let recurTransDescEl = recurTransEl.getElementsByClassName('recentTransactionDescription');
            recurTransDescEl[0].textContent = desc;

            // Focus out
            this.blur();
        }
    });

    /*
     * Save Amount
     */
    $('body').on("keyup", "#recurringTransactionAmountEntry", function (e) {
        var keyCode = e.key;

        if (isEqual(keyCode, 'Enter')) {
            let recurringTransactionId = document.getElementById('recurringTransactionInformationMdl').dataset.target;
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
            if (window.recurringTransactionCache[recurringTransactionId].amount < 0) {
                // Update as negative amount
                amount *= -1;
            }
            // Edit Amount
            updateRecurringTransaction('amount', amount);
            /*
             * Recurring Transactions Amount
             */
            let recurringTransactionAmountEntry = document.getElementById('recurringTransactionAmountEntry');
            let formattedAmount = formatToCurrency(amount);
            recurringTransactionAmountEntry.value = formattedAmount;

            /*
             * Recurring Transaction Amount Display
             */
            let recurTransEl = document.getElementById('recurTransaction-' + recurringTransactionId);
            let transactionAmountRT = recurTransEl.getElementsByClassName('transactionAmountRT');
            transactionAmountRT[0].textContent = formattedAmount;

            // Focus out
            this.blur();
        }
    });

    /*
     * Updte Transaction
     */
    function updateRecurringTransaction(type, value) {
        // Recurring transactions id
        let recurringTransactionId = document.getElementById('recurringTransactionInformationMdl').dataset.target;
        // Update to cache
        window.recurringTransactionCache[recurringTransactionId][type] = value;
        let values = {};
        values['walletId'] = window.currentUser.walletId;
        values['recurringTransactionId'] = recurringTransactionId;
        values[type] = value;

        // Ajax Requests on Error
        let ajaxData = {};
        ajaxData.isAjaxReq = true;
        ajaxData.type = "PATCH";
        ajaxData.url = CUSTOM_DASHBOARD_CONSTANTS.recurringTransactionsAPIUrl;
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
