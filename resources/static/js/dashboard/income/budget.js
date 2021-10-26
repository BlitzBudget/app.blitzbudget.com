'use strict';

(function scopeWrapper ($) {
  // User Budget Map Cache
  let userBudgetCache = {}
  // Store the budget amount edited previously to compare
  let budgetAmountEditedPreviously = ''
  // store the budget chart in the cache to update later
  let budgetCategoryChart = ''
  // Category modal user budget category id;
  let budgetForModalOpened = ''
  // Choose the current month from the user chosen date
  let userChosenMonthName = window.months[chosenDate.getMonth()]

  /**
     * START loading the page
     *
     */
  if (isEqual(er.getCookie('currentPage'), 'budgetPage')) {
    if (isEqual(window.location.href, window._config.app.invokeUrl)) {
      er.refreshCookiePageExpiry('budgetPage')
      er.fetchCurrentPage('/budgets', function (data) {
        // Fetch user budget and build the div
        fetchAllUserBudget()
        populateBudgetResource()
        // Load the new HTML
        $('#mutableDashboard').html(data)
        // Translate current Page
        translatePage(getLanguage())
        // Set Current Page
        const currentPage = document.getElementById('currentPage')
        currentPage.setAttribute('data-i18n', 'budget.page.title')
        currentPage.textContent = isNotEmpty(window.translationData) ? window.translationData.budget.page.title : 'Budget'
      })
    }
  }

  const budgetPage = document.getElementById('budgetPage')
  if (isNotEmpty(budgetPage)) {
    budgetPage.addEventListener('click', function (e) {
      er.refreshCookiePageExpiry('budgetPage')
      er.fetchCurrentPage('/budgets', function (data) {
        // Fetch user budget and build the div
        fetchAllUserBudget()
        populateBudgetResource()
        // Load the new HTML
        $('#mutableDashboard').html(data)
        // Translate current Page
        translatePage(getLanguage())
        // Set Current Page
        const currentPage = document.getElementById('currentPage')
        currentPage.setAttribute('data-i18n', 'budget.page.title')
        currentPage.textContent = isNotEmpty(window.translationData) ? window.translationData.budget.page.title : 'Budget'
      })
    })
  }

  function populateBudgetResource () {
    // User Budget Map Cache
    userBudgetCache = {}
    // Store the budget amount edited previously to compare
    budgetAmountEditedPreviously = ''
    // store the budget chart in the cache to update later
    budgetCategoryChart = ''
    // Category modal user budget category id;
    budgetForModalOpened = ''

    /**
         *  Add Functionality Generic + Btn
         **/

    // Register Tooltips
    const ttinit = $('#addFncTT')
    const tttitle = isNotEmpty(window.translationData) ? window.translationData.budget.dynamic.tooltip : 'Add Budget'
    ttinit.attr('data-original-title', tttitle)
    ttinit.tooltip({
      delay: {
        show: 300,
        hide: 100
      }
    })

    // Generic Add Functionality
    const genericAddFnc = document.getElementById('genericAddFnc')
    document.getElementById('addFncTT').textContent = 'add'
    genericAddFnc.classList = 'btn btn-round btn-rose btn-just-icon bottomFixed float-right addNewBudget'
    $(genericAddFnc).unbind('click').click(function () {
      if (!this.classList.contains('addNewBudget')) {
        return
      }

      // Create a new unbudgeted category
      createUnbudgetedCat(this)
    })

    /**
         * Date Picker Module
         */

    // Date Picker On click month
    $('.monthPickerMonth').unbind('click').click(function () {
      // Month picker is current selected then do nothing
      if (this.classList.contains('monthPickerMonthSelected')) {
        return
      }

      const budgetAmountDiv = document.getElementById('budgetAmount')

      // If other pages are present then return this event
      if (budgetAmountDiv == null) {
        return
      }

      // Set chosen date
      er.setChosenDateWithSelected(this)

      // Reset the User Budget with Loader
      resetUserBudgetWithLoader()

      // Call the user budget
      fetchAllUserBudget()
    })
  }

  // Fetches all the user budget and displays them in the user budget
  function fetchAllUserBudget () {
    const budgetDivFragment = document.createDocumentFragment()

    const values = {}
    if (isNotEmpty(window.currentUser.walletId)) {
      values.walletId = window.currentUser.walletId
    } else {
      values.userId = window.currentUser.financialPortfolioId
    }
    const y = window.chosenDate.getFullYear()
    const m = window.chosenDate.getMonth()
    values.startsWithDate = new Date(y, m, 1)
    values.endsWithDate = new Date(y, m + 1, 0)

    // Ajax Requests on Error
    const ajaxData = {}
    ajaxData.isAjaxReq = true
    ajaxData.type = 'POST'
    ajaxData.url = CUSTOM_DASHBOARD_CONSTANTS.budgetAPIUrl
    ajaxData.dataType = 'json'
    ajaxData.contentType = 'application/json;charset=UTF-8'
    ajaxData.data = JSON.stringify(values)
    ajaxData.onSuccess = function (result) {
      const budgets = result.Budget
      const dates = result.Date
      const wallet = result.Wallet

      // Dates Cache
      window.datesCreated = result.Date
      populateCurrentDate(result.Date)

      fetchJSONForCategories(result.Category)

      // Replace currentCurrencySymbol with currency symbol
      replaceWithCurrency(wallet)
      er_a.populateBankInfo(result.BankAccount)

      for (let count = 0, length = budgets.length; count < length; count++) {
        const value = budgets[count]

        if (isEmpty(value)) {
          continue
        }

        // Store the values in a cache
        userBudgetCache[value.budgetId] = value

        // Appends to a document fragment
        budgetDivFragment.appendChild(buildUserBudget(value))
      }

      // paints them to the budget dashboard
      const budgetAmount = document.getElementById('budgetAmount')
      // Replace HTML with Empty
      while (budgetAmount.firstChild) {
        budgetAmount.removeChild(budgetAmount.firstChild)
      }
      budgetAmount.appendChild(budgetDivFragment)

      // Update the Budget Visualization module
      updateBudgetVisualization()
    }
    ajaxData.onFailure = function (thrownError) {
      const er = isNotEmpty(window.translationData) ? window.translationData.budget.dynamic.fetcherror : 'Unable to fetch you budget at this moment. Please try again!'
      manageErrors(thrownError, er, ajaxData)
    }

    jQuery.ajax({
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

  // Build the user budget div
  function buildUserBudget (userBudget) {
    if (isEmpty(userBudget)) {
      return
    }
    const cardWrapper = document.createDocumentFragment()

    const card = document.createElement('div')
    card.id = 'cardBudgetId-' + userBudget.budgetId
    card.classList = 'card'

    const cardBody = document.createElement('div')
    cardBody.classList = 'card-body'

    // Card Row Remaining
    const cardRowRemaining = document.createElement('div')
    cardRowRemaining.classList = 'row'

    // Card title with category name
    const cardTitle = document.createElement('div')
    cardTitle.id = 'categoryName-' + userBudget.budgetId
    cardTitle.classList = 'col-lg-6 text-left font-weight-bold'
    const categoryname = isEmpty(userBudget.categoryName) ? (isEmpty(window.categoryMap[userBudget.category]) ? userBudget.category : window.categoryMap[userBudget.category].name) : userBudget.categoryName
    cardTitle.textContent = (isNotEmpty(window.translatedCategoryName) && isNotEmpty(window.translatedCategoryName[categoryname])) ? window.translatedCategoryName[categoryname] : categoryname
    cardRowRemaining.appendChild(cardTitle)

    // <div id="budgetInfoLabelInModal" class="col-lg-12 text-right headingDiv justify-content-center align-self-center">Remaining (%)</div>
    const cardRemainingText = document.createElement('div')
    cardRemainingText.classList = 'col-lg-6 text-right headingDiv justify-content-center align-self-center mild-text'
    cardRemainingText.id = 'budgetInfoLabelInModal-' + userBudget.budgetId
    cardRemainingText.setAttribute('data-i18n', 'budget.dynamic.card.remaining')
    cardRemainingText.textContent = isNotEmpty(window.translationData) ? window.translationData.budget.dynamic.card.remaining : 'Remaining (%)'
    cardRowRemaining.appendChild(cardRemainingText)
    cardBody.appendChild(cardRowRemaining)

    // Card Row Percentage Available
    const cardRowPercentage = document.createElement('div')
    cardRowPercentage.classList = 'row'

    // Budget Amount Wrapper
    const cardAmountWrapperDiv = document.createElement('div')
    cardAmountWrapperDiv.classList = 'col-lg-3'

    // Budget Amount Div
    const cardBudgetAmountDiv = document.createElement('input')
    cardBudgetAmountDiv.id = 'budgetAmountEntered-' + userBudget.budgetId
    cardBudgetAmountDiv.classList = 'text-left budgetAmountEntered font-weight-bold form-control'
    cardBudgetAmountDiv.setAttribute('contenteditable', true)
    cardBudgetAmountDiv.setAttribute('data-target', userBudget.budgetId)
    cardBudgetAmountDiv.value = formatToCurrency(userBudget.planned)
    cardAmountWrapperDiv.appendChild(cardBudgetAmountDiv)
    cardRowPercentage.appendChild(cardAmountWrapperDiv)

    // <span id="percentageAvailable" class="col-lg-12 text-right">NA</span>
    const cardRemainingPercentage = document.createElement('div')
    cardRemainingPercentage.classList = 'col-lg-9 text-right percentageAvailable'
    cardRemainingPercentage.id = 'percentageAvailable-' + userBudget.budgetId
    cardRemainingPercentage.setAttribute('data-i18n', 'budget.dynamic.card.na')
    cardRemainingPercentage.textContent = isNotEmpty(window.translationData) ? window.translationData.budget.dynamic.card.na : 'NA'
    cardRowPercentage.appendChild(cardRemainingPercentage)
    cardBody.appendChild(cardRowPercentage)

    // Parent div for Progress Bar
    const cardProgressAndRemainingAmount = document.createElement('div')

    // Div progress bar header
    const cardProgressClass = document.createElement('div')
    cardProgressClass.classList = 'progress'

    // progress bar
    const progressBar = document.createElement('div')
    progressBar.id = 'progress-budget-' + userBudget.budgetId
    progressBar.classList = 'progress-bar progress-bar-budget-striped'
    progressBar.setAttribute('role', 'progressbar')
    progressBar.setAttribute('aria-valuenow', '0')
    progressBar.setAttribute('aria-valuemin', '0')
    progressBar.setAttribute('aria-valuemax', '100')
    cardProgressClass.appendChild(progressBar)
    cardProgressAndRemainingAmount.appendChild(cardProgressClass)

    // Remaining Amount Div
    const remainingAmountDiv = document.createElement('span')
    remainingAmountDiv.id = 'remainingAmount-' + userBudget.budgetId
    remainingAmountDiv.classList = 'mild-text-budget'

    const currencyRemainingAmount = document.createElement('span')
    currencyRemainingAmount.textContent = currentCurrencyPreference + '0.00'
    remainingAmountDiv.appendChild(currencyRemainingAmount)
    cardProgressAndRemainingAmount.appendChild(remainingAmountDiv)

    const currencyRemainingText = document.createElement('span')
    currencyRemainingText.classList = 'mild-text'
    currencyRemainingText.setAttribute('data-i18n', 'budget.dynamic.card.remain')
    currencyRemainingText.textContent = isNotEmpty(window.translationData) ? window.translationData.budget.dynamic.card.remain : 'Remaining'
    cardProgressAndRemainingAmount.appendChild(currencyRemainingText)
    cardBody.appendChild(cardProgressAndRemainingAmount)

    const actionDiv = document.createElement('div')
    actionDiv.id = 'actionIcons-' + userBudget.budgetId
    actionDiv.classList = 'text-right'

    // Build a delete icon Div
    const deleteIconDiv = document.createElement('div')
    deleteIconDiv.classList = 'svg-container deleteIconWrapper d-inline-block'
    deleteIconDiv.setAttribute('data-toggle', 'tooltip')
    deleteIconDiv.setAttribute('data-placement', 'bottom')
    deleteIconDiv.setAttribute('title', window.translationData.budget.dynamic.delete)

    // SVG for delete
    const deleteSvgElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    deleteSvgElement.id = 'deleteSvgElement-' + userBudget.budgetId
    deleteSvgElement.classList = 'deleteBudget'
    deleteSvgElement.setAttribute('data-target', userBudget.budgetId)
    deleteSvgElement.setAttribute('height', '16')
    deleteSvgElement.setAttribute('width', '16')
    deleteSvgElement.setAttribute('viewBox', '0 0 14 18')

    // Changing stroke to currentColor, Wraps the color of the path to its parent div
    const deletePathElement = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    deletePathElement.setAttribute('fill', 'none')
    deletePathElement.setAttribute('stroke', 'currentColor')
    deletePathElement.setAttribute('stroke-width', '1.25')
    deletePathElement.setAttribute('stroke-linecap', 'square')
    deletePathElement.setAttribute('d', 'M4.273 3.727V2a1 1 0 0 1 1-1h3.454a1 1 0 0 1 1 1v1.727M13 5.91v10.455a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V5.909m6 2.727v5.455M4.273 8.636v5.455m5.454-5.455v5.455M13 3.727H1')
    deleteSvgElement.appendChild(deletePathElement)
    deleteIconDiv.appendChild(deleteSvgElement)

    const materialSpinnerElement = document.createElement('div')
    materialSpinnerElement.id = 'deleteElementSpinner-' + userBudget.budgetId
    materialSpinnerElement.classList = 'material-spinner-small d-none'
    deleteIconDiv.appendChild(materialSpinnerElement)

    actionDiv.appendChild(deleteIconDiv)
    cardBody.appendChild(actionDiv)

    card.appendChild(cardBody)
    cardWrapper.appendChild(card)
    // Handle the update of the progress bar modal
    updateProgressBarAndRemaining(userBudget, cardWrapper)
    return cardWrapper
  }

  // Update the budget visualization module
  function updateBudgetVisualization () {
    let categoryLength = 0
    for (const key in window.categoryMap) {
      const values = window.categoryMap[key]
      if (isEqual(values.type, CUSTOM_DASHBOARD_CONSTANTS.expenseCategory)) {
        categoryLength++
      }
    }

    const userBudgetCacheKeys = Object.keys(userBudgetCache)

    // Append an empty chart when there is no budget
    let dataPreferences = {}

    const totalBudgetedCategoriesDiv = document.getElementById('totalBudgetedCategories')
    const toBeBudgetedDiv = document.getElementById('toBeBudgeted')
    let detachChart = false
    if (isNotEmpty(userBudgetCacheKeys)) {
      animateValue(totalBudgetedCategoriesDiv, 0, userBudgetCacheKeys.length, '', 1000)
      // If empty then update the chart with the 0
      toBeBudgetedDiv.textContent = 0

      const totalCategoriesAvailable = categoryLength
      const toBeBudgetedAvailable = totalCategoriesAvailable - userBudgetCacheKeys.length

      // assign the to be budgeted
      animateValue(toBeBudgetedDiv, 0, toBeBudgetedAvailable, '', 1000)

      const userBudgetPercentage = round(((userBudgetCacheKeys.length / totalCategoriesAvailable) * 100), 1)
      const toBeBudgetedPercentage = round(((toBeBudgetedAvailable / totalCategoriesAvailable) * 100), 1)
      // labels: [Total Budgeted Category, To Be Budgeted]
      dataPreferences = {
        labels: [userBudgetPercentage + '%', toBeBudgetedPercentage + '%'],
        series: [userBudgetCacheKeys.length, toBeBudgetedAvailable]
      }
    } else {
      // If empty then update the chart with the 0
      toBeBudgetedDiv.textContent = 0
      totalBudgetedCategoriesDiv.textContent = 0
      detachChart = true

      // assign the to be budgeted for budget visualization chart
      toBeBudgetedDiv.textContent = categoryLength

      // Create a document fragment to append
      const emptyBudgetDocumentFragment = document.createDocumentFragment()
      emptyBudgetDocumentFragment.appendChild(createCopyFromPreviousMonthModal())

      // Replace the HTML of the empty modal
      const budgetAmountDiv = document.getElementById('budgetAmount')
      // Replace the HTML to empty and then append child
      while (budgetAmountDiv.firstChild) {
        budgetAmountDiv.removeChild(budgetAmountDiv.firstChild)
      }
      budgetAmountDiv.appendChild(emptyBudgetDocumentFragment)
    }

    if (detachChart) {
      // Remove the donut chart from the DOM
      const chartDonutSVG = document.getElementsByClassName('ct-chart-donut')

      if (chartDonutSVG.length > 0) {
        chartDonutSVG[0].parentNode.removeChild(chartDonutSVG[0])
        // Detach the chart
        budgetCategoryChart.detach()
      } else {
        const chartNode = document.getElementById('chartBudgetVisualization')
        while (chartNode.firstChild) {
          chartNode.removeChild(chartNode.lastElementChild)
        }
      }
    } else if (isNotEmpty(budgetCategoryChart)) {
      budgetCategoryChart.update(dataPreferences)
    } else {
      buildPieChart(dataPreferences, 'chartBudgetVisualization')
    }
  }

  // Introduce Chartist pie chart
  function buildPieChart (dataPreferences, id) {
    /*  **************** Public Preferences - Pie Chart ******************** */
    const ttbudget = isNotEmpty(window.translationData) ? window.translationData.budget.dynamic.chart.totalbudget : 'Total Budgeted'
    const tbbudget = isNotEmpty(window.translationData) ? window.translationData.budget.dynamic.chart.tobebudgeted : 'To Be Budgeted'
    const labels = [ttbudget, tbbudget]

    const optionsPreferences = {
      donut: true,
      donutWidth: 50,
      startAngle: 270,
      showLabel: true,
      height: '230px'
    }

    // Reset the chart
    replaceHTML(id, '')
    // Dispose the previous tooltips created
    $('#' + id).tooltip('dispose')

    if (isNotEmpty(dataPreferences)) {
      // Build chart and Add tooltip for the doughnut chart
      budgetCategoryChart = new Chartist.Pie('#' + id, dataPreferences, optionsPreferences).on('draw', function (data) {
        if (data.type === 'slice') {
          const sliceValue = data.element._node.getAttribute('ct:value')
          data.element._node.setAttribute('title', labels[data.index] + ': <strong>' + sliceValue + '</strong>')
          data.element._node.setAttribute('data-chart-tooltip', id)
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
      er.startAnimationDonutChart(budgetCategoryChart)
    }
  }

  // Catch the amount when the user focuses on the budget
  $('body').on('focusin', '.budgetAmountEntered', function () {
    budgetAmountEditedPreviously = trimElement(this.textContent)
  })

  // Catch the amount when the user focuses on the budget
  $('body').on('focusout', '.budgetAmountEntered', function () {
    postNewBudgetAmount(this)
  })

  // Amount - disable enter key and submit request
  $('body').on('keyup', '.budgetAmountEntered', function (e) {
    const keyCode = e.keyCode || e.which
    if (keyCode === 13) {
      e.preventDefault()

      document.activeElement.blur()
      return false
    }
  })

  // Post the newly entered budget amount and convert the auto generation to false
  function postNewBudgetAmount (element) {
    // If the text is not changed then do nothing (Remove currency locale and minus sign, remove currency formatting and take only the number and convert it into decimals) and round to 2 decimal places
    let enteredText = er.convertToNumberFromCurrency(element.value, currentCurrencyPreference)
    let previousText = er.convertToNumberFromCurrency(budgetAmountEditedPreviously, currentCurrencyPreference)

    // Test if the entered value is valid
    if (isNaN(enteredText) || !regexForFloat.test(enteredText) || enteredText == 0) {
      // Replace the entered text with 0 inorder for the code to progress.
      enteredText = 0
    } else if (enteredText < 0) {
      // Replace negative sign to positive sign if entered by the user
      enteredText = Math.abs(enteredText)
    }

    // Test if the previous value is valid
    if (isNaN(previousText) || !regexForFloat.test(previousText) || previousText == 0) {
      previousText = 0
    }

    if (previousText != enteredText) {
      // Fetch the id
      const budgetId = element.getAttribute('data-target')

      // Post a new budget to the user budget module and change to auto generated as false.
      const values = {}
      values.planned = enteredText
      values.budgetId = budgetId
      values.walletId = currentUser.walletId

      // Ajax Requests on Error
      const ajaxData = {}
      ajaxData.isAjaxReq = true
      ajaxData.type = 'PATCH'
      ajaxData.url = CUSTOM_DASHBOARD_CONSTANTS.budgetAPIUrl
      ajaxData.dataType = 'json'
      ajaxData.contentType = 'application/json;charset=UTF-8'
      ajaxData.data = JSON.stringify(values)
      ajaxData.onSuccess = function registerSuccess (result) {
        const userBudget = result['body-json']
        // on success then replace the entered text
        element.value = formatToCurrency(enteredText)
        // Update the budget cache
        userBudgetCache[userBudget.budgetId].planned = userBudget.planned
        // Update the modal
        updateProgressBarAndRemaining(userBudgetCache[userBudget.budgetId], document)
      }
      ajaxData.onFailure = function (thrownError) {
        manageErrors(thrownError, window.translationData.budget.dynamic.changeerror, ajaxData)

        // update the current element with the previous amount
        const formattedBudgetAmount = formatToCurrency(previousText)
        element.value = formattedBudgetAmount
      }
      $.ajax({
        type: ajaxData.type,
        url: ajaxData.url,
        beforeSend: function (xhr) {
          xhr.setRequestHeader('Authorization', authHeader)
        },
        dataType: ajaxData.dataType,
        contentType: ajaxData.contentType,
        data: ajaxData.data,
        success: ajaxData.onSuccess,
        error: ajaxData.onFailure
      })
    } else {
      // previous text and entered text is the same then simy replace the text
      element.value = formatToCurrency(enteredText)
    }
  }

  // Use user budget to update information in the modal
  function updateProgressBarAndRemaining (budget, documentOrFragment) {
    const categoryTotalAmount = budget.used

    const userBudgetValue = budget.planned
    const budgetIdKey = budget.budgetId

    const remainingAmountDiv = documentOrFragment.getElementById('remainingAmount-' + budgetIdKey)
    const remainingAmountPercentageDiv = documentOrFragment.getElementById('percentageAvailable-' + budgetIdKey)
    const budgetLabelDiv = documentOrFragment.getElementById('budgetInfoLabelInModal-' + budgetIdKey)
    const progressBarCategoryModal = documentOrFragment.getElementById('progress-budget-' + budgetIdKey)
    // If the budget is not created for the particular category, make sure the budget is not equal to zero
    if (isNotEmpty(userBudgetValue) && isNotEmpty(categoryTotalAmount)) {
      // Calculate remaining budget
      let budgetAvailableToSpendOrSave = userBudgetValue - Math.abs(categoryTotalAmount)

      // Calculate the minus sign and appropriate class for the remaining amount
      if (budgetAvailableToSpendOrSave < 0) {
        // if the transaction category is expense category then show overspent else show To be budgeted
        if (categoryMap[budget.category].type == CUSTOM_DASHBOARD_CONSTANTS.expenseCategory) {
          budgetLabelDiv.setAttribute('data-i18n', 'budget.dynamic.card.overspent')
          budgetLabelDiv.textContent = isNotEmpty(window.translationData) ? window.translationData.budget.dynamic.card.overspent : 'Overspent (%)'
        } else if (categoryMap[budget.category].type == CUSTOM_DASHBOARD_CONSTANTS.incomeCategory) {
          budgetLabelDiv.setAttribute('data-i18n', 'budget.dynamic.card.tobebudgeted')
          budgetLabelDiv.textContent = isNotEmpty(window.translationData) ? window.translationData.budget.dynamic.card.tobebudgeted : 'To Be Budgeted (%)'
        }
      } else {
        budgetLabelDiv.setAttribute('data-i18n', 'budget.dynamic.card.remaining')
        budgetLabelDiv.textContent = isNotEmpty(window.translationData) ? window.translationData.budget.dynamic.card.remaining : 'Remaining (%)'
      }

      // Change the remaining text appropriately
      budgetAvailableToSpendOrSave = isNaN(budgetAvailableToSpendOrSave) ? 0 : budgetAvailableToSpendOrSave
      remainingAmountDiv.textContent = formatToCurrency(budgetAvailableToSpendOrSave)

      // Calculate percentage available to spend or save
      const remainingAmountPercentage = round(((budgetAvailableToSpendOrSave / userBudgetValue) * 100), 0)
      // If the user budget is 0 then the percentage calculation is not applicable
      if (userBudgetValue == 0 || isNaN(remainingAmountPercentage)) {
        remainingAmountPercentageDiv.setAttribute('data-i18n', 'budget.dynamic.card.na')
        remainingAmountPercentageDiv.textContent = isNotEmpty(window.translationData) ? window.translationData.budget.dynamic.card.na : 'NA'
      } else {
        remainingAmountPercentageDiv.textContent = remainingAmountPercentage + '%'
      }

      // Assign progress bar value. If the category amount is higher then the progress is 100%
      const progressBarPercentage = isNaN(remainingAmountPercentage) ? 0 : (categoryTotalAmount > userBudgetValue) ? 100 : (100 - remainingAmountPercentage)
      // Set the value and percentage of the progress bar
      progressBarCategoryModal.setAttribute('aria-valuenow', progressBarPercentage)
      progressBarCategoryModal.style.width = progressBarPercentage + '%'
    } else if (progressBarCategoryModal != null) {
      remainingAmountPercentageDiv.setAttribute('data-i18n', 'budget.dynamic.card.na')
      remainingAmountPercentageDiv.textContent = isNotEmpty(window.translationData) ? window.translationData.budget.dynamic.card.na : 'NA'
      // Set the value and percentage of the progress bar
      progressBarCategoryModal.setAttribute('aria-valuenow', 0)
      progressBarCategoryModal.style.width = 0 + '%'
      // Set the amount remaining
      remainingAmountDiv.textContent = formatToCurrency(0.00)
      // Set the budget remaining text
      budgetLabelDiv.setAttribute('data-i18n', 'budget.dynamic.card.remaining')
      budgetLabelDiv.textContent = isNotEmpty(window.translationData) ? window.translationData.budget.dynamic.card.remaining : 'Remaining (%)'
    }
  }

  // Add click event listener to delete the budget
  $('body').on('click', '.deleteBudget', function (e) {
    const deleteButtonElement = this
    const budgetId = this.getAttribute('data-target')

    // Show the material spinner and hide the delete button
    document.getElementById('deleteElementSpinner-' + budgetId).classList.toggle('d-none')
    this.classList.toggle('d-none')

    // Security check to ensure that the budget is present
    if (isEmpty(userBudgetCache[budgetId])) {
      showNotification(window.translationData.budget.dynamic.card.deleteerror, window._constants.notification.error)
      return
    }

    const values = {}
    values.walletId = window.currentUser.walletId
    values.itemId = budgetId

    // Ajax Requests on Error
    const ajaxData = {}
    ajaxData.isAjaxReq = true
    ajaxData.type = 'POST'
    ajaxData.url = window._config.api.invokeUrl + window._config.api.deleteItem
    ajaxData.dataType = 'json'
    ajaxData.contentType = 'application/json;charset=UTF-8'
    ajaxData.data = JSON.stringify(values)
    ajaxData.onSuccess = function (result) {
      // Remove the budget modal
      const budgetDiv = document.getElementById('cardBudgetId-' + budgetId)
      $(budgetDiv).fadeOut('slow', function () {
        this.remove()
      })

      // Delete the entry from the map if it is pending to be updated
      delete userBudgetCache[budgetId]

      // Update budget visualization chart after deletion
      updateBudgetVisualization()
    }
    ajaxData.onFailure = function (thrownError) {
      manageErrors(thrownError, window.translationData.budget.dynamic.card.deleteerror, ajaxData)

      // Remove the material spinner and show the delete button again
      document.getElementById('deleteElementSpinner-' + budgetId).classList.toggle('d-none')
      deleteButtonElement.classList.toggle('d-none')
    }
    // Request to delete the user budget
    $.ajax({
      type: ajaxData.type,
      url: ajaxData.url,
      beforeSend: function (xhr) {
        xhr.setRequestHeader('Authorization', authHeader)
      },
      dataType: ajaxData.dataType,
      contentType: ajaxData.contentType,
      data: ajaxData.data,
      success: ajaxData.onSuccess,
      error: ajaxData.onFailure
    })
  })

  // Copy all budget from previous modal if budget is empty
  function createCopyFromPreviousMonthModal () {
    // User chosen month
    userChosenMonthName = window.months[chosenDate.getMonth()]

    const card = document.createElement('div')
    card.id = 'emptyBudgetCard'
    card.classList = 'card text-center'

    const cardBody = document.createElement('div')
    cardBody.classList = 'card-body'

    const imgDiv = document.createElement('div')
    imgDiv.classList = 'position-relative'

    const imgTransfer = document.createElement('img')
    imgTransfer.id = 'budgetImage'
    imgTransfer.src = '../img/dashboard/budget/icons8-documents-100.png'
    imgDiv.appendChild(imgTransfer)

    const monthSpan = document.createElement('span')
    monthSpan.classList = 'previousMonth'
    imgDiv.appendChild(monthSpan)

    const monthSpanCurrent = document.createElement('span')
    monthSpanCurrent.classList = 'currentMonth'
    monthSpanCurrent.textContent = userChosenMonthName.slice(0, 3)
    imgDiv.appendChild(monthSpanCurrent)
    cardBody.appendChild(imgDiv)

    // Card Row Heading
    const cardRowHeading = document.createElement('div')
    cardRowHeading.id = 'emptyBudgetHeading'
    cardRowHeading.classList = 'row font-weight-bold justify-content-center'
    cardRowHeading.setAttribute('data-i18n', 'budget.dynamic.card.empty.hey')
    cardRowHeading.textContent = isNotEmpty(window.translationData) ? window.translationData.budget.dynamic.card.empty.hey + userChosenMonthName + '.' : 'Hey, Looks like you need a budget for ' + userChosenMonthName + '.'
    cardBody.appendChild(cardRowHeading)

    // card description
    const cardRowDescription = document.createElement('div')
    cardRowDescription.id = 'emptyBudgetDescription'
    cardRowDescription.classList = 'row justify-content-center'
    cardBody.appendChild(cardRowDescription)

    // card button clone
    const clonePreviousMonthButton = document.createElement('button')
    clonePreviousMonthButton.id = 'copyPreviousMonthsBudget'
    clonePreviousMonthButton.classList = 'btn btn-budget'
    clonePreviousMonthButton.setAttribute('data-i18n', 'budget.dynamic.card.empty.plan')
    clonePreviousMonthButton.textContent = isNotEmpty(window.translationData) ? window.translationData.budget.dynamic.card.empty.plan + userChosenMonthName : 'Start Planning For ' + userChosenMonthName
    cardBody.appendChild(clonePreviousMonthButton)

    card.appendChild(cardBody)

    return card
  }

  // Clicking on copy budget
  $('body').on('click', '#copyPreviousMonthsBudget', function (e) {
    this.setAttribute('disabled', 'disabled')
    this.setAttribute('data-i18n', 'budget.dynamic.card.empty.create')
    this.textContent = isNotEmpty(window.translationData) ? window.translationData.budget.dynamic.card.empty.create : 'Creating budgets..'
    const element = this
    const budgetAmount = document.getElementById('budgetAmount')

    // Enable the Add button
    const genericAddFnc = document.getElementById('genericAddFnc')
    genericAddFnc.classList.add('d-none')

    // Appends to a document fragment
    createAnEmptyBudget(window.defaultCategories[0], budgetAmount)
    createAnEmptyBudget(window.defaultCategories[1], budgetAmount)
  })

  // Create two empty budgets on click Start Planning for .. button
  function createAnEmptyBudget (categoryId, budgetAmountDiv) {
    const values = {}

    if (isEmpty(categoryId.name)) {
      values.category = categoryId
    } else {
      values.category = categoryId.name
      values.categoryType = categoryId.type
    }

    values.planned = 0
    values.dateMeantFor = window.currentDateAsID
    values.walletId = currentUser.walletId

    // Ajax Requests on Error
    const ajaxData = {}
    ajaxData.isAjaxReq = true
    ajaxData.type = 'PUT'
    ajaxData.url = CUSTOM_DASHBOARD_CONSTANTS.budgetAPIUrl
    ajaxData.dataType = 'json'
    ajaxData.contentType = 'application/json;charset=UTF-8'
    ajaxData.data = JSON.stringify(values)
    ajaxData.onSuccess = function (result) {
      // Filter the body
      const userBudget = result['body-json']
      // Set Current Date as ID (For First time)
      window.currentDateAsID = userBudget.dateMeantFor
      // Assign Category Id
      assignCategoryId(userBudget)
      // Handle hide and unhide categories
      handleHideAndUnhideCategories()
      // Populate CurrentDateAsId if necessary
      if (notIncludesStr(window.currentDateAsID, 'Date#')) {
        window.currentDateAsID = userBudget.dateMeantFor
      }
      // Build the new budget
      const budgetDivFragment = document.createDocumentFragment()
      budgetDivFragment.appendChild(buildUserBudget(userBudget))
      // Store the values in a cache
      userBudgetCache[userBudget.budgetId] = userBudget
      // Enable the Add button
      const genericAddFnc = document.getElementById('genericAddFnc')
      genericAddFnc.classList.remove('d-none')
      // Remove all category with name
      const categoryNameDiv = budgetDivFragment.getElementById('categoryName-' + userBudget.budgetId)
      // Replace HTML with Empty
      while (categoryNameDiv.firstChild) {
        categoryNameDiv.removeChild(categoryNameDiv.firstChild)
      }

      // Container for inlining the select form
      const containerForSelect = document.createElement('div')
      containerForSelect.setAttribute('id', 'selectCategoryRow-' + userBudget.budgetId)
      containerForSelect.className = 'btn-group btnGroup-1'
      containerForSelect.setAttribute('aria-haspopup', true)
      containerForSelect.setAttribute('aria-expanded', false)

      const displayCategory = document.createElement('div')
      displayCategory.classList = 'w-md-15 w-8 dd-display-wrapper'
      displayCategory.disabled = true
      displayCategory.textContent = isEmpty(userBudget.categoryName) ? (isEmpty(window.categoryMap[userBudget.category]) ? userBudget.category : window.categoryMap[userBudget.category].name) : userBudget.categoryName
      containerForSelect.appendChild(displayCategory)

      const dropdownArrow = document.createElement('div')
      dropdownArrow.classList = 'dropdown-toggle dropdown-toggle-split'
      dropdownArrow.setAttribute('data-toggle', 'dropdown')
      dropdownArrow.setAttribute('aria-haspopup', 'true')
      dropdownArrow.setAttribute('aria-expanded', 'false')

      const srOnly = document.createElement('span')
      srOnly.classList = 'sr-only'
      srOnly.textContent = 'Toggle Dropdown'
      dropdownArrow.appendChild(srOnly)
      containerForSelect.appendChild(dropdownArrow)

      const dropdownMenu = document.createElement('div')
      dropdownMenu.classList = 'dropdown-menu'

      const inputGroup = document.createElement('div')
      inputGroup.classList = 'input-group'

      const incomeCategoriesHSix = document.createElement('h6')
      incomeCategoriesHSix.classList = 'dropdown-header'
      incomeCategoriesHSix.setAttribute('data-i18n', 'budget.dynamic.income')
      incomeCategoriesHSix.textContent = isNotEmpty(window.translationData) ? window.translationData.budget.dynamic.income : 'Income'
      inputGroup.appendChild(incomeCategoriesHSix)

      const incomeCategories = document.createElement('div')
      incomeCategories.classList = 'incomeCategories'
      incomeCategories.setAttribute('data-target', userBudget.budgetId)
      incomeDropdownItems = cloneElementAndAppend(incomeCategories, incomeDropdownItems)
      hideAllBudgetedCategories(incomeCategories)
      inputGroup.appendChild(incomeCategories)

      const dividerDD = document.createElement('div')
      dividerDD.classList = 'dropdown-divider'
      inputGroup.appendChild(dividerDD)

      const expenseCategoriesHSix = document.createElement('h6')
      expenseCategoriesHSix.classList = 'dropdown-header'
      expenseCategoriesHSix.setAttribute('data-i18n', 'budget.dynamic.expense')
      expenseCategoriesHSix.textContent = isNotEmpty(window.translationData) ? window.translationData.budget.dynamic.expense : 'Expense'
      inputGroup.appendChild(expenseCategoriesHSix)

      const expenseCategories = document.createElement('div')
      expenseCategories.classList = 'expenseCategories'
      expenseCategories.setAttribute('data-target', userBudget.budgetId)
      expenseDropdownItems = cloneElementAndAppend(expenseCategories, expenseDropdownItems)
      hideAllBudgetedCategories(expenseCategories)
      inputGroup.appendChild(expenseCategories)
      dropdownMenu.appendChild(inputGroup)

      containerForSelect.appendChild(dropdownMenu)
      categoryNameDiv.appendChild(containerForSelect)

      // Handle the update of the progress bar modal
      updateProgressBarAndRemaining(userBudget, budgetDivFragment)

      // paints them to the budget dashboard if the empty budget div is not null
      if (document.getElementById('emptyBudgetCard') !== null) {
        // Empty the div
        while (budgetAmount.firstChild) {
          budgetAmount.removeChild(budgetAmount.firstChild)
        }
        budgetAmountDiv.appendChild(budgetDivFragment)
      } else if (budgetAmountDiv.childNodes[0] != null) {
        budgetAmountDiv.insertBefore(budgetDivFragment, budgetAmountDiv.childNodes[0])
      } else {
        budgetAmountDiv.appendChild(budgetDivFragment)
      }

      // Update the Budget Visualization module
      updateBudgetVisualization()
    }
    ajaxData.onFailure = function (thrownError) {
      // Enable the Add button
      const genericAddFnc = document.getElementById('genericAddFnc')
      genericAddFnc.classList.remove('d-none')

      manageErrors(thrownError, window.translationData.budget.dynamic.unableerror, ajaxData)
    }

    $.ajax({
      type: ajaxData.type,
      url: ajaxData.url,
      beforeSend: function (xhr) {
        xhr.setRequestHeader('Authorization', authHeader)
      },
      dataType: ajaxData.dataType,
      contentType: ajaxData.contentType,
      data: ajaxData.data,
      success: ajaxData.onSuccess,
      error: ajaxData.onFailure
    })
  }

  /*
     * Hides all budgeted categories and unhides all unbudgeted
     */
  function hideAllBudgetedCategories (element) {
    const allBudgetedCategories = {}
    // Get all the budgeted categories
    const budgetKeySet = Object.keys(userBudgetCache)
    for (let count = 0, length = budgetKeySet.length; count < length; count++) {
      const key = budgetKeySet[count]
      const budgetObject = userBudgetCache[key]
      // Push the budgeted category to cache
      if (isNotEmpty(budgetObject)) {
        allBudgetedCategories[budgetObject.category] = budgetObject
      }
    }

    const children = element.children
    for (let i = 0, len = children.length; i < len; i++) {
      const childElement = children[i]
      if (isNotEmpty(userBudgetCache[childElement.lastElementChild.value])) {
        childElement.classList.add('d-none')
      } else {
        childElement.classList.remove('d-none')
      }
    }
  }

  function handleHideAndUnhideCategories () {
    const incomeCategories = document.getElementsByClassName('incomeCategories')
    for (let i = 0, len = incomeCategories.length; i < len; i++) {
      hideAllBudgetedCategories(incomeCategories[i])
    }
    const expenseCategories = document.getElementsByClassName('expenseCategories')
    for (let i = 0, len = expenseCategories.length; i < len; i++) {
      hideAllBudgetedCategories(expenseCategories[i])
    }
  }

  // Change trigger on select
  $('body').on('click', '#budgetAmount .dropdown-item', function (event) {
    const currentElement = this
    const categoryId = this.lastElementChild.value
    const budgetId = this.parentNode.getAttribute('data-target')

    // Make sure that the category selected is not budgeted
    const allUnbudgetedCategories = returnUnbudgetedCategories()
    if (notIncludesStr(allUnbudgetedCategories, this.lastElementChild.value)) {
      showNotification(window.translationData.budget.dynamic.alreadyerror, window._constants.notification.error)
      return
    }

    // Call the change of category services
    const values = {}
    values.budgetId = budgetId
    values.walletId = window.currentUser.walletId
    values.dateMeantFor = window.currentDateAsID
    values.category = categoryId
    const categoryItem = window.categoryMap[categoryId]
    const oldCategoryName = document.getElementById('selectCategoryRow-' + budgetId).firstChild.textContent
    if (isEmpty(categoryItem.id)) {
      values.categoryType = categoryItem.type
      values.dateMeantFor = window.currentDateAsID
      document.getElementById('selectCategoryRow-' + budgetId).firstChild.textContent = categoryId
    } else {
      document.getElementById('selectCategoryRow-' + budgetId).firstChild.textContent = window.categoryMap[categoryId].name
    }

    // Ajax Requests on Error
    const ajaxData = {}
    ajaxData.isAjaxReq = true
    ajaxData.type = 'PATCH'
    ajaxData.url = CUSTOM_DASHBOARD_CONSTANTS.budgetAPIUrl
    ajaxData.dataType = 'json'
    ajaxData.contentType = 'application/json;charset=UTF-8'
    ajaxData.data = JSON.stringify(values)
    ajaxData.onSuccess = function (result) {
      const userBudget = result['body-json']
      // Assign new category to the user budget cache
      userBudgetCache[userBudget.budgetId].category = userBudget.category
      // Category Item
      if (isEmpty(categoryItem.id)) {
        assignCategoryId(userBudget)
        // Change the drop down
        currentElement.lastElementChild.value = userBudget.category
        // Handle hide and unhide categories
        handleHideAndUnhideCategories()
      }

      // Handle the update of the progress bar modal
      updateProgressBarAndRemaining(userBudgetCache, document)
    }
    ajaxData.onFailure = function (thrownError) {
      manageErrors(thrownError, window.translationData.budget.dynamic.changeerror, ajaxData)
      // Chacnge the button text to the old one if fails.
      document.getElementById('selectCategoryRow-' + budgetId).firstChild.textContent = oldCategoryName
    }

    $.ajax({
      type: ajaxData.type,
      url: ajaxData.url,
      beforeSend: function (xhr) {
        xhr.setRequestHeader('Authorization', authHeader)
      },
      dataType: ajaxData.dataType,
      contentType: ajaxData.contentType,
      data: ajaxData.data,
      success: ajaxData.onSuccess,
      error: ajaxData.onFailure
    })
  })

  // Create a new unbudgeted category
  function createUnbudgetedCat (event) {
    const categoryItem = returnUnbudgetedCategory()

    if (isEmpty(categoryItem)) {
      showNotification(window.translationData.budget.dynamic.allcategorieserror, window._constants.notification.error)
      return
    }
    // Disable the add button
    event.classList.add('d-none')

    const budgetAmountDiv = document.getElementById('budgetAmount')
    createAnEmptyBudget(categoryItem, budgetAmountDiv)
  }

  // Find the unbudgeted category
  function returnUnbudgetedCategory () {
    let categoryItem = ''

    // Iterate through all the available categories
    if (isEmpty(userBudgetCache)) {
      categoryItem = window.defaultCategories[0]
    } else {
      const allBudgetedCategories = {}
      // Get all the budgeted categories
      const budgetKeySet = Object.keys(userBudgetCache)
      for (let count = 0, length = budgetKeySet.length; count < length; count++) {
        const key = budgetKeySet[count]
        const budgetObject = userBudgetCache[key]
        // Push the budgeted category to cache
        if (isNotEmpty(budgetObject)) {
          allBudgetedCategories[budgetObject.category] = budgetObject
        }
      }

      const dataKeySet = Object.keys(categoryMap)
      for (let count = 0, length = dataKeySet.length; count < length; count++) {
        const key = dataKeySet[count]
        const categoryObj = categoryMap[key]

        // If a category that is not contained in the budget cache is found then assign and leave for loop
        if ((isEmpty(categoryObj) ||
                        isEmpty(categoryObj.id) ||
                        isEmpty(allBudgetedCategories[categoryObj.id])) && isEqual(categoryObj.type, CUSTOM_DASHBOARD_CONSTANTS.expenseCategory)) {
          categoryItem = categoryObj
          break
        }
      }
    }

    return categoryItem
  }

  // Find the unbudgeted categories
  function returnUnbudgetedCategories () {
    const categoryArray = []

    // Iterate through all the available categories
    if (isEmpty(userBudgetCache)) {
      // iterate through all available categories and
      const dataKeySet = Object.keys(categoryMap)
      for (let count = 0, length = dataKeySet.length; count < length; count++) {
        const key = dataKeySet[count]
        const categoryObject = categoryMap[key]
        categoryArray.push(categoryObject)
      }
    } else {
      const allBudgetedCategories = {}
      // Get all the budgeted categories
      const budgetKeySet = Object.keys(userBudgetCache)
      for (let count = 0, length = budgetKeySet.length; count < length; count++) {
        const key = budgetKeySet[count]
        const budgetObject = userBudgetCache[key]
        // Push the budgeted category to cache
        if (isNotEmpty(budgetObject)) {
          allBudgetedCategories[budgetObject.category] = budgetObject
        }
      }

      // Iterate through all the available categories and find the ones that does not have a budget yet
      const dataKeySet = Object.keys(categoryMap)
      for (let count = 0, length = dataKeySet.length; count < length; count++) {
        const key = dataKeySet[count]
        const categoryObj = categoryMap[key]

        // If a category that is not contained in the budget cache is found then assign and leave for loop
        if (isEmpty(categoryObj) ||
                    isEmpty(categoryObj.id) ||
                    isEmpty(allBudgetedCategories[categoryObj.id])) {
          // Update category Id where ever possible, else update it with category name
          if (isNotEmpty(categoryObj.id)) {
            categoryArray.push(categoryObj.id)
          } else {
            categoryArray.push(categoryObj.name)
          }
        }
      }
    }

    return categoryArray
  }

  // Reset the user budget with loader
  function resetUserBudgetWithLoader () {
    // User Budget Map Cache
    userBudgetCache = {}
    // Store the budget amount edited previously to compare
    budgetAmountEditedPreviously = ''
    // store the budget chart in the cache to update later
    budgetCategoryChart = ''
    // Category modal user budget category id;
    budgetForModalOpened = ''

    // Append Empty Budget Loader
    const emptyDocumentFragment = document.createDocumentFragment()

    const cardDiv = document.createElement('div')
    cardDiv.classList = 'card'

    const cardBody = document.createElement('div')
    cardBody.classList = 'card-body'

    // Row 1
    const animationBudgetRowDiv = document.createElement('div')
    animationBudgetRowDiv.classList = 'row'

    const threePortionDiv = document.createElement('div')
    threePortionDiv.classList = 'col-lg-3'

    const animationBudget = document.createElement('div')
    animationBudget.classList = 'w-100 animationBudget'
    threePortionDiv.appendChild(animationBudget)
    animationBudgetRowDiv.appendChild(threePortionDiv)

    const remainingTextDiv = document.createElement('div')
    remainingTextDiv.classList = 'col-lg-9 text-right headingDiv justify-content-center align-self-center mild-text'
    remainingTextDiv.setAttribute('data-i18n', 'budget.dynamic.card.remaining')
    remainingTextDiv.textContent = isNotEmpty(window.translationData) ? window.translationData.budget.dynamic.card.remaining : 'Remaining (%)'
    animationBudgetRowDiv.appendChild(remainingTextDiv)
    cardBody.appendChild(animationBudgetRowDiv)

    // Row 2
    const emptyRowTwo = document.createElement('div')
    emptyRowTwo.classList = 'row'

    const threePortionTwo = document.createElement('div')
    threePortionTwo.classList = 'col-lg-3'

    const animationBudgetTwo = document.createElement('div')
    animationBudgetTwo.classList = 'w-50 animationBudget'
    threePortionTwo.appendChild(animationBudgetTwo)
    emptyRowTwo.appendChild(threePortionTwo)

    const percentageAvailable = document.createElement('div')
    percentageAvailable.classList = 'col-lg-9 text-right percentageAvailable'
    emptyRowTwo.appendChild(percentageAvailable)
    cardBody.appendChild(emptyRowTwo)

    // Row 3
    const emptyRowThree = document.createElement('div')
    emptyRowThree.classList = 'row'

    const twelveColumnRow = document.createElement('div')
    twelveColumnRow.classList = 'col-lg-12'

    const progressThree = document.createElement('div')
    progressThree.classList = 'progress'

    const animationProgressThree = document.createElement('div')
    animationProgressThree.id = 'animationProgressBar'
    animationProgressThree.classList = 'progress-bar progress-bar-budget-striped'
    animationProgressThree.setAttribute('role', 'progressbar')
    animationProgressThree.setAttribute('aria-valuenow', '0')
    animationProgressThree.setAttribute('aria-valuemin', '0')
    animationProgressThree.setAttribute('aria-valuemax', '100')
    progressThree.appendChild(animationProgressThree)
    twelveColumnRow.appendChild(progressThree)
    emptyRowThree.appendChild(twelveColumnRow)
    cardBody.appendChild(emptyRowThree)

    // Row 4
    const emptyRowFour = document.createElement('div')
    emptyRowFour.classList = 'row'

    const elevenColumnRow = document.createElement('div')
    elevenColumnRow.classList = 'col-lg-11'

    const remainingAmountMock = document.createElement('div')
    remainingAmountMock.id = 'remainingAmountMock'
    remainingAmountMock.classList = 'd-inline-block animationBudget'
    elevenColumnRow.appendChild(remainingAmountMock)
    emptyRowFour.appendChild(elevenColumnRow)
    cardBody.appendChild(emptyRowFour)

    // Row 5
    const deleteBudgetPosition = document.createElement('div')
    deleteBudgetPosition.classList = 'row'

    const emptyElevenDiv = document.createElement('div')
    emptyElevenDiv.classList = 'col-lg-11'
    deleteBudgetPosition.appendChild(emptyElevenDiv)

    const oneColFive = document.createElement('div')
    oneColFive.classList = 'col-lg-1'

    const animationBudgetFive = document.createElement('div')
    animationBudgetFive.classList = 'w-100 animationBudget'
    oneColFive.appendChild(animationBudgetFive)
    deleteBudgetPosition.appendChild(oneColFive)
    cardBody.appendChild(deleteBudgetPosition)

    cardDiv.appendChild(cardBody)
    emptyDocumentFragment.appendChild(cardDiv)

    const budgetAmountBody = document.getElementById('budgetAmount')
    // Replace HTML with Empty
    while (budgetAmountBody.firstChild) {
      budgetAmountBody.removeChild(budgetAmountBody.firstChild)
    }
    budgetAmountBody.appendChild(emptyDocumentFragment)

    // Budget Visualization
    const chartVisualization = document.getElementById('chartBudgetVisualization')
    // Replace HTML with Empty
    while (chartVisualization.firstChild) {
      chartVisualization.removeChild(chartVisualization.firstChild)
    }
    const materialSpinnerElement = document.createElement('div')
    materialSpinnerElement.classList = 'material-spinner'
    chartVisualization.appendChild(materialSpinnerElement)
  }
}(jQuery))
