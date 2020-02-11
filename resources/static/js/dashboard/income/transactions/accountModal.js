"use strict";
(function scopeWrapper($) {
	let currentAccountId = 0;
	let amountEditedAccount = null;

	// On Click Account Header display information
	$('#recTransAndAccTable').on('click', '.accountInfoTable .recentTransactionDateGrp' , function(e) {
		// Account modal id
		let accInfoTable = this.closest('.accountInfoTable');
		let accountId = lastElement(splitElement(accInfoTable.id,'-'));
		// Set the current account
		currentAccountId = accountId;
		let accountModal = document.getElementById('accountInformationMdl').classList;
		// Fetch the total number of transactions for the account
		let recentTransactionEntry = accInfoTable.getElementsByClassName('recentTransactionEntry');
		// Set the number of transactions if present
		let numberOfTransactionsDiv = document.getElementById('numberOfTransInAcc');
		numberOfTransactionsDiv.innerText = isEmpty(recentTransactionEntry) ? 0 : recentTransactionEntry.length;
		// Set Account Title
		document.getElementById('accountLabelInModal').innerText = document.getElementById('accountTitle-' + accountId).innerText;
		// Account Balance Update 
		document.getElementById('accountAmountEntry').innerText = document.getElementById('accountBalance-' + accountId).innerText;
		// Toggle Account Transaction 
		let accTransEntry = this.parentNode.getElementsByClassName('accTransEntry');
		for(let i = 0, l = accTransEntry.length; i < l; i++) {
			accTransEntry[i].classList.toggle('d-none');
			accTransEntry[i].classList.toggle('d-lg-table-row');
		}
		// Open Account Modal
		document.getElementById('accountInformationMdl').classList.remove('d-none');
		// Close  Financial Position
		document.getElementsByClassName('transactions-chart')[0].classList.add('d-none');

	});

	// Close Accoount modal
	document.getElementById('accountHeaderClose').addEventListener("click",function(e){
		// Close Account Modal
		document.getElementById('accountInformationMdl').classList.add('d-none');
		// Open  Financial Position
		document.getElementsByClassName('transactions-chart')[0].classList.remove('d-none');
	});

	// Focus in for the remaining account amount
	document.getElementById('accountAmountEntry').addEventListener("focusin",function(e){
		amountEditedAccount = trimElement(this.innerText);
	});

	// Change the remaining amount
	document.getElementById('accountAmountEntry').addEventListener("keyup",function(e){
		let keyCode = e.keyCode || e.which;
		if (keyCode === 13) { 
		    e.preventDefault();
		    submitAmountChange(this);
		    return false;
		}
	});

	// Submit Amount Change
	function submitAmountChange(element) {
		// If the text is not changed then do nothing (Remove currency locale and minus sign, remove currency formatting and take only the number and convert it into decimals) and round to 2 decimal places
		let enteredText = er.convertToNumberFromCurrency(element.innerText,currentCurrencyPreference);
		let previousText = er.convertToNumberFromCurrency(amountEditedAccount,currentCurrencyPreference);
		
		// Test if the entered value is valid
		if(isNaN(enteredText) || !regexForFloat.test(enteredText) || enteredText == 0) {
			// Replace the entered text with 0 inorder for the code to progress.
			enteredText = 0;
		} 
		
		// Test if the previous value is valid
		if(isNaN(previousText) || !regexForFloat.test(previousText) || previousText == 0) {
			previousText = 0;
		}
		
		// Test if the entered value is the same as the previous one
		if(previousText != enteredText){
			
			let values = {};
			values['accountBalance'] = enteredText;
			values['financialPortfolioId'] = currentUser.financialPortfolioId;
			values = JSON.stringify(values);

			// Ajax Requests on Error
			let ajaxData = {};
			ajaxData.isAjaxReq = true;
			ajaxData.type = "PATCH";
			ajaxData.url = CUSTOM_DASHBOARD_CONSTANTS.bankAccountUrl + BANK_ACCOUNT_CONSTANTS.backslash + currentAccountId;
			ajaxData.dataType = "json"; 
			ajaxData.contentType = "application/json; charset=UTF-8";
			ajaxData.data = values;
			ajaxData.onSuccess = function(bankAccount){
	        	  // Update the budget amount in the category row
	        	  let formattedBudgetAmount = currentCurrencyPreference + formatNumber(bankAccount.accountBalance , currentUser.locale);
	        	  element.innerText = formattedBudgetAmount;

	        	  // Account Balance for account Header
	        	  document.getElementById('accountBalance-' + bankAccount.id).innerText = formattedBudgetAmount;

	        	    // Append as Selected Account
			        for(let i = 0, length = bankAccountPreview.length; i < length; i++) {
			    		if(bankAccountPreview[i].id == currentAccountId) {
			    			// Account Balance update in preview
			    			bankAccountPreview[i].accountBalance = bankAccount.accountBalance;
			    			// Position of the row
			    			let position = i + 1;
			    			// update the formatted button
				    		document.getElementById('bAR-' + position).lastElementChild.innerText = formattedBudgetAmount;
				    		break;
			    		}
			        }
	        }
			ajaxData.onFailure = function (thrownError) {
				manageErrors(thrownError, 'Unable to change the account balance. Please try again!',ajaxData);
				
                // update the current element with the previous amount
                let formattedAccountAmount = currentCurrencyPreference + formatNumber(previousText , currentUser.locale);
                element.innerText = formattedAccountAmount;
            }

			$.ajax({
	          type: ajaxData.type,
	          url: ajaxData.url,
	          beforeSend: function(xhr){xhr.setRequestHeader("Authorization", authHeader);},
	          dataType: ajaxData.dataType,
	          contentType: ajaxData.contentType,
	          data : ajaxData.data,
	          success: ajaxData.onSuccess,
	          error: ajaxData.onFailure
	        });
		}
	}

	// Delete Account functionality
	document.getElementById('deleteSvgAccount').addEventListener("click",function(e){
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

		let cognitoUser = userPool.getCurrentUser();

		Swal.fire({
            title: 'Delete financial account',
            html: deleteBBAccount(),
            inputAttributes: {
                autocapitalize: 'on'
            },
            icon: 'info',
            showCancelButton: true,
            showCloseButton: true,
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'No, keep it',
            confirmButtonClass: "btn btn-info",
            cancelButtonClass: "btn btn-secondary",
            buttonsStyling: false,
            showLoaderOnConfirm: true,
  			preConfirm: () => {
  				return new Promise(function(resolve) {
  					let confPasswordUA = document.getElementById('oldPasswordDA');
  					 // Authentication Details
				    let authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails({
			            Username: currentUser.email,
			            Password: confPasswordUA.value
			        });

	  				// Authenticate Before cahnging password
			        cognitoUser.authenticateUser(authenticationDetails, {
			            onSuccess: function signinSuccess(result) {
			            	// Hide loading 
			               Swal.hideLoading();
			               // Resolve the promise
			               resolve();
			            },
			            onFailure: function signinError(err) {
			            	// Hide loading 
			               	Swal.hideLoading();
			            	// Show error message
			                Swal.showValidationMessage(
					          `${err.message}`
					        );
					        // Change focus to Password Field
					        confPasswordUA.focus();
			            }
			        });
  				});
  			},
  			allowOutsideClick: () => !Swal.isLoading(),
  			closeOnClickOutside: () => !Swal.isLoading()
        }).then(function(result) {
        	// Hide the validation message if present
    		Swal.resetValidationMessage()
        	// If the Delete Button is pressed
        	if (result.value) {
        	 	// Ajax Requests on Error
				let ajaxData = {};
				ajaxData.isAjaxReq = true;
				ajaxData.type = 'DELETE';
				ajaxData.url = CUSTOM_DASHBOARD_CONSTANTS.bankAccountUrl + BANK_ACCOUNT_CONSTANTS.backslash + currentAccountId + BANK_ACCOUNT_CONSTANTS.firstfinancialPortfolioId + currentUser.financialPortfolioId;
				ajaxData.onSuccess = function(jsonObj) {
		        	$('#accountSB-' + currentAccountId).fadeOut('slow', function(){ 
	                    this.remove();

	                    // Remove from preivew if present
	                    let posToRemove = null;
				    	for(let i = 0, length = bankAccountPreview.length; i < length; i++) {
				    		if(bankAccountPreview[i].id == currentAccountId) {
				    			let position = i + 1;
				    			// Remove the preview banka count
				    			document.getElementById('bAR-' + position).remove();
				    			// Update the position to remove
				    			posToRemove = i;
				    			break;
				    		}
				    	}

				    	// Position to remove
				    	if(isNotEmpty(posToRemove)) {
				    		// Remove the bank account preview
				    		bankAccountPreview.splice(posToRemove , 1);
				    	}

				    	// Simulate a click on the first table heading (Show Account Modal)
						let accountTableHeaders = $('.accountInfoTable .recentTransactionDateGrp')
						if(accountTableHeaders.length > 0) {
							accountTableHeaders.get(0).click();
						}
	                });
		        }
			    ajaxData.onFailure = function (thrownError) {
			    	manageErrors(thrownError, "There was an error while deleting the financial account. Please try again later!",ajaxData);
	            }
        	   	jQuery.ajax({
					url: ajaxData.url,
					beforeSend: function(xhr){xhr.setRequestHeader("Authorization", authHeader);},
			        type: ajaxData.type,
			        success: ajaxData.onSuccess,
			        error: ajaxData.onFailure
	        	});
        	}

        });

        // Disable Change Password button 
        let deleteBBBtn = document.getElementsByClassName('swal2-confirm')[0];
        if(!deleteBBBtn.disabled) {
            deleteBBBtn.setAttribute('disabled','disabled');
        }

        // Change focus to old password
        document.getElementById('oldPasswordDA').focus();
	});

	// Delete BB Account
	function deleteBBAccount() {
		let accountLabelInModal = document.getElementById('accountLabelInModal');
		let deletePassFrag = document.createDocumentFragment();

		// Warning Text
		let warnDiv = document.createElement('div');
		warnDiv.classList = 'noselect text-left mb-3 fs-90';
		warnDiv.innerHTML = 'Do you want to delete your bank account <strong>' + accountLabelInModal.innerText + '</strong> and <strong>delete all the transactions.</strong>?';
		deletePassFrag.appendChild(warnDiv);

		// UL tag
		let ulWarn = document.createElement('ul');
		ulWarn.classList = 'noselect text-left mb-3 fs-90';

		let liOne = document.createElement('li');
		liOne.innerHTML = 'all your transactions associated with ' + accountLabelInModal.innerText + ' will be deleted.';
		ulWarn.appendChild(liOne);

		let liTwo = document.createElement('li');
		liTwo.innerText = accountLabelInModal.innerText + ' financial account will be deleted.';
		ulWarn.appendChild(liTwo);
		deletePassFrag.appendChild(ulWarn);

		// Move Transactions
		let subsText = document.createElement('div');
		subsText.classList = 'noselect text-left mb-3 fs-90';
		subsText.innerText = 'Consider dragging and dropping the transaction to another account before deleting the financial account!';
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
	$(document).on('keyup', "#oldPasswordDA", function(e) {
	
		let deleteAccountBtn = document.getElementsByClassName('swal2-confirm')[0];
		let errorDispRA = document.getElementById('cpErrorDispOldDA');
		let passwordEnt = this.value;

		if(isEmpty(passwordEnt) || passwordEnt.length < 8) {
			deleteAccountBtn.setAttribute('disabled','disabled');
			return;
		}

		errorDispRA.innerText = '';
		deleteAccountBtn.removeAttribute('disabled');

		// Delete Account
		let keyCode = e.keyCode || e.which;
		if (keyCode === 13) { 
			document.activeElement.blur();
		    e.preventDefault();
		    e.stopPropagation();
		    // Click the confirm button of SWAL
		    deleteAccountBtn.click();
		    return false;
		}
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

}(jQuery));