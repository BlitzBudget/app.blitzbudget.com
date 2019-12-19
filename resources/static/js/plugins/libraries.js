/**
 * Helpful functions with javascript
 */

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
	        if(obj.hasOwnProperty(key))
	            return false;
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
	let currencySymbolDivs = document.getElementsByClassName('currentCurrencySymbol');

	for(let i=0, len = currencySymbolDivs.length|0; i < len; i++) {
		currencySymbolDivs[i].innerText = currentUser.currency;
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