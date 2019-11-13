"use strict";
// Current User
let currentUser = {};
// Custom Javascript for dashboard
const CUSTOM_DASHBOARD_CONSTANTS = {};

// SECURITY: Defining Immutable properties as constants
Object.defineProperties(CUSTOM_DASHBOARD_CONSTANTS, {
	'bankAccountUrl': { value: '/api/bankaccount', writable: false, configurable: false },
	'overviewUrl': { value: '/api/overview/', writable: false, configurable: false },
	'fetchCategoriesUrl': { value: '/api/category/', writable: false, configurable: false },
	'transactionAPIUrl': { value: '/api/transactions/', writable: false, configurable: false },
	'saveTransactionsUrl': { value: '/api/transactions/save/', writable: false, configurable: false },
	'budgetAPIUrl': { value: '/api/budget/', writable: false, configurable: false },
	'overviewDashboardId': { value: 'overview-dashboard-sidebar', writable: false, configurable: false },
	'transactionDashboardId': { value: 'transaction-dashboard-sidebar', writable: false, configurable: false },
	'goalDashboardId': { value: 'goal-dashboard-sidebar', writable: false, configurable: false },
	'budgetDashboardId': { value: 'budget-dashboard-sidebar', writable: false, configurable: false },
	'investmentDashboardId': { value: 'investment-dashboard-sidebar', writable: false, configurable: false },
	'settingsDashboardId': { value: 'settings-dashboard-sidebar', writable: false, configurable: false },
	'transactionFetchCategoryTotal': { value: 'categoryTotal/', writable: false, configurable: false },
	'transactionsUpdateUrl': { value: '/update/', writable: false, configurable: false },
	'budgetAutoGeneratedUpdateUrl': { value: '/update/autoGenerated/', writable: false, configurable: false },
	'dateMeantFor': { value: '?dateMeantFor=', writable: false, configurable: false },
	'autoGeneratedBudgetParam': { value: '&autoGenerated=true', writable: false, configurable: false },
	'budgetSaveUrl': { value: 'save/', writable: false, configurable: false },
	'budgetCopyBudgetUrl': { value: 'copyPreviousBudget/', writable: false, configurable: false },
	'budgetFetchAllDates': { value: 'fetchAllDatesWithData/', writable: false, configurable: false },
	'deleteAutoGeneratedParam': { value: '&deleteOnlyAutoGenerated=true', writable: false, configurable: false },
	'expenseCategory': { value: '1', writable: false, configurable: false },
	'incomeCategory': { value: '2', writable: false, configurable: false },
	'defaultCategory': { value: 4, writable: false, configurable: false },
	'deleteOnlyAutoGeneratedFalseParam': { value: '&deleteOnlyAutoGenerated=false', writable: false, configurable: false },
	'updateBudgetTrueParam': { value: '&updateBudget=true', writable: false, configurable: false },
	'updateBudgetFalseParam': { value: '&updateBudget=false', writable: false, configurable: false },
	'changeBudgetUrl': { value: 'changeCategory/', writable: false, configurable: false },
	'incomeTotalParam': { value:'?type=INCOME&average=false', writable: false, configurable: false },
	'expenseTotalParam': { value:'?type=EXPENSE&average=false', writable: false, configurable: false },
	'lifetimeUrl': { value:'lifetime/', writable: false, configurable: false },
	'financialPortfolioId': { value : '&financialPortfolioId=', writable: false, configurable: false},
});

//Currency Preference
let currentCurrencyPreference = '';

let currentActiveSideBar = '';
//Load Expense category and income category
let expenseSelectionOptGroup = document.createDocumentFragment();
let incomeSelectionOptGroup = document.createDocumentFragment();
let categoryMap = {};
//Regex to check if the entered value is a float
const regexForFloat = /^[+-]?\d+(\.\d+)?$/;

//Create Budget Map for transactions
let updateBudgetMap = {};

// Get today
let today = new Date();
// chosenDate for transactions (April 2019 as 042019)
let chosenDate = '01'+("0" + (today.getMonth() + 1)).slice(-2) + today.getFullYear();
// Name of the months (0-January :: 11-December)
let months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
// Freeze the months object
Object.freeze(months);
Object.seal(months);
// Choose the current month from the user chosen date
let userChosenMonthName = months[Number(chosenDate.slice(2, 4)) - 1]; 

//Popover Cache
let popoverYear = new Date().getFullYear();

// Position for month selection
let positionMonthCache = 0;

// Fetch all dates from the user budget
let datesWithUserBudgetData = [];

window.onload = function () {
	$(document).ready(function(){
		
		// Transactions total income cache
		let transactionsTotalIncomeOrExpenseCache = {}; 

		
		// Append "active" class name to toggle sidebar color change
		if($('.overview-dashboard').length) {
			currentActiveSideBar = document.getElementById(CUSTOM_DASHBOARD_CONSTANTS.overviewDashboardId);
			currentActiveSideBar.classList.add('active');
		}
		
		if($('.income-dashboard').length) {
			currentActiveSideBar = document.getElementById(CUSTOM_DASHBOARD_CONSTANTS.transactionDashboardId);
			currentActiveSideBar.classList.add('active');
		}
		
		if($('.goal-dashboard').length) {
			currentActiveSideBar = document.getElementById(CUSTOM_DASHBOARD_CONSTANTS.goalDashboardId);
			currentActiveSideBar.classList.add('active');
		}
		
		if($('.budget-dashboard').length) {
			currentActiveSideBar = document.getElementById(CUSTOM_DASHBOARD_CONSTANTS.budgetDashboardId);
			currentActiveSideBar.classList.add('active');
		}
		
		if($('.investment-dashboard').length) {
			currentActiveSideBar = document.getElementById(CUSTOM_DASHBOARD_CONSTANTS.investmentDashboardId);
			currentActiveSideBar.classList.add('active');
		}
		
		if($('.settings-dashboard').length) {
			currentActiveSideBar = document.getElementById(CUSTOM_DASHBOARD_CONSTANTS.settingsDashboardId);
			currentActiveSideBar.classList.add('active');
		}
		
		// Read Cookies
		readCookie();
		
		// Adjust styles of login for dashboad
		adjustStylesForLoginPopup();
		
		/* Read Cookies */
		function readCookie() {
				// make sure that the cookies exists
		        if (document.cookie != "") { 
		        		//Get the value from the name=value pair
		                let sidebarActiveCookie = getCookie('sidebarMini');
		                
		                if(includesStr(sidebarActiveCookie, 'active')) {
		                	 minimizeSidebar();
		                }
		                
		                // Get the value from the name=value pair
		                let cookieCurrentPage = getCookie('currentPage');
		                
		                if(!isEmpty(cookieCurrentPage)) {
		                	fetchCurrentPage(cookieCurrentPage);
		                } else {
		                	// Fetch overview page and display if cookie is empty
		                	fetchCurrentPage('overviewPage');
		                }
		        } else {
		        	// fetch overview page and display if no cookie is present
		        	fetchCurrentPage('overviewPage');
		        }
		}
		
		// Gets the cookie with the name
		function getCookie(cname) {
			  var name = cname + "=";
			  var decodedCookie = decodeURIComponent(document.cookie);
			  var ca = decodedCookie.split(';');
			  for(var i = 0; i <ca.length; i++) {
			    var c = ca[i];
			    while (c.charAt(0) == ' ') {
			      c = c.substring(1);
			    }
			    if (c.indexOf(name) == 0) {
			      return c.substring(name.length, c.length);
			    }
			  }
			  return "";
			}
		
		// DO NOT load the html from request just refresh div if possible without downloading JS
		$('.pageDynamicLoadForDashboard').click(function(e){
			e.preventDefault();
        	let id = $(this).attr('id');
			
			/* Create a cookie to store user preference */
		    var expirationDate = new Date;
		    expirationDate.setMonth(expirationDate.getMonth()+2);
		    
		    /* Create a cookie to store user preference */
		    document.cookie =  "currentPage=" + id + "; expires=" + expirationDate.toGMTString();
			
		    // Fetches Current date
			fetchCurrentPage(id);
		});
		
		// Fetches the current page 
		function fetchCurrentPage(id){
			let url = '';
			let color = '';
			let imageUrl = '../img/dashboard/sidebar/sidebar-1.jpg';
			
			if(isEmpty(id)){
				swal({
	                title: "Error Redirecting",
	                text: 'Please try again later',
	                type: 'warning',
	                timer: 1000,
	                showConfirmButton: false
	            }).catch(swal.noop);
				return;
			}
			
			// Close the category modals if open
			closeCategoryModalIfOpen();
			
			switch(id) {
			
			case 'transactionsPage':
				url = '/transactions';
				color = 'green';
				// Updates the budget before navigating away
				er.updateBudget(true);
			    break;
			case 'budgetPage':
				url = '/budget';
				color = 'rose';
			    break;
			case 'goalsPage':
				url = '/goals';
				color = 'orange';
				imageUrl = '../img/dashboard/sidebar/sidebar-2.jpg';
			    break;
			case 'overviewPage':
				url = '/overview';
				color = 'azure';
				imageUrl = '../img/dashboard/sidebar/sidebar-3.jpg';
			    break;
			case 'investmentsPage':
				url = '/investment';
				color = 'purple';
				imageUrl = '../img/dashboard/sidebar/sidebar-4.jpg';
			    break;
			case 'settings-dashboard-sidebar':
				url = '/settings';
				color = 'danger';
			    break;
			default:
				swal({
	                title: "Redirecting Not Possible",
	                text: 'Please try again later',
	                type: 'warning',
	                timer: 1000,
	                showConfirmButton: false
	            }).catch(swal.noop);
				return;
			}
			
			// Remove the active class from the current sidebar
			currentActiveSideBar.classList.remove('active');
			// Change the current sidebar
			currentActiveSideBar = document.getElementById($('#' + id).closest('li').attr('id'));
			// Add the active flag to the current one
			$('#' + id).closest('li').addClass('active');
			// Change side bar color to green
        	changeColorOfSidebar(color);
        	// Change Image of sidebar
        	changeImageOfSidebar(imageUrl);
        	// Reset the month existing date picker
        	resetMonthExistingPicker();
			
        	// Check if user is logged in
        	if(uh.checkIfUserLoggedIn()) {
        		// Set Currency If empty
        		if(isEmpty(currentCurrencyPreference)) {
        		    currentCurrencyPreference = currentUser.currency;
        			Object.freeze(currentCurrencyPreference);
        			Object.seal(currentCurrencyPreference);

        			// Set the name of the user
        			document.getElementById('userName').innerText = currentUser.name + ' ' + currentUser.family_name;
        		}

        		// Call the actual page which was requested to be loaded
        		$.ajax({
    		        type: "GET",
    		        url: url,
    		        dataType: 'html',
    		        success: function(data){
    		        	// Load the new HTML
    		            $('#mutableDashboard').html(data);
    		        },
    		        error: function(){
    		        	swal({
    		                title: "Redirecting Not Possible",
    		                text: 'Please try again later',
    		                type: 'warning',
    		                timer: 1000,
    		                showConfirmButton: false
    		            }).catch(swal.noop);
    		        }
    		    });
        	}
		}
		
		function closeCategoryModalIfOpen() {
			// Hide category modal if open
			if($('#GSCCModal').hasClass('show')) {
				$('#GSCCModal').modal('hide');
				$('body').removeClass('modal-open');
				$('.modal-backdrop').remove();
			}
			
			// Hide category modal if open
			if($('#categoryCompensationModal').hasClass('show')) {
				$('#categoryCompensationModal').modal('hide');
				$('body').removeClass('modal-open');
				$('.modal-backdrop').remove();
			}
			
			// Swal close modal if open
			if(Swal.isVisible()) {
				Swal.close();
			}
		}
		
		// Adjust styles of login for dashboard
		function adjustStylesForLoginPopup() {
			let loginModalHeader = document.getElementById('loginModalCardHeader');
			loginModalHeader.classList.remove('card-header');
			loginModalHeader.classList.remove('card-header-primary');
			
			// Disabled the close button 
			document.getElementById('loginModalCloseButton').disabled=true;
			
		}
		
		/**
		 *  Popover Date Time Functionality
		 */
		// Build Year
		buildYear(new Date().getFullYear())
		
		// Upon refresh choose current month
		chooseCurrentMonth();
		
		// Add appropriate year on startup
		function buildYear(selectedYear) {
			let monthPickerYear = document.getElementsByClassName('monthPickerYear');
			
			// Build current year information in date popover
			for(let count = 0, length = monthPickerYear.length; count < length; count++) {
				monthPickerYear[count].innerText = selectedYear;
			}
			
			// Update the cache
			popoverYear = selectedYear;
			
		}
		
		// Choose Current Month
		function chooseCurrentMonth() {
			
			let currentMonth = Number(new Date().getMonth()) + 1;
			
			document.getElementById('monthPicker-' + currentMonth).classList.add('monthPickerMonthCurrent', 'monthPickerMonthSelected');
		}
		
		// Click event for month picker
		document.getElementById('monthPickerDisplay').addEventListener("click",function(e){
			e.stopPropagation();
			
			// Show the modal (Do not close)
			let dateControlClass = document.getElementById('dateControl').classList;
			dateControlClass.toggle('d-none');
			
			// Change the SVG to down arrow or up arrow
			let overvierDateArrow = document.getElementsByClassName('overviewDateArrow')[0].classList;
			if(dateControlClass.contains('d-none')) {
				overvierDateArrow.remove('transformUpwardArrow');
				// Remove event listener once the function performed its task
				document.removeEventListener('mouseup', closeMonthPickerModal, false);
			} else {
				overvierDateArrow.add('transformUpwardArrow');
				// Add click outside event listener to close the modal
				document.addEventListener('mouseup', closeMonthPickerModal, false);
				// Store in position cache if the month picker is displayed
				let selectedMonthDiv = document.getElementsByClassName('monthPickerMonthSelected');
				positionMonthCache = selectedMonthDiv.length > 0 ? ("0" + lastElement(splitElement(selectedMonthDiv[0].id,'-'))).slice(-2) + popoverYear : positionMonthCache;
				
				// Fetch the budget data if the tab is open
				updateExistingBudgetInMonthPicker();
				// Fetch the transactions data if the tab is open
				updateExistingTransactionsInMonthPicker();
			}
			
		});
		
		// Previous Button Date Time Click
		document.getElementById('monthPickerPrev').addEventListener("click",function(){
			// Build year after calculating the current month 
			buildYear(Number(popoverYear) - 1);
			calcCurrentMonthInPopover();
			// Calculate the month selected
			calcCurrentMonthSelected();
			// Reset the month picker existing budget / transactions / goals / investments
			resetMonthExistingPicker();
			// Update existing date in month picker
			updateExistingBudgetInMonthPicker();
			// Update existing date for Transactions
			updateExistingTransactionsInMonthPicker();
			
		});
		
		// Next Button Date Time Click
		document.getElementById('monthPickerNext').addEventListener("click",function(){
			// Build year after calculating the current month 
			buildYear(Number(popoverYear) + 1);
			calcCurrentMonthInPopover();
			// Calculate the month selected
			calcCurrentMonthSelected();
			// Reset the month picker existing budget / transactions / goals / investments
			resetMonthExistingPicker();
			// Update existing date in month picker
			updateExistingBudgetInMonthPicker();
			// Update existing date for Transactions
			updateExistingTransactionsInMonthPicker();
			
		});
		
		// Function that appends today to current month
		function calcCurrentMonthInPopover() {
			let currentMonth = document.getElementsByClassName('monthPickerMonthCurrent');
			let currentDate = new Date();
			let currentDateAsMonth = Number(currentDate.getMonth()) + 1;
			
			if(popoverYear == currentDate.getFullYear() && currentMonth.length === 0) {
					document.getElementById('monthPicker-' + currentDateAsMonth).classList.add('monthPickerMonthCurrent');
			} else if(currentMonth.length != 0) {
					currentMonth[0].classList.remove('monthPickerMonthCurrent');
			}
		}
		
		// Calculate the current month selected
		function calcCurrentMonthSelected() {
			let selectedMonthDiv = document.getElementsByClassName('monthPickerMonthSelected');

			if(selectedMonthDiv.length === 0 && Number(positionMonthCache.slice(-4)) == popoverYear) {
				let positionElement = Number(positionMonthCache.slice(0,2));
				document.getElementById('monthPicker-' + positionElement).classList.add('monthPickerMonthSelected');
			} else if(selectedMonthDiv.length != 0) {
				selectedMonthDiv[0].classList.remove('monthPickerMonthSelected');
			}
		}
		
		// Reset the month picker existing budget / transactions / goals / investments
		function resetMonthExistingPicker() {
			// Remove all the existing class
			$(".monthPickerMonthExists").removeClass("monthPickerMonthExists");
		}
		
		// Update existing date picker with existing budget
		function updateExistingBudgetInMonthPicker() {
			
			let budgetAmountDiv = document.getElementById('budgetAmount');
			let colouredLineChartDiv = document.getElementById('colouredRoundedLineChart');
			
			// If other pages are present then return this event
			if(budgetAmountDiv == null && colouredLineChartDiv == null) {
				return;
			}
			
			// Update the latest budget month
        	for(let count = 0, length = datesWithUserBudgetData.length; count < length; count++) {
        		let userBudgetDate = datesWithUserBudgetData[count];
        		userBudgetDate = ('0' + userBudgetDate).slice(-8);
				if(popoverYear == userBudgetDate.slice(-4)) {
					let monthToAppend = Number(userBudgetDate.slice(2,4));
					document.getElementById('monthPicker-' + monthToAppend).classList.add('monthPickerMonthExists');
				}
        	}
		}
		
		// Event to close the month picker
		function closeMonthPickerModal(event) {
			let dateControlDiv = document.getElementById('dateControl');
			let overvierDateArrow = document.getElementsByClassName('overviewDateArrow')[0].classList;
			let monthPickerDisplay = document.getElementById('monthPickerDisplay');
			if (!(dateControlDiv.contains(event.target) || monthPickerDisplay.contains(event.target)) && !dateControlDiv.classList.contains('d-none')){
			    // Click outside the modal
				dateControlDiv.classList.add('d-none');
				// Remove upward arrow
				overvierDateArrow.remove('transformUpwardArrow');
				// Remove event listener once the function performed its task
				document.removeEventListener('mouseup', closeMonthPickerModal, false);
			}
		}
		
		// Date Picker On click month
		$('.monthPickerMonth').click(function() {
			// Remove event listener once the function performed its task
			document.removeEventListener('mouseup', closeMonthPickerModal, false);
		});
		
		// Update Transactions in month picker
		function updateExistingTransactionsInMonthPicker() {
			
			let transactionAmountDiv = document.getElementsByClassName('information-modal');
			let colouredLineChartDiv = document.getElementById('colouredRoundedLineChart');
			
			// If other pages are present then return this event
			if(transactionAmountDiv.length == 0 && colouredLineChartDiv == null) {
				return;
			}
			
			if(isEmpty(transactionsTotalIncomeOrExpenseCache)) {
				fetchIncomeTotalOrExpeseTotal(CUSTOM_DASHBOARD_CONSTANTS.incomeTotalParam);
				fetchIncomeTotalOrExpeseTotal(CUSTOM_DASHBOARD_CONSTANTS.expenseTotalParam);
			} else {
				updateMonthExistsWithTransactionData(transactionsTotalIncomeOrExpenseCache);
			}
		}
		
		// Fetch income total or expense total
		function fetchIncomeTotalOrExpeseTotal(incomeTotalParameter) {
			jQuery.ajax({
				url: CUSTOM_DASHBOARD_CONSTANTS.overviewUrl + CUSTOM_DASHBOARD_CONSTANTS.lifetimeUrl + incomeTotalParameter + CUSTOM_DASHBOARD_CONSTANTS.financialPortfolioId + currentUser.financialPortfolioId,
		        type: 'GET',
		        success: function(dateAndAmountAsList) {
		        	updateMonthExistsWithTransactionData(dateAndAmountAsList);
		        }
			});
		}
		
		// Fetch the transactions data to update month exists in Month Picker
		function updateMonthExistsWithTransactionData(dateAndAmountAsList) {
			if(isNotEmpty(dateAndAmountAsList)) {
        		let resultKeySet = Object.keys(dateAndAmountAsList);
	        	for(let countGrouped = 0, length = resultKeySet.length; countGrouped < length; countGrouped++) {
	        		let dateKey = resultKeySet[countGrouped];
	        		let value = dateAndAmountAsList[dateKey];

	        		// push values to cache
		        	transactionsTotalIncomeOrExpenseCache[dateKey] = value;
		        	
	        		// Convert the date key as date
	             	let dateAsDate = new Date(dateKey);
	             	
	             	if(popoverYear != dateAsDate.getFullYear()) {
	             		continue;
	             	}
	             	
	             	let currentMonth = dateAsDate.getMonth() + 1;
	             	let monthPickerClass = document.getElementById('monthPicker-' + currentMonth).classList;
	             	if(!monthPickerClass.contains('monthPickerMonthExists')) {
	             		monthPickerClass.add('monthPickerMonthExists');
	             	}
	        	}
        	}
		}
		
		// Set Current Month
		setCurrentMonthAndYID();
		function setCurrentMonthAndYID() {
			let overviewHeading = document.getElementById('overviewMonthHeading');
			let overviewYearHeading = document.getElementsByClassName('overviewYearHeading')[0];
			
			let currentDate = new Date();
			overviewHeading.innerText = months[currentDate.getMonth()];
			overviewYearHeading.innerText = currentDate.getFullYear();
		}
		
		// Fetch Bank Account Information and populate
		er_a.fetchBankAccountInfo();
		
	});
}

er = {
	//Loads the currenct logged in user from API (Call synchronously to set global variable)
	fetchJSONForLoggedInUser(){
		// Retrieve attributes 
		uh.retrieveAttributes();
	},

	// Load all categories from API (Call synchronously to set global variable)
	fetchJSONForCategories() {
		$.ajax({
	          type: "GET",
	          url: CUSTOM_DASHBOARD_CONSTANTS.fetchCategoriesUrl,
	          dataType: "json",
	          success : function(data) {
	        	  for(let count = 0, length = Object.keys(data).length; count < length; count++){
	        		  let key = Object.keys(data)[count];
	            	  let value = data[key];

	            	  // Freeze the object so it cannot be mutable
		        	  Object.freeze(value);
		        	  
	        		  categoryMap[value.categoryId] = value;
	        		  let option = document.createElement('option');
	    			  option.className = 'categoryOption-' + value.categoryId;
	    			  option.value = value.categoryId;
	    			  option.text = value.categoryName;
	        		  if(value.parentCategory == CUSTOM_DASHBOARD_CONSTANTS.expenseCategory){
	        			  expenseSelectionOptGroup.appendChild(option);
	        		  } else if(value.parentCategory == CUSTOM_DASHBOARD_CONSTANTS.incomeCategory) {
	        			  incomeSelectionOptGroup.appendChild(option);
	        		  }
	    		   
	        	  }
	        	  // Sealing the object so new objects or properties cannot be added
	        	  Object.seal(categoryMap);
	           }
	        });
	},
	
	// Updates the budget before refreshing or navigating away from the page (Synchronous)
	updateBudget(async) {
		if(isNotEmpty(updateBudgetMap)) {
			var values = {};
			jQuery.ajax({
				url: CUSTOM_DASHBOARD_CONSTANTS.budgetAPIUrl + currentUser.financialPortfolioId + CUSTOM_DASHBOARD_CONSTANTS.budgetAutoGeneratedUpdateUrl + chosenDate,
	            type: 'POST',
	            dataType: "json",
		        data : updateBudgetMap,
		        success: function() {
		        	// Prevents duplicate updation when clicking on sidebar tabs
		        	updateBudgetMap = {}; 
		        },
	            async: async
			});
		}
	},
	
	// Deletes all auto generated user budget
	deleteAllAutoGeneratedUserBudget() {
		jQuery.ajax({
			url: CUSTOM_DASHBOARD_CONSTANTS.budgetAPIUrl + currentUser.financialPortfolioId + CUSTOM_DASHBOARD_CONSTANTS.dateMeantFor + chosenDate + CUSTOM_DASHBOARD_CONSTANTS.autoGeneratedBudgetParam,
            type: 'DELETE',
            dataType: "json",
            async: true
		});
	},
	
	// Throw a session expired error and reload the page.
	sessionExpiredSwal(data){
    		// Show the login modal if the session has expired
    		// Initialize the modal to not close will when pressing ESC or clicking outside
			$('#loginModal').modal({
			    backdrop: 'static',
			    keyboard: false
			});
	},
	
	// Delete the auto generated category Ids
	deleteAutoGeneratedUserBudgets(categoryIdArray) {
		if (isEmpty(categoryIdArray)) {
			return;
		}
		
		// If it is an array then join the array
		if(categoryIdArray instanceof Array) {
			for(let count = 0, length = categoryIdArray.length; count < length; count++){
				let categoryId = categoryIdArray[count];
				
				if (categoryIdArray in updateBudgetMap) {
					// Delete the entry from the map if it is pending to be updated
					delete updateBudgetMap[categoryId];
				}
			}
			// Join the categories with a comma to end it to delete
			categoryIdArray.join(",");
		} else if (categoryIdArray in updateBudgetMap) {
			// Delete the entry from the map if it is pending to be updated
			delete updateBudgetMap[categoryIdArray];
		}
         
		// Send the AJAX request to delete the user budgets
        jQuery.ajax({
             url: CUSTOM_DASHBOARD_CONSTANTS.budgetAPIUrl + currentUser.financialPortfolioId + '/' + categoryIdArray + CUSTOM_DASHBOARD_CONSTANTS.dateMeantFor + chosenDate + CUSTOM_DASHBOARD_CONSTANTS.deleteAutoGeneratedParam,
             type: 'DELETE',
             contentType: "application/json; charset=utf-8", 
             async: true
        });
	},
	
	//convert from currency format to number
	convertToNumberFromCurrency(amount, currentCurrencyPreference){
		return round(parseFloat(trimElement(lastElement(splitElement(amount,currentCurrencyPreference))).replace(/[^0-9.-]+/g,"")),2);
	},
	
	// Security check to ensure that the category is present in the map
	checkIfInvalidCategory(categoryIdForBudget) {
		
		if(isEmpty(categoryMap[Number(categoryIdForBudget)])) {
			showNotification('Unable to the update budget at the moment. Please refresh the page and try again!','top','center','danger');
			return true;
		}
		
		return false;
	},
	
	startAnimationDonutChart(chart) {
		
		chart.on('draw', function(data) {
			  if(data.type === 'slice') {
			    // Get the total path length in order to use for dash array animation
			    var pathLength = data.element._node.getTotalLength();

			    // Set a dasharray that matches the path length as prerequisite to animate dashoffset
			    data.element.attr({
			      'stroke-dasharray': pathLength + 'px ' + pathLength + 'px'
			    });
			    
			    // Change the duration of the animation based on the length of the series
			    let durAnim = 1000;
			    if(chart.data.series.length > 12) {
			    	durAnim = 100;
			    } else if(chart.data.series.length > 9) {
			    	durAnim = 200;
			    } else if (chart.data.series.length > 6) {
			    	durAnim = 400;
			    } else if (chart.data.series.length > 3) {
			    	durAnim = 600;
			    }

			    // Create animation definition while also assigning an ID to the animation for later sync usage
			    var animationDefinition = {
			      'stroke-dashoffset': {
			        id: 'anim' + data.index,
			        dur: durAnim,
			        from: -pathLength + 'px',
			        to:  '0px',
			        easing: Chartist.Svg.Easing.easeOutQuint,
			        // We need to use `fill: 'freeze'` otherwise our animation will fall back to initial (not visible)
			        fill: 'freeze'
			      }
			    };

			    // If this was not the first slice, we need to time the animation so that it uses the end sync event of the previous animation
			    if(data.index !== 0) {
			      animationDefinition['stroke-dashoffset'].begin = 'anim' + (data.index - 1) + '.end';
			    }

			    // We need to set an initial value before the animation starts as we are not in guided mode which would do that for us
			    data.element.attr({
			      'stroke-dashoffset': -pathLength + 'px'
			    });

			    // We can't use guided mode as the animations need to rely on setting begin manually
			    // See http://gionkunz.github.io/chartist-js/api-documentation.html#chartistsvg-function-animate
			    data.element.animate(animationDefinition, false);
			  }
		});
		
	},
	
	setChosenDateWithSelected(elem) {
		let positionId = lastElement(splitElement(elem.id,'-'));
		positionId = ("0" + Number(positionId)).slice(-2);
		
		// Set chosen date
		chosenDate = "01" + positionId + popoverYear;
		
		// Hide the modal
		let dateControl = document.getElementById('dateControl');
		if(!dateControl.classList.contains('d-none')){
			dateControl.classList.toggle('d-none');
		}
		
		// Change the text of the month
		let overviewHeading = document.getElementById('overviewMonthHeading');
		let overviewYearHeading = document.getElementsByClassName('overviewYearHeading')[0];
		
		// Print the year
		overviewHeading.innerText = months[Number(chosenDate.slice(2,4)) - 1];
		overviewYearHeading.innerText = popoverYear;
		
		// Remove selected from current
		let monthsSelected = document.getElementsByClassName('monthPickerMonthSelected');
		if(monthsSelected.length != 0) {
			monthsSelected[0].classList.remove('monthPickerMonthSelected');
		}
		
		// Append Month select to current
		elem.classList.add('monthPickerMonthSelected');
		
		// Rotate the arrow head in the month display
		document.getElementsByClassName('overviewDateArrow')[0].classList.remove('transformUpwardArrow');
	}
		
}

// Fetch Category 
er.fetchJSONForCategories();

/* When the toggleFullscreen() function is executed, open the video in fullscreen.
Note that we must include prefixes for different browsers, as they don't support the requestFullscreen method yet */
function toggleFullscreen() {
	elem = document.documentElement;
	  if (!document.fullscreenElement && !document.mozFullScreenElement &&
	    !document.webkitFullscreenElement && !document.msFullscreenElement) {
	    if (elem.requestFullscreen) {
	      elem.requestFullscreen();
	    } else if (elem.msRequestFullscreen) {
	      elem.msRequestFullscreen();
	    } else if (elem.mozRequestFullScreen) {
	      elem.mozRequestFullScreen();
	    } else if (elem.webkitRequestFullscreen) {
	      elem.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
	    }
	  } else {
	    if (document.exitFullscreen) {
	      document.exitFullscreen();
	    } else if (document.msExitFullscreen) {
	      document.msExitFullscreen();
	    } else if (document.mozCancelFullScreen) {
	      document.mozCancelFullScreen();
	    } else if (document.webkitExitFullscreen) {
	      document.webkitExitFullscreen();
	    }
	  }
}

/* Get the element you want displayed in fullscreen mode (a video in this example): */
document.getElementById('dashboard-util-fullscreen').addEventListener('click', function() {
	  toggleFullscreen();
});

/* Minimize sidebar */
$('#minimizeSidebar').click(function () {
    minimizeSidebar();
    
    /* Create a cookie to store user preference */
    var expirationDate = new Date;
    expirationDate.setMonth(expirationDate.getMonth()+2);
    
    /* Create a cookie to store user preference */
    document.cookie =  (1 == md.misc.sidebar_mini_active ? "sidebarMini=active; expires=" + expirationDate.toGMTString() : "sidebarMini=inActive; expires=" + expirationDate.toGMTString() );
    
  });

/* Minimise sidebar*/
function minimizeSidebar(){
	 1 == md.misc.sidebar_mini_active ? ($('body').removeClass('sidebar-mini'), md.misc.sidebar_mini_active = !1)  : ($('body').addClass('sidebar-mini'), md.misc.sidebar_mini_active = !0);
 	
	 var e = setInterval(function () {
 	      window.dispatchEvent(new Event('resize'))
 	    }, 180);
 	    setTimeout(function () {
 	      clearInterval(e)
 	    }, 1000)
   
 	    // hide the active pro bottom pane
   if(1 == md.misc.sidebar_mini_active){
    	$('.active-pro').addClass('d-none').removeClass('d-block').animate({ height: '20px' }, 'easeOutQuad', function(){ 
        });
    } else {
    	$('.active-pro').removeClass('d-none').addClass('d-block').animate({ height: '20px' }, 'easeOutQuad', function(){});
    }
}

// Sidebar hover event if hidden
$(".sidebar").hover(function() {
	let activeProClass = document.getElementsByClassName('active-pro')[0].classList;
	if(1 == md.misc.sidebar_mini_active) {
		activeProClass.toggle('d-none');
		activeProClass.toggle('d-block');
	}
}, function() {
	let activeProClass = document.getElementsByClassName('active-pro')[0].classList;
	if(1 == md.misc.sidebar_mini_active) {
		activeProClass.toggle('d-none');
		activeProClass.toggle('d-block');
	}
});

// Minimize the decimals to a set variable
function round(value, decimals) {
  return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
}

function showNotification(message, from, align, colorCode){

//	type = ['', 'info', 'danger', 'success', 'warning', 'rose', 'primary'];
//    color = Math.floor((Math.random() * 6) + 1);
    
	  $.notify({
	      icon: "notifications",
	      message: message

	  },{
		 // type: type[color],
	      type: colorCode,
	      timer: 2000,
	      placement: {
	          from: from,
	          align: align
	      }
	  });
}

function replaceHTML(el, html) {
    var oldEl = typeof el === "string" ? document.getElementById(el) : el;
    /*@cc_on // Pure innerHTML is slightly faster in IE
        oldEl.innerHTML = html;
        return oldEl;
    @*/
    var newEl = oldEl.cloneNode(false);
    newEl.innerHTML = html;
    oldEl.parentNode.replaceChild(newEl, oldEl);
    /* Since we just removed the old element from the DOM, return a reference
    to the new element, which can be used to restore variable references. */
    return newEl;
}

function cloneElementAndAppend(document, elementToClone){
	let clonedElement = elementToClone.cloneNode(true);
	document.appendChild(elementToClone);
	return clonedElement;
	
}

// Assign color change for side bar
function changeColorOfSidebar(color){
	if ($sidebar.length != 0) {
		 $sidebar.attr('data-color', color);
	 }
}

// Assign background image for sidebar
function changeImageOfSidebar(img) {
	if ($sidebar.length != 0) {
		 $sidebar.attr('data-image', img);
		 
		$sidebar_img_container = $sidebar.find('.sidebar-background');
		if ($sidebar_img_container.length != 0) {
			$sidebar_img_container.css('background-image', 'url("' + img + '")');
		    $sidebar_img_container.fadeIn('fast');
		}
	}
}

//Format numbers in Indian Currency
function formatNumber(num, locale) {
	if(isEmpty(locale)){
		locale = "en-US";
	}
	
	return num.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}