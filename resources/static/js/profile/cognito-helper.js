"use strict";
/*global AWSCogUser _config*/

// Session invalidated as 0 on start up
window.sessionInvalidated = 0;
// Already requested refresh to false
window.alreadyRequestedRefresh = false;
// Reset the window.afterRefreshAjaxRequests token
window.afterRefreshAjaxRequests = [];

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

        // Authenticate Before cahnging password
        $.ajax({
              type: 'POST',
              url: window._config.api.invokeUrl + window._config.api.refreshToken,
              dataType: 'json',
              contentType: "application/json;charset=UTF-8",
              data : JSON.stringify(values);,
              success: function(result) {
              	// Session Refreshed
				window.sessionInvalidated++;
				window.alreadyRequestedRefresh = false;
				// Set JWT Token For authentication
                let idToken = JSON.stringify(result.AuthenticationResult.AccessToken);
                localStorage.setItem('idToken' , idToken) ;
                window.authHeader = idToken;

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
					          beforeSend: function(xhr){xhr.setRequestHeader("Authorization", idToken);},
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