'use strict';
// Keyboard shortcuts
(function scopeWrapper ($) {
  document.onkeyup = function (e) {
    // Do nothing If input is already focused
    // Do nothing if the event was already processed
    // Do nothing if Swal modal is open
    // Do nothing Bootstrap is open
    if (e.defaultPrevented || $('input:focus').length > 0 || Swal.isVisible() || isABootstrapModalOpen()) {
      return
    }
    /* Navigation */
    switch (e.key) {
      case '1':
        /* While pressing "1" */
        /* Navigate to overview page */
        document.getElementById('overviewPage').click()
        break
      case '2':
        /* While pressing "2" */
        /* Navigate to transactions page */
        document.getElementById('transactionsPage').click()
        break
      case '3':
        /* While pressing "3" */
        /* Naviaget to budget page */
        document.getElementById('budgetPage').click()
        break
      case '4':
        /* While pressing "4" */
        /* Navigate to goals page */
        document.getElementById('goalsPage').click()
        break
      case '5':
        /* While pressing "5" */
        /* Navigate to settings page */
        document.getElementById('settingsPgDD').click()
        break
      case '6':
        /* While pressing "6" */
        /* Navigate to profile page */
        document.getElementById('profilePage').click()
        break
      case '7':
        /* While pressing "7" */
        /* Move to Financial Accounts Section */
        document.getElementsByClassName('manageBA')[0].click()
        break
      case '8':
        /* While pressing "8" */
        /* Move to Wallets Section */
        window.location.href = window._config.app.invokeUrl + window._config.wallet.invokeUrl
        break
      case '/':
      case '?':
        /* While pressing "/" */
        /* Toggle Help Center */
        document.getElementsByClassName('helpCenter')[0].click()
        break
      case 'Left': // IE/Edge specific value
      case 'ArrowLeft':
        /* While pressing "Left Arrow" */
        /* Move to previous month */
        document.getElementById('monthPicker-' + window.chosenDate.getMonth()).click()
        break
      case 'Right': // IE/Edge specific value
      case 'ArrowRight':
        /* While pressing "Right Arrow" */
        /* Move to next month */
        document.getElementById('monthPicker-' + (window.chosenDate.getMonth() + 2)).click()
        break
      case 't':
        /* While pressing "t" */
        /* Move to current month */
        document.getElementById('monthPicker-' + (new Date().getMonth() + 1)).click()
        break
      case 'a':
        /* While pressing "a" */
        /* Add a new element */
        const genericAdd = document.getElementById('genericAddFnc')
        // Only if the class "d-none" is not present
        if (!genericAdd.classList.contains('d-none')) {
          genericAdd.click()
        }
        break
      default:
        break
    }
  }
}(jQuery))
