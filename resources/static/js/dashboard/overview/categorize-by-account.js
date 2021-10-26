'use strict';
(function scopeWrapper ($) {
  const incomeparam = isNotEmpty(window.translationData) ? window.translationData.overview.dynamic.incomeparam : 'Income'

  // Chart Income Breakdown Chart
  $('body').on('click', '#chooseCategoryDD .accountOverview', function () {
    // Fetch Income
    const fetchIncome = isEqual(this.dataset.target, incomeparam)
    // Populate Categorize By Account
    populateCategorizeByAccount(fetchIncome, window.overviewTransactionsCache)
    // Set the global variable for categorization
    window.whichChartIsOpen = 'categorizebyaccounts'
  })
}(jQuery))

// Populate Categorize By Account
function populateCategorizeByAccount (fetchIncome, transactions) {
  const accountLabel = isNotEmpty(window.translationData) ? window.translationData.overview.dynamic.categorizebyaccount : 'Account'
  replaceChartChosenLabel(accountLabel)

  const labelsArray = []
  const seriesArray = []
  const idArray = []
  const otherIdArray = []
  let absoluteTotal = 0
  let othersTotal = 0
  const otherLabels = []

  // Reset the line chart with spinner
  const colouredRoundedLineChart = document.getElementById('colouredRoundedLineChart')
  // Replace HTML with Empty
  while (colouredRoundedLineChart.firstChild) {
    colouredRoundedLineChart.removeChild(colouredRoundedLineChart.firstChild)
  }
  const h20 = document.createElement('div')
  h20.classList = 'h-20'
  const materialSpinnerElement = document.createElement('div')
  materialSpinnerElement.classList = 'material-spinner rtSpinner'
  h20.appendChild(materialSpinnerElement)
  colouredRoundedLineChart.appendChild(h20)

  // Build the account aggregation by transaction and calculate absolute total
  const transactionByAccount = {}
  for (let count = 0, length = transactions.length; count < length; count++) {
    const transaction = transactions[count]
    const accountId = transaction.account
    const incomeCategory = transaction.amount > 0
    if (incomeCategory == fetchIncome) {
      // Check if already present in map
      if (isNotEmpty(transactionByAccount[accountId])) {
        transactionByAccount[accountId] += Math.abs(transaction.amount)
      } else {
        transactionByAccount[accountId] = Math.abs(transaction.amount)
      }
      // Add the transaction amount to absolute total
      absoluteTotal += Math.abs(transaction.amount)
    }
  }

  // Build the legend and the series array
  const bankAccounts = window.allBankAccountInfoCache
  for (let count = 0, length = bankAccounts.length; count < length; count++) {
    const account = bankAccounts[count]
    const accountId = account.accountId

    if (isNotEmpty(transactionByAccount[accountId])) {
      const percentageOfTotal = (transactionByAccount[accountId] / absoluteTotal) * 100
      // If the total is greater than 5 % then print it separate else accumulate it with others
      if (percentageOfTotal > 5) {
        labelsArray.push(account.bank_account_name)
        seriesArray.push(transactionByAccount[accountId])
        idArray.push(accountId)
      } else {
        othersTotal += transactionByAccount[accountId]
        otherLabels.push(transactionByAccount[accountId])
        otherIdArray.push(accountId)
      }
    }
  }

  // If others total is > 0 then print it.
  if (othersTotal > 0) {
    if (otherLabels.length > 1) {
      labelsArray.push('Others')
    } else {
      labelsArray.push(otherLabels[0])
    }
    seriesArray.push(Math.abs(othersTotal))
    idArray.push(otherIdArray)
  }

  // Build the data for the line chart
  const dataSimpleBarChart = {
    labels: labelsArray,
    series: seriesArray,
    ids: idArray
  }

  buildPieChartForOverview(dataSimpleBarChart, 'colouredRoundedLineChart', absoluteTotal, 'account', fetchIncome, window.translationData.overview.dynamic.detailed.biggestamount, window.translationData.overview.dynamic.detailed.smallestamount, window.translationData.overview.dynamic.detailed.averageamount, window.translationData.overview.dynamic.detailed.youraccounts)
}
