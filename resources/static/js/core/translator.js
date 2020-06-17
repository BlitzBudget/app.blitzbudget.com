"use strict";

function translatePage(locale) {
    fetch('./i18n/' + locale + '.json')
        .then(
            function (response) {
                if (response.status !== 200) {
                    console.log('Looks like there was a problem. Status Code: ' +
                        response.status);
                    return;
                }

                // Examine the text in the response
                response.json().then(function (data) {
                    // Add to a cache
                    window.translationData = data;
                    replaceText(data);
                    // Set Translated Months
                    setTranslatedMonths();
                    // Set Translated CategoryNames
                    translatedCategoryNames();
                    // Replace placeholders
                    replacePlaceholders();
                    //Replace tooltip
                    replaceTooltips();
                });
            }
        )
        .catch(function (err) {
            console.log('Fetch Error :-S', err);
        });
}

function getLanguage() {
    // If locale is not empty from the user cache then
    if (isNotEmpty(window.currentUser) && isNotEmpty(window.currentUser.locale)) {
        return window.currentUser.locale.substr(0, 2);
    }

    let languagespreferred = ["en", "es", "fr"];
    let lang = navigator.languages ? navigator.languages[0] : navigator.language;
    lang = lang.substr(0, 2);
    lang = includesStr(languagespreferred, lang) ? lang : "en";
    return lang;
}

function replaceText(translation) {
    let elements = document.querySelectorAll("[data-i18n]");
    for (let i = 0, len = elements.length; i < len; i++) {
        let el = elements[i];
        let keys = el.dataset.i18n.split(".");
        let text = keys.reduce((obj, i) => obj[i], translation);
        if (isNotEmpty(text)) {
            el.textContent = text;
        }
    }
}

/*
 * Translates the months
 */
function setTranslatedMonths() {
    window.months = [];
    window.months.push(window.translationData.month.january);
    window.months.push(window.translationData.month.february);
    window.months.push(window.translationData.month.march);
    window.months.push(window.translationData.month.april);
    window.months.push(window.translationData.month.may);
    window.months.push(window.translationData.month.june);
    window.months.push(window.translationData.month.july);
    window.months.push(window.translationData.month.august);
    window.months.push(window.translationData.month.september);
    window.months.push(window.translationData.month.october);
    window.months.push(window.translationData.month.november);
    window.months.push(window.translationData.month.december);

    // Overview month name
    document.getElementById('overviewMonthHeading').textContent = window.months[new Date().getMonth()];
}

// Assign category key value pairs for categories
function translatedCategoryNames() {
    // Initialize map
    window.translatedCategoryName = {};

    for (let key in window.translationData.categories) {
        window.translatedCategoryName[key] = window.translationData.categories[key];
    }

}

// Replace placeholders
function replacePlaceholders() {
    let elements = document.querySelectorAll("[data-placeholder-i18n]");
    for (let i = 0, len = elements.length; i < len; i++) {
        let el = elements[i];
        let keys = el.dataset.placeholderI18n.split(".");
        let text = keys.reduce((obj, i) => obj[i], window.translationData);
        if (isNotEmpty(text)) {
            el.placeholder = text;
        }
    }
}

// Replace tooltip
function replaceTooltips() {
    let elements = document.querySelectorAll("[data-title-i18n]");
    for (let i = 0, len = elements.length; i < len; i++) {
        let el = elements[i];
        let keys = el.dataset.titleI18n.split(".");
        let text = keys.reduce((obj, i) => obj[i], window.translationData);
        if (isNotEmpty(text)) {
            el.title = text;
            el.dataset.originalTitle = text;
        }
    }
}
