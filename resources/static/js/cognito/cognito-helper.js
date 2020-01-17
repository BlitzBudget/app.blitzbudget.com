"use strict";
/*global AWSCogUser _config*/
window.sessionInvalidated = 0;

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

	forgetThisDevice() {
		let cognitoUser = userPool.getCurrentUser();
		cognitoUser.forgetDevice({
		    onSuccess: function (result) {
		         console.log('call result: ' + result);
		     },

		     onFailure: function(err) {
		         alert(err);
		     }
		});
	},

	refreshToken(ajaxData) {
		let af = sessionStorage.getItem('afterRefreshAjaxRequests');
		if(isEmpty(af)) {
			let af = [];
			af.push(ajaxData)
			sessionStorage.setItem('afterRefreshAjaxRequests', JSON.stringify(af));
		} else {
			af = JSON.parse(af);
			af.push(ajaxData);
			sessionStorage.setItem('afterRefreshAjaxRequests', JSON.stringify(af));
		}

		// If a refresh was already requested (DO NOTHING)
		if(window.alreadyRequestedRefresh) {
			return;
		}
		window.alreadyRequestedRefresh = true;
		let poolData = {
	        UserPoolId: _config.cognito.userPoolId,
	        ClientId: _config.cognito.userPoolClientId
	    };

	    let userPool;

	    if (!(_config.cognito.userPoolId &&
	          _config.cognito.userPoolClientId &&
	          _config.cognito.region)) {
	    	showNotification('There is an error configuring the user access. Please contact support!','top','center','danger');
	    	er.showLoginPopup();
	        return;
	    }

	    userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

	    if (typeof AWSCognito !== 'undefined') {
	        AWSCognito.config.region = _config.cognito.region;
	    }

	    let cognitoUser = userPool.getCurrentUser();
	    // If cognito user is empty then show login popup
	    if(isEmpty(cognitoUser)) {
	    	er.showLoginPopup();
	    	return;
	    }

	    cognitoUser.getSession((err, session) => {
		    if (isNotEmpty(err)) {
		        showNotification(err.message,'top','center','danger');
		        er.showLoginPopup();
		        return;
		    } else if (isEmpty(session) || !session.isValid() || sessionInvalidated) {
		        showNotification('Session is invalid','top','center','success');
		        er.showLoginPopup();
		    	window.sessionInvalidated = 0;
		    	return;
		    }
	
		    let refresh_token = session.getRefreshToken(); // receive session from calling cognitoUser.getSession()
			cognitoUser.refreshSession(refresh_token, (err, session) => {
				// Session Refreshed
				window.sessionInvalidated++;
				window.alreadyRequestedRefresh = false;
				if (err) {
					showNotification(err.message,'top','center','danger');
					er.showLoginPopup();
				} else {
					// Set JWT Token For authentication
	                let idToken = JSON.stringify(session.idToken.jwtToken);
	                idToken = idToken.substring(1, idToken.length -1);
	                sessionStorage.setItem('idToken' , idToken) ;
	                window.authHeader = idToken;

	                let af = sessionStorage.getItem('afterRefreshAjaxRequests');
	                // If ajax Data is empty then don't do anything
	                if(isEmpty(af)) {
	                	return;
	                }
	                // Parse the stored value
	                af = JSON.parse(af);

	                for(let i = 0, l = af.length; i < l; i++) {
	                	let ajData = af[i];
	                	
	                	// Do the Ajax Call that failed
		                if(ajData.isAjaxReq) {
		                	let ajaxParams = {
						          type: ajData.type,
						          url: ajData.url,
						          beforeSend: function(xhr){xhr.setRequestHeader("Authorization", idToken);},
						  	      error: ajData.onFailure,
						  	      success: ajData.onSuccess
							};

							// Print on success
							console.log('on success - ' + JSON.stringify(ajData));

		                	if(isNotEmpty(ajData.dataType)) {
		                		ajaxParams.dataType =  ajData.dataType;
		                	} 

		                	if(isNotEmpty(ajData.data)) {
		                		ajaxParams.data = ajData.data;
		                	}

		                	if(isNotEmpty(ajData.contentType)) {
								ajaxParams.contentType = ajData.contentType;
		                	}

		                	// AJAX request
		                	$.ajax(ajaxParams);
		                }
	                }
	                // Session storage remove item
	                sessionStorage.removeItem('afterRefreshAjaxRequests');

				}
			});
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