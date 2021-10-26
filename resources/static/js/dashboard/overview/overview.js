'use strict';
(function scopeWrapper ($) {
  // User Budget Map Cache
  const userBudgetCache = {}
  // OVERVIEW CONSTANTS
  const OVERVIEW_CONSTANTS = {}
  // SECURITY: Defining Immutable properties as constants
  let oneyearoverview = isNotEmpty(window.translationData) ? window.translationData.overview.dynamic.oneyear : 'One Year Overview'
  let incomeparam = isNotEmpty(window.translationData) ? window.translationData.overview.dynamic.incomeparam : 'Income'
  let expenseparam = isNotEmpty(window.translationData) ? window.translationData.overview.dynamic.expenseparam : 'Expense'
  // Lifetime Income Transactions cache
  window.liftimeTransactionsCache = {}
  // populate category breakdown for income or expense
  let fetchIncomeBreakDownCache = true
  // One year Overview
  const oneYearOverviewOption = 'oneyearoverview'
  // Category Breakdown
  const categoryBreakdownOption = 'categorybreakdown'
  // One Year Overview option
  window.whichChartIsOpen = oneYearOverviewOption
  // Cache the previous year picker date
  const currentYearSelect = new Date().getFullYear()
  const previousDateYearPicker = currentYearSelect - 2
  // Cache the next year Picker data
  const nextDateYearPicker = currentYearSelect + 2

  /**
     * Get Overview
     **/
  /**
     * START loading the page
     *
     */
  const currentPageInCookie = er.getCookie('currentPage')
  if (isEqual(currentPageInCookie, 'overviewPage')) {
    if (isEqual(window.location.href, window._config.app.invokeUrl)) {
      populateCurrentPage('overviewPage')
    }
  }

  const overviewPage = document.getElementById('overviewPage')
  if (isNotEmpty(overviewPage)) {
    overviewPage.addEventListener('click', function (e) {
      populateCurrentPage('overviewPage')
    })
  }

  function populateCurrentPage (page) {
    er.refreshCookiePageExpiry(page)
    er.fetchCurrentPage('/overview', function (data) {
      // Load the new HTML
      $('#mutableDashboard').html(data)
      // Translate current Page
      translatePage(getLanguage())
      /**
             * Get Overview
             **/
      fetchOverview(incomeparam)
      populateOverviewPage()
      // Set Current Page
      const currentPage = document.getElementById('currentPage')
      currentPage.setAttribute('data-i18n', 'overview.page.title')
      currentPage.textContent = isNotEmpty(window.translationData) ? window.translationData.overview.dynamic.title : 'Overview'
    })
  }

  function populateOverviewPage () {
    /**
         *  Add Functionality Generic + Btn
         **/

    // Generic Add Functionality
    const genericAddFnc = document.getElementById('genericAddFnc')
    genericAddFnc.classList.add('d-none')

    // If highlight is not present
    if (document.getElementsByClassName('highlightOverviewSelected').length == 0) {
      // Add highlighted element to the income
      document.getElementsByClassName('income')[0].classList.add('highlightOverviewSelected')
      // Choose one year overview
      window.whichChartIsOpen = oneYearOverviewOption
    }

    /**
         * Date Picker
         */

    // Date Picker on click month
    $('.monthPickerMonth').unbind('click').click(function () {
      // Month picker is current selected then do nothing
      if (this.classList.contains('monthPickerMonthSelected')) {
        return
      }

      // Set chosen date
      er.setChosenDateWithSelected(this)
      // Calculate the income and expense image
      const highlightedOverview = document.getElementsByClassName('highlightOverviewSelected')[0].classList
      const expenseImage = highlightedOverview.contains('expense')
      const incomeImage = highlightedOverview.contains('income')
      let incomeTotalParam
      if (expenseImage) {
        incomeTotalParam = expenseparam
      }
      if (incomeImage) {
        incomeTotalParam = incomeparam
      }

      fetchOverview(incomeTotalParam)
    })
  }

  function fetchOverview (incomeTotalParam) {
    const budgetDivFragment = document.createDocumentFragment()

    const values = {}
    if (isNotEmpty(window.currentUser.walletId)) {
      values.walletId = window.currentUser.walletId
      values.userId = window.currentUser.financialPortfolioId
    } else {
      values.userId = window.currentUser.financialPortfolioId
    }
    const y = window.chosenDate.getFullYear()
    const m = window.chosenDate.getMonth()
    values.startsWithDate = new Date(y, m)
    values.endsWithDate = new Date(y, m + 1, 0)

    // Ajax Requests on Error
    const ajaxData = {}
    ajaxData.isAjaxReq = true
    ajaxData.type = 'POST'
    ajaxData.url = CUSTOM_DASHBOARD_CONSTANTS.overviewUrl
    ajaxData.dataType = 'json'
    ajaxData.contentType = 'application/json;charset=UTF-8'
    ajaxData.data = JSON.stringify(values)
    ajaxData.onSuccess = function (result) {
      oneyearoverview = isNotEmpty(window.translationData) ? window.translationData.overview.dynamic.oneyear : 'One Year Overview'
      incomeparam = isNotEmpty(window.translationData) ? window.translationData.overview.dynamic.incomeparam : 'Income'
      expenseparam = isNotEmpty(window.translationData) ? window.translationData.overview.dynamic.expenseparam : 'Expense'
      // Replace currentCurrencySymbol with currency symbol
      replaceWithCurrency(result.Wallet)
      // Dates Cache
      window.datesCreated = result.Date
      // Global Transactions Cache
      window.overviewTransactionsCache = result.Transaction

      er_a.populateBankInfo(result.BankAccount)

      fetchJSONForCategories(result.Category)

      populateAppropriateChart(result.Date)

      /**
                 * Populate total Asset, Liability & Networth
                 */
      populateTotalAssetLiabilityAndNetworth(result.Wallet)
    },
    ajaxData.onFailure = function (thrownError) {
      manageErrors(thrownError, window.translationData.overview.dynamic.geterror, ajaxData)
    }

    // Load all user transaction from API
    $.ajax({
      url: ajaxData.url,
      beforeSend: function (xhr) {
        xhr.setRequestHeader('Authorization', authHeader)
      },
      type: ajaxData.type,
      dataType: ajaxData.dataType,
      contentType: ajaxData.contentType,
      data: ajaxData.data,
      success: ajaxData.onSuccess,
      error: ajaxData.onFailure
    })
  }

  /*
     * Populate appropriate chart
     */
  function populateAppropriateChart (dateLineChart) {
    // Replace the drop down for chart options
    const incomeOrExpenseLabel = fetchIncomeBreakDownCache ? 'Income' : 'Expense'
    // Label For Category
    const labelForCategory = fetchIncomeBreakDownCache ? window.translationData.overview.dynamic.incomebreakdown : window.translationData.overview.dynamic.expensebreakdown
    appendChartOptionsForIncomeOrExpense(incomeOrExpenseLabel, labelForCategory)
    // Show the button to choose charts
    document.getElementById('chosenChartIncAndExp').classList.remove('d-none')
    document.getElementById('chosenChartIncAndExp').classList.add('d-lg-block')
    // Which Chart is open
    switch (window.whichChartIsOpen) {
      case categoryBreakdownOption:
        // Populate category brakdown
        populateCategoryBreakdown(fetchIncomeBreakDownCache)
        document.getElementById('chartDisplayTitle').firstChild.nodeValue = labelForCategory
        break
      case oneYearOverviewOption:
        // Upon refresh call the income overview chart
        populateLineChart(dateLineChart, fetchIncomeBreakDownCache)
        document.getElementById('chartDisplayTitle').firstChild.nodeValue = labelForCategory
        break
      case 'categorizebytags':
        // Populate Categorize By tags
        populateCategorizeByTags(fetchIncomeBreakDownCache, window.overviewTransactionsCache)
        break
      case 'categorizebyaccounts':
        // Populate Categorize By Account
        populateCategorizeByAccount(fetchIncomeBreakDownCache, window.overviewTransactionsCache)
        break
    }
  }

  // Populate Income Average
  function populateTotalAssetLiabilityAndNetworth (wallet) {
    // Asset Accumulated
    // Animate Value from 0 to value
    animateValue(document.getElementById('assetAccumuluatedAmount'), 0, wallet.total_asset_balance, currentCurrencyPreference, 200)

    // Debt Accumulated
    // Animate Value from 0 to value
    animateValue(document.getElementById('debtAccumulatedAmount'), 0, wallet.total_debt_balance, currentCurrencyPreference, 200)

    // Networth Accumulated
    // Animate Value from 0 to value
    animateValue(document.getElementById('networthAmount'), 0, wallet.wallet_balance, currentCurrencyPreference, 200)
  }

  /**
     * Chart Functionality
     *
     */

  function incomeOrExpenseOverviewChart (incomeTotalParameter, dateAndAmountAsList) {
    // If income Total Param is empty
    if (isEmpty(incomeTotalParameter)) {
      return
    }

    // Replace the Drop down with one year view
    replaceChartChosenLabel(oneyearoverview)

    // Store it in a cache
    liftimeTransactionsCache = dateAndAmountAsList
    // Make it reasonably immutable
    Object.freeze(liftimeTransactionsCache)
    Object.seal(liftimeTransactionsCache)
    // Income or Expense Chart Options
    let incomeOrExpense = ''
    let translatedText

    if (isEqual(incomeparam, incomeTotalParameter)) {
      incomeOrExpense = 'Income'
      translatedText = window.translationData.overview.dynamic.chart.incomeoverview

      calcAndBuildLineChart(dateAndAmountAsList, 'income_total', window.translationData.overview.dynamic.detailed.highestincome, window.translationData.overview.dynamic.detailed.lowestincome, window.translationData.overview.dynamic.detailed.averageincome, window.translationData.overview.dynamic.detailed.yourincome)
    } else {
      incomeOrExpense = 'Expense'
      translatedText = window.translationData.overview.dynamic.chart.expenseoverview

      calcAndBuildLineChart(dateAndAmountAsList, 'expense_total', window.translationData.overview.dynamic.detailed.lowestexpense, window.translationData.overview.dynamic.detailed.highestexpense, window.translationData.overview.dynamic.detailed.averageexpense, window.translationData.overview.dynamic.detailed.yourexpense)
    }

    appendChartOptionsForIncomeOrExpense(incomeOrExpense, translatedText)
  }

  // Calculate and build line chart for income / expense
  function calcAndBuildLineChart (dateAndAmountAsList, totalAm, highestWhatever, lowestWhatever, averageWhatever, yourWhateverTitle) {
    const labelsArray = []
    const seriesArray = []

    const chartAppendingDiv = document.getElementById('colouredRoundedLineChart')
    // Replace inner HTML with EMPTY
    while (chartAppendingDiv.firstChild) {
      chartAppendingDiv.removeChild(chartAppendingDiv.firstChild)
    }
    // Replace with empty chart message
    if (isEmpty(dateAndAmountAsList)) {
      chartAppendingDiv.appendChild(buildEmptyChartMessageForOverview())
      // Populate the empty data in detail
      populateDetailedOverviewForChart(seriesArray, true, highestWhatever, lowestWhatever, averageWhatever, yourWhateverTitle)
      return
    }

    // If year selected in IYP then
    let countValue = 0
    // One year of data at a time;
    countValue = dateAndAmountAsList.length > 12 ? (dateAndAmountAsList.length - 12) : 0

    for (let countGrouped = countValue, length = dateAndAmountAsList.length; countGrouped < length; countGrouped++) {
      const dateItem = dateAndAmountAsList[countGrouped]

      // Convert the date key as date
      const dateAsDate = new Date(lastElement(splitElement(dateItem.dateId, '#')))

      labelsArray.push(months[dateAsDate.getMonth()].slice(0, 3) + " '" + dateAsDate.getFullYear().toString().slice(-2))

      // Build the series array with total amount for date
      seriesArray.push(dateItem[totalAm])
    }

    // Build the data for the line chart
    dataColouredRoundedLineChart = {
      labels: labelsArray,
      series: [
		        	seriesArray
		         ]
    }

    // Populate the data in detail
    populateDetailedOverviewForChart(dataColouredRoundedLineChart, true, highestWhatever, lowestWhatever, averageWhatever, yourWhateverTitle)

    // Replace with empty chart message
    if (isEmpty(seriesArray)) {
      chartAppendingDiv.appendChild(buildEmptyChartMessageForOverview())
      return
    } else if (seriesArray.length == 1) {
      chartAppendingDiv.appendChild(buildInsufficientInfoMessage())
      return
    }

    // Display the line chart
    coloredRounedLineChart(dataColouredRoundedLineChart)
  }

  // Click the overview card items
  $('body').on('click', '.chart-option', function () {
    oneyearoverview = isNotEmpty(window.translationData) ? window.translationData.overview.dynamic.oneyear : 'One Year Overview'
    incomeparam = isNotEmpty(window.translationData) ? window.translationData.overview.dynamic.incomeparam : 'Income'
    expenseparam = isNotEmpty(window.translationData) ? window.translationData.overview.dynamic.expenseparam : 'Expense'
    $('.chart-option').removeClass('active')
    this.classList.add('active')
    // Append spinner
    const chartAppendingDiv = document.getElementById('colouredRoundedLineChart')
    const materialSpinnerDocumentFragment = document.createDocumentFragment()
    materialSpinnerDocumentFragment.appendChild(buildMaterialSpinner())
    // Replace inner HTML with EMPTY
    while (chartAppendingDiv.firstChild) {
      chartAppendingDiv.removeChild(chartAppendingDiv.firstChild)
    }
    chartAppendingDiv.appendChild(materialSpinnerDocumentFragment)

    // Start requesting the chart
    const firstChildClassList = this.classList
    if (firstChildClassList.contains('income')) {
      fetchIncomeBreakDownCache = true
      // Populate appropriate chart
      populateAppropriateChart(liftimeTransactionsCache)
    } else if (firstChildClassList.contains('expense')) {
      fetchIncomeBreakDownCache = false
      // Populate appropriate chart
      populateAppropriateChart(liftimeTransactionsCache)
    } else if (firstChildClassList.contains('assets')) {
      // Populate Asset Chart
      populateAssetBarChart(true)
      // Change Label
      document.getElementById('chartDisplayTitle').firstChild.nodeValue = window.translationData.overview.dynamic.chart.assetoverview
    } else if (firstChildClassList.contains('debt')) {
      // Populate Debt Chart
      populateAssetBarChart(false)
      // Change Label
      document.getElementById('chartDisplayTitle').firstChild.nodeValue = window.translationData.overview.dynamic.chart.debtoverview
    } else if (firstChildClassList.contains('networth')) {
      // Show the button to choose charts
      document.getElementById('chosenChartIncAndExp').classList.add('d-none')
      document.getElementById('chosenChartIncAndExp').classList.remove('d-lg-block')
      populateNetworthBarChart()
      // Change Label
      document.getElementById('chartDisplayTitle').firstChild.nodeValue = window.translationData.overview.dynamic.chart.networthoverview
    }

    // Remove the old highlighted element
    const overviewEntryrow = document.getElementsByClassName('overviewEntryRow')
    for (let count = 0, length = overviewEntryrow.length; count < length; count++) {
      const overviewEntryElement = overviewEntryrow[count]

      if (overviewEntryElement.classList.contains('highlightOverviewSelected')) {
        overviewEntryElement.classList.remove('highlightOverviewSelected')
      }
    }

    // Add the highlight to the element
    this.classList.add('highlightOverviewSelected')
  })

  /*  **************** Coloured Rounded Line Chart - Line Chart ******************** */

  function coloredRounedLineChart (dataColouredRoundedLineChart) {
    optionsColouredRoundedLineChart = {
      lineSmooth: Chartist.Interpolation.cardinal({
        tension: 10
      }),
      axisY: {
        showGrid: true,
        offset: 70,
        labelInterpolationFnc: function (value) {
          value = formatLargeCurrencies(value)
          return value + currentCurrencyPreference
        },
        scaleMinSpace: 15
      },
      axisX: {
        showGrid: false,
        offset: 40
      },
      showPoint: true,
      height: '400px'
    }

    // Empty the chart div
    const coloredChartDiv = document.getElementById('colouredRoundedLineChart')
    // Replace inner HTML with EMPTY
    while (coloredChartDiv.firstChild) {
      coloredChartDiv.removeChild(coloredChartDiv.firstChild)
    }
    // Dispose the previous tooltips created
    $('#colouredRoundedLineChart').tooltip('dispose')

    // Append tooltip with line chart
    const colouredRoundedLineChart = new Chartist.Line('#colouredRoundedLineChart', dataColouredRoundedLineChart, optionsColouredRoundedLineChart).on('draw', function (data) {
      if (data.type === 'point') {
        data.element._node.setAttribute('title', data.axisX.ticks[data.index] + ': <strong>' + formatToCurrency(data.value.y) + '</strong>')
        data.element._node.setAttribute('data-chart-tooltip', 'colouredRoundedLineChart')
      }
    }).on('created', function () {
      // Initiate Tooltip
      $('#colouredRoundedLineChart').tooltip({
        selector: '[data-chart-tooltip="colouredRoundedLineChart"]',
        container: '#colouredRoundedLineChart',
        html: true,
        placement: 'auto',
        delay: {
          show: 300,
          hide: 100
        }
      })
    })

    md.startAnimationForLineChart(colouredRoundedLineChart)
  }

  // Build material Spinner
  function buildMaterialSpinner () {
    const materialSpinnerDiv = document.createElement('div')
    materialSpinnerDiv.classList = 'material-spinner rtSpinner'

    return materialSpinnerDiv
  }

  // Build Insufficient Information Message
  function buildInsufficientInfoMessage () {
    const emptyChartMessage = document.createElement('div')
    emptyChartMessage.classList = 'text-center align-middle'

    const divIconWrapper = document.createElement('div')
    divIconWrapper.classList = 'icon-center'

    const iconChart = document.createElement('i')
    iconChart.classList = 'material-icons noDataChartIcon'
    iconChart.textContent = 'bubble_chart'
    divIconWrapper.appendChild(iconChart)
    emptyChartMessage.appendChild(divIconWrapper)

    const emptyMessage = document.createElement('div')
    emptyMessage.classList = 'font-weight-bold tripleNineColor'
    emptyMessage.textContent = window.translationData.overview.dynamic.chart.onecategory
    emptyChartMessage.appendChild(emptyMessage)

    return emptyChartMessage
  }

  /**
     * Chart Overview Drop Down (Income / Expense)
     */
  function appendChartOptionsForIncomeOrExpense (incomeOrExpenseParam, incomeOrExpText) {
    const anchorFragment = document.createDocumentFragment()

    const anchorDropdownItem = document.createElement('a')
    anchorDropdownItem.classList = 'dropdown-item chartOverview' + incomeOrExpenseParam

    const categoryLabelDiv = document.createElement('div')
    categoryLabelDiv.classList = 'font-weight-bold'
    categoryLabelDiv.textContent = oneyearoverview
    anchorDropdownItem.appendChild(categoryLabelDiv)
    anchorFragment.appendChild(anchorDropdownItem)

    const anchorDropdownItem1 = document.createElement('a')
    anchorDropdownItem1.classList = 'dropdown-item chartBreakdown' + incomeOrExpenseParam

    const categoryLabelDiv1 = document.createElement('div')
    categoryLabelDiv1.classList = 'font-weight-bold'
    categoryLabelDiv1.textContent = incomeOrExpText
    anchorDropdownItem1.appendChild(categoryLabelDiv1)
    anchorFragment.appendChild(anchorDropdownItem1)

    // By Account
    const anchorDropdownItem2 = document.createElement('a')
    anchorDropdownItem2.classList = 'dropdown-item accountOverview'
    anchorDropdownItem2.setAttribute('data-target', incomeOrExpenseParam)

    const categoryLabelDiv2 = document.createElement('div')
    categoryLabelDiv2.classList = 'font-weight-bold'
    categoryLabelDiv2.textContent = isNotEmpty(window.translationData) ? window.translationData.overview.dynamic.categorizebyaccount : 'Account'
    anchorDropdownItem2.appendChild(categoryLabelDiv2)
    anchorFragment.appendChild(anchorDropdownItem2)

    // By Tags
    const anchorDropdownItem3 = document.createElement('a')
    anchorDropdownItem3.classList = 'dropdown-item tagsOverview'
    anchorDropdownItem3.setAttribute('data-target', incomeOrExpenseParam)

    const categoryLabelDiv3 = document.createElement('div')
    categoryLabelDiv3.classList = 'font-weight-bold'
    categoryLabelDiv3.textContent = isNotEmpty(window.translationData) ? window.translationData.overview.dynamic.categorizebytags : 'Tags'
    anchorDropdownItem3.appendChild(categoryLabelDiv3)
    anchorFragment.appendChild(anchorDropdownItem3)

    const chooseCategoryDD = document.getElementById('chooseCategoryDD')
    // Replace inner HTML with EMPTY
    while (chooseCategoryDD.firstChild) {
      chooseCategoryDD.removeChild(chooseCategoryDD.firstChild)
    }
    chooseCategoryDD.appendChild(anchorFragment)
  }

  // Chart Income One Year Overview
  $('body').on('click', '#chooseCategoryDD .chartOverviewIncome', function () {
    // Dough nut breakdown open cache
    window.whichChartIsOpen = oneYearOverviewOption
    // populate the income line chart from cache
    populateLineChart(liftimeTransactionsCache, true)
  })

  // Chart Income Breakdown Chart
  $('body').on('click', '#chooseCategoryDD .chartBreakdownIncome', function () {
    // Dough nut breakdown open cache
    window.whichChartIsOpen = categoryBreakdownOption
    // Populate Breakdown Category
    populateCategoryBreakdown(true)
  })

  // Chart Expense One Year Overview
  $('body').on('click', '#chooseCategoryDD .chartOverviewExpense', function () {
    // Dough nut breakdown open cache
    window.whichChartIsOpen = oneYearOverviewOption
    // Populate the expense line chart from cache
    populateLineChart(liftimeTransactionsCache, false)
  })

  // Chart Expense  Breakdown Chart
  $('body').on('click', '#chooseCategoryDD .chartBreakdownExpense', function () {
    // Dough nut breakdown open cache
    window.whichChartIsOpen = categoryBreakdownOption
    // Populate Breakdown Category
    populateCategoryBreakdown(false)
  })

  // Populate Breakdown Category
  function populateCategoryBreakdown (fetchIncome) {
    // Fetch the expense cache
    fetchIncomeBreakDownCache = fetchIncome

    // Label For Category
    const labelForCategory = fetchIncome ? window.translationData.overview.dynamic.incomebreakdown : window.translationData.overview.dynamic.expensebreakdown

    // Replace the Drop down with category options label
    replaceChartChosenLabel(labelForCategory)

    const labelsArray = []
    const seriesArray = []
    const idArray = []
    const otherIdArray = []
    let absoluteTotal = 0
    let othersTotal = 0
    const otherLabels = []

    // Build the Absolute total
    const incomeCategory = fetchIncome ? CUSTOM_DASHBOARD_CONSTANTS.incomeCategory : CUSTOM_DASHBOARD_CONSTANTS.expenseCategory
    const categoryKeys = Object.keys(window.categoryMap)
    for (let count = 0, length = categoryKeys.length; count < length; count++) {
      const categoryId = categoryKeys[count]
      const categoryObject = window.categoryMap[categoryId]
      if (categoryObject.type == incomeCategory && isNotEmpty(categoryObject.categoryTotal)) {
        // Add the category total to absolute total
        absoluteTotal += Math.abs(categoryObject.categoryTotal)
      }
    }

    // Build the legend and the series array
    for (let count = 0, length = categoryKeys.length; count < length; count++) {
      const categoryId = categoryKeys[count]
      const categoryObject = window.categoryMap[categoryId]

      if (categoryObject.type == incomeCategory && isNotEmpty(categoryObject.categoryTotal)) {
        const percentageOfTotal = (Math.abs(categoryObject.categoryTotal) / absoluteTotal) * 100
        // If the total is greater than 5 % then print it separate else accumulate it with others
        if (percentageOfTotal > 5) {
          labelsArray.push(categoryObject.name)
          seriesArray.push(Math.abs(categoryObject.categoryTotal))
          idArray.push(categoryId)
        } else {
          othersTotal += Math.abs(categoryObject.categoryTotal)
          otherLabels.push(categoryObject.name)
          otherIdArray.push(categoryId)
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

    buildPieChartForOverview(dataSimpleBarChart, 'colouredRoundedLineChart', absoluteTotal, 'category', fetchIncome, 'Biggest Amount', 'Smallest Amount', 'Average Amount', 'Your Categories')
  }

  // Populate the line chart from cache
  function populateLineChart (dateAndTimeAsList, incomeChart) {
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

    if (incomeChart) {
      incomeOrExpenseOverviewChart(incomeparam, dateAndTimeAsList)
    } else {
      incomeOrExpenseOverviewChart(expenseparam, dateAndTimeAsList)
    }
  }

  /**
     * Build Total Assets / liability
     **/
  function populateAssetBarChart (fetchAssets) {
    // Show the button to choose charts
    document.getElementById('chosenChartIncAndExp').classList.add('d-none')
    document.getElementById('chosenChartIncAndExp').classList.remove('d-lg-block')
    // Fetch asset or liability
    const accType = fetchAssets ? 'ASSET' : 'DEBT'

    buildBarchartForAssetOrDebt(window.allBankAccountInfoCache, accType)
  }

  // Build Barchart For Asset Or Debt
  function buildBarchartForAssetOrDebt (bankAccountList, accType) {
    const labelsArray = []
    const seriesArray = []

    // Iterate all bank accounts
    for (let i = 0, length = bankAccountList.length; i < length; i++) {
      const bankAcc = bankAccountList[i]
      // Ensure if the asset type matches the bank account
      if (isEqual(accType, bankAcc.account_type)) {
        labelsArray.push(bankAcc.bank_account_name)
        seriesArray.push(bankAcc.account_balance)
      }
    }

    const dataSimpleBarChart = {
      labels: labelsArray,
      series: seriesArray
    }

    const chartAppendingDiv = document.getElementById('colouredRoundedLineChart')
    // Replace inner HTML with EMPTY
    while (chartAppendingDiv.firstChild) {
      chartAppendingDiv.removeChild(chartAppendingDiv.firstChild)
    }
    // If series array is empty then
    if (isEmpty(seriesArray)) {
      chartAppendingDiv.appendChild(buildEmptyChartMessageForOverview())
      return
    }

    const optionsSimpleBarChart = {
      distributeSeries: true,
      seriesBarDistance: 10,
      axisX: {
        showGrid: false,
        offset: 40
      },
      axisY: {
        labelInterpolationFnc: function (value, index) {
          value = formatLargeCurrencies(value)
          return value + currentCurrencyPreference
        },
        // Offset Y axis label
        offset: 70
      },
      height: '400px'
    }

    buildBarChart(dataSimpleBarChart, optionsSimpleBarChart)
  }

  // Build Empty Chart information
  function populateEmptyChartInfo () {
    const chartAppendingDiv = document.getElementById('colouredRoundedLineChart')
    const emptyMessageDocumentFragment = document.createDocumentFragment()
    emptyMessageDocumentFragment.appendChild(buildEmptyChartMessageForOverview())
    // Replace inner HTML with EMPTY
    while (chartAppendingDiv.firstChild) {
      chartAppendingDiv.removeChild(chartAppendingDiv.firstChild)
    }
    chartAppendingDiv.appendChild(emptyMessageDocumentFragment)
  }

  // build line chart
  function buildBarChart (dataSimpleBarChart, optionsSimpleBarChart) {
    // Populate the empty data in detail
    populateDetailedOverviewForChart(dataSimpleBarChart, false, window.translationData.overview.dynamic.detailed.biggestbalance, window.translationData.overview.dynamic.detailed.smallestbalance, window.translationData.overview.dynamic.detailed.averagebalance, window.translationData.overview.dynamic.detailed.youraccounts)

    // If series array is empty then
    if (isEmpty(dataSimpleBarChart)) {
      populateEmptyChartInfo()
      return
    }

    /*  **************** Simple Bar Chart - barchart ******************** */

    const responsiveOptionsSimpleBarChart = [
      ['screen and (max-width: 640px)', {
        seriesBarDistance: 5,
        axisX: {
          labelInterpolationFnc: function (value) {
            return value[0]
          }
        }
      }]
    ]

    // Empty the chart div
    const coloredChartDiv = document.getElementById('colouredRoundedLineChart')
    // Replace inner HTML with EMPTY
    while (coloredChartDiv.firstChild) {
      coloredChartDiv.removeChild(coloredChartDiv.firstChild)
    }
    // Dispose the previous tooltips created
    $('#colouredRoundedLineChart').tooltip('dispose')

    const simpleBarChart = Chartist.Bar('#colouredRoundedLineChart', dataSimpleBarChart, optionsSimpleBarChart, responsiveOptionsSimpleBarChart)

    // On draw bar chart
    simpleBarChart.on('draw', function (data) {
      if (data.type === 'bar') {
        // Tooltip
        const minusSign = ''
        amount = formatToCurrency(data.value.y)
        data.element._node.setAttribute('title', data.axisX.ticks[data.seriesIndex] + ': <strong>' + amount + '</strong>')
        data.element._node.setAttribute('data-chart-tooltip', 'colouredRoundedLineChart')
      }
    }).on('created', function () {
      // Initiate Tooltip
      $('#colouredRoundedLineChart').tooltip({
        selector: '[data-chart-tooltip="colouredRoundedLineChart"]',
        container: '#colouredRoundedLineChart',
        html: true,
        placement: 'auto',
        delay: {
          show: 300,
          hide: 100
        }
      })
    })

    // start animation for the Emails Subscription Chart
    er.startAnimationForBarChart(simpleBarChart)
  }

  /**
     *	Populate networth
     **/
  function populateNetworthBarChart () {
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

    buildchartForNetworth(window.allBankAccountInfoCache)
  }

  // Build Barchart For Asset Or Debt
  function buildchartForNetworth (bankAccountList) {
    const labelsArray = []
    const seriesArray = []
    const seriesArrayDebt = []

    // Iterate all bank accounts
    for (let i = 0, length = bankAccountList.length; i < length; i++) {
      const bankAcc = bankAccountList[i]
      labelsArray.push(bankAcc.bank_account_name)
      seriesArray.push(bankAcc.account_balance)
    }

    const dataSimpleBarChart = {
      labels: labelsArray,
      series: seriesArray
    }

    const optionsSimpleBarChart = {
      distributeSeries: true,
      seriesBarDistance: 10,
      axisX: {
        showGrid: false,
        offset: 40
      },
      axisY: {
        labelInterpolationFnc: function (value, index) {
          value = formatLargeCurrencies(value)
          return value + currentCurrencyPreference
        },
        // Offset Y axis label
        offset: 70
      },
      height: '400px'
    }

    buildBarChart(dataSimpleBarChart, optionsSimpleBarChart)
  }
}(jQuery))

// Replaces the text of the chart chosen
function replaceChartChosenLabel (chosenChartText) {
  const chosenChartLabel = document.getElementsByClassName('chosenChart')
  chosenChartLabel[0].textContent = chosenChartText
}

// Introduce Chartist pie chart
function buildPieChartForOverview (dataPreferences, id, absoluteTotal, type, fetchIncome, highestWhatever, lowestWhatever, averageWhatever, yourTitle) {
  // Populate the empty data in detail
  populateDetailedOverviewForChart(dataPreferences, false, highestWhatever, lowestWhatever, averageWhatever, yourTitle)

  const chartAppendingDiv = document.getElementById('colouredRoundedLineChart')

  // Replace inner HTML with EMPTY
  while (chartAppendingDiv.firstChild) {
    chartAppendingDiv.removeChild(chartAppendingDiv.firstChild)
  }

  // Replace with empty chart message
  if (isEmpty(dataPreferences.series)) {
    chartAppendingDiv.appendChild(buildEmptyChartMessageForOverview())
    return
  }

  /*  **************** Public Preferences - Pie Chart ******************** */

  const optionsPreferences = {
    donut: true,
    donutWidth: 50,
    startAngle: 270,
    showLabel: true,
    height: '300px'
  }

  const responsiveOptions = [
    	  ['screen and (min-width: 640px)', {
      chartPadding: 40,
      labelOffset: 50,
      labelDirection: 'explode',
      labelInterpolationFnc: function (value, idx) {
        // Calculates the percentage of category total vs absolute total
        const percentage = round((dataPreferences.series[idx] / absoluteTotal * 100), 2) + '%'
        return value + ': ' + percentage
      }
    	  }],
    	  ['screen and (min-width: 1301px)', {
      labelOffset: 30,
      chartPadding: 10
    	  }],
    	  ['screen and (min-width: 992px)', {
      labelOffset: 45,
      chartPadding: 40
      	  }]

    	]

  // Reset the chart
  replaceHTML(id, '')
  $('#' + id).tooltip('dispose')

  // Append Tooltip for Doughnut chart
  if (isNotEmpty(dataPreferences)) {
    const categoryBreakdownChart = new Chartist.Pie('#' + id, dataPreferences, optionsPreferences, responsiveOptions).on('draw', function (data) {
      if (data.type === 'slice') {
        const sliceValue = data.element._node.getAttribute('ct:value')
        data.element._node.setAttribute('title', dataPreferences.labels[data.index] + ': <strong>' + formatToCurrency(Number(sliceValue)) + '</strong>')
        data.element._node.setAttribute('data-chart-tooltip', id)
        // On click listener to show all transactions
        data.element._node.onclick = function () {
          Swal.fire({
            title: dataPreferences.labels[data.index],
            html: buildTransactionsForOverview(dataPreferences.ids[data.index], type, fetchIncome),
            customClass: {
              confirmButton: 'btn btn-info'
            },
            buttonsStyling: false,
            confirmButtonText: 'Got it!'
          })
        }
      }
    }).on('created', function () {
      // Initiate Tooltip
      $('#' + id).tooltip({
        selector: '[data-chart-tooltip="' + id + '"]',
        container: '#' + id,
        html: true,
        placement: 'auto',
        delay: {
          show: 300,
          hide: 100
        }
      })
    })

    // Animate the doughnut chart
    er.startAnimationDonutChart(categoryBreakdownChart)
  }
}

// Build Transactions for overview
function buildTransactionsForOverview (label, type, fetchIncome) {
  const docFrag = document.createDocumentFragment()

  /*
     * Table Responsive
     */
  const tableResponsive = document.createElement('div')
  tableResponsive.classList = 'table-responsive'

  const tableFixed = document.createElement('div')
  tableFixed.classList = 'table table-fixed d-table'

  /*
     * Table Heading
     */
  const tableHeading = document.createElement('div')
  tableHeading.classList = 'tableHeadingDiv'

  const widthFifteen = document.createElement('div')
  widthFifteen.classList = 'w-15 d-table-cell'
  tableHeading.appendChild(widthFifteen)

  const widthSixtyFive = document.createElement('div')
  widthSixtyFive.classList = 'w-65 d-table-cell'
  tableHeading.appendChild(widthSixtyFive)

  const widthThirty = document.createElement('div')
  widthThirty.classList = 'text-right d-table-cell'
  tableHeading.appendChild(widthThirty)
  tableFixed.appendChild(tableHeading)

  const tableBody = document.createElement('div')
  tableBody.classList = 'tableBodyDiv text-left'

  switch (type) {
    case 'category':
      for (let count = 0, length = window.overviewTransactionsCache.length; count < length; count++) {
        const transaction = window.overviewTransactionsCache[count]
        const category = transaction.category
        const incomeCategory = transaction.amount > 0
        if (incomeCategory == fetchIncome && isNotEmpty(category)) {
          // Check tag matches the label
          if (isEqual(category, label)) {
            tableBody.appendChild(buildTransactionRow(transaction, type))
          }
        }
      }
      break
    case 'tag':
      for (let count = 0, length = window.overviewTransactionsCache.length; count < length; count++) {
        const transaction = window.overviewTransactionsCache[count]
        const tags = transaction.tags
        const incomeCategory = transaction.amount > 0
        if (incomeCategory == fetchIncome && isNotEmpty(tags)) {
          // Add the amount for all the tags
          for (let i = 0, len = tags.length; i < len; i++) {
            const tag = tags[i]
            // Check tag matches the label
            if (isEqual(tag, label)) {
              tableBody.appendChild(buildTransactionRow(transaction, type))
            }
          }
        }
      }
      break
    case 'account':
      for (let count = 0, length = window.overviewTransactionsCache.length; count < length; count++) {
        const transaction = window.overviewTransactionsCache[count]
        const account = transaction.account
        const incomeCategory = transaction.amount > 0
        if (incomeCategory == fetchIncome && isNotEmpty(account)) {
          // Check tag matches the label
          if (isEqual(account, label)) {
            tableBody.appendChild(buildTransactionRow(transaction, type))
          }
        }
      }
      break
  }

  /*
     * Append Table Body
     */
  tableFixed.appendChild(tableBody)
  tableResponsive.appendChild(tableFixed)
  docFrag.appendChild(tableResponsive)
  return docFrag
}

// Builds the rows for recent transactions
function buildTransactionRow (userTransaction, type) {
  // Convert date from UTC to user specific dates
  const creationDateUserRelevant = new Date(userTransaction.creation_date)
  // Category Map
  const categoryMapForUT = window.categoryMap[userTransaction.category]

  const tableRowTransaction = document.createElement('div')
  tableRowTransaction.id = 'overview-transaction' + '-' + userTransaction.transactionId
  tableRowTransaction.setAttribute('data-target', userTransaction.transactionId)
  tableRowTransaction.classList = 'recentTransactionEntry d-table-row'

  // Cell 1
  const tableCellImagesWrapper = document.createElement('div')
  tableCellImagesWrapper.classList = 'd-table-cell align-middle imageWrapperCell text-center'

  const circleWrapperDiv = document.createElement('div')
  circleWrapperDiv.classList = 'rounded-circle align-middle circleWrapperImageRT mx-auto'

  // Append a - sign if it is an expense
  if (categoryMapForUT.type == CUSTOM_DASHBOARD_CONSTANTS.expenseCategory) {
    circleWrapperDiv.appendChild(creditCardSvg())
  } else {
    circleWrapperDiv.appendChild(plusRawSvg())
  }

  tableCellImagesWrapper.appendChild(circleWrapperDiv)
  tableRowTransaction.appendChild(tableCellImagesWrapper)

  // Cell 2
  const tableCellTransactionDescription = document.createElement('div')
  tableCellTransactionDescription.classList = 'descriptionCellRT d-table-cell'

  const elementWithDescription = document.createElement('div')
  elementWithDescription.classList = 'font-weight-bold recentTransactionDescription'
  elementWithDescription.textContent = isEmpty(userTransaction.description) ? window.translationData.transactions.dynamic.card.description : userTransaction.description.length < 25 ? userTransaction.description : userTransaction.description.slice(0, 26) + '...'
  tableCellTransactionDescription.appendChild(elementWithDescription)

  const elementWithCategoryName = document.createElement('div')
  elementWithCategoryName.classList = 'font-size-70 categoryNameRT w-100'

  if (isEqual(type, 'category')) {
    for (let i = 0, length = window.allBankAccountInfoCache.length; i < length; i++) {
      const bankAcc = window.allBankAccountInfoCache[i]
      if (isEqual(bankAcc.accountId, userTransaction.account)) {
        elementWithCategoryName.textContent = (bankAcc.bank_account_name) + ' • ' + ('0' + creationDateUserRelevant.getDate()).slice(-2) + ' ' + months[creationDateUserRelevant.getMonth()].slice(0, 3) + ' ' + creationDateUserRelevant.getFullYear() + ' ' + ('0' + creationDateUserRelevant.getHours()).slice(-2) + ':' + ('0' + creationDateUserRelevant.getMinutes()).slice(-2)
      }
    }
  } else {
    elementWithCategoryName.textContent = (categoryMapForUT.name.length < 25 ? categoryMapForUT.name : (categoryMapForUT.name.slice(0, 26) + '...')) + ' • ' + ('0' + creationDateUserRelevant.getDate()).slice(-2) + ' ' + months[creationDateUserRelevant.getMonth()].slice(0, 3) + ' ' + creationDateUserRelevant.getFullYear() + ' ' + ('0' + creationDateUserRelevant.getHours()).slice(-2) + ':' + ('0' + creationDateUserRelevant.getMinutes()).slice(-2)
  }

  tableCellTransactionDescription.appendChild(elementWithCategoryName)
  tableRowTransaction.appendChild(tableCellTransactionDescription)

  // Cell 3
  const surCell = document.createElement('div')
  surCell.classList = 'd-table-cell'

  const transactionAmount = document.createElement('div')

  // Append a - sign if it is an expense
  if (categoryMap[userTransaction.category].type == CUSTOM_DASHBOARD_CONSTANTS.expenseCategory) {
    transactionAmount.classList = 'transactionAmountRT font-weight-bold text-right align-middle'
  } else {
    transactionAmount.classList = 'transactionAmountRT font-weight-bold text-right align-middle'
  }
  transactionAmount.textContent = formatToCurrency(userTransaction.amount)
  surCell.appendChild(transactionAmount)

  const accountBalDiv = document.createElement('div')
  accountBalDiv.classList = 'accBalSubAmount pl-2 font-weight-bold text-right align-middle small'
  surCell.appendChild(accountBalDiv)
  tableRowTransaction.appendChild(surCell)

  return tableRowTransaction
}

// Build Empty chart
function buildEmptyChartMessageForOverview () {
  const emptyChartMessage = document.createElement('div')
  emptyChartMessage.classList = 'text-center align-middle h-20'

  const divIconWrapper = document.createElement('div')
  divIconWrapper.classList = 'icon-center'

  const iconChart = document.createElement('i')
  iconChart.classList = 'material-icons noDataChartIcon'
  iconChart.textContent = 'multiline_chart'
  divIconWrapper.appendChild(iconChart)
  emptyChartMessage.appendChild(divIconWrapper)

  const emptyMessage = document.createElement('div')
  emptyMessage.classList = 'font-weight-bold tripleNineColor'
  emptyMessage.textContent = window.translationData.overview.dynamic.chart.nodata
  emptyChartMessage.appendChild(emptyMessage)

  return emptyChartMessage
}
