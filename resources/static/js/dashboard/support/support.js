"use strict";
(function scopeWrapper($) {	

	// Show help center
	$('.main-panel').on('click', '.helpCenter' , function(e) {
		// Show Sweet Alert
        Swal.fire({
        	position: 'bottom-right',
            title: 'HelpCenter',
            html: loadHelpCenter(),
            customClass: {
            	popup: 'help-center-popup',
            	content: 'help-center-content'
            },
            inputAttributes: {
                autocapitalize: 'on'
            },
            showCloseButton: true,
            showConfirmButton: false,
            buttonsStyling: false
        });
	});

	// Load Help center
	function loadHelpCenter() {

	}

}(jQuery));