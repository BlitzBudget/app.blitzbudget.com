"use strict";
/* global currentUser authHeader*/

window.currentUser = window.currentUser || localStorage.getItem("currentUserSI") || {};

window.authHeader = window.authHeader || localStorage.getItem('idToken');
window.refreshToken = window.refreshToken || localStorage.getItem('refreshToken');

// Custom Javascript for dashboard
const CUSTOM_DASHBOARD_CONSTANTS = {};

// SECURITY: Defining Immutable properties as constants
Object.defineProperties(CUSTOM_DASHBOARD_CONSTANTS, {
	'bankAccountUrl': { value: window._config.api.invokeUrl + '/bank-accounts', writable: false, configurable: false },
	'overviewUrl': { value: window._config.api.invokeUrl + '/overview', writable: false, configurable: false },
	'fetchCategoriesUrl': { value: window._config.api.invokeUrl + '/categories', writable: false, configurable: false },
	'transactionAPIUrl': { value: window._config.api.invokeUrl + '/transactions', writable: false, configurable: false },	
	'budgetAPIUrl': { value: window._config.api.invokeUrl + '/budgets', writable: false, configurable: false },
	'overviewDashboardId': { value: 'overview-dashboard-sidebar', writable: false, configurable: false },
	'transactionDashboardId': { value: 'transaction-dashboard-sidebar', writable: false, configurable: false },
	'goalDashboardId': { value: 'goal-dashboard-sidebar', writable: false, configurable: false },
	'budgetDashboardId': { value: 'budget-dashboard-sidebar', writable: false, configurable: false },
	'investmentDashboardId': { value: 'investment-dashboard-sidebar', writable: false, configurable: false },
	'settingsDashboardId': { value: 'settingsPage', writable: false, configurable: false },
	'dateMeantFor': { value: '&dateMeantFor=', writable: false, configurable: false },
	'expenseCategory': { value: 'Expense', writable: false, configurable: false },
	'incomeCategory': { value: 'Income', writable: false, configurable: false },
	'walletId': { value : '?walletId=', writable: false, configurable: false},
});

//Currency Preference
window.currentCurrencyPreference = '$';

window.currentActiveSideBar = '';

//Regex to check if the entered value is a float
const regexForFloat = /^[+-]?\d+(\.\d+)?$/;

// Get today
window.today = new Date();
// chosenDate for transactions (April 2019 as 042019)
window.chosenDate = today;
// Name of the months (0-January :: 11-December)
window.months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
// Freeze the months object
Object.freeze(months);
Object.seal(months);
//Popover Cache
let popoverYear = new Date().getFullYear();
// Login popup already shown
let loginPopupShown = false;

window.onload = function () {
	$(document).ready(function(){

		// Position for month selection
		let positionMonthCache = 0;

		
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

		// If the current user data is still not loaded from Cognito (Refresh)
		if(isNotEmpty(currentUser)) {
			// Startup Application
			startupApplication();
		} else {
			// Show login
			er.showLoginPopup();
		}
		
		/* Read Cookies */
		function readCookie() {
			// make sure that the cookies exists
	        if (document.cookie != "") { 
        		//Get the value from the name=value pair
                let sidebarActiveCookie = er.getCookie('sidebarMini');
                
                if(includesStr(sidebarActiveCookie, 'active')) {
                	 minimizeSidebar();
                }
                
                // Get the value from the name=value pair
                let cookieCurrentPage = er.getCookie('currentPage');
                
                if(isNotEmpty(cookieCurrentPage)) {
                	// Second Priority to cookies
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
		
		
		// DO NOT load the html from request just refresh div if possible without downloading JS
		$('.pageDynamicLoadForDashboard').click(function(e){
			e.preventDefault();
        	let id = this.id;
        	// If the current sidebar is selected then do nothing
        	if(this.parentNode.classList.contains('active')) {
        		// If the tab is transactiosn tab then
        		if(isEqual(this.id,'transactionsPage')) er.tableSortMechanism();
        		return;
        	}
			
			
		    // Fetches Current date
			fetchCurrentPage(id);
		});
		
		// Fetches the current page 
		function fetchCurrentPage(id){
			let url = '';
			let color = '';
			let imageUrl = '../img/dashboard/sidebar/sidebar-1.jpg';
			let currentPage = '';
			
			if(isEmpty(id)){
				Swal.fire({
	                title: "Error Redirecting",
	                text: 'Please try again later',
	                icon: 'warning',
	                timer: 1000,
	                showConfirmButton: false
	            }).catch(swal.noop);
				return;
			}
			
			switch(id) {
			
				case 'transactionsPage':
					color = 'green';
				    break;
				case 'budgetPage':
					color = 'rose';
					imageUrl = '../img/dashboard/sidebar/sidebar-2.jpg';
				    break;
				case 'goalsPage':
					url = '/goals';
					color = 'orange';
					currentPage = 'Goals';
					imageUrl = '../img/dashboard/sidebar/sidebar-3.jpg';
				    break;
				case 'overviewPage':
					color = 'azure';
					imageUrl = '../img/dashboard/sidebar/sidebar-4.jpg';
				    break;
				case 'investmentsPage':
					url = '/investment';
					color = 'purple';
					currentPage = 'Investment';
					imageUrl = '../img/dashboard/sidebar/sidebar-5.jpg';
				    break;
				case 'settingsPage':
				case 'settingsPgDD':
					color = ''; /* No Color */
				    break;
				case 'profilePage':
				case 'profilePgDD':
					color = ''; /* No Color */
				    break;
				default:
					Swal.fire({
		                title: "Redirecting Not Possible",
		                text: 'Please try again later',
		                icon: 'warning',
		                timer: 1000,
		                showConfirmButton: false
		            }).catch(swal.noop);
					return;
			}
			
			// Close the category modals if open
			closeCategoryModalIfOpen();
			// Remove the active class from the current sidebar
			if(currentActiveSideBar) {
				currentActiveSideBar.classList.remove('active');
			}
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
        	// reset Scroll position to header
        	let navBarDiv = document.getElementsByClassName('navbar');
        	if(isNotEmpty(navBarDiv) && navBarDiv.length > 0) {
        		document.getElementsByClassName('main-panel')[0].scrollTop = navBarDiv[0].offsetTop - 10;
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
			let monthPicker = document.getElementById('monthPicker-' + currentMonth);
			if(isNotEmpty(monthPicker)) {monthPicker.classList.add('monthPickerMonthCurrent', 'monthPickerMonthSelected');}
		}
		
		// Click event for month picker
		let monthPickerDisplayDiv = document.getElementById('monthPickerDisplay');
		if(isNotEmpty(monthPickerDisplayDiv)) {
			monthPickerDisplayDiv.addEventListener("click",function(e){
				e.stopPropagation();
				let dateControlClass = document.getElementById('dateControl').classList;
				// Change the SVG to down arrow or up arrow
				let overvierDateArrow = document.getElementsByClassName('overviewDateArrow')[0].classList;
				if(!dateControlClass.contains('d-none')) {
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
					
					// Fetch the transactions data if the tab is open
					updateExistingDateInMonthPicker();
				}


				// Show the modal (Do not close)
				dateControlClass.toggle('d-none');
				
			});
		}
		
		// Previous Button Date Time Click
		let monthPickerPrev = document.getElementById('monthPickerPrev');
		if(isNotEmpty(monthPickerPrev)) {
			monthPickerPrev.addEventListener("click",function(){
				// Build year after calculating the current month 
				buildYear(Number(popoverYear) - 1);
				calcCurrentMonthInPopover();
				// Calculate the month selected
				calcCurrentMonthSelected();
				// Reset the month picker existing budget / transactions / goals / investments
				resetMonthExistingPicker();
				// Update existing date for Transactions
				updateExistingDateInMonthPicker();
				
			});
		}
		
		// Next Button Date Time Click
		let monthPickerNext = document.getElementById('monthPickerNext');
		if(isNotEmpty(monthPickerNext)) {
			monthPickerNext.addEventListener("click",function(){
				// Build year after calculating the current month 
				buildYear(Number(popoverYear) + 1);
				calcCurrentMonthInPopover();
				// Calculate the month selected
				calcCurrentMonthSelected();
				// Reset the month picker existing budget / transactions / goals / investments
				resetMonthExistingPicker();
				// Update existing date for Transactions
				updateExistingDateInMonthPicker();
				
			});
		}
		
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
		
		// Event to close the month picker
		function closeMonthPickerModal(event) {
			let dateControlDiv = document.getElementById('dateControl');
			let overvierDateArrow = document.getElementsByClassName('overviewDateArrow')[0].classList;
			let monthPickerPrev = document.getElementById('monthPickerPrev');
			let monthPickerNext = document.getElementById('monthPickerNext');
			// DO not remove the mouse up event if the prev or next btn is clicked
			if (monthPickerNext.contains(event.target) || 
				monthPickerPrev.contains(event.target) || 
				event.target.parentNode.classList.contains('monthPickerPrev') || 
				event.target.parentNode.classList.contains('monthPickerNext') || 
				event.target.classList.contains('monthPicker') || 
				event.target.classList.contains('monthPickerMonthSelected') ||
				event.target.parentNode.classList.contains('monthPickerMonthSelected') ||
				event.target.id == 'monthPickerDisplay' ||
				event.target.parentNode.id == 'monthPickerDisplay') {
				// Do not remove listener Previous btn, Next Btn, Month Picker Selected, Area of the popover date, date display click
				return;
			}
		    // Click outside the modal
			dateControlDiv.classList.add('d-none');
			// Remove upward arrow
			overvierDateArrow.remove('transformUpwardArrow');
			// Remove event listener once the function performed its task
			document.removeEventListener('mouseup', closeMonthPickerModal, false);
		}
		
		// Update Transactions in month picker
		function updateExistingDateInMonthPicker() {
			if(isNotEmpty(window.datesCreated)) {
	        	for(let countGrouped = 0, length = window.datesCreated.length; countGrouped < length; countGrouped++) {
	        		let date = window.datesCreated[countGrouped];
		        	
	        		// Convert the date key as date
	             	let dateAsDate = new Date(date.dateId.substring(5, date.dateId.length));
	             	
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
			if(isNotEmpty(overviewHeading)) {overviewHeading.innerText = months[currentDate.getMonth()];}
			if(isNotEmpty(overviewYearHeading)) {overviewYearHeading.innerText = currentDate.getFullYear();}
		}

		// Once the login modal is hidden then (Reload ALL API CALLS)
		let loginModal = $('#loginModal');
		if(isNotEmpty(loginModal)) {
			loginModal.on('hidden.bs.modal', function (e) {
				// Set loginPopup shown to false
				loginPopupShown = false;
				// If the current user data is still not loaded from Cognito (Refresh)
				if(isEmpty(currentUser)) {
				 	window.location.reload();
				} else {
				 	startupApplication();
				}
			});


			// Once the login modal is Shown then (focus to input)
			loginModal.on('shown.bs.modal', function (e) {
				// store in session storage
	        	let currentUserSI = localStorage.getItem("currentUserSI");
	        	// Get the URL param
			    const params = (new URL(document.location)).searchParams;
	        	// First Prority to URL parameter / Second to session storage 
	        	if(params != null && params.has('email')) {
	        		document.getElementById('emailInputSignin').value = params.get('email');
	        		document.getElementById('passwordInputSignin').focus();
	        		// Delete the email Param
	        		params.delete('email');
	        	} else if(isNotEmpty(currentUserSI)) {
	        		// Parse JSON back to Object
	        		currentUserSI = JSON.parse(currentUserSI);
	        		document.getElementById('emailInputSignin').value = currentUserSI.email;
	        		document.getElementById('passwordInputSignin').focus();
	        	} else if (params.has('verify')) {
	        		document.getElementById('emailInputVerify').focus();
	        		// After fetching delete param
	        		params.delete('verify');
	        	} else {
	        		// Change focus to input
					document.getElementById('emailInputSignin').focus();
	        	}
				 
			});
		}

		// unlock modal on shown modal
		let unlockModal = $('#unlockModal');
		if(isNotEmpty(unlockModal)) {
			unlockModal.on('shown.bs.modal', function (e) {
				// after the modal is shown focus on password
				document.getElementById('unlockAppPass').focus();
			});

			// unlock modal on hidden modal
			unlockModal.on('hide.bs.modal', function (e) {
				// Set the login popup shown to false
				loginPopupShown = false;
			});
		}

		// Start up application
		function startupApplication() {
			// Read Cookies
	        readCookie();
		}

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
		let dashboardFullScreen = document.getElementById('dashboard-util-fullscreen');
		if(isNotEmpty(dashboardFullScreen)) {
			dashboardFullScreen.addEventListener('click', function() {
				  toggleFullscreen();
			});
		}

		/* Minimize sidebar */
		let minimizeSidebarDiv = document.getElementById('minimizeSidebar');
		if(isNotEmpty(minimizeSidebarDiv)) {
			minimizeSidebarDiv.addEventListener('click', function() {
			    minimizeSidebar();
			    
			    /* Create a cookie to store user preference */
			    var expirationDate = new Date;
			    expirationDate.setMonth(expirationDate.getMonth()+2);
			    
			    /* Create a cookie to store user preference */
			    document.cookie =  (1 == md.misc.sidebar_mini_active ? "sidebarMini=active; expires=" + expirationDate.toGMTString() : "sidebarMini=inActive; expires=" + expirationDate.toGMTString() );
			    
			 });
		}
		

		/* Minimise sidebar*/
		function minimizeSidebar(){
			 1 == md.misc.sidebar_mini_active ? ($('body').removeClass('sidebar-mini'), md.misc.sidebar_mini_active = !1)  : ($('body').addClass('sidebar-mini'), md.misc.sidebar_mini_active = !0);
		 	
			 var e = setInterval(function () {
		 	      window.dispatchEvent(new Event('resize'))
		 	    }, 180);
		 	    setTimeout(function () {
		 	      clearInterval(e)
		 	    }, 1000)
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

		// Assign color change for side bar
		function changeColorOfSidebar(color){
			if ($sidebar.length != 0) {
				 $sidebar.attr('data-color', color);
			 }
		}

		// While scrolling the + button disappears
		let mutScrollable = document.getElementsByClassName('main-panel')[0];
		let mutableScrollPos = 0;
		if(isNotEmpty(mutScrollable)) {
			mutScrollable.addEventListener("scroll", function() {
			  transform('bottomFixed','scale-one','scale-zero', 'main-panel');
			});
		}

		// While scrolling the + button disappears / appears
		function transform (selector,classOne,classTwo,scrollableElement) {
			let st = document.getElementsByClassName(scrollableElement)[0].scrollTop;
			let selectorEl = document.getElementsByClassName(selector);
			if (selectorEl.length !== 0) {
			   if (st > mutableScrollPos) {
			    	selectorEl[0].classList.remove(classOne);
			    	selectorEl[0].classList.add(classTwo);
			   } else {
			   		selectorEl[0].classList.add(classOne);
			    	selectorEl[0].classList.remove(classTwo);
			   }
			   mutableScrollPos = st <= 0 ? 0 : st;
			}
		}

		// Before calling AJAX verify the following (ALL requests including CORS)
		$(document).ajaxSend(function() {
		  	if(isEmpty(window.currentUser) || 
		  		isEmpty(window.currentUser.email) || 
		  		isEmpty(window.currentUser.financialPortfolioId) ||
		  		localStorage.getItem('loggedOutUser') != null) {
		  		// Set current user as empty if the user has logged out
		  		if(localStorage.getItem('loggedOutUser') != null) window.currentUser = {};
		  		// Show login popup
		  	 	er.showLoginPopup();
		     	return false;
		  	}
		});

	});
}

er = {
	
	// Throw a session expired error and reload the page.
	sessionExpiredSwal(ajaxData) {
		uh.refreshToken(ajaxData);
	},

	showLoginPopup() {
		// If the modal is open then return
		if(document.getElementById('loginModal').classList.contains('show') || 
			document.getElementById('unlockModal').classList.contains('show') || 
			loginPopupShown) {
			return;
		}

		// Set the login popup shown to true
		loginPopupShown = true;

		let email = '';
		// Get parameters
        const params = (new URL(document.location)).searchParams;

        // First Priority to URL parameters
        if(params != null && params.has('verify')) {
        	$('#loginModal').modal({
			    backdrop: 'static',
			    keyboard: false
			});
        	let email = localStorage.getItem('verifyEmail');
        	toggleVerify(email, params.get('verify'));
        	if(isEmpty(email)) {
        		document.getElementById('emailDisplayVE').classList.add('d-none');
            	document.getElementById('shyAnchor').classList.add('d-none');
            	document.getElementById('emailInputVerify').classList.remove('d-none');
        	} else {
        		// Click the verify button
        		document.getElementById('vcBtnFrm').click();
        	}
        }  else {
        	// We retrieve the object again, but in a string form.
	        let currentUserSI = localStorage.getItem("currentUserSI");

	        // If cuurrent User does not exist then take it from session storage
			if(!currentUser && currentUserSI) {
				currentUser = JSON.parse(currentUserSI);
			}

			// If Current User exists then
			if(currentUser && currentUser.email && currentUser.name) {
				$('#unlockModal').modal({
				    backdrop: 'static',
				    keyboard: false
				});
				document.getElementById('unlockName').innerText = currentUser.name + ' ' + currentUser.family_name;
				// Id token refresh
				localStorage.removeItem('idToken');
			} else {
				$('#loginModal').modal({
				    backdrop: 'static',
				    keyboard: false
				});
				// Show the login modal if the session has expired
				// Initialize the modal to not close will when pressing ESC or clicking outside
				toggleLogin(email);
			}
        }
	},
	
	//convert from currency format to number
	convertToNumberFromCurrency(amount, currentCurrencyPreference){
		return round(parseFloat(formatNumber(trimElement(firstElement(splitElement(amount,currentCurrencyPreference))), "en-US")),2);
	},
	
	// Security check to ensure that the category is present in the map
	checkIfInvalidCategory(categoryIdForBudget) {
		
		if(isEmpty(window.categoryMap[categoryIdForBudget])) {
			showNotification('The category chosen is invalid. Please refresh the page and try again!',window._constants.notification.error);
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
		let positionId = elem.getAttribute('data-target');
		
		// Set chosen date
		chosenDate.setMonth(positionId);
		chosenDate.setFullYear(popoverYear);

		// Change the selected date ID
		populateCurrentDate(window.datesCreated);
		
		// Hide the modal
		let dateControl = document.getElementById('dateControl');
		if(!dateControl.classList.contains('d-none')){
			dateControl.classList.toggle('d-none');
		}
		
		// Change the text of the month
		let overviewHeading = document.getElementById('overviewMonthHeading');
		let overviewYearHeading = document.getElementsByClassName('overviewYearHeading')[0];
		
		// Print the year
		overviewHeading.innerText = months[chosenDate.getMonth()];
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
	},

	tableSortMechanism() {
		let tableSortMech = window.sortingTransTable;
		if(isNotEmpty(tableSortMech != null)) {

			switch(tableSortMech) {
				
				case 'Account':
					// Click the account sorting mechanism
					document.getElementById('accountSortBy').click();
					break;
				case 'CreationDate':
					// Click the creation date sorting mechanism
					document.getElementById('creationDateSortBy').click();
					break;
			}

			// Remove the stored item
			window.sortingTransTable = null;
		}
	},

	startAnimationForBarChart: function (e) {
	    e.on('draw', function (e) {
	      'bar' === e.type && (seq2++, e.element.animate({
	        opacity: {
	          begin: seq2 * delays2,
	          dur: durations2,
	          from: 0,
	          to: 1,
	          easing: 'ease'
	        }
	      }))
	    }),
	    seq2 = 0
	},

	refreshCookiePageExpiry:  function (id) {
		/* Create a cookie to store user preference */
	    let expirationDate = new Date;
	    expirationDate.setMonth(expirationDate.getMonth()+2);
	    
	    /* Create a cookie to store user preference */
	    document.cookie =  "currentPage=" + id + "; expires=" + expirationDate.toGMTString();
		
	},

	// Gets the cookie with the name
	getCookie: function(cname) {
	  let name = cname + "=";
	  let decodedCookie = decodeURIComponent(document.cookie);
	  let ca = decodedCookie.split(';');
	  for(let i = 0; i <ca.length; i++) {
	    let c = ca[i];
	    while (c.charAt(0) == ' ') {
	      c = c.substring(1);
	    }
	    if (c.indexOf(name) == 0) {
	      return c.substring(name.length, c.length);
	    }
	  }
	  return "";
	},

	fetchCurrentPage: function(url, onSuccess) {
		// Call the actual page which was requested to be loaded
		$.ajax({
	        type: "GET",
	        url: url,
	        dataType: 'html',
	        success: onSuccess,
	        error: function(){
	        	Swal.fire({
	                title: "Redirecting Not Possible",
	                text: 'Please try again later',
	                icon: 'warning',
	                timer: 1000,
	                showConfirmButton: false
	            }).catch(swal.noop);
	        }
	    });
	}
		
}

// Populate current Date in the currentDateAsId global variable
function populateCurrentDate(date) {
	window.currentDateAsID = window.chosenDate.toISOString();
	for (var i = date.length - 1; i >= 0; i--) {
		let presentDate = date[i].dateId;
		let presentDateAsDate = new Date(presentDate.substring(5, presentDate.length));
		if(window.chosenDate.getMonth() == presentDateAsDate.getMonth()
			&& window.chosenDate.getFullYear() == presentDateAsDate.getFullYear()) {
			window.currentDateAsID = presentDate;
		}
	}
}

// Load all categories from API (Call synchronously to set global variable)
function fetchJSONForCategories(data) {
	// Expense and Income Initialize
	window.expenseDropdownItems = document.createDocumentFragment();
	window.incomeDropdownItems = document.createDocumentFragment();
	window.categoryMap = {};
	let dataNameMap = {};

	if(isNotEmpty(data)) {
		for(let i=0,len=data.length;i<len;i++) {
			dataNameMap[data[i]['category_name']] = data[i];
		}
	}
	
	for(let count = 0, length = window.defaultCategories.length; count < length; count++){
		  let value = window.defaultCategories[count];
		  // While Changing the dates delete the ID field.
		  delete value.id;
		  delete value.categoryTotal;

		  /*create a DIV element for each matching element:*/
	      let option = document.createElement("DIV");
	      option.classList.add("dropdown-item");
		  option.innerText = value.name;

		  let inputValue = document.createElement('input');
		  inputValue.type = 'hidden';
		  let categoryData = dataNameMap[value.name];
		  if(isNotEmpty(categoryData)) {
		  	let categoryId = categoryData.categoryId;
		  	inputValue.value = categoryId;
		  	value.id = categoryId;
		  	value.categoryTotal = categoryData['category_total'];
		  	window.categoryMap[value.id] = value;
		  } else {
		  	inputValue.value = value.name;
	

		  	window.categoryMap[value.name] = value;
		  }
		  option.appendChild(inputValue);

		  if(value.type == CUSTOM_DASHBOARD_CONSTANTS.expenseCategory){
			  window.expenseDropdownItems.appendChild(option);
		  } else if(value.type == CUSTOM_DASHBOARD_CONSTANTS.incomeCategory) {
			  window.incomeDropdownItems.appendChild(option);
		  }
  	}   
}

/*
* If one category has been assigned a Category then
*/
function assignCategoryId(data) {
	let categoryId = data.category;
	let categoryName = data.categoryName;
	let categoryType = data.categoryType;

	if(isNotEmpty(window.categoryMap[categoryName])) {
		let category = {};
		let categoryTotal = window.categoryMap[categoryName].categoryTotal;
		category.categoryTotal = isNotEmpty(categoryTotal) ? categoryTotal : 0;
		category.name = categoryName;
		category.type = categoryType;
		category.id = categoryId;

		delete window.categoryMap[categoryName];
		
		// Category Map
		window.categoryMap[categoryId] = category;
	}

	let iterateElement;
	if(categoryType == CUSTOM_DASHBOARD_CONSTANTS.expenseCategory){
		  iterateElement = window.expenseDropdownItems
	} else if(categoryType == CUSTOM_DASHBOARD_CONSTANTS.incomeCategory) {
		  iterateElement = window.incomeDropdownItems
	}

	let children = iterateElement.children;
	for (let i = 0, len = children.length; i < len; i++) {
	  let childElement = children[i];
	  if(isEqual(childElement.lastChild.value, categoryName)) {
	  		childElement.lastChild.value = categoryId;
	  }
	}
}

// Display Confirm Account Verification Code
function toggleVerify(email, verifyCode) {
    document.getElementById('google').classList.add('d-none');
    document.getElementById('facebook').classList.add('d-none');
    document.getElementById('twitter').classList.add('d-none');
    document.getElementById('gmail').classList.remove('d-none');
    document.getElementById('outlook').classList.remove('d-none');

    document.getElementById('loginModalTitle').innerText = 'Email Verification';

    document.getElementById('signinForm').classList.add('d-none');

    document.getElementById('verifyForm').classList.remove('d-none');

    document.getElementById('emailInputVerify').value = email;

    document.getElementById('emailDisplayVE').innerText = email;

    document.getElementById('codeInputVerify').value = verifyCode;

    document.getElementById('forgotPassLogin').classList.add('d-none');

    document.getElementById('resendCodeLogin').classList.remove('d-none');
    
    // hide Signin
    document.getElementById('signinForm').classList.add('d-none');
    
    document.getElementById('successLoginPopup').innerText = '';
    document.getElementById('errorLoginPopup').innerText = '';

    document.getElementById('forgotPassLogin').classList.add('d-none');

    // CHange focus to verification code
    document.getElementById('codeInputVerify').focus();

}