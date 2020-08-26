"use strict";
(function scopeWrapper($) {

    // Add New Categories
    $('body').on('click', '#typeSelection .dropdown-item', function (e) {
        let dropdownValue = this.lastElementChild.value;
        let typeSelection = document.getElementById('typeSelection');
        typeSelection.firstElementChild.textContent = dropdownValue;
        typeSelection.setAttribute('data-chosen', dropdownValue);
    });

    // Input Focus In
    $('body').on('focusin focusout', '#newCategory', function (e) {
        document.getElementById('newCategorySelection').getElementsByClassName('dropdown-toggle')[0].click();
    });

    /*execute a function when someone clicks on the item value (DIV element):*/
    $('body').on('click', '#newCategorySelection .dropdown-item', function (e) {
        /*insert the value for the autocomplete text field:*/
        let dropdownValue = this.lastElementChild.value;
        document.getElementById('newCategory').value = dropdownValue;
        /*close the list of autocompleted values,
        (or any other open lists of autocompleted values:*/
        closeAllLists();
    });

}(jQuery));

tr_a = {
    /**
     * Autocomplete Module
     **/
    autocomplete(inp, arr, scrollWrapEl) {
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
                    startsWithChar = arr[i].name.substr(0, val.length).toUpperCase() == upperVal;
                    /* build a regex with the value entered */
                    regVal = new RegExp(upperVal, "g");
                    /*check if the item starts with the same letters as the text field value:*/
                    if (startsWithChar || includesStr(arr[i].name.toUpperCase(), upperVal)) {
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
                    b.innerHTML = "<strong>" + arr[i].name.substr(0, val.length) + "</strong>" + arr[i].name.substr(val.length);
                } else if (!val) {
                    b.innerHTML = arr[i].name;
                } else {
                    let startPos = regVal.exec(arr[i].name.toUpperCase()).index;
                    let startPos2 = startPos + val.length;
                    b.innerHTML = arr[i].name.substr(0, startPos) + "<strong>" + arr[i].name.substr(startPos, val.length) + "</strong>" + arr[i].name.substr(startPos2);
                }
                /*insert a input field that will hold the current array item's value:*/
                b.innerHTML += "<input type='hidden' value='" + arr[i].name + "'>";
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
            document.getElementById(scrollWrapEl).appendChild(a);
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
};
