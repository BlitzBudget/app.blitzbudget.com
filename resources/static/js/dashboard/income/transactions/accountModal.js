"use strict";
(function scopeWrapper($) {
	let currentAccountId = 0;
	let amountEditedAccount = null;
	// Category sort transactions table ID
	const replaceTransactionsId = "productsJson";

	// On Click Account Header display information
	$('body').on('click', '.accountInfoTable .recentTransactionDateGrp' , function(e) {
		// Account modal id
		let accInfoTable = this.closest('.accountInfoTable');
		let accountId = accInfoTable.getAttribute('data-target');
		// Set the current account
		currentAccountId = accountId;
		let accountModal = document.getElementById('accountInformationMdl').classList;
		// Fetch the total number of transactions for the account
		let recentTransactionEntry = accInfoTable.getElementsByClassName('recentTransactionEntry');
		// Set the number of transactions if present
		let numberOfTransactionsDiv = document.getElementById('numberOfTransInAcc');
		numberOfTransactionsDiv.textContent = isEmpty(recentTransactionEntry) ? 0 : recentTransactionEntry.length;
		// Set Account Title
		document.getElementById('accountLabelInModal').textContent = document.getElementById('accountTitle-' + accountId).textContent;
		// Account Balance Update 
		document.getElementById('accountAmountEntry').textContent = document.getElementById('accountBalance-' + accountId).textContent;
		// Toggle Account Transaction 
		let accTransEntry = this.parentNode.getElementsByClassName('accTransEntry');
		for(let i = 0, l = accTransEntry.length; i < l; i++) {
			accTransEntry[i].classList.toggle('d-none');
			accTransEntry[i].classList.toggle('d-table-row');
		}
		// Open Account Modal
		document.getElementById('accountInformationMdl').classList.remove('d-none');
		// Close  Financial Position
		document.getElementsByClassName('transactions-chart')[0].classList.add('d-none');
		// Rotate the arrow indicator
		let emptyTransInAcc = document.getElementById('emptyAccountEntry-' + accountId);
		if(isEmpty(emptyTransInAcc)) {
			let arrowIndicator = this.firstElementChild.firstElementChild;
			arrowIndicator.classList.toggle('rotateZero');
			arrowIndicator.classList.toggle('rotateNinty');
		}
		

	});

	// Close Accoount modal
	$('body').on('click', '#accountHeaderClose' , function(e) {
		// Close Account Modal
		document.getElementById('accountInformationMdl').classList.add('d-none');
		// Open  Financial Position
		document.getElementsByClassName('transactions-chart')[0].classList.remove('d-none');
	});

	// Focus in for the remaining account amount
	$('body').on('focusin', '#accountAmountEntry' , function(e) {
		amountEditedAccount = trimElement(this.textContent);
	});

	// Change the remaining amount
	$('body').on('keyup', '#accountAmountEntry' , function(e) {
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
		let enteredText = er.convertToNumberFromCurrency(element.textContent,currentCurrencyPreference);
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
			values['walletId'] = currentUser.walletId;
			values['accountId'] = currentAccountId;

			// Ajax Requests on Error
			let ajaxData = {};
			ajaxData.isAjaxReq = true;
			ajaxData.type = "PATCH";
			ajaxData.url = CUSTOM_DASHBOARD_CONSTANTS.bankAccountUrl;
			ajaxData.dataType = "json"; 
			ajaxData.contentType = "application/json; charset=UTF-8";
			ajaxData.data = JSON.stringify(values);
			ajaxData.onSuccess = function(bankAccount){
				bankAccount = bankAccount['body-json'];
	        	// Update the budget amount in the category row
	        	let formattedBudgetAmount = formatToCurrency(bankAccount.accountBalance);
	        	element.textContent = formattedBudgetAmount;

	        	// Account Balance for account Header
	        	document.getElementById('accountBalance-' + bankAccount.accountId).textContent = formattedBudgetAmount;

	        	// Append as Selected Account
		        for(let i = 0, length = allBankAccountInfoCache.length; i < length; i++) {
		    		if(allBankAccountInfoCache[i].accountId == currentAccountId) {
		    			// Account Balance update in preview
		    			allBankAccountInfoCache[i]['account_balance'] = bankAccount.accountBalance;
		    			// Position of the row
		    			let position = i + 1;
		    			// update the formatted button
			    		document.getElementById('bAR-' + position).lastElementChild.textContent = formattedBudgetAmount;
			    		break;
		    		}
		        }
	        }
			ajaxData.onFailure = function (thrownError) {
				manageErrors(thrownError, 'Unable to change the account balance. Please try again!',ajaxData);
				
                // update the current element with the previous amount
                let formattedAccountAmount = formatToCurrency(previousText);
                element.textContent = formattedAccountAmount;
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
	$('body').on('click', '#deleteSvgAccount' , function(e) {
		
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
			        let values = {};
			        values.username = currentUser.email;
			        values.password = confPasswordUA.value;
			        values.checkPassword = true;

	  				// Authenticate Before cahnging password
	  				$.ajax({
				          type: 'POST',
				          url: window._config.api.invokeUrl + window._config.api.profile.signin,
				          dataType: 'json',
				          contentType: "application/json;charset=UTF-8",
				          data : JSON.stringify(values),
				          success: function(result) {
			            	// Hide loading 
			                Swal.hideLoading();
			                // Resolve the promise
			                resolve();

			              },
				  	      error: function(err) {
				  	      	// Error Message
				  	      	let errMessage = lastElement(splitElement(err.responseJSON.errorMessage,':'));
			            	// Hide loading 
			               	Swal.hideLoading();
			            	// Show error message
			                Swal.showValidationMessage(
					          `${errMessage}`
					        );
					        // Change Focus to password field
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

				let values = {};
				values.walletId = window.currentUser.walletId;
				values.itemId = currentAccountId;
				
				// Ajax Requests on Error
				let ajaxData = {};
		   		ajaxData.isAjaxReq = true;
		   		ajaxData.type = "POST";
		   		ajaxData.url = window._config.api.invokeUrl + window._config.api.deleteItem;
		   		ajaxData.dataType = "json";
		   		ajaxData.contentType = "application/json;charset=UTF-8";
		   		ajaxData.data = JSON.stringify(values);
        		ajaxData.onSuccess = function(jsonObj) {
        			jsonObj = jsonObj['body-json'];
		        	let accountSB = document.getElementById('accountSB-' + currentAccountId).remove();

                    // Simulate a click on the first table heading (Show Account Modal)
					let accountTableHeaders = $('.accountInfoTable .recentTransactionDateGrp')
					if(accountTableHeaders.length > 0) {
						accountTableHeaders.get(0).click();
					} else {
						// Append account Table empty information
						let accountTable = document.getElementById('accountTable');
						// Replace HTML with Empty
						while (accountTable.firstChild) {
							accountTable.removeChild(accountTable.firstChild);
						}
			    		accountTable.appendChild(buildEmptyTransactionsTab());
			    		// Show the empty table
			    		accountTable.classList.remove('d-none');
			    		// Close the account info Modal
			    		document.getElementById('accountHeaderClose').click();
			    		// Replace the Transactions Table with empty entry
			    		let transactionsTable = document.getElementById(replaceTransactionsId);
						while (transactionsTable.firstChild) {
							transactionsTable.removeChild(transactionsTable.firstChild);
						}
						transactionsTable.appendChild(fetchEmptyTableMessage());
			    		// Replace recent transactions table with empty entry
			    		let recTransTable = document.getElementById('recentTransactions');
			    		// Replace HTML with Empty
						while (recTransTable.firstChild) {
							recTransTable.removeChild(recTransTable.firstChild);
						}
						recTransTable.appendChild(buildEmptyTransactionsTab());
						// Reset the Financial Position
					}

                    // Remove from preivew if present
                    let posToRemove = null;
			    	for(let i = 0, length = allBankAccountInfoCache.length; i < length; i++) {
			    		if(allBankAccountInfoCache[i].id == currentAccountId) {
			    			let position = i + 1;
			    			// Remove the preview banka count
			    			let previewPos = document.getElementById('bAR-' + position);
			    			// remove the preview Pos if present
			    			if(isNotEmpty(previewPos)) previewPos.remove();
			    			// Update the position to remove
			    			posToRemove = i;
			    			break;
			    		}
			    	}

			    	// Position to remove
			    	if(isNotEmpty(posToRemove)) {
			    		// Remove the bank account preview
			    		allBankAccountInfoCache.splice(posToRemove , 1);
			    	}
		        }
			    ajaxData.onFailure = function (thrownError) {
			    	manageErrors(thrownError, "There was an error while deleting the financial account. Please try again later!",ajaxData);
	            }
        	   	jQuery.ajax({
					url: ajaxData.url,
					beforeSend: function(xhr){xhr.setRequestHeader("Authorization", authHeader);},
			        type: ajaxData.type,
			        dataType: ajaxData.dataType,
		      		contentType: ajaxData.contentType,
		      		data: ajaxData.data,
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
		warnDiv.innerHTML = 'Do you want to delete your bank account <strong>' + accountLabelInModal.textContent + '</strong> and <strong>delete all the transactions.</strong>?';
		deletePassFrag.appendChild(warnDiv);

		// UL tag
		let ulWarn = document.createElement('ul');
		ulWarn.classList = 'noselect text-left mb-3 fs-90';

		let liOne = document.createElement('li');
		liOne.textContent = 'all your transactions associated with ' + accountLabelInModal.textContent + ' will be deleted.';
		ulWarn.appendChild(liOne);

		let liTwo = document.createElement('li');
		liTwo.textContent = accountLabelInModal.textContent + ' financial account will be deleted.';
		ulWarn.appendChild(liTwo);
		deletePassFrag.appendChild(ulWarn);

		// Move Transactions
		let subsText = document.createElement('div');
		subsText.classList = 'noselect text-left mb-3 fs-90';
		subsText.textContent = 'Consider dragging and dropping the transaction to another account before deleting the financial account!';
		deletePassFrag.appendChild(subsText);

		// Old Password
		let oldPassWrapper = document.createElement('div');
		oldPassWrapper.setAttribute('data-gramm_editor',"false");
		oldPassWrapper.classList = 'oldPassWrapper text-left';
		
		let oldPassLabel = document.createElement('label');
		oldPassLabel.textContent = 'Confirm Password';
		oldPassWrapper.appendChild(oldPassLabel);


		let dropdownGroupOP = document.createElement('div');
		dropdownGroupOP.classList = 'btn-group d-md-block d-block';
		
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
		miEye.textContent = 'remove_red_eye';
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

		errorDispRA.textContent = '';
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
			errorDispRA.textContent = 'The confirm password field should have a minimum length of 8 characters.';
			deleteAccountBtn.setAttribute('disabled','disabled');
			return;
		}

		errorDispRA.textContent = '';

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

	// Build EmptyRecTransTable
	function buildEmptyTransactionsTab() {

		let rowEmpty = document.createElement('div');
		rowEmpty.classList = 'd-table-row';

		let cell1 = document.createElement('div');
		cell1.classList = 'd-table-cell';
		rowEmpty.appendChild(cell1);

		let cell2 = document.createElement('div');
		cell2.classList = 'd-table-cell text-center';
		cell2.appendChild(buildEmptyTransactionsSvg());

		let emptyMessageRow = document.createElement('div');
		emptyMessageRow.classList = 'text-center tripleNineColor font-weight-bold';
		emptyMessageRow.textContent = isNotEmpty(window.translationData) ? window.translationData.transactions.dynamic.empty.success : "Oh! Snap! You don't have any transactions yet.";
		cell2.appendChild(emptyMessageRow);
		rowEmpty.appendChild(cell2);

		let cell3 = document.createElement('div');
		cell3.classList = 'd-table-cell';
		rowEmpty.appendChild(cell3);
		
		return rowEmpty;
	}

	// Empty Transactions SVG
	function buildEmptyTransactionsSvg() {
		
		let svgElement = document.createElementNS("http://www.w3.org/2000/svg", 'svg');
		svgElement.setAttribute('width','64');
		svgElement.setAttribute('height','64');
    	svgElement.setAttribute('viewBox','0 0 64 64');
    	svgElement.setAttribute('class','transactions-empty-svg');
    	
    	let pathElement1 = document.createElementNS("http://www.w3.org/2000/svg", 'path');
    	pathElement1.setAttribute('d','M 5 8 C 3.346 8 2 9.346 2 11 L 2 53 C 2 54.654 3.346 56 5 56 L 59 56 C 60.654 56 62 54.654 62 53 L 62 11 C 62 9.346 60.654 8 59 8 L 5 8 z M 5 10 L 59 10 C 59.551 10 60 10.449 60 11 L 60 20 L 4 20 L 4 11 C 4 10.449 4.449 10 5 10 z M 28 12 C 26.897 12 26 12.897 26 14 L 26 16 C 26 17.103 26.897 18 28 18 L 56 18 C 57.103 18 58 17.103 58 16 L 58 14 C 58 12.897 57.103 12 56 12 L 28 12 z M 28 14 L 56 14 L 56.001953 16 L 28 16 L 28 14 z M 4 22 L 60 22 L 60 53 C 60 53.551 59.551 54 59 54 L 5 54 C 4.449 54 4 53.551 4 53 L 4 22 z'); 
    	svgElement.appendChild(pathElement1);
    	
    	let pathElement11 = document.createElementNS("http://www.w3.org/2000/svg", 'path');
    	pathElement11.setAttribute('class','coloredTransactionLine');
    	pathElement11.setAttribute('d',' M 8 13 A 2 2 0 0 0 6 15 A 2 2 0 0 0 8 17 A 2 2 0 0 0 10 15 A 2 2 0 0 0 8 13 z'); 
    	svgElement.appendChild(pathElement11);
    	
    	let pathElement12 = document.createElementNS("http://www.w3.org/2000/svg", 'path');
    	pathElement12.setAttribute('d',' M 14 13 A 2 2 0 0 0 12 15 A 2 2 0 0 0 14 17 A 2 2 0 0 0 16 15 A 2 2 0 0 0 14 13 z M 20 13 A 2 2 0 0 0 18 15 A 2 2 0 0 0 20 17 A 2 2 0 0 0 22 15 A 2 2 0 0 0 20 13 z '); 
    	svgElement.appendChild(pathElement12);
    	
    	let pathElement2 = document.createElementNS("http://www.w3.org/2000/svg", 'path');
    	pathElement2.setAttribute('class','coloredTransactionLine');
    	pathElement2.setAttribute('d','M 11 27.974609 C 10.448 27.974609 10 28.422609 10 28.974609 C 10 29.526609 10.448 29.974609 11 29.974609 L 15 29.974609 C 15.552 29.974609 16 29.526609 16 28.974609 C 16 28.422609 15.552 27.974609 15 27.974609 L 11 27.974609 z M 19 27.974609 C 18.448 27.974609 18 28.422609 18 28.974609 C 18 29.526609 18.448 29.974609 19 29.974609 L 33 29.974609 C 33.552 29.974609 34 29.526609 34 28.974609 C 34 28.422609 33.552 27.974609 33 27.974609 L 19 27.974609 z'); 
    	svgElement.appendChild(pathElement2);
    	
    	let pathElement21 = document.createElementNS("http://www.w3.org/2000/svg", 'path');
    	pathElement21.setAttribute('d',' M 39 27.974609 C 38.448 27.974609 38 28.422609 38 28.974609 C 38 29.526609 38.448 29.974609 39 29.974609 L 41 29.974609 C 41.552 29.974609 42 29.526609 42 28.974609 C 42 28.422609 41.552 27.974609 41 27.974609 L 39 27.974609 z M 45 27.974609 C 44.448 27.974609 44 28.422609 44 28.974609 C 44 29.526609 44.448 29.974609 45 29.974609 L 47 29.974609 C 47.552 29.974609 48 29.526609 48 28.974609 C 48 28.422609 47.552 27.974609 47 27.974609 L 45 27.974609 z M 51 27.974609 C 50.448 27.974609 50 28.422609 50 28.974609 C 50 29.526609 50.448 29.974609 51 29.974609 L 53 29.974609 C 53.552 29.974609 54 29.526609 54 28.974609 C 54 28.422609 53.552 27.974609 53 27.974609 L 51 27.974609 z');
    	svgElement.appendChild(pathElement21);
    	
    	let pathElement3 = document.createElementNS("http://www.w3.org/2000/svg", 'path');
    	pathElement3.setAttribute('class','coloredTransactionLine');
    	pathElement3.setAttribute('d','M 11 33.974609 C 10.448 33.974609 10 34.422609 10 34.974609 C 10 35.526609 10.448 35.974609 11 35.974609 L 15 35.974609 C 15.552 35.974609 16 35.526609 16 34.974609 C 16 34.422609 15.552 33.974609 15 33.974609 L 11 33.974609 z M 19 33.974609 C 18.448 33.974609 18 34.422609 18 34.974609 C 18 35.526609 18.448 35.974609 19 35.974609 L 33 35.974609 C 33.552 35.974609 34 35.526609 34 34.974609 C 34 34.422609 33.552 33.974609 33 33.974609 L 19 33.974609 z'); 
    	svgElement.appendChild(pathElement3);
    	
    	let pathElement31 = document.createElementNS("http://www.w3.org/2000/svg", 'path');
    	pathElement31.setAttribute('d',' M 45 33.974609 C 44.448 33.974609 44 34.422609 44 34.974609 C 44 35.526609 44.448 35.974609 45 35.974609 L 47 35.974609 C 47.552 35.974609 48 35.526609 48 34.974609 C 48 34.422609 47.552 33.974609 47 33.974609 L 45 33.974609 z M 51 33.974609 C 50.448 33.974609 50 34.422609 50 34.974609 C 50 35.526609 50.448 35.974609 51 35.974609 L 53 35.974609 C 53.552 35.974609 54 35.526609 54 34.974609 C 54 34.422609 53.552 33.974609 53 33.974609 L 51 33.974609 z'); 
    	svgElement.appendChild(pathElement31);
    	
    	let pathElement4 = document.createElementNS("http://www.w3.org/2000/svg", 'path');
    	pathElement4.setAttribute('class','coloredTransactionLine');
    	pathElement4.setAttribute('d','M 11 39.974609 C 10.448 39.974609 10 40.422609 10 40.974609 C 10 41.526609 10.448 41.974609 11 41.974609 L 15 41.974609 C 15.552 41.974609 16 41.526609 16 40.974609 C 16 40.422609 15.552 39.974609 15 39.974609 L 11 39.974609 z M 19 39.974609 C 18.448 39.974609 18 40.422609 18 40.974609 C 18 41.526609 18.448 41.974609 19 41.974609 L 33 41.974609 C 33.552 41.974609 34 41.526609 34 40.974609 C 34 40.422609 33.552 39.974609 33 39.974609 L 19 39.974609 z'); 
    	svgElement.appendChild(pathElement4);
    	
    	let pathElement41 = document.createElementNS("http://www.w3.org/2000/svg", 'path');
    	pathElement41.setAttribute('d','M 39 39.974609 C 38.448 39.974609 38 40.422609 38 40.974609 C 38 41.526609 38.448 41.974609 39 41.974609 L 41 41.974609 C 41.552 41.974609 42 41.526609 42 40.974609 C 42 40.422609 41.552 39.974609 41 39.974609 L 39 39.974609 z M 45 39.974609 C 44.448 39.974609 44 40.422609 44 40.974609 C 44 41.526609 44.448 41.974609 45 41.974609 L 47 41.974609 C 47.552 41.974609 48 41.526609 48 40.974609 C 48 40.422609 47.552 39.974609 47 39.974609 L 45 39.974609 z M 51 39.974609 C 50.448 39.974609 50 40.422609 50 40.974609 C 50 41.526609 50.448 41.974609 51 41.974609 L 53 41.974609 C 53.552 41.974609 54 41.526609 54 40.974609 C 54 40.422609 53.552 39.974609 53 39.974609 L 51 39.974609 z ');
    	svgElement.appendChild(pathElement41);
    	
    	let pathElement5 = document.createElementNS("http://www.w3.org/2000/svg", 'path');
    	pathElement5.setAttribute('d','M 7 48 C 6.448 48 6 48.448 6 49 L 6 51 C 6 51.552 6.448 52 7 52 C 7.552 52 8 51.552 8 51 L 8 49 C 8 48.448 7.552 48 7 48 z M 12 48 C 11.448 48 11 48.448 11 49 L 11 51 C 11 51.552 11.448 52 12 52 C 12.552 52 13 51.552 13 51 L 13 49 C 13 48.448 12.552 48 12 48 z M 17 48 C 16.448 48 16 48.448 16 49 L 16 51 C 16 51.552 16.448 52 17 52 C 17.552 52 18 51.552 18 51 L 18 49 C 18 48.448 17.552 48 17 48 z M 22 48 C 21.448 48 21 48.448 21 49 L 21 51 C 21 51.552 21.448 52 22 52 C 22.552 52 23 51.552 23 51 L 23 49 C 23 48.448 22.552 48 22 48 z M 27 48 C 26.448 48 26 48.448 26 49 L 26 51 C 26 51.552 26.448 52 27 52 C 27.552 52 28 51.552 28 51 L 28 49 C 28 48.448 27.552 48 27 48 z M 32 48 C 31.448 48 31 48.448 31 49 L 31 51 C 31 51.552 31.448 52 32 52 C 32.552 52 33 51.552 33 51 L 33 49 C 33 48.448 32.552 48 32 48 z M 37 48 C 36.448 48 36 48.448 36 49 L 36 51 C 36 51.552 36.448 52 37 52 C 37.552 52 38 51.552 38 51 L 38 49 C 38 48.448 37.552 48 37 48 z M 42 48 C 41.448 48 41 48.448 41 49 L 41 51 C 41 51.552 41.448 52 42 52 C 42.552 52 43 51.552 43 51 L 43 49 C 43 48.448 42.552 48 42 48 z M 47 48 C 46.448 48 46 48.448 46 49 L 46 51 C 46 51.552 46.448 52 47 52 C 47.552 52 48 51.552 48 51 L 48 49 C 48 48.448 47.552 48 47 48 z M 52 48 C 51.448 48 51 48.448 51 49 L 51 51 C 51 51.552 51.448 52 52 52 C 52.552 52 53 51.552 53 51 L 53 49 C 53 48.448 52.552 48 52 48 z M 57 48 C 56.448 48 56 48.448 56 49 L 56 51 C 56 51.552 56.448 52 57 52 C 57.552 52 58 51.552 58 51 L 58 49 C 58 48.448 57.552 48 57 48 z'); 
    	svgElement.appendChild(pathElement5);

    	return svgElement;
    	
	}

	// Build empty table message as document
	function fetchEmptyTableMessage() {
		let emptyTableRow = document.createElement("div");
		emptyTableRow.className = 'd-table-row';
		
		// Row 1
		let indexTableCell = document.createElement('div');
		indexTableCell.className = 'd-table-cell';
		emptyTableRow.appendChild(indexTableCell);
		
		// Row 2
		let selectAllTableCell = document.createElement('div');
		selectAllTableCell.className = 'd-table-cell';
		emptyTableRow.appendChild(selectAllTableCell);
		
		// Row 3
		let categoryTableCell = document.createElement('div');
		categoryTableCell.className = 'd-table-cell text-center align-middle';
		categoryTableCell.appendChild(buildEmptyTransactionsSvg());
		emptyTableRow.appendChild(categoryTableCell);
		
		// Row 4
		let descriptionTableCell = document.createElement('div');
		descriptionTableCell.className = 'd-table-cell';
		
		let paragraphElement = document.createElement('p');
		paragraphElement.className = 'text-secondary mb-0';
		paragraphElement.textContent = 'There are no transactions yet. Start adding some to track your spending.';
		
		descriptionTableCell.appendChild(paragraphElement);
		emptyTableRow.appendChild(descriptionTableCell);
		
		// Row 5
		let amountTableCell = document.createElement('div');
		amountTableCell.className = 'd-table-cell';
		emptyTableRow.appendChild(amountTableCell);
		
		// Row 6
		let budgetTableCell = document.createElement('div');
		budgetTableCell.className = 'd-table-cell';
		emptyTableRow.appendChild(budgetTableCell);
		
		return emptyTableRow;
	}

}(jQuery));