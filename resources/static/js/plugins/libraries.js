/**
 * Helpful functions with javascript
 */

 // Initialize the weekday variable
window.weekday=new Array(7);
window.weekday[0]="Monday";
window.weekday[1]="Tuesday";
window.weekday[2]="Wednesday";
window.weekday[3]="Thursday";
window.weekday[4]="Friday";
window.weekday[5]="Saturday";
window.weekday[6]="Sunday";

function lastElement(arr){
	if(Array.isArray(arr)){
		return isEmpty(arr) ? arr : arr[arr.length-1];
	}
	return arr;
}

function  isEmpty(obj) {
	if(typeof(obj) == 'number' || typeof(obj) == 'boolean')
	    return false; 
	
	if (obj == null || obj === undefined)
        return true;
	
	if(typeof(obj.length) != 'undefined')
	    return obj.length == 0;
	 
	for(var key in obj) {
        if(obj.hasOwnProperty(key))return false;
    }
	    
	return true;
}

function  isNotEmpty(obj) {
	return !isEmpty(obj);
}

function  isNotBlank(obj) {
	return isNotEmpty(obj) && obj !== '';
}

function trimElement(str) {
	return $.trim(str);
}

function splitElement(str, splitString){
	if(includesStr(str, splitString)){
		return isEmpty(str) ? str : str.split(splitString);
	}
	
	return str;
}

function includesStr(arr, val){
	return isEmpty(arr) ? null : arr.includes(val); 
}

function fetchFirstElement(arr){
	if(Array.isArray(arr)){
		return isEmpty(arr) ? null : arr[0];
	}
	return arr;
}

function isEqual(obj1,obj2){
	if (JSON.stringify(obj1) === JSON.stringify(obj2)) {
	    return true;
	}
	return false;
}

function groupByKey(xs, key) {
	  return xs.reduce(function(rv, x) {
	    (rv[x[key]] = rv[x[key]] || []).push(x);
	    return rv;
	  }, {});
};

function isNotEqual(obj1,obj2){
	return !isEqual(obj1,obj2);
}

function formatLargeCurrencies(value) {
	
	if(value >= 1000000000) {
		value = (value / 1000000000) + 'B';
		return value;
	}
	
	if(value >= 1000000) {
		value = (value / 1000000) + 'M';
		return value;
	}
	
	if(value >= 1000) {
  	  value = (value / 1000) + 'k';
  	  return value;
    }
	
	return value;
}

// IE 7 Or Less support
function stringIncludes(s,sub) {
	if(isEmpty(s) || isEmpty(sub)) {
		return false;
	}
	
	return s.indexOf(sub) !== -1;
}

function calcPage() {
	// Fetch the current active sidebar
	let sideBarId = currentActiveSideBar.id;
	
	if(isEqual(sideBarId, CUSTOM_DASHBOARD_CONSTANTS.overviewDashboardId)) {
		return 'info';
	} else if(isEqual(sideBarId, CUSTOM_DASHBOARD_CONSTANTS.transactionDashboardId)) {
		return 'success';
	} else if (isEqual(sideBarId, CUSTOM_DASHBOARD_CONSTANTS.budgetDashboardId)) {
		return 'rose';
	} else if (isEqual(sideBarId, CUSTOM_DASHBOARD_CONSTANTS.goalDashboardId)) {
		return 'warning';
	}
	
	return 'info';
}

// Replace currentCurrencySymbol with currency
function replaceWithCurrency() {
	if(currentUser.currency) {
		let currencySymbolDivs = document.getElementsByClassName('currentCurrencySymbol');

		for(let i=0, len = currencySymbolDivs.length|0; i < len; i++) {
			currencySymbolDivs[i].innerText = currentUser.currency;
		}
	}
}

function getAllUrlParams(url) {

  // get query string from url (optional) or window
  var queryString = url ? url.split('?')[1] : window.location.search.slice(1);

  // we'll store the parameters here
  var obj = {};

  // if query string exists
  if (queryString) {

    // stuff after # is not part of query string, so get rid of it
    queryString = queryString.split('#')[0];

    // split our query string into its component parts
    var arr = queryString.split('&');

    for (var i = 0; i < arr.length; i++) {
      // separate the keys and the values
      var a = arr[i].split('=');

      // set parameter name and value (use 'true' if empty)
      var paramName = a[0];
      var paramValue = typeof (a[1]) === 'undefined' ? true : a[1];

      // (optional) keep case consistent
      paramName = paramName.toLowerCase();
      if (typeof paramValue === 'string') paramValue = paramValue.toLowerCase();

      // if the paramName ends with square brackets, e.g. colors[] or colors[2]
      if (paramName.match(/\[(\d+)?\]$/)) {

        // create key if it doesn't exist
        var key = paramName.replace(/\[(\d+)?\]/, '');
        if (!obj[key]) obj[key] = [];

        // if it's an indexed array e.g. colors[2]
        if (paramName.match(/\[\d+\]$/)) {
          // get the index value and add the entry at the appropriate position
          var index = /\[(\d+)\]/.exec(paramName)[1];
          obj[key][index] = paramValue;
        } else {
          // otherwise add the value to the end of the array
          obj[key].push(paramValue);
        }
      } else {
        // we're dealing with a string
        if (!obj[paramName]) {
          // if it doesn't exist, create property
          obj[paramName] = paramValue;
        } else if (obj[paramName] && typeof obj[paramName] === 'string'){
          // if property does exist and it's a string, convert it to an array
          obj[paramName] = [obj[paramName]];
          obj[paramName].push(paramValue);
        } else {
          // otherwise add the property
          obj[paramName].push(paramValue);
        }
      }
    }
  }

  return obj;
}



// Manage errors
function manageErrors(thrownError, message, ajaxData) {
	if(isEmpty(thrownError) || isEmpty(thrownError.responseText)) {
		showNotification(message,'top','center','danger');
	} else if(isNotEmpty(thrownError.message)) {
		showNotification(thrownError.message,'top','center','danger');
	} else {
		let responseError = JSON.parse(thrownError.responseText);
   	 	if(isNotEmpty(responseError) && isNotEmpty(responseError.error) && responseError.error.includes("Unauthorized")){
    		er.sessionExpiredSwal(ajaxData);
    	}	
	}
}


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

//Format numbers in Indian Currency
function formatNumber(num, locale) {
	if(isEmpty(locale)){
		locale = "en-US";
	}
	
	return num.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
	
// Get the weekdays name
function getWeekDays(day) {
	return window.weekday[day];
}

// OrdinalSuffix
function ordinalSuffixOf(i) {
    var j = i % 10,
        k = i % 100;
    if (j == 1 && k != 11) {
        return i + "st";
    }
    if (j == 2 && k != 12) {
        return i + "nd";
    }
    if (j == 3 && k != 13) {
        return i + "rd";
    }
    return i + "th";
}

// Check if the date is today
const isToday = (someDate) => {
  return someDate.getDate() == today.getDate() &&
    someDate.getMonth() == today.getMonth() &&
    someDate.getFullYear() == today.getFullYear()
}

// Check if both the days are same
function sameDate(inpDate, checkWith) {
	return inpDate.getDate() == checkWith.getDate() &&
    inpDate.getMonth() == checkWith.getMonth() &&
    inpDate.getFullYear() == checkWith.getFullYear();
}