"use strict";

(function scopeWrapper($) {
	// Custom Javascript for dashboard
	const SETTINGS_CONSTANTS = {};

	// SECURITY: Defining Immutable properties as constants
	Object.defineProperties(SETTINGS_CONSTANTS, {
		'devicesUrl': { value: '/devices', writable: false, configurable: false },
		'firstUserNameParam': { value: '?userName=', writable: false, configurable: false },
		'userAttributeUrl': { value: '/user-attribute', writable: false, configurable: false }
	});

	// Display Email for devices
	document.getElementById('currentUserEmail').innerText = currentUser.email;

	// List Devices on click tab
	document.getElementById('devicesTabLink').addEventListener("click",function(e){
		listRegisteredDevices(this);
	});

	function listRegisteredDevices(currentEl) {
		
		// Ajax Requests on Error
		let ajaxData = {};
		ajaxData.isAjaxReq = true;
		ajaxData.type = 'GET';
		ajaxData.url = _config.api.invokeUrl + SETTINGS_CONSTANTS.devicesUrl + SETTINGS_CONSTANTS.firstUserNameParam + currentUser.email;
		ajaxData.onSuccess = function(jsonObj) {
        	let devices = jsonObj.Devices;
		    console.log(devices);
        }
	    ajaxData.onFailure = function (thrownError) {
	    	manageErrors(thrownError, "There was an error while retrieving all the registered devices. Please try again later!");
        }
	 	jQuery.ajax({
			url: ajaxData.url,
			beforeSend: function(xhr){xhr.setRequestHeader("Authorization", authHeader);},
	        type: ajaxData.type,
	        success: ajaxData.onSuccess,
	        error: ajaxData.onFailure
    	});
	
		
	}

	function globalSignout() {
		var params = {
		  AccessToken: window.authHeader /* required */
		};

		cognitoUser.globalSignOut(params, function(err, data) {
		  if (err) showNotification(err.message,'top','center','danger'); // an error occurred
		  else     console.log(data);           // successful response
		});
	}

	/**
	* Autocomplete Module
	**/
	function autocomplete(inp, arr) {
	  /*the autocomplete function takes two arguments,
	  the text field element and an array of possible autocompleted values:*/
	  let currentFocus;
	  /*execute a function when someone writes in the text field:*/
	  inp.addEventListener("input", function(e) {
	      let a, b, i, val = this.value;
	      /*close any already open lists of autocompleted values*/
	      closeAllLists();
	      if (!val) { return false;}
	      currentFocus = -1;
	      /*create a DIV element that will contain the items (values):*/
	      a = document.createElement("DIV");
	      a.setAttribute("id", this.id + "autocomplete-list");
	      a.setAttribute("class", "autocomplete-items");
	      /*append the DIV element as a child of the autocomplete container:*/
	      this.parentNode.appendChild(a);
	      /* Upper case value entered */
	      let upperVal = val.toUpperCase();
	      /*for each item in the array...*/
	      for (let i = 0, len = arr.length; i < len; i++) {
	        /* check if the starting characters match */
	        let startsWithChar = arr[i].substr(0, val.length).toUpperCase() == upperVal;
	        /* build a regex with the value entered */
	        let regVal = new RegExp(upperVal,"g");
	        /*check if the item starts with the same letters as the text field value:*/
	        if (startsWithChar || includesStr(arr[i].toUpperCase(), upperVal)) {
	          /*create a DIV element for each matching element:*/
	          b = document.createElement("DIV");
	          b.classList.add("dropdown-item");
	          /*make the matching letters bold:*/
	          if(startsWithChar) {
	          	b.innerHTML = "<strong>" + arr[i].substr(0, val.length) + "</strong>";
	          	b.innerHTML += arr[i].substr(val.length);
	          } else {
	          	let startPos = regVal.exec(arr[i].toUpperCase()).index;
	          	let startPos2 = startPos + val.length;
	          	b.innerHTML = arr[i].substr(0, startPos);
	          	b.innerHTML += "<strong>" + arr[i].substr(startPos, val.length) + "</strong>";
	          	b.innerHTML += arr[i].substr(startPos2);
	          }
	          /*insert a input field that will hold the current array item's value:*/
	          b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
	          /*execute a function when someone clicks on the item value (DIV element):*/
	          b.addEventListener("click", function(e) {
	              /*insert the value for the autocomplete text field:*/
	              inp.value = this.getElementsByTagName("input")[0].value;
	              /*close the list of autocompleted values,
	              (or any other open lists of autocompleted values:*/
	              closeAllLists();
	          });
	          a.appendChild(b);
	        } 
	      }
	  });
	  /*execute a function presses a key on the keyboard:*/
	  inp.addEventListener("keydown", function(e) {
	      let x = document.getElementById(this.id + "autocomplete-list");
	      if (x) x = x.getElementsByTagName("div");
	      if (e.keyCode == 40) {
	        /*If the arrow DOWN key is pressed,
	        increase the currentFocus variable:*/
	        currentFocus++;
	        /*and and make the current item more visible:*/
	        addActive(x);
	      } else if (e.keyCode == 38) { //up
	        /*If the arrow UP key is pressed,
	        decrease the currentFocus variable:*/
	        currentFocus--;
	        /*and and make the current item more visible:*/
	        addActive(x);
	      } else if (e.keyCode == 13) {
	        /*If the ENTER key is pressed, prevent the form from being submitted,*/
	        e.preventDefault();
	        if (currentFocus > -1) {
	          /*and simulate a click on the "active" item:*/
	          if (x) x[currentFocus].click();
	        }
	      }
	  });
	  function addActive(x) {
	    /*a function to classify an item as "active":*/
	    if (!x) return false;
	    /*start by removing the "active" class on all items:*/
	    removeActive(x);
	    if (currentFocus >= x.length) currentFocus = 0;
	    if (currentFocus < 0) currentFocus = (x.length - 1);
	    /*add class "autocomplete-active":*/
	    x[currentFocus].classList.add("autocomplete-active");
	    // Change focus of the element
	    x[currentFocus].focus();
	  }
	  function removeActive(x) {
	    /*a function to remove the "active" class from all autocomplete items:*/
	    for (let i = 0, len = x.length; i < len; i++) {
	      x[i].classList.remove("autocomplete-active");
	    }
	  }
	  function closeAllLists(elmnt) {
	    /*close all autocomplete lists in the document,
	    except the one passed as an argument:*/
	    let x = document.getElementsByClassName("autocomplete-items");
	    for (let i = 0, len = x.length; i < len; i++) {
	      if (elmnt != x[i] && elmnt != inp) {
	        x[i].parentNode.removeChild(x[i]);
	      }
	    }
	  }
	  /* Paint the first five dropdown list */
	  firstFiveElements();

	  function firstFiveElements() {
	  	let a, b;
	  	/*create a DIV element that will contain the items (values):*/
        a = document.createElement("DIV");
        a.setAttribute("id", inp.id + "autocomplete-list");
        a.setAttribute("class", "autocomplete-items");
        /*append the DIV element as a child of the autocomplete container:*/
        inp.parentNode.appendChild(a);
	  	/*for each item in the array...*/
	  	let len = arr.length < 5 ? arr.length : 5;
	    for (let i = 0; i < len; i++) {
		  	/*create a DIV element for each matching element:*/
		    b = dropdownItemsWithWallet(arr[i]);
		    a.appendChild(b);
		}
	  }
	}

	/*
	*	Country Drop down Populate
	*/

	/*An array containing all the country names in the world:*/
	let countries = [];
	let lToC = {};
	let locToCou = window.localeToCountry.localeToCountry;
	for(let i = 0, l = locToCou.length; i < l; i++) {
		// Map of country and locale to be used later
		lToC[locToCou[i].name] = locToCou[i].country
		/* Update the default locale in Settings */
		if(isEqual(currentUser.locale.slice(-2),locToCou[i].country)) {
			document.getElementById('chosenCountry').innerText = locToCou[i].name;	
			// To be used to display "with wallet" section
			document.getElementById('currentCountries').appendChild(dropdownItemsWithWallet(locToCou[i].name));
		} else {
			// To be used for Auto complete
			countries.push(locToCou[i].name);
		}
	}

	/*initiate the autocomplete function on the "chosenCountryInp" element, and pass along the countries array as possible autocomplete values:*/
	autocomplete(document.getElementById("chosenCountryInp"), countries);

	// On click drop down btn of country search
	$("#chosenCountryDropdown").on("shown.bs.dropdown", function(event){
		// Input change focus to the country search bar 
		document.getElementById('chosenCountryInp').focus();
	});

	// On click drop down btn of country search
	$("#chosenCountryDropdown").on("hidden.bs.dropdown", function(event){
		// Input clear value for the country search bar 
		document.getElementById('chosenCountryInp').value = '';
		// Close all list
		closeAllDDLists(this);
	});

	// Close all lists within element
	function closeAllDDLists(elmnt) {
	    /*close all autocomplete lists in the document,
	    except the one passed as an argument:*/
	    let x = elmnt.getElementsByClassName("autocomplete-items");
	    for (let i = 0, len = x.length; i < len; i++) {
	      if (elmnt != x[i] && elmnt != inp) {
	        x[i].parentNode.removeChild(x[i]);
	      }
	    }
	}

	// On click drop down btn of country search
	$(document).on("click", ".dropdown-item" , function(event){
		let chooseCtyId = 'chosenCountryInpautocomplete-list';
		let chooseCrncyId = 'chosenCurrencyInpautocomplete-list';
		let id = this.parentElement.id;
		// Choose country DD update locale
		if(isEqual(id, chooseCtyId))  {
			updateUserAttr('locale', currentUser.locale.substring(0,3) +  lToC[this.lastChild.value], this);
		}
		if(isEqual(id, chooseCrncyId)) {
			updateUserAttr('currency', cToS[this.lastChild.value], this);
		}
	});

	// Update user attributes
	function updateUserAttr(param, paramVal, event) {
		// Fetch the display btn
		let inpId = event.parentElement.id.replace('Inpautocomplete-list','');
		let inpIdText = document.getElementById(inpId).innerText;
		// Change button text to the input value
		inpIdText = event.lastChild.value;

		// Set Param Val combination
		let values = {};
		values[param] = paramVal;
		values = JSON.stringify(values);

		// Ajax Requests on Error
		let ajaxData = {};
		ajaxData.isAjaxReq = true;
		ajaxData.type = 'POST';
		ajaxData.url = _config.api.invokeUrl + SETTINGS_CONSTANTS.userAttributeUrl;
   		ajaxData.contentType = "application/json;charset=UTF-8";
   		ajaxData.data = values;
		ajaxData.onSuccess = function(result) {
	        // After a successful updation of parameters to cache
	        currentUser[param] = paramVal;
	        // We save the item in the sessionStorage.
            sessionStorage.setItem("currentUserSI", JSON.stringify(currentUser));
        }
	    ajaxData.onFailure = function (thrownError) {
	    	// Change button text to the old Inp value
			inpIdText = currentUser[param];
			manageErrors(thrownError, "There was an error while updating. Please try again later!");
        }
	 	jQuery.ajax({
			url: ajaxData.url,
			beforeSend: function(xhr){xhr.setRequestHeader("Authorization", authHeader);},
	        type: ajaxData.type,
	        contentType: ajaxData.contentType,
	        data : ajaxData.data,
	        success: ajaxData.onSuccess,
	        error: ajaxData.onFailure
    	});
	}


	/*
	*	Currency Dropdown Populate
	*/

	/*An array containing all the currency names in the world:*/
	let currencies = [];
	let cToS = {};
	let curToSym = window.currencyNameToSymbol.currencyNameToSymbol;
	for(let i = 0, l = curToSym.length; i < l; i++) {
		cToS[curToSym[i].currency] = curToSym[i].symbol;
		/* Update the default currency in Settings */
		if(isEqual(currentUser.currency,curToSym[i].symbol)) {
			document.getElementById('chosenCurrency').innerText = curToSym[i].currency;
			// To be used to display "with wallet" section
			document.getElementById('currentCurrencies').appendChild(dropdownItemsWithWallet(locToCou[i].name));
		} else {
			currencies.push(curToSym[i].currency);
		}
	}

	/*initiate the autocomplete function on the "chosenCurrencyInp" element, and pass along the countries array as possible autocomplete values:*/
	autocomplete(document.getElementById("chosenCurrencyInp"), currencies);

	// On click drop down btn of country search
	$("#chosenCurrencyDropdown").on("shown.bs.dropdown", function(event){
		// Input change focus to the country search bar 
		document.getElementById('chosenCurrencyInp').focus();
	});

	// On click drop down btn of country search
	$("#chosenCurrencyDropdown").on("hidden.bs.dropdown", function(event){
		// Input clear value for the country search bar 
		document.getElementById('chosenCurrencyInp').value = '';
		// Close all list
		closeAllDDLists(this);
	});

	// Create the dropdown item with wallet
	function dropdownItemsWithWallet(withWalletItem) {
		let dpItem = document.createElement('div');
		dpItem.classList = 'dropdown-item';
		dpItem.innerText = withWalletItem;

		let inpHi = document.createElement('div');
		inpHi.setAttribute('type', 'hidden');
		inpHi.setAttribute('value', withWalletItem);
		dpItem.appendChild(inpHi);

		return dpItem;
	}

}(jQuery));