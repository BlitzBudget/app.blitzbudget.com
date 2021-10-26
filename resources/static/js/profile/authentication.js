'use strict';

(function scopeWrapper ($) {
  // We retrieve the current user, but in a string form.
  const currentCogUser = localStorage.getItem('currentUserSI')
  window.currentUser = isEmpty(currentCogUser) ? {} : JSON.parse(currentCogUser)
  // If the session storage is present then
  if (isNotEmpty(currentCogUser)) {
    // Fill currency and Name
    fillName()
  }

  /**
     * Retrieve Attributes
     **/
  function retrieveAttributes (result, loginModal) {
    // We retrieve the object again, but in a string form.
    const currentCogUser = localStorage.getItem('currentUserSI')
    window.currentUser = isEmpty(currentCogUser) ? {} : JSON.parse(currentCogUser)
    // If the session storage is
    if (isNotEmpty(currentCogUser)) {
      // Fill currency and Name
      fillName()
      return
    }

    // Store Auth Token
    storeAuthToken(result)
    // Store Refresh token
    storeRefreshToken(result)
    // Store Access Token
    storeAccessToken(result)

    const currentUserLocal = {}
    currentUserLocal.email = result.Username
    const firstWallet = result.Wallet
    const userAttributes = result.UserAttributes
    // SUCCESS Scenarios
    for (i = 0; i < userAttributes.length; i++) {
      const name = userAttributes[i].Name

      if (name.includes('custom:')) {
        // if custom values then remove custom:
        const elemName = lastElement(splitElement(name, ':'))
        currentUserLocal[elemName] = userAttributes[i].Value
      } else {
        currentUserLocal[name] = userAttributes[i].Value
      }
    }

    // Current User to global variable
    window.currentUser = currentUserLocal
    // We save the item in the localStorage.
    localStorage.setItem('currentUserSI', JSON.stringify(currentUser))
    if (isNotEmpty(firstWallet)) {
      // Replace with currency
      replaceWithCurrency(firstWallet)
    }
    // Fill currency and Name
    fillName()
    // Read current cookie
    readCurrentCookie()
    // Hide Modal
    if (loginModal) loginModal.modal('hide')
  }

  /**
     * Read current page in cookie
     **/
  function readCurrentCookie () {
    const currentPageInCookie = er.getCookie('currentPage')

    switch (currentPageInCookie) {
      case 'overviewPage':
      default:
        document.getElementById('overviewPage').click()
        break
      case 'transactionsPage':
        document.getElementById(currentPageInCookie).click()
        break
      case 'budgetPage':
        document.getElementById(currentPageInCookie).click()
        break
      case 'settingsPage':
      case 'settingsPgDD':
        document.getElementById('settingsPage').click()
        break
      case 'profilePage':
      case 'profilePgDD':
        document.getElementById('profilePage').click()
        break
    }
  }

  function storeRefreshToken (result) {
    // Set JWT Token For authentication
    let refreshToken = JSON.stringify(result.AuthenticationResult.RefreshToken)
    refreshToken = refreshToken.substring(1, refreshToken.length - 1)
    localStorage.setItem('refreshToken', refreshToken)
    window.refreshToken = refreshToken
  }

  // Fill currency and name
  function fillName () {
    if (currentUser.name) {
      // Set the name of the user
      const userName = document.getElementById('userName')
      if (userName) {
        userName.textContent = window.currentUser.name + ' ' + window.currentUser.family_name
      }
    }
  }

  // Handle Session Errors
  function handleSessionErrors (err, email, pass, errM) {
    /*
         * User Does not Exist
         */
    if (stringIncludes(err.responseJSON.errorMessage, 'UserNotFoundException')) {
      toggleSignUp(email, pass)
      return
    }

    /*
         * User Not Confirmed
         */
    if (stringIncludes(err.responseJSON.errorMessage, 'UserNotConfirmedException')) {
      // Verify Account
      toggleVerification(email)
      return
    }

    /*
         * PasswordResetRequiredException
         */
    if (stringIncludes(err.responseJSON.errorMessage, 'PasswordResetRequiredException')) {
      // TODO
    }

    /**
         *   Other Errors
         **/
    document.getElementById(errM).textContent = lastElement(splitElement(err.responseJSON.errorMessage, ':'))
  }

  /*
     * Cognito User Pool functions
     */

  function register (email, password, onSuccess, onFailure) {
    // Set Name
    const fullName = fetchFirstElement(splitElement(email, '@'))
    const nameObj = fetchFirstAndFamilyName(fullName)

    // Authentication Details
    const values = {}
    values.username = email.toLowerCase()
    values.password = password
    values.firstname = nameObj.firstName
    values.lastname = nameObj.familyName
    values.checkPassword = false

    // Authenticate Before cahnging password
    $.ajax({
      type: 'POST',
      url: window._config.api.invokeUrl + window._config.api.profile.signup,
      dataType: 'json',
      contentType: 'application/json;charset=UTF-8',
      data: JSON.stringify(values),
      success: onSuccess,
      error: onFailure
    })
  }

  // Calculate First Name and Last Name
  function fetchFirstAndFamilyName (fullName) {
    const possibleSym = /[!#$%&'*+-\/=?^_`{|}~]/
    const name = {}
    const matchFound = fullName.match(possibleSym)

    if (isNotEmpty(matchFound)) {
      const nameArr = splitElement(fullName, matchFound)
      let firstName = nameArr[0]
      let familyName = nameArr[1]

      // If First Name is empty then assign family name to first name
      if (isEmpty(firstName)) {
        firstName = familyName
        familyName = nameArr.length > 2 ? nameArr[2] : ' '
      }

      // First Letter Upper case
      firstName = firstName.length > 1 ? firstName.charAt(0).toUpperCase() + firstName.slice(1) : firstName.charAt(0).toUpperCase()
      familyName = isEmpty(familyName) ? ' ' : (familyName.length > 1 ? familyName.charAt(0).toUpperCase() + familyName.slice(1) : familyName.charAt(0).toUpperCase())

      name.firstName = firstName
      name.familyName = familyName
    } else {
      // First Letter Upper case
      fullName = isEmpty(fullName) ? '' : (fullName.length > 1 ? fullName.charAt(0).toUpperCase() + fullName.slice(1) : fullName.charAt(0).toUpperCase())
      name.firstName = fullName
      name.familyName = ' '
    }

    /*
         * Family name
         */
    if (isEmpty(name.familyName)) {
      name.familyName = ' '
    }

    return name
  }

  function signin (email, password, onSuccess, onFailure) {
    // Authentication Details
    const values = {}
    values.username = email.toLowerCase()
    values.password = password
    values.checkPassword = false

    // Authenticate Before cahnging password
    $.ajax({
      type: 'POST',
      url: window._config.api.invokeUrl + window._config.api.profile.signin,
      dataType: 'json',
      contentType: 'application/json;charset=UTF-8',
      data: JSON.stringify(values),
      success: onSuccess,
      error: onFailure
    })
  }

  function verify (email, code, password, onSuccess, onFailure) {
    // Authentication Details
    const values = {}
    values.username = email
    values.password = password
    values.confirmationCode = code
    values.doNotCreateWallet = false

    // Authenticate Before cahnging password
    $.ajax({
      type: 'POST',
      url: window._config.api.invokeUrl + window._config.api.profile.confirmSignup,
      dataType: 'json',
      contentType: 'application/json;charset=UTF-8',
      data: JSON.stringify(values),
      success: onSuccess,
      error: onFailure
    })
  }

  /*
     *  Event Handlers
     */

  $(function onDocReady () {
    $('#signinForm').submit(handleSignin)
    $('#registrationForm').submit(handleRegister)
    $('#verifyForm').submit(handleVerify)
  })

  const unlockAppDiv = document.getElementById('unlockApplication')
  if (isNotEmpty(unlockAppDiv)) {
    unlockAppDiv.addEventListener('click', function (e) {
      const unlockAppPass = document.getElementById('unlockAppPass')
      const password = unlockAppPass.value
      const email = currentUser.email
      const unlockModal = $('#unlockModal')
      const unlockApplication = document.getElementById('unlockApplication')
      const unlockLoader = document.getElementById('unlockLoader')
      unlockLoader.classList.remove('d-none')
      unlockApplication.classList.add('d-none')
      document.getElementById('errorUnlockPopup').textContent = ''
      event.preventDefault()

      signin(email, password,
        function signinSuccess (result) {
          // Hide Modal
          unlockModal.modal('hide')
          unlockLoader.classList.add('d-none')
          unlockApplication.classList.remove('d-none')

          storeAuthToken(result)
          storeRefreshToken(result)
          storeAccessToken(result)

          // Session invalidated as 0 on start up
          window.sessionInvalidated = 0
          // Already requested refresh to false
          window.alreadyRequestedRefresh = false
          // Reset the window.afterRefreshAjaxRequests token
          window.afterRefreshAjaxRequests = []
        },
        function signinError (err) {
          unlockLoader.classList.add('d-none')
          unlockApplication.classList.remove('d-none')
          unlockAppPass.focus()
          handleSessionErrors(err, email, password, 'errorUnlockPopup')
        }
      )
    })
  }

  const unlockAppPass = document.getElementById('unlockAppPass')
  if (isNotEmpty(unlockAppPass)) {
    unlockAppPass.addEventListener('keyup', function (e) {
      const unlockAccountBtn = document.getElementById('unlockApplication')
      const keyCode = e.keyCode || e.which
      if (keyCode === 13) {
        document.activeElement.blur()
        e.preventDefault()
        e.stopPropagation()
        // Click the confirm button to continue
        unlockAccountBtn.click()
        return false
      }
    })
  }

  function handleSignin (event) {
    const email = document.getElementById('emailInputSignin').value
    const password = document.getElementById('passwordInputSignin').value
    const loginLoader = document.getElementById('loginLoader')
    const loginButton = loginLoader.parentElement.firstElementChild
    const loginModal = $('#loginModal')
    document.getElementById('errorLoginPopup').textContent = ''
    event.preventDefault()

    if (isEmpty(email) && isEmpty(password)) {
      document.getElementById('errorLoginPopup').textContent = window.translationData.login.dynamic.emptyallerror
      return
    } else if (isEmpty(email)) {
      document.getElementById('errorLoginPopup').textContent = window.translationData.login.dynamic.emptyemailerror
      return
    } else if (isEmpty(password)) {
      document.getElementById('errorLoginPopup').textContent = window.translationData.login.dynamic.emptypassworderror
      return
    } else if (password.length < 8) {
      document.getElementById('errorLoginPopup').textContent = window.translationData.login.dynamic.passwordlengtherror
      return
    }

    loginLoader.classList.remove('d-none')
    loginButton.classList.add('d-none')
    signin(email, password,
      function signinSuccess (result) {
        // Loads the current Logged in User Attributes
        retrieveAttributes(result, loginModal)

        // Post success message
        loginLoader.classList.add('d-none')
        loginButton.classList.remove('d-none')

        // Remove loggedout user
        localStorage.removeItem('loggedOutUser')
      },
      function signinError (err) {
        loginLoader.classList.add('d-none')
        loginButton.classList.remove('d-none')
        handleSessionErrors(err, email, password, 'errorLoginPopup')
      }
    )
  }

  function handleRegister (event) {
    const email = document.getElementById('emailInputRegister').value
    const password = document.getElementById('passwordInputRegister').value
    const password2 = document.getElementById('password2InputRegister').value
    const signupLoader = document.getElementById('signupLoader')
    const signupButton = signupLoader.parentElement.firstElementChild
    event.preventDefault()

    if (isEmpty(email) && isEmpty(password)) {
      document.getElementById('errorLoginPopup').textContent = window.translationData.login.dynamic.emptyallerror
      return
    } else if (isEmpty(email)) {
      document.getElementById('errorLoginPopup').textContent = window.translationData.login.dynamic.emptyemailerror
      return
    } else if (isEmpty(password)) {
      document.getElementById('errorLoginPopup').textContent = window.translationData.login.dynamic.emptypassworderror
      return
    } else if (password.length < 8) {
      document.getElementById('errorLoginPopup').textContent = window.translationData.login.dynamic.passwordlengtherror
      return
    } else if (password !== password2) {
      document.getElementById('errorLoginPopup').textContent = window.translationData.login.dynamic.passwordnomatcherror
      return
    }

    signupLoader.classList.remove('d-none')
    signupButton.classList.add('d-none')

    const onSuccess = function registerSuccess (result) {
      // Set email field in session storage (EMAIL CLICK FUNC)
      localStorage.setItem('verifyEmail', email)
      // set password for verification
      localStorage.setItem('verifyPass', password)
      signupLoader.classList.add('d-none')
      signupButton.classList.remove('d-none')
      toggleVerification(email)
    }
    const onFailure = function registerFailure (err) {
      signupLoader.classList.add('d-none')
      signupButton.classList.remove('d-none')
      document.getElementById('errorLoginPopup').textContent = lastElement(splitElement(err.responseJSON.errorMessage, ':'))
    }

    if (password === password2) {
      register(email, password, onSuccess, onFailure)
    }
  }

  function handleVerify (event) {
    event.preventDefault()
    verificationCode()
  }

  function verificationCode () {
    const email = document.getElementById('emailInputVerify').value
    const code = document.getElementById('codeInputVerify').value
    let password = document.getElementById('passwordInputSignin').value
    const verifyLoader = document.getElementById('verifyLoader')
    const verifyButton = verifyLoader.parentElement.firstElementChild
    let errorLoginPopup = document.getElementById('errorLoginPopup').textContent

    // Replace HTML with Empty
    while (errorLoginPopup.firstChild) {
      errorLoginPopup.removeChild(errorLoginPopup.firstChild)
    }

    if (isEmpty(code)) {
      errorLoginPopup = window.translationData.profile.dynamic.email.verify.emptyerror
      return
    } else if (code.length !== 6) {
      errorLoginPopup = window.translationData.profile.dynamic.email.verify.lessthansixerror
      return
    }

    // Password empty fetch from localstorage
    if (isEmpty(password)) {
      password = localStorage.getItem('verifyPass')
    }

    // Email empty field
    if (isEmpty(email)) {
      document.getElementById('emailDisplayVE').classList.add('d-none')
      document.getElementById('shyAnchor').classList.add('d-none')
      document.getElementById('emailInputVerify').classList.remove('d-none')
      return
    }

    verifyLoader.classList.remove('d-none')
    verifyButton.classList.add('d-none')
    const loginModal = $('#loginModal')
    verify(email, code, password,
      function verifySuccess (result) {
        // Remove session storage verify email (EMAIL CLICK FUNC)
        localStorage.removeItem('verifyEmail')
        // Remove password field
        localStorage.removeItem('verifyPass')
        // Replace HTML with Empty
        while (errorLoginPopup.firstChild) {
          errorLoginPopup.removeChild(errorLoginPopup.firstChild)
        }
        // Check if email and password is empty
        if (isEmpty(password)) {
          errorLoginPopup.textContent = window.translationData.login.dynamic.emptypassworderror
          // Toggle Sign In
          toggleLogin(email)
          // Do not trigger login
          return
        }
        // Sign in

        // Loads the current Logged in User Attributes
        retrieveAttributes(result, loginModal)

        // Show verification btn
        verifyLoader.classList.add('d-none')
        verifyButton.classList.remove('d-none')
      },
      function verifyError (err) {
        document.getElementById('errorLoginPopup').textContent = lastElement(splitElement(err.responseJSON.errorMessage, ':'))
        verifyLoader.classList.add('d-none')
        verifyButton.classList.remove('d-none')
      }
    )
  }

  // Resend Confirmation Code
  const resendCodeLogin = document.getElementById('resendCodeLogin')
  if (isNotEmpty(resendCodeLogin)) {
    resendCodeLogin.addEventListener('click', function (e) {
      const email = document.getElementById('emailInputVerify').value
      const currenElem = this
      const successLP = document.getElementById('successLoginPopup')
      const errorLP = document.getElementById('errorLoginPopup')
      const resendLoader = document.getElementById('resendLoader')

      // Fadeout for 60 seconds
      currenElem.classList.add('d-none')
      // Append Loader
      resendLoader.classList.remove('d-none')
      // After one minutes show the resend code
      setTimeout(function () {
        // Replace HTML with Empty
        while (successLP.firstChild) {
          successLP.removeChild(successLP.firstChild)
        }
        // Replace HTML with Empty
        while (errorLP.firstChild) {
          errorLP.removeChild(errorLP.firstChild)
        }
        currenElem.classList.remove('d-none')
      }, 60000)

      // Authentication Details
      const values = {}
      values.username = email

      // Resend Confirmation code
      $.ajax({
        type: 'POST',
        url: window._config.api.invokeUrl + window._config.api.profile.resendConfirmationCode,
        dataType: 'json',
        contentType: 'application/json;charset=UTF-8',
        data: JSON.stringify(values),
        success: function (result) {
          // Hide Loader
          resendLoader.classList.add('d-none')
          successLP.appendChild(successSvgMessage())
        },
        error: function (err) {
          errorLP.appendChild(err.message)
        }
      })

      // Change focus to code
      document.getElementById('codeInputVerify').focus()
    })
  }

  // Auto submit verification code
  const codeInputVerify = document.getElementById('codeInputVerify')
  if (isNotEmpty(codeInputVerify)) {
    codeInputVerify.addEventListener('keyup', function (e) {
      const errorLogin = document.getElementById('errorLoginPopup')
      // Replace HTML with Empty
      while (errorLogin.firstChild) {
        errorLogin.removeChild(errorLogin.firstChild)
      }

      const vc = this.value
      if (vc.length == 6) {
        verificationCode()
      }
    })
  }

  // Generate SVG Tick Element and success element
  function successSvgMessage () {
    const alignmentDiv = document.createElement('div')
    alignmentDiv.className = 'row justify-content-center'

    // Parent Div Svg container
    const divSvgContainer = document.createElement('div')
    divSvgContainer.className = 'svg-container'

    // SVG element
    const svgElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    svgElement.setAttribute('class', 'ft-green-tick')
    svgElement.setAttribute('height', '20')
    svgElement.setAttribute('width', '20')
    svgElement.setAttribute('viewBox', '0 0 48 48')
    svgElement.setAttribute('aria-hidden', true)

    const circleElement = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
    circleElement.setAttribute('class', 'circle')
    circleElement.setAttribute('fill', '#5bb543')
    circleElement.setAttribute('cx', '24')
    circleElement.setAttribute('cy', '24')
    circleElement.setAttribute('r', '22')

    const pathElement = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    pathElement.setAttribute('class', 'tick')
    pathElement.setAttribute('fill', 'none')
    pathElement.setAttribute('stroke', '#FFF')
    pathElement.setAttribute('stroke-width', '6')
    pathElement.setAttribute('stroke-linecap', 'round')
    pathElement.setAttribute('stroke-linejoin', 'round')
    pathElement.setAttribute('stroke-miterlimit', '10')
    pathElement.setAttribute('d', 'M14 27l5.917 4.917L34 17')

    svgElement.appendChild(circleElement)
    svgElement.appendChild(pathElement)
    divSvgContainer.appendChild(svgElement)

    alignmentDiv.appendChild(divSvgContainer)

    return alignmentDiv
  }

  // LOGIN POPUP Already have an accout
  const haveAnAccount = document.getElementById('haveAnAccount')
  if (isNotEmpty(haveAnAccount)) {
    haveAnAccount.addEventListener('click', function (e) {
      const email = document.getElementById('emailInputRegister').value
      resetErrorOrSuccessMessages()
      toggleLogin(email)
    })
  }

  // LOGIN POPUP Forgot Password Text
  const forgotPassLogin = document.getElementById('forgotPassLogin')
  if (isNotEmpty(forgotPassLogin)) {
    forgotPassLogin.addEventListener('click', function (e) {
      const resendLoader = document.getElementById('resendLoader')
      resetErrorOrSuccessMessages()
      forgotPassword(this, resendLoader)
    })
  }

  // Change enforece bootstrap focus to empty (Allow swal input to be focusable)
  $.fn.modal.Constructor.prototype._enforceFocus = function () {}

  // Not me link
  const shyAnchor = document.getElementById('shyAnchor')
  if (isNotEmpty(shyAnchor)) {
    shyAnchor.addEventListener('click', function (e) {
      const email = document.getElementById('emailInputRegister').value
      resetErrorOrSuccessMessages()
      toggleLogin(email)
    })
  }

  // Reset Login Popup Error /  Success messages
  function resetErrorOrSuccessMessages () {
    const errorLP = document.getElementById('errorLoginPopup')
    const successLP = document.getElementById('successLoginPopup')
    // Replace HTML with Empty
    while (errorLP.firstChild) {
      errorLP.removeChild(errorLP.firstChild)
    }
    // Replace HTML with Empty
    while (successLP.firstChild) {
      successLP.removeChild(successLP.firstChild)
    }
  }

  // Forgot Password Flow
  function forgotPassword (forgotPass, resendloader) {
    const emailInputSignin = document.getElementById('emailInputSignin').value
    const newPassword = document.getElementById('passwordInputSignin').value

    if (isEmpty(emailInputSignin) && isEmpty(newPassword)) {
      document.getElementById('errorLoginPopup').textContent = window.translationData.login.dynamic.emptyallnewerror
      // Change focus to email
      document.getElementById('emailInputSignin').focus()
      return
    } else if (isEmpty(emailInputSignin)) {
      document.getElementById('errorLoginPopup').textContent = window.translationData.login.dynamic.emptyemailerror
      // Change focus to email
      document.getElementById('emailInputSignin').focus()
      return
    } else if (isEmpty(newPassword)) {
      document.getElementById('errorLoginPopup').textContent = window.translationData.login.dynamic.emptynewpassworderror
      // Change focus to password
      document.getElementById('passwordInputSignin').focus()
      return
    } else if (newPassword.length < 8) {
      document.getElementById('errorLoginPopup').textContent = window.translationData.login.dynamic.newpasswordlengtherror
      // Change focus to password
      document.getElementById('passwordInputSignin').focus()
      return
    }

    // Turn on Loader
    forgotPass.classList.add('d-none')
    resendLoader.classList.remove('d-none')

    // Authentication Details
    const values = {}
    values.username = emailInputSignin

    // Authenticate Before cahnging password
    $.ajax({
      type: 'POST',
      url: window._config.api.invokeUrl + window._config.api.profile.forgotPassword,
      dataType: 'json',
      contentType: 'application/json;charset=UTF-8',
      data: JSON.stringify(values),
      success: function (result) {
        fireConfirmForgotPasswordSwal(emailInputSignin, newPassword, resendloader, forgotPass)
      },
      error: function (err) {
        document.getElementById('errorLoginPopup').textContent = lastElement(splitElement(err.responseJSON.errorMessage, ':'))
        resendloader.classList.add('d-none')
        forgotPass.classList.remove('d-none')
      }
    })
  }

  function fireConfirmForgotPasswordSwal (email, password, resendloader, forgotPass) {
    let confirmationCode
    const loginModal = $('#loginModal')

    // Show Sweet Alert
    Swal.fire({
      title: window.translationData.profile.dynamic.email.verify.title,
      html: window.translationData.profile.dynamic.email.verify.description + '<strong>' + email + '</strong>',
      input: 'text',
      confirmButtonClass: 'btn btn-dynamic-color',
      confirmButtonText: window.translationData.profile.dynamic.email.verify.button,
      showCloseButton: true,
      showCancelButton: false,
      allowEscapeKey: false,
      allowOutsideClick: false,
      closeOnClickOutside: false,
      customClass: {
        input: 'vcClassLP'
      },
      onOpen: (docVC) => {
        $('.swal2-input').keyup(function () {
          // Input Key Up listener
          const inputVal = this.value

          if (inputVal.length == 6) {
            Swal.clickConfirm()
          }
        })
      },
      inputValidator: (value) => {
        if (!value) {
          return window.translationData.profile.dynamic.email.verify.emptyerror
        }

        if (value.length < 6) {
          return window.translationData.profile.dynamic.email.verify.lessthansixerror
        }

        if (isNaN(value)) {
          return window.translationData.profile.dynamic.email.verify.nanerror
        }

        // Set Confirmation code
        confirmationCode = value
      },
      showClass: {
        popup: 'animated fadeInDown faster'
      },
      hideClass: {
        popup: 'animated fadeOutUp faster'
      },
      onClose: () => {
        $('.swal2-input').off('keyup')
      }
    }).then(function (result) {
      if (result.value) {
        // Authentication Details
        const values = {}
        values.username = email
        values.password = password
        values.confirmationCode = confirmationCode

        // Authenticate Before cahnging password
        $.ajax({
          type: 'POST',
          url: window._config.api.invokeUrl + window._config.api.profile.confirmForgotPassword,
          dataType: 'json',
          contentType: 'application/json;charset=UTF-8',
          data: JSON.stringify(values),
          success: function (result) {
            // Loads the current Logged in User Attributes
            retrieveAttributes(result, loginModal)

            // Post success message
            resendloader.classList.add('d-none')
            forgotPass.classList.remove('d-none')
          },
          error: function (err) {
            handleSessionErrors(err, email, password, 'errorLoginPopup')
            resendloader.classList.add('d-none')
            forgotPass.classList.remove('d-none')
          }
        })
      }
    })
  }

  // call this before showing SweetAlert:
  function fixBootstrapModal () {
    const modalNode = document.querySelector('.modal[tabindex="-1"]')
    if (!modalNode) return

    modalNode.removeAttribute('tabindex')
    modalNode.classList.add('js-swal-fixed')
  }

  // call this before hiding SweetAlert (inside done callback):
  function restoreBootstrapModal () {
    const modalNode = document.querySelector('.modal.js-swal-fixed')
    if (!modalNode) return

    modalNode.setAttribute('tabindex', '-1')
    modalNode.classList.remove('js-swal-fixed')
  }

  // Log out User
  const utilLogout = document.getElementById('dashboard-util-logout')
  if (isNotEmpty(utilLogout)) {
    utilLogout.addEventListener('click', function () {
      signoutUser()
    })
  }

  // Log Out User
  const logOutUser = document.getElementById('logoutUser')
  if (isNotEmpty(logOutUser)) {
    logOutUser.addEventListener('click', function () {
      signoutUser()
    })
  }

  // Signout the user and redirect to home page
  function signoutUser () {
    // Clear all local stroage
    localStorage.clear()
    // Set user logged out
    localStorage.setItem('loggedOutUser', 'yes')

    // redirect user to home page
    window.location.href = window._config.home.invokeUrl
  }

  // Display Confirm Account Verification Code
  function toggleVerification (email) {
    document.getElementById('google').classList.add('d-none')
    document.getElementById('facebook').classList.add('d-none')
    document.getElementById('twitter').classList.add('d-none')
    document.getElementById('gmail').classList.remove('d-none')
    document.getElementById('outlook').classList.remove('d-none')

    document.getElementById('loginModalTitle').textContent = window.translationData.common.verify.title

    document.getElementById('signinForm').classList.add('d-none')

    document.getElementById('verifyForm').classList.remove('d-none')

    document.getElementById('emailInputVerify').value = email

    document.getElementById('emailDisplayVE').textContent = email

    document.getElementById('forgotPassLogin').classList.add('d-none')

    document.getElementById('resendCodeLogin').classList.remove('d-none')

    // hide Signup
    document.getElementById('registrationForm').classList.add('d-none')

    document.getElementById('emailInputRegister').value = ''
    document.getElementById('passwordInputRegister').value = ''

    document.getElementById('successLoginPopup').textContent = ''
    document.getElementById('errorLoginPopup').textContent = ''

    document.getElementById('haveAnAccount').classList.add('d-none')

    // CHange focus to verification code
    document.getElementById('codeInputVerify').focus()
  }

  // Toggle Signup
  function toggleSignUp (email, pass) {
    // Hide Login and Verify
    document.getElementById('google').classList.remove('d-none')
    document.getElementById('facebook').classList.remove('d-none')
    document.getElementById('twitter').classList.remove('d-none')
    document.getElementById('gmail').classList.add('d-none')
    document.getElementById('outlook').classList.add('d-none')

    document.getElementById('loginModalTitle').textContent = window.translationData.login.popup.signup

    document.getElementById('signinForm').classList.add('d-none')

    document.getElementById('verifyForm').classList.add('d-none')

    document.getElementById('emailInputVerify').value = ''

    document.getElementById('emailDisplayVE').textContent = ''

    document.getElementById('forgotPassLogin').classList.add('d-none')

    document.getElementById('resendCodeLogin').classList.add('d-none')
    document.getElementById('haveAnAccount').classList.remove('d-none')

    // Show Signup
    document.getElementById('registrationForm').classList.remove('d-none')

    document.getElementById('emailInputRegister').value = email

    document.getElementById('passwordInputRegister').value = pass

    document.getElementById('successLoginPopup').textContent = ''
    document.getElementById('errorLoginPopup').textContent = ''

    // Toggle Focus to confirm password
    document.getElementById('password2InputRegister').focus()
  }
}(jQuery))

/* global AWSCogUser _config */

// Session invalidated as 0 on start up
window.sessionInvalidated = 0
// Already requested refresh to false
window.alreadyRequestedRefresh = false
// Reset the window.afterRefreshAjaxRequests token
window.afterRefreshAjaxRequests = []

function storeAuthToken (result) {
  // Set JWT Token For authentication
  let idToken = JSON.stringify(result.AuthenticationResult.IdToken)
  idToken = idToken.substring(1, idToken.length - 1)
  localStorage.setItem('idToken', idToken)
  window.authHeader = idToken
}

function storeAccessToken (result) {
  // Set JWT Token For authentication
  let accessToken = JSON.stringify(result.AuthenticationResult.AccessToken)
  accessToken = accessToken.substring(1, accessToken.length - 1)
  localStorage.setItem('accessToken', accessToken)
  window.accessToken = accessToken
}

uh = {

  refreshToken (ajaxData) {
    // If window.afterRefreshAjaxRequests is empty then reinitialize it
    if (isEmpty(window.afterRefreshAjaxRequests)) {
      window.afterRefreshAjaxRequests = []
    }

    window.afterRefreshAjaxRequests.push(ajaxData)

    // If a refresh was already requested (DO NOTHING)
    if (window.alreadyRequestedRefresh) {
      return
    }
    window.alreadyRequestedRefresh = true

    // Authentication Details
    const values = {}
    values.refreshToken = window.refreshToken

    /*
         * Max refresh token is 5
         */
    if (window.sessionInvalidated == 2) {
      window.sessionInvalidated = 0
      er.showLoginPopup()
      return
    }

    /*
        * If the current user is empty then show the login popup
        */
    if (er.userDataEmptyShowLoginPopup()) {
      return false
    }

    // Authenticate Before cahnging password
    $.ajax({
      type: 'POST',
      url: window._config.api.invokeUrl + window._config.api.profile.refreshToken,
      dataType: 'json',
      contentType: 'application/json;charset=UTF-8',
      data: JSON.stringify(values),
      success: function (result) {
        // Session Refreshed
        window.sessionInvalidated++
        window.alreadyRequestedRefresh = false

        storeAuthToken(result)
        storeAccessToken(result)

        // If ajax Data is empty then don't do anything
        if (isEmpty(window.afterRefreshAjaxRequests)) {
          return
        }
        const af = window.afterRefreshAjaxRequests

        for (let i = 0, l = af.length; i < l; i++) {
          const ajData = af[i]

          // Do the Ajax Call that failed
          if (ajData.isAjaxReq) {
            const ajaxParams = {
              type: ajData.type,
              url: ajData.url,
              dataType: ajData.dataType,
              data: ajData.data,
              contentType: ajData.contentType,
              success: ajData.onSuccess,
              beforeSend: function (xhr) {
                xhr.setRequestHeader('Authorization', window.authHeader)
              },
              error: ajData.onFailure
            }

            // AJAX request
            $.ajax(ajaxParams)
          }
        }
        // Reset the window.afterRefreshAjaxRequests token
        window.afterRefreshAjaxRequests = []
      },
      error: function (err) {
        // Session Refreshed
        window.sessionInvalidated++
        window.alreadyRequestedRefresh = false
        showNotification(err.message, window._constants.notification.error)
        er.showLoginPopup()
      }
    })
  }
}

// Toggle login
function toggleLogin (email) {
  document.getElementById('google').classList.remove('d-none')
  document.getElementById('facebook').classList.remove('d-none')
  document.getElementById('twitter').classList.remove('d-none')
  document.getElementById('gmail').classList.add('d-none')
  document.getElementById('outlook').classList.add('d-none')

  document.getElementById('loginModalTitle').textContent = isNotEmpty(window.translationData) ? window.translationData.login.popup.header : 'Login'

  document.getElementById('signinForm').classList.remove('d-none')

  document.getElementById('verifyForm').classList.add('d-none')

  if (isNotEmpty(email)) {
    document.getElementById('emailInputVerify').value = email
  }

  document.getElementById('emailDisplayVE').textContent = ''

  document.getElementById('forgotPassLogin').classList.remove('d-none')

  document.getElementById('resendCodeLogin').classList.add('d-none')

  // hide Signup
  document.getElementById('registrationForm').classList.add('d-none')

  document.getElementById('emailInputRegister').value = ''
  document.getElementById('passwordInputRegister').value = ''

  document.getElementById('successLoginPopup').textContent = ''
  document.getElementById('errorLoginPopup').textContent = ''

  document.getElementById('haveAnAccount').classList.add('d-none')

  // Focus to email
  document.getElementById('emailInputSignin').focus()
}
