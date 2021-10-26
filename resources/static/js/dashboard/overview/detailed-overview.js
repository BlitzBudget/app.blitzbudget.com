'use strict'
// Populate Detailed Overview For Chart
function populateDetailedOverviewForChart (dataSeries, isSeriesAnArray, mostWhateverTitle, minWhateverTitle, avWhateverTitle, tableTitle) {
  // Is Series An Array
  dataSeries.isSeriesAnArray = isSeriesAnArray
  // Data Series for export
  window.dataSeriesForExport = dataSeries

  const detailedOverviewOfChart = document.getElementById('detailedOverviewOfChart')
  // Title for cards
  document.getElementById('mostWhatever').textContent = mostWhateverTitle
  document.getElementById('minimumWhatever').textContent = minWhateverTitle
  document.getElementById('averageWhatever').textContent = avWhateverTitle
  document.getElementById('yourWhateverTitle').textContent = tableTitle

  // Replace HTML with Empty
  while (detailedOverviewOfChart.firstChild) {
    detailedOverviewOfChart.removeChild(detailedOverviewOfChart.firstChild)
  }

  // If the data series is empty then
  if (isEmpty(dataSeries)) {
    detailedOverviewOfChart.appendChild(buildEmptyTableOverview())
    // Replace with Empty Values
    document.getElementById('mostWhateverAmount').textContent = '-'
    document.getElementById('mostWhateverDate').textContent = '-'
    document.getElementById('minimumWhateverAmount').textContent = '-'
    document.getElementById('minimumWhateverDate').textContent = '-'
    document.getElementById('averageWhateverAmount').textContent = '-'
    document.getElementById('averageWhateverDate').textContent = '-'
    return
  }

  const docFrag = document.createDocumentFragment()

  /*
     * Table Responsive
     */
  const tableResponsive = document.createElement('div')
  tableResponsive.classList = 'table-responsive noselect'

  const tableFixed = document.createElement('div')
  tableFixed.classList = 'table table-fixed d-table'

  /*
     * Table Heading
     */
  const tableHeading = document.createElement('div')
  tableHeading.classList = 'tableHeadingDiv'

  const widthSixtyFive = document.createElement('div')
  widthSixtyFive.classList = 'w-65 d-table-cell'
  tableHeading.appendChild(widthSixtyFive)

  const widthThirty = document.createElement('div')
  widthThirty.classList = 'w-35 text-right d-table-cell'
  tableHeading.appendChild(widthThirty)
  tableFixed.appendChild(tableHeading)

  const tableBody = document.createElement('div')
  tableBody.classList = 'tableBodyDiv text-left'

  let mostwhatever = 0
  let minwhatever = 0
  let mostWhateverDate = today
  let minWhateverDate = today
  let totalWhatever = 0
  for (let i = 0, len = dataSeries.labels.length; i < len; i++) {
    let value = dataSeries.series[i]
    const label = dataSeries.labels[i]

    // If it is a bar chart then
    if (isSeriesAnArray) {
      value = dataSeries.series[0][i]
    }

    // Calculate Most Spent
    if (mostwhatever < value || i == 0) {
      mostwhatever = value
      mostWhateverDate = label
    }

    // Minimum Spent ( Assign the first element by default )
    if (minwhatever > value || i == 0) {
      minwhatever = value
      minWhateverDate = label
    }

    // Calculate Average Spent
    totalWhatever += value

    // Build One Detailed Overview
    tableBody.appendChild(buildOneDetailedOverview(value, label))
  }

  // Update Detailed insights
  document.getElementById('mostWhateverAmount').textContent = formatToCurrency(mostwhatever)
  document.getElementById('mostWhateverDate').textContent = mostWhateverDate
  document.getElementById('minimumWhateverAmount').textContent = formatToCurrency(minwhatever)
  document.getElementById('minimumWhateverDate').textContent = minWhateverDate
  document.getElementById('averageWhateverAmount').textContent = formatToCurrency(totalWhatever / dataSeries.labels.length)
  document.getElementById('averageWhateverDate').textContent = dataSeries.labels[0] + ' to ' + dataSeries.labels[dataSeries.labels.length - 1]

  /*
     * Append Table Body
     */
  tableFixed.appendChild(tableBody)

  /*
     * Table Footer
     */
  const tableFooter = document.createElement('div')
  tableFooter.classList = 'tableFooterDiv'
  tableFooter.appendChild(buildOneDetailedOverview(totalWhatever, window.translationData.overview.dynamic.detailed.total))

  /*
     * Export as CSV
     */
  const anchorFooter = document.createElement('div')
  anchorFooter.classList = 'd-table-row'

  const anchorCell1 = document.createElement('div')
  anchorCell1.classList = 'd-table-cell'
  anchorFooter.appendChild(anchorCell1)

  const anchorCell2 = document.createElement('a')
  anchorCell2.classList = 'd-table-cell text-info text-right'
  anchorCell2.id = 'export-as-csv'
  let exportTitle = window.translationData.overview.dynamic.detailed.exportascsv
  switch (window.currentUser.exportFileFormat) {
    case 'XLS':
      exportTitle = window.translationData.overview.dynamic.detailed.exportasxls
      break
    default:
      exportTitle = window.translationData.overview.dynamic.detailed.exportasxls
      break
  }
  anchorCell2.textContent = exportTitle
  anchorFooter.appendChild(anchorCell2)
  tableFooter.appendChild(anchorFooter)

  tableFixed.appendChild(tableFooter)
  tableResponsive.appendChild(tableFixed)
  docFrag.appendChild(tableResponsive)
  // Append to detailed overview
  detailedOverviewOfChart.appendChild(docFrag)
}

/*
 * Build Empty Table Overview
 */
function buildEmptyTableOverview () {
  const emptyTable = document.createElement('div')
  emptyTable.classList = 'table table-fixed d-table mt-4'

  emptyTable.appendChild(buildEmptyTransactionsTab())

  return emptyTable
}

// Builds the rows for recent transactions
function buildOneDetailedOverview (value, label) {
  const tableRowTransaction = document.createElement('div')
  tableRowTransaction.classList = 'recentTransactionEntry d-table-row'

  // Cell 1
  const tableCellTransactionDescription = document.createElement('div')
  tableCellTransactionDescription.classList = 'descriptionCellRT d-table-cell'

  const elementWithDescription = document.createElement('div')
  elementWithDescription.classList = 'font-weight-bold recentTransactionDescription p-2'
  elementWithDescription.textContent = label
  tableCellTransactionDescription.appendChild(elementWithDescription)

  const elementWithCategoryName = document.createElement('div')
  elementWithCategoryName.classList = 'font-size-70 categoryNameRT w-100'
  tableCellTransactionDescription.appendChild(elementWithCategoryName)
  tableRowTransaction.appendChild(tableCellTransactionDescription)

  // Cell 3
  const surCell = document.createElement('div')
  surCell.classList = 'd-table-cell'

  const transactionAmount = document.createElement('div')
  transactionAmount.classList = 'transactionAmountRT font-weight-bold text-right align-middle p-2 tripleNineColor'
  transactionAmount.textContent = formatToCurrency(value)
  surCell.appendChild(transactionAmount)

  const accountBalDiv = document.createElement('div')
  accountBalDiv.classList = 'accBalSubAmount pl-2 font-weight-bold text-right align-middle small'
  surCell.appendChild(accountBalDiv)
  tableRowTransaction.appendChild(surCell)

  return tableRowTransaction
}
