"use strict";
(function scopeWrapper($) {	
	// Ask Us Directly
	$( 'body' ).on( "click", ".askUsDirectly" ,function() {
		// Show Sweet Alert
        Swal.fire({
        	position: 'bottom-right',
            title: window.translationData.support.askusdirectly.title,
            html: askUsDirectly(this.getAttribute('data-url')),
            inputAttributes: {
                autocapitalize: 'on'
            },
            confirmButtonClass: 'btn btn-info btn-large',
            confirmButtonText: 'Send',
            showCloseButton: true,
            buttonsStyling: false
        }).then(function(result) {
            // If confirm button is clicked
            if (result.value) {
                // send Email
                let email =  window.currentUser.email;
                let message =  document.getElementById('askUsDirectlyText').value;
                let subject = window.translationData.support.askusdirectly.customersupport;
				sendEmailToSupport(email, message, subject);
            }

        });

        // Disable Confirm Password button 
        let confBBBtn = document.getElementsByClassName('swal2-confirm')[0];
        if(!confBBBtn.disabled) {
            confBBBtn.setAttribute('disabled','disabled');
        }

        // CHange Focus to Confirm Password
        document.getElementById('askUsDirectlyText').focus();
	});

	// HTML for ask us directly
	function askUsDirectly(url) {
		let askUsDirectlyDiv = document.createElement('div');
		askUsDirectlyDiv.classList = 'text-center';

		// Error Text
		let errorCPOld = document.createElement('div');
		errorCPOld.id = 'cpErrorDispUA';
		errorCPOld.classList = 'text-danger text-left small mb-2 noselect ml-5';
		askUsDirectlyDiv.appendChild(errorCPOld);

		let messageLabel = document.createElement('label');
		messageLabel.classList = 'labelEmail text-left ml-5';
		messageLabel.textContent = window.translationData.support.askusdirectly.message;
		askUsDirectlyDiv.appendChild(messageLabel);

		let textArea = document.createElement('textarea');
		textArea.id = "askUsDirectlyText";
		textArea.classList = 'askUsDirectlyText';

		if(isNotEmpty(url)) {
			textArea.value = window.translationData.support.askusdirectly.text + url + window.translationData.support.askusdirectly.text2;
		}

		askUsDirectlyDiv.appendChild(textArea);

		// Error Text
		let errorTextArea = document.createElement('div');
		errorTextArea.id = 'textErrorDispUA';
		errorTextArea.classList = 'text-danger text-left small mb-2 noselect ml-5';
		askUsDirectlyDiv.appendChild(errorTextArea);

		return askUsDirectlyDiv;
	}

	// ASk Us Directly test Key Up Listener
	$(document).on('keyup', "#askUsDirectlyText", function(e) {
	
		let sendEmailBtn = document.getElementsByClassName('swal2-confirm')[0];
		let textErrorDispUA = document.getElementById('textErrorDispUA');
		let textAreaEnt = this.value;

		if(isEmpty(textAreaEnt) || textAreaEnt.length < 80) {
			sendEmailBtn.setAttribute('disabled','disabled');
			return;
		}

		textErrorDispUA.textContent = '';
		sendEmailBtn.removeAttribute('disabled');	
	});

	// Ask Us Directly test Focus Out Listener
	$(document).on('focusout', "#askUsDirectlyText", function() {
	
		let sendEmailBtn = document.getElementsByClassName('swal2-confirm')[0];
		let textErrorDispUA = document.getElementById('textErrorDispUA');
		let textAreaEnt = this.value;

		if(isEmpty(textAreaEnt) || textAreaEnt.length < 80) {
			textErrorDispUA.textContent = window.translationData.support.askusdirectly.texterror;
			sendEmailBtn.setAttribute('disabled','disabled');
			return;
		}

		textErrorDispUA.textContent = '';

	});

	// Send Email to BlitzBudget Support
    function sendEmailToSupport(email, message,subject) {

    	let values = JSON.stringify({
    		"email" : email,
    		"message" : message,
    		"subject" : subject
    	});

	 	jQuery.ajax({
			url: window._config.api.invokeUrl + window._config.api.sendEmailUrl,		
	        type: 'POST',
	        contentType:"application/json;charset=UTF-8",
	        data : values,
	        success: function(result) {
	        	Toast.fire({
					icon: 'success',
					title: window.translationData.support.askusdirectly.success
				});
        	},
	        error: function (thrownError) {
	    		Toast.fire({
					icon: 'error',
					title: window.translationData.support.askusdirectly.error
				});
        	}
    	});

    }

}(jQuery));