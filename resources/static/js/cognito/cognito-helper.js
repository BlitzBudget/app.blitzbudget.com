/*global AWSCogUser _config*/

uh = {
		// Fetch User From Storage
		fetchUserFromLocalStorage() {
			var homepageUrl = 'https://www.blitzbudget.com';
			
			// Configure the pool data from the config.js
			var poolData = {
		        UserPoolId: _config.cognito.userPoolId,
		        ClientId: _config.cognito.userPoolClientId
		    };

		    var userPool;

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
			var userPool = uh.fetchUserFromLocalStorage();
		    
		    var cognitoUser = userPool.getCurrentUser();
		    
		    if (cognitoUser != null) {
		        cognitoUser.getSession(function(err, session) {
		            if (err) {
		            	er.sessionExpiredSwal(true);
		            }
		            // Session is valid
		            return true;
		        });
		    } else {
		    	er.sessionExpiredSwal(true);
		    }
		    
		    return false;
		},

		// Signout the user and redirect to home page
		signoutUser(globally) {
			
			// Fetch user from local storage
			var userPool = uh.fetchUserFromLocalStorage();
			var cognitoUser = userPool.getCurrentUser();
			
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

		// Delete a User
		deleteUser() {
			
			// Fetch user from local storage
			var userPool = uh.fetchUserFromLocalStorage();
			var cognitoUser = userPool.getCurrentUser();
			
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
			var userPool = uh.fetchUserFromLocalStorage();
			var cognitoUser = userPool.getCurrentUser();
			
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
			// TODO Adopt Code
			cognitoUser.resendConfirmationCode(function(err, result) {
		        if (err) {
		            alert(err);
		            return;
		           }
		           alert(result);
		    });
		},

		// Update User Attributes
		updateUserAttributes() {
			// TODO Adopt Code
			var attributeList = [];
		    var attribute = {
		        Name : 'nickname',
		        Value : 'joe'
		    };
		    var attribute = new AmazonCognitoIdentity.CognitoUserAttribute(attribute);
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
		            var verificationCode = prompt('Please input verification code: ' ,'');
		            cognitoUser.verifyAttribute('email', verificationCode, this);
		        }
			 });
		},

		// Retrieve Attributes
		retrieveAttributes() {
			// TODO Adopt Code
			cognitoUser.getUserAttributes(function(err, result) {
		        if (err) {
		            alert(err);
		            return;
		        }
		        for (i = 0; i < result.length; i++) {
		            console.log('attribute ' + result[i].getName() + ' has value ' + result[i].getValue());
		        }
		    });
		}
}


