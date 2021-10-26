'use strict'
// Get today
window.today = new Date()
// chosenDate for transactions (April 2019 as 042019)
window.chosenDate = today

function translatePage (locale) {
  fetch('./i18n/' + locale + '.json')
    .then(
      function (response) {
        if (response.status !== 200) {
          console.log('Looks like there was a problem. Status Code: ' +
                        response.status)
          return
        }

        // Examine the text in the response
        response.json().then(function (data) {
          // Add to a cache
          window.translationData = data
          replaceText(data)
          // Set Translated Months
          setTranslatedMonths()
          // Set Translated CategoryNames
          translatedCategoryNames()
          // Replace placeholders
          replacePlaceholders()
          // Replace tooltip
          replaceTooltips()
        })
      }
    )
    .catch(function (err) {
      console.log('Fetch Error :-S', err)
    })
}

function getLanguage () {
  // If locale is not empty from the user cache then
  if (isNotEmpty(window.currentUser) && isNotEmpty(window.currentUser.locale)) {
    return window.currentUser.locale.substr(0, 2)
  }

  const languagespreferred = ['en', 'es', 'fr', 'pt', 'ja', 'ru', 'zh']
  let lang = navigator.languages ? navigator.languages[0] : navigator.language
  lang = lang.substr(0, 2)
  lang = includesStr(languagespreferred, lang) ? lang : 'en'
  return lang
}

function replaceText (translation) {
  const elements = document.querySelectorAll('[data-i18n]')
  for (let i = 0, len = elements.length; i < len; i++) {
    const el = elements[i]
    const keys = el.dataset.i18n.split('.')
    const text = keys.reduce((obj, i) => obj[i], translation)
    if (isNotEmpty(text)) {
      el.textContent = text
    }
  }
}

/*
 * Translates the months
 */
function setTranslatedMonths () {
  window.months = []
  window.months.push(window.translationData.month.january)
  window.months.push(window.translationData.month.february)
  window.months.push(window.translationData.month.march)
  window.months.push(window.translationData.month.april)
  window.months.push(window.translationData.month.may)
  window.months.push(window.translationData.month.june)
  window.months.push(window.translationData.month.july)
  window.months.push(window.translationData.month.august)
  window.months.push(window.translationData.month.september)
  window.months.push(window.translationData.month.october)
  window.months.push(window.translationData.month.november)
  window.months.push(window.translationData.month.december)

  // Overview month name
  const overviewMonthHeading = document.getElementById('overviewMonthHeading')
  if (overviewMonthHeading) {
    overviewMonthHeading.textContent = window.months[window.chosenDate.getMonth()]
  }
}

// Assign category key value pairs for categories
function translatedCategoryNames () {
  // Initialize map
  window.translatedCategoryName = {}

  for (const key in window.translationData.categories) {
    window.translatedCategoryName[key] = window.translationData.categories[key]
  }
}

// Replace placeholders
function replacePlaceholders () {
  const elements = document.querySelectorAll('[data-placeholder-i18n]')
  for (let i = 0, len = elements.length; i < len; i++) {
    const el = elements[i]
    const keys = el.dataset.placeholderI18n.split('.')
    const text = keys.reduce((obj, i) => obj[i], window.translationData)
    if (isNotEmpty(text)) {
      el.placeholder = text
    }
  }
}

// Replace tooltip
function replaceTooltips () {
  const elements = document.querySelectorAll('[data-title-i18n]')
  for (let i = 0, len = elements.length; i < len; i++) {
    const el = elements[i]
    const keys = el.dataset.titleI18n.split('.')
    const text = keys.reduce((obj, i) => obj[i], window.translationData)
    if (isNotEmpty(text)) {
      el.title = text
      el.dataset.originalTitle = text
    }
  }
}
