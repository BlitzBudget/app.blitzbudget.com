"use strict";
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