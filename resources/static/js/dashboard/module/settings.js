"use strict";
(function scopeWrapper($) {
    // Custom Javascript for dashboard
    const SETTINGS_CONSTANTS = {};
    // Build export file format object
    let exportFileFormatObj = {};
    exportFileFormatObj['XLS'] = 'Excel (XLS)';
    //exportFileFormatObj['PDF'] = 'Adobe (PDF)';
    exportFileFormatObj['DOC'] = 'Word Document (DOC)';
    exportFileFormatObj['CSV'] = 'Comma Separated Values (CSV)';
    Object.seal(exportFileFormatObj);
    Object.freeze(exportFileFormatObj);

    // Let Language Options
    let languageOptions = {};
    languageOptions["en"] = "English (US)";
    languageOptions["es"] = "Español (ES)";
    languageOptions["fr"] = "Français (FR)";
    languageOptions["ja"] = "にほんご (JA)";
    languageOptions["pt"] = "Portugês (PT)";
    languageOptions["ru"] = "русский (RU)";
    languageOptions["zh"] = "中文 (ZH)";
    Object.seal(languageOptions);
    Object.freeze(languageOptions);

    // SECURITY: Defining Immutable properties as constants
    Object.defineProperties(SETTINGS_CONSTANTS, {
        'devicesUrl': {
            value: '/profile/devices',
            writable: false,
            configurable: false
        },
        'firstUserNameParam': {
            value: '?userName=',
            writable: false,
            configurable: false
        },
        'userAttributeUrl': {
            value: '/profile/user-attribute',
            writable: false,
            configurable: false
        },
        'walletUrl': {
            value: '/wallet',
            writable: false,
            configurable: false
        }
    });

    /**
     * START loading the page
     *
     */
    let currentPageInCookie = er.getCookie('currentPage');
    if (isEqual(currentPageInCookie, 'settingsPage') || isEqual(currentPageInCookie, 'settingsPgDD')) {
        if (isEqual(window.location.href, window._config.app.invokeUrl)) {
            populateCurrentPage('settingsPage');
        }
    }

    let settingsPage = document.getElementById('settingsPage');
    if (isNotEmpty(settingsPage)) {
        settingsPage.addEventListener("click", function (e) {
            populateCurrentPage('settingsPage');
        });
    }

    let settingsPgDD = document.getElementById('settingsPgDD');
    if (isNotEmpty(settingsPgDD)) {
        settingsPgDD.addEventListener("click", function (e) {
            populateCurrentPage('settingsPage');
        });
    }

    function populateCurrentPage(page) {
        er.refreshCookiePageExpiry(page);
        er.fetchCurrentPage('/settings', function (data) {
            // Load the new HTML
            $('#mutableDashboard').html(data);
            // Translate current Page
            translatePage(getLanguage());
            /**
             * Get Overview
             **/
            populateSettings();
            // Set Current Page
            let currentPage = document.getElementById('currentPage');
            currentPage.setAttribute('data-i18n', 'settings.page.title');
            currentPage.textContent = 'Settings';
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
            let a, b, i, val = this.value,
                len = arr.length,
                upperVal, startsWithChar, regVal, populatedAtleastOnce = false;
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
                if (!val) {
                    autoFilEl = true;
                } else {
                    /* check if the starting characters match */
                    startsWithChar = arr[i].substr(0, val.length).toUpperCase() == upperVal;
                    /* build a regex with the value entered */
                    regVal = new RegExp(upperVal, "g");
                    /*check if the item starts with the same letters as the text field value:*/
                    if (startsWithChar || includesStr(arr[i].toUpperCase(), upperVal)) {
                        autoFilEl = true;
                    }
                }

                // Confinue with the iteration
                if (!autoFilEl) {
                    continue;
                }

                /*create a DIV element for each matching element:*/
                b = document.createElement("DIV");
                b.classList.add("dropdown-item");
                /*make the matching letters bold:*/
                if (startsWithChar) {
                    b.innerHTML = "<strong>" + arr[i].substr(0, val.length) + "</strong>" + arr[i].substr(val.length);
                } else if (!val) {
                    b.innerHTML = arr[i];
                } else {
                    let startPos = regVal.exec(arr[i].toUpperCase()).index;
                    let startPos2 = startPos + val.length;
                    b.innerHTML = arr[i].substr(0, startPos) + "<strong>" + arr[i].substr(startPos, val.length) + "</strong>" + arr[i].substr(startPos2);
                }
                /*insert a input field that will hold the current array item's value:*/
                b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
                /*execute a function when someone clicks on the item value (DIV element):*/
                b.addEventListener("click", function (e) {
                    /*insert the value for the autocomplete text field:*/
                    if (isNotEmpty(inp)) inp.value = this.getElementsByTagName("input")[0].value;
                    updateRelevantFields(this);
                    /*close the list of autocompleted values,
                    (or any other open lists of autocompleted values:*/
                    closeAllLists();
                });
                a.appendChild(b);
                /* Populated the data flag */
                populatedAtleastOnce = true;
            }

            if (!populatedAtleastOnce) {
                /*create a DIV element for each matching element:*/
                b = document.createElement("DIV");
                b.classList = "noResultsDD";
                b.textContent = 'No Results';
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
            if (ddItemac && scrollToEl && ddItemac.offset() && scrollToEl.offset()) {
                scrollToEl.scrollTop(ddItemac.offset().top - scrollToEl.offset().top + scrollToEl.scrollTop());
            }
        }
    }

    // Close all lists within element
    function closeAllDDLists(elmnt) {
        /*close all autocomplete lists in the document,
        except the one passed as an argument:*/
        let x = elmnt.getElementsByClassName("autocomplete-items");
        for (let i = 0,
                len = x.length; i < len; i++) {
            if (elmnt != x[i]) {
                x[i].parentNode.removeChild(x[i]);
            }
        }
    }

    // Updates relevant fields to the concerned entity
    function updateRelevantFields(element) {
        let chooseCtyId = 'chosenCountryInpautocomplete-list';
        let chooseCrncyId = 'chosenCurrencyInpautocomplete-list';
        let id = element.parentElement.id;
        // Choose country DD update locale
        if (isEqual(id, chooseCtyId)) {
            let valObj = {
                parentElId: "currentCountries",
                valueChosen: element.lastElementChild.value
            };
            updateUserAttr('locale', currentUser.locale.substring(0, 3) + window.lToC[element.lastElementChild.value], element, valObj);
        } else if (isEqual(id, chooseCrncyId)) {
            let valObj = {
                parentElId: "currentCurrencies",
                valueChosen: element.lastElementChild.value
            };
            patchWallets(element.lastElementChild.value, element, valObj);
        }
    }

    /**
     *
     * Patch Wallets
     *
     **/
    function patchWallets(chosenCurrencyMW, event, valObj) {
        let oldValInTe = '';
        let inpId = '';
        // Fetch the display btn for auto complete
        inpId = event.parentElement.id.replace('Inpautocomplete-list', '');
        oldValInTe = document.getElementById(inpId).textContent;
        // Update the button to new value
        document.getElementById(inpId).textContent = event.lastElementChild.value;
        // Set Param Val combination
        let values = {};
        values['currency'] = chosenCurrencyMW;
        values['walletId'] = window.currentUser.walletId;
        values['userId'] = window.currentUser.financialPortfolioId;

        jQuery.ajax({
            url: window._config.api.invokeUrl + SETTINGS_CONSTANTS.walletUrl,
            beforeSend: function (xhr) {
                xhr.setRequestHeader("Authorization", window.authHeader);
            },
            type: 'PATCH',
            contentType: "application/json;charset=UTF-8",
            data: JSON.stringify(values),
            success: function (result) {
                // After a successful updation of parameters to cache
                window.currentUser.walletCurrency = window.cToS[chosenCurrencyMW];
                // We save the item in the localStorage.
                localStorage.setItem("currentUserSI", JSON.stringify(currentUser));
                // Input search element
                let inpBtnSrch = event.parentElement.id.replace('autocomplete-list', '');
                let inpSearchEl = document.getElementById(inpBtnSrch);
                let itemWithWallet = document.getElementById(valObj.parentElId);
                // First Child Input value
                let oldValText = itemWithWallet.firstElementChild.lastElementChild.value;
                // Replace HTML with Empty
                while (itemWithWallet.firstChild) {
                    itemWithWallet.removeChild(itemWithWallet.firstChild);
                }
                // Set the dropdown item current selection
                itemWithWallet.appendChild(dropdownItemsWithWallet(event.lastElementChild.value));
                // Set current Curreny preference
                // For upadting the javascript cache for currency
                currentCurrencyPreference = window.currentUser.walletCurrency;
                // Remove from List
                const index = window.currencies.indexOf(valObj.valueChosen);
                if (index > -1) {
                    window.currencies.splice(index, 1);
                }
                // To be used for Auto complete
                window.currencies.push(oldValText);
                /*initiate the autocomplete function on the "chosenCurrencyInp" element, and pass along the countries array as possible autocomplete values:*/
                autocomplete(inpSearchEl, window.currencies, "chooseCurrencyDD");
            },
            error: function (thrownError) {
                // Change button text to the old Inp value
                document.getElementById(inpId).textContent = oldValInTe;
                manageErrors(thrownError, "There was an error while updating. Please try again later!");
            }
        });
    }

    // Update user attributes
    function updateUserAttr(param, paramVal, event, valObj) {
        let oldValInTe = '';
        let inpId = '';
        // Current countries and current currencies then do
        if (isEqual(param, 'locale') && isNotEmpty(valObj)) {
            // Fetch the display btn for auto complete
            inpId = event.parentElement.id.replace('Inpautocomplete-list', '');
            oldValInTe = document.getElementById(inpId).textContent;
            // Update the button to new value
            document.getElementById(inpId).textContent = event.lastElementChild.value;
        } else if (isEqual(param, 'locale') && isEmpty(valObj)) {
            // Fetch the display btn for auto complete (Update Language)
            inpId = document.getElementById('currentLanguageShown');
            oldValInTe = document.getElementById(inpId).textContent;
            // Update the button to new value
            document.getElementById(inpId).textContent = event.lastElementChild.value;
        } else {
            // Fetch the display btn from drop down
            inpId = event.parentElement.id.replace('DD', '');
            oldValInTe = document.getElementById(inpId).textContent;

            if (isEqual(param, 'exportFileFormat')) {
                // Update the button to new value
                document.getElementById(inpId).textContent = exportFileFormatObj[event.lastElementChild.value];
            } else {
                // Update the button to new value
                document.getElementById(inpId).textContent = event.lastElementChild.value;
            }
        }

        // Set Param Val combination
        let values = {};
        values[param] = paramVal;
        values['userName'] = currentUser.email;

        // Ajax Requests on Error
        let ajaxData = {};
        ajaxData.isAjaxReq = true;
        ajaxData.type = 'POST';
        ajaxData.url = _config.api.invokeUrl + SETTINGS_CONSTANTS.userAttributeUrl;
        ajaxData.contentType = "application/json;charset=UTF-8";
        ajaxData.data = JSON.stringify(values);
        ajaxData.onSuccess = function (result) {
            // After a successful updation of parameters to cache
            currentUser[param] = paramVal;
            // We save the item in the localStorage.
            localStorage.setItem("currentUserSI", JSON.stringify(currentUser));
            // Current countries and current currencies then do
            if (isEqual(param, 'locale') && isNotEmpty(valObj)) {
                // Input search element
                let inpBtnSrch = event.parentElement.id.replace('autocomplete-list', '');
                let inpSearchEl = document.getElementById(inpBtnSrch);
                let itemWithWallet = document.getElementById(valObj.parentElId);
                // First Child Input value
                let oldValText = itemWithWallet.firstElementChild.lastElementChild.value;
                // Replace HTML with Empty
                while (itemWithWallet.firstChild) {
                    itemWithWallet.removeChild(itemWithWallet.firstChild);
                }
                // Set the dropdown item current selection
                itemWithWallet.appendChild(dropdownItemsWithWallet(event.lastElementChild.value));
                // To be used for Auto complete
                window.countries.push(oldValText);
                // Remove from List
                const index = window.countries.indexOf(valObj.valueChosen);
                if (index > -1) {
                    window.countries.splice(index, 1);
                }
                /*initiate the autocomplete function on the "chosenCountryInp" element, and pass along the countries array as possible autocomplete values:*/
                autocomplete(inpSearchEl, window.countries, "chooseCountryDD");

            }
        }
        ajaxData.onFailure = function (thrownError) {
            // Change button text to the old Inp value
            document.getElementById(inpId).textContent = oldValInTe;
            manageErrors(thrownError, "There was an error while updating. Please try again later!", ajaxData);
        }
        jQuery.ajax({
            url: ajaxData.url,
            beforeSend: function (xhr) {
                xhr.setRequestHeader("Authorization", authHeader);
            },
            type: ajaxData.type,
            contentType: ajaxData.contentType,
            data: ajaxData.data,
            success: ajaxData.onSuccess,
            error: ajaxData.onFailure
        });
    }

    /*
     * Export File Format
     */
    $('body').on("click", "#chosenExportFileFormatDD .dropdown-item", function (event) {
        let valObj = {
            parentElId: "exportFileFormat",
            valueChosen: this.lastElementChild.value
        };
        updateUserAttr('exportFileFormat', this.lastElementChild.value, this, valObj);
    });

    // Create the dropdown item with wallet
    function dropdownItemsWithWallet(withWalletItem) {
        let dpItem = document.createElement('div');
        dpItem.classList = 'dropdown-item';
        dpItem.textContent = withWalletItem;

        let inpHi = document.createElement('input');
        inpHi.setAttribute('type', 'hidden');
        inpHi.setAttribute('value', withWalletItem);
        dpItem.appendChild(inpHi);

        return dpItem;
    }

    function populateSettings() {
        /**
         *  Add Functionality Generic + Btn
         **/

        // Generic Add Functionality
        let genericAddFnc = document.getElementById('genericAddFnc');
        genericAddFnc.classList.add('d-none');

        /**
         *	Add current preferrence of export file format
         **/
        let currentExportFileFormat = exportFileFormatObj[currentUser.exportFileFormat];
        document.getElementById('chosenExportFileFormat').textContent = isNotEmpty(currentExportFileFormat) ? currentExportFileFormat : exportFileFormatObj['XLS'];

        // Display Email for devices
        document.getElementById('currentUserEmail').textContent = currentUser.email;

        /*
         *	Country Drop down Populate
         */

        /*An array containing all the country names in the world:*/
        window.countries = [];
        window.lToC = {};
        let locToCou = window.localeToCountry.localeToCountry;
        for (let i = 0, l = locToCou.length; i < l; i++) {
            // Map of country and locale to be used later
            window.lToC[locToCou[i].name] = locToCou[i].country
            /* Update the default locale in Settings */
            if (isEqual(currentUser.locale.slice(-2), locToCou[i].country)) {
                document.getElementById('chosenCountry').textContent = locToCou[i].name;
                // To be used to display "with wallet" section
                document.getElementById('currentCountries').appendChild(dropdownItemsWithWallet(locToCou[i].name));
            } else {
                // To be used for Auto complete
                window.countries.push(locToCou[i].name);
            }
        }
        /*initiate the autocomplete function on the "chosenCountryInp" element, and pass along the countries array as possible autocomplete values:*/
        autocomplete(document.getElementById("chosenCountryInp"), window.countries, "chooseCountryDD");

        /*
         *	Currency Dropdown Populate
         */

        /*An array containing all the currency names in the world:*/
        window.currencies = [];
        window.cToS = {};
        let curToSym = window.currencyNameToSymbol.currencyNameToSymbol;
        for (let i = 0, l = curToSym.length; i < l; i++) {
            window.cToS[curToSym[i].currency] = curToSym[i].symbol;
            /* Update the default currency in Settings */
            if (isEqual(currentUser.walletCurrency, curToSym[i].symbol)) {
                document.getElementById('chosenCurrency').textContent = curToSym[i].currency;
                // To be used to display "with wallet" section
                document.getElementById('currentCurrencies').appendChild(dropdownItemsWithWallet(curToSym[i].currency));
            } else {
                window.currencies.push(curToSym[i].currency);
            }
        }
        /*initiate the autocomplete function on the "chosenCurrencyInp" element, and pass along the countries array as possible autocomplete values:*/
        autocomplete(document.getElementById("chosenCurrencyInp"), window.currencies, "chooseCurrencyDD");

        // On click drop down btn of country search
        $("#chosenCurrencyDropdown").on("shown.bs.dropdown", function (event) {
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
        $("#chosenCurrencyDropdown").on("hidden.bs.dropdown", function (event) {
            // Input clear value for the country search bar
            document.getElementById('chosenCurrencyInp').value = '';
            // Close all list
            closeAllDDLists(this);
        });

        // On click drop down btn of country search
        $("#chosenCountryDropdown").on("shown.bs.dropdown", function (event) {
            let countryInp = document.getElementById('chosenCountryInp');
            // Input change focus to the country search bar
            countryInp.focus();
            // Trigger input event
            let eventInp = new Event('input', {
                bubbles: true,
                cancelable: true,
            });

            countryInp.dispatchEvent(eventInp);
        });

        // On click drop down btn of country search
        $("#chosenCountryDropdown").on("hidden.bs.dropdown", function (event) {
            // Input clear value for the country search bar
            document.getElementById('chosenCountryInp').value = '';
            // Close all list
            closeAllDDLists(this);
        });

        /*
         * Populate current Locale
         */
        document.getElementById("currentLanguageShown").textContent = languageOptions[window.currentUser.locale.substring(0, 2)];

    }

    /*
     * Choose current language
     */
    $('body').on("click", "#chooseLanguageDD .dropdown-item", function (event) {
        updateUserAttr('locale', this.dataset.target + window.currentUser.locale.substring(2, 5), this, null);
    });

}(jQuery));
