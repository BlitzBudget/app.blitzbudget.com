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

    $('body').on('click', '#deleteSvgTransactions', function (e) {
        let values = {};
        values.walletId = window.currentUser.walletId;
        values.itemId = this.dataset.target;

        // Ajax Requests on Error
        let ajaxData = {};
        ajaxData.isAjaxReq = true;
        ajaxData.type = "POST";
        ajaxData.url = window._config.api.invokeUrl + window._config.api.deleteItem;
        ajaxData.dataType = "json";
        ajaxData.contentType = "application/json;charset=UTF-8";
        ajaxData.data = JSON.stringify(values);
        ajaxData.onSuccess = function (jsonObj) {

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
    });

}(jQuery));
