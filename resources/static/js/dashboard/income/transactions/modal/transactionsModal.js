"use strict";
(function scopeWrapper($) {

    $('body').on('click', '#transactionsTable .recentTransactionEntry', function (e) {
        let transactionsId = this.dataset.target;
        // Set transaction Title
        document.getElementById('transactionLabelInModal').textContent = window.transactionsCache[transactionsId].description;
        // transaction Balance Update
        document.getElementById('transactionAmountEntry').value = formatToCurrency(window.transactionsCache[transactionsId].amount);
        // Transaction Category Update
        document.getElementById('transactionCategoryEntry').textContent = window.categoryMap[window.transactionsCache[transactionsId].category].name;
        // Transaction Description Update
        document.getElementById('transactionDescriptionEntry').value = window.transactionsCache[transactionsId].description;
        // Transaction Tags Update
        document.getElementById('transactionTagsEntry').value = isNotEmpty(window.transactionsCache[transactionsId].tags) ? window.transactionsCache[transactionsId].tags[0] : "";
        // Close Account Modal
        document.getElementById('accountInformationMdl').classList.add('d-none');
        // Close  Financial Position
        document.getElementsByClassName('transactions-chart')[0].classList.add('d-none');
        // Close Category Modal
        document.getElementById('categoryInformationMdl').classList.add('d-none');
        // Close Transaction Modal
        document.getElementById('transactionInformationMdl').classList.remove('d-none');
        // Transaction Creation Date
        let creationDateUserRelevant = new Date(window.transactionsCache[transactionsId]['creation_date']);
        document.getElementById('transactionCreationDate').textContent = ("0" + creationDateUserRelevant.getDate()).slice(-2) + ' ' + months[creationDateUserRelevant.getMonth()].slice(0, 3) + ' ' + creationDateUserRelevant.getFullYear();
        // Set Data Target for delete svg transactions
        document.getElementById('deleteSvgTransactions').setAttribute('data-target', transactionsId);
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

}(jQuery));
