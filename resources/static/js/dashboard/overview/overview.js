"use strict";
(function scopeWrapper($) {
	// User Budget Map Cache
	let userBudgetCache = {};
	// OVERVIEW CONSTANTS
	const OVERVIEW_CONSTANTS = {};
	// SECURITY: Defining Immutable properties as constants
	Object.defineProperties(OVERVIEW_CONSTANTS, {
		'yearlyOverview': { value: 'One Year Overview', writable: false, configurable: false },
		'incomeTotalParam': { value: 'Income', writable: false, configurable: false },
		'expenseTotalParam': { value: 'Expense', writable: false, configurable: false },
	});
	// Lifetime Income Transactions cache
	let liftimeTransactionsCache = {};
	// Available Transactions with fund
	let userBudgetWithFund = {};
	// populate category breakdown for income or expense
	let fetchIncomeBreakDownCache = true;
	// Doughnut breakdown open
	let doughnutBreakdownOpen = false;
	// Cache the previous year picker date
	let currentYearSelect = new Date().getFullYear();
	let previousDateYearPicker = currentYearSelect - 2;
	// Cache the next year Picker data
	let nextDateYearPicker = currentYearSelect+2;
	let materialSpinnerClone = buildMaterialSpinner();

	/**
	* Get Overview
	**/
	/**
	 * START loading the page
	 * 
	 */
	let currentPageInCookie = er.getCookie('currentPage');
	if(isEqual(currentPageInCookie,'overviewPage')) {
		if(isEqual(window.location.href, window._config.app.invokeUrl)) {
			populateCurrentPage('overviewPage');
		}
	}
	
	let overviewPage = document.getElementById('overviewPage');
	if(isNotEmpty(overviewPage)) {
		overviewPage.addEventListener("click",function(e){
		 	populateCurrentPage('overviewPage');
		});
	}

	function populateCurrentPage(page) {
		er.refreshCookiePageExpiry(page);
		er.fetchCurrentPage('/overview', function(data) {
			// Load the new HTML
            $('#mutableDashboard').html(data);
            /**
			* Get Overview
			**/
			fetchOverview(OVERVIEW_CONSTANTS.incomeTotalParam);
			populateOverviewPage();
            // Set Current Page
	        document.getElementById('currentPage').innerText = 'Overview';
		});
	}

	function populateOverviewPage() {
		/**
		*  Add Functionality Generic + Btn
		**/

	    // Generic Add Functionality
	    let genericAddFnc = document.getElementById('genericAddFnc');
	    genericAddFnc.classList.add('d-none');

	    // Add highlighted element to the income
		document.getElementsByClassName('income')[0].classList.add('highlightOverviewSelected');

		/**
		 * Date Picker
		 */
		
		// Date Picker on click month
		$('.monthPickerMonth').unbind('click').click(function() {
			// Month picker is current selected then do nothing
			if(this.classList.contains('monthPickerMonthSelected')) {
				return;
			}
			
			let recentTransactionsDiv = document.getElementsByClassName('recentTransactionCard');

			// If other pages are present then return this event
			if(recentTransactionsDiv.length == 0) {
				return;
			}
			
			let recentTransactionsTab = document.getElementById('recentTransactions');
			// Replace HTML with Empty
			while (recentTransactionsTab.firstChild) { recentTransactionsTab.removeChild(recentTransactionsTab.firstChild); }
			cloneElementAndAppend(recentTransactionsTab, materialSpinnerClone);
			
			// Set chosen date
			er.setChosenDateWithSelected(this);
			// Calculate the income and expense image
			let highlightedOverview = document.getElementsByClassName('highlightOverviewSelected')[0];
			let expenseImage = highlightedOverview.contains('expense');
			let incomeImage = highlightedOverview.contains('income');
			let incomeTotalParam;
			if(expenseImage) {incomeTotalParam = OVERVIEW_CONSTANTS.expenseTotalParam;}
			if(incomeImage) {incomeTotalParam = OVERVIEW_CONSTANTS.incomeTotalParam;}

			fetchOverview(incomeTotalParam);
			
		});
	}

	function fetchOverview(incomeTotalParam) {
		
		let budgetDivFragment = document.createDocumentFragment();

		let values = {};
		if(isNotEmpty(window.currentUser.walletId)) {
			values.walletId = window.currentUser.walletId;
			values.userId = window.currentUser.financialPortfolioId;
		} else {
			values.userId = window.currentUser.financialPortfolioId;
		}
		let y = window.chosenDate.getFullYear(), m = window.chosenDate.getMonth();
		values.startsWithDate = new Date(y, m);
		values.endsWithDate = new Date(y, m + 1, 0);

		// Ajax Requests on Error
		let ajaxData = {};
   		ajaxData.isAjaxReq = true;
   		ajaxData.type = 'POST';
   		ajaxData.url = CUSTOM_DASHBOARD_CONSTANTS.overviewUrl ;
   		ajaxData.dataType = "json";
   		ajaxData.contentType = "application/json;charset=UTF-8";
   		ajaxData.data = JSON.stringify(values);
   		ajaxData.onSuccess = function(result) {

   			// Dates Cache
        	window.datesCreated = result.Date;
        	  
			er_a.populateBankInfo(result.BankAccount);

	        fetchJSONForCategories(result.Category);

	         /*
			 * Populate Overview
			 */ 
			populateRecentTransactions(result.Transaction);
			// Upon refresh call the income overview chart
			incomeOrExpenseOverviewChart(incomeTotalParam, result.Date);
			// Replace currentCurrencySymbol with currency symbol
			replaceWithCurrency(result.Wallet);
			/**
			 * Populate total Asset, Liability & Networth
			 */
			
			populateTotalAssetLiabilityAndNetworth(result.Wallet);
		},
		ajaxData.onFailure = function(thrownError) {
			manageErrors(thrownError, "Error fetching information for overview. Please try again later!",ajaxData);
        }

		// Load all user transaction from API
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
	
	// Populate Income Average
	function populateTotalAssetLiabilityAndNetworth(wallet) {
			
		// Asset Accumulated
        // Animate Value from 0 to value 
        animateValue(document.getElementById('assetAccumuluatedAmount'), 0, wallet['total_asset_balance'], currentCurrencyPreference ,200);

        // Debt Accumulated
        // Animate Value from 0 to value 
        animateValue(document.getElementById('debtAccumulatedAmount'), 0, wallet['total_debt_balance'], currentCurrencyPreference ,200);

        // Networth Accumulated
        // Animate Value from 0 to value 
        animateValue(document.getElementById('networthAmount'), 0, wallet['wallet_balance'], currentCurrencyPreference ,200);
	}
	
	// Populate Recent Transactions
	function populateRecentTransactions(userTransactionsList) {
	
    	let recentTransactionsDiv = document.getElementById('recentTransactions');
    	let recentTransactionsFragment = document.createDocumentFragment();
    	
    	if(isEmpty(userTransactionsList)) {
    		let imageTransactionEmptyWrapper = document.createElement('div');
    		imageTransactionEmptyWrapper.classList = 'text-center d-table-row';
    		
    		recentTransactionsFragment.appendChild(buildEmptyTransactionsSvg());
    		
    		
    		let emptyMessageRow = document.createElement('div');
    		emptyMessageRow.classList = 'text-center d-table-row tripleNineColor font-weight-bold';
    		emptyMessageRow.innerText = "Oh! Snap! You don't have any transactions yet.";
    		recentTransactionsFragment.appendChild(emptyMessageRow);
    	} else {
    		let resultKeySet = Object.keys(userTransactionsList);
        	// Print only the first 20 records
        	let userBudgetLength = resultKeySet.length > 20 ? 20 : resultKeySet.length;
         	for(let countGrouped = 0; countGrouped < userBudgetLength; countGrouped++) {
         	   let key = resultKeySet[countGrouped];
         	   let userTransaction = userTransactionsList[key];
         	   
         	   recentTransactionsFragment.appendChild(buildTransactionRow(userTransaction));
         	}
    	}
    	
    	// Empty HTML
    	while (recentTransactionsDiv.firstChild) {
    		recentTransactionsDiv.removeChild(recentTransactionsDiv.firstChild);
		}
    	recentTransactionsDiv.appendChild(recentTransactionsFragment);
	}
	
	// Builds the rows for recent transactions
	function buildTransactionRow(userTransaction) {
		// Convert date from UTC to user specific dates
		let creationDateUserRelevant = new Date(userTransaction['creation_date']);
		// Category Map 
		let categoryMapForUT = categoryMap[userTransaction.category];
		
		let tableRowTransaction = document.createElement('div');
		tableRowTransaction.id = 'recentTransaction-' + userTransaction.transactionId;
		tableRowTransaction.classList = 'd-table-row recentTransactionEntry';
		
		let tableCellImagesWrapper = document.createElement('div');
		tableCellImagesWrapper.classList = 'd-table-cell align-middle imageWrapperCell text-center';
		
		let circleWrapperDiv = document.createElement('div');
		circleWrapperDiv.classList = 'rounded-circle align-middle circleWrapperImageRT';
		
		// Append a - sign if it is an expense
		if(categoryMap[userTransaction.category].type == CUSTOM_DASHBOARD_CONSTANTS.expenseCategory) {
			circleWrapperDiv.appendChild(creditCardSvg());
		} else {
			circleWrapperDiv.appendChild(plusRawSvg());
		}
		
		tableCellImagesWrapper.appendChild(circleWrapperDiv);
		tableRowTransaction.appendChild(tableCellImagesWrapper);
		
		let tableCellTransactionDescription = document.createElement('div');
		tableCellTransactionDescription.classList = 'descriptionCellRT d-table-cell';
		
		let elementWithDescription = document.createElement('div');
		elementWithDescription.classList = 'font-weight-bold recentTransactionDescription';
		elementWithDescription.innerText = isEmpty(userTransaction.description) ? 'No Description' : userTransaction.description.length < 25 ? userTransaction.description : userTransaction.description.slice(0,26) + '...';
		tableCellTransactionDescription.appendChild(elementWithDescription);
		
		let elementWithCategoryName = document.createElement('div');
		elementWithCategoryName.classList = 'small categoryNameRT w-100';
		elementWithCategoryName.innerText = (categoryMapForUT.name.length < 25 ? categoryMapForUT.name : (categoryMapForUT.name.slice(0,26) + '...')) + ' • ' + ("0" + creationDateUserRelevant.getDate()).slice(-2) + ' ' + months[creationDateUserRelevant.getMonth()].slice(0,3) + ' ' + creationDateUserRelevant.getFullYear() + ' ' + ("0" + creationDateUserRelevant.getHours()).slice(-2) + ':' + ("0" + creationDateUserRelevant.getMinutes()).slice(-2);
		tableCellTransactionDescription.appendChild(elementWithCategoryName);
		tableRowTransaction.appendChild(tableCellTransactionDescription);
		
		let transactionAmount = document.createElement('div');
		
		// Append a - sign if it is an expense
		if(categoryMap[userTransaction.category].type == CUSTOM_DASHBOARD_CONSTANTS.expenseCategory) {
			transactionAmount.classList = 'transactionAmountRT expenseCategory font-weight-bold d-table-cell text-right align-middle';
		} else {
			transactionAmount.classList = 'transactionAmountRT incomeCategory font-weight-bold d-table-cell text-right align-middle';
		}
		transactionAmount.innerHTML = formatToCurrency(userTransaction.amount);  
		   
		tableRowTransaction.appendChild(transactionAmount);
		
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
	
	/**
	 * Chart Functionality
	 * 
	 */ 
	
	function incomeOrExpenseOverviewChart(incomeTotalParameter, dateAndAmountAsList) {
		// If donut chart is open then do nothing or If income Total Param is empty
		if(doughnutBreakdownOpen 
			|| isEmpty(incomeTotalParameter)) {
			return;
		}

		// Store it in a cache
    	liftimeTransactionsCache = dateAndAmountAsList;
    	// Make it reasonably immutable
    	Object.freeze(liftimeTransactionsCache);
    	Object.seal(liftimeTransactionsCache);
	 	// Income or Expense Chart Options
	 	let incomeOrExpense = '';
	 	
 		if(isEqual(OVERVIEW_CONSTANTS.incomeTotalParam,incomeTotalParameter)) {
 			
        	
        	incomeOrExpense ='Income';

        	calcAndBuildLineChart(dateAndAmountAsList, 'income_total');
        	
 		}  else {
        	
 			incomeOrExpense = 'Expense';

 			calcAndBuildLineChart(dateAndAmountAsList, 'expense_total');
 		}
	 	
	 	appendChartOptionsForIncomeOrExpense(incomeOrExpense);
	}
	
	// Calculate and build line chart for income / expense
	function calcAndBuildLineChart(dateAndAmountAsList, totalAm) {
		let labelsArray = [];
		let seriesArray = [];
		
		let chartAppendingDiv = document.getElementById('colouredRoundedLineChart');
		// Replace inner HTML with EMPTY
		while (chartAppendingDiv.firstChild) {
			chartAppendingDiv.removeChild(chartAppendingDiv.firstChild);
		}
		// Replace with empty chart message
    	if(isEmpty(dateAndAmountAsList)) {
    		chartAppendingDiv.appendChild(buildEmptyChartMessage());
    		return;
    	}
    	
    	// If year selected in IYP then 
    	let countValue = 0;
    	// One year of data at a time;
        countValue = dateAndAmountAsList.length > 12 ? (dateAndAmountAsList.length - 12) : 0;
    	
    	for(let countGrouped = countValue, length = dateAndAmountAsList.length; countGrouped < length; countGrouped++) {
    		let dateItem = dateAndAmountAsList[countGrouped];

         	// Convert the date key as date
         	let dateAsDate = new Date(lastElement(splitElement(dateItem.dateId,'#')));
         	
         	labelsArray.push(months[dateAsDate.getMonth()].slice(0,3) + " '" + dateAsDate.getFullYear().toString().slice(-2));
         	
         	// Build the series array with total amount for date
         	seriesArray.push(dateItem[totalAm]);
         	
    	}

    	// Replace with empty chart message
    	if(isEmpty(seriesArray)) {
    		chartAppendingDiv.appendChild(buildEmptyChartMessage());
    		return;
    	} else if(seriesArray.length == 1){
    		chartAppendingDiv.appendChild(buildInsufficientInfoMessage());
    		return;
    	}
    	
    	// Build the data for the line chart
    	dataColouredRoundedLineChart = {
		         labels: labelsArray,
		         series: [
		        	seriesArray
		         ]
		     };
    	
    	// Display the line chart
		coloredRounedLineChart(dataColouredRoundedLineChart);
	}
	
	// Click the overview card items
	$('body').on('click', '.chart-option', function() {
		$('.chart-option').removeClass('active');
		this.classList.add('active');
		// Append spinner
		let chartAppendingDiv = document.getElementById('colouredRoundedLineChart');
		let materialSpinnerDocumentFragment = document.createDocumentFragment();
		materialSpinnerDocumentFragment.appendChild(buildMaterialSpinner());
		// Replace inner HTML with EMPTY
		while (chartAppendingDiv.firstChild) {
			chartAppendingDiv.removeChild(chartAppendingDiv.firstChild);
		}
		chartAppendingDiv.appendChild(materialSpinnerDocumentFragment);
		
		// Start requesting the chart  
		let firstChildClassList = this.classList;
		if(firstChildClassList.contains('income')) {
			// Show the button to choose charts
			document.getElementById('chosenChartIncAndExp').classList.remove('d-none');
			// Populate Category Break down Chart if present
        	if(doughnutBreakdownOpen) {
        		// Fetch the expense cache 
        		fetchIncomeBreakDownCache = true;
        		populateCategoryBreakdown(fetchIncomeBreakDownCache);
        		// Replace the Drop down with one year view
    			replaceChartChosenLabel('Income Breakdown');
        	} else {
        		// Replace the Drop down with one year view
    			replaceChartChosenLabel(OVERVIEW_CONSTANTS.yearlyOverview);
    			populateLineChart(liftimeTransactionsCache, true);
        	}
        	document.getElementById('chartDisplayTitle').firstChild.nodeValue = 'Income Overview';
			// Replace the drop down for chart options
			appendChartOptionsForIncomeOrExpense('Income');
		} else if(firstChildClassList.contains('expense')) {
			// Show the button to choose charts
			document.getElementById('chosenChartIncAndExp').classList.remove('d-none');
			// Populate Category Break down Chart if present
        	if(doughnutBreakdownOpen) {
        		// Fetch the expense cache 
        		fetchIncomeBreakDownCache = false;
        		populateCategoryBreakdown(fetchIncomeBreakDownCache);
        		// Replace the Drop down with one year view
    			replaceChartChosenLabel('Expense Breakdown');
        	} else {
        		populateLineChart(liftimeTransactionsCache, false);
    			// Replace the Drop down with one year view
    			replaceChartChosenLabel(OVERVIEW_CONSTANTS.yearlyOverview);
        	}
        	document.getElementById('chartDisplayTitle').firstChild.nodeValue = 'Expense Overview';
			// Replace the drop down for chart options
			appendChartOptionsForIncomeOrExpense('Expense');
		} else if(firstChildClassList.contains('assets')) {
			// Show the button to choose charts
			document.getElementById('chosenChartIncAndExp').classList.add('d-none');
			// Populate Asset Chart
			populateAssetBarChart(true);
    		// Change Label
    		document.getElementById('chartDisplayTitle').firstChild.nodeValue = 'Asset Overview';
		} else if(firstChildClassList.contains('debt')) {
			// Show the button to choose charts
			document.getElementById('chosenChartIncAndExp').classList.add('d-none');
			// Populate Debt Chart
			populateAssetBarChart(false);
    		// Change Label
    		document.getElementById('chartDisplayTitle').firstChild.nodeValue = 'Debt Overview';
		} else if(firstChildClassList.contains('networth')) {
			// Show the button to choose charts
			document.getElementById('chosenChartIncAndExp').classList.add('d-none');
			populateNetworthBarChart();
    		// Change Label
    		document.getElementById('chartDisplayTitle').firstChild.nodeValue = 'Networth Overview';
		}
		
		// Remove the old highlighted element
		let overviewEntryrow = document.getElementsByClassName('overviewEntryRow');
		for(let count = 0, length = overviewEntryrow.length; count < length; count++) {
			let overviewEntryElement = overviewEntryrow[count];
			
			if(overviewEntryElement.classList.contains('highlightOverviewSelected')) {
				overviewEntryElement.classList.remove('highlightOverviewSelected');
			}
		}
		
		// Add the highlight to the element
		this.classList.add('highlightOverviewSelected');
	});
	 
	/*  **************** Coloured Rounded Line Chart - Line Chart ******************** */

	function coloredRounedLineChart(dataColouredRoundedLineChart) {
		 optionsColouredRoundedLineChart = {
	             lineSmooth: Chartist.Interpolation.cardinal({
	                 tension: 10
	             }),
	             axisY: {
	            	 	showGrid: true,
	            	 	offset: 70,
	            	    labelInterpolationFnc: function(value) {
	            	      
	            	      value = formatLargeCurrencies(value);
	            	      return value + currentCurrencyPreference;
	            	    },
	            	    scaleMinSpace: 15
	             },
	             axisX: {
	                 showGrid: false,
	                 offset: 40
	             },
	             showPoint: true,
	             height: '400px'
	         };
	     
		 // Empty the chart div
		 let coloredChartDiv = document.getElementById('colouredRoundedLineChart');
		// Replace inner HTML with EMPTY
 		while (coloredChartDiv.firstChild) {
 			coloredChartDiv.removeChild(coloredChartDiv.firstChild);
 		}
		// Dispose the previous tooltips created
		$("#colouredRoundedLineChart").tooltip('dispose');
		 
		// Append tooltip with line chart
	    let colouredRoundedLineChart = new Chartist.Line('#colouredRoundedLineChart', dataColouredRoundedLineChart, optionsColouredRoundedLineChart).on("draw", function(data) {
    		if (data.type === "point") {
    			data.element._node.setAttribute("title", data.axisX.ticks[data.index] + ": <strong>" + formatToCurrency(data.value.y) + '</strong>');
    			data.element._node.setAttribute("data-chart-tooltip", "colouredRoundedLineChart");
    		}
    	}).on("created", function() {
    		// Initiate Tooltip
    		$("#colouredRoundedLineChart").tooltip({
    			selector: '[data-chart-tooltip="colouredRoundedLineChart"]',
    			container: "#colouredRoundedLineChart",
    			html: true,
    			placement: 'auto',
				delay: { "show": 300, "hide": 100 }
    		});
    	});

	    md.startAnimationForLineChart(colouredRoundedLineChart);
	}
	
	// Build material Spinner
	function buildMaterialSpinner() {
		let materialSpinnerDiv = document.createElement('div');
		materialSpinnerDiv.classList = 'material-spinner rtSpinner';
		
		return materialSpinnerDiv;
	}
	
	// Build Empty chart
	function buildEmptyChartMessage() {
		let emptyChartMessage = document.createElement('div');
		emptyChartMessage.classList = 'text-center align-middle h-20';
		
		let divIconWrapper = document.createElement('div');
		divIconWrapper.classList = 'icon-center';
		
		let iconChart = document.createElement('i');
		iconChart.classList = 'material-icons noDataChartIcon';
		iconChart.innerText = 'multiline_chart';
		divIconWrapper.appendChild(iconChart);
		emptyChartMessage.appendChild(divIconWrapper);
		
		let emptyMessage = document.createElement('div');
		emptyMessage.classList = 'font-weight-bold tripleNineColor';
		emptyMessage.innerText = "There's not enough data! Start adding transactions..";
		emptyChartMessage.appendChild(emptyMessage);
		
		return emptyChartMessage;
		
	}
	
	// Build Insufficient Information Message
	function buildInsufficientInfoMessage() {
		let emptyChartMessage = document.createElement('div');
		emptyChartMessage.classList = 'text-center align-middle';
		
		let divIconWrapper = document.createElement('div');
		divIconWrapper.classList = 'icon-center';
		
		let iconChart = document.createElement('i');
		iconChart.classList = 'material-icons noDataChartIcon';
		iconChart.innerText = 'bubble_chart';
		divIconWrapper.appendChild(iconChart);
		emptyChartMessage.appendChild(divIconWrapper);
		
		let emptyMessage = document.createElement('div');
		emptyMessage.classList = 'font-weight-bold tripleNineColor';
		emptyMessage.innerText = "There's not enough data! We need transactions in atleast 2 categories..";
		emptyChartMessage.appendChild(emptyMessage);
		
		return emptyChartMessage;
		
	}
	
	/**
	 * Chart Overview Drop Down (Income / Expense)
	 */
	function appendChartOptionsForIncomeOrExpense(incomeOrExpenseParam) {
		let anchorFragment = document.createDocumentFragment();
		
		let anchorDropdownItem = document.createElement('a');
		anchorDropdownItem.classList = 'dropdown-item chartOverview' + incomeOrExpenseParam;
		
		let categoryLabelDiv = document.createElement('div');
		categoryLabelDiv.classList = 'font-weight-bold';
		categoryLabelDiv.innerText = OVERVIEW_CONSTANTS.yearlyOverview;
		anchorDropdownItem.appendChild(categoryLabelDiv);
		anchorFragment.appendChild(anchorDropdownItem);
		
		let anchorDropdownItem1 = document.createElement('a');
		anchorDropdownItem1.classList = 'dropdown-item chartBreakdown' + incomeOrExpenseParam;
		
		let categoryLabelDiv1 = document.createElement('div');
		categoryLabelDiv1.classList = 'font-weight-bold';
		categoryLabelDiv1.innerText = incomeOrExpenseParam + ' Breakdown';
		anchorDropdownItem1.appendChild(categoryLabelDiv1);
		anchorFragment.appendChild(anchorDropdownItem1);
		
		let chooseCategoryDD = document.getElementById('chooseCategoryDD');
	    // Replace inner HTML with EMPTY
 		while (chooseCategoryDD.firstChild) {
 			chooseCategoryDD.removeChild(chooseCategoryDD.firstChild);
 		}
	    chooseCategoryDD.appendChild(anchorFragment);
	}
	
	// Chart Income One Year Overview
	$( "body" ).on( "click", "#chooseCategoryDD .chartOverviewIncome" ,function() {
		replaceChartChosenLabel(OVERVIEW_CONSTANTS.yearlyOverview);
		// populate the income line chart from cache
		populateLineChart(liftimeTransactionsCache, true);
		// Dough nut breakdown open cache
		doughnutBreakdownOpen = false;
	});
	
	// Chart Income Breakdown Chart
	$( "body" ).on( "click", "#chooseCategoryDD .chartBreakdownIncome" ,function() {
		replaceChartChosenLabel('Income Overview');
		
		// Populate Breakdown Category
		populateCategoryBreakdown(true);
		// Populate cache for income or expense breakdown
		fetchIncomeBreakDownCache = true;
		// Dough nut breakdown open cache
		doughnutBreakdownOpen = true;
	});
	
	// Chart Expense One Year Overview
	$( "body" ).on( "click", "#chooseCategoryDD .chartOverviewExpense" ,function() {
		replaceChartChosenLabel(OVERVIEW_CONSTANTS.yearlyOverview);
		// Populate the expense line chart from cache
		populateLineChart(liftimeTransactionsCache, false);
		// Dough nut breakdown open cache
		doughnutBreakdownOpen = false;
	});
	
	// Chart Expense  Breakdown Chart
	$( "body" ).on( "click", "#chooseCategoryDD .chartBreakdownExpense" ,function() {
		replaceChartChosenLabel('Expense Breakdown');
		
		// Populate Breakdown Category
		populateCategoryBreakdown(false);
		// Populate cache for income or expense breakdown
		fetchIncomeBreakDownCache = false;
		// Dough nut breakdown open cache
		doughnutBreakdownOpen = true;
	});
	
	// Populate Breakdown Category
	function populateCategoryBreakdown(fetchIncome) {
		let labelsArray = [];
		let seriesArray = [];
		let absoluteTotal = 0;
		let othersTotal = 0;
		let otherLabels = [];
		
		// Reset the line chart with spinner
		let colouredRoundedLineChart = document.getElementById('colouredRoundedLineChart');
		colouredRoundedLineChart.innerHTML = '<div class="h-20"><div class="material-spinner rtSpinner"></div></div>';
		
		
		// Build the Absolute total 
		let incomeCategory = fetchIncome ? CUSTOM_DASHBOARD_CONSTANTS.incomeCategory : CUSTOM_DASHBOARD_CONSTANTS.expenseCategory;
		let categoryKeys = Object.keys(window.categoryMap);
		for(let count = 0, length = categoryKeys.length; count < length; count++) {
			let categoryId = categoryKeys[count];
			let categoryObject = window.categoryMap[categoryId];
			if(categoryObject.type == incomeCategory && isNotEmpty(categoryObject.categoryTotal)) {
				// Add the category total to absolute total
				absoluteTotal += Math.abs(categoryObject.categoryTotal);
			}
		}
		
		// Build the legend and the series array
		for(let count = 0, length = categoryKeys.length; count < length; count++) {
			let categoryId = categoryKeys[count];
			let categoryObject = window.categoryMap[categoryId];
			
			if(categoryObject.type == incomeCategory && isNotEmpty(categoryObject.categoryTotal)) {
				let percentageOfTotal = (Math.abs(categoryObject.categoryTotal) / absoluteTotal) * 100;
				// If the total is greater than 5 % then print it separate else accumulate it with others
				if(percentageOfTotal > 5) {
					labelsArray.push(categoryObject.name);
					seriesArray.push(Math.abs(categoryObject.categoryTotal));
				} else {
					othersTotal += Math.abs(categoryObject.categoryTotal);
					otherLabels.push(categoryObject.name);
				}
				
			}
		}
		
		// If others total is > 0 then print it. 
		if(othersTotal > 0) {
			if(otherLabels.length > 1) {
				labelsArray.push('Others');
			} else {
				labelsArray.push(otherLabels[0]);
			}
			seriesArray.push(Math.abs(othersTotal));
		}
		
		let chartAppendingDiv = document.getElementById('colouredRoundedLineChart');
		// Replace inner HTML with EMPTY
		while (chartAppendingDiv.firstChild) {
			chartAppendingDiv.removeChild(chartAppendingDiv.firstChild);
		}
		// Replace with empty chart message
    	if(isEmpty(seriesArray)) {
    		chartAppendingDiv.appendChild(buildEmptyChartMessage());
    		return;
    	} 
		
		// Build the data for the line chart
    	let dataSimpleBarChart = {
	         labels: labelsArray,
	         series: seriesArray
		         
    	}

    	buildPieChart(dataSimpleBarChart, 'colouredRoundedLineChart', absoluteTotal);
	}
	
	// Introduce Chartist pie chart
	function buildPieChart(dataPreferences, id, absoluteTotal) {
		 /*  **************** Public Preferences - Pie Chart ******************** */

        let optionsPreferences = {
		  donut: true,
		  donutWidth: 50,
		  startAngle: 270,
		  showLabel: true,
		  height: '300px'
        };
        
        let responsiveOptions = [
    	  ['screen and (min-width: 640px)', {
    	    chartPadding: 40,
    	    labelOffset: 50,
    	    labelDirection: 'explode',
    	    labelInterpolationFnc: function(value, idx) {
    	      // Calculates the percentage of category total vs absolute total
    	      let percentage = round((dataPreferences.series[idx] / absoluteTotal * 100),2) + '%';
    	      return value + ': ' + percentage;
    	    }
    	  }],
    	  ['screen and (min-width: 1301px)', {
    	    labelOffset: 30,
    	    chartPadding: 10
    	  }],
    	  ['screen and (min-width: 992px)', {
      	    labelOffset: 45,
      	    chartPadding: 40,
      	  }],
    	  
    	];
        
        // Reset the chart
        replaceHTML(id, '');
        $("#" + id).tooltip('dispose');
        
        // Append Tooltip for Doughnut chart
        if(isNotEmpty(dataPreferences)) {
        	let categoryBreakdownChart = new Chartist.Pie('#' + id, dataPreferences, optionsPreferences, responsiveOptions).on('draw', function(data) {
        		  if(data.type === 'slice') {
		        	let sliceValue = data.element._node.getAttribute('ct:value');
		        	data.element._node.setAttribute("title", dataPreferences.labels[data.index] + ": <strong>" + formatToCurrency(Number(sliceValue)) + '</strong>');
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
        	er.startAnimationDonutChart(categoryBreakdownChart);
        }
        
	}
	
	// Populate the line chart from cache
	function populateLineChart(dateAndTimeAsList, incomeChart) {
		// Reset the line chart with spinner
		let colouredRoundedLineChart = document.getElementById('colouredRoundedLineChart');
		colouredRoundedLineChart.innerHTML = '<div class="h-20"><div class="material-spinner rtSpinner"></div></div>';
		
		if(incomeChart) {
			incomeOrExpenseOverviewChart(OVERVIEW_CONSTANTS.incomeTotalParam, dateAndTimeAsList);
		} else {
			incomeOrExpenseOverviewChart(OVERVIEW_CONSTANTS.expenseTotalParam, dateAndTimeAsList);
		}
		
	}
	
	// Replaces the text of the chart chosen
	function replaceChartChosenLabel(chosenChartText) {
		let chosenChartLabel = document.getElementsByClassName('chosenChart');
		chosenChartLabel[0].innerText = chosenChartText;
	}
	
    /**
    * Build Total Assets / liability
    **/
    function populateAssetBarChart(fetchAssets) {
    	// Fetch asset or liability
    	let accType = fetchAssets ? 'ASSET' : 'DEBT';

    	// Reset the line chart with spinner
		let colouredRoundedLineChart = document.getElementById('colouredRoundedLineChart');
		colouredRoundedLineChart.innerHTML = '<div class="h-20"><div class="material-spinner rtSpinner"></div></div>';

		buildBarchartForAssetOrDebt(window.allBankAccountInfoCache, accType);
    }

    // Build Barchart For Asset Or Debt
    function buildBarchartForAssetOrDebt(bankAccountList, accType) {
    	let labelsArray = [];
		let seriesArray = [];
		
		// Iterate all bank accounts
		for(let i = 0, length = bankAccountList.length; i < length; i++) {
			let bankAcc = bankAccountList[i];
			// Ensure if the asset type matches the bank account
			if(isEqual(accType,bankAcc['account_type'])) {
				labelsArray.push(bankAcc['bank_account_name']);
				seriesArray.push(bankAcc['account_balance']);	
			}
    	}

    	let dataSimpleBarChart = {
            labels: labelsArray,
            series: seriesArray
        };

        let chartAppendingDiv = document.getElementById('colouredRoundedLineChart');
        // Replace inner HTML with EMPTY
    	while (chartAppendingDiv.firstChild) {
			chartAppendingDiv.removeChild(chartAppendingDiv.firstChild);
		}
    	// If series array is empty then
    	if(isEmpty(seriesArray)) {
    		chartAppendingDiv.appendChild(buildEmptyChartMessage());
    		return;
    	}

    	
        let optionsSimpleBarChart = {
        	distributeSeries: true,
            seriesBarDistance: 10,
            axisX: {
            	showGrid: false,
            	offset: 40
            },
            axisY: {
			    labelInterpolationFnc: function(value, index) {
			        value = formatLargeCurrencies(value);
	            	return value + currentCurrencyPreference;
			    },
			    // Offset Y axis label
    			offset: 70
			},
			height: '400px'
        };


        buildBarChart(dataSimpleBarChart, optionsSimpleBarChart);
    }

    // Build Empty Chart information
    function populateEmptyChartInfo() {
    	let chartAppendingDiv = document.getElementById('colouredRoundedLineChart');
		let emptyMessageDocumentFragment = document.createDocumentFragment();
		emptyMessageDocumentFragment.appendChild(buildEmptyChartMessage());
		// Replace inner HTML with EMPTY
		while (chartAppendingDiv.firstChild) {
			chartAppendingDiv.removeChild(chartAppendingDiv.firstChild);
		}
		chartAppendingDiv.appendChild(emptyMessageDocumentFragment);
    }

    // build line chart
    function buildBarChart(dataSimpleBarChart, optionsSimpleBarChart) {
    	/*  **************** Simple Bar Chart - barchart ******************** */

        let responsiveOptionsSimpleBarChart = [
            ['screen and (max-width: 640px)', {
                seriesBarDistance: 5,
                axisX: {
                    labelInterpolationFnc: function(value) {
                        return value[0];
                    }
                }
            }]
        ];

        // Empty the chart div
		let coloredChartDiv = document.getElementById('colouredRoundedLineChart');
		// Replace inner HTML with EMPTY
 		while (coloredChartDiv.firstChild) {
 			coloredChartDiv.removeChild(coloredChartDiv.firstChild);
 		}
 		// Dispose the previous tooltips created
		$("#colouredRoundedLineChart").tooltip('dispose');

        let simpleBarChart = Chartist.Bar('#colouredRoundedLineChart', dataSimpleBarChart, optionsSimpleBarChart, responsiveOptionsSimpleBarChart);

        // On draw bar chart
        simpleBarChart.on("draw", function(data) {
    		if (data.type === "bar") {
    			// Tooltip
    			let minusSign = '';
    			amount = formatToCurrency(data.value.y);
    			data.element._node.setAttribute("title", data.axisX.ticks[data.seriesIndex] + ": <strong>" + amount + '</strong>');
    			data.element._node.setAttribute("data-chart-tooltip", "colouredRoundedLineChart");
    		}
    	}).on("created", function() {
    		// Initiate Tooltip
    		$("#colouredRoundedLineChart").tooltip({
    			selector: '[data-chart-tooltip="colouredRoundedLineChart"]',
    			container: "#colouredRoundedLineChart",
    			html: true,
    			placement: 'auto',
				delay: { "show": 300, "hide": 100 }
    		});
    	});


        //start animation for the Emails Subscription Chart
        er.startAnimationForBarChart(simpleBarChart);

    }


    /**
    *	Populate networth
    **/
    function populateNetworthBarChart() {

    	// Reset the line chart with spinner
		let colouredRoundedLineChart = document.getElementById('colouredRoundedLineChart');
		colouredRoundedLineChart.innerHTML = '<div class="h-20"><div class="material-spinner rtSpinner"></div></div>';

		buildchartForNetworth(window.allBankAccountInfoCache);
    }


    // Build Barchart For Asset Or Debt
    function buildchartForNetworth(bankAccountList) {
    	let labelsArray = [];
		let seriesArray = [];
		let seriesArrayDebt = [];
		
		// Iterate all bank accounts
		for(let i = 0, length = bankAccountList.length; i < length; i++) {
			let bankAcc = bankAccountList[i];
			labelsArray.push(bankAcc['bank_account_name']);
			seriesArray.push(bankAcc['account_balance']);	
    	}

    	let dataSimpleBarChart = {
            labels: labelsArray,
            series: seriesArray
        };

    	// If series array is empty then
    	if(isEmpty(seriesArray)) {
    		let chartAppendingDiv = document.getElementById('colouredRoundedLineChart');
    		let emptyMessageDocumentFragment = document.createDocumentFragment();
    		emptyMessageDocumentFragment.appendChild(buildEmptyChartMessage());
    		// Replace inner HTML with EMPTY
    		while (chartAppendingDiv.firstChild) {
    			chartAppendingDiv.removeChild(chartAppendingDiv.firstChild);
    		}
    		chartAppendingDiv.appendChild(emptyMessageDocumentFragment);
    		return;
    	}

        let optionsSimpleBarChart = {
        	distributeSeries: true,
            seriesBarDistance: 10,
            axisX: {
            	showGrid: false,
            	offset: 40
            },
            axisY: {
			    labelInterpolationFnc: function(value, index) {
			        value = formatLargeCurrencies(value);
	            	return value + currentCurrencyPreference;
			    },
			    // Offset Y axis label
    			offset: 70
			},
			height: '400px'
        };


        buildBarChart(dataSimpleBarChart, optionsSimpleBarChart);
    }

}(jQuery));