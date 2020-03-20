"use strict";
(function scopeWrapper($) {
	
	// Ask Us Directly
	document.getElementById("helpCenter").addEventListener("click",function(e){
		// Show Sweet Alert
        Swal.fire({
        	position: 'bottom-right',
            title: 'Help Center',
            html: '',
            inputAttributes: {
                autocapitalize: 'on'
            },
            showCloseButton: true,
            showConfirmButton: false,
            buttonsStyling: false
        }).then(function(result) {
            // If confirm button is clicked
            if (result.value) {
                // send Email
                let email =  document.getElementById('emailIdAUD').value; 
                let message =  document.getElementById('askUsDirectlyText').value;
				sendEmailToSupport(email, message);
            }

        });
	});
}(jQuery));