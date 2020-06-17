"use strict";
(function scopeWrapper($) {	
    // Forward slash regex
    const reForwardSlash = /\//g;
    // SUPPORT CONSTANTS
    const SUPPORT_CONSTANTS = {};
    // SECURITY: Defining Immutable properties as constants
    Object.defineProperties(SUPPORT_CONSTANTS, {
        'ratingLS': { value: 'articleRating', writable: false, configurable: false }
    });

    /**
    *
    * Support module On Click
    *
    **/
    // Show help center
    $('.main-panel').on('click', '.helpCenter' , function(e) {
        // Support Modal
        $('#supportModal').modal('show');
        // Call the actual page which was requested to be loaded
        $.ajax({
            type: "GET",
            url: window._config.help.html,
            dataType: 'html',
            success: function(data){
                // Load the new HTML
                $('#supportContent').html(data);
                // Load the auto complete module
                loadAutoCompleteModuleOnSwal();
                // Focus the search article
                document.getElementById('searchArticle').focus();
                // Translate current Page
                translatePage(getLanguage());
            },
            error: function(){
                Swal.fire({
                    title: window.translationData.support.helpcenter.redirect,
                    text: window.translationData.support.helpcenter.tryagain,
                    icon: 'warning',
                    timer: 1000,
                    showConfirmButton: false
                }).catch(swal.noop);
            }
        });
    });

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
                b.href = window._config.help.invokeUrl + '/' + getLanguage() + arr[i].url;
                
                a.appendChild(b);
              }

              // If empty then show no results
              if(isNotEmpty(a) && isEmpty(a.firstChild)) {
                b = document.createElement("span");
                b.classList.add("tripleNineColor");
                b.textContent = window.translationData.support.helpcenter.noresults;
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
        let categoryInformation = window.categoryInfo[getLanguage()];
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

        // Hide Article Ratings
        document.getElementById('article-ratings-success').classList.add('d-none');
        document.getElementById('article-ratings-failure').classList.add('d-none');
        document.getElementsByClassName('article-ratings-question')[0].classList.remove('d-none');
        document.getElementsByClassName('article-ratings-actions')[0].classList.remove('d-none');
        document.getElementsByClassName('article-ratings')[0].classList.add('d-none');

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
                    title: window.translationData.support.helpcenter.unableurl
                });
            }
        });

        return false;
    });

    function loadPage(result) {
        // Set the data attribute to url
        $('.rate-action').attr('data-url', result.url);
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
        let categoryInfo = window.categoryInfo[getLanguage()];

        // Category Information iteration
        for(let i=0, len=categoryInfo.length; i<len ; i++) {
            let category = categoryInfo[i];
            if(isEqual(category.categoryName, title)) {
                // Update body
                document.getElementById('article-title').textContent = category.categoryName;
                document.getElementById('article-description').textContent = category.description;
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
            articleIcon.textContent = 'assignment';
            li.appendChild(articleIcon);
    
            let anchorArticle = document.createElement('a');
            anchorArticle.classList.add('sub-category-link');
            anchorArticle.classList.add('help-center-result');
            anchorArticle.href = window._config.help.invokeUrl + '/' + getLanguage() + category.dataUrl + subCategoryNavItem.url.slice(1);
            anchorArticle.textContent = subCategoryNavItem.title;
            li.appendChild(anchorArticle);
            ul.appendChild(li);
        }

        subCategoryDiv.appendChild(ul);
        return subCategoryDiv;
    }

    // Populate Article Information
    function populateArticleInfo(result) {
        // Check if it exists in the database
        if(!checkRatingInLS(result.url)) {
            // Remove the article ratings display none property
            document.getElementsByClassName('article-ratings')[0].classList.remove('d-none');
        }
        // Update body
        document.getElementById('article-title').textContent = result.title;
        document.getElementById('article-description').textContent = '';
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
        anchorZero.textContent = breadcrumbAnchor.crumbTitle;
        breadcrumbDiv.appendChild(anchorZero);  

        for(let i=1, len = breadcrumbSC.length; i < len; i++) {
            let span = document.createElement('span');
            span.classList.add('nextCrumb');
            span.textContent = '>';
            breadcrumbDiv.appendChild(span);

            let breadcrumbAnchor = breadcrumbSC[i];
            let anchorOther = document.createElement('a');
            anchorOther.classList.add('crumbAnchor');
            anchorOther.href = window._config.help.invokeUrl + '/' + getLanguage() + breadcrumbAnchor.crumbUrl;
            anchorOther.textContent = breadcrumbAnchor.crumbTitle;
            breadcrumbDiv.appendChild(anchorOther);
        }

        // Upload the category
        let span = document.createElement('span');
        span.classList.add('nextCrumb');
        span.textContent = '>';
        breadcrumbDiv.appendChild(span);

        // Bread crumb last
        let anchorLast = document.createElement('a');
        anchorLast.href = window._config.help.invokeUrl + '/' + getLanguage() + result.url;
        anchorLast.classList.add('crumbAnchor');
        anchorLast.textContent = result.title;
        breadcrumbDiv.appendChild(anchorLast);

        return breadcrumbDiv;
    }

    // Load Home page
    function loadHomePage() {
        // This is needed if the user scrolls down during page load and you want to make sure the page is scrolled to the top once it's fully loaded.Cross-browser supported.
        document.getElementsByClassName('Hero')[0].classList.remove('d-none');
        document.getElementsByClassName('CategoryResult')[0].classList.add('d-none');
        document.getElementsByClassName('article-ratings')[0].classList.add('d-none');
        // Set the data attribute to home
        $('.rate-action').attr('data-ratingurl','/');
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

    // On click ratings
    $(".rate-action").click(function () {
        let rating = this.getAttribute("data-rating");
        let message = ''; 
        let subject = '';
        if(isEqual(rating, 'positive')) {
            message = 'The article in this URL ' + this.getAttribute("data-url") + ' was helpful';
            subject = 'Article Rating: I like your article';
            showSuccessMessage();
        } else {
            message = 'Improve the article in this URL ' + this.getAttribute("data-url");
            subject = 'Article Rating: You need to improve';
            needMoreInformation(this.getAttribute("data-url"));
        }
        sendEmailToSupport(message, subject);
        updateToLocalStorage(this.getAttribute("data-url"), rating);
    });

    // Need More information
    function needMoreInformation(url) {
        let articleFailure = document.getElementById('article-ratings-failure');
        articleFailure.lastElementChild.setAttribute('data-url', url);
        articleFailure.classList.remove('d-none');
        document.getElementsByClassName('article-ratings-question')[0].classList.add('d-none');
        document.getElementsByClassName('article-ratings-actions')[0].classList.add('d-none');   
    }

    // Show Success Message
    function showSuccessMessage() {
        let articleSuccess = document.getElementById('article-ratings-success');
        while(articleSuccess.firstChild) {
            articleSuccess.removeChild(articleSuccess.firstChild);
        } 
        articleSuccess.classList.remove('d-none');
        articleSuccess.appendChild(successSvgMessage());
        document.getElementsByClassName('article-ratings-question')[0].classList.add('d-none');
        document.getElementsByClassName('article-ratings-actions')[0].classList.add('d-none');
    }

    // Update Local storage with rating
    function updateToLocalStorage(url, rating) {
        let ratingLS = JSON.parse(localStorage.getItem(SUPPORT_CONSTANTS.ratingLS));
        if(isEmpty(ratingLS)) {
            // Create the first rating
            ratingLS = [];
        }

        let articleRating = {
            'url' :  url,
            'rating' : rating
        }
        ratingLS.push(articleRating);
        // Set ratings to the local storage
        localStorage.setItem(SUPPORT_CONSTANTS.ratingLS, JSON.stringify(ratingLS));
    }

    // Check if ratings is present
    function checkRatingInLS(url) {
        let ratingLS = JSON.parse(localStorage.getItem(SUPPORT_CONSTANTS.ratingLS));
        if(isEmpty(ratingLS)) {
            return false;
        }

        // if rating is present then return true
        for(let i = 0, len = ratingLS.length; i < len; i++) {
            let articleRating = ratingLS[i];
            if(isEqual(articleRating.url, url)) {
                return true;
            }
        }
    }

    // Send Ratings to support
    function sendEmailToSupport(message, subject) {

        let values = JSON.stringify({
            "email" : window.currentUser.email,
            "message" : message,
            "subject" : subject
        });

        jQuery.ajax({
            url:  window._config.api.invokeUrl + window._config.api.sendEmailUrl,         
            type: 'POST',
            contentType:"application/json;charset=UTF-8",
            data : values
        });
    }

    // Generate SVG Tick Element and success element
    function successSvgMessage() {
        let alignmentDiv = document.createElement('div');
        alignmentDiv.className = 'row justify-content-center mx-2';
        
        // Parent Div Svg container
        let divSvgContainer = document.createElement('div');
        divSvgContainer.className = 'svg-container';
        
        // SVG element
        let svgElement = document.createElementNS("http://www.w3.org/2000/svg", 'svg');
        svgElement.setAttribute('class','ft-green-tick');
        svgElement.setAttribute('height','20');
        svgElement.setAttribute('width','20');
        svgElement.setAttribute('viewBox','0 0 48 48');
        svgElement.setAttribute('aria-hidden',true);
        
        let circleElement = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circleElement.setAttribute('class','circle');
        circleElement.setAttribute('fill','#5bb543');
        circleElement.setAttribute('cx','24');
        circleElement.setAttribute('cy','24');
        circleElement.setAttribute('r','22');
        
        let pathElement = document.createElementNS("http://www.w3.org/2000/svg", 'path');
        pathElement.setAttribute('class','tick');
        pathElement.setAttribute('fill','none');
        pathElement.setAttribute('stroke','#FFF');
        pathElement.setAttribute('stroke-width','6');
        pathElement.setAttribute('stroke-linecap','round');
        pathElement.setAttribute('stroke-linejoin','round');
        pathElement.setAttribute('stroke-miterlimit','10');
        pathElement.setAttribute('d','M14 27l5.917 4.917L34 17');
        
        svgElement.appendChild(circleElement);
        svgElement.appendChild(pathElement);
        divSvgContainer.appendChild(svgElement);
        
        let messageParagraphElement = document.createElement('p');
        messageParagraphElement.className = 'article-success margin-bottom-zero margin-left-five';
        messageParagraphElement.innerHTML = window.translationData.support.helpcenter.thanks;
        
        var br = document.createElement('br');
        
        alignmentDiv.appendChild(divSvgContainer);
        alignmentDiv.appendChild(messageParagraphElement);
        alignmentDiv.appendChild(br);
        
        
        return alignmentDiv;
    }

}(jQuery));