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

	document.getElementById('remainingAmount').addEventListener("focusin",function(e){
		amountEditedAccount = trimElement(this.innerText);
	}

	// Change the remaining amount
	document.getElementById('remainingAmount').addEventListener("keyup",function(e){
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
		} else if(enteredText < 0){
			// Replace negative sign to positive sign if entered by the user
			enteredText = parseFloat(Math.abs(enteredText),2);
		}
		
		// Test if the previous value is valid
		if(isNaN(previousText) || !regexForFloat.test(previousText) || previousText == 0) {
			previousText = 0;
		}
		
		// Test if the entered value is the same as the previous one
		if(previousText != enteredText){
			
			let values = {};
			values['accountBalance'] = enteredText;

			// Ajax Requests on Error
			let ajaxData = {};
			ajaxData.isAjaxReq = true;
			ajaxData.type = "PATCH";
			ajaxData.url = CUSTOM_DASHBOARD_CONSTANTS.bankAccountUrl + BANK_ACCOUNT_CONSTANTS.backslash + currentAccountId;
			ajaxData.dataType = "json"; 
			ajaxData.contentType = "application/x-www-form-urlencoded; charset=UTF-8";
			ajaxData.data = values;
			ajaxData.onSuccess = function(bankAccount){
	        	  // Update the budget amount in the category row
	        	  let formattedBudgetAmount = currentCurrencyPreference + formatNumber(bankAccount.accountBalance , currentUser.locale);
	        	  element.innerText = formattedBudgetAmount;
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

}(jQuery));