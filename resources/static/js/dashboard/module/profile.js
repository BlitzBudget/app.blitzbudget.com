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
			changePassBtn.setAttribute('disabled','disabled');
			return;
		}

		if(isEmpty(oldPassword) || oldPassword.length < 8) {
			errorCPNew.innerText = '';
			errorCPOld.innerText = 'The current password field should have a minimum length of 8 characters.';
			changePassBtn.setAttribute('disabled','disabled');
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
                type: 'info',
                showCancelButton: true,
                showCloseButton: true,
                confirmButtonText: 'Yes, reset it!',
                cancelButtonText: 'No, keep it',
                confirmButtonClass: "btn btn-info",
                cancelButtonClass: "btn btn-secondary",
                buttonsStyling: false,
            }).then(function(result) {
            	 // If the Reset Button is pressed
            	 if (result.value) {
            	 	// TODO
            	 }

            });

			// Disable Change Password button 
	        let resetBBBtn = document.getElementsByClassName('swal2-confirm')[0];
	        if(!resetBBBtn.disabled) {
	            resetBBBtn.setAttribute('disabled','disabled');
	        }            
	});

	// Delete button
	document.getElementById('deleteBBAccount').addEventListener("click",function(e){
		swal({
                title: 'Delete your Blitz Budget user account',
                html: deleteBBAccount(),
	            inputAttributes: {
	                autocapitalize: 'on'
	            },
                type: 'info',
                showCancelButton: true,
                showCloseButton: true,
                confirmButtonText: 'Yes, delete it!',
                cancelButtonText: 'No, keep it',
                confirmButtonClass: "btn btn-info",
                cancelButtonClass: "btn btn-secondary",
                buttonsStyling: false,
            }).then(function(result) {
            	 // If the Reset Button is pressed
            	 if (result.value) {
            	 	// TODO
            	 }

            });

            // Disable Change Password button 
	        let deleteBBBtn = document.getElementsByClassName('swal2-confirm')[0];
	        if(!deleteBBBtn.disabled) {
	            deleteBBBtn.setAttribute('disabled','disabled');
	        }   
	});
	
	// Reset BB Account
	function resetBBAccount() {
		let resetPassFrag = document.createDocumentFragment();

		// Warning Text
		let warnDiv = document.createElement('div');
		warnDiv.classList = 'noselect text-left mb-3 fs-90';
		warnDiv.innerHTML = 'Do you want to reset your user account <strong>' + currentUser.email + '</strong> and <strong>delete all entries</strong> from Blitz Budget?';
		resetPassFrag.appendChild(warnDiv);

		// UL tag
		let ulWarn = document.createElement('ul');
		ulWarn.classList = 'noselect text-left mb-3 fs-90';

		let liOne = document.createElement('li');
		liOne.innerText = 'all transactions will be deleted';
		ulWarn.appendChild(liOne);

		let liTwo = document.createElement('li');
		liTwo.innerText = 'all the budgets will be deleted';
		ulWarn.appendChild(liTwo);

		let liThree = document.createElement('li');
		liThree.innerText = 'all goals will be deleted';
		ulWarn.appendChild(liThree);

		let liFour = document.createElement('li');
		liFour.innerText = 'all financial accounts will be deleted';
		ulWarn.appendChild(liFour);

		let liFive = document.createElement('li');
		liFive.innerText = 'all wallets will be deleted';
		ulWarn.appendChild(liFive);

		let liSix = document.createElement('li');
		liSix.innerText = 'all investments will be deleted';
		ulWarn.appendChild(liSix);
		resetPassFrag.appendChild(ulWarn);

		// Subscription
		let subsText = document.createElement('div');
		subsText.classList = 'noselect text-left mb-3 fs-90';
		subsText.innerText = 'Premium subscription will remain intact after the reset.';
		resetPassFrag.appendChild(subsText);

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
		errorCPOld.id = 'cpErrorDispOldRA';
		errorCPOld.classList = 'text-danger text-left small mb-2 noselect';
		oldPassWrapper.appendChild(errorCPOld);		
		resetPassFrag.appendChild(oldPassWrapper);

		return resetPassFrag;
	}

	// New Password Key Up listener For Reset Password
	$(document).on('keyup', "#oldPasswordRP", function() {
	
		let resetAccountBtn = document.getElementsByClassName('swal2-confirm')[0];
		let errorDispRA = document.getElementById('cpErrorDispOldRA');
		let passwordEnt = this.value;

		if(isEmpty(passwordEnt) || passwordEnt.length < 8) {
			resetAccountBtn.setAttribute('disabled','disabled');			
			return;
		}

		errorDispRA.innerText = '';
		resetAccountBtn.removeAttribute('disabled');
	});

	// On focus out Listener for Reset password
	$(document).on('focusout', "#oldPasswordRP", function() {
	
		let resetAccountBtn = document.getElementsByClassName('swal2-confirm')[0];
		let errorDispRA = document.getElementById('cpErrorDispOldRA');
		let passwordEnt = this.value;

		if(isEmpty(passwordEnt) || passwordEnt.length < 8) {
			errorDispRA.innerText = 'The confirm password field should have a minimum length of 8 characters.';
			resetAccountBtn.setAttribute('disabled','disabled');
			return;
		}

		errorDispRA.innerText = '';

	});
	
	// Delete BB Account
	function deleteBBAccount() {
		let deletePassFrag = document.createDocumentFragment();

		// Warning Text
		let warnDiv = document.createElement('div');
		warnDiv.classList = 'noselect text-left mb-3 fs-90';
		warnDiv.innerHTML = 'Do you want to delete your user account <strong>' + currentUser.email + '</strong> and <strong>delete all data</strong> from Blitz Budget?';
		deletePassFrag.appendChild(warnDiv);

		// UL tag
		let ulWarn = document.createElement('ul');
		ulWarn.classList = 'noselect text-left mb-3 fs-90';

		let liOne = document.createElement('li');
		liOne.innerHTML = 'all your data, <strong>Everything!</strong> will be deleted';
		ulWarn.appendChild(liOne);

		let liTwo = document.createElement('li');
		liTwo.innerText = "premium subscription will be terminated";
		ulWarn.appendChild(liTwo);

		let liThree = document.createElement('li');
		liThree.innerText = 'your Blitz Budget user account will be deleted';
		ulWarn.appendChild(liThree);
		deletePassFrag.appendChild(ulWarn);

		// Subscription
		let subsText = document.createElement('div');
		subsText.classList = 'noselect text-left mb-3 fs-90';
		subsText.innerText = 'Consider exporting your data!';
		deletePassFrag.appendChild(subsText);

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
		oldPassInput.id='oldPasswordDA';
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
		errorCPOld.id = 'cpErrorDispOldDA';
		errorCPOld.classList = 'text-danger text-left small mb-2 noselect';
		oldPassWrapper.appendChild(errorCPOld);		
		deletePassFrag.appendChild(oldPassWrapper);

		return deletePassFrag;
	}

	// Confirm Password Key Up listener For Delete User
	$(document).on('keyup', "#oldPasswordDA", function() {
	
		let deleteAccountBtn = document.getElementsByClassName('swal2-confirm')[0];
		let errorDispRA = document.getElementById('cpErrorDispOldDA');
		let passwordEnt = this.value;

		if(isEmpty(passwordEnt) || passwordEnt.length < 8) {
			deleteAccountBtn.setAttribute('disabled','disabled');
			return;
		}

		errorDispRA.innerText = '';
		deleteAccountBtn.removeAttribute('disabled');
	});

	// Confirm Password Focus Out listener For Delete User
	$(document).on('focusout', "#oldPasswordDA", function() {
	
		let deleteAccountBtn = document.getElementsByClassName('swal2-confirm')[0];
		let errorDispRA = document.getElementById('cpErrorDispOldDA');
		let passwordEnt = this.value;

		if(isEmpty(passwordEnt) || passwordEnt.length < 8) {
			errorDispRA.innerText = 'The confirm password field should have a minimum length of 8 characters.';
			deleteAccountBtn.setAttribute('disabled','disabled');
			return;
		}

		errorDispRA.innerText = '';

	});

	// Change User Name
	document.getElementById('userNameEdit').addEventListener("click",function(e){
		// Hide the Element
		this.classList.add('d-none');
		// Name
		let userNameProfileDisplay = document.getElementById('userNameProfileDisplay').classList;
		userNameProfileDisplay.add('d-none');
		// Change the User Name
		let userNameModInp = document.getElementById('userNameModInp');
		userNameModInp.value = currentUser.name + ' ' + currentUser.family_name;
		// Display Edit Form
		let userNameEditProf = document.getElementById('userNameEditProf');
		userNameEditProf.classList.remove('d-none');
		userNameEditProf.classList.add('d-block');
	});

	// Click Enter to Change Name and Last Name
	document.getElementById('userNameModInp').addEventListener("keyup",function(e){
		let keyCode = e.keyCode || e.which;
		if (keyCode === 13) { 
			document.activeElement.blur();
		    e.preventDefault();
		    e.stopPropagation();
		    // Click the confirm button to continue
		    document.getElementById('userNameEdiBtn').click();
		    return false;
		}
	});

	// User Edit Complete Btn
	document.getElementById('userNameEdiBtn').addEventListener("click",function(e){
		editUserDetailsFNAndLN();
	});

	function editUserDetailsFNAndLN() {
		// Name
		let userNameProfileDisplay = document.getElementById('userNameProfileDisplay').classList;
		userNameProfileDisplay.remove('d-none');
		
		// Display Edit Form
		let userNameEditProf = document.getElementById('userNameEditProf');
		userNameEditProf.classList.remove('d-block');
		userNameEditProf.classList.add('d-none');

		// Edit Button 
		let userNameEdit = document.getElementById('userNameEdit');
		userNameEdit.classList.remove('d-none');

		// Update First Name and Last Name
		let userNameModInp = document.getElementById('userNameModInp').value;
		let userNameLis = splitElement(userNameModInp,' ');

		if(userNameLis.length < 1) {
			showNotification('First name and last name cannot be empty','top','center','danger');
			return;
		}

		let firstName = userNameLis[0];
		let lastName = userNameLis.length > 1 ? userNameLis[1] : '';

		 // Show Sweet Alert
        Swal.fire({
            title: 'Confirm Password',
            html: confirmPasswordFrag(),
            inputAttributes: {
                autocapitalize: 'on'
            },
            confirmButtonClass: 'btn btn-info',
            confirmButtonText: 'Confirm Password',
            showCloseButton: true,
            buttonsStyling: false
        }).then(function(result) {
            let confPasswordUA = document.getElementById('confPasswordUA').value;
            // If confirm button is clicked
            if (result.value) {
                // Update User Name 
				updateUserName(firstName, lastName, confPasswordUA);
            }

        });

        // Disable Confirm Password button 
        let confBBBtn = document.getElementsByClassName('swal2-confirm')[0];
        if(!confBBBtn.disabled) {
            confBBBtn.setAttribute('disabled','disabled');
        }  
	}

	function confirmPasswordFrag() {
		let confPassFrag = document.createDocumentFragment();

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
		oldPassInput.id='confPasswordUA';
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
		errorCPOld.id = 'cpErrorDispUA';
		errorCPOld.classList = 'text-danger text-left small mb-2 noselect';
		oldPassWrapper.appendChild(errorCPOld);		
		confPassFrag.appendChild(oldPassWrapper);

		return confPassFrag;
	}


	 // Update User Attribute
    function updateUserName(firstName, lastName, confPasswordUA) {
        let cognitoUser = userPool.getCurrentUser();

        // FirstName
		let attributeList = [];
		let attributeFN = {
	        Name : 'name',
	        Value : firstName
	    };
		attributeFN = new AmazonCognitoIdentity.CognitoUserAttribute(attributeFN);
	    attributeList.push(attributeFN);

	    // SurName
	    let attributeLN = {
	        Name : 'family_name',
	        Value : lastName
	    };
		attributeLN = new AmazonCognitoIdentity.CognitoUserAttribute(attributeLN);
	    attributeList.push(attributeLN);


	     // Authentication Details
	    let authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails({
            Username: currentUser.email,
            Password: confPasswordUA
        });

        // Authenticate Before cahnging password
        cognitoUser.authenticateUser(authenticationDetails, {
            onSuccess: function signinSuccess(result) {
                 // Update Attribute
			    cognitoUser.updateAttributes(attributeList, function(err, result) {
			        if (err) {
			            showNotification(err.message,'top','center','danger');
			            return;
			        }
			        document.getElementById('userNameProfileDisplay').innerText = firstName + ' ' + lastName;
			        // Update User Cache
			        currentUser.name = firstName;
			        currentUser.family_name = lastName;
			        showNotification('Successfully changed the password!','top','center','success');
			    });
                
            },
            onFailure: function signinError(err) {
                showNotification(err.message,'top','center','danger');
            }
        });
    }

    // Confirm Password Key Up listener For Update User Attributes
	$(document).on('keyup', "#confPasswordUA", function(e) {
	
		let confirmPassBtn = document.getElementsByClassName('swal2-confirm')[0];
		let cpErrorDispUA = document.getElementById('cpErrorDispUA');
		let passwordEnt = this.value;

		if(isEmpty(passwordEnt) || passwordEnt.length < 8) {
			confirmPassBtn.setAttribute('disabled','disabled');
			return;
		}

		let keyCode = e.keyCode || e.which;
		if (keyCode === 13) { 
			document.activeElement.blur();
		    e.preventDefault();
		    e.stopPropagation();
		    // Click the confirm button of SWAL
		    confirmPassBtn.click();
		    return false;
		}
		  

		cpErrorDispUA.innerText = '';
		confirmPassBtn.removeAttribute('disabled');
	});

	// Confirm Password Focus Out listener For Update User Attributes
	$(document).on('focusout', "#confPasswordUA", function() {
	
		let confirmPassBtn = document.getElementsByClassName('swal2-confirm')[0];
		let cpErrorDispUA = document.getElementById('cpErrorDispUA');
		let passwordEnt = this.value;

		if(isEmpty(passwordEnt) || passwordEnt.length < 8) {
			cpErrorDispUA.innerText = 'The confirm password field should have a minimum length of 8 characters.';
			confirmPassBtn.setAttribute('disabled','disabled');
			return;
		}

		cpErrorDispUA.innerText = '';

	});

	// Email Edit Scenario
	document.getElementById('emailEdit').addEventListener("click",function(e){
		// Hide the Element
		this.classList.add('d-none');
		// Name
		let emailProfileDisplay = document.getElementById('emailProfileDisplay').classList;
		emailProfileDisplay.add('d-none');
		// Change the User Name
		let emailModInp = document.getElementById('emailModInp');
		emailModInp.value = currentUser.email;
		// Display Edit Form
		let emailEditProf = document.getElementById('emailEditProf');
		emailEditProf.classList.remove('d-none');
		emailEditProf.classList.add('d-block');
	});

}(jQuery));	