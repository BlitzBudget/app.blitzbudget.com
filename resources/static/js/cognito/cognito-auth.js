"use strict";
/*global AWSCogUser _config AmazonCognitoIdentity AWSCognito*/
var AWSCogUser = window.AWSCogUser || {};

(function scopeWrapper($) {
    let signinUrl = 'login';
    let successfulSigninUrl = 'https://app.blitzbudget.com/home';

    let poolData = {
        UserPoolId: _config.cognito.userPoolId,
        ClientId: _config.cognito.userPoolClientId
    };

    let userPool;

    if (!(_config.cognito.userPoolId &&
          _config.cognito.userPoolClientId &&
          _config.cognito.region)) {
    	showNotification('There is an error configuring the user access. Please contact support!','top','center','danger');
        return;
    }

    userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

    if (typeof AWSCognito !== 'undefined') {
        AWSCognito.config.region = _config.cognito.region;
    }

    AWSCogUser.signOut = function signOut() {
        userPool.getCurrentUser().signOut();
    };

    AWSCogUser.authToken = new Promise(function fetchCurrentAuthToken(resolve, reject) {
        let cognitoUser = userPool.getCurrentUser();

        if (cognitoUser) {
            cognitoUser.getSession(function sessionCallback(err, session) {
                if (err) {
                    reject(err);
                } else if (!session.isValid()) {
                    resolve(null);
                } else {
                    resolve(session.getIdToken().getJwtToken());
                }
            });
        } else {
            resolve(null);
        }
    });

    retrieveAttributes('');

    /**
    * Retrieve Attributes
    **/
    function retrieveAttributes(email) {
        // We retrieve the object again, but in a string form.
        let currentCogUser = sessionStorage.getItem("currentUserSI");
        window.currentUser = isEmpty(currentCogUser) ? {} : JSON.parse(currentCogUser);
        // If the session storage is 
        if(isNotEmpty(currentCogUser)) {
            return;
        }
        // Fetch user from local storage
        let userPool = fetchUserFromLocalStorage();
        let cognitoUser = userPool.getCurrentUser();

        // If User is null
        if (!cognitoUser) {
            er.showLoginPopup();
            return;
        }

        // User Attribute retrieved from cognito
        cognitoUser.getSession(function(err, session) {
            // Error Session
            if (err) {
                er.showLoginPopup();
                return;
            }

            cognitoUser.getUserAttributes(function(err, result) {
                let currentUserLocal = {};

                // ERROR scenarios
                if (err) {
                    handleSessionErrors(err,"","",'errorLoginPopup');
                    return;
                }
                // SUCCESS Scenarios
                for (i = 0; i < result.length; i++) {
                    let name = result[i].getName();

                    if(name.includes('custom:')) {
                        // if custom values then remove custom: 
                        let elemName = lastElement(splitElement(name,':'));
                        currentUserLocal[elemName] = result[i].getValue();
                    } else {
                        currentUserLocal[name] = result[i].getValue();
                    }
                }

                // Current User to global variable
                window.currentUser = currentUserLocal;
                // We save the item in the sessionStorage.
                sessionStorage.setItem("currentUserSI", JSON.stringify(currentUser));

            });
        });
    }

    // Handle Session Errors
    function handleSessionErrors(err,email,pass,errM) {
        
        /*
         * User Does not Exist
         */
        if(stringIncludes(err.code,"UserNotFoundException")) {
            toggleSignUp(email,pass);
            return;
        }
        
        /*
         * User Not Confirmed
         */
        if(stringIncludes(err.code,"UserNotConfirmedException")) {
            // Verify Account
            toggleVerification(email);
            return;
        }
        
        /*
         * PasswordResetRequiredException
         */
        if(stringIncludes(err.code,"PasswordResetRequiredException")) {
            // TODO
        }

        /**
        *   Other Errors
        **/
        document.getElementById(errM).innerText = err.message;
    }


    /*
     * Cognito User Pool functions
     */

    function register(email, password, onSuccess, onFailure) {
    	// Set Email
        var attributeEmail = createAttribute('email', email);
        
        // Set Financial Portfolio Id
        let today = new Date();
        let randomValue = today.getUTCDate().toString() + today.getUTCMonth().toString() + today.getUTCFullYear().toString() + today.getUTCHours().toString() + today.getUTCMinutes().toString() + today.getUTCSeconds().toString() + today.getUTCMilliseconds().toString(); 
        let attributeFPI = createAttribute('custom:financialPortfolioId', randomValue);
        // Set Default Locale
        let attributeLocale = createAttribute('locale', 'en-US');
        // Set Default Currency
        let attributeCurrency = createAttribute('custom:currency', '$');
        // Set Name
        let fullName = fetchFirstElement(splitElement(email, '@'));
        let nameObj = fetchFirstAndFamilyName(fullName);
        let attributeName = createAttribute('name', nameObj.firstName);
        // Set Family Name
        let attributeFamilyName = createAttribute('family_name', nameObj.familyName);
        
        // Append Attributes to list
        var attributeList = [];
        attributeList.push(attributeEmail);
        attributeList.push(attributeFPI);
        attributeList.push(attributeLocale);
        attributeList.push(attributeCurrency);
        attributeList.push(attributeName);
        attributeList.push(attributeFamilyName);

        userPool.signUp(email, password, attributeList, null,
            function signUpCallback(err, result) {
                if (!err) {
                    onSuccess(result);
                } else {
                    onFailure(err);
                }
            }
        );
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
    
    /* 
     * Create Attribute for user
     */
    function createAttribute(nameAttr, valAttr) {
    	let dataAttribute = {
                Name: nameAttr,
                Value: valAttr
        };
    	
        return new AmazonCognitoIdentity.CognitoUserAttribute(dataAttribute);
    }

    function signin(email, password, onSuccess, onFailure) {
        let authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails({
            Username: email,
            Password: password
        });

        // Set Universal Cognito User
        createCognitoUser(email).authenticateUser(authenticationDetails, {
            onSuccess: onSuccess,
            onFailure: onFailure,
            mfaSetup: function(challengeName, challengeParameters) {
                cognitoUser.associateSoftwareToken(this);
            },

            associateSecretCode: function(secretCode) {
                let challengeAnswer = prompt('Please input the TOTP code.', '');
                cognitoUser.verifySoftwareToken(challengeAnswer, 'My TOTP device', this);
            },

            selectMFAType: function(challengeName, challengeParameters) {
                let mfaType = prompt('Please select the MFA method.', ''); // valid values for mfaType is "SMS_MFA", "SOFTWARE_TOKEN_MFA"
                cognitoUser.sendMFASelectionAnswer(mfaType, this);
            },

            totpRequired: function(secretCode) {
                let challengeAnswer = prompt('Please input the TOTP code.', '');
                cognitoUser.sendMFACode(challengeAnswer, this, 'SOFTWARE_TOKEN_MFA');
            },

            mfaRequired: function(codeDeliveryDetails) {
                let verificationCode = prompt('Please input verification code', '');
                cognitoUser.sendMFACode(verificationCode, this);
            },
        });
    }

    function verify(email, code, onSuccess, onFailure) {
        createCognitoUser(email).confirmRegistration(code, true, function confirmCallback(err, result) {
            if (!err) {
                onSuccess(result);
            } else {
                onFailure(err);
            }
        });
    }

    function createCognitoUser(email) {
        return new AmazonCognitoIdentity.CognitoUser({
            Username: email,
            Pool: userPool
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
        let password  = document.getElementById('unlockAppPass').value;
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

                // Set JWT Token For authentication
                let idToken = JSON.stringify(result.idToken.jwtToken);
                idToken = idToken.substring(1, idToken.length -1);
                sessionStorage.setItem('idToken' , idToken) ;
                window.authHeader = idToken;
                
            },
            function signinError(err) {
                unlockLoader.classList.add('d-none');
                unlockApplication.classList.remove('d-none');
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
                retrieveAttributes(email);

                // Hide Modal
                loginModal.modal('hide');
                loginLoader.classList.add('d-none');
                loginButton.classList.remove('d-none');

                // Set JWT Token For authentication
                let idToken = JSON.stringify(result.idToken.jwtToken);
                idToken = idToken.substring(1, idToken.length -1);
                sessionStorage.setItem('idToken' , idToken) ;
                window.authHeader = idToken;
                
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
        verify(email, code,
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
                signin(email, password,
                    function signinSuccess(result) {
                        // Loads the current Logged in User Attributes
                        retrieveAttributes(email);
                       
                        // Set JWT Token For authentication
                        let idToken = JSON.stringify(result.idToken.jwtToken);
                        idToken = idToken.substring(1, idToken.length -1);
                        sessionStorage.setItem('idToken' , idToken) ;
                        window.authHeader = idToken;

                        // Update currency (API Gateway)
                        let xhr = new XMLHttpRequest();
                        xhr.open("POST", _config.api.invokeUrl + "/update-currency");
                        xhr.setRequestHeader("Authorization", idToken);
                        xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
                        xhr.send(JSON.stringify({ "userName" : email}));
                        xhr.onreadystatechange = function () {
                          if(xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
                            let respBody = JSON.parse(xhr.responseText)['body-json'];
                            // Assign current currency and locale based on IP
                            window.currentUser.currency = respBody.currency;
                            window.currentUser.locale = respBody.locale;
                            // We save the item in the sessionStorage.
                            sessionStorage.setItem("currentUserSI", JSON.stringify(window.currentUser));
                          }
                          // Hide Modal
                          loginModal.modal('hide');

                          // Show verification btn
                          verifyLoader.classList.add('d-none');
                          verifyButton.classList.remove('d-none');
                        };
                    },
                    function signinError(err) {
                        // Show verification btn
                        verifyLoader.classList.add('d-none');
                        verifyButton.classList.remove('d-none');

                        // Toggle Sign In
                        toggleLogin(email);

                        handleSessionErrors(err,email,password,'errorLoginPopup');
                    }
                );
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

        createCognitoUser(email).resendConfirmationCode(function(err, result) {
            if (err) {
                errorLP.appendChild(err.message);
                return;
            } 
            // Hide Loader
            resendLoader.classList.add('d-none');
            successLP.appendChild(successSvgMessage());
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
        let cognitoUser = createCognitoUser(emailInputSignin);
        let loginModal = $('#loginModal');
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
        
        cognitoUser.forgotPassword({
            onSuccess: function (result) {
                signin(emailInputSignin, newPassword,
                    function signinSuccess(result) {
                        // Loads the current Logged in User Attributes
                        retrieveAttributes(emailInputSignin);

                        // Hide Modal
                        loginModal.modal('hide');
                        resendloader.classList.add('d-none');
                        forgotPass.classList.remove('d-none');

                        // Set JWT Token For authentication
                        let idToken = JSON.stringify(result.idToken.jwtToken);
                        idToken = idToken.substring(1, idToken.length -1);
                        sessionStorage.setItem('idToken' , idToken) ;
                        window.authHeader = idToken;
                        
                    },
                    function signinError(err) {
                        handleSessionErrors(err,email,password,'errorLoginPopup');
                        resendloader.classList.add('d-none');
                        forgotPass.classList.remove('d-none');
                    }
                );
            },
            onFailure: function(err) {
                document.getElementById('errorLoginPopup').innerText = err.message;
                resendloader.classList.add('d-none');
                forgotPass.classList.remove('d-none');
            },
            inputVerificationCode() {
                // Element inputVerifcicationCode
                let inputVC = this;

                // Show Sweet Alert
                Swal.fire({
                    title: 'Verification Code',
                    html: 'Verification code has been sent to <strong>' + emailInputSignin + '</strong>', 
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
                        let verificationCode = document.getElementsByClassName("swal2-input" )[0];
                        cognitoUser.confirmPassword(verificationCode.value, newPassword, inputVC);
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
            
        // Fetch user from local storage
        let userPool = fetchUserFromLocalStorage();
        let cognitoUser = userPool.getCurrentUser();
        
        if(cognitoUser != null) {
            // Signout user from cognito
            cognitoUser.signOut();
        }
        
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

    // Fetch User From Local Storage 
    function fetchUserFromLocalStorage() {
        
        // Configure the pool data from the config.js
        let poolData = {
            UserPoolId: _config.cognito.userPoolId,
            ClientId: _config.cognito.userPoolClientId
        };

        let userPool;

        // If the config for the cognito is missing
        if (!(_config.cognito.userPoolId &&
              _config.cognito.userPoolClientId &&
              _config.cognito.region)) {
            showNotification('There is an error configuring the user access. Please contact support!','top','center','danger');
            return;
        }
        
        // Get the user pool from Cognito
        userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

        if (typeof AWSCognito !== 'undefined') {
            AWSCognito.config.region = _config.cognito.region;
        }
        
        return userPool;
    }


}(jQuery));
