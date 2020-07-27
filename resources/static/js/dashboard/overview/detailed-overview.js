"use strict";
// Populate Detailed Overview For Chart
function populateDetailedOverviewForChart(dataSeries, isSeriesAnArray) {

    let docFrag = document.createDocumentFragment();

    /*
     * Table Responsive
     */
    let tableResponsive = document.createElement('div');
    tableResponsive.classList = 'table-responsive';

    let tableFixed = document.createElement('div');
    tableFixed.classList = 'table table-fixed d-table';

    /*
     * Table Heading
     */
    let tableHeading = document.createElement('div');
    tableHeading.classList = 'tableHeadingDiv';

    let widthFifteen = document.createElement('div');
    widthFifteen.classList = 'w-15 d-table-cell';
    tableHeading.appendChild(widthFifteen);

    let widthSixtyFive = document.createElement('div');
    widthSixtyFive.classList = 'w-65 d-table-cell';
    tableHeading.appendChild(widthSixtyFive);

    let widthThirty = document.createElement('div');
    widthThirty.classList = 'text-right d-table-cell';
    tableHeading.appendChild(widthThirty);
    tableFixed.appendChild(tableHeading);

    let tableBody = document.createElement('div');
    tableBody.classList = 'tableBodyDiv text-left';

    let mostwhatever = 0;
    let minwhatever = 0;
    let mostWhateverDate = today;
    let minWhateverDate = today;
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
            mostWhateverDate = label;
        }

        // Minimum Spent ( Assign the first element by default )
        if (minwhatever > value || i == 0) {
            minwhatever = value;
            minWhateverDate = label;
        }

        // Calculate Average Spent
        totalWhatever += value;

        // Build One Detailed Overview
        tableBody.appendChild(buildOneDetailedOverview(value, label));
    }

    // Update Detailed insights
    document.getElementById('mostWhateverAmount').textContent = formatToCurrency(mostwhatever);
    document.getElementById('mostWhateverDate').textContent = mostWhateverDate;
    document.getElementById('minimumWhateverAmount').textContent = formatToCurrency(minwhatever);
    document.getElementById('minimumWhateverDate').textContent = minWhateverDate;
    document.getElementById('averageWhateverAmount').textContent = formatToCurrency(totalWhatever / dataSeries.labels.length);
    document.getElementById('averageWhateverDate').textContent = dataSeries.labels[0] + ' to ' + dataSeries.labels[dataSeries.labels.length - 1];

    /*
     * Append Table Body
     */
    tableFixed.appendChild(tableBody);
    tableResponsive.appendChild(tableFixed);
    docFrag.appendChild(tableResponsive);
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
