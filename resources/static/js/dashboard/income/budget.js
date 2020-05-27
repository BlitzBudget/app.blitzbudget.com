"use strict";

(function scopeWrapper($) {
	// User Budget Map Cache
	let userBudgetCache = {};
	// Store the budget amount edited previously to compare
	let budgetAmountEditedPreviously = '';
	// store the budget chart in the cache to update later
	let budgetCategoryChart = '';
	// Category Compensation Modal Values
	let userBudgetAndTotalAvailable = {};
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
	            // Set Current Page
		        document.getElementById('currentPage').innerText = 'Budget';
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
	            // Set Current Page
		        document.getElementById('currentPage').innerText = 'Budget';
			});
		});
	}

	function populateBudgetResource(){
		/**
		*  Add Functionality Generic + Btn
		**/

		// Register Tooltips
		let ttinit = $("#addFncTT");
		ttinit.attr('data-original-title', 'Add Budget');
		ttinit.tooltip({
			delay: { "show": 300, "hide": 100 }
	    });

	    // Generic Add Functionality
	    let genericAddFnc = document.getElementById('genericAddFnc');
	    document.getElementById('addFncTT').innerText = 'add';
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
        	manageErrors(thrownError, 'Unable to fetch you budget at this moment. Please try again!',ajaxData);
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
		cardTitle.innerText = isEmpty(userBudget.categoryName) ? (isEmpty(window.categoryMap[userBudget.category]) ? userBudget.category : window.categoryMap[userBudget.category].name) : userBudget.categoryName;
		cardRowRemaining.appendChild(cardTitle);
		
		
		// <div id="budgetInfoLabelInModal" class="col-lg-12 text-right headingDiv justify-content-center align-self-center">Remaining (%)</div> 
		let cardRemainingText = document.createElement('div');
		cardRemainingText.classList = 'col-lg-6 text-right headingDiv justify-content-center align-self-center mild-text';
		cardRemainingText.id = 'budgetInfoLabelInModal-' + userBudget.budgetId;
		cardRemainingText.innerText = 'Remaining (%)';
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
		cardBudgetAmountDiv.innerText = formatToCurrency(userBudget.planned);
		cardAmountWrapperDiv.appendChild(cardBudgetAmountDiv);
		cardRowPercentage.appendChild(cardAmountWrapperDiv);
		
		// <span id="percentageAvailable" class="col-lg-12 text-right">NA</span> 
		let cardRemainingPercentage = document.createElement('div');
		cardRemainingPercentage.classList = 'col-lg-9 text-right percentageAvailable';
		cardRemainingPercentage.id = 'percentageAvailable-' + userBudget.budgetId;
		cardRemainingPercentage.innerText = 'NA';
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
		currencyRemainingAmount.innerText = currentCurrencyPreference + '0.00';
		remainingAmountDiv.appendChild(currencyRemainingAmount);
		cardProgressAndRemainingAmount.appendChild(remainingAmountDiv);
		
		let currencyRemainingText = document.createElement('span');
		currencyRemainingText.classList = 'mild-text'
		currencyRemainingText.innerText = ' Remaining';
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
		deleteIconDiv.setAttribute('title','Delete budget');
		
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
			toBeBudgetedDiv.innerText = 0;
			
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
			toBeBudgetedDiv.innerText = 0;
			totalBudgetedCategoriesDiv.innerText = 0;
			detachChart = true;
			
			// assign the to be budgeted for budget visualization chart
			toBeBudgetedDiv.innerText = categoryKeys.length;
			
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
		        	data.element._node.setAttribute("title", "Total Categories: <strong>" + sliceValue + '</strong>');
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
		budgetAmountEditedPreviously = trimElement(this.innerText);
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
		let enteredText = er.convertToNumberFromCurrency(element.innerText, currentCurrencyPreference);
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
	        	  element.innerText = formatToCurrency(enteredText);
	        	  // Update the budget cache
	        	  userBudgetCache[userBudget.budgetId].planned = userBudget.planned;
	        	  // Update the modal
	        	  updateProgressBarAndRemaining(userBudgetCache[userBudget.budgetId], document);
            }
            ajaxData.onFailure = function (thrownError) {
            	manageErrors(thrownError, 'Unable to change the budget. Please try again',ajaxData);
            		
	            // update the current element with the previous amount
	            let formattedBudgetAmount = formatToCurrency(previousText);
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
		} else {
			// previous text and entered text is the same then simy replace the text
			element.innerText = formatToCurrency(enteredText);
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
					budgetLabelDiv.innerText = 'Overspent (%)';
				} else if(categoryMap[budget.category].type == CUSTOM_DASHBOARD_CONSTANTS.incomeCategory) {
					budgetLabelDiv.innerText = 'To Be Budgeted (%)';
				}
				
				// Anchor Icons
				createImageAnchor(budgetIdKey, documentOrFragment);
				
			} else {
				budgetLabelDiv.innerText = 'Remaining (%)';
				
				// Remove the compensation anchor if it is present
				var compensateAnchor = document.getElementById('compensateAnchor-'+ budgetIdKey);
				if(compensateAnchor != null) {
					compensateAnchor.parentNode.removeChild(compensateAnchor);
				}
			}
			
			// Change the remaining text appropriately
			budgetAvailableToSpendOrSave = isNaN(budgetAvailableToSpendOrSave) ? 0 : budgetAvailableToSpendOrSave;
			remainingAmountDiv.innerText = formatToCurrency(budgetAvailableToSpendOrSave);
			
			// Calculate percentage available to spend or save
			let remainingAmountPercentage = round(((budgetAvailableToSpendOrSave / userBudgetValue) * 100),0);
			// If the user budget is 0 then the percentage calculation is not applicable
			if(userBudgetValue == 0 || isNaN(remainingAmountPercentage)) {
				remainingAmountPercentageDiv.innerText = 'NA';
			} else {
				remainingAmountPercentageDiv.innerText = remainingAmountPercentage + '%';
			}
			
			// Assign progress bar value. If the category amount is higher then the progress is 100%
			let progressBarPercentage = isNaN(remainingAmountPercentage) ? 0 : (categoryTotalAmount > userBudgetValue) ? 100 : (100 - remainingAmountPercentage);
			// Set the value and percentage of the progress bar
			progressBarCategoryModal.setAttribute('aria-valuenow', progressBarPercentage);
			progressBarCategoryModal.style.width = progressBarPercentage + '%'; 
		} else if(progressBarCategoryModal != null) {
			remainingAmountPercentageDiv.innerText = 'NA';
			// Set the value and percentage of the progress bar
			progressBarCategoryModal.setAttribute('aria-valuenow', 0);
			progressBarCategoryModal.style.width = 0 + '%';
			// Set the amount remaining
			remainingAmountDiv.innerText = formatToCurrency(0.00);
			// Set the budget remaining text
			budgetLabelDiv.innerText = 'Remaining (%)';
		}
	}
	
	// Create image anchor for compensating budget icon
	function createImageAnchor(budgetIdKey, documentOrFragment) {
		let actionIconsDiv = documentOrFragment.getElementById('actionIcons-' + budgetIdKey);
		let checkImageExistsDiv = document.getElementById('compensateBudgetImage-' + budgetIdKey);
		// If the compensation anchor exists do not create it
		if(checkImageExistsDiv == null) {
			// Document Fragment for compensation
			let compensationDocumentFragment = document.createDocumentFragment();
			let compensationIconsDiv = document.createElement('a');
			compensationIconsDiv.classList = 'compensateAnchor';
			compensationIconsDiv.id='compensateAnchor-' + budgetIdKey;
			compensationIconsDiv.setAttribute('data-target', budgetIdKey);
			compensationIconsDiv.setAttribute('data-toggle','tooltip');
			compensationIconsDiv.setAttribute('data-placement','bottom');
			compensationIconsDiv.setAttribute('title','Compensate overspending');
			
			let compensationImage = document.createElement('img');
			compensationImage.id= 'compensateBudgetImage-' + budgetIdKey;
			compensationImage.classList = 'compensateBudgetImage';
			compensationImage.src = '../img/dashboard/budget/icons8-merge-16.png'
			compensationIconsDiv.appendChild(compensationImage);
			compensationDocumentFragment.appendChild(compensationIconsDiv);
			// Insert as a first child
			actionIconsDiv.insertBefore(compensationDocumentFragment, actionIconsDiv.childNodes[0]);
		}
	}
	
	// Add click event listener to delete the budget
	$('body').on('click', '.deleteBudget' , function(e) {
		let deleteButtonElement = this;
		let budgetId = this.getAttribute('data-target');
		
		// Show the material spinner and hide the delete button
		document.getElementById('deleteElementSpinner-' + budgetId).classList.toggle('d-none');
		this.classList.toggle('d-none');
		
		// Hide the compensation image if present
		compensateBudget = document.getElementById('compensateBudgetImage-' + budgetId);
		if(compensateBudget != null) {
			compensateBudget.classList.toggle('d-none');
		}
		
		// Security check to ensure that the budget is present
		if(isEmpty(userBudgetCache[budgetId])) {
			showNotification('Unable to delete the budget. Please refresh and try again!',window._constants.notification.error);
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
        	  manageErrors(thrownError, 'Unable to delete the budget at this moment. Please try again!',ajaxData);
	          	
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
		monthSpanCurrent.innerText = userChosenMonthName.slice(0,3);
		imgDiv.appendChild(monthSpanCurrent)
		cardBody.appendChild(imgDiv);
		
		// Card Row Heading
		let cardRowHeading = document.createElement('div');
		cardRowHeading.id = 'emptyBudgetHeading'
		cardRowHeading.classList = 'row font-weight-bold justify-content-center';
		cardRowHeading.innerHTML = 'Hey, Looks like you need a budget for ' + userChosenMonthName + '.';
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
		clonePreviousMonthButton.innerHTML = 'Start Planning For ' + userChosenMonthName;
		cardBody.appendChild(clonePreviousMonthButton);
			
		card.appendChild(cardBody);
		
		return card;
	}
	
	// Clicking on copy budget
	$('body').on('click', '#copyPreviousMonthsBudget' , function(e) {
		this.setAttribute("disabled", "disabled");
		this.innerHTML = 'Creating budgets..';
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
				displayCategory.innerText = isEmpty(userBudget.categoryName) ? (isEmpty(window.categoryMap[userBudget.category]) ? userBudget.category : window.categoryMap[userBudget.category].name) : userBudget.categoryName;
				containerForSelect.appendChild(displayCategory);


				let dropdownArrow = document.createElement('div');
				dropdownArrow.classList = 'dropdown-toggle dropdown-toggle-split';
				dropdownArrow.setAttribute('data-toggle', 'dropdown');
				dropdownArrow.setAttribute('aria-haspopup', 'true');
				dropdownArrow.setAttribute('aria-expanded', 'false');

				let srOnly = document.createElement('span');
				srOnly.classList = 'sr-only';
				srOnly.innerText = 'Toggle Dropdown';
				dropdownArrow.appendChild(srOnly);
				containerForSelect.appendChild(dropdownArrow);

				let dropdownMenu = document.createElement('div');
				dropdownMenu.classList = 'dropdown-menu';

				let inputGroup = document.createElement('div');
				inputGroup.classList = 'input-group';

				let incomeCategoriesHSix = document.createElement('h6');
				incomeCategoriesHSix.classList = 'dropdown-header';
				incomeCategoriesHSix.innerText = 'Income';
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
				expenseCategoriesHSix.innerText = 'Expense';
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
      	  	
        	manageErrors(thrownError, 'Unable to create the budgets. Please refresh and try again!',ajaxData);
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
		  if(isNotEmpty(allBudgetedCategories[childElement.lastChild.value])) {
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
			showNotification('The selected category already has a budget. Please choose a different category!',window._constants.notification.error);
			return;
		}
		
		// Call the change of category services
		let values = {};
		values['budgetId'] = budgetId;
		values['walletId'] = window.currentUser.walletId;
		values['category'] = categoryId;
		let categoryItem = window.categoryMap[categoryId];
		let oldCategoryName = document.getElementById('selectCategoryRow-' + budgetId).firstChild.innerText;
		if(isEmpty(categoryItem.id)) {
			values['categoryType'] = categoryItem.type;
			values['dateMeantFor'] = window.currentDateAsID;
			document.getElementById('selectCategoryRow-' + budgetId).firstChild.innerText = categoryId;
		} else {
			document.getElementById('selectCategoryRow-' + budgetId).firstChild.innerText = window.categoryMap[categoryId].name;
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
        		manageErrors(thrownError, 'Unable to change the budget category at this moment. Please try again!',ajaxData);
        		// Chacnge the button text to the old one if fails. 
        		document.getElementById('selectCategoryRow-' + budgetId).firstChild.innerText = oldCategoryName;
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
			showNotification('You have a budget for all the categories!',window._constants.notification.error);
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
	      	  		categoryArray.push(categoryObj.name);
	      	  	}
	      	  	
			}
		}
		
		return categoryArray;
	}
	
	/**
	 *  Compensate Budget Module
	 */
	$('body').on('click', '.compensateAnchor' , function() {
		let categoryCompensationTitle = document.getElementById('categoryCompensationTitle');
		let compensationDropdownMenu = document.getElementById('compensationDropdownMenu-1');
		let anchorDropdownItemFragment = document.createDocumentFragment();
		let budgetId = this.getAttribute('data-target');
		// Reset the cached variables
		userBudgetAndTotalAvailable = {};
		budgetForModalOpened = budgetId;
		$('.displaySelectedCompensationCat').remove();
		
		// If user budget or the category is empty then show the message
		if(isEmpty(userBudgetCache) || isEmpty(userBudgetCache[budgetId])) {
			showNotification('You do not have any budgets to compensate it with!',window._constants.notification.error);
			return;
		}
		
		// Build a category available cache
		let currentCategory = categoryMap[userBudgetCache[budgetId].category];
		let selectedCategoryParentCategory = currentCategory.type;
		let dataKeySet = Object.keys(userBudgetCache);
		for(let count = 0, length = dataKeySet.length; count < length; count++) {
			let key = dataKeySet[count];
      	  	let userBudgetValue = userBudgetCache[key];
      	  	let categoryForBudget = window.categoryMap[userBudgetValue.category];
      	  
      	  	if(isEmpty(userBudgetValue) 
      	  		|| isNotEqual(selectedCategoryParentCategory,categoryForBudget.type)) {
      	  		continue;
      	  	}
      	  	
      	  	let categoryTotalValue = Math.abs(categoryForBudget.categoryTotal);
      	  	// If the category total map is empty and if the user budget is > 0
      	  	if(isEmpty(categoryTotalValue) && userBudgetValue.planned > 0) {
      	  		userBudgetAndTotalAvailable[key] = userBudgetValue.planned;
      	  	} else if(isNotEmpty(categoryTotalValue) && userBudgetValue.planned > categoryTotalValue) {
      	  	// If the category total map is not empty and if the user budget amount is > category total
      	  		userBudgetAndTotalAvailable[key] = userBudgetValue.planned - categoryTotalValue;
      	  	}
      	  	
      	  	// Build category available select (with the same parent category)
      	  	if(!compensationDropdownMenu.firstElementChild && isNotEmpty(userBudgetAndTotalAvailable[key])) {
      	  		anchorDropdownItemFragment.appendChild(buildCategoryAvailableToCompensate(userBudgetAndTotalAvailable[key], userBudgetValue));
      	  	}
		}
		
		// If there are no user budget available to compensate then show message
		if(isEmpty(userBudgetAndTotalAvailable)) {
			showNotification('You do not have any budgets available to compensate it with!',window._constants.notification.error);
			return;
		}
		
		
		// Get the user Budget overspending
		let userBudgetOverSpending = userBudgetCache[budgetId].planned -  Math.abs(window.categoryMap[userBudgetCache[budgetId].category].categoryTotal);
		userBudgetOverSpending = formatToCurrency(Math.abs(userBudgetOverSpending));
		// Set the title of the modal
		categoryCompensationTitle.innerHTML = 'Compensate <strong> &nbsp' + currentCategory.name + "'s &nbsp</strong>Overspending Of <strong> &nbsp" + userBudgetOverSpending + '&nbsp </strong> With';
		
		// Upload the anchor fragment to the modal
		compensationDropdownMenu.appendChild(anchorDropdownItemFragment);
		// Show the modal
		$('#categoryCompensationModal').modal('show');
		
	});
	
	// Build category compensation modal anchor
	function buildCategoryAvailableToCompensate(userBudgetTotalAvailable, userBudgetValue) {
		let anchorDropdownItem = document.createElement('a');
		anchorDropdownItem.classList = 'dropdown-item compensationDropdownMenu';
		anchorDropdownItem.id = 'categoryItemAvailable1-' + userBudgetValue.budgetId;
		anchorDropdownItem.setAttribute('data-target', userBudgetValue.budgetId);
		
		let categoryLabelDiv = document.createElement('div');
		categoryLabelDiv.classList = 'compensationCatSelectionName font-weight-bold';
		categoryLabelDiv.innerText = categoryMap[userBudgetValue.category].name;
		anchorDropdownItem.appendChild(categoryLabelDiv);
		
		let categoryAmountAvailableDiv = document.createElement('div');
		categoryAmountAvailableDiv.classList = 'text-right small my-auto text-small-success compensationCatSelectionAmount';
		let printUserBudgetMoney = isNaN(userBudgetTotalAvailable) ? 0.00 : userBudgetTotalAvailable; 
		categoryAmountAvailableDiv.innerText = formatToCurrency(printUserBudgetMoney);
		anchorDropdownItem.appendChild(categoryAmountAvailableDiv);
		
		return anchorDropdownItem;
	}
	
	// Category compensation remove anchors while hiding the modal 
	$('#categoryCompensationModal').on('hidden.bs.modal', function () {
		// Remove all anchors from the dropdown menu
		let compensationDropdownMenu = document.getElementById('compensationDropdownMenu-1');
		while (compensationDropdownMenu.firstElementChild) {
			compensationDropdownMenu.removeChild(compensationDropdownMenu.firstElementChild);
		}
		
		let compensationDisplay = document.getElementsByClassName('categoryChosenCompensation-1');
		// Replace the compensated category name
		compensationDisplay[0].innerText = 'Choose category';
		
	});
	
	// On click drop down of the category available to compensate
	$('.modal-footer').on('click', '.compensationDropdownMenu' , function() {
		let selectedBudgetId = this.getAttribute('data-target');
		let compensationDisplay = document.getElementsByClassName('categoryChosenCompensation-1');
		// Post a budget amount change to the user budget module and change to auto generated as false. 
		var values = {};
		values['walletId'] = currentUser.walletId;
		
		if(compensationDisplay.length == 0 
			|| isEmpty(window.categoryMap[userBudgetCache[selectedBudgetId].category]) 
			|| isEmpty(window.categoryMap[userBudgetCache[budgetForModalOpened].category]) 
			|| isEmpty(window.categoryMap[userBudgetCache[budgetForModalOpened].category])) {
			showNotification('There was an error while compensating the categories. Try refreshing the page!',window._constants.notification.error);
			return;
		}
		
		// Replace the compensated category name
		compensationDisplay[0].innerText = categoryMap[selectedBudgetId].name;
		
		// Fetch category And Total Remaining
		let categoryBudgetAvailable = userBudgetAndTotalAvailable[selectedBudgetId];
		// Calculate the amount necessary
		let recalculateUserBudgetOverspent = Math.abs(window.categoryMap[userBudgetCache[budgetForModalOpened].category].categoryTotal) - userBudgetCache[budgetForModalOpened].planned;
		
		// As the recalculateUserBudgetOverspent is (-amount)
		if(recalculateUserBudgetOverspent > categoryBudgetAvailable) {
				values['planned'] = userBudgetCache[budgetForModalOpened].planned + categoryBudgetAvailable;
				values['budgetId'] = budgetForModalOpened;
				callBudgetAmountChange(values);
			
				values['planned'] = userBudgetCache[selectedBudgetId].planned - Math.abs(categoryBudgetAvailable);
				values['budgetId'] = selectedBudgetId;
				callBudgetAmountChange(values);
				
				cloneAnchorToBodyAndRemoveDropdown(selectedBudgetId);
				
				// Check if there are any new dropdown elements available
				let compensationDropdownMenu = document.getElementById('compensationDropdownMenu-1');
				if(!compensationDropdownMenu.firstElementChild) {
					// Hide the modal
					$('#categoryCompensationModal').modal('hide');
					return;
				}
				
				let categoryCompensationTitle = document.getElementById('categoryCompensationTitle');
				// Set the title of the modal with the new amount necessary for compensation
				categoryCompensationTitle.innerHTML = 'Compensate <strong> &nbsp' +  categoryMap[budgetForModalOpened].name + "'s &nbsp</strong>Overspending Of <strong> &nbsp" + formatToCurrency((recalculateUserBudgetOverspent - Math.abs(categoryBudgetAvailable))) + '&nbsp </strong> With';
				
				// Replace the compensated category name
				compensationDisplay[0].innerText = 'Choose category';
				
				
		} else if(recalculateUserBudgetOverspent <= categoryBudgetAvailable) {
				values['planned'] = window.categoryMap[userBudgetCache[budgetForModalOpened].category].categoryTotal;
				values['budgetId'] = budgetForModalOpened;
				callBudgetAmountChange(values);
			
				values['planned'] = userBudgetCache[selectedBudgetId].planned - recalculateUserBudgetOverspent;
				values['budgetId'] = selectedBudgetId;
				callBudgetAmountChange(values);
			
				// Hide the modal
				$('#categoryCompensationModal').modal('hide');
		}
		
	});
	
	// Clones the anchor dropdown to the body of the compensation budget modal 
	function cloneAnchorToBodyAndRemoveDropdown(selectedBudgetId) {
		let anchorTag = document.getElementById('categoryItemAvailable1-' + selectedBudgetId);
		let referenceBodyModal = document.getElementById('compensationModalBody');
		let anchorFragment = document.createDocumentFragment();
		// Append and remove (Move element)
		anchorFragment.appendChild(anchorTag);
		
		// Change the anchor tag
		let newAnchorTag = anchorFragment.getElementById('categoryItemAvailable1-' + selectedBudgetId);
		newAnchorTag.id = 'categoryItemSelected-' + selectedBudgetId;
		newAnchorTag.setAttribute('data-target', selectedBudgetId);
		newAnchorTag.classList = 'removeAlreadyAddedCompensation';
		newAnchorTag.firstChild.classList = 'col-lg-6 text-left font-weight-bold text-nowrap';
		newAnchorTag.lastChild.classList = 'col-lg-4 text-right text-small-success text-nowrap pl-0';
		
		// Div wrapper to create rows
		let newDivWrapper = document.createElement('div');
		newDivWrapper.classList = 'row displaySelectedCompensationCat';
		newDivWrapper.appendChild(newAnchorTag.firstChild);
		newDivWrapper.appendChild(newAnchorTag.lastChild);
		
		
		// Close button wrapper
		let closeButtonWrapper = document.createElement('a');
		closeButtonWrapper.id = 'revertCompensationAnchor-' + selectedBudgetId;
		closeButtonWrapper.setAttribute('data-target', selectedBudgetId);
		closeButtonWrapper.classList = 'col-lg-2 text-center revertCompensationAnchor';
		
		// Close button
		let closeIconElement = document.createElement('i');
		closeIconElement.className = 'material-icons closeElementCompensation';
		closeIconElement.innerHTML = 'close';
		closeButtonWrapper.appendChild(closeIconElement);
		
		let materialSpinnerElement = document.createElement('div');
    	materialSpinnerElement.id= 'deleteCompensationSpinner-' + selectedBudgetId;
    	materialSpinnerElement.classList = 'material-spinner-small d-none position-absolute mx-auto top-20';
    	closeButtonWrapper.appendChild(materialSpinnerElement);
    	
		newDivWrapper.appendChild(closeButtonWrapper);
		newAnchorTag.appendChild(newDivWrapper);
		
		// Append the anchor fragment to the top of the list
		referenceBodyModal.appendChild(anchorFragment);
	}
	
	// Save Budget by changing amount
	function callBudgetAmountChange(values) {
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
	    	  // Update the cache containing user budgets
	    	  userBudgetCache[userBudget.budgetId].planned = userBudget.planned;
	    	  
	    	  // Update the modal
	    	  updateProgressBarAndRemaining(userBudgetCache[userBudget.budgetId], document);
	    	  
	    	  // Update the budget amount
	    	  let budgetAmountChange = document.getElementById('budgetAmountEntered-' + userBudget.budgetId);
	    	  budgetAmountChange.innerText = formatToCurrency(userBudget.planned);
	    }
        ajaxData.onFailure = function(thrownError) {
        	  manageErrors(thrownError, 'Unable to change the budget category amount at this moment. Please try again!',ajaxData);
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
	
	// Click the delete budget compensated
	$('body').on('click', '.revertCompensationAnchor' , function() {
		let toDeleteBudgetId = this.getAttribute('data-target');
		document.getElementById('deleteCompensationSpinner-' + toDeleteBudgetId).classList.toggle('d-none');
		this.firstChild.classList.toggle('d-none');
		
		if(isEmpty(categoryMap[toDeleteBudgetId]) || isEmpty(userBudgetAndTotalAvailable[toDeleteBudgetId])) {
			showNotification('Please refresh the page and try again!',window._constants.notification.error);
			// Hide the modal
			$('#categoryCompensationModal').modal('hide');
			return;
		}
		removeCompensatedBudget(this, toDeleteBudgetId);
	});
	
	// Remove the budget compensation
	function removeCompensatedBudget(element, toDeleteBudgetId) {
		let compensationAmount = userBudgetAndTotalAvailable[toDeleteBudgetId];
		// Delete the compensating category (First Compensation)
		var values = {};
		values['planned'] = userBudgetCache[toDeleteBudgetId].planned + compensationAmount;
		values['budgetId'] = toDeleteBudgetId;
		values['walletId'] = currentUser.walletId;

		// Ajax Requests on Error
		let ajaxData = {};
   		ajaxData.isAjaxReq = true;
   		ajaxData.type = "PATCH";
   		ajaxData.url = CUSTOM_DASHBOARD_CONSTANTS.budgetAPIUrl;
   		ajaxData.dataType = "json";
   		ajaxData.contentType = "application/json;charset=UTF-8";
   		ajaxData.data = values;
   		ajaxData.onSuccess = function(userBudget){
   			userBudget = userBudget['body-json'];
        	  // Update the Budget Cache
        	  userBudgetCache[userBudget.budgetId] = userBudget;
        	  
        	  let compensationDropdownMenu = document.getElementById('compensationDropdownMenu-1');
      		  let anchorDropdownItemFragment = document.createDocumentFragment();
        	  anchorDropdownItemFragment.appendChild(buildCategoryAvailableToCompensate(userBudgetAndTotalAvailable[toDeleteBudgetId], userBudget));
        	  // Upload the anchor fragment to the dropdown
      		  compensationDropdownMenu.appendChild(anchorDropdownItemFragment);
      		  
      		  // Remove the compensation Budget Added Display
      		  let anchorCompensatedBudget = document.getElementById('categoryItemSelected-' + userBudget.budgetId);
      		  anchorCompensatedBudget.remove();
      		  
      		  // Update the modal
        	  updateProgressBarAndRemaining(userBudget, document);
        	  
        	  // Update the budget amount
        	  let budgetAmountChange = document.getElementById('budgetAmountEntered-' + userBudget.budgetId);
        	  budgetAmountChange.innerText = formatToCurrency(userBudget.planned);
        }
        ajaxData.onFailure = function(thrownError) {
        	  manageErrors(thrownError, 'Unable to change the budget category amount at this moment. Please try again!',ajaxData);
        	  // Hide the modal
  			  $('#categoryCompensationModal').modal('hide');
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
		
		// Delete the compensated category (Second Compensation)
		values['planned'] = userBudgetCache[budgetForModalOpened].planned - compensationAmount;
		values['budgetId'] = budgetForModalOpened;
		values['walletId'] = currentUser.walletId;

		// Ajax Requests on Error
   		ajaxData.isAjaxReq = true;
   		ajaxData.type = "PATCH";
   		ajaxData.url = CUSTOM_DASHBOARD_CONSTANTS.budgetAPIUrl;
   		ajaxData.dataType = "json";
   		ajaxData.contentType = "application/json;charset=UTF-8";
   		ajaxData.data = values;
   		ajaxData.onSuccess = function(userBudget){
   			userBudget = userBudget['body-json'];
        	// Update the Budget Cache
        	userBudgetCache[userBudget.budgetId] = userBudget;
        	
        	// Get the user Budget overspending
      		let userBudgetOverSpending = userBudgetCache[userBudget.budgetId].planned -  Math.abs(window.categoryMap[window.userBudgetCache[userBudget.budgetId].category].categoryTotal);
      		userBudgetOverSpending = formatToCurrency(Math.abs(userBudgetOverSpending));
      		// Set the title of the modal
      		categoryCompensationTitle.innerHTML = 'Compensate <strong> &nbsp' +  categoryMap[userBudget.category].name + "'s &nbsp</strong>Overspending Of <strong> &nbsp" + userBudgetOverSpending + '&nbsp </strong> With';
      		
      		// Update the modal
        	updateProgressBarAndRemaining(userBudget, document);
        	  
        	// Update the budget amount
        	let budgetAmountChange = document.getElementById('budgetAmountEntered-' + userBudget.category);
        	budgetAmountChange.innerText = formatToCurrency(userBudget.planned);
        }
        ajaxData.onFailure = function(thrownError) {
        	manageErrors(thrownError, 'Unable to change the budget category amount at this moment. Please try again!',ajaxData);
        	 // Hide the modal
  			 $('#categoryCompensationModal').modal('hide');
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
	
	// Reset the user budget with loader
	function resetUserBudgetWithLoader() {
		// User Budget Map Cache
		userBudgetCache = {};
		// Store the budget amount edited previously to compare
		budgetAmountEditedPreviously = '';
		// store the budget chart in the cache to update later
		budgetCategoryChart = '';
		// last Budgeted Month
		lastBudgetedMonthName = '';
		lastBudgetMonth = 0;
		// Category Compensation Modal Values
		userBudgetAndTotalAvailable = {};
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
		remainingTextDiv.innerText = 'Remaining (%)';
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
		chartVisualization.innerHTML = '<div class="material-spinner"></div>';
	}

}(jQuery));	