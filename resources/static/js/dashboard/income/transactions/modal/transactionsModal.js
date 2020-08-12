"use strict";
(function scopeWrapper($) {

    $('body').on('click', '#transactionsTable .recentTransactionEntry, #recTransTable .recentTransactionEntry, #accSortedTable .recentTransactionEntry, #tagsTable .recentTransactionEntry', function (e) {
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
        document.getElementById('edit-transaction-tags').appendChild(createAllTags(currentTransaction.tags));
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
        // Set Data Target for delete svg transactions
        document.getElementById('deleteSvgTransactions').setAttribute('data-target', transactionsId);
        // Set the value and percentage of the progress bar
        let amountAccumulatedTrans = document.getElementById('amountAccumulatedTrans');
        // Progress Bar percentage
        let progressBarPercentage = 0;
        let remainingAmount = 0;
        if (isNotEmpty(window.categoryMap[categoryId])) {
            progressBarPercentage = ((Math.abs(currentTransaction.amount) / Math.abs(window.categoryMap[categoryId].categoryTotal)) * 100);
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
        let transactionId = this.dataset.target;
        // Click the close button
        document.getElementById('transactionHeaderClose').click();
        // Remove transactions
        let categorySortedTrans = document.getElementById('categorySorted-' + transactionId);
        let accountAggre = document.getElementById('accountAggre-' + transactionId);
        let recentTransaction = document.getElementById('recentTransaction-' + transactionId);
        let recurTransaction = document.getElementById('recurTransaction-' + transactionId);
        categorySortedTrans.classList.add('d-none');
        accountAggre.classList.add('d-none');
        recentTransaction.classList.add('d-none');
        recurTransaction.classList.add('d-none');

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
            recurTransaction.remove();
        }
        ajaxData.onFailure = function (thrownError) {
            manageErrors(thrownError, "There was an error while deleting the transaction. Please try again later!", ajaxData);
            // Un hide the transactions
            categorySortedTrans.classList.remove('d-none');
            accountAggre.classList.remove('d-none');
            recentTransaction.classList.remove('d-none');
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

    $('body').on('click', '#transactionHeaderClose', function (e) {
        // Close Category Modal
        document.getElementById('transactionInformationMdl').classList.add('d-none');
        // Open  Financial Position
        document.getElementsByClassName('transactions-chart')[0].classList.remove('d-none');
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
            return false;
        }
    });

    /*
     * Create Tags
     */
    function createAllTags(tagsCreated) {
        let documentFrag = document.createDocumentFragment();

        if (isEmpty(tagsCreated)) {
            return documentFrag;
        }

        for (let i = 0, len = tagsCreated.length; i < len; i++) {
            let oneTag = tagsCreated[i];
            documentFrag.appendChild(createANewTag('edit-transaction-tags', oneTag));
        }

        return documentFrag;
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

}(jQuery));
