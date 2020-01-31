"use strict";
(function scopeWrapper($) {
	let dragSrcEl = null;
	let dropHereChild = dropHereElement();
	// All dragsters initialized
	let initializedDragsters = [];

	// On DRAG START (The dragstart event is fired when the user starts dragging an element or text selection.)
	$('#recTransAndAccTable').on('dragstart', '.accTransEntry' , function(e) {
		handleDragStart(e);
	});

	// On DRAG END (The dragend event is fired when a drag operation is being ended (by releasing a mouse button or hitting the escape key)).
	$('#recTransAndAccTable').on('dragend', '.accTransEntry' , function(e) {
		handleDragEnd(e);
	});

	// On DRAG ENTER (When the dragging has entered this div) (Triggers even for all child elements)
	$('#recTransAndAccTable').on('dragenter', '.accountInfoTable' , function(e) {
		e.preventDefault();
		return false;
	});

	// On DRAG OVER (The dragover event is fired when an element or text selection is being dragged over a valid drop target (every few hundred milliseconds)) (Triggers even for all child elements)
	$('#recTransAndAccTable').on('dragover', '.accountInfoTable' , function(e) {
		e.preventDefault();
		e.originalEvent.dataTransfer.dropEffect = 'move';
		return false;
	});

	// On DROP (The drop event is fired when an element or text selection is dropped on a valid drop target.)
	$('#recTransAndAccTable').on('drop', '.accountInfoTable' , function(e) {
		handleDrop(e);
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
 	 	// Initialize dragster to all tables
		let dropzones = document.getElementsByClassName("accountInfoTable");
		for(let i = 0, l = dropzones.length; i < l; i++) {
			let dropzone = dropzones[i];
			let dragster = new Dragster( dropzone );
			initializedDragsters.push(dragster);
		}
	}

	function handleDragEnd(e) {
		// this / e.target is the source node.
	  	e.target.classList.remove('op-50');
	  	// Remove all the drop here elements
	  	let dropHereElements = document.getElementsByClassName('dropHereElement');
	  	// Remove all elements by classname
		while(dropHereElements[0]) {
		    dropHereElements[0].parentNode.removeChild(dropHereElements[0]);
		}
		// Remove all dragster events attached
		for(let i = 0, l = initializedDragsters.length; i < l; i++) {
			// Remove all dragster events attached
			initializedDragsters[i].removeListeners();
		}
	}

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
			// If the account balance is negative then change color
			if(isNotEmpty(oldAccMinusSign)) {oldAccDiv.classList.add('expenseCategory');oldAccDiv.classList.remove('incomeCategory'); } else { oldAccDiv.classList.add('incomeCategory');oldAccDiv.classList.remove('expenseCategory');}
			if(isNotEmpty(newAccMinusSign)) {accDiv.classList.add('expenseCategory');accDiv.classList.remove('incomeCategory'); } else { accDiv.classList.add('incomeCategory');accDiv.classList.remove('expenseCategory');}
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

	// Drop here element
	function dropHereElement() {
		let tableRowTransaction = document.createElement('div');
		tableRowTransaction.classList = 'recentTransactionEntry d-lg-table-row dropHereElement';

		// Cell 1
		let tableCellImagesWrapper = document.createElement('div');
		tableCellImagesWrapper.classList = 'd-lg-table-cell align-middle imageWrapperCell text-center';
		tableRowTransaction.appendChild(tableCellImagesWrapper);

		// Cell 2
		let tableCellTransactionDescription = document.createElement('div');
		tableCellTransactionDescription.classList = 'descriptionCellRT d-lg-table-cell';

		let elementWithDescription = document.createElement('div');
		elementWithDescription.classList = 'font-weight-bold recentTransactionDescription';
		elementWithDescription.innerText = 'Drop Here'
		tableCellTransactionDescription.appendChild(elementWithDescription);
		
		let elementWithCategoryName = document.createElement('div');
		elementWithCategoryName.classList = 'small categoryNameRT w-100';
		tableCellTransactionDescription.appendChild(elementWithCategoryName);
		tableRowTransaction.appendChild(tableCellTransactionDescription);

		// Cell 3
		let transactionAmount = document.createElement('div');
		transactionAmount.classList = 'transactionAmountRT incomeCategory font-weight-bold d-lg-table-cell text-right align-middle';
		tableRowTransaction.appendChild(transactionAmount);

		return tableRowTransaction;
	}

	// ON DRAG ENTER (Only parent elements)
	document.addEventListener( "dragster:enter", function (e) {
	  	// Don't do anything if dragged on the same wrapper.
		let closestParentWrapper = e.target.closest('.accountInfoTable');
		if (dragSrcEl != closestParentWrapper) {
			dropHereChild = cloneElementAndAppend(this, dropHereChild);
		}
	}, false );

	// On DRAG LEAVE (only parent elements)
	document.addEventListener( "dragster:leave", function (e) {
	  	// Remove the drop here element appended
		let dropHereElements = this.getElementsByClassName('dropHereElement');
		// Remove all elements by classname
		while(dropHereElements[0]) {
		    dropHereElements[0].parentNode.removeChild(dropHereElements[0]);
		}
	}, false );

}(jQuery));