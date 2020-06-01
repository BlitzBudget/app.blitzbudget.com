"use strict";

(function scopeWrapper($) {
	// User Budget Map Cache
	let userBudgetCache = {};
	// Store the budget amount edited previously to compare
	let budgetAmountEditedPreviously = '';
	// store the budget chart in the cache to update later
	let budgetCategoryChart = '';
	// Category modal user budget category id;
	let budgetForModalOpened = '';
	// Choose the current month from the user chosen date
	let userChosenMonthName = months[chosenDate.getMonth()];

	/**
	 * START loading the page
	 * 
	 */
	if(isEqual(er.getCookie('currentPage'),'budgetPage')) {
		if(isEqual(window.location.href, window._config.app.invokeUrl)) {
			er.refreshCookiePageExpiry('budgetPage');
		 	er.fetchCurrentPage('/budgets', function(data) {
				// Fetch user budget and build the div
				fetchAllUserBudget();
				populateBudgetResource();
				// Load the new HTML
	            $('#mutableDashboard').html(data);
	            // Translate current Page
				translatePage(getLanguage());
	            // Set Current Page
		        document.getElementById('currentPage').textContent = window.translationData.budget.page.title;
			});
	 	}
	}
	
	let budgetPage = document.getElementById('budgetPage');
	if(isNotEmpty(budgetPage)) {
		budgetPage.addEventListener("click",function(e){
		 	er.refreshCookiePageExpiry('budgetPage');
			er.fetchCurrentPage('/budgets', function(data) {
				// Fetch user budget and build the div
				fetchAllUserBudget();
				populateBudgetResource();
				// Load the new HTML
	            $('#mutableDashboard').html(data);
	            // Translate current Page
				translatePage(getLanguage());
	            // Set Current Page
		        document.getElementById('currentPage').textContent = window.translationData.budget.page.title;
			});
		});
	}

	function populateBudgetResource(){
		// User Budget Map Cache
		userBudgetCache = {};
		// Store the budget amount edited previously to compare
		budgetAmountEditedPreviously = '';
		// store the budget chart in the cache to update later
		budgetCategoryChart = '';
		// Category modal user budget category id;
		budgetForModalOpened = '';

		/**
		*  Add Functionality Generic + Btn
		**/

		// Register Tooltips
		let ttinit = $("#addFncTT");
		ttinit.attr('data-original-title', window.translationData.budget.dynamic.tooltip);
		ttinit.tooltip({
			delay: { "show": 300, "hide": 100 }
	    });

	    // Generic Add Functionality
	    let genericAddFnc = document.getElementById('genericAddFnc');
	    document.getElementById('addFncTT').textContent = 'add';
	    genericAddFnc.classList = 'btn btn-round btn-rose btn-just-icon bottomFixed float-right addNewBudget';
	    $(genericAddFnc).unbind('click').click(function () {
	    	if(!this.classList.contains('addNewBudget')) {
	    		return;
	    	}

	    	// Create a new unbudgeted category
			createUnbudgetedCat(this);
	    });

	    /**
		 * Date Picker Module
		 */
		
		// Date Picker On click month
		$('.monthPickerMonth').unbind('click').click(function() {
			// Month picker is current selected then do nothing
			if(this.classList.contains('monthPickerMonthSelected')) {
				return;
			}
			
			let budgetAmountDiv = document.getElementById('budgetAmount');
			
			// If other pages are present then return this event
			if(budgetAmountDiv == null) {
				return;
			}
			
			// Set chosen date
			er.setChosenDateWithSelected(this);
			
			// Reset the User Budget with Loader
			resetUserBudgetWithLoader();
			
			// Call the user budget
			fetchAllUserBudget();
			
		});
	}

	// Fetches all the user budget and displays them in the user budget
	function fetchAllUserBudget() {
		let budgetDivFragment = document.createDocumentFragment();

		let values = {};
		if(isNotEmpty(window.currentUser.walletId)) {
			values.walletId = window.currentUser.walletId;
		} else {
			values.userId = window.currentUser.financialPortfolioId;
		}
		let y = window.chosenDate.getFullYear(), m = window.chosenDate.getMonth();
		values.startsWithDate = new Date(y, m, 1);
		values.endsWithDate = new Date(y, m + 1, 0);

		// Ajax Requests on Error
		let ajaxData = {};
   		ajaxData.isAjaxReq = true;
   		ajaxData.type = 'POST';
   		ajaxData.url = CUSTOM_DASHBOARD_CONSTANTS.budgetAPIUrl;
   		ajaxData.dataType = "json";
   		ajaxData.contentType = "application/json;charset=UTF-8";
   		ajaxData.data = JSON.stringify(values);
   		ajaxData.onSuccess = function(result) {
   			let budgets = result.Budget;
   			let dates = result.Date;
   			let wallet = result.Wallet;

   			// Dates Cache
        	window.datesCreated = result.Date;
        	populateCurrentDate(result.Date);

   			fetchJSONForCategories(result.Category);

   			// Replace currentCurrencySymbol with currency symbol
			replaceWithCurrency(wallet);
   			er_a.populateBankInfo(result.BankAccount);

        	for(let count = 0, length = budgets.length; count < length; count++){
            	let value = budgets[count];
          	  
          	  	if(isEmpty(value)) {
          	  		continue;
          	  	}
          	  	
          	  	// Store the values in a cache
          	  	userBudgetCache[value.budgetId] = value;

          	  	// Appends to a document fragment
          	  	budgetDivFragment.appendChild(buildUserBudget(value));
        	}
        	
        	// paints them to the budget dashboard
        	let budgetAmount = document.getElementById('budgetAmount');
        	// Replace HTML with Empty
    		while (budgetAmount.firstChild) {
    			budgetAmount.removeChild(budgetAmount.firstChild);
    		}
        	budgetAmount.appendChild(budgetDivFragment);
      	  	    	
    		
    		// Update the Budget Visualization module
    		updateBudgetVisualization();
        }
        ajaxData.onFailure = function (thrownError) {
        	manageErrors(thrownError, window.translationData.budget.dynamic.fetcherror,ajaxData);
        }

		jQuery.ajax({
			url: ajaxData.url,
			beforeSend: function(xhr){xhr.setRequestHeader("Authorization", authHeader);},
            type: ajaxData.type,
            dataType: ajaxData.dataType,
          	contentType: ajaxData.contentType,
          	data : ajaxData.data,
            success: ajaxData.onSuccess,
            error: ajaxData.onFailure
		});
		
	}
	
	// Build the user budget div
	function buildUserBudget(userBudget) {
		
		if(isEmpty(userBudget)) {
			return;
		}
		let cardWrapper = document.createDocumentFragment();
		
		let card = document.createElement("div");
		card.id = 'cardBudgetId-' + userBudget.budgetId;
		card.classList = 'card';
		
		let cardBody = document.createElement("div");
		cardBody.classList = 'card-body';
		
		// Card Row Remaining
		let cardRowRemaining = document.createElement('div');
		cardRowRemaining.classList = 'row';
		
		// Card title with category name
		let cardTitle = document.createElement('div');
		cardTitle.id = 'categoryName-' + userBudget.budgetId;
		cardTitle.classList = 'col-lg-6 text-left font-weight-bold';
		cardTitle.textContent = isEmpty(userBudget.categoryName) ? (isEmpty(window.categoryMap[userBudget.category]) ? userBudget.category : window.categoryMap[userBudget.category].name) : userBudget.categoryName;
		cardRowRemaining.appendChild(cardTitle);
		
		
		// <div id="budgetInfoLabelInModal" class="col-lg-12 text-right headingDiv justify-content-center align-self-center">Remaining (%)</div> 
		let cardRemainingText = document.createElement('div');
		cardRemainingText.classList = 'col-lg-6 text-right headingDiv justify-content-center align-self-center mild-text';
		cardRemainingText.id = 'budgetInfoLabelInModal-' + userBudget.budgetId;
		cardRemainingText.textContent = window.translationData.budget.dynamic.card.remaining;
		cardRowRemaining.appendChild(cardRemainingText);
		cardBody.appendChild(cardRowRemaining);
		
		// Card Row Percentage Available
		let cardRowPercentage = document.createElement('div');
		cardRowPercentage.classList = 'row';
		
		// Budget Amount Wrapper
		let cardAmountWrapperDiv = document.createElement('div');
		cardAmountWrapperDiv.classList = 'col-lg-3';
		
		// Budget Amount Div
		let cardBudgetAmountDiv = document.createElement('div');
		cardBudgetAmountDiv.id = 'budgetAmountEntered-' + userBudget.budgetId;
		cardBudgetAmountDiv.classList = 'text-left budgetAmountEntered font-weight-bold form-control';
		cardBudgetAmountDiv.setAttribute('contenteditable', true);
		cardBudgetAmountDiv.setAttribute('data-target', userBudget.budgetId);
		cardBudgetAmountDiv.textContent = formatToCurrency(userBudget.planned);
		cardAmountWrapperDiv.appendChild(cardBudgetAmountDiv);
		cardRowPercentage.appendChild(cardAmountWrapperDiv);
		
		// <span id="percentageAvailable" class="col-lg-12 text-right">NA</span> 
		let cardRemainingPercentage = document.createElement('div');
		cardRemainingPercentage.classList = 'col-lg-9 text-right percentageAvailable';
		cardRemainingPercentage.id = 'percentageAvailable-' + userBudget.budgetId;
		cardRemainingPercentage.textContent = window.translationData.budget.dynamic.card.na;
		cardRowPercentage.appendChild(cardRemainingPercentage);
		cardBody.appendChild(cardRowPercentage);
		
		// Parent div for Progress Bar
		let cardProgressAndRemainingAmount = document.createElement('div');
		
		// Div progress bar header
		let cardProgressClass = document.createElement('div');
		cardProgressClass.classList = 'progress';
		
		// progress bar
		let progressBar = document.createElement('div');
		progressBar.id='progress-budget-' + userBudget.budgetId;
		progressBar.classList = 'progress-bar progress-bar-budget-striped';
		progressBar.setAttribute('role', 'progressbar');
		progressBar.setAttribute('aria-valuenow', '0');
		progressBar.setAttribute('aria-valuemin', '0');
		progressBar.setAttribute('aria-valuemax', '100');
		cardProgressClass.appendChild(progressBar);
		cardProgressAndRemainingAmount.appendChild(cardProgressClass);

		
		// Remaining Amount Div
		let remainingAmountDiv = document.createElement('span');
		remainingAmountDiv.id = 'remainingAmount-' + userBudget.budgetId;
		remainingAmountDiv.classList = 'mild-text-budget';
		
		let currencyRemainingAmount = document.createElement('span');
		currencyRemainingAmount.textContent = currentCurrencyPreference + '0.00';
		remainingAmountDiv.appendChild(currencyRemainingAmount);
		cardProgressAndRemainingAmount.appendChild(remainingAmountDiv);
		
		let currencyRemainingText = document.createElement('span');
		currencyRemainingText.classList = 'mild-text'
		currencyRemainingText.textContent = window.translationData.budget.dynamic.card.remain;
		cardProgressAndRemainingAmount.appendChild(currencyRemainingText);
		cardBody.appendChild(cardProgressAndRemainingAmount);

		let actionDiv = document.createElement('div');
		actionDiv.id = 'actionIcons-' + userBudget.budgetId;
		actionDiv.classList = 'text-right';
		
		// Build a delete icon Div
		let deleteIconDiv = document.createElement('div');
		deleteIconDiv.classList = 'svg-container deleteIconWrapper d-inline-block';
		deleteIconDiv.setAttribute('data-toggle','tooltip');
		deleteIconDiv.setAttribute('data-placement','bottom');
		deleteIconDiv.setAttribute('title', window.translationData.budget.dynamic.delete);
		
		// SVG for delete
		let deleteSvgElement = document.createElementNS("http://www.w3.org/2000/svg", 'svg');
		deleteSvgElement.id = 'deleteSvgElement-' + userBudget.budgetId;
		deleteSvgElement.classList = 'deleteBudget';
		deleteSvgElement.setAttribute('data-target',userBudget.budgetId);
		deleteSvgElement.setAttribute('height','16');
		deleteSvgElement.setAttribute('width','16');
		deleteSvgElement.setAttribute('viewBox','0 0 14 18');
    	
		// Changing stroke to currentColor, Wraps the color of the path to its parent div
    	let deletePathElement = document.createElementNS("http://www.w3.org/2000/svg", 'path');
    	deletePathElement.setAttribute('fill','none');
    	deletePathElement.setAttribute('stroke','currentColor');
    	deletePathElement.setAttribute('stroke-width','1.25');
    	deletePathElement.setAttribute('stroke-linecap','square');
    	deletePathElement.setAttribute('d','M4.273 3.727V2a1 1 0 0 1 1-1h3.454a1 1 0 0 1 1 1v1.727M13 5.91v10.455a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V5.909m6 2.727v5.455M4.273 8.636v5.455m5.454-5.455v5.455M13 3.727H1');
    	deleteSvgElement.appendChild(deletePathElement);
    	deleteIconDiv.appendChild(deleteSvgElement);
    	
    	let materialSpinnerElement = document.createElement('div');
    	materialSpinnerElement.id= 'deleteElementSpinner-' + userBudget.budgetId;
    	materialSpinnerElement.classList = 'material-spinner-small d-none';
    	deleteIconDiv.appendChild(materialSpinnerElement);
    	
    	actionDiv.appendChild(deleteIconDiv);
    	cardBody.appendChild(actionDiv);
    	
		card.appendChild(cardBody);
		cardWrapper.appendChild(card);
		// Handle the update of the progress bar modal
        updateProgressBarAndRemaining(userBudget, cardWrapper);
		return cardWrapper;
		
	}
	
	// Update the budget visualization module
	function updateBudgetVisualization() {
		let categoryKeys = Object.keys(window.categoryMap);
		
		let userBudgetCacheKeys = Object.keys(userBudgetCache);
		
		// Append an empty chart when there is no budget
		let dataPreferences = {};
		
		let totalBudgetedCategoriesDiv = document.getElementById('totalBudgetedCategories');
		let toBeBudgetedDiv = document.getElementById('toBeBudgeted');
		let detachChart = false;
		if(isNotEmpty(userBudgetCacheKeys)) {
			animateValue(totalBudgetedCategoriesDiv, 0, userBudgetCacheKeys.length, '' ,1000);
			// If empty then update the chart with the 0
			toBeBudgetedDiv.textContent = 0;
			
			let totalCategoriesAvailable = categoryKeys.length;
			let toBeBudgetedAvailable = totalCategoriesAvailable - userBudgetCacheKeys.length;
			
			// assign the to be budgeted
			animateValue(toBeBudgetedDiv, 0, toBeBudgetedAvailable, '' ,1000);

			let userBudgetPercentage = round(((userBudgetCacheKeys.length / totalCategoriesAvailable) * 100),1);
			let toBeBudgetedPercentage = round(((toBeBudgetedAvailable / totalCategoriesAvailable) * 100),1);
			// labels: [Total Budgeted Category, To Be Budgeted]
			dataPreferences = {
                labels: [userBudgetPercentage + '%',toBeBudgetedPercentage + '%'],
                series: [userBudgetCacheKeys.length,toBeBudgetedAvailable]
            };
		} else {
			// If empty then update the chart with the 0
			toBeBudgetedDiv.textContent = 0;
			totalBudgetedCategoriesDiv.textContent = 0;
			detachChart = true;
			
			// assign the to be budgeted for budget visualization chart
			toBeBudgetedDiv.textContent = categoryKeys.length;
			
			// Create a document fragment to append
			let emptyBudgetDocumentFragment = document.createDocumentFragment();
			emptyBudgetDocumentFragment.appendChild(createCopyFromPreviousMonthModal());
			
			// Replace the HTML of the empty modal
			let budgetAmountDiv = document.getElementById('budgetAmount');
			// Replace the HTML to empty and then append child
    		while (budgetAmountDiv.firstChild) {
    			budgetAmountDiv.removeChild(budgetAmountDiv.firstChild);
    		}
			budgetAmountDiv.appendChild(emptyBudgetDocumentFragment);
		}
		
		if(detachChart) {
			// Remove the donut chart from the DOM
			let chartDonutSVG = document.getElementsByClassName('ct-chart-donut');
			
			if(chartDonutSVG.length > 0) {
				chartDonutSVG[0].parentNode.removeChild(chartDonutSVG[0]);
				// Detach the chart
				budgetCategoryChart.detach();
			} else {
				let chartNode = document.getElementById('chartBudgetVisualization');
				while (chartNode.firstChild) {
				   chartNode.removeChild(chartNode.lastChild);
				}
			}
		} else if(isNotEmpty(budgetCategoryChart)) {
			budgetCategoryChart.update(dataPreferences);
		} else {
			buildPieChart(dataPreferences , 'chartBudgetVisualization');
		}
		
	}
	
	// Introduce Chartist pie chart
	function buildPieChart(dataPreferences, id) {
		 /*  **************** Public Preferences - Pie Chart ******************** */
		let labels = [window.translationData.budget.dynamic.chart.totalbudget, window.translationData.budget.dynamic.chart.tobebudgeted]

        var optionsPreferences = {
		  donut: true,
		  donutWidth: 50,
		  startAngle: 270,
		  showLabel: true,
		  height: '230px'
        };
        
        // Reset the chart
        replaceHTML(id, '');
        // Dispose the previous tooltips created
        $("#" + id).tooltip('dispose');
        
        if(isNotEmpty(dataPreferences)) {
        	// Build chart and Add tooltip for the doughnut chart
        	budgetCategoryChart = new Chartist.Pie('#' + id, dataPreferences, optionsPreferences).on('draw', function(data) {
      		  if(data.type === 'slice') {
		        	let sliceValue = data.element._node.getAttribute('ct:value');
		        	data.element._node.setAttribute("title", labels[data.index] + ": <strong>" + sliceValue + '</strong>');
					data.element._node.setAttribute("data-chart-tooltip", id);
      		  }
			}).on("created", function() {
				// Initiate Tooltip
				$("#" + id).tooltip({
					selector: '[data-chart-tooltip="' + id + '"]',
					container: "#" + id,
					html: true,
					placement: 'auto',
					delay: { "show": 300, "hide": 100 }
				});
			});
        	
        	// Animate the doughnut chart
        	er.startAnimationDonutChart(budgetCategoryChart);
        }
        
	}
	
	// Catch the amount when the user focuses on the budget
	$( "body" ).on( "focusin", ".budgetAmountEntered" ,function() {
		budgetAmountEditedPreviously = trimElement(this.textContent);
	});
	
	// Catch the amount when the user focuses on the budget
	$( "body" ).on( "focusout", ".budgetAmountEntered" ,function() {
		postNewBudgetAmount(this);
	});
	

	// Amount - disable enter key and submit request
	$('body').on('keyup', '.budgetAmountEntered' , function(e) {
		  var keyCode = e.keyCode || e.which;
		  if (keyCode === 13) { 
		    e.preventDefault();

		    document.activeElement.blur();
		    return false;
		  }
	});
	
	// Post the newly entered budget amount and convert the auto generation to false
	function postNewBudgetAmount(element) {
		// If the text is not changed then do nothing (Remove currency locale and minus sign, remove currency formatting and take only the number and convert it into decimals) and round to 2 decimal places
		let enteredText = er.convertToNumberFromCurrency(element.textContent, currentCurrencyPreference);
		let previousText = er.convertToNumberFromCurrency(budgetAmountEditedPreviously, currentCurrencyPreference);
		
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
		
		if(previousText != enteredText){
			// Fetch the id
			let budgetId = element.getAttribute('data-target');
			
			// Post a new budget to the user budget module and change to auto generated as false. 
			var values = {};
			values['planned'] = enteredText;
			values['budgetId'] = budgetId;
			values['walletId'] = currentUser.walletId;

			// Ajax Requests on Error
			let ajaxData = {};
       		ajaxData.isAjaxReq = true;
       		ajaxData.type = "PATCH";
       		ajaxData.url = CUSTOM_DASHBOARD_CONSTANTS.budgetAPIUrl;
       		ajaxData.dataType = "json";
       		ajaxData.contentType = "application/json;charset=UTF-8";
       		ajaxData.data = JSON.stringify(values);
       		ajaxData.onSuccess = function registerSuccess(result){
       			  let userBudget = result['body-json'];
	        	  // on success then replace the entered text 
	        	  element.textContent = formatToCurrency(enteredText);
	        	  // Update the budget cache
	        	  userBudgetCache[userBudget.budgetId].planned = userBudget.planned;
	        	  // Update the modal
	        	  updateProgressBarAndRemaining(userBudgetCache[userBudget.budgetId], document);
            }
            ajaxData.onFailure = function (thrownError) {
            	manageErrors(thrownError, window.translationData.budget.dynamic.changeerror,ajaxData);
            		
	            // update the current element with the previous amount
	            let formattedBudgetAmount = formatToCurrency(previousText);
	            element.textContent = formattedBudgetAmount;
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
		} else {
			// previous text and entered text is the same then simy replace the text
			element.textContent = formatToCurrency(enteredText);
		}
	}
	
	// Use user budget to update information in the modal
	function updateProgressBarAndRemaining(budget, documentOrFragment) {
		let categoryTotalAmount = budget.used;
		
		let userBudgetValue = budget.planned;
		let budgetIdKey = budget.budgetId;
		
		let remainingAmountDiv = documentOrFragment.getElementById('remainingAmount-' + budgetIdKey);
		let remainingAmountPercentageDiv = documentOrFragment.getElementById('percentageAvailable-' + budgetIdKey);
		let budgetLabelDiv = documentOrFragment.getElementById('budgetInfoLabelInModal-' + budgetIdKey);
		let progressBarCategoryModal = documentOrFragment.getElementById('progress-budget-' + budgetIdKey);
		// If the budget is not created for the particular category, make sure the budget is not equal to zero
		if(isNotEmpty(userBudgetValue) && isNotEmpty(categoryTotalAmount)) {
			// Calculate remaining budget
			let budgetAvailableToSpendOrSave = userBudgetValue - Math.abs(categoryTotalAmount);
			
			// Calculate the minus sign and appropriate class for the remaining amount 
			if(budgetAvailableToSpendOrSave < 0) {
				// if the transaction category is expense category then show overspent else show To be budgeted
				if(categoryMap[budget.category].type == CUSTOM_DASHBOARD_CONSTANTS.expenseCategory) {
					budgetLabelDiv.textContent = window.translationData.budget.dynamic.card.overspent;
				} else if(categoryMap[budget.category].type == CUSTOM_DASHBOARD_CONSTANTS.incomeCategory) {
					budgetLabelDiv.textContent = window.translationData.budget.dynamic.card.tobebudgeted;
				}
				
			} else {
				budgetLabelDiv.textContent = window.translationData.budget.dynamic.card.remaining;
			}
			
			// Change the remaining text appropriately
			budgetAvailableToSpendOrSave = isNaN(budgetAvailableToSpendOrSave) ? 0 : budgetAvailableToSpendOrSave;
			remainingAmountDiv.textContent = formatToCurrency(budgetAvailableToSpendOrSave);
			
			// Calculate percentage available to spend or save
			let remainingAmountPercentage = round(((budgetAvailableToSpendOrSave / userBudgetValue) * 100),0);
			// If the user budget is 0 then the percentage calculation is not applicable
			if(userBudgetValue == 0 || isNaN(remainingAmountPercentage)) {
				remainingAmountPercentageDiv.textContent = window.translationData.budget.dynamic.card.na;
			} else {
				remainingAmountPercentageDiv.textContent = remainingAmountPercentage + '%';
			}
			
			// Assign progress bar value. If the category amount is higher then the progress is 100%
			let progressBarPercentage = isNaN(remainingAmountPercentage) ? 0 : (categoryTotalAmount > userBudgetValue) ? 100 : (100 - remainingAmountPercentage);
			// Set the value and percentage of the progress bar
			progressBarCategoryModal.setAttribute('aria-valuenow', progressBarPercentage);
			progressBarCategoryModal.style.width = progressBarPercentage + '%'; 
		} else if(progressBarCategoryModal != null) {
			remainingAmountPercentageDiv.textContent = window.translationData.budget.dynamic.card.na;
			// Set the value and percentage of the progress bar
			progressBarCategoryModal.setAttribute('aria-valuenow', 0);
			progressBarCategoryModal.style.width = 0 + '%';
			// Set the amount remaining
			remainingAmountDiv.textContent = formatToCurrency(0.00);
			// Set the budget remaining text
			budgetLabelDiv.textContent = window.translationData.budget.dynamic.card.remaining;
		}
	}
	
	// Add click event listener to delete the budget
	$('body').on('click', '.deleteBudget' , function(e) {
		let deleteButtonElement = this;
		let budgetId = this.getAttribute('data-target');
		
		// Show the material spinner and hide the delete button
		document.getElementById('deleteElementSpinner-' + budgetId).classList.toggle('d-none');
		this.classList.toggle('d-none');		
		
		// Security check to ensure that the budget is present
		if(isEmpty(userBudgetCache[budgetId])) {
			showNotification(window.translationData.budget.dynamic.card.deleteerror,window._constants.notification.error);
			return;
		}

		let values = {};
		values.walletId = window.currentUser.walletId;
		values.itemId = budgetId;
		
		// Ajax Requests on Error
		let ajaxData = {};
   		ajaxData.isAjaxReq = true;
   		ajaxData.type = "POST";
   		ajaxData.url = window._config.api.invokeUrl + window._config.api.deleteItem;
   		ajaxData.dataType = "json";
   		ajaxData.contentType = "application/json;charset=UTF-8";
   		ajaxData.data = JSON.stringify(values);
   		ajaxData.onSuccess = function(result){
        	  // Remove the budget modal
        	  let budgetDiv = document.getElementById('cardBudgetId-' + budgetId);
        	  $(budgetDiv).fadeOut('slow', function(){
        		  this.remove();
        	  });
        	  	
        	  // Delete the entry from the map if it is pending to be updated
			  delete userBudgetCache[budgetId];
				
        	  // Update budget visualization chart after deletion
        	  updateBudgetVisualization();
        }
        ajaxData.onFailure = function(thrownError) {
        	  manageErrors(thrownError, window.translationData.budget.dynamic.card.deleteerror,ajaxData);
	          	
	          // Remove the material spinner and show the delete button again
	          document.getElementById('deleteElementSpinner-' + budgetId).classList.toggle('d-none');
	          deleteButtonElement.classList.toggle('d-none');
        }
		// Request to delete the user budget
		$.ajax({
	          type: ajaxData.type,
	          url: ajaxData.url,
	          beforeSend: function(xhr){xhr.setRequestHeader("Authorization", authHeader);},
	          dataType: ajaxData.dataType,
		      contentType: ajaxData.contentType,
		      data: ajaxData.data,
              success: ajaxData.onSuccess,
              error:  ajaxData.onFailure
		});
		
	});
	
	// Copy all budget from previous modal if budget is empty
	function createCopyFromPreviousMonthModal() {
		// User chosen month
		userChosenMonthName = months[chosenDate.getMonth()];
		
		let card = document.createElement("div");
		card.id = 'emptyBudgetCard';
		card.classList = 'card text-center';
		
		let cardBody = document.createElement("div");
		cardBody.classList = 'card-body';
		
		let imgDiv = document.createElement('div');
		imgDiv.classList = 'position-relative';
		
		let imgTransfer = document.createElement('img');
		imgTransfer.id = 'budgetImage';
		imgTransfer.src = '../img/dashboard/budget/icons8-documents-100.png';
		imgDiv.appendChild(imgTransfer);
		
		let monthSpan = document.createElement('span');
		monthSpan.classList = 'previousMonth';
		imgDiv.appendChild(monthSpan);
		
		let monthSpanCurrent = document.createElement('span');
		monthSpanCurrent.classList = 'currentMonth';
		monthSpanCurrent.textContent = userChosenMonthName.slice(0,3);
		imgDiv.appendChild(monthSpanCurrent)
		cardBody.appendChild(imgDiv);
		
		// Card Row Heading
		let cardRowHeading = document.createElement('div');
		cardRowHeading.id = 'emptyBudgetHeading'
		cardRowHeading.classList = 'row font-weight-bold justify-content-center';
		cardRowHeading.textContent = window.translationData.budget.dynamic.card.empty.hey + userChosenMonthName + '.';
		cardBody.appendChild(cardRowHeading);
		
		// card description
		let cardRowDescription = document.createElement('div');
		cardRowDescription.id = 'emptyBudgetDescription';
		cardRowDescription.classList = 'row justify-content-center';
		cardBody.appendChild(cardRowDescription);
		
		// card button clone
		let clonePreviousMonthButton = document.createElement('button');
		clonePreviousMonthButton.id = 'copyPreviousMonthsBudget';
		clonePreviousMonthButton.classList = 'btn btn-budget'
		clonePreviousMonthButton.textContent = window.translationData.budget.dynamic.card.empty.plan + userChosenMonthName;
		cardBody.appendChild(clonePreviousMonthButton);
			
		card.appendChild(cardBody);
		
		return card;
	}
	
	// Clicking on copy budget
	$('body').on('click', '#copyPreviousMonthsBudget' , function(e) {
		this.setAttribute("disabled", "disabled");
		this.textContent = window.translationData.budget.dynamic.card.empty.create;
		let element = this;
		let budgetAmount = document.getElementById('budgetAmount');
		
		// Enable the Add button
  	  	let genericAddFnc = document.getElementById('genericAddFnc');
  	  	genericAddFnc.classList.add('d-none');
  	  	
		// Appends to a document fragment
  	  	createAnEmptyBudget(window.defaultCategories[0], budgetAmount);
  	  	createAnEmptyBudget(window.defaultCategories[1], budgetAmount);
		return;
	});
	
	
	// Create two empty budgets on click Start Planning for .. button
	function createAnEmptyBudget(categoryId, budgetAmountDiv) {
		
		var values = {};

		if(isEmpty(categoryId.name)) {
			values['category'] = categoryId;
		} else {
			values['category'] = categoryId.name;
			values['categoryType'] = categoryId.type;
		}

		values['planned'] = 0;
		values['dateMeantFor'] = window.currentDateAsID;
		values['walletId'] = currentUser.walletId;

		// Ajax Requests on Error
		let ajaxData = {};
   		ajaxData.isAjaxReq = true;
   		ajaxData.type = "PUT";
   		ajaxData.url = CUSTOM_DASHBOARD_CONSTANTS.budgetAPIUrl;
   		ajaxData.dataType = "json";
   		ajaxData.contentType = "application/json;charset=UTF-8";
   		ajaxData.data = JSON.stringify(values);
   		ajaxData.onSuccess = function(result) {
   				// Filter the body
   				let userBudget = result['body-json'];
   				// Set Current Date as ID (For First time)
   				window.currentDateAsID = userBudget.dateMeantFor;
   				// Assign Category Id
   				assignCategoryId(userBudget);
   				// Handle hide and unhide categories
   				handleHideAndUnhideCategories();
   				// Populate CurrentDateAsId if necessary
   				if(notIncludesStr(window.currentDateAsID, 'Date#')) { window.currentDateAsID = userBudget.dateMeantFor }
   				// Build the new budget
	        	let budgetDivFragment = document.createDocumentFragment();
	        	budgetDivFragment.appendChild(buildUserBudget(userBudget));
	        	// Store the values in a cache
          	  	userBudgetCache[userBudget.budgetId] = userBudget;
          	  	// Enable the Add button
          	  	let genericAddFnc = document.getElementById('genericAddFnc');
          	  	genericAddFnc.classList.remove('d-none');
          	  	// Remove all category with name
          	  	let categoryNameDiv = budgetDivFragment.getElementById('categoryName-' + userBudget.budgetId);
    			// Replace HTML with Empty
        		while (categoryNameDiv.firstChild) {
        			categoryNameDiv.removeChild(categoryNameDiv.firstChild);
        		}

          	  	
          	  	// Container for inlining the select form
				let containerForSelect = document.createElement('div');
				containerForSelect.setAttribute("id", 'selectCategoryRow-' + userBudget.budgetId);
				containerForSelect.className = 'btn-group btnGroup-1';
				containerForSelect.setAttribute('aria-haspopup', true);
				containerForSelect.setAttribute('aria-expanded', false);

				let displayCategory = document.createElement('div');
				displayCategory.classList = 'w-md-15 w-8 dd-display-wrapper';
				displayCategory.disabled = true;
				displayCategory.textContent = isEmpty(userBudget.categoryName) ? (isEmpty(window.categoryMap[userBudget.category]) ? userBudget.category : window.categoryMap[userBudget.category].name) : userBudget.categoryName;
				containerForSelect.appendChild(displayCategory);


				let dropdownArrow = document.createElement('div');
				dropdownArrow.classList = 'dropdown-toggle dropdown-toggle-split';
				dropdownArrow.setAttribute('data-toggle', 'dropdown');
				dropdownArrow.setAttribute('aria-haspopup', 'true');
				dropdownArrow.setAttribute('aria-expanded', 'false');

				let srOnly = document.createElement('span');
				srOnly.classList = 'sr-only';
				srOnly.textContent = 'Toggle Dropdown';
				dropdownArrow.appendChild(srOnly);
				containerForSelect.appendChild(dropdownArrow);

				let dropdownMenu = document.createElement('div');
				dropdownMenu.classList = 'dropdown-menu';

				let inputGroup = document.createElement('div');
				inputGroup.classList = 'input-group';

				let incomeCategoriesHSix = document.createElement('h6');
				incomeCategoriesHSix.classList = 'dropdown-header';
				incomeCategoriesHSix.textContent = window.translationData.budget.dynamic.income;
				inputGroup.appendChild(incomeCategoriesHSix);

				let incomeCategories = document.createElement('div');
				incomeCategories.classList = 'incomeCategories';
				incomeCategories.setAttribute('data-target', userBudget.budgetId);
				incomeDropdownItems =  cloneElementAndAppend(incomeCategories, incomeDropdownItems);
				hideAllBudgetedCategories(incomeCategories);
				inputGroup.appendChild(incomeCategories);

				let dividerDD = document.createElement('div');
				dividerDD.classList = 'dropdown-divider';
				inputGroup.appendChild(dividerDD);

				let expenseCategoriesHSix = document.createElement('h6');
				expenseCategoriesHSix.classList = 'dropdown-header';
				expenseCategoriesHSix.textContent = window.translationData.budget.dynamic.expense;
				inputGroup.appendChild(expenseCategoriesHSix);

				let expenseCategories = document.createElement('div');
				expenseCategories.classList = 'expenseCategories';
				expenseCategories.setAttribute('data-target', userBudget.budgetId);
				expenseDropdownItems =  cloneElementAndAppend(expenseCategories, expenseDropdownItems);
				hideAllBudgetedCategories(expenseCategories);
				inputGroup.appendChild(expenseCategories);
				dropdownMenu.appendChild(inputGroup);
				
        		
        		containerForSelect.appendChild(dropdownMenu);
        	  	categoryNameDiv.appendChild(containerForSelect);
        	  	
        	  	// Handle the update of the progress bar modal
    			updateProgressBarAndRemaining(userBudget, budgetDivFragment);

	      		// paints them to the budget dashboard if the empty budget div is not null
	      		if(document.getElementById('emptyBudgetCard') !== null) {
	      			// Empty the div
	      			while (budgetAmount.firstChild) {
	        			budgetAmount.removeChild(budgetAmount.firstChild);
	        		}
	      			budgetAmountDiv.appendChild(budgetDivFragment);
	      		} else if(budgetAmountDiv.childNodes[0] != null) {
	      			budgetAmountDiv.insertBefore(budgetDivFragment,budgetAmountDiv.childNodes[0]);
	      		} else {
	      			budgetAmountDiv.appendChild(budgetDivFragment);
	      		}

            	
            	// Update the Budget Visualization module
        		updateBudgetVisualization();
            	
	    }
        ajaxData.onFailure = function (thrownError) {
        	// Enable the Add button
      	  	let genericAddFnc = document.getElementById('genericAddFnc');
      	  	genericAddFnc.classList.remove('d-none');
      	  	
        	manageErrors(thrownError, window.translationData.budget.dynamic.unableerror,ajaxData);
        }

		$.ajax({
	          type: ajaxData.type,
	          url: ajaxData.url,
	          beforeSend: function(xhr){xhr.setRequestHeader("Authorization", authHeader);},
	          dataType: ajaxData.dataType,
	          contentType: ajaxData.contentType,
	          data: ajaxData.data,
	          success: ajaxData.onSuccess,
	          error:  ajaxData.onFailure
		});
	}

	/*
	* Hides all budgeted categories and unhides all unbudgeted
	*/
	function hideAllBudgetedCategories(element) {

		let allBudgetedCategories = {};
		// Get all the budgeted categories
		let budgetKeySet = Object.keys(userBudgetCache);
		for(let count = 0, length = budgetKeySet.length; count < length; count++){
			let key = budgetKeySet[count];
      	  	let budgetObject = userBudgetCache[key];
      	  	// Push the budgeted category to cache
      	  	if(isNotEmpty(budgetObject)) { allBudgetedCategories[budgetObject.category] = budgetObject;}
		}

		let children = element.children;
		for (let i = 0, len = children.length; i < len; i++) {
		  let childElement = children[i];
		  if(isNotEmpty(userBudgetCache[childElement.lastChild.value])) {
		  	childElement.classList.add('d-none');
		  } else {
		  	childElement.classList.remove('d-none');
		  }
		}

	}

	function handleHideAndUnhideCategories() {
		let incomeCategories = document.getElementsByClassName('incomeCategories');
		for(let i=0, len = incomeCategories.length; i < len; i++) {
			hideAllBudgetedCategories(incomeCategories[i]);
		}
		let expenseCategories = document.getElementsByClassName('expenseCategories');
		for(let i=0, len = expenseCategories.length; i < len; i++) {
			hideAllBudgetedCategories(expenseCategories[i]);
		}
	}
	
	// Change trigger on select
	$('body').on("click", "#budgetAmount .dropdown-item" , function(event){
		let currentElement = this;
		let categoryId = this.lastChild.value;
		let budgetId = this.parentNode.getAttribute('data-target');

		// Make sure that the category selected is not budgeted
		let allUnbudgetedCategories = returnUnbudgetedCategories();
		if(notIncludesStr(allUnbudgetedCategories,this.lastChild.value)) {
			showNotification(window.translationData.budget.dynamic.alreadyerror,window._constants.notification.error);
			return;
		}
		
		// Call the change of category services
		let values = {};
		values['budgetId'] = budgetId;
		values['walletId'] = window.currentUser.walletId;
		values['dateMeantFor'] = window.currentDateAsID;
		values['category'] = categoryId;
		let categoryItem = window.categoryMap[categoryId];
		let oldCategoryName = document.getElementById('selectCategoryRow-' + budgetId).firstChild.textContent;
		if(isEmpty(categoryItem.id)) {
			values['categoryType'] = categoryItem.type;
			values['dateMeantFor'] = window.currentDateAsID;
			document.getElementById('selectCategoryRow-' + budgetId).firstChild.textContent = categoryId;
		} else {
			document.getElementById('selectCategoryRow-' + budgetId).firstChild.textContent = window.categoryMap[categoryId].name;
		}

		// Ajax Requests on Error
		let ajaxData = {};
   		ajaxData.isAjaxReq = true;
   		ajaxData.type = "PATCH";
   		ajaxData.url = CUSTOM_DASHBOARD_CONSTANTS.budgetAPIUrl;
   		ajaxData.dataType = "json";
   		ajaxData.contentType = "application/json;charset=UTF-8";
   		ajaxData.data = JSON.stringify(values);
   		ajaxData.onSuccess = function(result){
   			let userBudget = result['body-json'];
   			// Assign new category to the user budget cache
			userBudgetCache[userBudget.budgetId].category = userBudget.category;
			// Category Item
   			if(isEmpty(categoryItem.id)) {
   				assignCategoryId(userBudget);
   				// Change the drop down 
   				currentElement.lastChild.value = userBudget.category;
   				// Handle hide and unhide categories
   				handleHideAndUnhideCategories();
   			}
        	 
        	// Handle the update of the progress bar modal
 			updateProgressBarAndRemaining(userBudgetCache, document);
	        	 
		}
        ajaxData.onFailure = function (thrownError) {
        		manageErrors(thrownError, window.translationData.budget.dynamic.changeerror,ajaxData);
        		// Chacnge the button text to the old one if fails. 
        		document.getElementById('selectCategoryRow-' + budgetId).firstChild.textContent = oldCategoryName;
        }

		$.ajax({
	          type: ajaxData.type,
	          url: ajaxData.url,
	          beforeSend: function(xhr){xhr.setRequestHeader("Authorization", authHeader);},
	          dataType: ajaxData.dataType,
	          contentType: ajaxData.contentType, 
	          data : ajaxData.data,
	          success: ajaxData.onSuccess,
	          error:  ajaxData.onFailure
		});
	
	});

	// Create a new unbudgeted category
	function createUnbudgetedCat(event) {
		let categoryItem = returnUnbudgetedCategory();
		
		if(isEmpty(categoryItem)) {
			showNotification(window.translationData.budget.dynamic.allcategorieserror,window._constants.notification.error);
			return;
		}
		// Disable the add button
		event.classList.add('d-none');
		
		let budgetAmountDiv = document.getElementById('budgetAmount');
		createAnEmptyBudget(categoryItem, budgetAmountDiv);
	}
	
	// Find the unbudgeted category 
	function returnUnbudgetedCategory() {
		let categoryItem = '';
		
		// Iterate through all the available categories
		if(isEmpty(userBudgetCache)) {
			categoryItem = window.defaultCategories[0];
		} else {
			let allBudgetedCategories = {};
			// Get all the budgeted categories
			let budgetKeySet = Object.keys(userBudgetCache);
			for(let count = 0, length = budgetKeySet.length; count < length; count++){
				let key = budgetKeySet[count];
	      	  	let budgetObject = userBudgetCache[key];
	      	  	// Push the budgeted category to cache
	      	  	if(isNotEmpty(budgetObject)) { allBudgetedCategories[budgetObject.category] = budgetObject;}
			}
			
			let dataKeySet = Object.keys(categoryMap);
			for(let count = 0, length = dataKeySet.length; count < length; count++){
				let key = dataKeySet[count];
				let categoryObj = categoryMap[key];
	      	  	
	      	  	// If a category that is not contained in the budget cache is found then assign and leave for loop
	      	  	if(isEmpty(categoryObj) 
	      	  		|| isEmpty(categoryObj.id) 
	      	  		|| isEmpty(allBudgetedCategories[categoryObj.id])) {
	      	  		categoryItem = categoryObj;
	      	  		break;
	      	  	}
	      	  	
			}
		}
		
		return categoryItem;
	}

	// Find the unbudgeted categories 
	function returnUnbudgetedCategories() {
		let categoryArray = [];
		
		// Iterate through all the available categories
		if(isEmpty(userBudgetCache)) {
			// iterate through all available categories and 
			let dataKeySet = Object.keys(categoryMap);
			for(let count = 0, length = dataKeySet.length; count < length; count++){
				let key = dataKeySet[count];
	      	  	let categoryObject = categoryMap[key];
	      	  	categoryArray.push(categoryObject);
			}
		} else {
			let allBudgetedCategories = {};
			// Get all the budgeted categories
			let budgetKeySet = Object.keys(userBudgetCache);
			for(let count = 0, length = budgetKeySet.length; count < length; count++){
				let key = budgetKeySet[count];
	      	  	let budgetObject = userBudgetCache[key];
	      	  	// Push the budgeted category to cache
	      	  	if(isNotEmpty(budgetObject)) { allBudgetedCategories[budgetObject.category] = budgetObject;}
			}
			
			// Iterate through all the available categories and find the ones that does not have a budget yet
			let dataKeySet = Object.keys(categoryMap);
			for(let count = 0, length = dataKeySet.length; count < length; count++){
				let key = dataKeySet[count];
				let categoryObj = categoryMap[key];
	      	  	
	      	  	// If a category that is not contained in the budget cache is found then assign and leave for loop
	      	  	if(isEmpty(categoryObj) 
	      	  		|| isEmpty(categoryObj.id) 
	      	  		|| isEmpty(allBudgetedCategories[categoryObj.id])) {
	      	  		// Update category Id where ever possible, else update it with category name
	      	  		if(isNotEmpty(categoryObj.id)) { categoryArray.push(categoryObj.id); } else { categoryArray.push(categoryObj.name); }	      	  		
	      	  	}
	      	  	
			}
		}
		
		return categoryArray;
	}
	
	// Reset the user budget with loader
	function resetUserBudgetWithLoader() {
		// User Budget Map Cache
		userBudgetCache = {};
		// Store the budget amount edited previously to compare
		budgetAmountEditedPreviously = '';
		// store the budget chart in the cache to update later
		budgetCategoryChart = '';
		// Category modal user budget category id;
		budgetForModalOpened = '';
		
		// Append Empty Budget Loader
		let emptyDocumentFragment = document.createDocumentFragment();
		
		let cardDiv = document.createElement('div');
		cardDiv.classList = 'card';
		
		let cardBody = document.createElement('div');
		cardBody.classList = 'card-body';
		
		// Row 1
		let animationBudgetRowDiv = document.createElement('div');
		animationBudgetRowDiv.classList = 'row';
		
		let threePortionDiv = document.createElement('div');
		threePortionDiv.classList = 'col-lg-3';
		
		let animationBudget = document.createElement('div');
		animationBudget.classList = 'w-100 animationBudget';
		threePortionDiv.appendChild(animationBudget);
		animationBudgetRowDiv.appendChild(threePortionDiv);
		
		let remainingTextDiv = document.createElement('div');
		remainingTextDiv.classList = 'col-lg-9 text-right headingDiv justify-content-center align-self-center mild-text';
		remainingTextDiv.textContent = window.translationData.budget.dynamic.card.remaining;
		animationBudgetRowDiv.appendChild(remainingTextDiv);
		cardBody.appendChild(animationBudgetRowDiv);
		
		// Row 2
		let emptyRowTwo = document.createElement('div');
		emptyRowTwo.classList = 'row';
		
		let threePortionTwo = document.createElement('div');
		threePortionTwo.classList = 'col-lg-3';
		
		let animationBudgetTwo = document.createElement('div');
		animationBudgetTwo.classList = 'w-50 animationBudget';
		threePortionTwo.appendChild(animationBudgetTwo);
		emptyRowTwo.appendChild(threePortionTwo);
		
		let percentageAvailable = document.createElement('div');
		percentageAvailable.classList = 'col-lg-9 text-right percentageAvailable';
		emptyRowTwo.appendChild(percentageAvailable);
		cardBody.appendChild(emptyRowTwo);
		
		// Row 3
		let emptyRowThree = document.createElement('div');
		emptyRowThree.classList = 'row';
		
		let twelveColumnRow = document.createElement('div');
		twelveColumnRow.classList = 'col-lg-12';
		
		let progressThree = document.createElement('div');
		progressThree.classList = 'progress';

		let animationProgressThree = document.createElement('div');
		animationProgressThree.id='animationProgressBar';
		animationProgressThree.classList = 'progress-bar progress-bar-budget-striped';
		animationProgressThree.setAttribute('role', 'progressbar');
		animationProgressThree.setAttribute('aria-valuenow','0');
		animationProgressThree.setAttribute('aria-valuemin','0');
		animationProgressThree.setAttribute('aria-valuemax','100');
		progressThree.appendChild(animationProgressThree);
		twelveColumnRow.appendChild(progressThree);
		emptyRowThree.appendChild(twelveColumnRow);
		cardBody.appendChild(emptyRowThree);
		
		// Row 4
		let emptyRowFour = document.createElement('div');
		emptyRowFour.classList = 'row';
		
		let elevenColumnRow = document.createElement('div');
		elevenColumnRow.classList = 'col-lg-11';
		
		let remainingAmountMock = document.createElement('div');
		remainingAmountMock.id = 'remainingAmountMock';
		remainingAmountMock.classList = 'd-inline-block animationBudget';
		elevenColumnRow.appendChild(remainingAmountMock);
		emptyRowFour.appendChild(elevenColumnRow);
		cardBody.appendChild(emptyRowFour);

		// Row 5
		let deleteBudgetPosition = document.createElement('div');
		deleteBudgetPosition.classList = 'row';
		
		let emptyElevenDiv = document.createElement('div');
		emptyElevenDiv.classList = 'col-lg-11';
		deleteBudgetPosition.appendChild(emptyElevenDiv);
		
		let oneColFive = document.createElement('div');
		oneColFive.classList = 'col-lg-1';
		
		let animationBudgetFive = document.createElement('div');
		animationBudgetFive.classList = 'w-100 animationBudget';
		oneColFive.appendChild(animationBudgetFive);
		deleteBudgetPosition.appendChild(oneColFive);
		cardBody.appendChild(deleteBudgetPosition);
		
		cardDiv.appendChild(cardBody);
		emptyDocumentFragment.appendChild(cardDiv);
		
		let budgetAmountBody = document.getElementById('budgetAmount');
		// Replace HTML with Empty
		while (budgetAmountBody.firstChild) {
			budgetAmountBody.removeChild(budgetAmountBody.firstChild);
		}
		budgetAmountBody.appendChild(emptyDocumentFragment);
		
		// Budget Visualization
		let chartVisualization = document.getElementById('chartBudgetVisualization');
		// Replace HTML with Empty
		while (chartVisualization.firstChild) {
			chartVisualization.removeChild(chartVisualization.firstChild);
		}
		let materialSpinnerElement = document.createElement('div');
    	materialSpinnerElement.classList = 'material-spinner';
    	chartVisualization.appendChild(materialSpinnerElement);
	}

}(jQuery));	