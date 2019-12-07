"use strict";

(function scopeWrapper($) {

	displayUserDetailsProfile();

	// Define Cognito User Pool adn Pool data
	let poolData = {
        UserPoolId: _config.cognito.userPoolId,
        ClientId: _config.cognito.userPoolClientId
    };

    let userPool;

    if (!(_config.cognito.userPoolId &&
          _config.cognito.userPoolClientId &&
          _config.cognito.region)) {
    	showNotification('There is an error configuring the user access. Please contact support!','top','center','danger');
        return;
    }

	userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

	/**
	*  Display User Details
	**/
	function displayUserDetailsProfile() {
		// User Name
		let userName = currentUser.name + ' ' + currentUser.family_name;
		document.getElementById('userNameProfileDisplay').innerText = userName;

		// Email
		document.getElementById('emailProfileDisplay').innerText = currentUser.email;

	}

	// Old Password Key Up listener
	$(document).on('keyup', "#oldPasswordCP", function() {
	
		let changePassBtn = document.getElementsByClassName('swal2-confirm')[0];
		let newPassword = document.getElementById("newPassCP").value;
		let oldPassword = this.value;
		let errorCPNew = document.getElementById('cpErrorDispNew');
		let errorCPOld = document.getElementById('cpErrorDispOld');

		if(isEmpty(oldPassword) || oldPassword.length < 8) {
			errorCPNew.innerText = '';
			errorCPOld.innerText = 'The current password field should have a minimum length of 8 characters.';
			return;
		}

		if(isEmpty(newPassword) || newPassword.length < 8) {
			errorCPOld.innerText = '';
			errorCPNew.innerText = 'The new password should have a minimum length of 8 characters.';
			return;
		}

		changePassBtn.removeAttribute('disabled');

	});

	// New Password Key Up listener
	$(document).on('keyup', "#newPassCP", function() {
	
		let changePassBtn = document.getElementsByClassName('swal2-confirm')[0];
		let newPassword = this.value;
		let oldPassword = document.getElementById('oldPasswordCP').value;
		let errorCPNew = document.getElementById('cpErrorDispNew');
		let errorCPOld = document.getElementById('cpErrorDispOld');

		if(isEmpty(newPassword) || newPassword.length < 8) {
			errorCPOld.innerText = '';
			errorCPNew.innerText = 'The new password should have a minimum length of 8 characters.';
			return;
		}

		if(isEmpty(oldPassword) || oldPassword.length < 8) {
			errorCPNew.innerText = '';
			errorCPOld.innerText = 'The current password field should have a minimum length of 8 characters.';
			return;
		}

		changePassBtn.removeAttribute('disabled');

	});	

	function changePasswordFrag() {
		let changePassFrag = document.createDocumentFragment();

		// Old Password
		let oldPassWrapper = document.createElement('div');
		oldPassWrapper.setAttribute('data-gramm_editor',"false");
		oldPassWrapper.classList = 'oldPassWrapper text-left';
		
		let oldPassLabel = document.createElement('label');
		oldPassLabel.innerText = 'Old Password';
		oldPassWrapper.appendChild(oldPassLabel);


		let dropdownGroupOP = document.createElement('div');
		dropdownGroupOP.classList = 'btn-group d-md-block d-lg-block';
		
		let oldPassInput = document.createElement('input');
		oldPassInput.id='oldPasswordCP';
		oldPassInput.setAttribute('type','password');
		oldPassInput.setAttribute('autocapitalize','off');
		oldPassInput.setAttribute('spellcheck','false');
		oldPassInput.setAttribute('autocorrect','off');
		dropdownGroupOP.appendChild(oldPassInput);

		let dropdownTriggerOP = document.createElement('button');
		dropdownTriggerOP.classList = 'changeDpt btn btn-info';
		dropdownTriggerOP.setAttribute('data-toggle' , 'dropdown');
		dropdownTriggerOP.setAttribute('aria-haspopup' , 'true');
		dropdownTriggerOP.setAttribute('aria-expanded' , 'false');

		let miEye = document.createElement('i');
		miEye.classList = 'material-icons';
		miEye.innerText = 'remove_red_eye';
		dropdownTriggerOP.appendChild(miEye);
		dropdownGroupOP.appendChild(dropdownTriggerOP);
		oldPassWrapper.appendChild(dropdownGroupOP);

		// Error Text
		let errorCPOld = document.createElement('div');
		errorCPOld.id = 'cpErrorDispOld';
		errorCPOld.classList = 'text-danger text-left small mb-2 noselect';
		oldPassWrapper.appendChild(errorCPOld);		
		changePassFrag.appendChild(oldPassWrapper);

		// New Password
		let newPassInput = document.createElement('div');
		newPassInput.setAttribute('data-gramm_editor',"false");
		newPassInput.classList = 'newPassInput text-left';
		
		let newPassLabel = document.createElement('label');
		newPassLabel.innerText = 'New Password';
		newPassInput.appendChild(newPassLabel);

		let dropdownGroupNP = document.createElement('div');
		dropdownGroupNP.classList = 'btn-group d-md-block d-lg-block';
		
		let newPassNameInput = document.createElement('input');
		newPassNameInput.id='newPassCP';
		newPassNameInput.setAttribute('type','password');
		newPassNameInput.setAttribute('autocapitalize','off');
		newPassNameInput.setAttribute('spellcheck','false');
		newPassNameInput.setAttribute('autocorrect','off');
		dropdownGroupNP.appendChild(newPassNameInput);

		let dropdownTriggerNP = document.createElement('button');
		dropdownTriggerNP.classList = 'changeDpt btn btn-info';
		dropdownTriggerNP.setAttribute('data-toggle' , 'dropdown');
		dropdownTriggerNP.setAttribute('aria-haspopup' , 'true');
		dropdownTriggerNP.setAttribute('aria-expanded' , 'false');

		let miEyeNP = document.createElement('i');
		miEyeNP.classList = 'material-icons';
		miEyeNP.innerText = 'remove_red_eye';
		dropdownTriggerNP.appendChild(miEyeNP);
		dropdownGroupNP.appendChild(dropdownTriggerNP);
		newPassInput.appendChild(dropdownGroupNP);

		// Error Text
		let errorCP = document.createElement('div');
		errorCP.id = 'cpErrorDispNew';
		errorCP.classList = 'text-danger text-left small mb-2 noselect';
		newPassInput.appendChild(errorCP);		
		changePassFrag.appendChild(newPassInput);

		return changePassFrag;
	}

	 // Change Password Flow
    function changePassword(oldPassword, newPassword) {
        let cognitoUser = userPool.getCurrentUser();

        // Authentication Details
        let authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails({
            Username: currentUser.email,
            Password: oldPassword
        });

        // Authenticate Before cahnging password
        cognitoUser.authenticateUser(authenticationDetails, {
            onSuccess: function signinSuccess(result) {
                // Loads the current Logged in User Attributes
                cognitoUser.changePassword(oldPassword, newPassword, function(err, result) {
		            if (err) {
		                showNotification(err.message,'top','center','danger');
		                return;
		            }
		            showNotification('Successfully changed the password!','top','center','success');
		        });
                
            },
            onFailure: function signinError(err) {
                showNotification(err.message,'top','center','danger');
            }
        });
    }

    /**
    *  Change Password Flow (Profile)
    **/
    document.getElementById('changePasswordProfile').addEventListener("click",function(e){
        // Show Sweet Alert
        Swal.fire({
            title: 'Change Password',
            html: changePasswordFrag(),
            inputAttributes: {
                autocapitalize: 'on'
            },
            confirmButtonClass: 'changePassword btn btn-info',
            confirmButtonText: 'Change Password',
            showCloseButton: true,
            buttonsStyling: false
        }).then(function(result) {
            let newPassword = document.getElementById("newPassCP").value;
            let oldPassword = document.getElementById('oldPasswordCP').value;
            // If confirm button is clicked
            if (result.value) {
                changePassword(oldPassword, newPassword);
            }

        });

        // Disable Change Password button 
        let changePassBtn = document.getElementsByClassName('swal2-confirm')[0];
        if(!changePassBtn.disabled) {
            changePassBtn.setAttribute('disabled','disabled');
        }
    });

	// Change Input to Text
	$(document).on('mouseover', ".changeDpt", function() {		
		let firstChild = this.parentElement.firstChild;
		firstChild.setAttribute('type', 'text');
	});

	// Change it back to password 
	$(document).on('mouseout', ".changeDpt", function() {
		let firstChild = this.parentElement.firstChild;
		firstChild.setAttribute('type', 'password');
	});

	// Reset Account
	document.getElementById('resetBBAccount').addEventListener("click",function(e){
		swal({
                title: 'Reset your Blitz Budget user account',
                html: resetBBAccount(),
	            inputAttributes: {
	                autocapitalize: 'on'
	            },
                type: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, reset it!',
                cancelButtonText: 'No, keep it',
                confirmButtonClass: "btn btn-info",
                cancelButtonClass: "btn btn-secondary",
                buttonsStyling: false,
            }).then(function(result) {
            	 // If the Reset Button is pressed
            	 if (result.value) {

            	 }

            });
	});

	// Delete button
	document.getElementById('deleteBBAccount').addEventListener("click",function(e){
		swal({
                title: 'Delete your Blitz Budget user account',
                html: deleteBBAccount(),
	            inputAttributes: {
	                autocapitalize: 'on'
	            },
                type: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, delete it!',
                cancelButtonText: 'No, keep it',
                confirmButtonClass: "btn btn-info",
                cancelButtonClass: "btn btn-secondary",
                buttonsStyling: false,
            }).then(function(result) {
            	 // If the Reset Button is pressed
            	 if (result.value) {

            	 }

            });
	});
	
	// Reset BB Account
	function resetBBAccount() {
		let resetPassFrag = document.createDocumentFragment();

		// Warning Text
		let warnDiv = document.createElement('div');
		warnDiv.classList = 'noselect'
		warnDiv.innerHTML = 'Do you want to reset your user account <strong>' + currentUser.email + '</strong> and <strong>delete all entries</strong> from Blitz Budget?';
		resetPassFrag.appendChild(warnDiv);

		// Old Password
		let oldPassWrapper = document.createElement('div');
		oldPassWrapper.setAttribute('data-gramm_editor',"false");
		oldPassWrapper.classList = 'oldPassWrapper text-left';
		
		let oldPassLabel = document.createElement('label');
		oldPassLabel.innerText = 'Confirm Password';
		oldPassWrapper.appendChild(oldPassLabel);


		let dropdownGroupOP = document.createElement('div');
		dropdownGroupOP.classList = 'btn-group d-md-block d-lg-block';
		
		let oldPassInput = document.createElement('input');
		oldPassInput.id='oldPasswordRP';
		oldPassInput.setAttribute('type','password');
		oldPassInput.setAttribute('autocapitalize','off');
		oldPassInput.setAttribute('spellcheck','false');
		oldPassInput.setAttribute('autocorrect','off');
		dropdownGroupOP.appendChild(oldPassInput);

		let dropdownTriggerOP = document.createElement('button');
		dropdownTriggerOP.classList = 'changeDpt btn btn-info';
		dropdownTriggerOP.setAttribute('data-toggle' , 'dropdown');
		dropdownTriggerOP.setAttribute('aria-haspopup' , 'true');
		dropdownTriggerOP.setAttribute('aria-expanded' , 'false');

		let miEye = document.createElement('i');
		miEye.classList = 'material-icons';
		miEye.innerText = 'remove_red_eye';
		dropdownTriggerOP.appendChild(miEye);
		dropdownGroupOP.appendChild(dropdownTriggerOP);
		oldPassWrapper.appendChild(dropdownGroupOP);

		// Error Text
		let errorCPOld = document.createElement('div');
		errorCPOld.id = 'cpErrorDispOld';
		errorCPOld.classList = 'text-danger text-left small mb-2 noselect';
		oldPassWrapper.appendChild(errorCPOld);		
		resetPassFrag.appendChild(oldPassWrapper);

		return resetPassFrag;
	}
	
}(jQuery));	