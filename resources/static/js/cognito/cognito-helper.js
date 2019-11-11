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
        signoutUser(true);
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
		        	uh.handleSessionErrors(err,"","");
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

	handleSessionErrors(err,email,pass) {

    	let homepageUrl = 'https://www.blitzbudget.com';
    	
    	/*
    	 * User Does not Exist
    	 */
    	if(stringIncludes(err.code,"UserNotFoundException")) {
    		toggleSignUp(email,pass);
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
	document.getElementsByClassName('social-line')[0].classList.toggle('d-none');

	document.getElementById('loginModalTitle').innerText = 'Email Verification';

	document.getElementById('signinForm').classList.toggle('d-none');

	document.getElementById('verifyForm').classList.toggle('d-none');

	document.getElementById('emailInputVerify').value = email;

	document.getElementById('emailDisplayVE').innerText = email;

	document.getElementById('forgotPassLogin').classList.toggle('d-none');

	document.getElementById('resendCodeLogin').classList.toggle('d-none');
	
	// hide Signup
	document.getElementById('registrationForm').classList.add('d-none');
	
	document.getElementById('emailInputRegister').value = '';
	document.getElementById('passwordInputRegister').value = '';
	
	document.getElementById('successLoginPopup').innerText = '';
	document.getElementById('errorLoginPopup').innerText = '';

	document.getElementById('haveAnAccount').classList.add('d-none');
}

// Toggle Signup
function toggleSignUp(email,pass) {
	// Hide Login and Verify
	document.getElementsByClassName('social-line')[0].classList.remove('d-none');

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
}