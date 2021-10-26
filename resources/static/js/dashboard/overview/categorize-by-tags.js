'use strict';
(function scopeWrapper ($) {
  const incomeparam = isNotEmpty(window.translationData) ? window.translationData.overview.dynamic.incomeparam : 'Income'

  // Chart Income Breakdown Chart
  $('body').on('click', '#chooseCategoryDD .tagsOverview', function () {
    // Fetch Income
    const fetchIncome = isEqual(this.dataset.target, incomeparam)
    // Populate Categorize By tags
    populateCategorizeByTags(fetchIncome, window.overviewTransactionsCache)
    // Set the global variable for categorization
    window.whichChartIsOpen = 'categorizebytags'
  })
}(jQuery))

// Populate Categorize By tags
function populateCategorizeByTags (fetchIncome, transactions) {
  const tagsLabel = isNotEmpty(window.translationData) ? window.translationData.overview.dynamic.categorizebytags : 'Tags'
  replaceChartChosenLabel(tagsLabel)

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

  // Build the tags aggregation by transaction and calculate absolute total
  const transactionByTags = {}
  for (let count = 0, length = transactions.length; count < length; count++) {
    const transaction = transactions[count]
    const tags = transaction.tags
    const incomeCategory = transaction.amount > 0
    if (incomeCategory == fetchIncome && isNotEmpty(tags)) {
      // Add the amount for all the tags
      for (let i = 0, len = tags.length; i < len; i++) {
        const tag = tags[i]
        // Check if already present in map
        if (isNotEmpty(transactionByTags[tag])) {
          transactionByTags[tag] += Math.abs(transaction.amount)
        } else {
          transactionByTags[tag] = Math.abs(transaction.amount)
        }
        // Add the transaction amount to absolute total
        absoluteTotal += Math.abs(transaction.amount)
      }
    }
  }

  // Build the legend and the series array
  for (const key in transactionByTags) {
    const value = transactionByTags[key]

    if (isNotEmpty(transactionByTags[key])) {
      const percentageOfTotal = (transactionByTags[key] / absoluteTotal) * 100
      // If the total is greater than 5 % then print it separate else accumulate it with others
      if (percentageOfTotal > 5) {
        labelsArray.push(key)
        seriesArray.push(transactionByTags[key])
        idArray.push(key)
      } else {
        othersTotal += transactionByTags[key]
        otherLabels.push(key)
        otherIdArray.push(key)
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

  buildPieChartForOverview(dataSimpleBarChart, 'colouredRoundedLineChart', absoluteTotal, 'tag', fetchIncome, window.translationData.overview.dynamic.detailed.biggestamount, window.translationData.overview.dynamic.detailed.smallestamount, window.translationData.overview.dynamic.detailed.averageamount, window.translationData.overview.dynamic.detailed.yourtags)
}
