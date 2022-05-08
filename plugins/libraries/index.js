import Vue from 'vue';

function lastElement(arr) {
    if (Array.isArray(arr)) {
        return isEmpty(arr) ? arr : arr[arr.length - 1];
    }
    return arr;
};

function firstElement(arr) {
    if (Array.isArray(arr)) {
        return isEmpty(arr) ? arr : arr[0];
    }
    return arr;
};

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
};

function isNotEmpty(obj) {
    return !isEmpty(obj);
};

function isNotBlank(obj) {
    return isNotEmpty(obj) && obj !== '';
};

function isBlank(obj) {
    return isEmpty(obj) && obj == '';
};

function trimElement(str) {
    return $.trim(str);
};

function splitElement(str, splitString) {
    if (includesStr(str, splitString)) {
        return isEmpty(str) ? str : str.split(splitString);
    }

    return str;
};

function includesStr(arr, val) {
    return isEmpty(arr) ? null : arr.includes(val);
};

function notIncludesStr(arr, val) {
    return !includesStr(arr, val);
};

function fetchFirstElement(arr) {
    if (Array.isArray(arr)) {
        return isEmpty(arr) ? null : arr[0];
    }
    return arr;
};

function isEqual(obj1, obj2) {
    return JSON.stringify(obj1) === JSON.stringify(obj2);
};

function isNotEqual(obj1, obj2) {
    return !isEqual(obj1, obj2);
};

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
};

// IE 7 Or Less support
function stringIncludes(s, sub) {
    if (isEmpty(s) || isEmpty(sub)) {
        return false;
    }

    return s.indexOf(sub) !== -1;
};


// Minimize the decimals to a set variable
function round(value, decimals) {
    return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);
};

//Format numbers in Indian Currency
function formatNumber(num, locale) {
    if (isEmpty(locale)) {
        locale = "en-US";
    }

    return new Intl.NumberFormat(locale, {
        minimumFractionDigits: '2',
        maximumFractionDigits: '2'
    }).format(num);
};

// Get the weekdays name
function getWeekDays(day) {
    return window.weekday[day];
};

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


Vue.prototype.$lastElement = lastElement;
Vue.prototype.$firstElement = firstElement;
Vue.prototype.$isEmpty = isEmpty;
Vue.prototype.$isNotEmpty = isNotEmpty;
Vue.prototype.$isNotBlank = isNotBlank;
Vue.prototype.$isBlank = isBlank;
Vue.prototype.$trimElement = trimElement;
Vue.prototype.$splitElement = splitElement;
Vue.prototype.$includesStr = includesStr;
Vue.prototype.$notIncludesStr = notIncludesStr;
Vue.prototype.$fetchFirstElement = fetchFirstElement;
Vue.prototype.$isEqual = isEqual;
Vue.prototype.$isNotEqual = isNotEqual;
Vue.prototype.$formatLargeCurrencies = formatLargeCurrencies;
Vue.prototype.$stringIncludes = stringIncludes;
Vue.prototype.$round = round;
Vue.prototype.$formatNumber = formatNumber;
Vue.prototype.$getWeekDays = getWeekDays;
Vue.prototype.$ordinalSuffixOf = ordinalSuffixOf;