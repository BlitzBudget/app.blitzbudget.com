"use strict";
(function scopeWrapper($) {
	let dragSrcEl = null;

	// On DRAG START Account transaction display information
	$('#recTransAndAccTable').on('dragstart', '.accTransEntry' , function(e) {
		handleDragStart(e);
	});

	function handleDragStart(e) {
		// this / e.target is the source node.
	  	e.target.classList.add('op-50');
	  	// Set the drag start element
	  	dragSrcEl = e.target.closest('.accountInfoTable');
	  	// Set Drag effects
	  	e.originalEvent.dataTransfer.effectAllowed = 'move';
	  	e.originalEvent.dataTransfer.dropEffect = 'move';
 	 	e.originalEvent.dataTransfer.setData('text/plain', e.target.id);
	}

	// On DRAG START Account transaction display information
	$('#recTransAndAccTable').on('dragstart', '.accTransEntry' , function(e) {
		handleDragEnd(e);
	});

	function handleDragEnd(e) {
		// this / e.target is the source node.
	  	e.target.classList.remove('op-50');
	}

	// On Drop Account transaction display information
	$('#recTransAndAccTable').on('drop', '.accountInfoTable' , function(e) {
		handleDrop(e);
	});

	// Drop event is fired only on a valid target
	function handleDrop(e) {
	  // this or e.target is current target element.
	  e.preventDefault();

	  if (e.stopPropagation) {
	  	// stops the browser from redirecting.
	    e.stopPropagation(); 
	  }

	  // Don't do anything if dropped on the same wrapper div we're dragging.
	  let closestParentWrapper = e.target.closest('.accountInfoTable');
	  if (dragSrcEl != closestParentWrapper) {
	    // Set the source column's HTML to the HTML of the column we dropped on.
	    let transId = e.originalEvent.dataTransfer.getData('text/plain');
	    let a = document.getElementById(transId);
	    // Find the closest parent element and drop. (Should never be null)
	    closestParentWrapper.appendChild(a);
	    // Update the transaction with the new account ID
	    updateTransactionWithAccId(transId, closestParentWrapper.id, dragSrcEl.id);
	  }

	  return false;
	}

	// On Drop Account transaction display information
	$('#recTransAndAccTable').on('dragenter', '.accountInfoTable' , function(e) {
		e.preventDefault();
		return false;
	});

	// On Drop Account transaction display information
	$('#recTransAndAccTable').on('dragover', '.accountInfoTable' , function(e) {
		e.preventDefault();
		e.originalEvent.dataTransfer.dropEffect = 'move';
		return false;
	});

	// Update the transaction with the account ID
	function updateTransactionWithAccId(transactionId, accountId, oldAccountId) {
		// obtain the transaction id of the table row
		transactionId = lastElement(splitElement(transactionId,'-'));
		accountId = lastElement(splitElement(accountId,'-'));
		oldAccountId = lastElement(splitElement(oldAccountId,'-'));

		let values = {};
		values['accountId'] = accountId;
		values['transactionId'] = transactionId;
		values['dateMeantFor'] = chosenDate;
		
		// Ajax Requests on Error
		let ajaxData = {};
		ajaxData.isAjaxReq = true;
		ajaxData.type = "POST";
		ajaxData.url = CUSTOM_DASHBOARD_CONSTANTS.transactionAPIUrl + currentUser.financialPortfolioId + CUSTOM_DASHBOARD_CONSTANTS.transactionsUpdateUrl + 'accountId';
		ajaxData.dataType = "json"; 
		ajaxData.contentType = "application/x-www-form-urlencoded; charset=UTF-8";
		ajaxData.data = values;
		ajaxData.onSuccess = function(userTransaction){
			// Fetch the current account balance
			let oldAccDiv = document.getElementById('accountBalance-' + oldAccountId);
			let oldAccBal = er.convertToNumberFromCurrency(oldAccDiv.innerText,currentCurrencyPreference);
			let accDiv = document.getElementById('accountBalance-' + accountId);
			let accBal = er.convertToNumberFromCurrency(accDiv.innerText,currentCurrencyPreference);
			let currAccBal = 0;
			let currNewAccBal = 0;
        	// Append a - sign if it is an expense
			if(categoryMap[userTransaction.categoryId].parentCategory == CUSTOM_DASHBOARD_CONSTANTS.expenseCategory) {
				currAccBal = oldAccBal + userTransaction.amount;
				currNewAccBal = accBal - userTransaction.amount;
				
			} else {
				currAccBal = oldAccBal - userTransaction.amount
				currNewAccBal = accBal + userTransaction.amount;
			}
			// Append minus sign to old account balance
			let oldAccMinusSign = currAccBal < 0 ? '-' : '';
			let newAccMinusSign = currNewAccBal < 0 ? '-' : '';
			// Append the new amount to the front
			oldAccDiv.innerText = oldAccMinusSign + currentCurrencyPreference + formatNumber(currAccBal, currentUser.locale);
			accDiv.innerText = newAccMinusSign + currentCurrencyPreference + formatNumber(currNewAccBal, currentUser.locale);
        }
		ajaxData.onFailure = function (thrownError) {
			manageErrors(thrownError, 'Unable to change the transacition amount.',ajaxData);
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

}(jQuery));