/*global AWSCogUser _config AmazonCognitoIdentity AWSCognito*/

var AWSCogUser = window.AWSCogUser || {};

(function scopeWrapper($) {
    var signinUrl = 'login';
    var successfulSigninUrl = 'https://app.blitzbudget.com/home';

    var poolData = {
        UserPoolId: _config.cognito.userPoolId,
        ClientId: _config.cognito.userPoolClientId
    };

    var userPool;

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
        var cognitoUser = userPool.getCurrentUser();

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
    	var dataAttribute = {
                Name: nameAttr,
                Value: valAttr
        };
    	
        return new AmazonCognitoIdentity.CognitoUserAttribute(dataAttribute);
    }

    function signin(email, password, onSuccess, onFailure) {
        var authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails({
            Username: email,
            Password: password
        });

        var cognitoUser = createCognitoUser(email);
        cognitoUser.authenticateUser(authenticationDetails, {
            onSuccess: onSuccess,
            onFailure: onFailure
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

    function handleSignin(event) {
        var email = $('#emailInputSignin').val();
        var password = $('#passwordInputSignin').val();
        event.preventDefault();
        signin(email, password,
            function signinSuccess() {
                window.location.href = successfulSigninUrl;
            },
            function signinError(err) {
            	uh.handleSessionErrors(err,email,password);
            }
        );
    }

    function handleRegister(event) {
        var email = $('#emailInputRegister').val();
        var password = $('#passwordInputRegister').val();
        var password2 = $('#password2InputRegister').val();

        var onSuccess = function registerSuccess(result) {
            toggleVerification(email);
        };
        var onFailure = function registerFailure(err) {
        	document.getElementById('errorLoginPopup').innerText = err.message;
        };
        event.preventDefault();

        if (password === password2) {
            register(email, password, onSuccess, onFailure);
        } else {
        	document.getElementById('errorLoginPopup').innerText = 'Passwords do not match';
        }
    }

    function handleVerify(event) {
        var email = $('#emailInputVerify').val();
        var code = $('#codeInputVerify').val();
        let password = document.getElementById('passwordInputSignin').value;
        let verifyLoader = document.getElementById('verifyLoader');
        let verifyButton = document.getElementById('verifyButton');
        verifyLoader.classList.remove('d-none');
        verifyButton.classList.add('d-none');
        event.preventDefault();
        verify(email, code,
            function verifySuccess(result) {
                verifyLoader.classList.add('d-none');
                verifyButton.classList.remove('d-none');
                signin(email, password,
                    function signinSuccess() {
                        // Read Cookies
                        readCookie();
                        // Hide Modal
                        $('#loginModal').modal('hide');
                    },
                    function signinError(err) {
                        uh.handleSessionErrors(err,email,password);
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
        toggleLogin(email);
    });

    // LOGIN POPUP Forgot Password Text
    document.getElementById('forgotPassLogin').addEventListener("click",function(e){
        forgotPassword();
    });

    document.getElementById('shyAnchor').addEventListener("click",function(e){
        let email = document.getElementById('emailInputRegister').value;
        toggleLogin(email);
    });

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
    }

    // Forgot Password Flow
    function forgotPassword() {
        
        // Fetch user from local storage
        let userPool = uh.fetchUserFromLocalStorage();
        let cognitoUser = userPool.getCurrentUser();
        
        // TODO Adopt Code
        cognitoUser.forgotPassword({
            onSuccess: function (result) {
                console.log('call result: ' + result);
            },
            onFailure: function(err) {
                alert(err);
            },
            inputVerificationCode() {
                var verificationCode = prompt('Please input verification code ' ,'');
                var newPassword = prompt('Enter new password ' ,'');
                cognitoUser.confirmPassword(verificationCode, newPassword, this);
            }
         });
    }

}(jQuery));
