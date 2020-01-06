"use strict";

(function scopeWrapper($) {
	// Custom Javascript for dashboard
	const SETTINGS_CONSTANTS = {};

	// SECURITY: Defining Immutable properties as constants
	Object.defineProperties(SETTINGS_CONSTANTS, {
		'devicesUrl': { value: '/devices', writable: false, configurable: false },
		'firstUserNameParam': { value: '?userName=', writable: false, configurable: false }
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
       	 	let responseError = JSON.parse(thrownError.responseText);
       	 	if(isNotEmpty(responseError) && isNotEmpty(responseError.error) && responseError.error.includes("Unauthorized")){
        		er.sessionExpiredSwal(ajaxData);
        	} else if (isNotEmpty(thrownError.errorType)) {
        		showNotification("There was an error while retrieving all the registered devices. Please try again later!",'top','center','danger');
        	} else {
        		showNotification(thrownError.message,'top','center','danger');
        	}
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

	}

	/*An array containing all the country names in the world:*/
	let countries = ["Afghanistan","Albania","Algeria","Andorra","Angola","Anguilla","Antigua & Barbuda","Argentina","Armenia","Aruba","Australia","Austria","Azerbaijan","Bahamas","Bahrain","Bangladesh","Barbados","Belarus","Belgium","Belize","Benin","Bermuda","Bhutan","Bolivia","Bosnia & Herzegovina","Botswana","Brazil","British Virgin Islands","Brunei","Bulgaria","Burkina Faso","Burundi","Cambodia","Cameroon","Canada","Cape Verde","Cayman Islands","Central Arfrican Republic","Chad","Chile","China","Colombia","Congo","Cook Islands","Costa Rica","Cote D Ivoire","Croatia","Cuba","Curacao","Cyprus","Czech Republic","Denmark","Djibouti","Dominica","Dominican Republic","Ecuador","Egypt","El Salvador","Equatorial Guinea","Eritrea","Estonia","Ethiopia","Falkland Islands","Faroe Islands","Fiji","Finland","France","French Polynesia","French West Indies","Gabon","Gambia","Georgia","Germany","Ghana","Gibraltar","Greece","Greenland","Grenada","Guam","Guatemala","Guernsey","Guinea","Guinea Bissau","Guyana","Haiti","Honduras","Hong Kong","Hungary","Iceland","India","Indonesia","Iran","Iraq","Ireland","Isle of Man","Israel","Italy","Jamaica","Japan","Jersey","Jordan","Kazakhstan","Kenya","Kiribati","Kosovo","Kuwait","Kyrgyzstan","Laos","Latvia","Lebanon","Lesotho","Liberia","Libya","Liechtenstein","Lithuania","Luxembourg","Macau","Macedonia","Madagascar","Malawi","Malaysia","Maldives","Mali","Malta","Marshall Islands","Mauritania","Mauritius","Mexico","Micronesia","Moldova","Monaco","Mongolia","Montenegro","Montserrat","Morocco","Mozambique","Myanmar","Namibia","Nauro","Nepal","Netherlands","Netherlands Antilles","New Caledonia","New Zealand","Nicaragua","Niger","Nigeria","North Korea","Norway","Oman","Pakistan","Palau","Palestine","Panama","Papua New Guinea","Paraguay","Peru","Philippines","Poland","Portugal","Puerto Rico","Qatar","Reunion","Romania","Russia","Rwanda","Saint Pierre & Miquelon","Samoa","San Marino","Sao Tome and Principe","Saudi Arabia","Senegal","Serbia","Seychelles","Sierra Leone","Singapore","Slovakia","Slovenia","Solomon Islands","Somalia","South Africa","South Korea","South Sudan","Spain","Sri Lanka","St Kitts & Nevis","St Lucia","St Vincent","Sudan","Suriname","Swaziland","Sweden","Switzerland","Syria","Taiwan","Tajikistan","Tanzania","Thailand","Timor L'Este","Togo","Tonga","Trinidad & Tobago","Tunisia","Turkey","Turkmenistan","Turks & Caicos","Tuvalu","Uganda","Ukraine","United Arab Emirates","United Kingdom","United States of America","Uruguay","Uzbekistan","Vanuatu","Vatican City","Venezuela","Vietnam","Virgin Islands (US)","Yemen","Zambia","Zimbabwe"];

	/*initiate the autocomplete function on the "chooseCountryInp" element, and pass along the countries array as possible autocomplete values:*/
	autocomplete(document.getElementById("chooseCountryInp"), countries);

	// On click drop down btn of country search
	$("#chosenCountryDropdown").on("shown.bs.dropdown", function(event){
		// Input change focus to the country search bar 
		document.getElementById('chooseCountryInp').focus();
	});

}(jQuery));