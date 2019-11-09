/*global AWSCogUser _config*/

uh = {
		// Fetch User From Storage
		fetchUserFromLocalStorage() {
			
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
		},

		// Show a login popup if not logged in
		checkIfUserLoggedIn() {
			// Fetch user from local storage
			let userPool = uh.fetchUserFromLocalStorage();
		    let cognitoUser = userPool.getCurrentUser();
		    let sessionValid = false;
		    if (cognitoUser != null) {
		        cognitoUser.getSession(function(err, session) {
		            if (err) {
		            	er.sessionExpiredSwal(true);
		            	return;
		            }
	
		            // Session is valid
		            sessionValid = true;
		        });
		    } else {
		    	er.sessionExpiredSwal(true);
		    }
		    return sessionValid;
		},

		// Signout the user and redirect to home page
		signoutUser(globally) {
			
			// Fetch user from local storage
			let userPool = uh.fetchUserFromLocalStorage();
			let cognitoUser = userPool.getCurrentUser();
			let homepageUrl = 'https://www.blitzbudget.com';
			
			if(cognitoUser != null) {
				// Signout user from cognito
				if(globally) {
					cognitoUser.globalSignout();
				} else {
					cognitoUser.signOut();
				}
			}
			
			// redirect user to home page
			window.location.href = homepageUrl;
		},
		
		// Signout the user and redirect to home page
		signoutGlobally() {
			uh.signoutUser(true);
		},

		// Delete a User
		deleteUser() {
			
			// Fetch user from local storage
			let userPool = uh.fetchUserFromLocalStorage();
			let cognitoUser = userPool.getCurrentUser();
			
			cognitoUser.deleteUser(function(err, result) {
		        if (err) {
		            alert(err);
		            return;
		        }
		        console.log('call result: ' + result);
		    });
		},

		// Forgot Password Flow
		forgotPassword() {
			
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
		},

		// Change Password Flow
		changePassword(oldPassword, newPassword) {
			// TODO Adopt Code
			cognitoUser.changePassword(oldPassword, newPassword, function(err, result) {
		        if (err) {
		            alert(err);
		            return;
		        }
		        console.log('call result: ' + result);
		    });
		},

		// Resend Confirmation Code
		resendConfirmationCode() {
			cognitoUser.resendConfirmationCode(function(err, result) {
		        if (err) {
	            	showNotification(' The following error has encountered: ' + err);
	            	return;
	            } 
	            // TODO Loader replace
		    });
		},

		// Update User Attributes
		updateUserAttributes() {
			// TODO Adopt Code
			let attributeList = [];
			let attribute = {
		        Name : 'nickname',
		        Value : 'joe'
		    };
			attribute = new AmazonCognitoIdentity.CognitoUserAttribute(attribute);
		    attributeList.push(attribute);

		    cognitoUser.updateAttributes(attributeList, function(err, result) {
		        if (err) {
		            alert(err);
		            return;
		        }
		        console.log('call result: ' + result);
		    });
		},

		// Verify an Attribute
		verifyAnAttirbute() {
			// TODO Adopt Code
			cognitoUser.getAttributeVerificationCode('email', {
		        onSuccess: function (result) {
		            console.log('call result: ' + result);
		        },
		        onFailure: function(err) {
		            alert(err);
		        },
		        inputVerificationCode: function() {
		        	let verificationCode = prompt('Please input verification code: ' ,'');
		            cognitoUser.verifyAttribute('email', verificationCode, this);
		        }
			 });
		},

		// Retrieve Attributes
		retrieveAttributes() {
			// Fetch user from local storage
			let userPool = uh.fetchUserFromLocalStorage();
			let cognitoUser = userPool.getCurrentUser();
			
			cognitoUser.getSession(function(err, session) {			
				cognitoUser.getUserAttributes(function(err, result) {
					// ERROR scenarios
			        if (err) {
			        	uh.handleSessionErrors(err,"");
			            return;
			        }
			        // SUCCESS Scenarios
			        for (i = 0; i < result.length; i++) {
			        	let name = result[i].getName();
			        	if(name.includes('custom:')) {
			        		// if custom values then remove custom: 
			        		let elemName = lastElement(splitElement(name,':'));
			        		currentUser[elemName] = result[i].getValue();
			        	} else {
			        		currentUser[name] = result[i].getValue();
			        	}
			        }
			    });
			});
		},

		handleSessionErrors(err,email) {

        	let homepageUrl = 'https://www.blitzbudget.com';
        	
        	/*
        	 * User Does not Exist
        	 */
        	if(stringIncludes(err.code,"UserNotFoundException")) {
        		 let timerInterval;
        		  swal({
        		    title: 'User does not exist!',
        		    icon: 'error',
        		    html: 'You will be redirected to registration page in <strong></strong> seconds.',
        		    timer: 5000,
        		    onOpen: () => {
        		      swal.showLoading()
        		      timerInterval = setInterval(() => {
        		        swal.getContent().querySelector('strong')
        		          .textContent = Math.ceil(swal.getTimerLeft() / 1000)
        		      }, 100)
        		    },
        		    onClose: () => {
        		      clearInterval(timerInterval);
        		      window.location = homepageUrl + "/register";
        		    }
        		  }).then((result) => {
        		    if (
        		      // Read more about handling dismissals
        		      result.dismiss === swal.DismissReason.timer
        		    ) {
        		      console.log('I was closed by the timer');
        		    }
        		  })
        	}
        	
        	/*
        	 * User Not Confirmed
        	 */
        	if(stringIncludes(err.code,"UserNotConfirmedException")) {
        		// Verify Account
        		toggleVerificationOrLogin(email);
        	}
        	
        	/*
        	 * PasswordResetRequiredException
        	 */
        	if(stringIncludes(err.code,"PasswordResetRequiredException")) {
        		// TODO
        	}
		}
}

// Loads the current Logged in User Attributes
uh.retrieveAttributes();

// Display COnfirm Account Verification Code
function toggleVerificationOrLogin(email) {
	let socialLine = document.getElementsByClassName('social-line');
	socialLine[0].classList.toggle('d-none');

	let loginModalTitle = document.getElementById('loginModalTitle');
	loginModalTitle.innerText = 'Email Verification';

	let signinForm = document.getElementById('signinForm');
	signinForm.classList.toggle('d-none');

	let verificationCodeDiv = document.getElementById('verifyForm');
	verificationCodeDiv.classList.toggle('d-none');

	let emailInputVerify = document.getElementById('emailInputVerify');
	emailInputVerify.value = email;

	let forgotPassLogin = document.getElementById('forgotPassLogin');
	forgotPassLogin.classList.toggle('d-none');

	let resendCodeLogin = document.getElementById('resendCodeLogin');
	resendCodeLogin.classList.toggle('d-none');
}
