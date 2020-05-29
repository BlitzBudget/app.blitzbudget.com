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
            // Translate current Page
			translatePage(getLanguage());
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
			
			// Set chosen date
			er.setChosenDateWithSelected(this);
			// Calculate the income and expense image
			let highlightedOverview = document.getElementsByClassName('highlightOverviewSelected')[0].classList;
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

			// Upon refresh call the income overview chart
			incomeOrExpenseOverviewChart(incomeTotalParam, result.Date);
			// Populate category brakdown
			if(doughnutBreakdownOpen) {populateCategoryBreakdown(fetchIncomeBreakDownCache);}
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