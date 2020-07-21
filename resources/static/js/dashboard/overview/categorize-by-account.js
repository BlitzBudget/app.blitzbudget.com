"use strict";
(function scopeWrapper($) {
    let categorizeByAccount = isNotEmpty(window.translationData) ? window.translationData.overview.dynamic.categorizebyaccount : 'Account';

    // Chart Income Breakdown Chart
    $("body").on("click", "#chooseCategoryDD .accountOverview", function () {
        replaceChartChosenLabel(categorizeByAccount);
        // Populate Categorize By Account
        populateCategorizeByAccount(true);
    });

    // Populate Categorize By Account
    function populateCategorizeByAccount(fetchIncome) {
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
                    transactionByAccount += Math.abs(transaction.amount);
                } else {
                    transactionByAccount = Math.abs(transaction.amount);
                }
                // Add the transaction amount to absolute total
                absoluteTotal += Math.abs(transaction.amount);
            }
        }

        // Build the legend and the series array
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

        buildPieChart(dataSimpleBarChart, 'colouredAccountPieChart', absoluteTotal);
    }

    // Introduce Chartist pie chart
    function buildPieChart(dataPreferences, id, absoluteTotal) {
        /*  **************** Public Preferences - Pie Chart ******************** */

        let optionsPreferences = {
            donut: true,
            donutWidth: 50,
            startAngle: 270,
            showLabel: true,
            height: '300px'
        };

        let responsiveOptions = [
    	  ['screen and (min-width: 640px)', {
                chartPadding: 40,
                labelOffset: 50,
                labelDirection: 'explode',
                labelInterpolationFnc: function (value, idx) {
                    // Calculates the percentage of category total vs absolute total
                    let percentage = round((dataPreferences.series[idx] / absoluteTotal * 100), 2) + '%';
                    return value + ': ' + percentage;
                }
    	  }],
    	  ['screen and (min-width: 1301px)', {
                labelOffset: 30,
                chartPadding: 10
    	  }],
    	  ['screen and (min-width: 992px)', {
                labelOffset: 45,
                chartPadding: 40,
      	  }],

    	];

        // Reset the chart
        replaceHTML(id, '');
        $("#" + id).tooltip('dispose');

        // Append Tooltip for Doughnut chart
        if (isNotEmpty(dataPreferences)) {
            let categoryBreakdownChart = new Chartist.Pie('#' + id, dataPreferences, optionsPreferences, responsiveOptions).on('draw', function (data) {
                if (data.type === 'slice') {
                    let sliceValue = data.element._node.getAttribute('ct:value');
                    data.element._node.setAttribute("title", dataPreferences.labels[data.index] + ": <strong>" + formatToCurrency(Number(sliceValue)) + '</strong>');
                    data.element._node.setAttribute("data-chart-tooltip", id);
                }
            }).on("created", function () {
                // Initiate Tooltip
                $("#" + id).tooltip({
                    selector: '[data-chart-tooltip="' + id + '"]',
                    container: "#" + id,
                    html: true,
                    placement: 'auto',
                    delay: {
                        "show": 300,
                        "hide": 100
                    }
                });
            });

            // Animate the doughnut chart
            er.startAnimationDonutChart(categoryBreakdownChart);
        }

    }

}(jQuery));
