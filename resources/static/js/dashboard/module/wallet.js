// Account Information display
(function scopeWrapper($) {

	// Manage Wallets Trigger
	window.manageWalletsTriggered = false;

	// Current Chosen Wallet 
	let chosenWallet = '';

	// WALLET CONSTANTS
	const WALLET_CONSTANTS = {};
	// SECURITY: Defining Immutable properties as constants
	Object.defineProperties(WALLET_CONSTANTS, {
		'resetAccountUrl': { value: '/cognito/reset-account', writable: false, configurable: false },
		'walletUrl': { value: '/wallet', writable: false, configurable: false },
		'firstFinancialPortfolioIdParams': { value: '?financialPortfolioId=', writable: false, configurable: false },
		'userAttributeUrl': { value: '/cognito/user-attribute', writable: false, configurable: false },
		'deleteAccountParam': { value: '&deleteAccount=', writable: false, configurable: false },
		'referenceNumberParam': { value: '&referenceNumber=', writable: false, configurable: false },
	});

	// Add wallet
	let chosenCurrency = '';
	let chosenCurrencyMW = '';
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

	// Primary Wallet Name of customer
	document.getElementById('primaryName').innerText = window.currentUser.name + ' ' + window.currentUser.family_name;
	document.getElementById('primaryWallet').setAttribute('data-target',currentUser.financialPortfolioId);

	document.getElementById('genericAddFnc').addEventListener("click",function(e){
		document.getElementById('addWallet').classList.remove('d-none');
		document.getElementById('whichWallet').classList.add('d-none');
		document.getElementById('genericAddFnc').classList.add('d-none');
		document.getElementById('manageWallets').classList.add('d-none');
		document.getElementsByClassName('Cards')[0].classList.add('important');
		document.body.classList.add('darker');
	});

	document.getElementById('cancelWallet').addEventListener("click",function(e){
		document.getElementById('addWallet').classList.add('d-none');
		document.getElementById('whichWallet').classList.remove('d-none');
		document.getElementById('genericAddFnc').classList.remove('d-none');
		document.getElementById('manageWallets').classList.remove('d-none');		
		document.getElementsByClassName('Cards')[0].classList.remove('important');
		document.body.classList.remove('darker');
	});

	document.getElementById('confirmWallet').addEventListener("click",function(e){
		document.getElementById('addWallet').classList.add('d-none');
		document.getElementById('whichWallet').classList.remove('d-none');
		document.getElementById('genericAddFnc').classList.remove('d-none');
		document.getElementById('manageWallets').classList.remove('d-none');		
		document.getElementsByClassName('Cards')[0].classList.remove('important');
		document.body.classList.remove('darker');
		// Add new wallet
		addNewWallet();
	});

	// Add new wallet
	function addNewWallet() {
		// Loading option
		document.getElementById('whichWallet').appendChild(buildLoadingWallet());
		
		// Set Param Val combination
		let values = {};
		values['currency'] = chosenCurrency;
		values['financialPortfolioId'] = parseInt(currentUser.financialPortfolioId);
		values['readOnly'] = false;
		values = JSON.stringify(values);

		jQuery.ajax({
			url: window._config.api.invokeUrl + WALLET_CONSTANTS.walletUrl,
			beforeSend: function(xhr){xhr.setRequestHeader("Authorization", window.authHeader);},
	        type: 'POST',
	        contentType: "application/json;charset=UTF-8",
	        data : values,
	        success: function(result) {
	        	// Generate the wallet object
	        	let wallet = {};
	        	wallet['currency'] = result['body-json'].currency;
	        	wallet['id'] = result['body-json'].id;
	        	if(isEmpty(result['body-json'].name)) {
	        		wallet['name'] = result['body-json'].name;
	        	}

	        	// Global Wallet is empty remove margin auto
	        	if(isEmpty(window.globalWallet)) {
	        		document.getElementById('primaryWallet').classList.remove('m-auto');
	        	}
	        	// Add the newly added wallet to global wallets
	        	window.globalWallet.push(wallet);

	        	// Remove Loader
	        	let removeLoader = document.getElementById('loading-wallet');
	        	removeLoader.parentNode.removeChild(removeLoader);
	        	// Load wallet
	        	let walletWrapper = buildWalletDiv(wallet);
	        	document.getElementById('whichWallet').appendChild(walletWrapper);

	        	// Initialize tooltip
	        	walletWrapper.tooltip({
					delay: { "show": 300, "hide": 100 }
			    });
	        },
	        error: function(thrownError) {
	        	if(isEmpty(thrownError) || isEmpty(thrownError.responseText)) {
					showNotification("Unexpected error occured while adding the wallet." ,window._constants.notification.error);
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
	      	      let a, b, i, val = this.value,  len = arr.length, upperVal, startsWithChar, regVal, populatedAtleastOnce = false;
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
	        /* Populated the data flag */
	        populatedAtleastOnce = true;
	      }

	      if(!populatedAtleastOnce) {
	      	/*create a DIV element for each matching element:*/
	          b = document.createElement("DIV");
	          b.classList = "noResultsDD";
	          b.innerText = 'No Results';
	          a.appendChild(b);
	      }  

	      /*append the DIV element as a child of the autocomplete container:*/
	      this.parentNode.appendChild(a);
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
		let chooseCrncyMWId = 'chosenCurrencyInpMWautocomplete-list';
		let id = this.parentElement.id;
		// Choose country DD update locale
		if(isEqual(id, chooseCrncyId)) {
			document.getElementById('chosenCurrency').innerText = this.lastChild.value;
			chosenCurrency = this.lastChild.value;
		} else if(isEqual(id, chooseCrncyMWId)) {
			document.getElementById('chosenCurrencyMW').innerText = this.lastChild.value;
			chosenCurrencyMW = this.lastChild.value;
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

	/*
	* Get Wallet
	*/
	getWallets();

	function getWallets() {
		let walletDiv = document.getElementById('whichWallet');
		walletDiv.appendChild(buildLoadingWallet());

		jQuery.ajax({
			url: window._config.api.invokeUrl + WALLET_CONSTANTS.walletUrl + WALLET_CONSTANTS.firstFinancialPortfolioIdParams + parseInt(currentUser.financialPortfolioId),
			beforeSend: function(xhr){xhr.setRequestHeader("Authorization", window.authHeader);},
	        type: 'GET',
	        contentType: "application/json;charset=UTF-8",
	        success: function(wallets) {
	        	window.globalWallet = wallets;
	        	window.walletCur = [];

	        	// Center the only div if it is the only wallet
	        	if(isEmpty(wallets)) {
	        		document.getElementById('primaryWallet').classList.add('m-auto');
	        	}

	        	// Collect wallet information
	        	for(let i = 0, l = wallets.length; i < l; i++) {
	        		let wallet = wallets[i];
	        		walletCur.push(wallet.currency);
	        	}

	        	/*
				*	Currency Dropdown Populate
				*/

				/*An array containing all the currency names in the world:*/
				let currencies = [];
				window.cToS = {};
				window.sToC = {};
				let curToSym = window.currencyNameToSymbol.currencyNameToSymbol;
				for(let i = 0, l = curToSym.length; i < l; i++) {
					cToS[curToSym[i].currency] = curToSym[i].symbol;
					sToC[curToSym[i].symbol] = curToSym[i].currency;
					/* Update the default currency in Settings */
					if(isEqual(currentUser.currency,curToSym[i].symbol)) {
						document.getElementById('chosenCurrency').innerText = curToSym[i].currency;
						document.getElementById('currentCurrencies').appendChild(dropdownItemsWithWallet(curToSym[i].currency));
						document.getElementById('walletCurrency').innerText = curToSym[i].currency;
						document.getElementById('currentCurrenciesMW').appendChild(dropdownItemsWithWallet(curToSym[i].currency));
					} else if(includesStr(walletCur,curToSym[i].currency)) {
						document.getElementById('currentCurrencies').appendChild(dropdownItemsWithWallet(curToSym[i].currency));
						document.getElementById('currentCurrenciesMW').appendChild(dropdownItemsWithWallet(curToSym[i].currency));
					} else {
						currencies.push(curToSym[i].currency);
					}
				}

				/*initiate the autocomplete function on the "chosenCurrencyInp" element, and pass along the countries array as possible autocomplete values:*/
				autocomplete(document.getElementById("chosenCurrencyInp"), currencies, "chooseCurrencyDD");

				/*initiate the autocomplete function on the "chosenCurrencyInp" element, and pass along the countries array as possible autocomplete values:*/
				autocomplete(document.getElementById("chosenCurrencyInpMW"), currencies, "chooseCurrencyDDMW");


	        	// Remove Loader
	        	let removeLoader = document.getElementById('loading-wallet');
	        	removeLoader.parentNode.removeChild(removeLoader);

	        	// Build wallet div
	        	let walletDiv = document.getElementById('whichWallet');
	        	let walletFrag = document.createDocumentFragment();
	        	for(let i = 0, l = wallets.length; i < l; i++) {
	        		let wallet = wallets[i];

	        		if(i < 2) {
	        			walletFrag.appendChild(buildWalletDiv(wallet));
	        		} else {
	        			walletFrag.appendChild(buildWalletDiv(wallet));
	        		}

	        	}
	        	walletDiv.appendChild(walletFrag);

	        	// Initialize Tooltip
	        	let shareWalletDivs = document.getElementsByClassName('share-wallet-wrapper');
	        	for(let i = 0, len = shareWalletDivs.length; i < len; i++) {
	        		let shareWallet = shareWalletDivs[i];
	        		$(shareWallet).tooltip({
						delay: { "show": 300, "hide": 100 }
				    });
	        	}
	        },
	        error: function(thrownError) {
	        	if(isEmpty(thrownError) || isEmpty(thrownError.responseText)) {
					showNotification("Unexpected error occured while fetching the wallets",window._constants.notification.error);
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

	// Wallet Div
	function buildWalletDiv(wallet) {

		let walletDiv = document.createElement('div');
		walletDiv.classList = 'col-4 col-md-4 col-lg-4 text-animation fadeIn suggested-card';
		walletDiv.setAttribute('data-target', wallet.id);
		
		let suggestedAnchor = document.createElement('a');
		suggestedAnchor.classList = 'suggested-anchor p-4';
		suggestedAnchor.href="#";

		let h2 = document.createElement('h2');
		h2.classList = 'suggested-heading';
		h2.innerText = isEmpty(wallet.name) ? window.currentUser.name + ' ' + window.currentUser.family_name : wallet.name;
		suggestedAnchor.appendChild(h2);

		let p = document.createElement('h3');
		p.innerText = wallet.currency;
		p.classList = 'currency-desc';
		suggestedAnchor.appendChild(p);
		walletDiv.appendChild(suggestedAnchor);

		// Load share svg
		walletDiv.appendChild(loadShareSvg());

		// Load Edit Icon
		walletDiv.appendChild(loadEditIcon());

		return walletDiv;
	}

	// Load Share Svg
	function loadShareSvg() {
		let shareWalletWrap = document.createElement('div');
		shareWalletWrap.setAttribute('data-toggle','tooltip');
		shareWalletWrap.setAttribute('data-placement','bottom');
		shareWalletWrap.setAttribute('data-original-title','Share Wallet');
		shareWalletWrap.classList = 'share-wallet-wrapper share-icon';

		let svgElement = document.createElementNS("http://www.w3.org/2000/svg", 'svg');
		svgElement.setAttribute('width','15');
		svgElement.setAttribute('height','24');
    	svgElement.setAttribute('viewBox','0 0 24 24');
    	
    	let pathElement1 = document.createElementNS("http://www.w3.org/2000/svg", 'path');
    	pathElement1.setAttribute('d','M 18 2 C 16.35499 2 15 3.3549904 15 5 C 15 5.1909529 15.021791 5.3771224 15.056641 5.5585938 L 7.921875 9.7207031 C 7.3985399 9.2778539 6.7320771 9 6 9 C 4.3549904 9 3 10.35499 3 12 C 3 13.64501 4.3549904 15 6 15 C 6.7320771 15 7.3985399 14.722146 7.921875 14.279297 L 15.056641 18.439453 C 15.021555 18.621514 15 18.808386 15 19 C 15 20.64501 16.35499 22 18 22 C 19.64501 22 21 20.64501 21 19 C 21 17.35499 19.64501 16 18 16 C 17.26748 16 16.601593 16.279328 16.078125 16.722656 L 8.9433594 12.558594 C 8.9782095 12.377122 9 12.190953 9 12 C 9 11.809047 8.9782095 11.622878 8.9433594 11.441406 L 16.078125 7.2792969 C 16.60146 7.7221461 17.267923 8 18 8 C 19.64501 8 21 6.6450096 21 5 C 21 3.3549904 19.64501 2 18 2 z M 18 4 C 18.564129 4 19 4.4358706 19 5 C 19 5.5641294 18.564129 6 18 6 C 17.435871 6 17 5.5641294 17 5 C 17 4.4358706 17.435871 4 18 4 z M 6 11 C 6.5641294 11 7 11.435871 7 12 C 7 12.564129 6.5641294 13 6 13 C 5.4358706 13 5 12.564129 5 12 C 5 11.435871 5.4358706 11 6 11 z M 18 18 C 18.564129 18 19 18.435871 19 19 C 19 19.564129 18.564129 20 18 20 C 17.435871 20 17 19.564129 17 19 C 17 18.435871 17.435871 18 18 18 z'); 
    	svgElement.appendChild(pathElement1);

    	shareWalletWrap.appendChild(svgElement);
    	
    	return shareWalletWrap;
	}

	// Load Edit Icon
	function loadEditIcon() {
		let editIconWrap = document.createElement('div');
		editIconWrap.classList = 'd-none edit-wallet';
		editIconWrap.setAttribute('data-toggle', 'tooltip');
		editIconWrap.setAttribute('data-placement', 'bottom');
		editIconWrap.setAttribute('title', 'Edit wallet');

	 	let svgElement = document.createElementNS("http://www.w3.org/2000/svg", 'svg');
		svgElement.setAttribute('width','24');
		svgElement.setAttribute('height','24');
    	svgElement.setAttribute('viewBox','0 0 24 24');
    	
    	let pathElement1 = document.createElementNS("http://www.w3.org/2000/svg", 'path');
    	pathElement1.setAttribute('d','M14.06 9.02l.92.92L5.92 19H5v-.92l9.06-9.06M17.66 3c-.25 0-.51.1-.7.29l-1.83 1.83 3.75 3.75 1.83-1.83c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.2-.2-.45-.29-.71-.29zm-3.6 3.19L3 17.25V21h3.75L17.81 9.94l-3.75-3.75z'); 
    	svgElement.appendChild(pathElement1);
    	editIconWrap.appendChild(svgElement);

		return editIconWrap;
	}

	// Wallet Div
	function buildLoadingWallet() {
		let walletDiv = document.createElement('div');
		walletDiv.id = 'loading-wallet';				
		walletDiv.classList = 'col-4 col-md-4 col-lg-4 text-animation fadeIn suggested-card';
		
		let suggestedAnchor = document.createElement('div');
		suggestedAnchor.classList = 'suggested-anchor p-4';

		let wSeventy = document.createElement('div');
		wSeventy.classList = 'w-70 animationCard';
		suggestedAnchor.appendChild(wSeventy);

		let wFifty = document.createElement('div');
		wFifty.classList = 'w-50 animationCard';
		suggestedAnchor.appendChild(wFifty);

		let wThrity = document.createElement('p');
		wThrity.classList = 'w-30 animationCard';
		suggestedAnchor.appendChild(wThrity);
		walletDiv.appendChild(suggestedAnchor);

		let wTen = document.createElement('p');
		wTen.classList = 'w-10 animationCard';
		suggestedAnchor.appendChild(wTen);
		walletDiv.appendChild(suggestedAnchor);

		return walletDiv;
	}

	// Suggested Cards
	$( "body" ).on( "click", ".suggested-anchor" ,function() {
		let chosenWalletId = this.parentNode.getAttribute('data-target');

		// If Manage Wallet Button is enabled then 
		if(window.manageWalletsTriggered) {
			editManageWallets(chosenWalletId);
			return;
		}

		window.currentUser.walletId = chosenWalletId;

		if(isEqual(window.currentUser.financialPortfolioId, window.currentUser.walletId)) {
			window.currentUser.walletCurrency = window.currentUser.currency;
		} else {
			// Calculate currency
			let wallets = window.globalWallet;
			for(let i = 0, len = window.globalWallet.length; i < len; i++) {
				let currentWallet = window.globalWallet[i];
				if(isEqual(window.currentUser.walletId, currentWallet.id)) {
					window.currentUser.walletCurrency = cToS[currentWallet.currency];
				}
			}
		}

		localStorage.setItem("currentUserSI", JSON.stringify(window.currentUser));
		// Go to Home Page
		window.location.href = '/';
	});

	/**
	*
	* Modify Wallet
	*
	**/

	// Manage Wallets
	document.getElementById('manageWallets').addEventListener("click",function(e){
		document.getElementById('doneManage').classList.remove('d-none');
		$('.edit-wallet').removeClass('d-none');
		$('.share-icon').addClass('d-none');
		document.getElementById('starredWallet').classList.add('d-none');
		this.classList.add('d-none');
		window.manageWalletsTriggered = true;
	});

	// Done Manage
	document.getElementById('doneManage').addEventListener("click",function(e){
		doneManage();
		this.classList.add('d-none');
		window.manageWalletsTriggered = false;
	});

	// Done Manage
	function doneManage() {
		document.getElementById('manageWallets').classList.remove('d-none');
		$('.edit-wallet').addClass('d-none');
		$('.share-icon').removeClass('d-none');
		document.getElementById('starredWallet').classList.remove('d-none');
	}

	$( "body" ).on( "click", ".edit-wallet" ,function() {
		let dataTarget = this.parentNode.getAttribute('data-target');
		if(window.manageWalletsTriggered) {
			editManageWallets(dataTarget);
		}
	});

	
	// Edit Manage Wallets
	function editManageWallets(dataTarget) {
		// Delete Functionality associate walletId
		chosenWallet = dataTarget;

		document.getElementById('manageWallet').classList.remove('d-none');
		document.getElementById('whichWallet').classList.add('d-none');
		document.getElementById('genericAddFnc').classList.add('d-none');
		document.getElementById('doneManage').classList.add('d-none');
		document.body.classList.add('darker');

		// Update data target
		document.getElementById('manageWallet').setAttribute('data-target', dataTarget);
		
		// Collect wallet information
		let currentWallet = {};
		if(isEqual(window.currentUser.financialPortfolioId, dataTarget)) {
			currentWallet.id = window.currentUser.financialPortfolioId;
			currentWallet.currency = window.currentUser.currency;
			// If primary wallet then hide the name feature
			document.getElementsByClassName('manageNameWrapper')[0].classList.add('d-none');
			/*
			*	Currency Dropdown Populate (EDIT)
			*/
			document.getElementById('chosenCurrencyMW').innerText = sToC[currentWallet.currency];
		} else {
			// If others then show name field
			document.getElementsByClassName('manageNameWrapper')[0].classList.remove('d-none');
			// Show delete wallet option only for non primary wallets
			document.getElementById('deleteWallet').classList.remove('d-none');
			for(let i = 0, l = window.globalWallet.length; i < l; i++) {
	    		let wallet = window.globalWallet[i];
	    		if(isEqual(dataTarget, wallet.id)) {
	    			currentWallet = wallet;
	    			break;
	    		}
	    	}

	    	// Write the manage wallet name if empty shw the current user name
	    	let manageWalletName = document.getElementById('manageWalletName');
	    	manageWalletName.value = isEmpty(currentWallet.name) ? window.currentUser.name + ' ' + window.currentUser.family_name : currentWallet.name; 	
	    	manageWalletName.focus();

	    	/*
			*	Currency Dropdown Populate (EDIT)
			*/
			document.getElementById('chosenCurrencyMW').innerText = currentWallet.currency;
		}

	}

	// Modify Wallet
	document.getElementById('modifyWallet').addEventListener("click",function(e){
		showAllWallets();
		if(isEqual(window.currentUser.financialPortfolioId, chosenWallet)) {
			updateCurrencyForDefaultWallet();
		} else {
			patchWallets();
		}
	});

	// Cancel modification
	document.getElementById('cancelModification').addEventListener("click",function(e){
		showAllWallets();
	});

	// Show Which Wallets
	function showAllWallets() {
		document.getElementById('manageWallet').classList.add('d-none');
		document.getElementById('whichWallet').classList.remove('d-none');
		document.getElementById('genericAddFnc').classList.remove('d-none');
		document.getElementById('deleteWallet').classList.add('d-none');
		document.getElementById('doneManage').classList.remove('d-none');
		document.body.classList.remove('darker');
	}

	// On click drop down btn of country search
	$("#chosenCurrencyDropdownMW").on("shown.bs.dropdown", function(event){
		let currencyInp = document.getElementById('chosenCurrencyInpMW');
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
	$("#chosenCurrencyDropdownMW").on("hidden.bs.dropdown", function(event){
		// Input clear value for the country search bar 
		document.getElementById('chosenCurrencyInpMW').value = '';
		// Close all list
		closeAllDDLists(this);
	});


	/**
	*
	* Delete Wallet
	*
	**/

	// Define Cognito User Pool adn Pool data
	let poolData = {
        UserPoolId: window._config.cognito.userPoolId,
        ClientId: window._config.cognito.userPoolClientId
    };

    let userPool;

    if (!(window._config.cognito.userPoolId &&
          window._config.cognito.userPoolClientId &&
          window._config.cognito.region)) {
    	showNotification('There is an error configuring the user access. Please contact support!',window._constants.notification.error);
        return;
    }

	userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

	// Reset Account
	document.getElementById('deleteWallet').addEventListener("click",function(e){
		// If the manage wallets is not triggered then do not trigger popup
		if(!window.manageWalletsTriggered) {
			return;
		}

		let cognitoUser = userPool.getCurrentUser();
		Swal.fire({
            title: 'Delete wallet',
            html: resetBBAccount(),
            inputAttributes: {
                autocapitalize: 'on'
            },
            icon: 'info',
            showCancelButton: true,
            showCloseButton: true,
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'No, keep it',
            confirmButtonClass: "btn btn-info",
            cancelButtonClass: "btn btn-secondary",
            buttonsStyling: false,
            showLoaderOnConfirm: true,
  			preConfirm: () => {
  				return new Promise(function(resolve) {
  					let confPasswordUA = document.getElementById('oldPasswordRP');
  					// Authentication Details
			        let values = {};
			        values.username = currentUser.email;
			        values.password = confPasswordUA.value;
			        values.checkPassword = true;

	  				// Authenticate Before cahnging password
	  				$.ajax({
				          type: 'POST',
				          url: PROFILE_CONSTANTS.signinUrl,
				          dataType: 'json',
				          contentType: "application/json;charset=UTF-8",
				          data : JSON.stringify(values);,
				          success: function(result) {
			            	// Hide loading 
			                Swal.hideLoading();
			                // Resolve the promise
			                resolve();

			              },
				  	      error: function(err) {
				            	// Hide loading 
				               	Swal.hideLoading();
				            	// Show error message
				                Swal.showValidationMessage(
						          `${err.message}`
						        );
						        // Change Focus to password field
							    confPasswordUA.focus();
				            }
					});
  				});
  			},
  			allowOutsideClick: () => !Swal.isLoading(),
  			closeOnClickOutside: () => !Swal.isLoading()
        }).then(function(result) {
        	// Hide the validation message if present
    		Swal.resetValidationMessage()
        	// If the Reset Button is pressed
        	if (result.value) {
				navigateAwayFromManage();

				// Find Item with data target attribute
				let chosenDiv = $('#whichWallet').find('[data-target="' + chosenWallet + '"]');
				chosenDiv.addClass('d-none');

        	 	jQuery.ajax({
					url: window._config.api.invokeUrl + WALLET_CONSTANTS.resetAccountUrl + WALLET_CONSTANTS.firstFinancialPortfolioIdParams + chosenWallet  + WALLET_CONSTANTS.deleteAccountParam + false + WALLET_CONSTANTS.referenceNumberParam + currentUser.financialPortfolioId,
					beforeSend: function(xhr){xhr.setRequestHeader("Authorization", authHeader);},
			        type: 'DELETE',
			        success: function(result) {
			        	chosenDiv.remove();
			        },
			        error: function (thrownError) {
				    	manageErrors(thrownError, "There was an error while deleteing your wallet. Please try again later!",'');
				    	chosenDiv.removeClass('d-none');
		            }
	        	});
        	}

        });

		// Disable Change Password button 
        let resetBBBtn = document.getElementsByClassName('swal2-confirm')[0];
        if(!resetBBBtn.disabled) {
            resetBBBtn.setAttribute('disabled','disabled');
        }

        // Change Focus to Confirm Password
        document.getElementById('oldPasswordRP').focus();            
	});

	// Navigate away from Manage
	function navigateAwayFromManage() {
		// Show all Wallets
		showAllWallets();
		// Click on the done button
		document.getElementById('doneManage').classList.add('d-none');
		doneManage();
	}

	// Reset BB Account
	function resetBBAccount() {
		let resetPassFrag = document.createDocumentFragment();

		// Warning Text
		let warnDiv = document.createElement('div');
		warnDiv.classList = 'noselect text-left mb-3 fs-90';
		warnDiv.innerHTML = 'Do you want to delete your wallet associated with <strong>' + currentUser.email + '</strong> and <strong>delete all entries</strong> associated with this wallet from Blitz Budget?';
		resetPassFrag.appendChild(warnDiv);

		// UL tag
		let ulWarn = document.createElement('ul');
		ulWarn.classList = 'noselect text-left mb-3 fs-90';

		let liOne = document.createElement('li');
		liOne.innerText = 'all transactions from this wallet will be deleted';
		ulWarn.appendChild(liOne);

		let liTwo = document.createElement('li');
		liTwo.innerText = 'all the budgets from this wallet will be deleted';
		ulWarn.appendChild(liTwo);

		let liThree = document.createElement('li');
		liThree.innerText = 'all goals within this wallet will be deleted';
		ulWarn.appendChild(liThree);

		let liFour = document.createElement('li');
		liFour.innerText = 'all financial accounts associated with this wallet will be deleted';
		ulWarn.appendChild(liFour);

		let liSix = document.createElement('li');
		liSix.innerText = 'all investments associated with this wallet will be deleted';
		ulWarn.appendChild(liSix);
		resetPassFrag.appendChild(ulWarn);

		// Subscription
		let subsText = document.createElement('div');
		subsText.classList = 'noselect text-left mb-3 fs-90';
		subsText.innerText = 'Premium subscription will remain intact after the reset.';
		resetPassFrag.appendChild(subsText);

		// Old Password
		let oldPassWrapper = document.createElement('div');
		oldPassWrapper.setAttribute('data-gramm_editor',"false");
		oldPassWrapper.classList = 'oldPassWrapper text-left';
		
		let oldPassLabel = document.createElement('label');
		oldPassLabel.innerText = 'Confirm Password';
		oldPassWrapper.appendChild(oldPassLabel);


		let dropdownGroupOP = document.createElement('div');
		dropdownGroupOP.classList = 'btn-group d-md-block d-block';
		
		let oldPassInput = document.createElement('input');
		oldPassInput.id='oldPasswordRP';
		oldPassInput.setAttribute('type','password');
		oldPassInput.setAttribute('autocapitalize','off');
		oldPassInput.setAttribute('spellcheck','false');
		oldPassInput.setAttribute('autocorrect','off');
		dropdownGroupOP.appendChild(oldPassInput);

		let dropdownTriggerOP = document.createElement('button');
		dropdownTriggerOP.classList = 'changeDpt btn btn-info';
		dropdownTriggerOP.setAttribute('data-toggle' , 'dropdown');
		dropdownTriggerOP.setAttribute('aria-haspopup' , 'true');
		dropdownTriggerOP.setAttribute('aria-expanded' , 'false');

		let miEye = document.createElement('i');
		miEye.classList = 'material-icons';
		miEye.innerText = 'remove_red_eye';
		dropdownTriggerOP.appendChild(miEye);
		dropdownGroupOP.appendChild(dropdownTriggerOP);
		oldPassWrapper.appendChild(dropdownGroupOP);

		// Error Text
		let errorCPOld = document.createElement('div');
		errorCPOld.id = 'cpErrorDispOldRA';
		errorCPOld.classList = 'text-danger text-left small mb-2 noselect';
		oldPassWrapper.appendChild(errorCPOld);		
		resetPassFrag.appendChild(oldPassWrapper);

		return resetPassFrag;
	}

	// Change Input to Text
	$(document).on('mouseover', ".changeDpt", function() {		
		let firstChild = this.parentElement.firstChild;
		firstChild.setAttribute('type', 'text');
	});

	// Change it back to password 
	$(document).on('mouseout', ".changeDpt", function() {
		let firstChild = this.parentElement.firstChild;
		firstChild.setAttribute('type', 'password');
	});

	// New Password Key Up listener For Reset Password
	$(document).on('keyup', "#oldPasswordRP", function(e) {
	
		let resetAccountBtn = document.getElementsByClassName('swal2-confirm')[0];
		let errorDispRA = document.getElementById('cpErrorDispOldRA');
		let passwordEnt = this.value;

		if(isEmpty(passwordEnt) || passwordEnt.length < 8) {
			resetAccountBtn.setAttribute('disabled','disabled');			
			return;
		}

		errorDispRA.innerText = '';
		resetAccountBtn.removeAttribute('disabled');

		let keyCode = e.keyCode || e.which;
		if (keyCode === 13) { 
			document.activeElement.blur();
		    e.preventDefault();
		    e.stopPropagation();
		    // Click the confirm button of SWAL
		    resetAccountBtn.click();
		    return false;
		}

	});

	// On focus out Listener for Reset password
	$(document).on('focusout', "#oldPasswordRP", function() {
	
		let resetAccountBtn = document.getElementsByClassName('swal2-confirm')[0];
		let errorDispRA = document.getElementById('cpErrorDispOldRA');
		let passwordEnt = this.value;

		if(isEmpty(passwordEnt) || passwordEnt.length < 8) {
			errorDispRA.innerText = 'The confirm password field should have a minimum length of 8 characters.';
			resetAccountBtn.setAttribute('disabled','disabled');
			return;
		}

		errorDispRA.innerText = '';

	});


	/**
	*
	* Patch Wallets
	*
	**/

	function patchWallets() {
		// Set Param Val combination
		let values = {};
		values['name'] = document.getElementById('manageWalletName').value;
		if(isNotEmpty(chosenCurrencyMW)) {
			values['currency'] = chosenCurrencyMW;
		}
		values['walletId'] = chosenWallet;
		values['financialPortfolioId'] = parseInt(currentUser.financialPortfolioId);


		updateRelevantTextInCard(values);
		// Stringify JSON
		values = JSON.stringify(values);

		jQuery.ajax({
			url: window._config.api.invokeUrl + WALLET_CONSTANTS.walletUrl,
			beforeSend: function(xhr){xhr.setRequestHeader("Authorization", window.authHeader);},
	        type: 'PATCH',
	        contentType: "application/json;charset=UTF-8",
	        data : values,
	        error: function(thrownError) {
	        	if(isEmpty(thrownError) || isEmpty(thrownError.responseText)) {
					showNotification("Unexpected error occured while updating the wallet." ,window._constants.notification.error);
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

	// Update Relevant
	function updateRelevantTextInCard(values) {
		// Find Item with data target attribute
		let chosenDiv = $('#whichWallet').find('[data-target="' + chosenWallet + '"]');
		if(isEmpty(values.name)) {
			// Change name
			chosenDiv.find(".suggested-heading").text(values.name);
		}

		if(isEmpty(values.currency)) {
			// Change Currency
			chosenDiv.find(".currency-desc").text(values.currency);
		} 
	}

	/*
	* Default Wallet
	*/
	function updateCurrencyForDefaultWallet() {

		// Set Param Val combination
		let values = {};
		if(isNotEmpty(chosenCurrencyMW)) {
			values['currency'] = chosenCurrencyMW;
		}
		values['userName'] = window.currentUser.email;

		// Update relevant text in card
		updateRelevantTextInCard(values);

		values = JSON.stringify(values);

	    jQuery.ajax({
			url: window._config.api.invokeUrl + WALLET_CONSTANTS.userAttributeUrl,
			beforeSend: function(xhr){xhr.setRequestHeader("Authorization", window.authHeader);},
	        type: 'POST',
	        contentType: "application/json;charset=UTF-8",
	        data : values,
	        error: function(thrownError) {
	        	if(isEmpty(thrownError) || isEmpty(thrownError.responseText)) {
					showNotification("Unexpected error occured while updating the wallet." ,window._constants.notification.error);
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

}(jQuery));	