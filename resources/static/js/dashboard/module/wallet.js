// Account Information display
(function scopeWrapper($) {

	// SECURITY: Defining Immutable properties as constants
	Object.defineProperties(WALLET_CONSTANTS, {
		'walletUrl': { value: '/wallet', writable: false, configurable: false },
	});

	// Add wallet
	let chosenCurrency = '';
	window.authHeader = window.authHeader || localStorage.getItem('idToken');

	// store in session storage
    let currentUserSI = localStorage.getItem("currentUserSI");
    if(isNotEmpty(currentUserSI)) {
		// Parse JSON back to Object
		window.currentUser = JSON.parse(currentUserSI);
	} else {
		// If the user is not authorized then redirect to application
		window.location.href = '/';
	}

	document.getElementById('genericAddFnc').addEventListener("click",function(e){
		document.getElementById('addWallet').classList.remove('d-none');
		document.getElementById('whichWallet').classList.add('d-none');
		document.getElementById('genericAddFnc').classList.add('d-none');
		document.body.classList.add('darker');
	});

	document.getElementById('cancelWallet').addEventListener("click",function(e){
		document.getElementById('addWallet').classList.add('d-none');
		document.getElementById('whichWallet').classList.remove('d-none');
		document.getElementById('genericAddFnc').classList.remove('d-none');		
		document.body.classList.remove('darker');
	});

	document.getElementById('confirmWallet').addEventListener("click",function(e){
		document.getElementById('addWallet').classList.add('d-none');
		document.getElementById('whichWallet').classList.remove('d-none');
		document.getElementById('genericAddFnc').classList.remove('d-none');		
		document.body.classList.remove('darker');
		// Add new wallet
		addNewWallet();
	});

	// Add new wallet
	function addNewWallet() {
		// Set Param Val combination
		let values = {};
		values['currency'] = chosenCurrency;
		values = JSON.stringify(values);

		jQuery.ajax({
			url: config.api.invokeUrl + WALLET_CONSTANTS.walletUrl;,
			beforeSend: function(xhr){xhr.setRequestHeader("Authorization", window.authHeader);},
	        type: 'POST',
	        contentType: "application/json;charset=UTF-8",
	        data : values,
	        error: function(thrownError) {
	        	if(isEmpty(thrownError) || isEmpty(thrownError.responseText)) {
					showNotification(message,window._constants.notification.error);
				} else if(isNotEmpty(thrownError.message)) {
					showNotification(thrownError.message,window._constants.notification.error);
				} else {
					let responseError = JSON.parse(thrownError.responseText);
			   	 	if(isNotEmpty(responseError) && isNotEmpty(responseError.error) && responseError.error.includes("Unauthorized")){
			    		// If the user is not authorized then redirect to application
						window.location.href = '/';
			    	}	
				}
	        }
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
			document.getElementById('currentCurrencies').appendChild(dropdownItemsWithWallet(curToSym[i].currency));
		} else {
			currencies.push(curToSym[i].currency);
		}
	}

	/*initiate the autocomplete function on the "chosenCurrencyInp" element, and pass along the countries array as possible autocomplete values:*/
	autocomplete(document.getElementById("chosenCurrencyInp"), currencies, "chooseCurrencyDD");

	/**
	* Autocomplete Module
	**/
	function autocomplete(inp, arr, scrollWrapEl) {
	  /*Removes a function when someone writes in the text field:*/
	  inp.removeEventListener("input", inputTriggerAutoFill);
	  /*Removes a function presses a key on the keyboard:*/
	  inp.removeEventListener("keydown", keydownAutoCompleteTrigger);
	  /*the autocomplete function takes two arguments,
	  the text field element and an array of possible autocompleted values:*/
	  let currentFocus;
	  /*execute a function when someone writes in the text field:*/
	  inp.addEventListener("input", inputTriggerAutoFill);
	  /*execute a function presses a key on the keyboard:*/
	  inp.addEventListener("keydown", keydownAutoCompleteTrigger);
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
      /*
	  * Auto Complete Input Trigger function 
	  */
	  function inputTriggerAutoFill(e) {
	      let a, b, i, val = this.value,  len = arr.length, upperVal, startsWithChar, regVal;
	      /*close any already open lists of autocompleted values*/
	      closeAllLists();
	      if (!val) {
	      	len = arr.length < 5 ? arr.length : 5;
	      } else {
	      	upperVal = val.toUpperCase()
	      }
	      currentFocus = -1;
	      /*create a DIV element that will contain the items (values):*/
	      a = document.createElement("DIV");
	      a.setAttribute("id", this.id + "autocomplete-list");
	      a.setAttribute("class", "autocomplete-items");
	      /*append the DIV element as a child of the autocomplete container:*/
	      this.parentNode.appendChild(a);
	      /*for each item in the array...*/
	      for (let i = 0; i < len; i++) {
	      	let autoFilEl = false;
		  	if(!val) {
		  		autoFilEl = true;
		  	} else {
		  		/* check if the starting characters match */
		        startsWithChar = arr[i].substr(0, val.length).toUpperCase() == upperVal;
		        /* build a regex with the value entered */
		        regVal = new RegExp(upperVal,"g");
		        /*check if the item starts with the same letters as the text field value:*/
		        if (startsWithChar || includesStr(arr[i].toUpperCase(), upperVal)) {
		        	autoFilEl = true;
		        }	
		  	}

		  	// Confinue with the iteration
		  	if(!autoFilEl) {
		  		continue;
		  	}
	        
	        /*create a DIV element for each matching element:*/
	        b = document.createElement("DIV");
	        b.classList.add("dropdown-item");
	        /*make the matching letters bold:*/
	        if(startsWithChar) {
	          	b.innerHTML = "<strong>" + arr[i].substr(0, val.length) + "</strong>" + arr[i].substr(val.length);
	        } else if(!val) {
	        	b.innerHTML = arr[i];
	        } else {
	          	let startPos = regVal.exec(arr[i].toUpperCase()).index;
	          	let startPos2 = startPos + val.length;
	          	b.innerHTML = arr[i].substr(0, startPos) + "<strong>" + arr[i].substr(startPos, val.length) + "</strong>" + arr[i].substr(startPos2);
	        }
	        /*insert a input field that will hold the current array item's value:*/
	        b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
	        /*execute a function when someone clicks on the item value (DIV element):*/
	        b.addEventListener("click", function(e) {
	              /*insert the value for the autocomplete text field:*/
	              if(isNotEmpty(inp)) inp.value = this.getElementsByTagName("input")[0].value;
	              /*close the list of autocompleted values,
	              (or any other open lists of autocompleted values:*/
	              closeAllLists();
	        });
	        a.appendChild(b);
	      }
	  }

	  /*
	  *	Autocomplete Key down event
	  */
	  function keydownAutoCompleteTrigger(e) {
	  	  let wrapClassId = this.id + "autocomplete-list";
	      let x = document.getElementById(wrapClassId);
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
	      /* set equal to the position of the selected element minus the height of scrolling div */
	      let scrollToEl = $("#" + scrollWrapEl);
	      /* set to top */
	      scrollToEl.scrollTop(0);
	      let ddItemac = $('#' + wrapClassId + ' .autocomplete-active');
	      /* Chceck if elements are present, then scrolls to them */
	      if(ddItemac && scrollToEl && ddItemac.offset() && scrollToEl.offset()) {
    	  	scrollToEl.scrollTop(ddItemac.offset().top - scrollToEl.offset().top + scrollToEl.scrollTop());
	      }
	  }
	}

	// On click drop down btn of country search
	$("#chosenCurrencyDropdown").on("shown.bs.dropdown", function(event){
		let currencyInp = document.getElementById('chosenCurrencyInp');
		// Input change focus to the country search bar 
		currencyInp.focus();
		// Trigger input event
		let eventInp = new Event('input', {
		    bubbles: true,
		    cancelable: true,
		});

		currencyInp.dispatchEvent(eventInp);
	});

	// On click drop down btn of country search
	$("#chosenCurrencyDropdown").on("hidden.bs.dropdown", function(event){
		// Input clear value for the country search bar 
		document.getElementById('chosenCurrencyInp').value = '';
		// Close all list
		closeAllDDLists(this);
	});

	// Close all lists within element
	function closeAllDDLists(elmnt) {
	    /*close all autocomplete lists in the document,
	    except the one passed as an argument:*/
	    let x = elmnt.getElementsByClassName("autocomplete-items");
	    for (let i = 0, len = x.length; i < len; i++) {
	      if (elmnt != x[i]) {
	        x[i].parentNode.removeChild(x[i]);
	      }
	    }
	}

		// On click drop down btn of country search
	$(document).on("click", ".dropdown-item" , function(event){
		let chooseCrncyId = 'chosenCurrencyInpautocomplete-list';
		let id = this.parentElement.id;
		// Choose country DD update locale
		if(isEqual(id, chooseCrncyId)) {
			document.getElementById('chosenCurrency').innerText = this.lastChild.value;
			chosenCurrency = cToS[this.lastChild.value];
		}
	});

	// Create the dropdown item with wallet
	function dropdownItemsWithWallet(withWalletItem) {
		let dpItem = document.createElement('div');
		dpItem.classList = 'dropdown-item';
		dpItem.innerText = withWalletItem;

		let inpHi = document.createElement('input');
		inpHi.setAttribute('type', 'hidden');
		inpHi.setAttribute('value', withWalletItem);
		dpItem.appendChild(inpHi);

		return dpItem;
	}

}(jQuery));	