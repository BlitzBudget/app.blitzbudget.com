"use strict";
(function scopeWrapper($) {
    let incomeparam = isNotEmpty(window.translationData) ? window.translationData.overview.dynamic.incomeparam : 'Income';

    // Chart Income Breakdown Chart
    $("body").on("click", "#chooseCategoryDD .accountOverview", function () {
        let accountLabel = isNotEmpty(window.translationData) ? window.translationData.overview.dynamic.categorizebyaccount : 'Account';
        replaceChartChosenLabel(accountLabel);
        // Fetch Income
        let fetchIncome = isEqual(this.dataset.target, incomeparam);
        // Populate Categorize By Account
        populateCategorizeByAccount(fetchIncome, window.overviewTransactionsCache);
    });

    // Populate Categorize By Account
    function populateCategorizeByAccount(fetchIncome, transactions) {
        let labelsArray = [];
        let seriesArray = [];
        let absoluteTotal = 0;
        let othersTotal = 0;
        let otherLabels = [];

        // Reset the line chart with spinner
        let colouredRoundedLineChart = document.getElementById('colouredRoundedLineChart');
        // Replace HTML with Empty
        while (colouredRoundedLineChart.firstChild) {
            colouredRoundedLineChart.removeChild(colouredRoundedLineChart.firstChild);
        }
        let h20 = document.createElement('div');
        h20.classList = 'h-20';
        let materialSpinnerElement = document.createElement('div');
        materialSpinnerElement.classList = 'material-spinner rtSpinner';
        h20.appendChild(materialSpinnerElement);
        colouredRoundedLineChart.appendChild(h20);


        // Build the account aggregation by transaction and calculate absolute total
        let transactionByAccount = {};
        for (let count = 0, length = transactions.length; count < length; count++) {
            let transaction = transactions[count];
            let accountId = transaction.account;
            let incomeCategory = transaction.amount > 0 ? true : false;
            if (incomeCategory == fetchIncome) {
                // Check if already present in map
                if (isNotEmpty(transactionByAccount[accountId])) {
                    transactionByAccount[accountId] += Math.abs(transaction.amount);
                } else {
                    transactionByAccount[accountId] = Math.abs(transaction.amount);
                }
                // Add the transaction amount to absolute total
                absoluteTotal += Math.abs(transaction.amount);
            }
        }

        // Build the legend and the series array
        let bankAccounts = window.allBankAccountInfoCache;
        for (let count = 0, length = bankAccounts.length; count < length; count++) {
            let account = bankAccounts[count];
            let accountId = account.accountId;

            if (isNotEmpty(transactionByAccount[accountId])) {

                let percentageOfTotal = (transactionByAccount[accountId] / absoluteTotal) * 100;
                // If the total is greater than 5 % then print it separate else accumulate it with others
                if (percentageOfTotal > 5) {
                    labelsArray.push(account['bank_account_name']);
                    seriesArray.push(transactionByAccount[accountId]);
                } else {
                    othersTotal += transactionByAccount[accountId];
                    otherLabels.push(transactionByAccount[accountId]);
                }

            }
        }

        // If others total is > 0 then print it.
        if (othersTotal > 0) {
            if (otherLabels.length > 1) {
                labelsArray.push('Others');
            } else {
                labelsArray.push(otherLabels[0]);
            }
            seriesArray.push(Math.abs(othersTotal));
        }

        let chartAppendingDiv = document.getElementById('colouredRoundedLineChart');
        // Replace inner HTML with EMPTY
        while (chartAppendingDiv.firstChild) {
            chartAppendingDiv.removeChild(chartAppendingDiv.firstChild);
        }
        // Replace with empty chart message
        if (isEmpty(seriesArray)) {
            chartAppendingDiv.appendChild(buildEmptyChartMessage());
            return;
        }

        // Build the data for the line chart
        let dataSimpleBarChart = {
            labels: labelsArray,
            series: seriesArray

        }

        buildPieChartForOverview(dataSimpleBarChart, 'colouredRoundedLineChart', absoluteTotal, 'account', fetchIncome);
    }

    // Build Empty chart
    function buildEmptyChartMessage() {
        let emptyChartMessage = document.createElement('div');
        emptyChartMessage.classList = 'text-center align-middle h-20';

        let divIconWrapper = document.createElement('div');
        divIconWrapper.classList = 'icon-center';

        let iconChart = document.createElement('i');
        iconChart.classList = 'material-icons noDataChartIcon';
        iconChart.textContent = 'multiline_chart';
        divIconWrapper.appendChild(iconChart);
        emptyChartMessage.appendChild(divIconWrapper);

        let emptyMessage = document.createElement('div');
        emptyMessage.classList = 'font-weight-bold tripleNineColor';
        emptyMessage.textContent = window.translationData.overview.dynamic.chart.nodata;
        emptyChartMessage.appendChild(emptyMessage);

        return emptyChartMessage;
    }

}(jQuery));