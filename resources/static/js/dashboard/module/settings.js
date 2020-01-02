"use strict";

(function scopeWrapper($) {
	// Custom Javascript for dashboard
	const SETTINGS_CONSTANTS = {};

	// SECURITY: Defining Immutable properties as constants
	Object.defineProperties(SETTINGS_CONSTANTS, {
		'listDevices': { value: '/list-devices', writable: false, configurable: false },
		'firstFinancialPortfolioParam': { value: '?financialPortfolioId=', writable: false, configurable: false }
	});

	listRegisteredDevices(this);

	// List Devices on click tab
	document.getElementById('devicesTabLink').addEventListener("click",function(e){
		listRegisteredDevices(this);
	});

	function listRegisteredDevices(currentEl) {
		// If Universal Authenticated User is present (Then fetch the updated devices list)
		if(window.authenticatedUser) {
			window.authenticatedUser.listDevices(null, null, {
			    onSuccess: function (result) {
			        let devices = result.Devices;
			        console.log(devices);
		        	for(let count = 0, length = devices.length; count < length; count++){
		        		devices[i].DeviceAttributes;
		        	}
			     },

			    onFailure: function(err) {
			        showNotification(err.message,'top','center','danger');
			    }
			});	
		} else {
			// Ajax Requests on Error
			let ajaxData = {};
			ajaxData.isAjaxReq = true;
			ajaxData.type = 'GET';
			ajaxData.url = _config.api.invokeUrl + SETTINGS_CONSTANTS.listDevices + SETTINGS_CONSTANTS.firstFinancialPortfolioParam + currentUser.financialPortfolioId;
			ajaxData.onSuccess = function(jsonObj) {
	        	let devices = result.Devices;
			    console.log(devices);
	        }
		    ajaxData.onFailure = function (thrownError) {
           	 	let responseError = JSON.parse(thrownError.responseText);
           	 	if(isNotEmpty(responseError) && isNotEmpty(responseError.error) && responseError.error.includes("Unauthorized")){
            		er.sessionExpiredSwal(ajaxData);
            	} else if (isNotEmpty(thrownError.errorType)) {
            		showNotification("There was an error while retrieving all the registered devices. Please try again later!",'top','center','danger');
            	} else {
            		showNotification(thrownError.message,'top','center','danger');
            	}
            }
    	 	jQuery.ajax({
				url: ajaxData.url,
				beforeSend: function(xhr){xhr.setRequestHeader("Authorization", authHeader);},
		        type: ajaxData.type,
		        success: ajaxData.onSuccess,
		        error: ajaxData.onFailure
        	});
		}
		
	}

	function globalSignout() {
		var params = {
		  AccessToken: window.authHeader /* required */
		};

		window.authenticatedUser.globalSignOut(params, function(err, data) {
		  if (err) showNotification(err.message,'top','center','danger'); // an error occurred
		  else     console.log(data);           // successful response
		});
	}

	function displaylistedDevice() {

	}

}(jQuery));