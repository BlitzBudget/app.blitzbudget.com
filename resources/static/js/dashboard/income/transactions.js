"use strict";
(function scopeWrapper($) {

	// TRANSACTIONS CONSTANTS
	const TRANSACTIONS_CONSTANTS = {};
	// SECURITY: Defining Immutable properties as constants
	Object.defineProperties(TRANSACTIONS_CONSTANTS, {
		'firstWalletIdParam': { value : '?walletId=', writable: false, configurable: false},
	});

	// Description Text
	let descriptionTextEdited = '';
	// Amount Text
	let amountEditedTransaction = '';
	// User Updated Budegt
	let userUpdateBudgetCached = '';
	
	const replaceTransactionsId = "productsJson";
	const recentTransactionsId = 'recentTransactions';
	// Used to refresh the transactions only if new ones are added
	let registeredNewTransaction = false;
	// Divs for error message while adding transactions
	let errorAddingTransactionDiv = '<div class="row ml-auto mr-auto"><i class="material-icons red-icon">highlight_off</i><p class="margin-bottom-zero red-icon margin-left-five">';
	// Bills & Fees Options selection
	const selectedOption = '4';
	// Delete Transaction Button Inside TD
	const deleteButton = '<button class="btn btn-danger btn-sm removeRowTransaction">Remove</button>';
	// New Pie Chart Storage Variable
	let transactionsChart = '';
	// Fetch Drag Handle for transactions row table
	let dragHandle = fetchDragHandle();
	// recent transactions populated
	let recentTransactionsPopulated = false;
	// String Today
	const TODAY = 'Today';
	// Cache the recent transactions
	userTransSortedByDate = [];
	// Sort by Account is populated
	let sortByAccountPopulated = false;
	// Initialize transactions Cache
	window.transactionsCache = {};
	// Initialize user budget 
	window.userBudgetMap = {};

	/**
	 * START loading the page
	 * 
	 */
	if(isEqual(er.getCookie('currentPage'),'transactionsPage')) {
		er.refreshCookiePageExpiry('transactionsPage');
	 	er.fetchBudgetPage('/transactions', function(data) {
			// Call the transaction API to fetch information.
			fetchJSONForTransactions();
			// Load the new HTML
            $('#mutableDashboard').html(data);
            // Set Current Page
	        document.getElementById('currentPage').innerText = 'Transactions';
		});
	}
	
	document.getElementById('transactionsPage').addEventListener("click",function(e){
	 	er.refreshCookiePageExpiry('transactionsPage');
		er.fetchBudgetPage('/transactions', function(data) {
			// Call the transaction API to fetch information.
			fetchJSONForTransactions();
			// Load the new HTML
            $('#mutableDashboard').html(data);
            // Set Current Page
	        document.getElementById('currentPage').innerText = 'Transactions';
		});
	});
	
	
	/**
	 * START Load at the end of the javascript
	 */
	
	// Load Expense category and income category
	expenseSelectionOptGroup = cloneElementAndAppend(document.getElementById('expenseSelection'), expenseSelectionOptGroup);
	incomeSelectionOptGroup = cloneElementAndAppend(document.getElementById('incomeSelection'), incomeSelectionOptGroup);
	
	// Success SVG Fragment
	let successSVGFormed = successSvgMessage();
	
	// Load images in category modal
	loadCategoryModalImages();
	
	// Save Transactions on form submit
	$('#transactionsForm').submit(function(event) {
		// disable button after successful submission
	   let transactionSubmissionButton = document.getElementById('transactionsFormButtonSubmission');
	   transactionSubmissionButton.setAttribute("disabled", "disabled");
	   registerTransaction(event, transactionSubmissionButton);
	});
	
	function registerTransaction(event, transactionSubmissionButton){
	   event.preventDefault();
	   event.stopImmediatePropagation(); // necessary to prevent submitting the form twice
	   replaceHTML('successMessage' , '');
	   replaceHTML('errorMessage','');
	   let formValidation = true;
	   
	   let amount = document.getElementById('amount').value;
	   if(amount == null || amount == ''){
		   fadeoutMessage('#errorMessage', errorAddingTransactionDiv + 'Please fill the Amount.</p></div> <br/>',2000);
		   formValidation = false;
	   }
	   
	   amount = er.convertToNumberFromCurrency(amount,currentCurrencyPreference);
	   if(amount == 0){
		   fadeoutMessage('#errorMessage', errorAddingTransactionDiv + 'Amount cannot be zero.</p></div> <br/>',2000);
		   formValidation = false;
	   }
	   
	   if(!formValidation){
		   // enable button after successful submission
		   transactionSubmissionButton.removeAttribute("disabled");
		   return;
	   }
	    
	    amount = Math.abs(amount);
	    // Get all the input radio buttons for recurrence to check which one is clicked
	    let recurrence = document.getElementsByName('recurrence');
	    let recurrenceValue = 'NEVER';
	    
	    // If the recurrence is not empty then assign the checked one
	    if(isNotEmpty(recurrence)) {
	    	for(let count = 0, length = recurrence.length; count < length; count++) {
	    		if(recurrence[count].checked) {
	    			recurrenceValue = recurrence[count].value;
	    		}	
	    	}
	    }
	    
	    let description = document.getElementById('description').value;
	    let categoryOptions = document.getElementById('categoryOptions').value;
		let values = {};
		values['amount'] = amount;
		values['description'] = description;
		values['category'] = categoryOptions;
		values['dateMeantFor'] = chosenDate;
		values['recurrence'] = recurrenceValue;
		values['walletId'] = walletId;

		// Ajax Requests on Error
		let ajaxData = {};
		ajaxData.isAjaxReq = true;
   		ajaxData.type = "POST";
   		ajaxData.url = CUSTOM_DASHBOARD_CONSTANTS.transactionAPIUrl;
   		ajaxData.dataType = "json"; 
   		ajaxData.contentType = "application/json;charset=UTF-8";
   		ajaxData.data = JSON.stringify(values);
		ajaxData.onSuccess = function(data) {

        	let successMessageDocument = document.getElementById('successMessage');
        	// Clone and Append the success Message
        	successSVGFormed = cloneElementAndAppend(successMessageDocument , successSVGFormed);
        	// Add css3 to fade in and out
        	successMessageDocument.classList.add('messageFadeInAndOut');
        	// Set Registered new transactions as true
  	    	registeredNewTransaction=true;
  	    	// Update the transaction list to empty
		    userTransSortedByDate = [];
		    // Enable the Add Button
  	    	transactionSubmissionButton.removeAttribute("disabled");
  	    }
	    ajaxData.onFailure = function(data) {
  	    	fadeoutMessage('#errorMessage', errorAddingTransactionDiv + 'Unable to add this transaction.</p></div> <br/>',2000);
  	    	registeredNewTransaction=false;
  	    	transactionSubmissionButton.removeAttribute("disabled");

  	    	if(isEmpty(data)) {
				return;
			}

  	    	let responseError = JSON.parse(data.responseText);
           	if(responseError.error.includes("Unauthorized")){
  		    	$('#GSCCModal').modal('hide');
  		    	er.sessionExpiredSwal(ajaxData);
           	}
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
	
	
	// Use this function to fade the message out
	function fadeoutMessage(divId, message, milliSeconds){
		$(divId).fadeIn('slow').show().append(message);
    	setTimeout(function() {
    		$(divId).fadeOut();
    	}, milliSeconds);
	}
	
	// refresh the transactions page on closing the modal
	$('#GSCCModal').on('hidden.bs.modal', function () {
		// Add icon d-none
		document.getElementById('genericAddFnc').classList.toggle('d-none');
		// Clear form input fields inside the modal and the error or success messages.
		$('#transactionsForm').get(0).reset();
		replaceHTML('successMessage',"");
		replaceHTML('errorMessage',"");
		
		if(registeredNewTransaction) {

			// Populate category based table 
			fetchJSONForTransactions();
			// Do not refresh the transactions if no new transactions are added
			registeredNewTransaction = false;
		
			// Close category modal
         	closeCategoryModal();

         	// populate recent transactions /  category modal
			populateAccountOrRecentTransactionInfo();
		}		
	});

	// show the login modal
	$('#GSCCModal').on('show.bs.modal', function () {
		// Load Expense category and income category
		let expenseOptGroup = document.getElementById('expenseSelection');
		let incomeOptgroup = document.getElementById('incomeSelection');
		// If the Category items are not populate then populate them
		if(!expenseOptGroup.firstElementChild) {
			expenseSelectionOptGroup = cloneElementAndAppend(expenseOptGroup, expenseSelectionOptGroup);
		}
		if(!incomeOptgroup.firstElementChild) {
			incomeSelectionOptGroup = cloneElementAndAppend(incomeOptgroup, incomeSelectionOptGroup);
		}
	});

	// Change the focus to amount after the modal is shown
	$('#GSCCModal').on('shown.bs.modal', function () {
		// Change focus
		document.getElementById('amount').focus();
	});
	
	// Populates the transaction table
	function fetchJSONForTransactions(){
		// Ajax Requests on Error
		let ajaxData = {};
		ajaxData.isAjaxReq = true;
		ajaxData.type = 'GET';
		ajaxData.url = CUSTOM_DASHBOARD_CONSTANTS.transactionAPIUrl + TRANSACTIONS_CONSTANTS.firstWalletIdParam + currentUser.walletId + CUSTOM_DASHBOARD_CONSTANTS.dateMeantFor + chosenDate;
		ajaxData.onSuccess = function(result) {
        	  
        	er_a.populateBankInfo(result.BankAccount);

        	fetchJSONForCategories(result.Category);

			/*
			* replace With Currency
			*/
			replaceWithCurrency();

			let totalExpensesTransactions = result.expenseTotal;
			let totalIncomeTransactions = result.incomeTotal;
			let totalAvailableBalance = result.balance;
			let transactionsTableDiv = document.createDocumentFragment();
			let documentTbody = document.getElementById(replaceTransactionsId);
			// uncheck the select all checkbox if checked
			let checkAllBox = document.getElementById('checkAll');
			// Fetch all the key set for the result
			let resultKeySet = Object.keys(result.Category);
         	for(let countGrouped = 0, lengthArray = resultKeySet.length; countGrouped < lengthArray; countGrouped++) {
         	   let key = resultKeySet[countGrouped];
         	   let category = result[key];
 			   
 			   // Load all the total category amount in the category section
 			   let categoryAmountTotal = currentCurrencyPreference + formatNumber(category['category_total'], currentUser.locale);
 			   // Create category label table row
 			   transactionsTableDiv.appendChild(createTableCategoryRows(category, countGrouped, categoryAmountTotal));
         	}

         	let transaction = Object.keys(result.Transaction);
         	for(let count = 0, length = transaction.length; count < length; count++) {
			  let subKey = transaction[count];
			  let transactionObj = transaction[subKey];
			  // Cache the value for exportation
			  window.transactionsCache[transactionObj.transactionId] = transactionObj;
			  // Create transactions table row
			  transactionsTableDiv.appendChild(createTableRows(transactionObj, 'd-none', key));
		    }
			   
		    // Update table with empty message if the transactions are empty
		    if(result.length == 0) {
			   checkAllBox.setAttribute('disabled', 'disabled');
   				// Replace HTML with Empty
       			while (documentTbody.firstChild) {
       				documentTbody.removeChild(documentTbody.firstChild);
       			}

			   document.getElementById(replaceTransactionsId).appendChild(fetchEmptyTableMessage());
		    } else {
			    $('#checkAll').prop('checked', false);
   			    checkAllBox.removeAttribute('disabled');
  			    // Replace HTML with Empty
      		    while (documentTbody.firstChild) {
      			  documentTbody.removeChild(documentTbody.firstChild);
      		    }

			    documentTbody.appendChild(transactionsTableDiv);
		    }
			   
			// Disable delete Transactions button on refreshing the transactions
	        manageDeleteTransactionsButton();
			// update the Total Available Section
			updateTotalAvailableSection(totalIncomeTransactions , totalExpensesTransactions, totalAvailableBalance);
			// Update Budget from API
			updateBudgetForIncome(result.Budget);
			// Change the table sorting on page load
			er.tableSortMechanism();
        }
		ajaxData.onFailure = function(thrownError) {
			manageErrors(thrownError, "There was an error while fetching the transactions. Please try again later!",ajaxData);
        }
		// Load all user transaction from API
		jQuery.ajax({
			url: ajaxData.url,
			beforeSend: function(xhr){xhr.setRequestHeader("Authorization", authHeader);},
            type: ajaxData.type,
            success: ajaxData.onSuccess, 
            error: ajaxData.onFailure
		});
	}
	
	// Fetches the budget for all the category rows if present and updates the category row
	function updateBudgetForIncome(data) {
    	let dataKeySet = Object.keys(data)
    	for(let count = 0, length = dataKeySet.length; count < length; count++){
    		let key = dataKeySet[count];
        	let value = data[key];
        	// Update user budget to global map (Exportation)
			window.userBudgetMap[value.categoryId] = value;
        	  
        	if(isEmpty(value)) {
        		continue;
        	}
        	  
        	let categoryRowToUpdate = document.getElementById('budgetCategory-' + value.categoryId);
        	  
        	if(categoryRowToUpdate == null) {
        		continue;
        	}
        	  
        	categoryRowToUpdate.innerText = currentCurrencyPreference + formatNumber(value.planned, currentUser.locale);
    	}
		
	}
	
	// Updates the total income and total expenses
	function updateTotalAvailableSection(totalIncomeTransactions , totalExpensesTransactions, totalAvailableTransactions) {

		   if(totalAvailableTransactions < 0) {
		   	   animateValue(document.getElementById('totalAvailableTransactions'), 0, Math.abs(totalAvailableTransactions),  '-' + currentCurrencyPreference ,200);
		   } else {
		   	   animateValue(document.getElementById('totalAvailableTransactions'), 0, totalAvailableTransactions, currentCurrencyPreference ,200);
		   }

           animateValue(document.getElementById('totalIncomeTransactions'), 0, totalIncomeTransactions, currentCurrencyPreference ,200);
		   animateValue(document.getElementById('totalExpensesTransactions'), 0, totalExpensesTransactions, '-' + currentCurrencyPreference ,200);
		   
		   // Build Pie chart
		   buildPieChart(updatePieChartTransactions(totalIncomeTransactions, totalExpensesTransactions), 'chartFinancialPosition');
		   
	}
	
	// Update the pie chart with transactions data
	function updatePieChartTransactions(totalIncomeTransactions, totalExpensesTransactions) {
		let dataPreferences = {};
		if(totalIncomeTransactions === 0 && totalExpensesTransactions === 0) {
			replaceHTML('legendPieChart', 'Please fill in adequare data build the chart');
		} else if (totalIncomeTransactions < totalExpensesTransactions) {
			let totalDeficitDifference = totalExpensesTransactions - totalIncomeTransactions;
			let totalDeficitAsPercentageOfExpense = round(((totalDeficitDifference / totalExpensesTransactions) * 100),1);
			   
			let totalIncomeAsPercentageOfExpense = round((((totalExpensesTransactions - totalDeficitDifference) / totalExpensesTransactions) * 100),1);
			   
			// labels: [INCOME,EXPENSE,AVAILABLE]
			dataPreferences = {
		                labels: [totalIncomeAsPercentageOfExpense + '%',,totalDeficitAsPercentageOfExpense + '%'],
		                series: [totalIncomeTransactions,,totalDeficitDifference]
		            };
			
			replaceHTML('legendPieChart', 'Total Income & Total Overspent as a percentage of Total Expense');
			replaceHTML('totalAvailableLabel', 'Total Overspent');
		} else  {
			// (totalIncomeTransactions > totalExpensesTransactions) || (totalIncomeTransactions == totalExpensesTransactions)
			let totalAvailable = totalIncomeTransactions - totalExpensesTransactions;
			let totalAvailableAsPercentageOfIncome = round(((totalAvailable / totalIncomeTransactions) * 100),1);
			   
			let totalExpenseAsPercentageOfIncome = round((((totalIncomeTransactions - totalAvailable) / totalIncomeTransactions) * 100),1);
			   
			// labels: [INCOME,EXPENSE,AVAILABLE]
			dataPreferences = {
		                labels: [, totalExpenseAsPercentageOfIncome + '%',totalAvailableAsPercentageOfIncome + '%'],
		                series: [, totalExpensesTransactions,totalAvailable]
		            };
			
			replaceHTML('legendPieChart', 'Total Expense & Total Available as a percentage of Total Income');
			replaceHTML('totalAvailableLabel', 'Total Available');
		        
		}
		
		return dataPreferences;
		
	}
	
	
	// Building a HTML table for transactions
	function createTableRows(userTransactionData, displayNoneProperty, categoryId){
		let tableRows = document.createElement("div");
		tableRows.className = 'hideableRow-' + categoryId + ' hideableRow ' + displayNoneProperty;
		
		// Cell 1
		let indexTableCell = document.createElement('div');
		indexTableCell.className = 'text-center d-table-cell draggable-handle-wrapper';
		indexTableCell.tabIndex = -1;
		indexTableCell.draggable = true;
		
		// obtains the drag handle and clones them into index cell
		dragHandle = cloneElementAndAppend(indexTableCell, dragHandle);
    	tableRows.appendChild(indexTableCell);
    	
		// Table Cell 2
		let formCheckDiv = document.createElement('div');
		formCheckDiv.className = 'form-check';
		formCheckDiv.tabIndex = -1;
		
		let fromCheckLabel = document.createElement('label');
		fromCheckLabel.className = 'form-check-label';
		fromCheckLabel.tabIndex = -1;
		
		let inputFormCheckInput = document.createElement('input');
		inputFormCheckInput.className = 'number form-check-input';
		inputFormCheckInput.type = 'checkbox';
		inputFormCheckInput.innerHTML = userTransactionData.transactionId;
		inputFormCheckInput.tabIndex = -1;
		
		let formCheckSignSpan = document.createElement('span');
		formCheckSignSpan.className = 'form-check-sign';
		formCheckSignSpan.tabIndex = -1;
		
		let checkSpan = document.createElement('span');
		checkSpan.className = 'check';
		formCheckSignSpan.appendChild(checkSpan);
		fromCheckLabel.appendChild(inputFormCheckInput);
		fromCheckLabel.appendChild(formCheckSignSpan);
		formCheckDiv.appendChild(fromCheckLabel);
		
		let checkboxCell = document.createElement('div');
		checkboxCell.tabIndex = -1;
		checkboxCell.className = 'd-table-cell text-center';
		checkboxCell.appendChild(formCheckDiv);
		tableRows.appendChild(checkboxCell);
		
		// Table Cell 3
		let selectCategoryRow = document.createElement('div');
		selectCategoryRow.className = 'd-table-cell';
		
		// Build Select
		let selectCategory = document.createElement('select');
		selectCategory.setAttribute("id", 'selectCategoryRow-' + userTransactionData.transactionId);
		selectCategory.className = 'tableRowForSelectCategory categoryIdForSelect-' + categoryId + ' tableRowSelectCategory';
		selectCategory.setAttribute('aria-haspopup', true);
		selectCategory.setAttribute('aria-expanded', false);
		
		let optGroupExpense = document.createElement('optgroup');
		optGroupExpense.label = 'Expenses';
		expenseSelectionOptGroup = cloneElementAndAppend(optGroupExpense, expenseSelectionOptGroup);
		selectCategory.appendChild(optGroupExpense);
		
		let optGroupIncome = document.createElement('optgroup');
		optGroupIncome.label = 'Income';
		incomeSelectionOptGroup =  cloneElementAndAppend(optGroupIncome, incomeSelectionOptGroup);
		selectCategory.appendChild(optGroupIncome);
		selectCategoryRow.appendChild(selectCategory);
		
		// Set the relevant category in the options to selected
		let toSelectOption = selectCategoryRow.getElementsByClassName('categoryOption-' + categoryId);
		toSelectOption[0].selected = 'selected';
		tableRows.appendChild(selectCategoryRow);
		
		// Table Cell 4
		let descriptionTableRow = document.createElement('div');
		descriptionTableRow.setAttribute('id', 'descriptionTransactionsRow-' + userTransactionData.transactionId);
		descriptionTableRow.className = 'transactionsTableDescription d-md-table-cell d-none';
		descriptionTableRow.setAttribute('data-gramm_editor' , false);
		descriptionTableRow.tabIndex = -1;
		
		let descriptionDiv = document.createElement('div');
		descriptionDiv.setAttribute('contenteditable', true);
		descriptionDiv.tabIndex = 0;
		descriptionDiv.className = 'descriptionDivCentering';
		descriptionDiv.innerHTML = userTransactionData.description;
		
		descriptionTableRow.appendChild(descriptionDiv);
		tableRows.appendChild(descriptionTableRow);
		
		// Table Cell 5
		let amountTransactionsRow = document.createElement('div');
		amountTransactionsRow.setAttribute('id', 'amountTransactionsRow-' + userTransactionData.transactionId);
		amountTransactionsRow.className = 'text-right amountTransactionsRow d-table-cell';
		amountTransactionsRow.setAttribute('data-gramm_editor', false);
		amountTransactionsRow.tabIndex = -1;
		
		// Append Amount To Div
		let amountDiv = document.createElement('div');
		amountDiv.setAttribute('contenteditable', true);
		amountDiv.className = 'amountDivCentering';
		amountDiv.tabIndex = 0;
		
	   // Append a - sign if it is an expense
	   if(categoryMap[categoryId].parentCategory == CUSTOM_DASHBOARD_CONSTANTS.expenseCategory) {
		   amountDiv.innerHTML = '-' + currentCurrencyPreference + formatNumber(userTransactionData.amount, currentUser.locale);
	   } else {
		   amountDiv.innerHTML = currentCurrencyPreference + formatNumber(userTransactionData.amount, currentUser.locale);
	   }
		
	   amountTransactionsRow.appendChild(amountDiv);
	   tableRows.appendChild(amountTransactionsRow);
	   
	   // Table Cell 6
	   let budgetTransactionRow = document.createElement('div');
	   budgetTransactionRow.setAttribute('id', 'budgetTransactionsRow-' + userTransactionData.transactionId);
	   budgetTransactionRow.className = 'text-right d-md-table-cell d-none categoryIdForBudget-' + categoryId;
	   budgetTransactionRow.tabIndex = -1;
	   
	    // append button to remove the transaction if the amount is zero
	   	let buttonDelete = userTransactionData.amount == 0 ? deleteButton : '';
	   	
	   	budgetTransactionRow.innerHTML = buttonDelete;
	   	tableRows.appendChild(budgetTransactionRow);
	   	
		
		return tableRows;
		
	}
	
	// Building a HTML table for category header for transactions
	function createTableCategoryRows(category, countGrouped, categoryAmountTotal){
		let tableRow = document.createElement("div");
		tableRow.setAttribute('id', 'categoryTableRow-' + category.categoryId);
		tableRow.setAttribute('data-toggle', 'collapse');
		tableRow.setAttribute('role' , 'button');
		
		// Change the table color if for expense vs income
		if(category['category_type'] == CUSTOM_DASHBOARD_CONSTANTS.expenseCategory) {
			tableRow.className = 'toggle d-table-row expenseCategory categoryTableRow-' + category.categoryId;
		} else {
			tableRow.className = 'toggle d-table-row incomeCategory categoryTableRow-' + category.categoryId;
		}
		
		// Row 1
		let indexTableCell = document.createElement('div');
		indexTableCell.className = 'text-center d-table-cell dropdown-toggle-right font-17';
		tableRow.appendChild(indexTableCell);
		
		// Table Row 2
		let checkboxCell = document.createElement('div');
		checkboxCell.tabIndex = -1;
		checkboxCell.className = 'd-table-cell';
		tableRow.appendChild(checkboxCell);
		
		
		// Table Row 3
		let selectCategoryRow = document.createElement('div');
		selectCategoryRow.className = 'font-weight-bold d-table-cell';
		
		let categoryNameWrapper = document.createElement('div');
		categoryNameWrapper.className = 'd-inline';
		categoryNameWrapper.innerHTML = category['category_name'];
		
		let linkElementWrapper = document.createElement('a');
		linkElementWrapper.href = '#';
		linkElementWrapper.id = 'addTableRow-' + category.categoryId;
		linkElementWrapper.className = 'd-inline addTableRowListener align-self-center';
		
		let addIconElement = document.createElement('i');
		addIconElement.className = 'material-icons displayCategoryAddIcon';
		addIconElement.innerHTML = 'add_circle_outline';
		
		linkElementWrapper.appendChild(addIconElement);
		categoryNameWrapper.appendChild(linkElementWrapper);
		selectCategoryRow.appendChild(categoryNameWrapper);
		tableRow.appendChild(selectCategoryRow);
		
		// Table Row 4
		let descriptionTableRow = document.createElement('div');
		descriptionTableRow.className = 'd-table-cell';
		tableRow.appendChild(descriptionTableRow);
		
		// Table Row 5
		let amountTransactionsRow = document.createElement('div');
		amountTransactionsRow.setAttribute('id', 'amountCategory-' + category.categoryId);
		
		if(category['category_type'] == CUSTOM_DASHBOARD_CONSTANTS.expenseCategory) {
			amountTransactionsRow.className = 'text-right category-text-danger font-weight-bold d-table-cell spendingTrans amountCategoryId-' + category.categoryId;
		} else {
			amountTransactionsRow.className = 'text-right category-text-success font-weight-bold d-table-cell incomeTrans amountCategoryId-' + category.categoryId;
		}
		
		// Append a - sign for the category if it is an expense
	   if(category['category_type'] == CUSTOM_DASHBOARD_CONSTANTS.expenseCategory) {
		   amountTransactionsRow.innerHTML = '-' + categoryAmountTotal;
	   } else {
		   amountTransactionsRow.innerHTML = categoryAmountTotal;
	   }
	   tableRow.appendChild(amountTransactionsRow);
	   
	   // Table Row 6
	   let budgetTransactionsRow = document.createElement('div');
	   budgetTransactionsRow.setAttribute('id', 'budgetCategory-' + category.categoryId);
	   budgetTransactionsRow.className = 'text-right d-table-cell font-weight-bold';
	   tableRow.appendChild(budgetTransactionsRow);
	   
	   return tableRow;
		
	}
	
	// Disable Button if no check box is clicked and vice versa
	$( "#transactionsTable" ).on( "click", ".number" ,function() {
		let checkAllElementChecked = $("#checkAll:checked");
		if(checkAllElementChecked.length > 0) {
			// uncheck the check all if a check is clicked and if the check all is already clicked
			checkAllElementChecked.prop('checked', false);
		}
		
		// Click the checkAll is all the checkboxes are clicked
		checkAllIfAllAreChecked();
		manageDeleteTransactionsButton();
		
		// Change color of the background when the check box is checked
		$(this).parent().closest('div').parent().closest('div').parent().closest('div').toggleClass('background-snow', 300);
	});
	
	// Check All if all of the checkbox is clicked
	function checkAllIfAllAreChecked() {
		// Click the checkAll is all the checkboxes are clicked
		let allCheckedTransactions = $(".number:checked");
		let allTransactions = $(".number");
		if(allCheckedTransactions.length == allTransactions.length) {
			$("#checkAll").prop('checked', true);
		}
	}
	
	// Select all check boxes for Transactions
	$("#checkAll").click(function () {
		$('input[type="checkbox"]').prop('checked', $(this).prop('checked'));
		manageDeleteTransactionsButton();
	});
	
	// Function to enable of disable the delete transactions button
	function manageDeleteTransactionsButton(){
		if($( ".number:checked" ).length > 0 || $("#checkAll:checked").length > 0) {
			// If length > 0 then change the add button to add
			document.getElementById('addFncTT').innerText = 'delete';
			document.getElementById('genericAddFnc').classList.remove('btn-success');
			document.getElementById('genericAddFnc').classList.add('btn-danger');
			// Show the export button in conjunction with delete button
			let expDataCL = document.getElementById('exportData').classList;
			expDataCL.remove('d-none');
			expDataCL.add('d-inline-block');
			// show the Sort Options wrapper
			let sortOptionsWrapper = document.getElementById('sortOptionsWrapper').classList;
			sortOptionsWrapper.add('d-none');
			sortOptionsWrapper.remove('d-inline-block');
		} else {
			 // If length > 0 then change the add button to add
			document.getElementById('addFncTT').innerText = 'add';
			document.getElementById('genericAddFnc').classList.add('btn-success');
			document.getElementById('genericAddFnc').classList.remove('btn-danger');
			// Hide the export button in conjunction with delete button
			let expDataCL = document.getElementById('exportData').classList;
			expDataCL.add('d-none');
			expDataCL.remove('d-inline-block');
			// show the Sort Options wrapper
			let sortOptionsWrapper = document.getElementById('sortOptionsWrapper').classList;
			sortOptionsWrapper.remove('d-none');
			sortOptionsWrapper.add('d-inline-block');
		}  
	}
	
	// Swal Sweetalerts
	popup = {
		showSwal: function(type) {
			// Delete transactions On click
			if (type == 'warning-message-and-confirmation') {
			 	Swal.fire({	
	                title: 'Are you sure?',
	                text: 'You will not be able to recover these transactions!',
	                icon: 'warning',
	                showCancelButton: true,
	                confirmButtonText: 'Yes, delete it!',
	                cancelButtonText: 'No, keep it',
	                confirmButtonClass: "btn btn-success",
	                cancelButtonClass: "btn btn-danger",
	                buttonsStyling: false,
	            }).then(function(result) {
	            	// Add icon d-none
					document.getElementById('genericAddFnc').classList.toggle('d-none');
					// After OKAY button
	            	if (result.value) {
	             		// Check all check boxes by default
	                    let transactionIds = [];
	                    
	                    let allCheckedItems = $("input[type=checkbox]:checked");
	                    for(let i = 0, length = allCheckedItems.length; i < length; i++) {
	                     	// To remove the select all check box values
	                    	let transactionId = allCheckedItems[i].innerHTML;
	                    	
	                    	// Remove the check all from the list
	                    	if(isEqual(allCheckedItems[i].id, 'checkAll')) {
	                    		continue;
	                    	}
	                    	
	                    	// Google Chrome Compatibility 
	                        if(isEmpty(transactionId)) {
	                        	transactionId = allCheckedItems[i].childNodes[0].nodeValue; 
	                        }
	                    	
	                     	if(transactionId != "on" && isNotBlank(transactionId)){
	                     		transactionIds.push(transactionId);
	                     	}
	                    }

	                    transactionIds.join(",");
	                     
	                    // Ajax Requests on Error
						let ajaxData = {};
						ajaxData.isAjaxReq = true;
						ajaxData.type = 'DELETE';
						ajaxData.url = CUSTOM_DASHBOARD_CONSTANTS.transactionAPIUrl + currentUser.walletId + '/' + transactionIds + CUSTOM_DASHBOARD_CONSTANTS.dateMeantFor + chosenDate;
						ajaxData.contentType = "application/json; charset=utf-8";
						ajaxData.onSuccess = function(result) {
                        	showNotification('Successfully deleted the selected transactions',window._constants.notification.success);
                        	
                        	let checkAllClicked = $("#checkAll:checked").length > 0;
                        	
                        	// If Check All is clicked them empty div and reset pie chart
                        	if(checkAllClicked){
                        		// uncheck the select all checkbox if checked
                        		let checkAllBox = document.getElementById('checkAll');
                        		$('#checkAll').prop('checked',false);
                        		checkAllBox.setAttribute('disabled','disabled');
                 			   	// Remove other table data
                 			   	removeAllTableData();
                 			   	// update the Total Available Section with 0
                 	    		updateTotalAvailableSection(0 , 0, 0);
                 	    		// Disable delete Transactions button on refreshing the transactions
	                         	manageDeleteTransactionsButton();
	                         	// Close category modal
	                         	closeCategoryModal();
                        	} else {
                        		// Choose the closest parent Div for the checked elements
	                        	let elementsToDelete = $('.number:checked').parent().closest('div').parent().closest('div').parent().closest('div');
	                        	let iterateOnceAfterCompletion = elementsToDelete.length;
                        		// Remove all the elements
	                        	elementsToDelete.fadeOut('slow', function(){ 
	                        		this.remove();
	                        		// Remove entries from table
	                        		removeEntriesFromTable(this);
	                        		
	                        		// Execute the condition only once after all the transactions are removed.
	                        		if(!--iterateOnceAfterCompletion) {
	                        			// Disable delete Transactions button on refreshing the transactions
			                         	manageDeleteTransactionsButton();
			                         	
			                         	// To recalculate the category total amount and to reduce user budget for the category appropriately
			                         	//TODO
	                        		}
		                         	
	                        	});
                        	}
                        }
						ajaxData.onFailure = function (thrownError) {
						 	manageErrors(thrownError, 'Unable to delete the transactions',ajaxData);
                        }

	                    jQuery.ajax({
	                        url: ajaxData.url,
	                        beforeSend: function(xhr){xhr.setRequestHeader("Authorization", authHeader);},
	                        type: ajaxData.type,
	                        contentType: ajaxData.contentType, 
	                        success: ajaxData.onSuccess,
	                        error: ajaxData.onFailure
	                    });
	             	
	                }
	            });
		    } 
		}
	}

	// Remove all other table Data
	function removeAllTableData() {
		let documentTbody = document.getElementById(replaceTransactionsId);
		// Replace HTML with Empty
	   	while (documentTbody.firstChild) {
	   		documentTbody.removeChild(documentTbody.firstChild);
	   	}
	   	documentTbody.appendChild(fetchEmptyTableMessage());
		let recentTransactionsTab = document.getElementById(recentTransactionsId);
		// Replace HTML with Empty
	   	while (recentTransactionsTab.firstChild) {
	   		recentTransactionsTab.removeChild(recentTransactionsTab.firstChild);
	   	}
	   	recentTransactionsTab.appendChild(buildEmptyTransactionsTab());
	   	// CHange the recent transactions populated to false
	   	recentTransactionsPopulated = false;
	   	// Update the transaction list to empty
	   	userTransSortedByDate = [];
	   	// Change the Account populated to false
	   	sortByAccountPopulated = false;
	   	// Remove all Account Data Table
	   	$('.accountInfoTable').remove();
	}

	// Show or hide multiple rows in the transactions table
	$( "#transactionsTable" ).on( "click", ".toggle" ,function() {
		let categoryId = lastElement(splitElement(this.id,'-'));
		
		if(er.checkIfInvalidCategory(categoryId)) {
			return;
		}
		
		toggleDropdown(categoryId, this);
	 });
	
	// toggle dropdown
	function toggleDropdown(categoryId, closestTrElement) {
		let classToHide = '.hideableRow-' + categoryId;
		let childCategories = $(classToHide);
		let dropdownArrowDiv = closestTrElement.firstElementChild.classList;
	  	// Hide all child categories
		childCategories.toggleClass('d-none').toggleClass('d-table-row');
	  	// Toggle the drop down arrow
	  	dropdownArrowDiv.toggle('rotateNinty');
	  	closestTrElement.classList.toggle('categoryShown');
	  	// If the category modal is active then hide it
	  	toggleCategoryModal(closestTrElement);
	}
	
	// Catch the description when the user focuses on the description
	$( "#transactionsTable" ).on( "focusin", ".tableRowForSelectCategory" ,function() {
		let closestTableRow = $(this).parent().closest('div');
		// Remove BR appended by mozilla
		if(closestTableRow != null && closestTableRow.length > 0 && closestTableRow[0] != null) {
			if(closestTableRow[0].children != null && closestTableRow[0].children.length >= 4) {
				if(closestTableRow[0].children[3] != null && closestTableRow[0].children[3].children != null && closestTableRow[0].children[3].children[1] != null) {
					closestTableRow[0].children[3].children[1].remove();
				}
			}
		}
		closestTableRow[0].classList.add('tableRowTransactionHighlight');
	});
	
	// Process the description to find out if the user has changed the description
	$( "#transactionsTable" ).on( "focusout", ".tableRowForSelectCategory" ,function() {
		$(this).parent().closest('div')[0].classList.remove('tableRowTransactionHighlight');
	});
	
	// Change trigger on select
	$( "#transactionsTable" ).on( "change", ".tableRowForSelectCategory" ,function() {
		let categoryId = this.id;
		let selectedTransactionId = splitElement(categoryId,'-');
		let classList = $('#' + categoryId).length > 0 ? $('#' + categoryId)[0].classList : null;
		
		if(isNotEmpty(classList)) {
			
			// Ensure that the category id is valid
			if(er.checkIfInvalidCategory(this.value)) {
				return;
			}
			
			let values = {};
			values['categoryId'] = this.value;
			values['transactionId'] = selectedTransactionId[selectedTransactionId.length - 1];
			values['dateMeantFor'] = chosenDate;
			values['walletId'] = currentUser.walletId;
			values['transactionId'] = transactionId; //TODO

			// Ajax Requests on Error
			let ajaxData = {};
			ajaxData.isAjaxReq = true;
			ajaxData.type = "PATCH";
			ajaxData.url = CUSTOM_DASHBOARD_CONSTANTS.transactionAPIUrl;
			ajaxData.dataType = "json"; 
			ajaxData.contentType = "application/json;charset=UTF-8";
			ajaxData.data = JSON.stringify(values);
			ajaxData.onSuccess = function(userTransaction){
	        	  let previousCategoryId ='';
	        	  
        		  // Update the current category
	        	  for(let i=0, length = classList.length; i < length ; i++) {
	        		  let classItem = classList[i]
	        		  if(includesStr(classItem,'categoryIdForSelect')){
	        			// Remove amount from current Category
	        			  previousCategoryId = lastElement(splitElement(classItem,'-'));
	    	        	  updateCategoryAmount(previousCategoryId , parseFloat('-' + userTransaction.amount), false);
	        		  }
	        	  }
	        	  
	        	  // Remove previous class related to category id and add the new one
	        	  let selectOption = document.getElementById(categoryId);
	        	  selectOption.classList.remove('categoryIdForSelect-' + previousCategoryId);
	        	  selectOption.classList.add('categoryIdForSelect-'+ userTransaction.categoryId);
	        	  // Add to the new category
	        	  updateCategoryAmount(userTransaction.categoryId, userTransaction.amount, false);
	        }
			ajaxData.onFailure = function (thrownError) {
				manageErrors(thrownError, 'Unable to change the category.',ajaxData);
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
	});
	
	// Catch the description when the user focuses on the description
	$( "#transactionsTable" ).on( "focusin", ".transactionsTableDescription" ,function() {
		// Remove BR appended by mozilla
		$('.transactionsTableDescription br[type="_moz"]').remove();
		descriptionTextEdited = trimElement(this.innerText);
		$(this).parent().closest('div').addClass('tableRowTransactionHighlight');
	});
	
	// Process the description to find out if the user has changed the description
	$( "#transactionsTable" ).on( "focusout", ".transactionsTableDescription" ,function() {
		
		postNewDescriptionToUserTransactions(this);
		$(this).parent().closest('div').removeClass('tableRowTransactionHighlight');
	});
	
	// Description - disable enter key and submit request (key press necessary for prevention of a new line)
	$('#transactionsTable').on('keypress', '.transactionsTableDescription' , function(e) {
		  let keyCode = e.keyCode || e.which;
		  if (keyCode === 13) {
			document.activeElement.blur();
		    e.preventDefault();
		    e.stopPropagation();
		  }
	});
	
	// A function to post an ajax call to description
	function postNewDescriptionToUserTransactions(element) {
		// If the text is not changed then do nothing
		let enteredText = trimElement(element.innerText);
		
		if(isEqual(descriptionTextEdited, enteredText)){
			// replace the text with a trimmed version 
			let documentDescription = document.createElement('div');
			documentDescription.setAttribute('contenteditable', true);
			documentDescription.tabIndex = 0;
			documentDescription.className = 'descriptionDivCentering';
			documentDescription.innerHTML = enteredText;
			// Replace HTML with Empty
			while (element.firstChild) {
				element.removeChild(element.firstChild);
			}
			element.appendChild(documentDescription);
			// Set the description to empty as the data need not be stored.
			descriptionTextEdited = '';
			return;
		}
		
		let changedDescription = splitElement($(element).attr('id'),'-');
		var values = {};
		values['description'] = enteredText;
		values['transactionId'] = changedDescription[changedDescription.length - 1];
		values['dateMeantFor'] = chosenDate;
		values['walletId'] = currentUser.walletId;
		values['transactionId'] = currentUser.transactionId;

		// Ajax Requests on Error
		let ajaxData = {};
		ajaxData.isAjaxReq = true;
		ajaxData.type = "PATCH";
		ajaxData.url = CUSTOM_DASHBOARD_CONSTANTS.transactionAPIUrl;
		ajaxData.dataType = "json"; 
		ajaxData.contentType = "application/json;charset=UTF-8";
		ajaxData.data = JSON.stringify(values);
		ajaxData.onSuccess = function(result) {
        	// Set the description to empty as the data need not be stored.
      		descriptionTextEdited = '';
        }
		ajaxData.onFailure = function (thrownError) {
			manageErrors(thrownError, 'Unable to change the description.',ajaxData);
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
		
		// Prevent repeated enter button press from calling the server
  		descriptionTextEdited = enteredText;
		
	}
	
	// Catch the amount when the user focuses on the transaction
	$( "#transactionsTable" ).on( "focusin", ".amountTransactionsRow" ,function() {
		amountEditedTransaction = trimElement(this.innerText);
		$(this).parent().closest('div').addClass('tableRowTransactionHighlight');
	});
	
	// Process the amount to find out if the user has changed the transaction amount (Disable async to update total category amount)
	$( "#transactionsTable" ).on( "focusout", ".amountTransactionsRow" ,function() {
		postNewAmountToUserTransactions(this);
		$(this).parent().closest('div').removeClass('tableRowTransactionHighlight');
	});
	
	// Amount - disable enter key and submit request (Key up for making sure that the remove button is shown)
	$('#transactionsTable').on('keypress', '.amountTransactionsRow' , function(e) {
		  let keyCode = e.keyCode || e.which;
		  if (keyCode === 13) {
		  	e.preventDefault();
		    e.stopPropagation();
			document.activeElement.blur();
		  } else {
		  	let amountEntered = er.convertToNumberFromCurrency(this.innerText,currentCurrencyPreference);
			let selectTransactionId = splitElement(this.id,'-');
			// Handles the addition of buttons in the budget column for the row
			appendButtonForAmountEdition(amountEntered, selectTransactionId);
		  }
	});

	// Append amount to user transaction
	function postNewAmountToUserTransactions(element){
		// If the text is not changed then do nothing (Remove currency locale and minus sign, remove currency formatting and take only the number and convert it into decimals) and round to 2 decimal places
		let enteredText = er.convertToNumberFromCurrency(element.innerText, currentCurrencyPreference);
		let previousText = er.convertToNumberFromCurrency(amountEditedTransaction, currentCurrencyPreference);
		
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
			// obtain the transaction id of the table row
			let changedAmount = splitElement(element.id,'-');
			var values = {};
			values['amount'] = enteredText;
			values['transactionId'] = changedAmount[changedAmount.length - 1];
			values['dateMeantFor'] = chosenDate;
			values['walletId'] = currentUser.walletId;
			let totalAddedOrRemovedFromAmount = round(parseFloat(enteredText - previousText),2);
			// Ajax Requests on Error
			let ajaxData = {};
			ajaxData.isAjaxReq = true;
			ajaxData.type = "POST";
			ajaxData.url = CUSTOM_DASHBOARD_CONSTANTS.transactionAPIUrl;
			ajaxData.dataType = "json"; 
			ajaxData.contentType = "application/json;charset=UTF-8";
			ajaxData.data = JSON.stringify(values);
			ajaxData.onSuccess = function(userTransaction){
	        	  // Set the amount to empty as the data need not be stored.
	        	  amountEditedTransaction = '';
	        	  let categoryRowElement = document.getElementById('categoryTableRow-' + userTransaction.categoryId);
	        	  updateCategoryAmount(userTransaction.categoryId, totalAddedOrRemovedFromAmount, true);
	        	  handleCategoryModalToggle(userTransaction.categoryId, categoryRowElement, '');
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
		
		// replace the text with a trimmed version
		appendCurrencyToAmount(element, enteredText);
		
		// Prevent repeated enter button press from calling the server
  	  	amountEditedTransaction = enteredText;
	}
	
	// Append appropriate buttons when the amount is edited
	function appendButtonForAmountEdition(enteredText, selectTransactionId) {
		// append remove button if the transaction amount is zero
		let budgetTableCell = document.getElementById('budgetTransactionsRow-' + selectTransactionId[selectTransactionId.length - 1]);
		
		if(enteredText == 0 || isNaN(enteredText)){
		  // Handles the addition of buttons in the budget column for the row
		  budgetTableCell.innerHTML = deleteButton;
		  budgetTableCell.classList.add('fadeInAnimation');
		} else if(enteredText > 0 && budgetTableCell != null){
		  budgetTableCell.classList.add('fadeOutAnimation');
		  // Replace HTML with Empty
 		  while (budgetTableCell.firstChild) {
 			 budgetTableCell.removeChild(budgetTableCell.firstChild);
 		  }
		}
	}
	
	// Update the category amount
	function updateCategoryAmount(categoryId, totalAddedOrRemovedFromAmount, updateTotal){
		
		  let categoryRows = document.getElementsByClassName('amountCategoryId-' + categoryId);
		  // if the category has not been added yet
		  if(isEmpty(categoryRows)){
			 return;
		  }
		  
		  categoryRows = categoryRows[0];
		  let newCategoryTotal = 0;
	  	  let categoryTotal = categoryRows.innerText;
	  	  // Convert to number regex
	  	  let previousCategoryTotal = parseFloat(categoryTotal.replace(/[^0-9.-]+/g,""));
	  	  previousCategoryTotal = Math.abs(previousCategoryTotal);
	  	  let minusSign = '';
	  	  if(includesStr(categoryTotal,'-')){
	  		  minusSign = '-';
	  	  }
	  	  newCategoryTotal = round(previousCategoryTotal + totalAddedOrRemovedFromAmount,2);
	  	  // Format the newCategoryTotal to number and format the number as currency
	  	  replaceHTML(categoryRows , minusSign + currentCurrencyPreference + formatNumber(newCategoryTotal, currentUser.locale));
	  	  
	  	  if(updateTotal){
	  		  // Obtain the class list of the category table row
		  	  let categoryForCalculation = categoryRows.classList;
		  	  updateTotalCalculations(categoryForCalculation, totalAddedOrRemovedFromAmount);
	  	  }
	}
	
	// Updates the final amount section with the current value
	function updateTotalCalculations(categoryForCalculation , totalAddedOrRemovedFromAmount){
		
		if(categoryForCalculation.contains('spendingTrans')) {
			let currentValueExpense = er.convertToNumberFromCurrency(document.getElementById('totalExpensesTransactions').innerText, currentCurrencyPreference);
			let totalAmountLeftForExpenses = currentValueExpense+ totalAddedOrRemovedFromAmount;
			animateValue(document.getElementById('totalExpensesTransactions'), currentValueExpense, Number(totalAmountLeftForExpenses), '-' + currentCurrencyPreference ,200);
		} else if(categoryForCalculation.contains('incomeTrans')) {
			let currentValueIncome = er.convertToNumberFromCurrency(document.getElementById('totalIncomeTransactions').innerText, currentCurrencyPreference);
			let totalAmountLeftForIncome = currentValueIncome + totalAddedOrRemovedFromAmount;
			animateValue(document.getElementById('totalIncomeTransactions'), currentValueIncome, Number(totalAmountLeftForIncome), currentCurrencyPreference ,200);
		}
		
		// Update the total available 
		let income = er.convertToNumberFromCurrency(document.getElementById('totalIncomeTransactions').innerText,currentCurrencyPreference);
		let expense = er.convertToNumberFromCurrency(document.getElementById('totalExpensesTransactions').innerText,currentCurrencyPreference);

		let minusSign = '';
		let availableCash = income-expense;
		if (availableCash < 0){
			minusSign = '-';
			availableCash = Math.abs(availableCash);
		}
		
		animateValue(document.getElementById('totalAvailableTransactions'), 0, Number(availableCash), minusSign + currentCurrencyPreference ,200);
		
		
		// Update the pie chart
		let dataPreferencesChart = updatePieChartTransactions(income, expense);
		// If the chart is empty then build the chart
		if(isNotEmpty(transactionsChart)) {
			transactionsChart.update(dataPreferencesChart);
		} else {
			buildPieChart(dataPreferencesChart, 'chartFinancialPosition');
		}
	}
	
	// Append currency to amount if it exist and a '-' sign if it is a transaction
	function appendCurrencyToAmount(element, enteredText){
		// if the currency or the minus sign is removed then replace it back when the focus is lost
		let minusSign = '';
		if(includesStr(amountEditedTransaction,'-')){
			minusSign = '-';
		}
		let changeInnerTextAmount = minusSign + currentCurrencyPreference + formatNumber(enteredText, currentUser.locale);
		let replaceEnteredText = document.createElement('div');
		replaceEnteredText.className = 'text-right amountDivCentering';
		replaceEnteredText.setAttribute('contenteditable', true);
		replaceEnteredText.tabIndex = 0;
		replaceEnteredText.innerHTML = trimElement(changeInnerTextAmount).replace(/ +/g, "");
		// Replace HTML with Empty
		while (element.firstChild) {
			element.removeChild(element.firstChild);
		}
		element.appendChild(replaceEnteredText);
	}
	
	
	// Dynamically generated button click event
	$( "#transactionsTable" ).on( "click", ".removeRowTransaction" ,function() {
		// Prevents the add amount event listener focus out from being executed
		let id = lastElement(splitElement($(this).parent().closest('div').attr('id'),'-'));
		// Remove the button and append the loader with fade out
		let budgetTableCell = document.getElementById('budgetTransactionsRow-' + id);
		budgetTableCell.classList.add('fadeOutAnimation');
		
		
		// Ajax Requests on Error
		let ajaxData = {};
		ajaxData.isAjaxReq = true;
		ajaxData.type = 'DELETE';
		ajaxData.url = CUSTOM_DASHBOARD_CONSTANTS.transactionAPIUrl + currentUser.walletId + '/' + id + CUSTOM_DASHBOARD_CONSTANTS.dateMeantFor + chosenDate;
		ajaxData.onSuccess = function(data) {

        	let previousCategoryId = '';
        	let classListBudget = budgetTableCell.classList;
        	// Set the previous category Id for updating the catergory modal
        	for(let i=0, length = classListBudget.length; i < length; i++) {
            	// Remove the nearest category along with the last transaction row.
        		let classItem = classListBudget[i];
        		if(includesStr(classItem, 'categoryIdForBudget')) {
        			// Remove amount from current Category
        			previousCategoryId = lastElement(splitElement(classItem,'-'));
        			let categoryAmount = er.convertToNumberFromCurrency($('.amountCategoryId-' + previousCategoryId)[0].innerText,currentCurrencyPreference);
        			
        			// Category Header Deletion
        			if(categoryAmount == 0) {
        				$('.amountCategoryId-' + previousCategoryId).parent().closest('div').fadeOut('slow', function(){ 
        					this.remove(); 
        					// Toggle Category Modal 
                        	toggleCategoryModal('');
        				});
        			}
        			
        		}
        	}
        	
        	// Remove the table row (No need to update category amount or total values as the value of the TR is already 0 )
        	let closestTr = $('#budgetTransactionsRow-' + id).parent().closest('div');
        	let closestTrLength = closestTr.length;
        	
        	// Remove Transactions Row
        	closestTr.fadeOut('slow', function(){
        		this.remove();
        		// Remove entries from Account & Creation Date
        		removeEntriesFromTable(this);
        		
        		// Check all functionality if all transactions are clicked
            	checkAllIfAllAreChecked();
        		
        		// Execute these transactions only once after all elements have faded out
        		if(!--closestTrLength) {
        			// Disable delete Transactions button on refreshing the transactions
                 	manageDeleteTransactionsButton();
                 	// Updates total transactions in category Modal if open with this category
    	        	updateTotalTransactionsInCategoryModal(previousCategoryId);
    	        	// Display Table Empty Div if all the table rows are deleted
    	        	let tableBodyDiv = document.getElementById(replaceTransactionsId);
                	if(tableBodyDiv.childElementCount === 0) {
                		tableBodyDiv.appendChild(fetchEmptyTableMessage());
                		// uncheck the select all checkbox if checked
            			let checkAllBox = document.getElementById('checkAll');
            			$('#checkAll').prop('checked',false);
            			checkAllBox.setAttribute('disabled', 'disabled');
                	}
        		}
        	});
        }
		ajaxData.onFailure = function (thrownError) {
			manageErrors(thrownError, 'Unable to delete the transactions',ajaxData);
        }

		// Handle delete for individual row
		jQuery.ajax({
            url: ajaxData.url,
            beforeSend: function(xhr){xhr.setRequestHeader("Authorization", authHeader);},
            type: ajaxData.type,
            success: ajaxData.onSuccess,
            error: ajaxData.onFailure
        });
	});

	// Remove entries from Account & Creation Date
	function removeEntriesFromTable(element) {
		let selectId = element.getElementsByTagName('select')[0].id; 
		let transId = lastElement(splitElement(selectId,'-'));
		let recentTransactionEntry = document.getElementsByClassName('recentTransactionEntry');
		// Check if recent transaction is present and remove it
		if(isNotEmpty(recentTransactionEntry)) {
			// remove the recent transactions
			let recentTransEl = document.getElementById('recentTransaction-' + transId);
			if(recentTransEl) {
				recentTransEl.remove();
				// remove element from User transaction List
				removeElementFromUserTransactionList(transId);
			}
			// Remove Account Sort by If exists
			let accountAggre = document.getElementById('accountAggre-' + transId);
			let parentNode = accountAggre.parentNode;
			if(accountAggre) {
				accountAggre.remove();
				// remove element from User transaction List
				removeElementFromUserTransactionList(transId);
			}

			// If the surrounding Parent does not have any child nodes then remove parent
			if(!parentNode.firstElementChild) {
				parentNode.remove();
				// Check if all the account information has been removed
				if(!document.getElementsByClassName('accountInfoTable')) { 
					sortByAccountPopulated = false;
					// Update the transaction list to empty
	   				userTransSortedByDate = [];
				}
			}

			// If all the recent transactions are removed
			let recentTransactionsEl = document.getElementById(recentTransactionsId);
			// Recent Transactions Exists
			if(!recentTransactionsEl.firstElementChild) { 
				recentTransactionsPopulated = false; 
				recentTransactionsEl.appendChild(buildEmptyTransactionsTab());
				// Update the transaction list to empty
	   			userTransSortedByDate = [];
			}
		}
	}

	// Remove element from user transaction list
	function removeElementFromUserTransactionList(transId) {
		// Length of usertransaction
		for(let i = 0, l = userTransSortedByDate.length; i < l; i++) {
			let ut = userTransSortedByDate[i];
			if(isEqual(ut.transactionId, transId)) {
				// Remove user transaction from user transaction list
				userTransSortedByDate.splice(i, 1);
				return;
			}
		}
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
		paragraphElement.innerHTML = 'There are no transactions yet. Start adding some to track your spending.';
		
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
	
	// Introduce Chartist pie chart
	function buildPieChart(dataPreferences, id) {
		 /*  **************** Public Preferences - Pie Chart ******************** */

        var optionsPreferences = {
		  donut: true,
		  donutWidth: 50,
		  startAngle: 270,
		  showLabel: true,
		  height: '230px'
        };
        
        // Reset the chart
        if(isNotEmpty(transactionsChart)) {
        	transactionsChart.detach();
        }
        replaceHTML(id, '');
        // Dispose tooltips
        $("#" + id).tooltip('dispose');
        
        if(isNotEmpty(dataPreferences)) {
        	transactionsChart = new Chartist.Pie('#' + id, dataPreferences, optionsPreferences).on('draw', function(data) {
      		  if(data.type === 'slice') {
		        	let sliceValue = data.element._node.getAttribute('ct:value');
		        	data.element._node.setAttribute("title", "Value: <strong>" + currentCurrencyPreference + formatNumber(Number(sliceValue), currentUser.locale) + '</strong>');
					data.element._node.setAttribute("data-chart-tooltip", id);
      		  }
			}).on("created", function() {
			  let chartLegend = document.getElementById('chartLegend');
	          let incomeAmount = document.getElementById('totalIncomeTransactions');
	          let expenseAmount = document.getElementById('totalExpensesTransactions');
	          let totalAvailable = document.getElementById('totalAvailableTransactions');
	        	
			  // Initiate Tooltip
			  $("#" + id).tooltip({
				  selector: '[data-chart-tooltip="' + id + '"]',
				  container: "#" + id,
				  html: true,
				  placement: 'auto',
				  delay: { "show": 300, "hide": 100 }
			  });
				
			  $('.ct-slice-donut').on('mouseover mouseout', function() {
       			  chartLegend.classList.toggle('hiddenAfterHalfASec');
       			  chartLegend.classList.toggle('visibleAfterHalfASec');
       		  });
       		  
       		  $('.ct-series-a').on('mouseover mouseout', function() {
       			  incomeAmount.classList.toggle('transitionTextToNormal');
       			  incomeAmount.classList.toggle('transitionTextTo120');
       		  });
       		  
       		  $('.ct-series-b').on('mouseover mouseout', function() {
       			  expenseAmount.classList.toggle('transitionTextToNormal');
       			  expenseAmount.classList.toggle('transitionTextTo120');
       		  });
       		  
       		  $('.ct-series-c').on('mouseover mouseout', function() {
       			  totalAvailable.classList.toggle('transitionTextToNormal');
       			  totalAvailable.classList.toggle('transitionTextTo120');
       		  });
			});
        }
        
	}
	
    // Generate SVG Tick Element and success element
    function successSvgMessage() {
    	let alignmentDiv = document.createElement('div');
    	alignmentDiv.className = 'row justify-content-center';
    	
    	// Parent Div Svg container
    	let divSvgContainer = document.createElement('div');
    	divSvgContainer.className = 'svg-container';
    	
    	// SVG element
    	let svgElement = document.createElementNS("http://www.w3.org/2000/svg", 'svg');
    	svgElement.setAttribute('class','ft-green-tick');
    	svgElement.setAttribute('height','20');
    	svgElement.setAttribute('width','20');
    	svgElement.setAttribute('viewBox','0 0 48 48');
    	svgElement.setAttribute('aria-hidden',true);
    	
    	let circleElement = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    	circleElement.setAttribute('class','circle');
    	circleElement.setAttribute('fill','#5bb543');
    	circleElement.setAttribute('cx','24');
    	circleElement.setAttribute('cy','24');
    	circleElement.setAttribute('r','22');
    	
    	let pathElement = document.createElementNS("http://www.w3.org/2000/svg", 'path');
    	pathElement.setAttribute('class','tick');
    	pathElement.setAttribute('fill','none');
    	pathElement.setAttribute('stroke','#FFF');
    	pathElement.setAttribute('stroke-width','6');
    	pathElement.setAttribute('stroke-linecap','round');
    	pathElement.setAttribute('stroke-linejoin','round');
    	pathElement.setAttribute('stroke-miterlimit','10');
    	pathElement.setAttribute('d','M14 27l5.917 4.917L34 17');
    	
    	svgElement.appendChild(circleElement);
    	svgElement.appendChild(pathElement);
    	divSvgContainer.appendChild(svgElement);
    	
    	let messageParagraphElement = document.createElement('p');
    	messageParagraphElement.className = 'green-icon margin-bottom-zero margin-left-five';
    	messageParagraphElement.innerHTML = 'Successfully added the transaction.';
    	
    	var br = document.createElement('br');
    	
    	alignmentDiv.appendChild(divSvgContainer);
    	alignmentDiv.appendChild(messageParagraphElement);
    	alignmentDiv.appendChild(br);
    	
    	
    	return alignmentDiv;
    }
    
    // Add button to add the table row to the corresponding category
	$( "#transactionsTable" ).on( "click", ".addTableRowListener" ,function(event) {
		// Add small Material Spinner
		 let divMaterialSpinner = document.createElement('div');
		 divMaterialSpinner.classList = 'material-spinner-small d-inline-block';
		 this.classList.remove('d-inline');
		 this.classList.add('d-none');
		 this.parentNode.appendChild(divMaterialSpinner);
		 let currentElement = this;
		 
		 event.preventDefault();
		 // stop the event from bubbling.
		 event.stopPropagation();
		 event.stopImmediatePropagation();
		 let id = lastElement(splitElement(this.id,'-'));
		 let values = {};
		 values['amount'] = 0.00;
		 values['description'] = '';
		 values['categoryOptions'] = id;
		 values['dateMeantFor'] = chosenDate;

		 // Ajax Requests on Error
		 let ajaxData = {};
		 ajaxData.isAjaxReq = true;
		 ajaxData.type = "POST";
		 ajaxData.url = CUSTOM_DASHBOARD_CONSTANTS.transactionAPIUrl + currentUser.walletId; 
		 ajaxData.dataType = "json"; 
		 ajaxData.contentType = "application/json;charset=UTF-8";
		 ajaxData.data = JSON.stringify(values);
		 ajaxData.onSuccess = function(userTransaction){
        	  let categoryParent = document.getElementById('categoryTableRow-' + userTransaction.categoryId);
        	  let closestSibling = categoryParent.nextSibling;
        	  let lastClassName =  lastElement(splitElement(closestSibling.className, ' '));
        	  // Cache the value for exportation
 			  window.transactionsCache[userTransaction.transactionId] = userTransaction;
        	  
        	  // Toggle dropdown if the rows are hidden
    		  if(includesStr(lastClassName , 'd-none')) {
    			  toggleDropdown(id, categoryParent);
    		  }
    		  
    		  // Add the new row to the category
        	  categoryParent.parentNode.insertBefore(createTableRows(userTransaction,'d-table-row', userTransaction.categoryId), closestSibling);
        	  
        	  // Remove material spinner and remove d none
        	  currentElement.parentNode.removeChild(currentElement.parentNode.lastChild);
        	  currentElement.classList.add('d-inline');
        	  currentElement.classList.remove('d-none');
        	  
        	  // Updates total transactions in category Modal
        	  updateTotalTransactionsInCategoryModal(userTransaction.categoryId);
        	  
        	  // If recent transactions are populated then
        	  if(recentTransactionsPopulated) {
        	  	let recentTrans = document.getElementById(recentTransactionsId);
        	  	if(isNotEqual(recentTrans.firstElementChild.innerText,TODAY)) {
        	  		// Insert as a first child
        	  		recentTrans.insertBefore(appendToday(),recentTrans.childNodes[0]);
        	  	}
        	  	recentTrans.insertBefore(buildTransactionRow(userTransaction, 'recentTransaction'),recentTrans.childNodes[1]);
        	  }

        	  // If the sort option is Account then
        	  if(sortByAccountPopulated) {
        	  	let accountAggTable = document.getElementById('accountSB-' + userTransaction.accountId);
        	  	if(accountAggTable == null) {
        	  		let recentTransactionsFragment = document.createDocumentFragment();
        	  		let recTransAndAccTable = document.getElementById('recTransAndAccTable');
        	  		recentTransactionsFragment.appendChild(buildAccountHeader(userTransaction.accountId));
        	  		recentTransactionsFragment.getElementById('accountSB-' + userTransaction.accountId).appendChild(buildTransactionRow(userTransaction, 'accountAggre'));
        	  		recTransAndAccTable.appendChild(recentTransactionsFragment);
        	  	} else {
        	  		accountAggTable.insertBefore(buildTransactionRow(userTransaction, 'accountAggre'), accountAggTable.childNodes[1]);
        	  	}
        	  }

        	  // Add element to User transaction List
        	  userTransSortedByDate.push(userTransaction);

         }
		 ajaxData.onFailure = function (thrownError) {
		 	manageErrors(thrownError, 'Unable to add a new transaction.',ajaxData);
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
	});
	
	// Builds the drag handle for transaction rows
	function fetchDragHandle() {
		
		// Build SVG Drag Handle for table rows
		let svgElement = document.createElementNS("http://www.w3.org/2000/svg", 'svg');
    	svgElement.setAttribute('class','drag-handle');
    	svgElement.setAttribute('height','20');
    	svgElement.setAttribute('width','9');
    	svgElement.setAttribute('viewBox','0 0 9 20');
    	svgElement.setAttribute('focusable',false);
    	
    	let pathElement = document.createElementNS("http://www.w3.org/2000/svg", 'path');
    	pathElement.setAttribute('fill','#B6BEC2');
    	pathElement.setAttribute('d','M1.5 6a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm0-6a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm0 12a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm5-12a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm0 6a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm0 6a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3z');
    	
    	svgElement.appendChild(pathElement);
    	
    	return svgElement;
	}
	
	/**
	 * Logic for Category Modal
	 * 
	 */
	
	// Toggle Category modal upon click of a category
	function handleCategoryModalToggle(categoryId, closestTrElement, totalTransactions) {
		
		// Populate the category label with the one selected
		let categoryNameDiv = document.getElementById('categoryLabelInModal');
		// If the category can be found then
		if(isNotEmpty(categoryMap[categoryId])) categoryNameDiv.innerText = categoryMap[categoryId].categoryName;
		
		// Set the number of transactions if present
		if(isNotEmpty(totalTransactions)) {
			let numberOfTransactionsDiv = document.getElementById('numberOfTransactions');
			numberOfTransactionsDiv.innerText = totalTransactions;
		}
		
		// Update the budget amount to the category Modal if present
		let plannedAmountModal = document.getElementById('plannedAmountCategoryModal');
		let categoryTotalDiv = document.getElementById('amountCategory-' + categoryId);
		let percentageAvailable = document.getElementById('percentageAvailable');
		let remainingAmountDiv = document.getElementById('remainingAmount');
		let categoryIdForUserBudget = document.getElementById('categoryIdCachedForUserBudget');
		let budgetPercentageLabel = document.getElementById('budgetInfoLabelInModal');
		let progressBarCategoryModal = document.getElementById('amountSpentAgainstBudget');
		let categoryRowClassList = closestTrElement.classList;
		categoryIdForUserBudget.innerText = categoryId;
		
		let budgetElementText = closestTrElement.lastChild.innerText;
		
		if(isNotEmpty(budgetElementText)) {
			plannedAmountModal.innerText = budgetElementText;
			
			// Calculate percentage of budget available to spend or save
			let categoryAmount = er.convertToNumberFromCurrency(categoryTotalDiv.innerText,currentCurrencyPreference);
			let budgetAmount = er.convertToNumberFromCurrency(budgetElementText,currentCurrencyPreference);
			
			// Calculate remaining budget
			let budgetAvailableToSpendOrSave = budgetAmount - categoryAmount;
			let minusSign = '';
			
			// Change the div if and only if the class is not already present in the div
			let remainingAmountToggleClass = !remainingAmountDiv.classList.contains('mild-text-success');
			
			// Calculate the minus sign and appropriate class for the remaining amount 
			if(budgetAvailableToSpendOrSave < 0) {
				// if the transaction category is expense category then show overspent else show To be budgeted
				if(categoryRowClassList.contains('expenseCategory')) {
					remainingAmountToggleClass = !remainingAmountDiv.classList.contains('mild-text-danger');
					budgetPercentageLabel.innerText = 'Overspent (%)';
				} else if(categoryRowClassList.contains('incomeCategory')) {
					budgetPercentageLabel.innerText = 'To Be Budgeted (%)';
				}
				
				minusSign = '-';
				budgetAvailableToSpendOrSave = Math.abs(budgetAvailableToSpendOrSave);
				
			} else {
				budgetPercentageLabel.innerText = 'Remaining (%)';
			}
			
			// Change color if the amount is negative or positive
			if(remainingAmountToggleClass) {
				remainingAmountDiv.classList.toggle('mild-text-success');
				remainingAmountDiv.classList.toggle('mild-text-danger');
				progressBarCategoryModal.classList.toggle('progress-bar-success-striped');
				progressBarCategoryModal.classList.toggle('progress-bar-danger-striped');
			}
			
			// Change the remaining text appropriately
			remainingAmountDiv.innerText = minusSign + currentCurrencyPreference + formatNumber(budgetAvailableToSpendOrSave, currentUser.locale);

			// Calculate percentage available to spend or save
			let percentageRemaining = round(((budgetAvailableToSpendOrSave / budgetAmount) * 100),0);
			// Assign progress bar value. If the category amount is higher then the progress is 100%
			let progressBarPercentage = isNaN(percentageRemaining) ? 0 : (categoryAmount > budgetAmount) ? 100 : (100 - percentageRemaining);
			// Set the value and percentage of the progress bar
			progressBarCategoryModal.setAttribute('aria-valuenow', progressBarPercentage);
			progressBarCategoryModal.style.width = progressBarPercentage + '%'; 
			
			percentageRemaining = isNaN(percentageRemaining) ? 'NA' : percentageRemaining + '%';
			percentageAvailable.innerText = percentageRemaining;
		} else {
			budgetPercentageLabel.innerText = 'Remaining (%)'
			plannedAmountModal.innerText = currentCurrencyPreference + '0.00';
			percentageAvailable.innerText = 'NA'
			remainingAmountDiv.innerText = currentCurrencyPreference + '0.00';
			progressBarCategoryModal.setAttribute('aria-valuenow', 0);
			progressBarCategoryModal.style.width = '0%'; 
			
			// Change the remaining amount to green if it is red in color
			if(!remainingAmountDiv.classList.contains('mild-text-success')){
				remainingAmountDiv.classList.toggle('mild-text-success');
				remainingAmountDiv.classList.toggle('mild-text-danger');
				progressBarCategoryModal.classList.toggle('progress-bar-success-striped');
				progressBarCategoryModal.classList.toggle('progress-bar-danger-striped');
			}
			
		}
	}
	
	// Toggles the category modal
	function toggleCategoryModal(closestTrElement) {
		let financialPositionDiv = document.getElementsByClassName('transactions-chart');
		let categoryModalDiv = document.getElementsByClassName('category-modal');
		// Find all the category rows that are expanded
		let categoriesShown = document.getElementsByClassName('categoryShown');
		
		if(categoriesShown.length == 0) {
			// show the financial position div and hide the category modal
			categoryModalDiv[0].classList.add('d-none');
			financialPositionDiv[0].classList.remove('d-none');
			// Update the chart and redraw it
			rebuildPieChart();
		} else {
			// show the financial position div and hide the category modal
			categoryModalDiv[0].classList.remove('d-none');
			financialPositionDiv[0].classList.add('d-none');
			// If there are other drop down categories open then show the first one from the list
			let categoryRowToShowInModal = closestTrElement.classList.contains('categoryShown') ? closestTrElement : categoriesShown[0];
			let categoryId = lastElement(splitElement(categoryRowToShowInModal.id,'-'));
			// Fetch all the categories child transactions
			let hideableRowElement = document.getElementsByClassName('hideableRow-' + categoryId);
			handleCategoryModalToggle(categoryId, categoryRowToShowInModal, hideableRowElement.length);
		}
	}
	
	// Close Category Modal
	function closeCategoryModal() {
		let financialPositionDiv = document.getElementsByClassName('transactions-chart');
		let categoryModalDiv = document.getElementsByClassName('category-modal');
		
		// If the category modal is already closed then return
		if(categoryModalDiv[0].classList.contains('d-none')) {
			return;
		}
		
		// show the financial position div and hide the category modal
		categoryModalDiv[0].classList.add('d-none');
		financialPositionDiv[0].classList.remove('d-none');
		
		// Rebuilds the pie chart from scratch
		rebuildPieChart();
	}
	
	// Rebuilds the pie chart from scratch
	function rebuildPieChart() {
		// Update the total available 
		let income = er.convertToNumberFromCurrency(document.getElementById('totalIncomeTransactions').innerText,currentCurrencyPreference);
		let expense = er.convertToNumberFromCurrency(document.getElementById('totalExpensesTransactions').innerText,currentCurrencyPreference);
		// Update the pie chart
		let dataPreferencesChart = updatePieChartTransactions(income, expense);
		// Update the chart and redraw it
		buildPieChart(dataPreferencesChart, 'chartFinancialPosition');
	}
	
	// Close Button functionality for category Modal
	$('body').on('click', '#categoryHeaderClose' , function(e) {
		closeCategoryModal();
	},false);
	
	$('body').on('focusin', '#plannedAmountCategoryModal' , function(e) {
		userUpdateBudgetCached = trimElement(this.innerText);
	},false);
	
	$('body').on('focusout', '#plannedAmountCategoryModal' , function(e) {
		userUpdatedBudget(this);
	},false);
	
	// Budget Amount - disable enter key and submit request
	$('body').on('keyup', '#plannedAmountCategoryModal' , function(e) {
		  let keyCode = e.keyCode || e.which;
		  if (keyCode === 13) { 
		    e.preventDefault();

		    document.activeElement.blur();
		    return false;
		  }
	},false);
	
	// User updates the budget
	function userUpdatedBudget(element) {
		// If the text is not changed then do nothing (Remove currency locale and minus sign, remove currency formatting and take only the number and convert it into decimals) and round to 2 decimal places
		let enteredText = er.convertToNumberFromCurrency(element.innerText,currentCurrencyPreference);
		let previousText = er.convertToNumberFromCurrency(userUpdateBudgetCached,currentCurrencyPreference);
		
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
		
		let categoryIdForUserBudget = document.getElementById('categoryIdCachedForUserBudget');
		// Test if the entered value is the same as the previous one
		if(previousText != enteredText){
			
			let categoryIdForBudget = Number(categoryIdForUserBudget.innerText);
			// Security check to ensure that the category is present in the map
			if(er.checkIfInvalidCategory(categoryIdForBudget)) {
				return;
			}
			
			var values = {};
			values['planned'] = enteredText;
			values['category_id'] = categoryIdForBudget;
			values['autoGenerated'] = 'false';
			values['dateMeantFor'] = chosenDate;
			values['walletId'] = currentUser.walletId;

			// Ajax Requests on Error
			let ajaxData = {};
			ajaxData.isAjaxReq = true;
			ajaxData.type = "POST";
			ajaxData.url = CUSTOM_DASHBOARD_CONSTANTS.budgetAPIUrl;
			ajaxData.dataType = "json"; 
			ajaxData.contentType = "application/json;charset=UTF-8";
			ajaxData.data = JSON.stringify(values);
			ajaxData.onSuccess = function(userBudget){
	        	  let categoryRowElement = document.getElementById('categoryTableRow-' + userBudget.categoryId);
	        	  // Update the budget amount in the category row
	        	  let formattedBudgetAmount = currentCurrencyPreference + formatNumber(userBudget.planned , currentUser.locale);
	        	  categoryRowElement.lastChild.innerText = formattedBudgetAmount;
	        	  handleCategoryModalToggle(userBudget.categoryId, categoryRowElement, '');
	        }
			ajaxData.onFailure = function (thrownError) {
				manageErrors(thrownError, 'Unable to change the budget. Please try again!',ajaxData);
				
                // update the current element with the previous amount
                let formattedBudgetAmount = currentCurrencyPreference + formatNumber(previousText , currentUser.locale);
                element.innerText = formattedBudgetAmount;
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
	
	// Updates the category modal if the modal is open for the category udates
	function updateTotalTransactionsInCategoryModal(categoryIdToUpdate) {
		  // Is the category modal open with the category added?
		  let categoryIdInModal = document.getElementById('categoryIdCachedForUserBudget');

		  if(Number(categoryIdToUpdate) == Number(categoryIdInModal.innerText)) {
			  // If Category Modal is open then update the transaction amount 
			  let categoryModalElement = document.getElementsByClassName('category-modal');
			  if(!categoryModalElement[0].classList.contains('d-none')) {
				  // Get the number of hide able rows under the category for Category Modal
	      	  let hideableRowElement = document.getElementsByClassName('hideableRow-' + categoryIdToUpdate);
	      	  // Update the number of transactions
	      	  let numberOfTransactionsElement = document.getElementById('numberOfTransactions');
	      	  numberOfTransactionsElement.innerText = hideableRowElement.length;
			  }
		  }
	}
	
	// Load Images dynamically after javascript loads
	function loadCategoryModalImages() {
		
		let budgetImageDiv = document.getElementById('budgetImage');
		budgetImageDiv.src = '../img/dashboard/transactions/icons8-restaurant-40.png';
		
	}
	
	// Date Picker
	// On click month (UNBIND other click events)
	$('.monthPickerMonth').unbind('click').click(function() {
		// Month picker is current selected then do nothing
		if(this.classList.contains('monthPickerMonthSelected')) {
			return;
		}

		let transactionTable = document.getElementById('transactionsTable');
		
		if(transactionTable == null) {
			return;
		}
		
		// Replace Transactions Table with empty spinner
		replaceTransactionsWithMSpinner();
		replacePieChartWithMSpinner();
		
		// Set chosen Date
		er.setChosenDateWithSelected(this);
		
		// Call transactions
		fetchJSONForTransactions();

		// Call Account / Recent Transactions
		populateAccountOrRecentTransactionInfo();
		
	});
	
	// Replace transactions table with empty spinner
	function replaceTransactionsWithMSpinner() {
		// Replace Transactions Table
		let materialSpinnerFrag = document.createDocumentFragment();
		
		let tableRow = document.createElement('div');
		tableRow.classList = 'd-table-row';
		
		let firstCell = document.createElement('div');
		firstCell.classList = 'd-table-cell';
		tableRow.appendChild(firstCell);
		
		let secCell = document.createElement('div');
		secCell.classList = 'd-table-cell';
		tableRow.appendChild(secCell);
		
		let thirdCell = document.createElement('div');
		thirdCell.classList = 'd-table-cell';
		tableRow.appendChild(thirdCell);
		
		let fourthCell = document.createElement('div');
		fourthCell.classList = 'd-table-cell';
		let mSpinnerDiv = document.createElement('div');
		mSpinnerDiv.classList = 'material-spinner';
		fourthCell.appendChild(mSpinnerDiv);
		tableRow.appendChild(fourthCell);
		
		materialSpinnerFrag.appendChild(tableRow);
		
		// Replace the product json with empty table
		let productJsonDiv = document.getElementById(replaceTransactionsId);
		// Replace HTML with Empty
		while (productJsonDiv.firstChild) {
			productJsonDiv.removeChild(productJsonDiv.firstChild);
		}
		productJsonDiv.appendChild(materialSpinnerFrag);
	}
	
	// Replace Pie Chart with Material Spinner
	function replacePieChartWithMSpinner() {
		// Reset the chart
        if(isNotEmpty(transactionsChart)) {
        	transactionsChart.detach();
        }
        
		let chartFinPosition = document.getElementById('chartFinancialPosition');
		chartFinPosition.innerHTML = '<div class="material-spinner"></div>';
	}

	// Replace currentCurrencySymbol with currency symbol
	replaceWithCurrency();

	/**
	*  Add Functionality Generic + Btn
	**/

	// Register Tooltips
	let ttinit = $("#addFncTT");
	ttinit.attr('data-original-title', 'Add Transactions')
	ttinit.tooltip({
		delay: { "show": 300, "hide": 100 }
    });

    // Generic Add Functionalitys
    let genericAddFnc = document.getElementById('genericAddFnc');
    genericAddFnc.classList = 'btn btn-round btn-success btn-just-icon bottomFixed float-right addNewTrans';
    $(genericAddFnc).unbind('click').click(function () {
    	genericAddFnc.classList.toggle('d-none');
		if($( ".number:checked" ).length > 0 || $("#checkAll:checked").length > 0) {
			// If length > 0 then change the add button to add
			popup.showSwal('warning-message-and-confirmation');
		} else {
			$('#GSCCModal').modal('toggle');
		}  
	});

	/*
	 * Populate Recent transactions ()Aggregated by account)
	 */ 
	
	// Populate Recent Transactions
	function populateRecentTransactions(recentTrans, popBothInfo) {
		// Ajax Requests on Error
		//TODO
		
   		if(popBothInfo) {
   			ajaxData.onSuccess = function(userTransactionsList) {
	   			populateRecentTransInfo(userTransactionsList);
	   			populateAccountTableInformation(userTransactionsList);
	        }
   		} else if(recentTrans) {
   			ajaxData.onSuccess = function(userTransactionsList) {
	   			populateRecentTransInfo(userTransactionsList);
	        }
   		} else {
   			ajaxData.onSuccess = function(userTransactionsList) {
   				populateAccountTableInformation(userTransactionsList);
   			}
   		}
	}

	// Populate Account table information
	function populateAccountTableInformation(userTransactionsList) {
		// cache the results
   		userTransSortedByDate = userTransactionsList;

		if(isEmpty(userTransactionsList)) {
			// Sort by Account is populated
    		sortByAccountPopulated = false;
			let accountTable = document.getElementById('accountTable');
			// Replace HTML with Empty
			while (accountTable.firstChild) {
				accountTable.removeChild(accountTable.firstChild);
			}
    		accountTable.appendChild(buildEmptyTransactionsTab());
    		// Remove all the account transaction information
    		let accountInfoTable = document.getElementsByClassName('accountInfoTable');
    		// Replace HTML with Empty
			while (accountInfoTable[0]) {
				accountInfoTable[0].parentNode.removeChild(accountInfoTable[0]);
			}
			// If Account Table is shown then remove d-none
			if(document.getElementById('transactionsTable').classList.contains('d-none') && 
				document.getElementById('recentTransactions').classList.contains('d-none')) {
				accountTable.classList.remove('d-none');
			}
    	} else {
    		// Sort by Account is populated
    		sortByAccountPopulated = true;
   			// Populate the transaction of account
   			popTransByAccWOAJAX();
   			// If fetch all bank account flag is true then
			fetchAllBankAccountInformation();
			// If Account Table is hidden then add d-none
			if(!document.getElementById('transactionsTable').classList.contains('d-none') || 
				!document.getElementById('recentTransactions').classList.contains('d-none')) {
				$('.accountInfoTable').addClass('d-none');
			}
   		}
	}

	// POpulate Recent Transaction information
	function populateRecentTransInfo(userTransactionsList) {
		// cache the results
   		userTransSortedByDate = userTransactionsList;

		let latestCreationDateItr = new Date();
    	let recentTransactionsDiv = document.getElementById(recentTransactionsId);
    	let recentTransactionsFragment = document.createDocumentFragment();
    	
    	if(isEmpty(userTransactionsList)) {
    		recentTransactionsFragment.appendChild(buildEmptyTransactionsTab());
    		// Update the recent transactions (FALSE for empty tables)
   			recentTransactionsPopulated = false;
    	} else {
    		// Update the recent transactions
   			recentTransactionsPopulated = true;

   			// Check if it is the same day
     	   if(isToday(new Date(userTransactionsList[0].createDate))) {
     	   		recentTransactionsFragment.appendChild(appendToday());
     	   }

    		let resultKeySet = Object.keys(userTransactionsList);
         	for(let countGrouped = 0; countGrouped < resultKeySet.length; countGrouped++) {
         	   let key = resultKeySet[countGrouped];
         	   let userTransaction = userTransactionsList[key];
         	   let creationDate = new Date(userTransaction.createDate);
         	   
         	   if(!sameDate(creationDate,latestCreationDateItr)) {
         	   		recentTransactionsFragment.appendChild(appendDateHeader(creationDate));
         	   		// Set the latest header to creation date
         	   		latestCreationDateItr = creationDate;
         	   }
         	   recentTransactionsFragment.appendChild(buildTransactionRow(userTransaction,'recentTransaction'));
         	}
    	}
    	
    	// Empty HTML
    	while (recentTransactionsDiv.firstChild) {
    		recentTransactionsDiv.removeChild(recentTransactionsDiv.firstChild);
		}
    	recentTransactionsDiv.appendChild(recentTransactionsFragment);
	}

	// Appends the date header (TODAY) for recent transactions
	function appendToday() {
		let dateHeader = document.createElement('div');
		dateHeader.classList = 'recentTransactionDateGrp ml-3 font-weight-bold';
		dateHeader.innerText = TODAY;
		
		return dateHeader;
	}

	// Appends the date header for recent transactions
	function appendDateHeader(creationDate) {
		let dateHeader = document.createElement('div');
		dateHeader.classList = 'recentTransactionDateGrp ml-3 font-weight-bold';
		dateHeader.innerText = getWeekDays(creationDate.getDay()) + ' ' + ordinalSuffixOf(creationDate.getDate());
		
		return dateHeader;
	}

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
		emptyMessageRow.innerText = "Oh! Snap! You don't have any transactions yet.";
		cell2.appendChild(emptyMessageRow);
		rowEmpty.appendChild(cell2);

		let cell3 = document.createElement('div');
		cell3.classList = 'd-table-cell';
		rowEmpty.appendChild(cell3);
		
		return rowEmpty;
	}
	
	// Builds the rows for recent transactions
	function buildTransactionRow(userTransaction, idName) {
		// Convert date from UTC to user specific dates
		let creationDateUserRelevant = new Date(userTransaction.createDate);
		// Category Map 
		let categoryMapForUT = categoryMap[userTransaction.categoryId];
		
		let tableRowTransaction = document.createElement('div');
		tableRowTransaction.id = idName + '-' + userTransaction.transactionId;
		tableRowTransaction.classList = 'recentTransactionEntry d-table-row';

		// Make the account section draggable
		if(isEqual(idName,'accountAggre')) {
			tableRowTransaction.classList.add('accTransEntry');
			tableRowTransaction.draggable = 'true';
		}
		
		// Cell 1
		let tableCellImagesWrapper = document.createElement('div');
		tableCellImagesWrapper.classList = 'd-table-cell align-middle imageWrapperCell text-center';
		
		let circleWrapperDiv = document.createElement('div');
		circleWrapperDiv.classList = 'rounded-circle align-middle circleWrapperImageRT mx-auto';
		
		// Append a - sign if it is an expense
		if(categoryMap[userTransaction.categoryId].parentCategory == CUSTOM_DASHBOARD_CONSTANTS.expenseCategory) {
			circleWrapperDiv.appendChild(creditCardSvg());
		} else {
			circleWrapperDiv.appendChild(plusRawSvg());
		}
		
		tableCellImagesWrapper.appendChild(circleWrapperDiv);
		tableRowTransaction.appendChild(tableCellImagesWrapper);
		
		// Cell 2
		let tableCellTransactionDescription = document.createElement('div');
		tableCellTransactionDescription.classList = 'descriptionCellRT d-table-cell';
		
		let elementWithDescription = document.createElement('div');
		elementWithDescription.classList = 'font-weight-bold recentTransactionDescription';
		elementWithDescription.innerText = isEmpty(userTransaction.description) ? 'No Description' : userTransaction.description.length < 25 ? userTransaction.description : userTransaction.description.slice(0,26) + '...';
		tableCellTransactionDescription.appendChild(elementWithDescription);
		
		let elementWithCategoryName = document.createElement('div');
		elementWithCategoryName.classList = 'small categoryNameRT w-100';
		elementWithCategoryName.innerText = (categoryMapForUT.categoryName.length < 25 ? categoryMapForUT.categoryName : (categoryMapForUT.categoryName.slice(0,26) + '...')) + ' • ' + ("0" + creationDateUserRelevant.getDate()).slice(-2) + ' ' + months[creationDateUserRelevant.getMonth()].slice(0,3) + ' ' + creationDateUserRelevant.getFullYear() + ' ' + ("0" + creationDateUserRelevant.getHours()).slice(-2) + ':' + ("0" + creationDateUserRelevant.getMinutes()).slice(-2);
		tableCellTransactionDescription.appendChild(elementWithCategoryName);
		tableRowTransaction.appendChild(tableCellTransactionDescription);
		
		// Cell 3
		if(isEqual(idName, 'recentTransaction')) {
			let transactionAmount = document.createElement('div');
		
			// Append a - sign if it is an expense
			if(categoryMap[userTransaction.categoryId].parentCategory == CUSTOM_DASHBOARD_CONSTANTS.expenseCategory) {
				transactionAmount.classList = 'transactionAmountRT expenseCategory font-weight-bold d-table-cell text-right align-middle';
				transactionAmount.innerHTML = '-' + currentCurrencyPreference + formatNumber(userTransaction.amount, currentUser.locale);
			} else {
				transactionAmount.classList = 'transactionAmountRT incomeCategory font-weight-bold d-table-cell text-right align-middle';
				transactionAmount.innerHTML = currentCurrencyPreference + formatNumber(userTransaction.amount, currentUser.locale);
			}
			   
			tableRowTransaction.appendChild(transactionAmount);
		} else {
			let surCell = document.createElement('div');
			surCell.classList = 'd-table-cell';

			let transactionAmount = document.createElement('div');
			
			// Append a - sign if it is an expense
			if(categoryMap[userTransaction.categoryId].parentCategory == CUSTOM_DASHBOARD_CONSTANTS.expenseCategory) {
				transactionAmount.classList = 'transactionAmountRT font-weight-bold text-right align-middle';
				transactionAmount.innerHTML = '-' + currentCurrencyPreference + formatNumber(userTransaction.amount, currentUser.locale);
			} else {
				transactionAmount.classList = 'transactionAmountRT font-weight-bold text-right align-middle';
				transactionAmount.innerHTML = currentCurrencyPreference + formatNumber(userTransaction.amount, currentUser.locale);
			}
			surCell.appendChild(transactionAmount);  
			  
			let accountBalDiv = document.createElement('div');
			accountBalDiv.classList = 'accBalSubAmount pl-2 font-weight-bold text-right align-middle small';
			surCell.appendChild(accountBalDiv); 
			tableRowTransaction.appendChild(surCell);
		}
		
		return tableRowTransaction;
		
	}
	
	// Raw Plus Svg
	function plusRawSvg() {
		let svgElement = document.createElementNS("http://www.w3.org/2000/svg", 'svg');
		svgElement.setAttribute('class','align-middle plusRawSvg');
    	svgElement.setAttribute('x','0px');
    	svgElement.setAttribute('y','0px');
    	svgElement.setAttribute('width','24');
    	svgElement.setAttribute('height','24');
    	svgElement.setAttribute('viewBox','0 0 25 29');
    	svgElement.setAttribute('fill','#000000');
    	
    	let pathElement = document.createElementNS("http://www.w3.org/2000/svg", 'path');
    	pathElement.setAttribute('class','plusRawPath');
    	pathElement.setAttribute('overflow','visible');
    	pathElement.setAttribute('white-space','normal');
    	pathElement.setAttribute('font-family','sans-serif');
    	pathElement.setAttribute('font-weight','400');
    	pathElement.setAttribute('d','M 11 2 L 11 11 L 2 11 L 2 13 L 11 13 L 11 22 L 13 22 L 13 13 L 22 13 L 22 11 L 13 11 L 13 2 Z');
    	
    	svgElement.appendChild(pathElement);
    	
    	return svgElement;
		
	}
	
	// Credit card SVG Image
	function creditCardSvg() {
		let svgElement = document.createElementNS("http://www.w3.org/2000/svg", 'svg');
		svgElement.setAttribute('class','align-middle creditCardSvg');
    	svgElement.setAttribute('x','0px');
    	svgElement.setAttribute('y','0px');
    	svgElement.setAttribute('width','30');
    	svgElement.setAttribute('height','30');
    	svgElement.setAttribute('viewBox','0 0 80 90');
    	svgElement.setAttribute('fill','#000000');
    	
    	let pathElement = document.createElementNS("http://www.w3.org/2000/svg", 'path');
    	pathElement.setAttribute('class','creditCardPath');
    	pathElement.setAttribute('d','M 11 16 C 8.2504839 16 6 18.250484 6 21 L 6 59 C 6 61.749516 8.2504839 64 11 64 L 69 64 C 71.749516 64 74 61.749516 74 59 L 74 21 C 74 18.250484 71.749516 16 69 16 L 11 16 z M 11 18 L 69 18 C 70.668484 18 72 19.331516 72 21 L 72 26 L 8 26 L 8 21 C 8 19.331516 9.3315161 18 11 18 z M 8 30 L 72 30 L 72 59 C 72 60.668484 70.668484 62 69 62 L 11 62 C 9.3315161 62 8 60.668484 8 59 L 8 30 z M 12 35 A 1 1 0 0 0 11 36 A 1 1 0 0 0 12 37 A 1 1 0 0 0 13 36 A 1 1 0 0 0 12 35 z M 16 35 A 1 1 0 0 0 15 36 A 1 1 0 0 0 16 37 A 1 1 0 0 0 17 36 A 1 1 0 0 0 16 35 z M 20 35 A 1 1 0 0 0 19 36 A 1 1 0 0 0 20 37 A 1 1 0 0 0 21 36 A 1 1 0 0 0 20 35 z M 24 35 A 1 1 0 0 0 23 36 A 1 1 0 0 0 24 37 A 1 1 0 0 0 25 36 A 1 1 0 0 0 24 35 z M 28 35 A 1 1 0 0 0 27 36 A 1 1 0 0 0 28 37 A 1 1 0 0 0 29 36 A 1 1 0 0 0 28 35 z M 32 35 A 1 1 0 0 0 31 36 A 1 1 0 0 0 32 37 A 1 1 0 0 0 33 36 A 1 1 0 0 0 32 35 z M 36 35 A 1 1 0 0 0 35 36 A 1 1 0 0 0 36 37 A 1 1 0 0 0 37 36 A 1 1 0 0 0 36 35 z M 52 43 C 48.145666 43 45 46.145666 45 50 C 45 53.854334 48.145666 57 52 57 C 53.485878 57 54.862958 56.523344 55.996094 55.730469 A 7 7 0 0 0 60 57 A 7 7 0 0 0 67 50 A 7 7 0 0 0 60 43 A 7 7 0 0 0 55.990234 44.265625 C 54.858181 43.47519 53.483355 43 52 43 z M 52 45 C 52.915102 45 53.75982 45.253037 54.494141 45.681641 A 7 7 0 0 0 53 50 A 7 7 0 0 0 54.498047 54.314453 C 53.762696 54.74469 52.916979 55 52 55 C 49.226334 55 47 52.773666 47 50 C 47 47.226334 49.226334 45 52 45 z');
    	
    	svgElement.appendChild(pathElement);
    	
    	return svgElement;
		
	}
	
	// Empty Transactions SVG
	function buildEmptyTransactionsSvg() {
		
		let svgElement = document.createElementNS("http://www.w3.org/2000/svg", 'svg');
		svgElement.setAttribute('width','64');
		svgElement.setAttribute('height','64');
    	svgElement.setAttribute('viewBox','0 0 64 64');
    	svgElement.setAttribute('class','transactions-empty-svg svg-absolute-center');
    	
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

	/*
	* Sort By Functionality
	*/

	// Click on sort by creation date
	$('body').on('click', '#creationDateSortBy' , function(e) {	
		// Change title of in the dropdown
		document.getElementById('sortByBtnTit').innerText = 'Creation Date';
		// Close the category Modal
		closeCategoryModal();
		// Uncheck all the checked rows
		$('.number:checked').click();
		// hide the category view
		let transactionsTable = document.getElementById('transactionsTable');
		transactionsTable.classList.remove('d-table');
		transactionsTable.classList.add('d-none');
		// hide the accountTable
		document.getElementById('accountTable').classList.add('d-none');
		// show the recent transactions
		document.getElementById(recentTransactionsId).classList.remove('d-none');
		// Hide all account tables loaded
		$('.accountInfoTable').addClass('d-none');
		// Open Account Modal
		document.getElementById('accountInformationMdl').classList.add('d-none');
		// Toggle  Financial Position
		document.getElementsByClassName('transactions-chart')[0].classList.remove('d-none');
		// If a new transaction is registered then population is necessary
		if(registeredNewTransaction) {
			registeredNewTransaction = false;
			recentTransactionsPopulated = false;
			// replace pie chart with material spinner
			replacePieChartWithMSpinner();
			// Fetch JSOn for transactions and populate pie chart
			fetchJSONForTransactions();
			// Populate recent transactions
			populateRecentTransactions(true, false);
		}

		if(recentTransactionsPopulated) {
			return;
		}

		// Populate recent transactions from the cache if present
		if(isNotEmpty(userTransSortedByDate)) {
			populateRecentTransInfo(userTransSortedByDate);
		} else {
			// Populate recent transactions
			populateRecentTransactions(true, false);
		}
	});

	// Click on sort by creation date
	$('body').on('click', '#categorySortBy' , function(e) {
		// Change title of in the dropdown
		document.getElementById('sortByBtnTit').innerText = 'Category';
		// hide the recent transactions
		document.getElementById(recentTransactionsId).classList.add('d-none');
		// hide the accountTable
		document.getElementById('accountTable').classList.add('d-none');
		// Hide all account tables loaded
		$('.accountInfoTable').addClass('d-none');
		// show the category view
		let transactionsTable = document.getElementById('transactionsTable');
		transactionsTable.classList.add('d-table');
		transactionsTable.classList.remove('d-none');
		// Open Account Modal
		document.getElementById('accountInformationMdl').classList.add('d-none');
		// Toggle  Financial Position
		document.getElementsByClassName('transactions-chart')[0].classList.remove('d-none');

		// If a new transaction is registered then population is necessary
		if(registeredNewTransaction) {
			registeredNewTransaction = false;
			// Replace Transactions Table with empty spinner
			replaceTransactionsWithMSpinner();
			replacePieChartWithMSpinner();
			// Fetch JSOn for transactions and populate pie chart
			fetchJSONForTransactions();
		}
	});

	// Sorts the table by aggregating transactions by account
	$('body').on('click', '#accountSortBy' , function(e) {
		// Close the category Modal
		closeCategoryModal();
		// Uncheck all the checked rows
		$('.number:checked').click();
		// Change title of in the dropdown
		document.getElementById('sortByBtnTit').innerText = 'Account';
		// hide the recent transactions
		document.getElementById(recentTransactionsId).classList.add('d-none');
		// hide the transactions table
		let transactionsTable = document.getElementById('transactionsTable');
		transactionsTable.classList.remove('d-table');
		transactionsTable.classList.add('d-none');
		// Remove Account Table Class
		let popAccInfoTab = $('.accountInfoTable')
		popAccInfoTab.removeClass('d-none');
		// Show all the account table entries
		let allAccountRows = popAccInfoTab.find('.recentTransactionEntry')
		allAccountRows.removeClass('d-none');
		allAccountRows.addClass('d-table-row');
		// Find all misaligned arrows and align them
		popAccInfoTab.find('.rotateZero').removeClass('rotateZero').addClass('rotateNinty');
		
		// If register new transaction is populated then populate account again
		if(registeredNewTransaction) {
			sortByAccountPopulated = false;
		}

		// If already sorted then do nothing
		if(sortByAccountPopulated && popAccInfoTab.length > 0) {
			return;
		}
		// Show the accountTable
		document.getElementById('accountTable').classList.remove('d-none');
		// Populates the transactions by account
		populateTransactionsByAccount();
	});

	// Sorts the transactions by account
	function populateTransactionsByAccount() {
		if(isNotEmpty(userTransSortedByDate)) {
			popTransByAccWOAJAX();
			// If fetch all bank account flag is true then
			fetchAllBankAccountInformation();
		} else {
			populateRecentTransactions(false, false);	
		}
	}

	// Populate the account sort by section
	function popTransByAccWOAJAX() {
		// Remove all the transactions
		$('.accountInfoTable').remove();
		let accountAggreDiv = document.getElementById('recTransAndAccTable');
        let recentTransactionsFragment = document.createDocumentFragment();
		let resultKeySet = Object.keys(userTransSortedByDate);
		let createdAccIds = [];
     	for(let countGrouped = 0; countGrouped < resultKeySet.length; countGrouped++) {
     	   let key = resultKeySet[countGrouped];
     	   let userTransaction = userTransSortedByDate[key];
     	   let accountId = userTransaction.accountId;
     	   
     	   if(!includesStr(createdAccIds,accountId)) {
     	   		recentTransactionsFragment.appendChild(buildAccountHeader(accountId));
     	   		// Add Created Accounts ID to the array
     	   		createdAccIds.push(accountId);
     	   }
     	   recentTransactionsFragment.getElementById('accountSB-' + accountId).appendChild(buildTransactionRow(userTransaction, 'accountAggre'));
     	}

		document.getElementById('accountTable').classList.add('d-none');
    	accountAggreDiv.appendChild(recentTransactionsFragment);
	}

	// Appends the date header for recent transactions
	function buildAccountHeader(accountId) {
		let docFrag = document.createDocumentFragment();
		let accountHeader = document.createElement('div');
		accountHeader.id = 'accountSB-' + accountId;
		accountHeader.classList = 'tableBodyDiv accountInfoTable noselect';

		let accountTit = document.createElement('div');
		accountTit.classList = 'recentTransactionDateGrp d-table-row ml-3 font-weight-bold';

		// Title Wrapper
		let titleWrapper = document.createElement('div');
		titleWrapper.classList = 'd-table-cell text-nowrap';
		
		// Right Arrow
		let rightArrow = document.createElement('div');
		rightArrow.classList = 'material-icons rotateNinty';
		rightArrow.innerText = 'keyboard_arrow_right';
		titleWrapper.appendChild(rightArrow);

		// Title
		let accountTitle = document.createElement('a');
		accountTitle.id = 'accountTitle-' + accountId;
		accountTitle.classList = 'pl-4 accTitleAnchor';
		accountTitle.appendChild(buildSmallMaterialSpinner(accountId));
		titleWrapper.appendChild(accountTitle);
		accountTit.appendChild(titleWrapper);

		// Empty Cell
		let emptyCell = document.createElement('div');
		emptyCell.classList = 'd-table-cell';
		accountTit.appendChild(emptyCell);

		// Account Balance
		let accountBalance = document.createElement('div');
		accountBalance.classList = 'd-table-cell text-right text-nowrap pr-3';
		accountBalance.id = 'accountBalance-' + accountId;
		accountTit.appendChild(accountBalance);

		accountHeader.appendChild(accountTit);
		docFrag.appendChild(accountHeader);
		return docFrag;
	}

	// Build small material spinner
	function buildSmallMaterialSpinner(accountId) {
		// Add small Material Spinner
		let divMaterialSpinner = document.createElement('div');
		divMaterialSpinner.classList = 'material-spinner-small mx-auto pendingAccInfo';
		divMaterialSpinner.id = 'spinAcc-' + accountId;
		return divMaterialSpinner;
	}

	// Fetch all bank account information
	function fetchAllBankAccountInformation() {

		// Cache all the account headers to replace
    	let accHeadersToReplace = [];
		// Fetch all replacable elements
    	let replaceAbleEl = document.getElementsByClassName('pendingAccInfo');
    	// Check if the element is empty
    	if(isNotEmpty(replaceAbleEl)) {
    		// Fetch all replaceable account info
	  		for(let i = 0, length = replaceAbleEl.length; i < length; i++) {
	  			let replacEl = replaceAbleEl[i];
	  			// if the element is not empty then proceed
	  			if(isNotEmpty(replacEl)) {
	  				accHeadersToReplace.push(lastElement(splitElement(replacEl.id,'-')));
	  			}
	  		}
    	}
		
		// Fetch all bank account information
		er_a.fetchAllBankAccountInfo(function(bankAccountList) {
			let accountAggreDiv = document.getElementById('recTransAndAccTable');
			let accHeadFrag = document.createDocumentFragment();
	  		// Iterate all bank accounts
  			for(let i = 0, length = bankAccountList.length; i < length; i++) {
  				let bankAcc = bankAccountList[i];
  				// If the ID corresponding wiht the bank account is not populated then
  				if(includesStr(accHeadersToReplace, bankAcc.id.toString())) {
  					let accHeading = document.getElementById('accountTitle-' + bankAcc.id);
  					let accountBalance = document.getElementById('accountBalance-' + bankAcc.id);
  					// Replace HTML with Empty
	       			while (accHeading.firstChild) {
	       				accHeading.removeChild(accHeading.firstChild);
	       			}
  					accHeading.innerText = bankAcc.bankAccountName;
  					if(bankAcc.accountBalance < 0) { 
  						accountBalance.classList.add('expenseCategory');
  						accountBalance.innerText = '-' + currentCurrencyPreference + formatNumber(Math.abs(bankAcc.accountBalance), currentUser.locale);
  					} else { 
  						accountBalance.classList.add('incomeCategory');
  						accountBalance.innerText = currentCurrencyPreference + formatNumber(bankAcc.accountBalance, currentUser.locale);
  					}
  				} else {
  					// A new header for the rest
  					let accountHeaderNew = buildAccountHeader(bankAcc.id);
  					accountHeaderNew.getElementById('accountTitle-' + bankAcc.id).innerText = bankAcc.bankAccountName;
  					let accBal = accountHeaderNew.getElementById('accountBalance-' + bankAcc.id);
  					if(bankAcc.accountBalance < 0) { 
  						accBal.classList.add('expenseCategory');
  						accBal.innerText = '-' + currentCurrencyPreference + formatNumber(Math.abs(bankAcc.accountBalance), currentUser.locale);
  					} else { 
  						accBal.classList.add('incomeCategory');
  						accBal.innerText = currentCurrencyPreference + formatNumber(bankAcc.accountBalance, currentUser.locale);
  					} 
  					// Append Empty Table to child
  					accountHeaderNew.getElementById('accountSB-' + bankAcc.id).appendChild(buildEmptyAccountEntry(bankAcc.id));
  					// Append to the transaction view
  					accHeadFrag.appendChild(accountHeaderNew);
  				}
  			}

  			// If the document fragment contains a child
  			if(accHeadFrag.firstElementChild) {
  				let clickOnHeader = false;
  				// If Account Table is hidden then add d-none
				if(!document.getElementById('transactionsTable').classList.contains('d-none') || 
					!document.getElementById('recentTransactions').classList.contains('d-none')) {
					let accTableInfo = accHeadFrag.getElementsByClassName('accountInfoTable');

					// For all the account tables add d-none
					for(let i = 0, l = accTableInfo.length; i < l; i++) {
						accTableInfo[i].classList.add('d-none');
					}

					// Click on header
					clickOnHeader = true;

				}

				// Append the account transactions to the table
  				accountAggreDiv.appendChild(accHeadFrag);

  				// Simulate a click on the first table heading (Show Account Modal)
				let accountTableHeaders = $('.accountInfoTable .recentTransactionDateGrp')
				if(accountTableHeaders.length > 0 && clickOnHeader) {
					accountTableHeaders.get(0).click();
				}
  			}

        });
	}

	// Populate Empty account entry
	function buildEmptyAccountEntry(accId) {
		let rowEmpty = document.createElement('div');
		rowEmpty.classList = 'd-table-row recentTransactionDateGrp';
		rowEmpty.id = 'emptyAccountEntry-' + accId;

		let cell1 = document.createElement('div');
		cell1.classList = 'd-table-cell align-middle imageWrapperCell text-center';

		let roundedCircle = document.createElement('div');
		roundedCircle.classList = 'rounded-circle align-middle circleWrapperImageRT mx-auto';
		roundedCircle.appendChild(buildEmptyAccTransactionsSvg());
		cell1.appendChild(roundedCircle);
		rowEmpty.appendChild(cell1);

		let cell2 = document.createElement('div');
		cell2.classList = 'descriptionCellRT align-middle d-table-cell text-center';

		let emptyMessageRow = document.createElement('div');
		emptyMessageRow.classList = 'text-center tripleNineColor font-weight-bold';
		emptyMessageRow.innerText = "Oh! Snap! You don't have any transactions yet.";
		cell2.appendChild(emptyMessageRow);
		rowEmpty.appendChild(cell2);

		let cell3 = document.createElement('div');
		cell3.classList = 'descriptionCellRT d-table-cell';
		rowEmpty.appendChild(cell3);
			
		return rowEmpty;
	}

	// Populates account / recent transaction info as necessary
	function populateAccountOrRecentTransactionInfo() {
		let recentTransactionHeading = document.getElementsByClassName('recentTransactionDateGrp');
		let accountInfoTable = document.getElementsByClassName('accountInfoTable');
		let emptyTablePopulated = document.getElementsByClassName('transactions-empty-svg');
		if((recentTransactionHeading.length > 0 && accountInfoTable.length > 0) || emptyTablePopulated.length > 0) {
			// Load both populate recent & accounts table
			populateRecentTransactions(false, true);
		} else if (recentTransactionHeading.length > 0) {
			populateRecentTransactions(true, false);
		} else {
			// This populates the recent transactions for all other scenarios
			populateRecentTransactions(false, true);
		}
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