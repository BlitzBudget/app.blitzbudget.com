"use strict";
(function scopeWrapper($) {	
    // Forward slash regex
    const reForwardSlash = /\//g;
    // Load the auto complete module
    loadAutoCompleteModuleOnSwal();
    // Focus the search article
    document.getElementById('searchArticle').focus();

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
                b.classList.add('help-center-result');
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
                b.href = window._config.help.invokeUrl + arr[i].url;
                
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

        // Dispatch click event
        let event = new Event('input', {
            bubbles: true,
            cancelable: true,
        });

        // Display the first 5 results
        document.getElementById("searchArticle").dispatchEvent(event);
    }

    // On click a tag then
    $( "#supportModal" ).on( "click", "a" ,function() {
        let anchorHref = this.href;
        // Add trailing slash at the end if not present
        if(anchorHref.charAt(anchorHref.length - 1) !== "/") {
            anchorHref = anchorHref + '/';
        }

        // If home page is selected then change classList
        if(((anchorHref || '').match(reForwardSlash) || []).length == 3) {
            loadHomePage();

            return false;
        }

        // Switch to category nav
        document.getElementsByClassName('Hero')[0].classList.add('d-none');
        document.getElementsByClassName('CategoryResult')[0].classList.remove('d-none');
        let articleTitle = document.getElementById('article-title');
        while(articleTitle.firstChild) {
            articleTitle.removeChild(articleTitle.firstChild);
        }
        let articleDescription = document.getElementById('article-description');
        while(articleDescription.firstChild) {
            articleDescription.removeChild(articleDescription.firstChild);
        }
        let articleBody = document.getElementById('article-body');
        while(articleBody.firstChild) {
            articleBody.removeChild(articleBody.firstChild);
        }
        articleBody.appendChild(buildMaterialSpinner());

        // Retrieve categories / articles
        jQuery.ajax({
            url: anchorHref + 'info.json',
            type: 'GET',
            success: function(result) {
                loadPage(result);
                return false;
            },
            error: function(userTransactionsList) {
                Toast.fire({
                    icon: 'error',
                    title: "Unable to fetch the requested url"
                });
            }
        });

        return false;
    });

    function loadPage(result) {
        // Check if subcategory
        if(result.subcategoryPresent) {
            // Populate article information
            populateSubCategoryInfo(result);
        } else {
            // Populate article information
            populateArticleInfo(result);
        }
    }

    // Populate Sub Category Info
    function populateSubCategoryInfo(result) {
        let title = result.title;
        let categoryInfo = window.categoryInfo;

        // Category Information iteration
        for(let i=0, len=categoryInfo.length; i<len ; i++) {
            let category = categoryInfo[i];
            if(isEqual(category.categoryName, title)) {
                // Update body
                document.getElementById('article-title').innerText = category.categoryName;
                document.getElementById('article-description').innerText = category.description;
                let bcEl = document.getElementById('breadcrumb');
                while(bcEl.firstChild) {
                    bcEl.removeChild(bcEl.firstChild);
                }
                bcEl.appendChild(populateBreadcrumb(result));
                // Remove article body
                let articleBody = document.getElementById('article-body');
                while(articleBody.firstChild) {
                    articleBody.removeChild(articleBody.firstChild);
                }
                
                articleBody.appendChild(populateSubCategory(category));

                return;
            }
        }
    }

    // Populate sub category information
    function populateSubCategory(category) {
        let subCategoryDiv = document.createDocumentFragment();
        let subCategoryNav = category.subCategory;

        if(isEmpty(subCategoryNav)) {
            return subCategoryDiv;
        }

        let ul = document.createElement('ul');
        ul.classList.add('sub-category-list');      

        for(let i=0, len = subCategoryNav.length; i < len; i++) {
            let subCategoryNavItem = subCategoryNav[i];
            let li = document.createElement('li');
            li.classList.add('sub-category-li');

            let articleIcon = document.createElement('i');
            articleIcon.classList = 'material-icons align-middle';
            articleIcon.innerText = 'assignment';
            li.appendChild(articleIcon);
    
            let anchorArticle = document.createElement('a');
            anchorArticle.classList.add('sub-category-link');
            anchorArticle.classList.add('help-center-result');
            anchorArticle.href = window._config.help.invokeUrl + category.dataUrl + subCategoryNavItem.url.slice(1);
            anchorArticle.innerText = subCategoryNavItem.title;
            li.appendChild(anchorArticle);
            ul.appendChild(li);
        }

        subCategoryDiv.appendChild(ul);
        return subCategoryDiv;
    }

    // Populate Article Information
    function populateArticleInfo(result) {
        // Update body
        document.getElementById('article-title').innerText = result.title;
        document.getElementById('article-description').innerText = '';
        let bcEl = document.getElementById('breadcrumb');
        while(bcEl.firstChild) {
            bcEl.removeChild(bcEl.firstChild);
        }
        bcEl.appendChild(populateBreadcrumb(result));
        // Remove article body
        let articleBody = document.getElementById('article-body');
        while(articleBody.firstChild) {
            articleBody.removeChild(articleBody.firstChild);
        }
        
        articleBody.appendChild(populateArticle(result.content));

    }

    // Populate Article
    function populateArticle(content) {
        let articleDiv = document.createDocumentFragment();

        if(isEmpty(content)) {
            return articleDiv;
        }

        for(let i=0, len = content.length; i < len; i++) {
            let contentItem = content[i];
            let tag = document.createElement(contentItem.tag);
            
            // Populate innerHTML
            if(isNotEmpty(contentItem.html)) {          
                tag.innerHTML = contentItem.html;
            }

            // Add class list
            if(isNotEmpty(contentItem.classInfo)) {
                tag.classList = contentItem.classInfo;
            }

            // Add src
            if(isNotEmpty(contentItem.srcUrl)) {
                tag.src = window._config.help.invokeUrl + contentItem.srcUrl;
            }

            articleDiv.appendChild(tag);
        }
        return articleDiv;
    }

        // Populate the breadcrumb
    function populateBreadcrumb(result) {
        let breadcrumbDiv = document.createDocumentFragment();
        let breadcrumbSC = result.breadcrumb;

        if(isEmpty(breadcrumbSC)) {
            return breadcrumbDiv;
        }

        // Bread crumb 0
        let breadcrumbAnchor = breadcrumbSC[0];
        let anchorZero = document.createElement('a');
        anchorZero.href = window._config.help.invokeUrl + breadcrumbAnchor.crumbUrl;
        anchorZero.classList.add('crumbAnchor');
        anchorZero.innerText = breadcrumbAnchor.crumbTitle;
        breadcrumbDiv.appendChild(anchorZero);  

        for(let i=1, len = breadcrumbSC.length; i < len; i++) {
            let span = document.createElement('span');
            span.classList.add('nextCrumb');
            span.innerText = '>';
            breadcrumbDiv.appendChild(span);

            let breadcrumbAnchor = breadcrumbSC[i];
            let anchorOther = document.createElement('a');
            anchorOther.classList.add('crumbAnchor');
            anchorOther.href = window._config.help.invokeUrl + breadcrumbAnchor.crumbUrl;
            anchorOther.innerText = breadcrumbAnchor.crumbTitle;
            breadcrumbDiv.appendChild(anchorOther);
        }

        // Upload the category
        let span = document.createElement('span');
        span.classList.add('nextCrumb');
        span.innerText = '>';
        breadcrumbDiv.appendChild(span);

        // Bread crumb last
        let anchorLast = document.createElement('a');
        anchorLast.href = window._config.help.invokeUrl + result.url;
        anchorLast.classList.add('crumbAnchor');
        anchorLast.innerText = result.title;
        breadcrumbDiv.appendChild(anchorLast);

        return breadcrumbDiv;
    }

    // Load Home page
    function loadHomePage() {
        // This is needed if the user scrolls down during page load and you want to make sure the page is scrolled to the top once it's fully loaded.Cross-browser supported.
        document.getElementsByClassName('Hero')[0].classList.remove('d-none');
        document.getElementsByClassName('CategoryResult')[0].classList.add('d-none');
    }

    // Build Material Spinner
    function buildMaterialSpinner() {
        let divContainer = document.createElement('div');
        divContainer.classList = 'm-auto h-eighteen-rem position-relative';

        // Add Material Spinner
        let divMaterialSpinner = document.createElement('div');
        divMaterialSpinner.classList = 'material-spinner m-auto position-absolute position-absolute-center';
        divContainer.appendChild(divMaterialSpinner);
        return divContainer;
    }

}(jQuery));