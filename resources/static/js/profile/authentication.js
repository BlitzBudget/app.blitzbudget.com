"use strict";

(function scopeWrapper($) {

    // We retrieve the current user, but in a string form.
    let currentCogUser = localStorage.getItem("currentUserSI");
    window.currentUser = isEmpty(currentCogUser) ? {} : JSON.parse(currentCogUser);
    // If the session storage is present then
    if(isNotEmpty(currentCogUser)) {
        // Fill currency and Name
        fillCurrencyAndName();   
    }

    /**
    * Retrieve Attributes
    **/
    function retrieveAttributes(result,loginModal) {
        // We retrieve the object again, but in a string form.
        let currentCogUser = localStorage.getItem("currentUserSI");
        window.currentUser = isEmpty(currentCogUser) ? {} : JSON.parse(currentCogUser);
        // If the session storage is 
        if(isNotEmpty(currentCogUser)) {
            // Fill currency and Name
            fillCurrencyAndName();           
            return;
        }

        // Store Auth Token
        storeAuthToken(result);
        // Store Refresh token
        storeRefreshToken(result);
        // Store Access Token
        storeAccessToken(result);

        let currentUserLocal = {};
        currentUserLocal.email = result.Username;
        result = result.UserAttributes;
        // SUCCESS Scenarios
        for (i = 0; i < result.length; i++) {
            let name = result[i].Name;

            if(name.includes('custom:')) {
                // if custom values then remove custom: 
                let elemName = lastElement(splitElement(name,':'));
                currentUserLocal[elemName] = result[i].Value;
            } else {
                currentUserLocal[name] = result[i].Value;
            }
        }

        // Set wallet information
        currentUserLocal.walletId = result.Wallet[0].walletId;
        currentUserLocal.walletCurrency = result.Wallet[0].currency;
        // Current User to global variable
        window.currentUser = currentUserLocal;
        // We save the item in the localStorage.
        localStorage.setItem("currentUserSI", JSON.stringify(currentUser));
        // Fill currency and Name
        fillCurrencyAndName();
        // Hide Modal
        if(loginModal) loginModal.modal('hide');
    }

    function storeRefreshToken(result) {
        // Set JWT Token For authentication
        let refreshToken = JSON.stringify(result.AuthenticationResult.RefreshToken);
        refreshToken = refreshToken.substring(1,refreshToken.length - 1);
        localStorage.setItem('refreshToken' , refreshToken) ;
        window.refreshToken = refreshToken;
    }

    function storeAccessToken(result) {
        // Set JWT Token For authentication
        let accessToken = JSON.stringify(result.AuthenticationResult.AccessToken);
        accessToken = accessToken.substring(1,accessToken.length - 1);
        localStorage.setItem('accessToken' , accessToken) ;
        window.accessToken = accessToken;
    }

    // Fill currency and name
    function fillCurrencyAndName() {
        if(currentUser.name) {
            // Set the name of the user
            let userName = document.getElementById('userName');
            if(userName) {
                userName.innerText = window.currentUser.name + ' ' + window.currentUser.family_name;
            }
        }
        // Set Currency If empty
        if(currentUser.currency) {
            window.currentCurrencyPreference = isNotEmpty(window.currentUser.walletCurrency) ? window.currentUser.walletCurrency : window.currentUser.currency;
            Object.freeze(window.currentCurrencyPreference);
            Object.seal(window.currentCurrencyPreference);
            // Replace with currency
            replaceWithCurrency();
        }
    }

    // Handle Session Errors
    function handleSessionErrors(err,email,pass,errM) {

        /*
         * User Does not Exist
         */
        if(stringIncludes(err.responseJSON.errorMessage,"UserNotFoundException")) {
            toggleSignUp(email,pass);
            return;
        }
        
        /*
         * User Not Confirmed
         */
        if(stringIncludes(err.responseJSON.errorMessage,"UserNotConfirmedException")) {
            // Verify Account
            toggleVerification(email);
            return;
        }
        
        /*
         * PasswordResetRequiredException
         */
        if(stringIncludes(err.responseJSON.errorMessage,"PasswordResetRequiredException")) {
            // TODO
        }

        /**
        *   Other Errors
        **/
        document.getElementById(errM).innerText = lastElement(splitElement(err.responseJSON.errorMessage,':'));
    }


    /*
     * Cognito User Pool functions
     */

    function register(email, password, onSuccess, onFailure) {

        // Set Name
        let fullName = fetchFirstElement(splitElement(email, '@'));
        let nameObj = fetchFirstAndFamilyName(fullName);

        // Authentication Details
        let values = {};
        values.username = email;
        values.password = password;
        values.firstname = nameObj.firstName;
        values.lastname = nameObj.familyName;
        values.checkPassword = false;

        // Authenticate Before cahnging password
        $.ajax({
              type: 'POST',
              url: window._config.api.invokeUrl + window._config.api.profile.signup,
              dataType: 'json',
              contentType: "application/json;charset=UTF-8",
              data : JSON.stringify(values),
              success: onSuccess,
              error: onFailure
        });
    }
    
    // Calculate First Name and Last Name
    function fetchFirstAndFamilyName(fullName) {
    	let possibleSym = /[!#$%&'*+-\/=?^_`{|}~]/;
    	let name = {};
        let matchFound = fullName.match(possibleSym);
    	
    	if(isNotEmpty(matchFound)) {
    		let nameArr = splitElement(fullName, matchFound);
            let firstName = nameArr[0];
            let familyName = nameArr[1]

            // If First Name is empty then assign family name to first name
            if(isEmpty(firstName)) {
                firstName = familyName;
                familyName = nameArr.length > 2 ? nameArr[2] : '';
            }

            // First Letter Upper case
            firstName = firstName.length > 1 ? firstName.charAt(0).toUpperCase() + firstName.slice(1) : firstName.charAt(0).toUpperCase();
            familyName = isEmpty(familyName) ? '' : (familyName.length > 1 ? familyName.charAt(0).toUpperCase() + familyName.slice(1) : familyName.charAt(0).toUpperCase());

            name['firstName'] = firstName;
            name['familyName'] = familyName;
     		
    	} else {
            // First Letter Upper case
            fullName = isEmpty(fullName) ? '' : (fullName.length > 1 ? fullName.charAt(0).toUpperCase() + fullName.slice(1) : fullName.charAt(0).toUpperCase());
    		name['firstName'] = fullName;
    		name['familyName'] = '';
    	}
    	
    	return name;
    }
    

    function signin(email, password, onSuccess, onFailure) {

        // Authentication Details
        let values = {};
        values.username = email;
        values.password = password;
        values.checkPassword = false;

        // Authenticate Before cahnging password
        $.ajax({
              type: 'POST',
              url: window._config.api.invokeUrl + window._config.api.profile.signin,
              dataType: 'json',
              contentType: "application/json;charset=UTF-8",
              data : JSON.stringify(values),
              success: onSuccess,
              error: onFailure
        });
    }

    function verify(email, code, password, onSuccess, onFailure) {
        // Authentication Details
        let values = {};
        values.username = email;
        values.password = password;
        values.confirmationCode = code;
        values.doNotCreateWallet = false;

        // Authenticate Before cahnging password
        $.ajax({
              type: 'POST',
              url: window._config.api.invokeUrl + window._config.api.profile.confirmSignup,
              dataType: 'json',
              contentType: "application/json;charset=UTF-8",
              data : JSON.stringify(values),
              success: onSuccess,
              error: onFailure
        });
    }

    
    /*
     *  Event Handlers
     */

    $(function onDocReady() {
        $('#signinForm').submit(handleSignin);
        $('#registrationForm').submit(handleRegister);
        $('#verifyForm').submit(handleVerify);
    });

    document.getElementById('unlockApplication').addEventListener("click",function(e){
        let unlockAppPass = document.getElementById('unlockAppPass');
        let password  = unlockAppPass.value;
        let email = currentUser.email;
        let unlockModal = $('#unlockModal');
        let unlockApplication = document.getElementById('unlockApplication');
        let unlockLoader = document.getElementById('unlockLoader');
        unlockLoader.classList.remove('d-none');
        unlockApplication.classList.add('d-none');
        document.getElementById('errorUnlockPopup').innerText = '';
        event.preventDefault();

        signin(email, password,
            function signinSuccess(result) {
               
                // Hide Modal
                unlockModal.modal('hide');
                unlockLoader.classList.add('d-none');
                unlockApplication.classList.remove('d-none');

                storeAuthToken(result);
                storeRefreshToken(result);
                storeAccessToken(result);

                // Session invalidated as 0 on start up
                window.sessionInvalidated = 0;
                // Already requested refresh to false
                window.alreadyRequestedRefresh = false;
                // Reset the window.afterRefreshAjaxRequests token
                window.afterRefreshAjaxRequests = [];
                
            },
            function signinError(err) {
                unlockLoader.classList.add('d-none');
                unlockApplication.classList.remove('d-none');
                unlockAppPass.focus();
                handleSessionErrors(err,email,password,'errorUnlockPopup');
            }
        );
    });

    document.getElementById('unlockAppPass').addEventListener("keyup",function(e){
        let unlockAccountBtn = document.getElementById('unlockApplication');
        let keyCode = e.keyCode || e.which;
        if (keyCode === 13) { 
            document.activeElement.blur();
            e.preventDefault();
            e.stopPropagation();
            // Click the confirm button to continue
            unlockAccountBtn.click();
            return false;
        }
    });

    function handleSignin(event) {
        let email = document.getElementById('emailInputSignin').value;
        let password = document.getElementById('passwordInputSignin').value;
        let loginLoader = document.getElementById('loginLoader');
        let loginButton = loginLoader.parentElement.firstElementChild;
        let loginModal = $('#loginModal');
        document.getElementById('errorLoginPopup').innerText = '';
        event.preventDefault();

        if(isEmpty(email) && isEmpty(password)) {
            document.getElementById('errorLoginPopup').innerText = 'Email & Password fields cannot be empty';
            return;
        } else if(isEmpty(email)) {
            document.getElementById('errorLoginPopup').innerText = 'Email field cannot be empty';
            return;
        } else if(isEmpty(password)) {
            document.getElementById('errorLoginPopup').innerText = 'Password field cannot be empty';
            return;
        } else if (password.length < 8) {
            document.getElementById('errorLoginPopup').innerText = 'Password should have a minimum length of 8 characters';
            return;
        }

        loginLoader.classList.remove('d-none');
        loginButton.classList.add('d-none');
        signin(email, password,
            function signinSuccess(result) {
                // Loads the current Logged in User Attributes
                retrieveAttributes(result,loginModal);

                // Post success message
                loginLoader.classList.add('d-none');
                loginButton.classList.remove('d-none');

                // Remove loggedout user
                localStorage.removeItem('loggedOutUser');
                
            },
            function signinError(err) {
                loginLoader.classList.add('d-none');
                loginButton.classList.remove('d-none');
            	handleSessionErrors(err,email,password,'errorLoginPopup');
            }
        );
    }

    function handleRegister(event) {
        let email = document.getElementById('emailInputRegister').value;
        let password = document.getElementById('passwordInputRegister').value;
        let password2 = document.getElementById('password2InputRegister').value;
        let signupLoader = document.getElementById('signupLoader');
        let signupButton = signupLoader.parentElement.firstElementChild;
        event.preventDefault();

        if(isEmpty(email) && isEmpty(password)) {
            document.getElementById('errorLoginPopup').innerText = 'Email & Password fields cannot be empty';
            return;
        } else if(isEmpty(email)) {
            document.getElementById('errorLoginPopup').innerText = 'Email field cannot be empty';
            return;
        } else if(isEmpty(password)) {
            document.getElementById('errorLoginPopup').innerText = 'Password field cannot be empty';
            return;
        } else if (password.length < 8) {
            document.getElementById('errorLoginPopup').innerText = 'Password should have a minimum length of 8 characters';
            return;
        } else if (password !== password2) {
            document.getElementById('errorLoginPopup').innerText = 'Passwords do not match';
            return;
        }

        signupLoader.classList.remove('d-none');
        signupButton.classList.add('d-none');
       
        let onSuccess = function registerSuccess(result) {
            // Set email field in session storage (EMAIL CLICK FUNC)
            localStorage.setItem('verifyEmail', email);
            // set password for verification
            localStorage.setItem('verifyPass', password);
            signupLoader.classList.add('d-none');
            signupButton.classList.remove('d-none');
            toggleVerification(email);

        };
        let onFailure = function registerFailure(err) {
            signupLoader.classList.add('d-none');
            signupButton.classList.remove('d-none');
        	document.getElementById('errorLoginPopup').innerText = err.message;
        };

        if (password === password2) {
            register(email, password, onSuccess, onFailure);
        } 
    }

    function handleVerify(event) {
        event.preventDefault();
        verificationCode();
    }

    function verificationCode() {
        var email = document.getElementById('emailInputVerify').value;
        var code = document.getElementById('codeInputVerify').value;
        let password = document.getElementById('passwordInputSignin').value;
        let verifyLoader = document.getElementById('verifyLoader');
        let verifyButton = verifyLoader.parentElement.firstElementChild;
        let errorLoginPopup = document.getElementById('errorLoginPopup').innerText;
        
        // Replace HTML with Empty
        while (errorLoginPopup.firstChild) {
            errorLoginPopup.removeChild(errorLoginPopup.firstChild);
        }
        
        if(isEmpty(code)) {
            errorLoginPopup = 'Verification code cannot be empty';
            return;
        } else if (code.length !== 6) {
            errorLoginPopup = 'Verification code must be 6 characters long';
            return;
        }

        // Password empty fetch from localstorage
        if(isEmpty(password)) {
            password = localStorage.getItem('verifyPass');
        }

        // Email empty field
        if(isEmpty(email)) {
            document.getElementById('emailDisplayVE').classList.add('d-none');
            document.getElementById('shyAnchor').classList.add('d-none');
            document.getElementById('emailInputVerify').classList.remove('d-none');
            return;
        }

        verifyLoader.classList.remove('d-none');
        verifyButton.classList.add('d-none');
        let loginModal = $('#loginModal');
        verify(email, code, password,
            function verifySuccess(result) {
                // Remove session storage verify email (EMAIL CLICK FUNC)
                localStorage.removeItem('verifyEmail');
                // Remove password field
                localStorage.removeItem('verifyPass');
                // Replace HTML with Empty
                while (errorLoginPopup.firstChild) {
                    errorLoginPopup.removeChild(errorLoginPopup.firstChild);
                }
                // Check if email and password is empty
                if(isEmpty(password)) {
                    errorLoginPopup.innerText = 'Password field cannot be empty';
                    // Toggle Sign In
                    toggleLogin(email);
                    // Do not trigger login
                    return;
                }
                // Sign in
                
                // Loads the current Logged in User Attributes
                retrieveAttributes(result, loginModal);

                // Show verification btn
                verifyLoader.classList.add('d-none');
                verifyButton.classList.remove('d-none');
            },
            function verifyError(err) {
                document.getElementById('errorLoginPopup').innerText = err.message;
                verifyLoader.classList.add('d-none');
                verifyButton.classList.remove('d-none');
            }
        );
    }

    // Resend Confirmation Code
    document.getElementById('resendCodeLogin').addEventListener("click",function(e){
        let email = document.getElementById('emailInputVerify').value;
        let currenElem = this;
        let successLP = document.getElementById('successLoginPopup');
        let errorLP = document.getElementById('errorLoginPopup');
        let resendLoader = document.getElementById('resendLoader');

        // Fadeout for 60 seconds
        currenElem.classList.add('d-none');
        // Append Loader
        resendLoader.classList.remove('d-none');
        // After one minutes show the resend code
        setTimeout(function() {
            // Replace HTML with Empty
            while (successLP.firstChild) {
                successLP.removeChild(successLP.firstChild);
            }
            // Replace HTML with Empty
            while (errorLP.firstChild) {
                errorLP.removeChild(errorLP.firstChild);
            }
        	currenElem.classList.remove('d-none');
        }, 60000);


        // Authentication Details
        let values = {};
        values.username = email;

        // Resend Confirmation code
        $.ajax({
              type: 'POST',
              url: window._config.api.invokeUrl + window._config.api.profile.resendConfirmationCode,
              dataType: 'json',
              contentType: "application/json;charset=UTF-8",
              data : JSON.stringify(values),
              success: function(result) {
                // Hide Loader
                resendLoader.classList.add('d-none');
                successLP.appendChild(successSvgMessage());
              },
              error: function(err) {
                errorLP.appendChild(err.message);
              }
        });

        // Change focus to code
        document.getElementById('codeInputVerify').focus();
    });

    // Auto submit verification code
    document.getElementById('codeInputVerify').addEventListener("keyup", function(e){
        let errorLogin = document.getElementById('errorLoginPopup');
        // Replace HTML with Empty
        while (errorLogin.firstChild) {
            errorLogin.removeChild(errorLogin.firstChild);
        }

        let vc = this.value;
        if(vc.length == 6) {
            verificationCode();
        }
    });

    // Generate SVG Tick Element and success element
    function successSvgMessage() {
        let alignmentDiv = document.createElement('div');
        alignmentDiv.className = 'row justify-content-center';
        
        // Parent Div Svg container
        let divSvgContainer = document.createElement('div');
        divSvgContainer.className = 'svg-container';
        
        
        // SVG element
        let svgElement = document.createElementNS("http://www.w3.org/2000/svg", 'svg');
        svgElement.setAttribute('class','ft-green-tick');
        svgElement.setAttribute('height','20');
        svgElement.setAttribute('width','20');
        svgElement.setAttribute('viewBox','0 0 48 48');
        svgElement.setAttribute('aria-hidden',true);
        
        let circleElement = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circleElement.setAttribute('class','circle');
        circleElement.setAttribute('fill','#5bb543');
        circleElement.setAttribute('cx','24');
        circleElement.setAttribute('cy','24');
        circleElement.setAttribute('r','22');
        
        let pathElement = document.createElementNS("http://www.w3.org/2000/svg", 'path');
        pathElement.setAttribute('class','tick');
        pathElement.setAttribute('fill','none');
        pathElement.setAttribute('stroke','#FFF');
        pathElement.setAttribute('stroke-width','6');
        pathElement.setAttribute('stroke-linecap','round');
        pathElement.setAttribute('stroke-linejoin','round');
        pathElement.setAttribute('stroke-miterlimit','10');
        pathElement.setAttribute('d','M14 27l5.917 4.917L34 17');
        
        svgElement.appendChild(circleElement);
        svgElement.appendChild(pathElement);
        divSvgContainer.appendChild(svgElement);
        
        alignmentDiv.appendChild(divSvgContainer);
            
        return alignmentDiv;
    }

    // LOGIN POPUP Already have an accout
    document.getElementById('haveAnAccount').addEventListener("click",function(e){
        let email = document.getElementById('emailInputRegister').value;
        resetErrorOrSuccessMessages();
        toggleLogin(email);
    });

    // LOGIN POPUP Forgot Password Text
    document.getElementById('forgotPassLogin').addEventListener("click",function(e){
        let resendLoader = document.getElementById('resendLoader');
        resetErrorOrSuccessMessages();
        forgotPassword(this, resendLoader);
    });

    // Change enforece bootstrap focus to empty (Allow swal input to be focusable)
    $.fn.modal.Constructor.prototype._enforceFocus = function() {};

    // Not me link 
    document.getElementById('shyAnchor').addEventListener("click",function(e){
        let email = document.getElementById('emailInputRegister').value;
        resetErrorOrSuccessMessages();
        toggleLogin(email);
    });

    // Reset Login Popup Error /  Success messages
    function resetErrorOrSuccessMessages() {
        let errorLP = document.getElementById('errorLoginPopup');
        let successLP = document.getElementById('successLoginPopup');
        // Replace HTML with Empty
        while (errorLP.firstChild) {
            errorLP.removeChild(errorLP.firstChild);
        }
        // Replace HTML with Empty
        while (successLP.firstChild) {
            successLP.removeChild(successLP.firstChild);
        }
    }

    // Forgot Password Flow
    function forgotPassword(forgotPass, resendloader) {
        
        let emailInputSignin = document.getElementById('emailInputSignin').value;
        let newPassword = document.getElementById('passwordInputSignin').value;

        if(isEmpty(emailInputSignin) && isEmpty(newPassword)) {
            document.getElementById('errorLoginPopup').innerText = 'Email & Password fields cannot be empty, Enter the new password in the password field';
            // Change focus to email
            document.getElementById('emailInputSignin').focus();
            return;
        } else if(isEmpty(emailInputSignin)) {
            document.getElementById('errorLoginPopup').innerText = 'Email field cannot be empty';
            // Change focus to email
            document.getElementById('emailInputSignin').focus();
            return;
        } else if(isEmpty(newPassword)) {
            document.getElementById('errorLoginPopup').innerText = 'Enter the new password in the password field';
            // Change focus to password
            document.getElementById('passwordInputSignin').focus();
            return;
        } else if (newPassword.length < 8) {
            document.getElementById('errorLoginPopup').innerText = 'The new password should have a minimum length of 8 characters';
            // Change focus to password
            document.getElementById('passwordInputSignin').focus();
            return;
        }

        // Turn on Loader
        forgotPass.classList.add('d-none');
        resendLoader.classList.remove('d-none');


        // Authentication Details
        let values = {};
        values.username = emailInputSignin;

        // Authenticate Before cahnging password
        $.ajax({
              type: 'POST',
              url: window._config.api.invokeUrl + window._config.api.profile.forgotPassword,
              dataType: 'json',
              contentType: "application/json;charset=UTF-8",
              data : JSON.stringify(values),
              success: function(result) {
                fireConfirmForgotPasswordSwal(emailInputSignin, newPassword);
              },
              error: function(err) {
                document.getElementById('errorLoginPopup').innerText = err.message;
                resendloader.classList.add('d-none');
                forgotPass.classList.remove('d-none');
              }
        });
    }

    function fireConfirmForgotPasswordSwal(email, password) {
        let confirmationCode;
        let loginModal = $('#loginModal');

        // Show Sweet Alert
        Swal.fire({
            title: 'Verification Code',
            html: 'Verification code has been sent to <strong>' + email + '</strong>', 
            input: 'text',
            confirmButtonClass: 'btn btn-dynamic-color',
            confirmButtonText: 'Verify Email',
            showCloseButton: true,
            showCancelButton: false,
            allowEscapeKey: false,
            allowOutsideClick: false,
            closeOnClickOutside: false,
            customClass: {
                input: 'vcClassLP'
            },
            onOpen: (docVC) => {
                $( ".swal2-input" ).keyup(function() {
                    // Input Key Up listener
                    let inputVal = this.value;

                    if(inputVal.length == 6) {
                        Swal.clickConfirm();
                    }

                });
            },
            inputValidator: (value) => {
                if (!value) {
                  return 'Verification code cannot be empty'
                }

                if(value.length < 6) {
                    return 'Verification code should be 6 characters in length';
                }

                if(isNaN(value)) {
                    return 'Verification code can only contain numbers';
                }

                // Set Confirmation code
                confirmationCode = value;
            },
            showClass: {
               popup: 'animated fadeInDown faster'
            },
            hideClass: {
               popup: 'animated fadeOutUp faster'
            },
            onClose: () => {
                $( ".swal2-input" ).off('keyup');
            }
        }).then(function(result) {
            if(result.value) {

                // Authentication Details
                let values = {};
                values.username = email;
                values.password = password;
                values.confirmationCode = confirmationCode;

                // Authenticate Before cahnging password
                $.ajax({
                      type: 'POST',
                      url: window._config.api.invokeUrl + window._config.api.profile.confirmForgotPassword,
                      dataType: 'json',
                      contentType: "application/json;charset=UTF-8",
                      data : JSON.stringify(values),
                      success: function(result) {
                        // Loads the current Logged in User Attributes
                        retrieveAttributes(result, loginModal);

                        // Post success message
                        document.getElementById('successLoginPopup').innerText = 'Successfully logged you in! Preparing the application with your data.';
                        resendloader.classList.add('d-none');
                        forgotPass.classList.remove('d-none');

                      },
                      error: function(err) {
                        handleSessionErrors(err,email,password,'errorLoginPopup');
                        resendloader.classList.add('d-none');
                        forgotPass.classList.remove('d-none');
                      }
                });
                
            }
        });
        
    }

    // call this before showing SweetAlert:
    function fixBootstrapModal() {
      var modalNode = document.querySelector('.modal[tabindex="-1"]');
      if (!modalNode) return;

      modalNode.removeAttribute('tabindex');
      modalNode.classList.add('js-swal-fixed');
    }

    // call this before hiding SweetAlert (inside done callback):
    function restoreBootstrapModal() {
      var modalNode = document.querySelector('.modal.js-swal-fixed');
      if (!modalNode) return;

      modalNode.setAttribute('tabindex', '-1');
      modalNode.classList.remove('js-swal-fixed');
    }


    // Log out User
    document.getElementById('dashboard-util-logout').addEventListener('click', function() {
        signoutUser();
    });

    // Log Out User
    document.getElementById('logoutUser').addEventListener('click', function() {
        signoutUser();
    });

    // Signout the user and redirect to home page
    function signoutUser() {

        // Clear all local stroage
        localStorage.clear();
        // Set user logged out
        localStorage.setItem('loggedOutUser', 'yes');
        
        // redirect user to home page
        window.location.href = window._config.home.invokeUrl;
    }


    // Display Confirm Account Verification Code
    function toggleVerification(email) {
        document.getElementById('google').classList.add('d-none');
        document.getElementById('facebook').classList.add('d-none');
        document.getElementById('twitter').classList.add('d-none');
        document.getElementById('gmail').classList.remove('d-none');
        document.getElementById('outlook').classList.remove('d-none');

        document.getElementById('loginModalTitle').innerText = 'Email Verification';

        document.getElementById('signinForm').classList.add('d-none');

        document.getElementById('verifyForm').classList.remove('d-none');

        document.getElementById('emailInputVerify').value = email;

        document.getElementById('emailDisplayVE').innerText = email;

        document.getElementById('forgotPassLogin').classList.add('d-none');

        document.getElementById('resendCodeLogin').classList.remove('d-none');
        
        // hide Signup
        document.getElementById('registrationForm').classList.add('d-none');
        
        document.getElementById('emailInputRegister').value = '';
        document.getElementById('passwordInputRegister').value = '';
        
        document.getElementById('successLoginPopup').innerText = '';
        document.getElementById('errorLoginPopup').innerText = '';

        document.getElementById('haveAnAccount').classList.add('d-none');

        // CHange focus to verification code
        document.getElementById('codeInputVerify').focus();

    }

    // Toggle Signup
    function toggleSignUp(email,pass) {
        // Hide Login and Verify
        document.getElementById('google').classList.remove('d-none');
        document.getElementById('facebook').classList.remove('d-none');
        document.getElementById('twitter').classList.remove('d-none');
        document.getElementById('gmail').classList.add('d-none');
        document.getElementById('outlook').classList.add('d-none');

        document.getElementById('loginModalTitle').innerText = 'Sign Up';

        document.getElementById('signinForm').classList.add('d-none');

        document.getElementById('verifyForm').classList.add('d-none');

        document.getElementById('emailInputVerify').value = '';

        document.getElementById('emailDisplayVE').innerText = '';

        document.getElementById('forgotPassLogin').classList.add('d-none');

        document.getElementById('resendCodeLogin').classList.add('d-none');
        document.getElementById('haveAnAccount').classList.remove('d-none');
        
        // Show Signup
        document.getElementById('registrationForm').classList.remove('d-none');
        
        document.getElementById('emailInputRegister').value = email;
        
        document.getElementById('passwordInputRegister').value = pass;
        
        document.getElementById('successLoginPopup').innerText = '';
        document.getElementById('errorLoginPopup').innerText = '';

        // Toggle Focus to confirm password
        document.getElementById('password2InputRegister').focus();
    }


}(jQuery));

/*global AWSCogUser _config*/

// Session invalidated as 0 on start up
window.sessionInvalidated = 0;
// Already requested refresh to false
window.alreadyRequestedRefresh = false;
// Reset the window.afterRefreshAjaxRequests token
window.afterRefreshAjaxRequests = [];

function storeAuthToken(result) {
    // Set JWT Token For authentication
    let idToken = JSON.stringify(result.AuthenticationResult.IdToken);
    idToken = idToken.substring(1,idToken.length - 1);
    localStorage.setItem('idToken' , idToken) ;
    window.authHeader = idToken;
}

uh = {
    
    refreshToken(ajaxData) {
        
        // If window.afterRefreshAjaxRequests is empty then reinitialize it
        if(isEmpty(window.afterRefreshAjaxRequests)) {
            window.afterRefreshAjaxRequests = [];
        }

        window.afterRefreshAjaxRequests.push(ajaxData);

        // If a refresh was already requested (DO NOTHING)
        if(window.alreadyRequestedRefresh) {
            return;
        }
        window.alreadyRequestedRefresh = true;
        
        // Authentication Details
        let values = {};
        values.refreshToken = window.refreshToken;

        /*
        * Max refresh token is 5
        */
        if(window.sessionInvalidated == 2) {
            window.sessionInvalidated = 0;
            er.showLoginPopup();
            return;
        }

        // Authenticate Before cahnging password
        $.ajax({
              type: 'POST',
              url: window._config.api.invokeUrl + window._config.api.profile.refreshToken,
              dataType: 'json',
              contentType: "application/json;charset=UTF-8",
              data : JSON.stringify(values),
              success: function(result) {
                // Session Refreshed
                window.sessionInvalidated++;
                window.alreadyRequestedRefresh = false;

                storeAuthToken(result);
                storeAccessToken(result);

                // If ajax Data is empty then don't do anything
                if(isEmpty(window.afterRefreshAjaxRequests)) {
                    return;
                }
                let af = window.afterRefreshAjaxRequests;

                for(let i = 0, l = af.length; i < l; i++) {
                    let ajData = af[i];
                    
                    // Do the Ajax Call that failed
                    if(ajData.isAjaxReq) {
                        let ajaxParams = {
                              type: ajData.type,
                              url: ajData.url,
                              beforeSend: function(xhr){xhr.setRequestHeader("Authorization", window.authHeader);},
                              error: ajData.onFailure
                        };

                        if(isNotEmpty(ajData.dataType)) {
                            ajaxParams.dataType =  ajData.dataType;
                        } 

                        if(isNotEmpty(ajData.data)) {
                            ajaxParams.data = ajData.data;
                        }

                        if(isNotEmpty(ajData.contentType)) {
                            ajaxParams.contentType = ajData.contentType;
                        }

                        if(isNotEmpty(ajData.onSuccess)) {
                            ajaxParams.success = ajData.onSuccess;
                        }

                        // AJAX request
                        $.ajax(ajaxParams);
                    }
                }
                // Reset the window.afterRefreshAjaxRequests token
                window.afterRefreshAjaxRequests = [];
              },
              error: function(err) {
                // Session Refreshed
                window.sessionInvalidated++;
                window.alreadyRequestedRefresh = false;
                showNotification(err.message,window._constants.notification.error);
                er.showLoginPopup();
              }
        });
    }
}

// Toggle login
function toggleLogin(email) {
    document.getElementById('google').classList.remove('d-none');
    document.getElementById('facebook').classList.remove('d-none');
    document.getElementById('twitter').classList.remove('d-none');
    document.getElementById('gmail').classList.add('d-none');
    document.getElementById('outlook').classList.add('d-none');

    document.getElementById('loginModalTitle').innerText = 'Login';

    document.getElementById('signinForm').classList.remove('d-none');

    document.getElementById('verifyForm').classList.add('d-none');

    if(isNotEmpty(email)) {
        document.getElementById('emailInputVerify').value = email;
    }

    document.getElementById('emailDisplayVE').innerText = '';

    document.getElementById('forgotPassLogin').classList.remove('d-none');

    document.getElementById('resendCodeLogin').classList.add('d-none');
    
    // hide Signup
    document.getElementById('registrationForm').classList.add('d-none');
    
    document.getElementById('emailInputRegister').value = '';
    document.getElementById('passwordInputRegister').value = '';
    
    document.getElementById('successLoginPopup').innerText = '';
    document.getElementById('errorLoginPopup').innerText = '';

    document.getElementById('haveAnAccount').classList.add('d-none');

    // Focus to email
    document.getElementById('emailInputSignin').focus();
}
