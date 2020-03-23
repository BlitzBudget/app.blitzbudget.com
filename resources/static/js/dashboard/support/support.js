"use strict";
(function scopeWrapper($) {	

	// Show help center
	$('.main-panel').on('click', '.helpCenter' , function(e) {
		// Show Sweet Alert
        Swal.fire({
        	position: 'bottom-right',
            title: 'How Can We Help?',
            html: loadHelpCenter(),
            customClass: {
            	popup: 'help-center-popup',
            	content: 'help-center-content'
            },
            inputAttributes: {
                autocapitalize: 'on'
            },
            showCloseButton: true,
            showConfirmButton: false,
            buttonsStyling: false
        });

        // Load the auto complete module
        loadAutoCompleteModuleOnSwal();
	});

	// Load Help center
	function loadHelpCenter() {
        let searchModule = document.createDocumentFragment();

        let inputSearchArt = document.createElement('input');
        inputSearchArt.classList = "form-control w-75 mx-auto";
        inputSearchArt.id = 'searchArticle';
        inputSearchArt.type =  "text";
        inputSearchArt.placeholder="Search for articles...";
        searchModule.appendChild(inputSearchArt);

        let searchArticleDD = document.createElement('div');
        searchArticleDD.classList = 'mx-auto w-75';
        searchArticleDD.id = 'searchArticleDD';
        searchModule.appendChild(searchArticleDD);

        return searchModule;
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
                searchArticleDD.removeChild(x[i]);
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
              searchArticleDD.appendChild(a);
              /*for each item in the array...*/
              for (let i = 0; i < len; i++) {
                let autoFilEl = false;
                if(!val) {
                    autoFilEl = true;
                } else {
                    /* check if the starting characters match */
                    startsWithChar = arr[i].title.substr(0, val.length).toUpperCase() == upperVal;
                    /* build a regex with the value entered */
                    regVal = new RegExp(upperVal,"g");
                    /*check if the item starts with the same letters as the text field value:*/
                    if (startsWithChar || includesStr(arr[i].title.toUpperCase(), upperVal)) {
                        autoFilEl = true;
                    }   
                }

                // Confinue with the iteration
                if(!autoFilEl) {
                    continue;
                }
                
                /*create a DIV element for each matching element:*/
                b = document.createElement("a");
                b.classList.add("dropdown-item");
                /*make the matching letters bold:*/
                if(startsWithChar) {
                    b.innerHTML = "<strong>" + arr[i].title.substr(0, val.length) + "</strong>" + arr[i].title.substr(val.length);
                } else if(!val) {
                    b.innerHTML = arr[i].title;
                } else {
                    let startPos = regVal.exec(arr[i].title.toUpperCase()).index;
                    let startPos2 = startPos + val.length;
                    b.innerHTML = arr[i].title.substr(0, startPos) + "<strong>" + arr[i].title.substr(startPos, val.length) + "</strong>" + arr[i].title.substr(startPos2);
                }
                /*insert a input field that will hold the current array item's value:*/
                b.href = arr[i].url;
                
                a.appendChild(b);
              }

              // If empty then show no results
              if(isNotEmpty(a) && isEmpty(a.firstChild)) {
                b = document.createElement("span");
                b.classList.add("tripleNineColor");
                b.innerText = 'No Results';
                a.appendChild(b);
              }
          }

          /*
          * Autocomplete Key down event
          */
          function keydownAutoCompleteTrigger(e) {
              let wrapClassId = this.id + "autocomplete-list";
              let x = document.getElementById(wrapClassId);
              if (x) x = x.getElementsByTagName("a");
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

    function loadAutoCompleteModuleOnSwal() {
        // FAQ populate the questions for search
        let faq = [];
        let categoryInformation = window.categoryInfo;
        for(let i = 0, len = categoryInformation.length; i < len; i++) {
            let categoryInfoItem = categoryInformation[i];
            let subCategoryArr = categoryInfoItem.subCategory;

            // Is subcategory information is empty then continue
            if(isEmpty(subCategoryArr)) {
                continue;
            }

            for(let j = 0, length = subCategoryArr.length; j < length; j++) {
                // FAQ
                let subCategoryItem = subCategoryArr[j];
                let faqItem = {
                    "title" : subCategoryItem.title,
                    "url" : categoryInfoItem.dataUrl.slice(0,-1) + subCategoryItem.url
                }
                faq.push(faqItem);
            }
        }

        /*initiate the autocomplete function on the "searchArticle" element, and pass along the countries array as possible autocomplete values:*/
        autocomplete(document.getElementById("searchArticle"), faq, "searchArticleDD");
    }

}(jQuery));