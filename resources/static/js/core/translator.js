"use strict";
function translatePage(locale) {
	fetch('./i18n/' + locale + '.json')
	  .then(
	    function(response) {
	      if (response.status !== 200) {
	        console.log('Looks like there was a problem. Status Code: ' +
	          response.status);
	        return;
	      }

	      // Examine the text in the response
	      response.json().then(function(data) {
	        console.log(data);
	        replaceText(data);
	      });
	    }
	  )
	  .catch(function(err) {
	    console.log('Fetch Error :-S', err);
	  });
}

function getLanguage() {
  var lang = navigator.languages ? navigator.languages[0] : navigator.language;
  
  return lang.substr(0, 2);
}

function replaceText(translation) {
	let elements = document.querySelectorAll("[data-i18n]");
	for(let i = 0, len = elements.length; i < len; i++) {
		let el = elements[i];
		let keys = el.dataset.i18n.split(".");
		let text = keys.reduce((obj, i) => obj[i], translation);
		if (isNotEmpty(text)) {
		  el.innerHTML = text;
		}
	}
}