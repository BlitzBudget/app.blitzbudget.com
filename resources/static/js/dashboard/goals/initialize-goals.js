'use strict';
(function scopeWrapper ($) {
  window.goalType = {}
  window.goalType.emergency = 'EmergencyFund'
  window.goalType.creditcard = 'CreditCard'
  window.goalType.buyacar = 'BuyACar'
  window.goalType.buyahome = 'BuyAHome'
  window.goalType.customgoal = 'CustomGoal'
  window.goalType.improvemyhome = 'ImproveMyHome'
  window.goalType.payloan = 'PayLoan'
  window.goalType.planatrip = 'PlanATrip'
  window.goalType.retirement = 'Retirement'
  window.goalType.university = 'University'

  /*
     * Images from goal
     */
  window.imageFromGoalType = {}
  window.imageFromGoalType[window.goalType.emergency] = '../img/dashboard/goals/emergency-fund-display.jpg'
  window.imageFromGoalType[window.goalType.creditcard] = '../img/dashboard/goals/credit-card-display.jpg'
  window.imageFromGoalType[window.goalType.buyacar] = '../img/dashboard/goals/buy-a-car-display.jpg'
  window.imageFromGoalType[window.goalType.buyahome] = '../img/dashboard/goals/buy-a-home-display.jpg'
  window.imageFromGoalType[window.goalType.customgoal] = '../img/dashboard/goals/custom-goal-display.jpg'
  window.imageFromGoalType[window.goalType.improvemyhome] = '../img/dashboard/goals/improve-my-home-display.jpg'
  window.imageFromGoalType[window.goalType.payloan] = '../img/dashboard/goals/pay-loan-display.jpg'
  window.imageFromGoalType[window.goalType.planatrip] = '../img/dashboard/goals/plan-a-trip-display.jpg'
  window.imageFromGoalType[window.goalType.retirement] = '../img/dashboard/goals/retirement-display.jpg'
  window.imageFromGoalType[window.goalType.university] = '../img/dashboard/goals/university-display.jpg'

  /*
     * Type to name
     */
  window.typeToName = {}
  window.typeToName[window.goalType.emergency] = 'Emergency Fund'
  window.typeToName[window.goalType.creditcard] = 'Credit card debt'
  window.typeToName[window.goalType.buyacar] = 'Buy A Car'
  window.typeToName[window.goalType.buyahome] = 'Buy A Home'
  window.typeToName[window.goalType.customgoal] = 'Custom goal'
  window.typeToName[window.goalType.improvemyhome] = 'Improve My Home'
  window.typeToName[window.goalType.payloan] = 'Pay Off Loan'
  window.typeToName[window.goalType.planatrip] = 'Travel'
  window.typeToName[window.goalType.retirement] = 'Retirement'
  window.typeToName[window.goalType.university] = 'Save For College'

  /**
     * START loading the page
     *
     */
  const currentPageInCookie = er.getCookie('currentPage')
  if (isEqual(currentPageInCookie, 'goalsPage')) {
    if (isEqual(window.location.href, window._config.app.invokeUrl)) {
      populateCurrentPage('goalsPage')
    }
  }

  /*
     * On Click goals
     */
  const goalsPage = document.getElementById('goalsPage')
  if (isNotEmpty(goalsPage)) {
    goalsPage.addEventListener('click', function (e) {
      populateCurrentPage('goalsPage')
    })
  }

  /*
     * Populate Current Page
     */
  function populateCurrentPage (page) {
    er.refreshCookiePageExpiry(page)
    er.fetchCurrentPage('/goals', function (data) {
      // Load the new HTML
      $('#mutableDashboard').html(data)
      // Translate current Page
      translatePage(getLanguage())
      // Set Current Page
      const currentPage = document.getElementById('currentPage')
      currentPage.setAttribute('data-i18n', 'goals.page.title')
      currentPage.textContent = window.translationData ? window.translationData.goals.page.title : 'Goals'
      // Initial Load
      initialLoad()
    })

    /**
         *  Add Functionality Generic + Btn
         **/

    // Register Tooltips
    const ttinit = $('#addFncTT')
    ttinit.attr('data-original-title', 'Add Goals')
    ttinit.tooltip({
      delay: {
        show: 300,
        hide: 100
      }
    })

    // Generic Add Functionality
    const genericAddFnc = document.getElementById('genericAddFnc')
    document.getElementById('addFncTT').textContent = 'add'
    genericAddFnc.classList = 'btn btn-round btn-warning btn-just-icon bottomFixed float-right addNewGoals'
    $(genericAddFnc).unbind('click').click(function () {
      if (!this.classList.contains('addNewGoals')) {
        return
      }

      // Create goals
      $('#addGoals').modal('toggle')
      // Display choose a goal and hide others
      document.getElementById('save-for-emergency').classList.add('d-none')
      document.getElementById('pay-off-credit-card').classList.add('d-none')
      document.getElementById('pay-off-loans').classList.add('d-none')
      document.getElementById('save-for-retirement').classList.add('d-none')
      document.getElementById('buy-a-home').classList.add('d-none')
      document.getElementById('buy-an-automobile').classList.add('d-none')
      document.getElementById('save-for-college').classList.add('d-none')
      document.getElementById('take-a-trip').classList.add('d-none')
      document.getElementById('improve-my-home').classList.add('d-none')
      document.getElementById('create-a-custom-goal').classList.add('d-none')
      document.getElementById('choose-a-goal').classList.remove('d-none')
    })
  }

  /*
     * Initial Load of goals page
     */
  function initialLoad () {
    /*
         * Fetch Goals
         */
    fetchGoals()

    /*
         * Save For Emergency
         */
    // no ui slider initialize
    window.emergencyFundMonths = document.getElementById('emergency-fund-months')
    const updateSliderValue = document.getElementById('emergency-fund-value')
    noUiSlider.create(emergencyFundMonths, {
      start: 3,
      connect: 'lower',
      behaviour: 'tap',
      tooltips: true,
      keyboardSupport: true, // Default true
      keywordPageMultiplier: 2, // Default 5
      keywordDefaultStep: 1, // Default 10
      step: 1,
      range: {
        min: 1,
        max: 12
      },
      format: {
        from: Number,
        to: function (value) {
          return (parseInt(value) + ' month/s')
        }
      }
    })

    /*
         * On update of the slider, Update values in a text field
         */
    window.emergencyFundMonths.noUiSlider.on('update', function (values, handle, unencoded) {
      // Convert average expense emergency to number
      let avEmergencyExp = document.getElementById('average-expense-emergency').value
      if (isEmpty(avEmergencyExp)) {
        avEmergencyExp = 0
      } else {
        avEmergencyExp = er.convertToNumberFromCurrency(avEmergencyExp, currentCurrencyPreference)
      }
      // Months * average expense = total emergency fund
      updateSliderValue.textContent = formatToCurrency(unencoded * avEmergencyExp)

      /*
             * Calculate Total Planned Date
             */
      calculateTotalPlannedDate()
    })

    /*
         * Load Date Picker
         */
    loadDatePickerForEmergency()
  }

  /*
     * Load Date Picker Year for emergency
     */
  function loadDatePickerForEmergency () {
    let currentYear = new Date().getFullYear()
    const yearFragment = document.createDocumentFragment()
    for (let i = 0; i < 15; i++) {
      yearFragment.appendChild(createOneDate(currentYear++))
    }
    document.getElementById('list-of-year-emergency').append(yearFragment)
  }

  /*
     * Create One Date
     */
  function createOneDate (year) {
    const liElement = document.createElement('li')

    const anchorTag = document.createElement('a')
    anchorTag.setAttribute('role', 'option')
    anchorTag.classList = 'dropdown-item'
    anchorTag.setAttribute('aria-disabled', 'false')
    anchorTag.setAttribute('tabindex', '0')
    anchorTag.setAttribute('aria-selected', 'false')
    anchorTag.setAttribute('data-year', year)

    const spanText = document.createElement('span')
    spanText.classList = 'text'
    spanText.textContent = year
    anchorTag.appendChild(spanText)
    liElement.appendChild(anchorTag)

    return liElement
  }

  /*
     * Fetch Goals
     */
  function fetchGoals () {
    const goalDisplayed = document.getElementById('goal-displayed')
    goalDisplayed.appendChild(buildLoadingGoals())

    const values = {}
    if (isNotEmpty(window.currentUser.walletId)) {
      values.walletId = window.currentUser.walletId
      values.userId = window.currentUser.financialPortfolioId
    } else {
      values.userId = window.currentUser.financialPortfolioId
    }

    // Ajax Requests on Error
    const ajaxData = {}
    ajaxData.isAjaxReq = true
    ajaxData.type = 'POST'
    ajaxData.url = window._config.api.invokeUrl + window._config.api.goals
    ajaxData.dataType = 'json'
    ajaxData.contentType = 'application/json;charset=UTF-8'
    ajaxData.data = JSON.stringify(values)
    ajaxData.onSuccess = function (result) {
      // Dates Cache
      window.datesCreated = result.Date

      er_a.populateBankInfo(result.BankAccount)

      /*
                 * Replace With Currency
                 */
      replaceWithCurrency(result.Wallet)

      /*
                 * Display Goals
                 */
      displayGoals(result.Goal, result.Wallet)
    },
    ajaxData.onFailure = function (thrownError) {
      manageErrors(thrownError, window.translationData.goals.dynamic.geterror, ajaxData)
    }

    // Load all user transaction from API
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

  /*
     * Display goal
     */
  function displayGoals (goalArray, currentWalletData) {
    /*
         * Remove Loading Goals
         */
    const loadingGoal = document.getElementById('loading-goal')
    loadingGoal.remove()

    /*
         * Goal is Empty
         */
    if (isEmpty(goalArray)) {
      const goalDisplayed = document.getElementById('goal-displayed')
      goalDisplayed.appendChild(emptyGoals())
      return
    }

    // Fragment Goal
    const fragmentGoal = document.createDocumentFragment()
    for (let i = 0, len = goalArray.length; i < len; i++) {
      const goal = goalArray[i]
      fragmentGoal.appendChild(buildAGoal(goal, i, currentWalletData))
    }
    const goalDisplayed = document.getElementById('goal-displayed')
    goalDisplayed.appendChild(fragmentGoal)

    // Initialize tooltip
    activateTooltip()
  }

  /*
     * Empty Goals
     */
  function emptyGoals () {
    const mxauto = document.createElement('div')
    mxauto.classList = 'mx-auto text-center'
    mxauto.id = 'empty-goal'

    const emptyImage = document.createElement('img')
    emptyImage.src = '../img/dashboard/goals/goals-empty.svg'
    mxauto.appendChild(emptyImage)

    const title = document.createElement('h3')
    title.textContent = "You haven't added a goal yet!"
    mxauto.appendChild(title)

    const actionButton = document.createElement('button')
    actionButton.classList = 'btn btn-warning my-5'
    actionButton.id = 'addAGoal'
    actionButton.textContent = 'Add A New Goal'
    mxauto.appendChild(actionButton)
    return mxauto
  }

  /*
     * Trigger Add a Goal
     */
  $('body').on('click', '#addAGoal', function () {
    // Create goals
    $('#addGoals').modal('toggle')
  })

  /*
     * Trigger Delete Goal
     */
  $('body').on('click', '.delete-a-goal', function () {
    deleteGoalFireSwal(this)
  })

  /*
     * Delete Goals
     */
  function deleteGoalFireSwal (event) {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      customClass: {
        confirmButton: 'btn btn-warning',
        cancelButton: 'btn btn-danger'
      },
      confirmButtonText: 'Yes, delete it!',
      showCloseButton: true,
      showCancelButton: false,
      focusConfirm: true,
      buttonsStyling: false
    }).then(function (result) {
      // If confirm button is clicked
      if (result.value) {
        deleteAGoal(event)
      }
    }).catch(swal.noop)
  }

  /*
     * Delete goal API
     */
  function deleteAGoal (event) {
    // Fade Out
    const targetId = event.dataset.target
    const goalElement = document.getElementById('goal-' + targetId)
    $(goalElement).fadeOut()

    const values = {}
    values.walletId = window.currentUser.walletId
    values.itemId = event.dataset.target

    // Ajax Requests on Error
    const ajaxData = {}
    ajaxData.isAjaxReq = true
    ajaxData.type = 'POST'
    ajaxData.url = window._config.api.invokeUrl + window._config.api.deleteItem
    ajaxData.dataType = 'json'
    ajaxData.contentType = 'application/json;charset=UTF-8'
    ajaxData.data = JSON.stringify(values)
    ajaxData.onSuccess = function (result) {
      // delete the item
      goalElement.remove()
      // Card Prod ucts
      const cardProducts = document.getElementsByClassName('card-product')
      if (cardProducts == null || cardProducts.length == 0) {
        // Append Empty Goals if all the goals are removed
        const goalDisplayed = document.getElementById('goal-displayed')
        goalDisplayed.appendChild(emptyGoals())
      }
    },
    ajaxData.onFailure = function (thrownError) {
      manageErrors(thrownError, window.translationData.goals.dynamic.deleteerror, ajaxData)
      // Fade in
      $(goalElement).fadeIn()
    }

    // Load all user transaction from API
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

  /*
     * Build Loading Goals
     */
  function buildLoadingGoals () {
    // Divided Column
    const mdColumn = document.createElement('div')
    mdColumn.classList = 'col-md-4'
    mdColumn.id = 'loading-goal'

    const cardProduct = document.createElement('div')
    cardProduct.classList = 'card card-product'

    const cardHeader = document.createElement('div')
    cardHeader.classList = 'card-header card-header-image animated'
    cardHeader.setAttribute('data-header-animation', 'true')

    const imageAnchor = document.createElement('a')
    imageAnchor.href = 'Javascript:void(0);'

    const imageElement = document.createElement('img')
    imageElement.classList = 'img'
    imageElement.src = ''
    imageAnchor.appendChild(imageElement)
    cardHeader.appendChild(imageAnchor)
    cardProduct.appendChild(cardHeader)

    /*
         * Build Card Body
         */
    const cardBody = document.createElement('div')
    cardBody.classList = 'card-body'

    const cardDescription = document.createElement('div')
    cardDescription.classList = 'card-description'

    const wSeventy = document.createElement('div')
    wSeventy.classList = 'w-70 animationCard'
    cardDescription.appendChild(wSeventy)

    const wFifty = document.createElement('div')
    wFifty.classList = 'w-50 animationCard'
    cardDescription.appendChild(wFifty)

    const wThrity = document.createElement('p')
    wThrity.classList = 'w-30 animationCard'
    cardDescription.appendChild(wThrity)

    const wTen = document.createElement('p')
    wTen.classList = 'w-10 animationCard'
    cardDescription.appendChild(wTen)
    cardBody.appendChild(cardDescription)
    cardProduct.appendChild(cardBody)

    /*
         * Card Footer
         */
    const cardFooter = document.createElement('div')
    cardFooter.classList = 'card-footer'

    const price = document.createElement('div')
    price.classList = 'price'
    cardFooter.appendChild(price)

    const stats = document.createElement('div')
    stats.classList = 'stats'

    const cardCategory = document.createElement('p')
    cardCategory.classList = 'card-category card-title'
    cardCategory.textContent = 'loading'

    const tickIcon = document.createElement('i')
    tickIcon.classList = 'material-icons rotating'
    tickIcon.textContent = 'autorenew'
    cardCategory.appendChild(tickIcon)
    stats.appendChild(cardCategory)
    cardFooter.appendChild(stats)
    cardProduct.appendChild(cardFooter)
    mdColumn.appendChild(cardProduct)

    return mdColumn
  }
}(jQuery))

/*
 * Build a goal
 */
function buildAGoal (oneGoal, count, currentWalletData) {
  // Divided Column
  const mdColumn = document.createElement('div')
  mdColumn.classList = 'col-md-4 displayed-goals'
  mdColumn.id = 'goal-' + oneGoal.goalId
  mdColumn.setAttribute('data-count', count)

  const cardProduct = document.createElement('div')
  cardProduct.classList = 'card card-product'

  const cardHeader = document.createElement('div')
  cardHeader.classList = 'card-header card-header-image animated'
  cardHeader.setAttribute('data-header-animation', 'true')

  const imageAnchor = document.createElement('a')
  imageAnchor.href = 'Javascript:void(0);'

  const imageElement = document.createElement('img')
  imageElement.classList = 'img'
  imageElement.src = getImageForGoals(oneGoal.goal_type)
  imageAnchor.appendChild(imageElement)
  cardHeader.appendChild(imageAnchor)
  cardProduct.appendChild(cardHeader)

  /*
     * Build Card Body
     */
  const cardBody = document.createElement('div')
  cardBody.classList = 'card-body'

  const cardActions = document.createElement('div')
  cardActions.classList = 'card-actions text-center'

  // View Button
  const viewButton = document.createElement('div')
  viewButton.type = 'button'
  viewButton.classList = 'btn btn-default btn-link'
  viewButton.setAttribute('data-toggle', 'tooltip')
  viewButton.setAttribute('data-placement', 'bottom')
  viewButton.setAttribute('data-original-title', 'View goal')

  const artIcon = document.createElement('i')
  artIcon.classList = 'material-icons'
  artIcon.textContent = 'art_track'
  viewButton.appendChild(artIcon)

  // ripple Container
  const rippleContainer = document.createElement('div')
  rippleContainer.classList = 'ripple-container'
  viewButton.appendChild(rippleContainer)
  cardActions.appendChild(viewButton)

  // Edit Button
  const editButton = document.createElement('div')
  editButton.type = 'button'
  editButton.classList = 'btn btn-warning btn-link edit-a-goal'
  editButton.setAttribute('data-target', oneGoal.goalId)
  editButton.setAttribute('data-type', oneGoal.goal_type)
  editButton.setAttribute('data-toggle', 'tooltip')
  editButton.setAttribute('data-placement', 'bottom')
  editButton.setAttribute('data-original-title', 'Edit goal')

  const editIcon = document.createElement('i')
  editIcon.classList = 'material-icons'
  editIcon.textContent = 'edit'
  editButton.appendChild(editIcon)
  cardActions.appendChild(editButton)

  // Remove Button
  const removeButton = document.createElement('div')
  removeButton.type = 'button'
  removeButton.classList = 'btn btn-danger btn-link delete-a-goal'
  removeButton.setAttribute('data-target', oneGoal.goalId)
  removeButton.setAttribute('data-toggle', 'tooltip')
  removeButton.setAttribute('data-placement', 'bottom')
  removeButton.setAttribute('data-original-title', 'Delete goal')

  const removeIcon = document.createElement('i')
  removeIcon.classList = 'material-icons'
  removeIcon.textContent = 'close'
  removeButton.appendChild(removeIcon)
  cardActions.appendChild(removeButton)
  cardBody.appendChild(cardActions)

  const cardTitle = document.createElement('h3')
  cardTitle.classList = 'card-title'

  const anchorTitle = document.createElement('a')
  anchorTitle.classList = 'goal-title'
  anchorTitle.href = 'Javascript:void(0);'
  anchorTitle.textContent = window.typeToName[oneGoal.goal_type]
  cardTitle.appendChild(anchorTitle)
  cardBody.appendChild(cardTitle)

  const cardDescription = document.createElement('div')
  cardDescription.classList = 'card-description'

  const progressDiv = document.createElement('div')
  progressDiv.classList = 'progress mt-3'

  const progressBar = document.createElement('div')
  progressBar.classList = 'progress-bar progress-bar-warning-striped'
  progressBar.setAttribute('role', 'progressbar')
  progressBar.setAttribute('aria-valuemin', '0')
  // Set the value and percentage of the progress bar
  const progressBarPercentage = calculatePercentageForGoals(oneGoal, currentWalletData)
  progressBar.setAttribute('aria-valuenow', progressBarPercentage)
  progressBar.style.width = progressBarPercentage + '%'
  progressBar.setAttribute('aria-valuemax', '100')
  progressDiv.appendChild(progressBar)
  cardDescription.appendChild(progressDiv)

  /*
     * Description for progress bar
     */
  const finalAmount = document.createElement('div')
  finalAmount.classList = 'row small'

  const zeroDescription = document.createElement('p')
  zeroDescription.classList = 'description col-6 text-left'
  zeroDescription.textContent = formatToCurrency('0')
  finalAmount.appendChild(zeroDescription)

  const finalDescription = document.createElement('p')
  finalDescription.classList = 'description col-6 text-right'
  finalDescription.textContent = formatToCurrency(oneGoal.final_amount)
  finalAmount.appendChild(finalDescription)
  cardDescription.appendChild(finalAmount)
  cardBody.appendChild(cardDescription)
  cardProduct.appendChild(cardBody)

  /*
     * Card Footer
     */
  const cardFooter = document.createElement('div')
  cardFooter.classList = 'card-footer'

  const footerPrice = document.createElement('div')
  footerPrice.classList = 'price'

  const footerAmount = document.createElement('span')
  footerAmount.classList = 'card-title'
  footerAmount.textContent = formatToCurrency(oneGoal.monthly_contribution)
  footerPrice.appendChild(footerAmount)

  const footerPerMonth = document.createElement('span')
  footerPerMonth.classList = 'description'
  footerPerMonth.textContent = ' / month'
  footerPrice.appendChild(footerPerMonth)
  cardFooter.appendChild(footerPrice)

  const stats = document.createElement('div')
  stats.classList = 'stats'

  const cardCategory = document.createElement('p')
  cardCategory.classList = 'card-category card-title'
  cardCategory.textContent = 'on track'

  const tickIcon = document.createElement('i')
  tickIcon.classList = 'material-icons rotating'
  tickIcon.textContent = 'autorenew'
  cardCategory.appendChild(tickIcon)
  stats.appendChild(cardCategory)
  cardFooter.appendChild(stats)
  cardProduct.appendChild(cardFooter)
  mdColumn.appendChild(cardProduct)

  return mdColumn
}

/*
 * Calculate Percentage for goals
 */
function calculatePercentageForGoals (oneGoal, currentWalletData) {
  const percentage = 0
  const finalAmount = oneGoal.final_amount
  let currentAmount = 0

  // Wallet Balance
  if (isNotEmpty(currentWalletData.wallet_balance)) {
    window.currentUser.walletBalance = currentWalletData.wallet_balance
  }

  switch (oneGoal.target_type) {
    case 'Wallet':
      currentAmount = isEmpty(window.currentUser.walletBalance) ? currentWalletData.wallet_balance : window.currentUser.walletBalance
      break
    default:
      break
  }

  // Return percentage
  return (currentAmount / finalAmount) * 100
}

/*
 * Goals for Image
 */
function getImageForGoals (goalType) {
  return window.imageFromGoalType[goalType]
}
