'use strict';
(function scopeWrapper ($) {
  /*
     * On Click Choose a goal
     */
  $('body').on('click', '#addGoals .chooseable', function (event) {
    const target = this.dataset.target
    switch (target) {
      case 'save-for-emergency':
        saveForEmergency()
        break
      case 'pay-off-credit-card':
        payOffCreditCard()
        break
      case 'pay-off-loans':
        payOffLoans()
        break
      case 'save-for-retirement':
        saveForRetirement()
        break
      case 'buy-a-home':
        buyAHome()
        break
      case 'buy-an-automobile':
        buyAnAutomobile()
        break
      case 'save-for-college':
        saveForCollege()
        break
      case 'take-a-trip':
        takeATrip()
        break
      case 'improve-my-home':
        improveMyHome()
        break
      case 'create-a-custom-goal':
        createACustomGoal()
        break
      default:
        break
    }
  })

  /*
     * Trigger edit a Goal
     */
  $('body').on('click', '.edit-a-goal', function () {
    editAGoal(this)
  })

  /*
     * Edit a goal
     */
  function editAGoal (event) {
    const dataType = event.dataset.type
    // Click Add Goals
    document.getElementById('addFncTT').click()

    switch (dataType) {
      case window.goalType.emergency:
        document.getElementById('choose-save-emergency').click()
        saveForEmergency()
        break
      case window.goalType.buyacar:
        document.getElementById('choose-buy-automobile').click()
        buyAnAutomobile()
        break
      case window.goalType.buyahome:
        document.getElementById('choose-buy-home').click()
        buyAHome()
        break
      case window.goalType.creditcard:
        document.getElementById('choose-credit-card').click()
        payOffCreditCard()
        break
      case window.goalType.customgoal:
        document.getElementById('choose-custom-goal').click()
        createACustomGoal()
        break
      case window.goalType.improvemyhome:
        document.getElementById('choose-improve-home').click()
        improveMyHome()
        break
      case window.goalType.payloan:
        document.getElementById('choose-loans').click()
        payOffLoans()
        break
      case window.goalType.planatrip:
        document.getElementById('choose-take-trip').click()
        takeATrip()
        break
      case window.goalType.retirement:
        document.getElementById('choose-retirement').click()
        saveForRetirement()
        break
      case window.goalType.university:
        document.getElementById('choose-college').click()
        saveForCollege()
        break
    }
  }

  /*
     * Save for Emergency
     */
  function saveForEmergency () {
    document.getElementById('choose-a-goal').classList.add('d-none')
    document.getElementById('choose-goal-title').textContent = window.translationData ? window.translationData.goals.choose.emergency.title : 'Save for an emergency'
    document.getElementById('save-for-emergency').classList.remove('d-none')
    document.getElementById('choose-goal-footer').classList.remove('d-none')
    document.getElementById('save-emergency-goals').classList.remove('d-none')
    // Focus the avergae expense input on click save for emergency
    document.getElementById('average-expense-emergency').focus()
    // choose month for emergency ( + 30 months)
    const currentDate = new Date()
    currentDate.setMonth(currentDate.getMonth() + 30)
    const cmt = document.getElementById('choose-month-title')
    cmt.textContent = window.months[currentDate.getMonth()]
    // Choose year for emergency
    const cyt = document.getElementById('choose-year-title')
    cyt.textContent = currentDate.getFullYear()
    // Populate average expense
    populateAverageExpense()
    // Set Slider Values of months
    window.emergencyFundMonths.noUiSlider.set(3)
    // Populate calculated total fund required
    calculatedEmergencyFundRequired()
  }

  /*
     * Pay off credit cards
     */
  function payOffCreditCard () {
    document.getElementById('choose-a-goal').classList.add('d-none')
    document.getElementById('pay-off-credit-card').classList.remove('d-none')
    document.getElementById('choose-goal-title').textContent = window.translationData ? window.translationData.goals.choose.creditcard.title : 'Pay off credit card'
    document.getElementById('choose-goal-footer').classList.remove('d-none')
  }

  /*
     * Pay off loans
     */
  function payOffLoans () {
    document.getElementById('choose-a-goal').classList.add('d-none')
    document.getElementById('pay-off-loans').classList.remove('d-none')
    document.getElementById('choose-goal-title').textContent = window.translationData ? window.translationData.goals.choose.loans.title : 'Pay off loans'
    document.getElementById('choose-goal-footer').classList.remove('d-none')
  }

  /*
     * Save for Retirement
     */
  function saveForRetirement () {
    document.getElementById('choose-a-goal').classList.add('d-none')
    document.getElementById('save-for-retirement').classList.remove('d-none')
    document.getElementById('choose-goal-title').textContent = window.translationData ? window.translationData.goals.choose.retirement.title : 'Save for retirement'
    document.getElementById('choose-goal-footer').classList.remove('d-none')
  }

  /*
     * Buy a home
     */
  function buyAHome () {
    document.getElementById('choose-a-goal').classList.add('d-none')
    document.getElementById('buy-a-home').classList.remove('d-none')
    document.getElementById('choose-goal-title').textContent = window.translationData ? window.translationData.goals.choose.home.title : 'Buy a home'
    document.getElementById('choose-goal-footer').classList.remove('d-none')
  }

  /*
     * Buy an automobile
     */
  function buyAnAutomobile () {
    document.getElementById('choose-a-goal').classList.add('d-none')
    document.getElementById('buy-an-automobile').classList.remove('d-none')
    document.getElementById('choose-goal-title').textContent = window.translationData ? window.translationData.goals.choose.automobile.title : 'Buy an automobile'
    document.getElementById('choose-goal-footer').classList.remove('d-none')
  }

  /*
     * Take a trip
     */
  function takeATrip () {
    document.getElementById('choose-a-goal').classList.add('d-none')
    document.getElementById('take-a-trip').classList.remove('d-none')
    document.getElementById('choose-goal-title').textContent = window.translationData ? window.translationData.goals.choose.trip.title : 'Take a trip'
    document.getElementById('choose-goal-footer').classList.remove('d-none')
  }

  /*
     * Improve my home
     */
  function improveMyHome () {
    document.getElementById('choose-a-goal').classList.add('d-none')
    document.getElementById('improve-my-home').classList.remove('d-none')
    document.getElementById('choose-goal-title').textContent = window.translationData ? window.translationData.goals.choose.improve.title : 'Improve my home'
    document.getElementById('choose-goal-footer').classList.remove('d-none')
  }

  /*
     * Create a custom goal
     */
  function createACustomGoal () {
    document.getElementById('choose-a-goal').classList.add('d-none')
    document.getElementById('create-a-custom-goal').classList.remove('d-none')
    document.getElementById('choose-goal-title').textContent = window.translationData ? window.translationData.goals.choose.custom.title : 'Create a custom goal'
    document.getElementById('choose-goal-footer').classList.remove('d-none')
  }

  /*
     * Save for College
     */
  function saveForCollege () {
    document.getElementById('choose-a-goal').classList.add('d-none')
    document.getElementById('save-for-college').classList.remove('d-none')
    document.getElementById('choose-goal-title').textContent = window.translationData ? window.translationData.goals.choose.college.title : 'Save for college'
    document.getElementById('choose-goal-footer').classList.remove('d-none')
  }

  /*
     * Click Back Button
     */
  $('body').on('click', '#back-goals', function (event) {
    document.getElementById('choose-a-goal').classList.remove('d-none')
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
    document.getElementById('choose-goal-footer').classList.add('d-none')
    document.getElementById('choose-goal-title').textContent = window.translationData ? window.translationData.goals.choose.title : 'Choose a goal'
  })

  /*
     * Populates the average Expense for the emergency fund
     */
  function populateAverageExpense () {
    let averageExpense = 0
    if (isNotEmpty(window.datesCreated)) {
      let totalExpense = 0
      for (let i = 0, len = window.datesCreated.length; i < len; i++) {
        totalExpense += Math.abs(window.datesCreated[i].expense_total)
      }

      if (totalExpense > 0) {
        averageExpense = totalExpense / window.datesCreated.length
      }
    }

    document.getElementById('average-expense-emergency').value = formatToCurrency(averageExpense)
    // Your monthly contribution is 10% of the average expense
    const tenPercentOfAverageIncome = formatToCurrency(averageExpense / 10)
    document.getElementById('your-monthly-contribution').value = tenPercentOfAverageIncome
    document.getElementById('monthly-contribution-display').textContent = tenPercentOfAverageIncome
  }

  // Calculated emergency funds required
  function calculatedEmergencyFundRequired () {
    // Planned date
    const ple = document.getElementById('planned-date-emergency')
    const currentDate = new Date()
    // Set Date to 30 months in the future
    currentDate.setMonth(currentDate.getMonth() + 30)
    const ytd = window.months[currentDate.getMonth()] + ' ' + currentDate.getFullYear()
    ple.textContent = ytd
    ple.setAttribute('data-date-chosen-month', currentDate.getMonth() + 1)
    ple.setAttribute('data-date-chosen-year', currentDate.getFullYear())
  }
}(jQuery))
