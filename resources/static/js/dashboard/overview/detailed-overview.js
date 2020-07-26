"use strict";
// Populate Detailed Overview For Chart
function populateDetailedOverviewForChart(dataSeries) {
    for (let i = 0, len < dataSeries.series.length; i < len; i++) {
        let value = dataSeries.series[i];
        let label = dataSeries.labels[i];
        // Build One Detailed Overview
        buildOneDetailedOverview(value, label);
    }
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
    transactionAmount.textContent = value;
    surCell.appendChild(transactionAmount);

    let accountBalDiv = document.createElement('div');
    accountBalDiv.classList = 'accBalSubAmount pl-2 font-weight-bold text-right align-middle small';
    surCell.appendChild(accountBalDiv);
    tableRowTransaction.appendChild(surCell);

    return tableRowTransaction;

}
