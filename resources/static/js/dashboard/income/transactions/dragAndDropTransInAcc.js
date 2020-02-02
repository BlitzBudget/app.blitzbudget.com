"use strict";
(function scopeWrapper($) {
	let dragSrcEl = null;
	let dropHereChild = dropHereElement();
	let parentElementDragEnterAndLeave = null;
	let dragsterList = [];

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

		// Don't do anything if dragged on the same wrapper.
		let closestParentWrapper = e.target.closest('.accountInfoTable');

		// If parent element is the same then return
		if(parentElementDragEnterAndLeave == closestParentWrapper || 
			parentElementDragEnterAndLeave == e.target) {
			return false;
		}

		// Show all the transactions
		let recentTransactionEntry = closestParentWrapper.getElementsByClassName('recentTransactionEntry');
		if(recentTransactionEntry.length > 0) {
			for(let i = 0, l = recentTransactionEntry.length; i < l; i++) {
				let recTransEntry = recentTransactionEntry[i];
				recTransEntry.classList.remove('d-none');
				recTransEntry.classList.add('d-lg-table-row');
			}
		}
		// Set the parent event as the account table
		parentElementDragEnterAndLeave = closestParentWrapper;
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

	// On DRAG LEAVE (only parent elements)
	document.addEventListener( "dragster:leave", function (e) {		
		
		// If parent element is not populated then return
		if(isEmpty(parentElementDragEnterAndLeave)) {
			return;
		}
	
		// set the parent element back to null
		parentElementDragEnterAndLeave = null;
	}, false );

	function handleDragStart(e) {
		// this / e.target is the source node.
	  	e.target.classList.add('op-50');
	  	// Set the drag start element
	  	dragSrcEl = e.target.closest('.accountInfoTable');
	  	// Set Drag effects
	  	e.originalEvent.dataTransfer.effectAllowed = 'move';
	  	e.originalEvent.dataTransfer.dropEffect = 'move';
 	 	e.originalEvent.dataTransfer.setData('text/plain', e.target.id); 
 	 	// Register dragster for Account Info Table
 	 	let accountInfoTables = document.getElementsByClassName('accountInfoTable');
 	 	for(let i = 0, l = accountInfoTables.length; i < l; i++) {
			dragsterList.push(new Dragster( accountInfoTables[i] ));
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
		// Remove all registered dragster
		for(let i = 0, l = dragsterList.length; i < l; i++) {
			// Remove Listeners
			dragsterList[i].removeListeners();
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
			oldAccDiv.innerText = oldAccMinusSign + currentCurrencyPreference + formatNumber(Math.abs(currAccBal), currentUser.locale);
			accDiv.innerText = newAccMinusSign + currentCurrencyPreference + formatNumber(Math.abs(currNewAccBal), currentUser.locale);
			// If the account balance is negative then change color
			if(isNotEmpty(oldAccMinusSign)) {oldAccDiv.classList.add('expenseCategory');oldAccDiv.classList.remove('incomeCategory'); } else { oldAccDiv.classList.add('incomeCategory');oldAccDiv.classList.remove('expenseCategory');}
			if(isNotEmpty(newAccMinusSign)) {accDiv.classList.add('expenseCategory');accDiv.classList.remove('incomeCategory'); } else { accDiv.classList.add('incomeCategory');accDiv.classList.remove('expenseCategory');}
			// Remove empty entries for the account
			let emptyEntriesNewAcc = document.getElementById('emptyAccountEntry-' + accountId);
			if(isNotEmpty(emptyEntriesNewAcc)) {
				emptyEntriesNewAcc.remove();
			}
			// Replace with Empty Acc Trans
			let oldAccTable = document.getElementById('accountSB-' + oldAccountId);
			let oldRecentTransactionEntry = oldAccTable.getElementsByClassName('recentTransactionEntry');
			if(oldRecentTransactionEntry.length == 0) {
				// Build empty account entry
				oldAccTable.appendChild(buildEmptyAccountEntry(oldAccountId));
			}
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

	// Populate Empty account entry
	function buildEmptyAccountEntry(accId) {
		let rowEmpty = document.createElement('div');
		rowEmpty.classList = 'd-lg-table-row recentTransactionDateGrp';
		rowEmpty.id = 'emptyAccountEntry-' + accId;

		let cell1 = document.createElement('div');
		cell1.classList = 'd-lg-table-cell align-middle imageWrapperCell text-center';

		let roundedCircle = document.createElement('div');
		roundedCircle.classList = 'rounded-circle align-middle circleWrapperImageRT mx-auto';
		roundedCircle.appendChild(buildEmptyAccTransactionsSvg());
		cell1.appendChild(roundedCircle);
		rowEmpty.appendChild(cell1);

		let cell2 = document.createElement('div');
		cell2.classList = 'descriptionCellRT align-middle d-lg-table-cell text-center';

		let emptyMessageRow = document.createElement('div');
		emptyMessageRow.classList = 'text-center tripleNineColor font-weight-bold';
		emptyMessageRow.innerText = "Oh! Snap! You don't have any transactions yet.";
		cell2.appendChild(emptyMessageRow);
		rowEmpty.appendChild(cell2);

		let cell3 = document.createElement('div');
		cell3.classList = 'descriptionCellRT d-lg-table-cell';
		rowEmpty.appendChild(cell3);
			
		return rowEmpty;
	}

	// Empty Transactions SVG
	function buildEmptyAccTransactionsSvg() {
		
		let svgElement = document.createElementNS("http://www.w3.org/2000/svg", 'svg');
		svgElement.setAttribute('width','32');
		svgElement.setAttribute('height','32');
    	svgElement.setAttribute('viewBox','0 0 64 64');
    	svgElement.setAttribute('class','align-middle transactions-empty-svg');
    	
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

}(jQuery));