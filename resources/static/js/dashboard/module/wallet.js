// Account Information display
(function scopeWrapper ($) {
  // Manage Wallets Trigger
  window.manageWalletsTriggered = false

  // Current Chosen Wallet
  let chosenWallet = ''

  // WALLET CONSTANTS
  const WALLET_CONSTANTS = {}
  // SECURITY: Defining Immutable properties as constants
  Object.defineProperties(WALLET_CONSTANTS, {
    resetAccountUrl: {
      value: '/profile/reset-account',
      writable: false,
      configurable: false
    },
    walletUrl: {
      value: '/wallet',
      writable: false,
      configurable: false
    },
    userAttributeUrl: {
      value: '/profile/user-attribute',
      writable: false,
      configurable: false
    }
  })

  // Add wallet
  let chosenCurrencyW = ''
  let chosenCurrencyWMW = ''
  window.authHeader = window.authHeader || localStorage.getItem('idToken')

  // store in session storage
  const currentUserSI = localStorage.getItem('currentUserSI')
  if (isNotEmpty(currentUserSI)) {
    // Parse JSON back to Object
    window.currentUser = JSON.parse(currentUserSI)
  } else {
    // If the user is not authorized then redirect to application
    window.location.href = '/'
  }

  // Translate current Page
  translatePage(getLanguage())

  document.getElementById('genericAddFnc').addEventListener('click', function (e) {
    document.getElementById('addWallet').classList.remove('d-none')
    document.getElementById('whichWallet').classList.add('d-none')
    document.getElementById('genericAddFnc').classList.add('d-none')
    const manageWallets = document.getElementById('manageWallets')
    manageWallets.classList.add('d-none')
    manageWallets.classList.remove('d-block')
    document.getElementsByClassName('Cards')[0].classList.add('important')
    document.body.classList.add('darker')
    document.getElementById('confirmWallet').setAttribute('disabled', 'disabled')
  })

  document.getElementById('cancelWallet').addEventListener('click', function (e) {
    document.getElementById('addWallet').classList.add('d-none')
    document.getElementById('whichWallet').classList.remove('d-none')
    document.getElementById('genericAddFnc').classList.remove('d-none')
    const manageWallets = document.getElementById('manageWallets')
    manageWallets.classList.remove('d-none')
    manageWallets.classList.add('d-block')
    document.getElementsByClassName('Cards')[0].classList.remove('important')
    document.body.classList.remove('darker')
  })

  document.getElementById('confirmWallet').addEventListener('click', function (e) {
    document.getElementById('addWallet').classList.add('d-none')
    document.getElementById('whichWallet').classList.remove('d-none')
    document.getElementById('genericAddFnc').classList.remove('d-none')
    const manageWallets = document.getElementById('manageWallets')
    manageWallets.classList.remove('d-none')
    manageWallets.classList.add('d-block')
    document.getElementsByClassName('Cards')[0].classList.remove('important')
    document.body.classList.remove('darker')
    // Add new wallet
    addNewWallet()
  })

  // Add new wallet
  function addNewWallet () {
    // Loading option
    document.getElementById('whichWallet').appendChild(buildLoadingWallet())

    // Set Param Val combination
    let values = {}
    values.currency = chosenCurrencyW
    values.userId = window.currentUser.financialPortfolioId
    values = JSON.stringify(values)

    jQuery.ajax({
      url: window._config.api.invokeUrl + WALLET_CONSTANTS.walletUrl,
      beforeSend: function (xhr) {
        xhr.setRequestHeader('Authorization', window.authHeader)
      },
      type: 'PUT',
      contentType: 'application/json;charset=UTF-8',
      data: values,
      success: function (result) {
        // Generate the wallet object
        const wallet = result['body-json']

        // Add the newly added wallet to global wallets
        window.globalWallet.push(wallet)
        // Populate Autocomplete currency
        populateAutocompleteCurrency(window.globalWallet)

        // Remove Loader
        const removeLoader = document.getElementById('loading-wallet')
        removeLoader.parentNode.removeChild(removeLoader)
        // Load wallet
        const walletWrapper = buildWalletDiv(wallet)
        document.getElementById('whichWallet').appendChild(walletWrapper)

        // Initialize tooltip
        activateTooltip()
      },
      error: function (thrownError) {
        if (isEmpty(thrownError) || isEmpty(thrownError.responseJSON)) {
          showNotification(window.translationData.wallet.dynamic.add.error, window._constants.notification.error)
        } else if (isNotEmpty(thrownError.message)) {
          showNotification(thrownError.message, window._constants.notification.error)
        } else {
          const responseError = JSON.parse(thrownError.responseJSON)
          if (isNotEmpty(responseError) && isNotEmpty(responseError.error) && responseError.error.includes('Unauthorized')) {
            // If the user is not authorized then redirect to application
            window.location.href = '/'
          }
        }
      }
    })
  }

  /**
     * Autocomplete Module
     **/
  function autocomplete (inp, arr, scrollWrapEl) {
    /* Removes a function when someone writes in the text field: */
    inp.removeEventListener('input', inputTriggerAutoFill)
    /* Removes a function presses a key on the keyboard: */
    inp.removeEventListener('keydown', keydownAutoCompleteTrigger)
    /* the autocomplete function takes two arguments,
        the text field element and an array of possible autocompleted values: */
    let currentFocus
    /* execute a function when someone writes in the text field: */
    inp.addEventListener('input', inputTriggerAutoFill)
    /* execute a function presses a key on the keyboard: */
    inp.addEventListener('keydown', keydownAutoCompleteTrigger)

    function addActive (x) {
      /* a function to classify an item as "active": */
      if (!x) return false
      /* start by removing the "active" class on all items: */
      removeActive(x)
      if (currentFocus >= x.length) currentFocus = 0
      if (currentFocus < 0) currentFocus = (x.length - 1)
      /* add class "autocomplete-active": */
      x[currentFocus].classList.add('autocomplete-active')
      // Change focus of the element
      x[currentFocus].focus()
    }

    function removeActive (x) {
      /* a function to remove the "active" class from all autocomplete items: */
      for (let i = 0, len = x.length; i < len; i++) {
        x[i].classList.remove('autocomplete-active')
      }
    }

    function closeAllLists (elmnt) {
      /* close all autocomplete lists in the document,
            except the one passed as an argument: */
      const x = document.getElementsByClassName('autocomplete-items')
      for (let i = 0, len = x.length; i < len; i++) {
        if (elmnt != x[i] && elmnt != inp) {
          x[i].parentNode.removeChild(x[i])
        }
      }
    }
    /*
         * Auto Complete Input Trigger function
         */
    function inputTriggerAutoFill (e) {
      let a; let b; let i; const val = this.value
      let len = arr.length
      let upperVal; let startsWithChar; let regVal; let populatedAtleastOnce = false
      /* close any already open lists of autocompleted values */
      closeAllLists()
      if (!val) {
        len = arr.length < 5 ? arr.length : 5
      } else {
        upperVal = val.toUpperCase()
      }
      currentFocus = -1
      /* create a DIV element that will contain the items (values): */
      a = document.createElement('DIV')
      a.setAttribute('id', this.id + 'autocomplete-list')
      a.setAttribute('class', 'autocomplete-items')
      /* for each item in the array... */
      for (let i = 0; i < len; i++) {
        let autoFilEl = false
        if (!val) {
          autoFilEl = true
        } else {
          /* check if the starting characters match */
          startsWithChar = arr[i].substr(0, val.length).toUpperCase() == upperVal
          /* build a regex with the value entered */
          regVal = new RegExp(upperVal, 'g')
          /* check if the item starts with the same letters as the text field value: */
          if (startsWithChar || includesStr(arr[i].toUpperCase(), upperVal)) {
            autoFilEl = true
          }
        }

        // Confinue with the iteration
        if (!autoFilEl) {
          continue
        }

        /* create a DIV element for each matching element: */
        b = document.createElement('DIV')
        b.classList.add('dropdown-item')
        /* make the matching letters bold: */
        if (startsWithChar) {
          b.innerHTML = '<strong>' + arr[i].substr(0, val.length) + '</strong>' + arr[i].substr(val.length)
        } else if (!val) {
          b.innerHTML = arr[i]
        } else {
          const startPos = regVal.exec(arr[i].toUpperCase()).index
          const startPos2 = startPos + val.length
          b.innerHTML = arr[i].substr(0, startPos) + '<strong>' + arr[i].substr(startPos, val.length) + '</strong>' + arr[i].substr(startPos2)
        }
        /* insert a input field that will hold the current array item's value: */
        b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>"
        /* execute a function when someone clicks on the item value (DIV element): */
        b.addEventListener('click', function (e) {
          /* insert the value for the autocomplete text field: */
          if (isNotEmpty(inp)) inp.value = this.getElementsByTagName('input')[0].value
          /* close the list of autocompleted values,
                    (or any other open lists of autocompleted values: */
          closeAllLists()
        })
        a.appendChild(b)
        /* Populated the data flag */
        populatedAtleastOnce = true
      }

      if (!populatedAtleastOnce) {
        /* create a DIV element for each matching element: */
        b = document.createElement('DIV')
        b.classList = 'noResultsDD'
        b.textContent = window.translationData.wallet.dynamic.noresults
        a.appendChild(b)
      }

      /* append the DIV element as a child of the autocomplete container: */
      this.parentNode.appendChild(a)
    }

    /*
         *	Autocomplete Key down event
         */
    function keydownAutoCompleteTrigger (e) {
      const wrapClassId = this.id + 'autocomplete-list'
      let x = document.getElementById(wrapClassId)
      if (x) x = x.getElementsByTagName('div')
      if (e.keyCode == 40) {
        /* If the arrow DOWN key is pressed,
                increase the currentFocus variable: */
        currentFocus++
        /* and and make the current item more visible: */
        addActive(x)
      } else if (e.keyCode == 38) { // up
        /* If the arrow UP key is pressed,
                decrease the currentFocus variable: */
        currentFocus--
        /* and and make the current item more visible: */
        addActive(x)
      } else if (e.keyCode == 13) {
        /* If the ENTER key is pressed, prevent the form from being submitted, */
        e.preventDefault()
        if (currentFocus > -1) {
          /* and simulate a click on the "active" item: */
          if (x) x[currentFocus].click()
        }
      }
      /* set equal to the position of the selected element minus the height of scrolling div */
      const scrollToEl = $('#' + scrollWrapEl)
      /* set to top */
      scrollToEl.scrollTop(0)
      const ddItemac = $('#' + wrapClassId + ' .autocomplete-active')
      /* Chceck if elements are present, then scrolls to them */
      if (ddItemac && scrollToEl && ddItemac.offset() && scrollToEl.offset()) {
        scrollToEl.scrollTop(ddItemac.offset().top - scrollToEl.offset().top + scrollToEl.scrollTop())
      }
    }
  }

  // On click drop down btn of country search
  $('#chosenCurrencyWDropdown').on('shown.bs.dropdown', function (event) {
    const currencyInp = document.getElementById('chosenCurrencyWInp')
    // Input change focus to the country search bar
    currencyInp.focus()
    // Trigger input event
    const eventInp = new Event('input', {
      bubbles: true,
      cancelable: true
    })

    currencyInp.dispatchEvent(eventInp)
  })

  // On click drop down btn of country search
  $('#chosenCurrencyWDropdown').on('hidden.bs.dropdown', function (event) {
    // Input clear value for the country search bar
    document.getElementById('chosenCurrencyWInp').value = ''
    // Close all list
    closeAllDDLists(this)
  })

  // Close all lists within element
  function closeAllDDLists (elmnt) {
    /* close all autocomplete lists in the document,
        except the one passed as an argument: */
    const x = elmnt.getElementsByClassName('autocomplete-items')
    for (let i = 0, len = x.length; i < len; i++) {
      if (elmnt != x[i]) {
        x[i].parentNode.removeChild(x[i])
      }
    }
  }

  // On click drop down btn of country search
  $(document).on('click', '.autocomplete-items .dropdown-item', function (event) {
    const chooseCrncyId = 'chosenCurrencyWInpautocomplete-list'
    const chooseCrncyMWId = 'chosenCurrencyWInpMWautocomplete-list'
    const id = this.parentElement.id
    // Choose country DD update locale
    if (isEqual(id, chooseCrncyId)) {
      document.getElementById('confirmWallet').removeAttribute('disabled')
      document.getElementById('chosenCurrencyW').textContent = this.lastElementChild.value
      chosenCurrencyW = this.lastElementChild.value
    } else if (isEqual(id, chooseCrncyMWId)) {
      document.getElementById('modifyWallet').removeAttribute('disabled')
      document.getElementById('chosenCurrencyWMW').textContent = this.lastElementChild.value
      chosenCurrencyWMW = this.lastElementChild.value
    }
  })

  // Create the dropdown item with wallet
  function dropdownItemsWithWallet (withWalletItem) {
    const dpItem = document.createElement('div')
    dpItem.classList = 'dropdown-item'
    dpItem.textContent = withWalletItem

    const inpHi = document.createElement('input')
    inpHi.setAttribute('type', 'hidden')
    inpHi.setAttribute('value', withWalletItem)
    dpItem.appendChild(inpHi)

    return dpItem
  }

  /*
     * Get Wallet
     */
  getWallets()

  function getWallets () {
    const walletDiv = document.getElementById('whichWallet')
    walletDiv.appendChild(buildLoadingWallet())

    const values = {}
    values.userId = window.currentUser.financialPortfolioId

    jQuery.ajax({
      url: window._config.api.invokeUrl + WALLET_CONSTANTS.walletUrl,
      beforeSend: function (xhr) {
        xhr.setRequestHeader('Authorization', window.authHeader)
      },
      type: 'POST',
      contentType: 'application/json;charset=UTF-8',
      dataType: 'json',
      data: JSON.stringify(values),
      success: function (wallets) {
        wallets = wallets.Wallet
        window.globalWallet = wallets

        populateAutocompleteCurrency(wallets)
        // Remove Loader
        const removeLoader = document.getElementById('loading-wallet')
        removeLoader.parentNode.removeChild(removeLoader)

        // If there are no wallets then redirect to add wallets automatically.
        if (isEmpty(wallets)) {
          document.getElementById('genericAddFnc').click()
          return
        }

        // Build wallet div
        const walletDiv = document.getElementById('whichWallet')
        const walletFrag = document.createDocumentFragment()
        for (let i = 0, l = wallets.length; i < l; i++) {
          const wallet = wallets[i]
          // If Wallet ID is equal to current user do not populate
          if (isEqual(wallet.walletId, window.currentUser.walletId)) {
            walletFrag.appendChild(buildWalletDiv(wallet, true))
            continue
          }
          walletFrag.appendChild(buildWalletDiv(wallet))
        }
        walletDiv.appendChild(walletFrag)

        // Initialize Tooltip
        activateTooltip()
      },
      error: function (thrownError) {
        if (isEmpty(thrownError) || isEmpty(thrownError.responseJSON)) {
          showNotification(window.translationData.wallet.dynamic.fetcherror, window._constants.notification.error)
        } else if (isNotEmpty(thrownError.message)) {
          showNotification(thrownError.message, window._constants.notification.error)
        } else {
          const responseError = JSON.parse(thrownError.responseJSON)
          if (isNotEmpty(responseError) && isNotEmpty(responseError.error) && responseError.error.includes('Unauthorized')) {
            // If the user is not authorized then redirect to application
            window.location.href = '/'
          }
        }
      }
    })
  }

  function populateAutocompleteCurrency (wallets) {
    const currentCurrenciesDiv = document.getElementById('currentCurrencies')
    while (currentCurrenciesDiv.firstChild) {
      currentCurrenciesDiv.removeChild(currentCurrenciesDiv.firstChild)
    }
    const currentCurrenciesMWDiv = document.getElementById('currentCurrenciesMW')
    while (currentCurrenciesMWDiv.firstChild) {
      currentCurrenciesMWDiv.removeChild(currentCurrenciesMWDiv.firstChild)
    }

    // Collect wallet information
    window.walletCur = []
    for (let i = 0, l = wallets.length; i < l; i++) {
      const wallet = wallets[i]
      walletCur.push(wallet.currency)
    }

    /*
         * If No currency is present then
         */
    if (isEmpty(walletCur)) {
      currentCurrenciesDiv.appendChild(appendNoWallets())
      currentCurrenciesMWDiv.appendChild(appendNoWallets())
    }

    /*
         *	Currency Dropdown Populate
         */

    /* An array containing all the currency names in the world: */
    const currencies = []
    window.cToS = {}
    window.sToC = {}
    const curToSym = window.currencyNameToSymbol.currencyNameToSymbol
    for (let i = 0, l = curToSym.length; i < l; i++) {
      const currency = curToSym[i].currency
      const symbol = curToSym[i].symbol
      cToS[currency] = symbol
      sToC[symbol] = currency
      /* Update the default currency in Settings */
      if (includesStr(walletCur, curToSym[i].currency)) {
        currentCurrenciesDiv.appendChild(dropdownItemsWithWallet(currency))
        currentCurrenciesMWDiv.appendChild(dropdownItemsWithWallet(currency))
      } else {
        currencies.push(currency)
      }
    }

    /*
         * Add Wallet Currency Text
         */
    const currentCurrenyW = document.getElementById('chosenCurrencyW').textContent = window.translationData.wallet.dynamic.choosecurrency

    /* initiate the autocomplete function on the "chosenCurrencyWInp" element, and pass along the countries array as possible autocomplete values: */
    autocomplete(document.getElementById('chosenCurrencyWInp'), currencies, 'chooseCurrencyDD')

    /* initiate the autocomplete function on the "chosenCurrencyWInp" element, and pass along the countries array as possible autocomplete values: */
    autocomplete(document.getElementById('chosenCurrencyWInpMW'), currencies, 'chooseCurrencyDDMW')
  }

  /*
     * If there are no current wallets then show no results
     */
  function appendNoWallets () {
    /* create a DIV element for each matching element: */
    const b = document.createElement('DIV')
    b.classList = 'noResultsDD'
    b.textContent = window.translationData.wallet.dynamic.noactivecurrency
    return b
  }

  // Wallet Div
  function buildWalletDiv (wallet, primaryWallet) {
    const walletDiv = document.createElement('div')
    walletDiv.classList = 'col-4 col-md-4 col-lg-4 text-animation fadeIn suggested-card'
    walletDiv.setAttribute('data-target', wallet.walletId)

    const suggestedAnchor = document.createElement('a')
    suggestedAnchor.classList = 'suggested-anchor p-4'
    suggestedAnchor.href = '#'

    const h2 = document.createElement('h2')
    h2.classList = 'suggested-heading'
    h2.textContent = isEmpty(wallet.wallet_name) ? window.currentUser.name + ' ' + window.currentUser.family_name : wallet.wallet_name
    suggestedAnchor.appendChild(h2)

    const p = document.createElement('h3')
    p.textContent = wallet.currency
    p.classList = 'currency-desc'
    suggestedAnchor.appendChild(p)
    walletDiv.appendChild(suggestedAnchor)

    // Load star icon
    if (primaryWallet) {
      walletDiv.appendChild(loadStarIcon())
    }
    // Load share svg
    walletDiv.appendChild(loadShareSvg())

    // Load Edit Icon
    walletDiv.appendChild(loadEditIcon())

    return walletDiv
  }

  // Load Star ICON
  function loadStarIcon () {
    const currentWalletWrap = document.createElement('div')
    currentWalletWrap.id = 'starredWallet'
    currentWalletWrap.setAttribute('data-toggle', 'tooltip')
    currentWalletWrap.setAttribute('data-placement', 'bottom')
    currentWalletWrap.setAttribute('data-original-title', 'Cuurent Wallet')

    const icons = document.createElement('span')
    icons.classList = 'material-icons favourite-icon'
    icons.textContent = 'star'
    currentWalletWrap.appendChild(icons)

    return currentWalletWrap
  }

  // Load Share Svg
  function loadShareSvg () {
    const shareWalletWrap = document.createElement('div')
    shareWalletWrap.setAttribute('data-toggle', 'tooltip')
    shareWalletWrap.setAttribute('data-placement', 'bottom')
    shareWalletWrap.setAttribute('data-original-title', 'Share Wallet')
    shareWalletWrap.classList = 'share-wallet-wrapper share-icon'

    const svgElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    svgElement.setAttribute('width', '15')
    svgElement.setAttribute('height', '24')
    svgElement.setAttribute('viewBox', '0 0 24 24')

    const pathElement1 = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    pathElement1.setAttribute('d', 'M 18 2 C 16.35499 2 15 3.3549904 15 5 C 15 5.1909529 15.021791 5.3771224 15.056641 5.5585938 L 7.921875 9.7207031 C 7.3985399 9.2778539 6.7320771 9 6 9 C 4.3549904 9 3 10.35499 3 12 C 3 13.64501 4.3549904 15 6 15 C 6.7320771 15 7.3985399 14.722146 7.921875 14.279297 L 15.056641 18.439453 C 15.021555 18.621514 15 18.808386 15 19 C 15 20.64501 16.35499 22 18 22 C 19.64501 22 21 20.64501 21 19 C 21 17.35499 19.64501 16 18 16 C 17.26748 16 16.601593 16.279328 16.078125 16.722656 L 8.9433594 12.558594 C 8.9782095 12.377122 9 12.190953 9 12 C 9 11.809047 8.9782095 11.622878 8.9433594 11.441406 L 16.078125 7.2792969 C 16.60146 7.7221461 17.267923 8 18 8 C 19.64501 8 21 6.6450096 21 5 C 21 3.3549904 19.64501 2 18 2 z M 18 4 C 18.564129 4 19 4.4358706 19 5 C 19 5.5641294 18.564129 6 18 6 C 17.435871 6 17 5.5641294 17 5 C 17 4.4358706 17.435871 4 18 4 z M 6 11 C 6.5641294 11 7 11.435871 7 12 C 7 12.564129 6.5641294 13 6 13 C 5.4358706 13 5 12.564129 5 12 C 5 11.435871 5.4358706 11 6 11 z M 18 18 C 18.564129 18 19 18.435871 19 19 C 19 19.564129 18.564129 20 18 20 C 17.435871 20 17 19.564129 17 19 C 17 18.435871 17.435871 18 18 18 z')
    svgElement.appendChild(pathElement1)

    shareWalletWrap.appendChild(svgElement)

    return shareWalletWrap
  }

  // Load Edit Icon
  function loadEditIcon () {
    const editIconWrap = document.createElement('div')
    editIconWrap.classList = 'd-none edit-wallet'
    editIconWrap.setAttribute('data-toggle', 'tooltip')
    editIconWrap.setAttribute('data-placement', 'bottom')
    editIconWrap.setAttribute('title', 'Edit wallet')

    const svgElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    svgElement.setAttribute('width', '24')
    svgElement.setAttribute('height', '24')
    svgElement.setAttribute('viewBox', '0 0 24 24')

    const pathElement1 = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    pathElement1.setAttribute('d', 'M14.06 9.02l.92.92L5.92 19H5v-.92l9.06-9.06M17.66 3c-.25 0-.51.1-.7.29l-1.83 1.83 3.75 3.75 1.83-1.83c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.2-.2-.45-.29-.71-.29zm-3.6 3.19L3 17.25V21h3.75L17.81 9.94l-3.75-3.75z')
    svgElement.appendChild(pathElement1)
    editIconWrap.appendChild(svgElement)

    return editIconWrap
  }

  // Wallet Div
  function buildLoadingWallet () {
    const walletDiv = document.createElement('div')
    walletDiv.id = 'loading-wallet'
    walletDiv.classList = 'col-4 col-md-4 col-lg-4 text-animation fadeIn suggested-card'

    const suggestedAnchor = document.createElement('div')
    suggestedAnchor.classList = 'suggested-anchor p-4'

    const wSeventy = document.createElement('div')
    wSeventy.classList = 'w-70 animationCard'
    suggestedAnchor.appendChild(wSeventy)

    const wFifty = document.createElement('div')
    wFifty.classList = 'w-50 animationCard'
    suggestedAnchor.appendChild(wFifty)

    const wThrity = document.createElement('p')
    wThrity.classList = 'w-30 animationCard'
    suggestedAnchor.appendChild(wThrity)
    walletDiv.appendChild(suggestedAnchor)

    const wTen = document.createElement('p')
    wTen.classList = 'w-10 animationCard'
    suggestedAnchor.appendChild(wTen)
    walletDiv.appendChild(suggestedAnchor)

    return walletDiv
  }

  // Suggested Cards
  $('body').on('click', '.suggested-anchor', function () {
    const chosenWalletId = this.parentNode.getAttribute('data-target')

    // If Manage Wallet Button is enabled then
    if (window.manageWalletsTriggered) {
      editManageWallets(chosenWalletId)
      return
    }

    window.currentUser.walletId = chosenWalletId

    // Calculate currency
    const wallets = window.globalWallet
    for (let i = 0, len = window.globalWallet.length; i < len; i++) {
      const currentWallet = window.globalWallet[i]
      if (isEqual(window.currentUser.walletId, currentWallet.walletId)) {
        window.currentUser.walletCurrency = cToS[currentWallet.currency]
      }
    }

    localStorage.setItem('currentUserSI', JSON.stringify(window.currentUser))
    // Go to Home Page
    window.location.href = '/'
  })

  /**
     *
     * Modify Wallet
     *
     **/

  // Manage Wallets
  document.getElementById('manageWallets').addEventListener('click', function (e) {
    document.getElementById('doneManage').classList.remove('d-none')
    $('.edit-wallet').removeClass('d-none')
    $('.share-icon').addClass('d-none')
    const starredWallet = document.getElementById('starredWallet')
    if (starredWallet) {
      starredWallet.classList.add('d-none')
    }
    document.getElementById('genericAddFnc').classList.add('d-none')
    this.classList.add('d-none')
    window.manageWalletsTriggered = true
  })

  // Done Manage
  document.getElementById('doneManage').addEventListener('click', function (e) {
    doneManage()
    document.getElementById('genericAddFnc').classList.remove('d-none')
    this.classList.add('d-none')
    window.manageWalletsTriggered = false
  })

  // Done Manage
  function doneManage () {
    const manageWallets = document.getElementById('manageWallets')
    manageWallets.classList.remove('d-none')
    manageWallets.classList.add('d-block')
    $('.edit-wallet').addClass('d-none')
    $('.share-icon').removeClass('d-none')
    const starredWallet = document.getElementById('starredWallet')
    if (starredWallet) {
      starredWallet.classList.remove('d-none')
    }
  }

  $('body').on('click', '.edit-wallet', function () {
    const dataTarget = this.parentNode.getAttribute('data-target')
    if (window.manageWalletsTriggered) {
      editManageWallets(dataTarget)
    }
  })

  // Edit Manage Wallets
  function editManageWallets (dataTarget) {
    // Delete Functionality associate walletId
    chosenWallet = dataTarget

    document.getElementById('manageWallet').classList.remove('d-none')
    document.getElementById('whichWallet').classList.add('d-none')
    document.getElementById('genericAddFnc').classList.add('d-none')
    document.getElementById('doneManage').classList.add('d-none')
    document.body.classList.add('darker')

    // Update data target
    document.getElementById('manageWallet').setAttribute('data-target', dataTarget)

    // Collect wallet information
    let currentWallet = {}
    // If others then show name field
    document.getElementsByClassName('manageNameWrapper')[0].classList.remove('d-none')
    if (window.globalWallet.length > 1) {
      // Show delete wallet option only for non primary wallets
      document.getElementById('deleteWallet').classList.remove('d-none')
    }
    for (let i = 0, l = window.globalWallet.length; i < l; i++) {
      const wallet = window.globalWallet[i]
      if (isEqual(dataTarget, wallet.walletId)) {
        currentWallet = wallet
        break
      }
    }

    // Write the manage wallet name if empty shw the current user name
    const manageWalletName = document.getElementById('manageWalletName')
    manageWalletName.value = isEmpty(currentWallet.wallet_name) ? window.currentUser.name + ' ' + window.currentUser.family_name : currentWallet.wallet_name
    manageWalletName.focus()

    /*
         *	Currency Dropdown Populate (EDIT)
         */
    document.getElementById('chosenCurrencyWMW').textContent = currentWallet.currency
    /*
         * Disable Manage Wallets
         */
    document.getElementById('modifyWallet').setAttribute('disabled', 'disabled')
  }

  // Manage Wallet name
  document.getElementById('manageWalletName').addEventListener('input', function (e) {
    document.getElementById('modifyWallet').removeAttribute('disabled')
  })

  // Modify Wallet
  document.getElementById('modifyWallet').addEventListener('click', function (e) {
    showAllWallets()
    patchWallets()
  })

  // Cancel modification
  document.getElementById('cancelModification').addEventListener('click', function (e) {
    showAllWallets()
  })

  // Show Which Wallets
  function showAllWallets () {
    document.getElementById('manageWallet').classList.add('d-none')
    document.getElementById('whichWallet').classList.remove('d-none')
    document.getElementById('genericAddFnc').classList.remove('d-none')
    document.getElementById('deleteWallet').classList.add('d-none')
    document.getElementById('doneManage').classList.remove('d-none')
    document.body.classList.remove('darker')
  }

  // On click drop down btn of country search
  $('#chosenCurrencyWDropdownMW').on('shown.bs.dropdown', function (event) {
    const currencyInp = document.getElementById('chosenCurrencyWInpMW')
    // Input change focus to the country search bar
    currencyInp.focus()
    // Trigger input event
    const eventInp = new Event('input', {
      bubbles: true,
      cancelable: true
    })

    currencyInp.dispatchEvent(eventInp)
  })

  // On click drop down btn of country search
  $('#chosenCurrencyWDropdownMW').on('hidden.bs.dropdown', function (event) {
    // Input clear value for the country search bar
    document.getElementById('chosenCurrencyWInpMW').value = ''
    // Close all list
    closeAllDDLists(this)
  })

  /**
     *
     * Delete Wallet
     *
     **/

  // Reset Account
  document.getElementById('deleteWallet').addEventListener('click', function (e) {
    // If the manage wallets is not triggered then do not trigger popup
    if (!window.manageWalletsTriggered) {
      return
    }

    Swal.fire({
      title: window.translationData.wallet.dynamic.deletewallet,
      html: resetBBAccount(),
      inputAttributes: {
        autocapitalize: 'on'
      },
      icon: 'info',
      showCancelButton: true,
      showCloseButton: true,
      confirmButtonText: window.translationData.wallet.dynamic.yesdelete,
      cancelButtonText: window.translationData.wallet.dynamic.nodelete,
      confirmButtonClass: 'btn btn-info',
      cancelButtonClass: 'btn btn-secondary',
      buttonsStyling: false,
      showLoaderOnConfirm: true,
      preConfirm: () => {
        return new Promise(function (resolve) {
          const confPasswordUA = document.getElementById('oldPasswordRP')
          // Authentication Details
          const values = {}
          values.username = currentUser.email
          values.password = confPasswordUA.value
          values.checkPassword = true

          // Authenticate Before cahnging password
          $.ajax({
            type: 'POST',
            url: window._config.api.invokeUrl + window._config.api.profile.signin,
            dataType: 'json',
            contentType: 'application/json;charset=UTF-8',
            data: JSON.stringify(values),
            success: function (result) {
              // Hide loading
              Swal.hideLoading()
              // Resolve the promise
              resolve()
            },
            error: function (err) {
              // Error Message
              const errMessage = lastElement(splitElement(err.responseJSON.errorMessage, ':'))
              // Hide loading
              Swal.hideLoading()
              // Show error message
              Swal.showValidationMessage(
                                `${errMessage}`
              )
              // Change Focus to password field
              confPasswordUA.focus()
            }
          })
        })
      },
      allowOutsideClick: () => !Swal.isLoading(),
      closeOnClickOutside: () => !Swal.isLoading()
    }).then(function (result) {
      // Hide the validation message if present
      Swal.resetValidationMessage()
      // If the Reset Button is pressed
      if (result.value) {
        navigateAwayFromManage()

        // Find Item with data target attribute
        const chosenDiv = $('#whichWallet').find('[data-target="' + chosenWallet + '"]')
        chosenDiv.addClass('d-none')

        const values = {}
        values.walletId = chosenWallet
        values.deleteAccount = false
        values.referenceNumber = currentUser.financialPortfolioId

        jQuery.ajax({
          url: window._config.api.invokeUrl + WALLET_CONSTANTS.resetAccountUrl,
          beforeSend: function (xhr) {
            xhr.setRequestHeader('Authorization', authHeader)
          },
          type: 'POST',
          dataType: 'json',
          contentType: 'application/json;charset=UTF-8',
          data: JSON.stringify(values),
          success: function (result) {
            chosenDiv.remove()
            // Chosen Wallet is equal to wallet id
            if (isEqual(chosenWallet, window.currentUser.walletId)) {
              // Reset Current User Wallet ID and CUrreny
              delete window.currentUser.walletId
              delete window.currentUser.walletCurrency
              localStorage.setItem('currentUserSI', JSON.stringify(window.currentUser))
            }

            /*
                         * Remove entry from global wallets
                         */
            for (let i = 0, len = window.globalWallet.length; i < len; i++) {
              const wallet = window.globalWallet[i]
              if (isEqual(wallet.walletId, chosenWallet)) {
                window.globalWallet.splice(i, 1)
                break
              }
            }

            /*
                         * Repopulate the wallet
                         */
            populateAutocompleteCurrency(window.globalWallet)
          },
          error: function (thrownError) {
            manageErrors(thrownError, window.translationData.wallet.dynamic.deleteerror, '')
            chosenDiv.removeClass('d-none')
          }
        })
      }
    })

    // Disable Change Password button
    const resetBBBtn = document.getElementsByClassName('swal2-confirm')[0]
    if (!resetBBBtn.disabled) {
      resetBBBtn.setAttribute('disabled', 'disabled')
    }

    // Change Focus to Confirm Password
    document.getElementById('oldPasswordRP').focus()
  })

  // Navigate away from Manage
  function navigateAwayFromManage () {
    // Show all Wallets
    showAllWallets()
    // Click on the done button
    document.getElementById('doneManage').classList.add('d-none')
    doneManage()
  }

  // Reset BB Account
  function resetBBAccount () {
    const resetPassFrag = document.createDocumentFragment()

    // Warning Text
    const warnDiv = document.createElement('div')
    warnDiv.classList = 'noselect text-left mb-3 fs-90'
    warnDiv.innerHTML = window.translationData.wallet.dynamic.delete.text + '<strong>' + currentUser.email + '</strong>' + window.translationData.wallet.dynamic.delete.text2 + '<strong>' + window.translationData.wallet.dynamic.delete.text3 + '</strong>' + window.translationData.wallet.dynamic.delete.text4
    resetPassFrag.appendChild(warnDiv)

    // UL tag
    const ulWarn = document.createElement('ul')
    ulWarn.classList = 'noselect text-left mb-3 fs-90'

    const liOne = document.createElement('li')
    liOne.textContent = window.translationData.wallet.dynamic.delete.transactions
    ulWarn.appendChild(liOne)

    const liTwo = document.createElement('li')
    liTwo.textContent = window.translationData.wallet.dynamic.delete.budgets
    ulWarn.appendChild(liTwo)

    const liThree = document.createElement('li')
    liThree.textContent = window.translationData.wallet.dynamic.delete.goals
    ulWarn.appendChild(liThree)

    const liFour = document.createElement('li')
    liFour.textContent = window.translationData.wallet.dynamic.delete.bankaccounts
    ulWarn.appendChild(liFour)

    const liSix = document.createElement('li')
    liSix.textContent = window.translationData.wallet.dynamic.delete.investments
    ulWarn.appendChild(liSix)
    resetPassFrag.appendChild(ulWarn)

    // Subscription
    const subsText = document.createElement('div')
    subsText.classList = 'noselect text-left mb-3 fs-90'
    subsText.textContent = window.translationData.wallet.dynamic.delete.premium
    resetPassFrag.appendChild(subsText)

    // Old Password
    const oldPassWrapper = document.createElement('div')
    oldPassWrapper.setAttribute('data-gramm_editor', 'false')
    oldPassWrapper.classList = 'oldPassWrapper text-left'

    const oldPassLabel = document.createElement('label')
    oldPassLabel.textContent = window.translationData.wallet.dynamic.delete.confirmpassword
    oldPassWrapper.appendChild(oldPassLabel)

    const dropdownGroupOP = document.createElement('div')
    dropdownGroupOP.classList = 'btn-group d-md-block d-block'

    const oldPassInput = document.createElement('input')
    oldPassInput.id = 'oldPasswordRP'
    oldPassInput.setAttribute('type', 'password')
    oldPassInput.setAttribute('autocapitalize', 'off')
    oldPassInput.setAttribute('spellcheck', 'false')
    oldPassInput.setAttribute('autocorrect', 'off')
    dropdownGroupOP.appendChild(oldPassInput)

    const dropdownTriggerOP = document.createElement('button')
    dropdownTriggerOP.classList = 'changeDpt btn btn-info'
    dropdownTriggerOP.setAttribute('data-toggle', 'dropdown')
    dropdownTriggerOP.setAttribute('aria-haspopup', 'true')
    dropdownTriggerOP.setAttribute('aria-expanded', 'false')

    const miEye = document.createElement('i')
    miEye.classList = 'material-icons'
    miEye.textContent = 'remove_red_eye'
    dropdownTriggerOP.appendChild(miEye)
    dropdownGroupOP.appendChild(dropdownTriggerOP)
    oldPassWrapper.appendChild(dropdownGroupOP)

    // Error Text
    const errorCPOld = document.createElement('div')
    errorCPOld.id = 'cpErrorDispOldRA'
    errorCPOld.classList = 'text-danger text-left small mb-2 noselect'
    oldPassWrapper.appendChild(errorCPOld)
    resetPassFrag.appendChild(oldPassWrapper)

    return resetPassFrag
  }

  /**
     *
     * Patch Wallets
     *
     **/

  function patchWallets () {
    // Set Param Val combination
    let values = {}
    values.name = document.getElementById('manageWalletName').value
    if (isNotEmpty(chosenCurrencyWMW)) {
      values.currency = chosenCurrencyWMW
    }
    values.walletId = chosenWallet
    values.userId = window.currentUser.financialPortfolioId

    updateRelevantTextInCard(values)
    // Stringify JSON
    values = JSON.stringify(values)

    jQuery.ajax({
      url: window._config.api.invokeUrl + WALLET_CONSTANTS.walletUrl,
      beforeSend: function (xhr) {
        xhr.setRequestHeader('Authorization', window.authHeader)
      },
      type: 'PATCH',
      contentType: 'application/json;charset=UTF-8',
      data: values,
      error: function (thrownError) {
        if (isEmpty(thrownError) || isEmpty(thrownError.responseJSON)) {
          showNotification(window.translationData.wallet.dynamic.patcherror, window._constants.notification.error)
        } else if (isNotEmpty(thrownError.message)) {
          showNotification(thrownError.message, window._constants.notification.error)
        } else {
          const responseError = JSON.parse(thrownError.responseJSON)
          if (isNotEmpty(responseError) && isNotEmpty(responseError.error) && responseError.error.includes('Unauthorized')) {
            // If the user is not authorized then redirect to application
            window.location.href = '/'
          }
        }

        if (isNotEmpty(values.currency)) {
          values.currency = window.oldWalletCurrency
        }
        values.wallet_name = window.oldWalletName
        updateRelevantTextInCard(values)
      }
    })
  }

  // Update Relevant
  function updateRelevantTextInCard (values) {
    if (isNotEmpty(values.currency)) {
      window.oldWalletCurrency = ''
    }
    window.oldWalletName = ''
    // Find Item with data target attribute
    const chosenDiv = $('#whichWallet').find('[data-target="' + values.walletId + '"]')
    if (isNotEmpty(values.name)) {
      // Change name
      chosenDiv.find('.suggested-heading').text(values.name)
    }

    if (isNotEmpty(values.currency)) {
      // Change Currency
      chosenDiv.find('.currency-desc').text(values.currency)
    }

    for (let i = 0, l = window.globalWallet.length; i < l; i++) {
      const wallet = window.globalWallet[i]
      // If Wallet ID is equal to current user
      if (isEqual(values.walletId, wallet.walletId)) {
        window.oldWalletCurrency = wallet.currency
        window.oldWalletName = isEmpty(wallet.wallet_name) ? window.currentUser.name + ' ' + window.currentUser.family_name : wallet.wallet_name
        if (isNotEmpty(values.currency)) {
          wallet.currency = values.currency
        }
        wallet.wallet_name = values.name
        continue
      }
    }
  }
}(jQuery))
