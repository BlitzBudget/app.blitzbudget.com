"use strict";

(function scopeWrapper($) {
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

}(jQuery));