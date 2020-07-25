"use strict";
(function scopeWrapper($) {
    let incomeparam = isNotEmpty(window.translationData) ? window.translationData.overview.dynamic.incomeparam : 'Income';

    // Chart Income Breakdown Chart
    $("body").on("click", "#chooseCategoryDD .tagsOverview", function () {
        // Fetch Income
        let fetchIncome = isEqual(this.dataset.target, incomeparam);
        // Populate Categorize By tags
        populateCategorizeByTags(fetchIncome, window.overviewTransactionsCache);
        // Set the global variable for categorization
        window.whichChartIsOpen = 'categorizebytags';
    });


}(jQuery));

// Populate Categorize By tags
function populateCategorizeByTags(fetchIncome, transactions) {
    let tagsLabel = isNotEmpty(window.translationData) ? window.translationData.overview.dynamic.categorizebytags : 'Tags';
    replaceChartChosenLabel(tagsLabel);

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


    // Build the tags aggregation by transaction and calculate absolute total
    let transactionByTags = {};
    for (let count = 0, length = transactions.length; count < length; count++) {
        let transaction = transactions[count];
        let tags = transaction.tags;
        let incomeCategory = transaction.amount > 0 ? true : false;
        if (incomeCategory == fetchIncome && isNotEmpty(tags)) {
            // Add the amount for all the tags
            for (let i = 0, len = tags.length; i < len; i++) {
                let tag = tags[i];
                // Check if already present in map
                if (isNotEmpty(transactionByTags[tag])) {
                    transactionByTags[tag] += Math.abs(transaction.amount);
                } else {
                    transactionByTags[tag] = Math.abs(transaction.amount);
                }
                // Add the transaction amount to absolute total
                absoluteTotal += Math.abs(transaction.amount);
            }
        }
    }

    // Build the legend and the series array
    for (let key in transactionByTags) {
        let value = transactionByTags[key];

        if (isNotEmpty(transactionByTags[key])) {

            let percentageOfTotal = (transactionByTags[key] / absoluteTotal) * 100;
            // If the total is greater than 5 % then print it separate else accumulate it with others
            if (percentageOfTotal > 5) {
                labelsArray.push(key);
                seriesArray.push(transactionByTags[key]);
            } else {
                othersTotal += transactionByTags[key];
                otherLabels.push(key);
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

    buildPieChartForOverview(dataSimpleBarChart, 'colouredRoundedLineChart', absoluteTotal, 'tag', fetchIncome);
}
