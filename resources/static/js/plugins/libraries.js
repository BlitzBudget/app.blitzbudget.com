/**
 * Helpful functions with javascript
 */

// Initialize the weekday variable
window.weekday = new Array(7);
window.weekday[0] = "Monday";
window.weekday[1] = "Tuesday";
window.weekday[2] = "Wednesday";
window.weekday[3] = "Thursday";
window.weekday[4] = "Friday";
window.weekday[5] = "Saturday";
window.weekday[6] = "Sunday";

// Toast for mixin (Notification)
const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    onOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer)
        toast.addEventListener('mouseleave', Swal.resumeTimer)
    }
})

function formatToCurrency(amount) {
    return isEmpty(amount) ? amount : (formatNumber(amount, window.currentUser.locale) + currentCurrencyPreference);
}

function lastElement(arr) {
    if (Array.isArray(arr)) {
        return isEmpty(arr) ? arr : arr[arr.length - 1];
    }
    return arr;
}

function firstElement(arr) {
    if (Array.isArray(arr)) {
        return isEmpty(arr) ? arr : arr[0];
    }
    return arr;
}

function isEmpty(obj) {
    // Check if objext is a number or a boolean
    if (typeof (obj) == 'number' || typeof (obj) == 'boolean') return false;

    // Check if obj is null or undefined
    if (obj == null || obj === undefined) return true;

    // Check if the length of the obj is defined
    if (typeof (obj.length) != 'undefined') return obj.length == 0;

    // check if obj is a custom obj
    for (let key in obj) {
        if (obj.hasOwnProperty(key)) return false;
    }

    // Check if obj is an element
    if (obj instanceof Element) return false;

    return true;
}

function isNotEmpty(obj) {
    return !isEmpty(obj);
}

function isNotBlank(obj) {
    return isNotEmpty(obj) && obj !== '';
}

function isBlank(obj) {
    return isEmpty(obj) && obj == '';
}

function trimElement(str) {
    return $.trim(str);
}

function splitElement(str, splitString) {
    if (includesStr(str, splitString)) {
        return isEmpty(str) ? str : str.split(splitString);
    }

    return str;
}

function includesStr(arr, val) {
    return isEmpty(arr) ? null : arr.includes(val);
}

function notIncludesStr(arr, val) {
    return !includesStr(arr, val);
}

function fetchFirstElement(arr) {
    if (Array.isArray(arr)) {
        return isEmpty(arr) ? null : arr[0];
    }
    return arr;
}

function isEqual(obj1, obj2) {
    if (JSON.stringify(obj1) === JSON.stringify(obj2)) {
        return true;
    }
    return false;
}

function groupByKey(xs, key) {
    return xs.reduce(function (rv, x) {
        (rv[x[key]] = rv[x[key]] || []).push(x);
        return rv;
    }, {});
};

function isNotEqual(obj1, obj2) {
    return !isEqual(obj1, obj2);
}

function formatLargeCurrencies(value) {

    if (value >= 1000000000) {
        value = (value / 1000000000) + 'B';
        return value;
    }

    if (value >= 1000000) {
        value = (value / 1000000) + 'M';
        return value;
    }

    if (value >= 1000) {
        value = (value / 1000) + 'k';
        return value;
    }

    return value;
}

// IE 7 Or Less support
function stringIncludes(s, sub) {
    if (isEmpty(s) || isEmpty(sub)) {
        return false;
    }

    return s.indexOf(sub) !== -1;
}

function calcPage() {
    // Fetch the current active sidebar
    let sideBarId = currentActiveSideBar.id;

    if (isEqual(sideBarId, CUSTOM_DASHBOARD_CONSTANTS.overviewDashboardId)) {
        return 'info';
    } else if (isEqual(sideBarId, CUSTOM_DASHBOARD_CONSTANTS.transactionDashboardId)) {
        return 'success';
    } else if (isEqual(sideBarId, CUSTOM_DASHBOARD_CONSTANTS.budgetDashboardId)) {
        return 'rose';
    } else if (isEqual(sideBarId, CUSTOM_DASHBOARD_CONSTANTS.goalDashboardId)) {
        return 'warning';
    }

    return 'info';
}

// Replace currentCurrencySymbol with currency
function replaceWithCurrency(wallet) {
    let currencySymbolDivs = document.getElementsByClassName('currentCurrencySymbol');

    if (isEmpty(wallet) && isEmpty(window.currentUser.walletId)) {
        /*
         * If Wallet is empty then redirect to add wallets page
         */
        let timerInterval;
        Swal.fire({
            title: 'No Wallet Found',
            html: 'We will be redirecting you to add wallets in <b></b> milliseconds.',
            timer: 2000,
            timerProgressBar: true,
            showCloseButton: false,
            showCancelButton: false,
            allowEscapeKey: false,
            allowOutsideClick: false,
            closeOnClickOutside: false,
            onBeforeOpen: () => {
                Swal.showLoading()
                timerInterval = setInterval(() => {
                    const content = Swal.getContent()
                    if (content) {
                        const b = content.querySelector('b')
                        if (b) {
                            b.textContent = Swal.getTimerLeft()
                        }
                    }
                }, 100)
            },
            onClose: () => {
                clearInterval(timerInterval)
            }
        }).then((result) => {
            /* Read more about handling dismissals below */
            if (result.dismiss === Swal.DismissReason.timer) {
                window.location.href = window._config.app.invokeUrl + window._config.wallet.invokeUrl;
            }
        })
    }

    if (isNotEmpty(wallet) && isEmpty(currentUser.walletCurrency)) {
        window.cToS = {};
        let curToSym = window.currencyNameToSymbol.currencyNameToSymbol;
        for (let i = 0, l = curToSym.length; i < l; i++) {
            window.cToS[curToSym[i].currency] = curToSym[i].symbol;
        }
        // If Wallet is an array then
        if (isNotEmpty(wallet[0])) {
            wallet = wallet[0];
        }
        window.currentUser.walletId = wallet.walletId;
        window.currentUser.walletCurrency = window.cToS[wallet.currency];
        // We save the item in the localStorage.
        localStorage.setItem("currentUserSI", JSON.stringify(window.currentUser));
    }

    // Wallet Currency has first preference
    if (currentUser.walletCurrency) {
        chosenCurrency = currentUser.walletCurrency;
        for (let i = 0, len = currencySymbolDivs.length | 0; i < len; i++) {
            currencySymbolDivs[i].innerText = chosenCurrency;
        }
    }

    // update currency
    window.currentCurrencyPreference = window.currentUser.walletCurrency;
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
                } else if (obj[paramName] && typeof obj[paramName] === 'string') {
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
    let responseError = thrownError.responseJSON;
    if (isNotEmpty(responseError) && isNotEmpty(responseError.error) && responseError.error.includes("Unauthorized")) {
        er.sessionExpiredSwal(ajaxData);
    } else {
        showNotification(message, window._constants.notification.error);
    }
}


// Minimize the decimals to a set variable
function round(value, decimals) {
    return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);
}

function showNotification(message, colorCode) {
    Toast.fire({
        customClass: {
            container: 'mixinSuccess',
        },
        icon: colorCode,
        title: message
    });
}

function showNotificationWithPosition(message, colorCode, pos) {
    Toast.fire({
        position: pos,
        customClass: {
            container: 'mixinSuccess',
        },
        icon: colorCode,
        title: message
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

function cloneElementAndAppend(document, elementToClone) {
    let clonedElement = elementToClone.cloneNode(true);
    document.appendChild(elementToClone);
    return clonedElement;
}

//Format numbers in Indian Currency
function formatNumber(num, locale) {
    if (isEmpty(locale)) {
        locale = "en-US";
    }

    return new Intl.NumberFormat(locale, {
        minimumFractionDigits: '2',
        maximumFractionDigits: '2'
    }).format(num);
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

function animateValue(element, start, end, postfix, duration) {
    // Animate the element's value from start to end:
    jQuery({
        someValue: start
    }).animate({
        someValue: end
    }, {
        duration: duration,
        easing: 'swing', // can be anything
        step: function () { // called on every step
            // Update the element's text with rounded-up value:
            $(element).text(Math.ceil(this.someValue) + postfix);
        },
        complete: function () {
            if (isNotEmpty(postfix)) {
                // Update the element's text with rounded-up value:
                $(element).text(formatToCurrency(end));
            }
        }
    });
}

/* Check if any bootstrap modal is open */
function isABootstrapModalOpen() {
    return document.querySelectorAll('.modal.show').length > 0;
}

/* Activate Tooltip */
function activateTooltip() {
    $('[data-toggle="tooltip"]').tooltip({
        delay: {
            "show": 300,
            "hide": 100
        }
    });
}
