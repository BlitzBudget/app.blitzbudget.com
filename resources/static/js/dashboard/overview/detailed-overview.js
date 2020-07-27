"use strict";
// Populate Detailed Overview For Chart
function populateDetailedOverviewForChart(dataSeries, isSeriesAnArray) {
    let docFrag = document.createDocumentFragment();
    let mostwhatever = 0;
    let minwhatever = 0;
    let totalWhatever = 0;
    for (let i = 0, len = dataSeries.labels.length; i < len; i++) {
        let value = dataSeries.series[i];
        let label = dataSeries.labels[i];

        // If it is a bar chart then
        if (isSeriesAnArray) {
            value = dataSeries.series[0][i];
        }

        // Calculate Most Spent
        if (mostwhatever < value) {
            mostwhatever = value;
        }

        // Minimum Spent
        if (minwhatever > value) {
            minwhatever = value;
        }

        // Calculate Average Spent
        totalWhatever += value;

        // Build One Detailed Overview
        docFrag.appendChild(buildOneDetailedOverview(value, label));
    }

    // Update Detailed insights
    document.getElementById('mostWhatever').textContent = formatToCurrency(mostwhatever);
    document.getElementById('minimumWhatever').textContent = formatToCurrency(minwhatever);
    document.getElementById('averageWhatever').textContent = formatToCurrency(totalWhatever / dataSeries.labels.length);

    // Append to detailed overview
    document.getElementById('detailedOverviewOfChart').appendChild(docFrag);
}

// Builds the rows for recent transactions
function buildOneDetailedOverview(value, label) {

    let tableRowTransaction = document.createElement('div');
    tableRowTransaction.classList = 'recentTransactionEntry d-table-row';

    // Cell 1
    let tableCellTransactionDescription = document.createElement('div');
    tableCellTransactionDescription.classList = 'descriptionCellRT d-table-cell';

    let elementWithDescription = document.createElement('div');
    elementWithDescription.classList = 'font-weight-bold recentTransactionDescription';
    elementWithDescription.textContent = label;
    tableCellTransactionDescription.appendChild(elementWithDescription);

    let elementWithCategoryName = document.createElement('div');
    elementWithCategoryName.classList = 'font-size-70 categoryNameRT w-100';
    tableCellTransactionDescription.appendChild(elementWithCategoryName);
    tableRowTransaction.appendChild(tableCellTransactionDescription);

    // Cell 3
    let surCell = document.createElement('div');
    surCell.classList = 'd-table-cell';

    let transactionAmount = document.createElement('div');
    transactionAmount.classList = 'transactionAmountRT font-weight-bold text-right align-middle';
    transactionAmount.textContent = formatToCurrency(value);
    surCell.appendChild(transactionAmount);

    let accountBalDiv = document.createElement('div');
    accountBalDiv.classList = 'accBalSubAmount pl-2 font-weight-bold text-right align-middle small';
    surCell.appendChild(accountBalDiv);
    tableRowTransaction.appendChild(surCell);

    return tableRowTransaction;

}
