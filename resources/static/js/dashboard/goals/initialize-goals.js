"use strict";
(function scopeWrapper($) {

    /**
     * START loading the page
     *
     */
    let currentPageInCookie = er.getCookie('currentPage');
    if (isEqual(currentPageInCookie, 'goalsPage')) {
        if (isEqual(window.location.href, window._config.app.invokeUrl)) {
            populateCurrentPage('goalsPage');
        }
    }

    /*
     * On Click goals
     */
    let goalsPage = document.getElementById('goalsPage');
    if (isNotEmpty(settingsPage)) {
        goalsPage.addEventListener("click", function (e) {
            populateCurrentPage('goalsPage');
        });
    }

    /*
     * Populate Current Page
     */
    function populateCurrentPage(page) {
        er.refreshCookiePageExpiry(page);
        er.fetchCurrentPage('/goals', function (data) {
            // Load the new HTML
            $('#mutableDashboard').html(data);
            // Translate current Page
            translatePage(getLanguage());
            // Set Current Page
            let currentPage = document.getElementById('currentPage');
            currentPage.setAttribute('data-i18n', 'goals.page.title');
            currentPage.textContent = window.translationData ? window.translationData.goals.page.title : 'Goals';
            // Initial Load
            initialLoad();
        });

        /**
         *  Add Functionality Generic + Btn
         **/

        // Register Tooltips
        let ttinit = $("#addFncTT");
        ttinit.attr('data-original-title', 'Add Goals');
        ttinit.tooltip({
            delay: {
                "show": 300,
                "hide": 100
            }
        });

        // Generic Add Functionality
        let genericAddFnc = document.getElementById('genericAddFnc');
        document.getElementById('addFncTT').textContent = 'add';
        genericAddFnc.classList = 'btn btn-round btn-warning btn-just-icon bottomFixed float-right addNewGoals';
        $(genericAddFnc).unbind('click').click(function () {
            if (!this.classList.contains('addNewGoals')) {
                return;
            }

            // Create goals
            $('#addGoals').modal('toggle');
        });
    }

    /*
     * Initial Load of goals page
     */
    function initialLoad() {
        /*
         * Fetch Goals
         */
        fetchGoals();

        /*
         * Save For Emergency
         */
        // no ui slider initialize
        window.emergencyFundMonths = document.getElementById('emergency-fund-months');
        let updateSliderValue = document.getElementById("emergency-fund-value");
        noUiSlider.create(emergencyFundMonths, {
            start: 3,
            connect: 'lower',
            behaviour: 'tap',
            tooltips: true,
            keyboardSupport: true, // Default true
            keywordPageMultiplier: 2, // Default 5
            keywordDefaultStep: 1, // Default 10
            step: 1,
            range: {
                min: 1,
                max: 12
            },
            format: {
                from: Number,
                to: function (value) {
                    return (parseInt(value) + " month/s");
                }
            }
        });

        /*
         * On update of the slider, Update values in a text field
         */
        window.emergencyFundMonths.noUiSlider.on('update', function (values, handle, unencoded) {
            // Convert average expense emergency to number
            let avEmergencyExp = document.getElementById('average-expense-emergency').value;
            if (isEmpty(avEmergencyExp)) {
                avEmergencyExp = 0;
            } else {
                avEmergencyExp = er.convertToNumberFromCurrency(avEmergencyExp, currentCurrencyPreference);
            }
            // Months * average expense = total emergency fund
            updateSliderValue.textContent = formatToCurrency(unencoded * avEmergencyExp);
        });

        /*
         * Load Date Picker
         */
        loadDatePickerForEmergency();
    }

    /*
     * Load Date Picker Year for emergency
     */
    function loadDatePickerForEmergency() {
        let currentYear = new Date().getFullYear();
        let yearFragment = document.createDocumentFragment();
        for (let i = 0; i < 15; i++) {
            yearFragment.appendChild(createOneDate(currentYear++));
        }
        document.getElementById('list-of-year-emergency').append(yearFragment);
    }

    /*
     * Create One Date
     */
    function createOneDate(year) {
        let liElement = document.createElement('li');

        let anchorTag = document.createElement('a');
        anchorTag.setAttribute('role', 'option');
        anchorTag.classList = 'dropdown-item';
        anchorTag.setAttribute('aria-disabled', 'false');
        anchorTag.setAttribute('tabindex', '0');
        anchorTag.setAttribute('aria-selected', 'false');
        anchorTag.setAttribute('data-year', year);

        let spanText = document.createElement('span');
        spanText.classList = 'text';
        spanText.textContent = year;
        anchorTag.appendChild(spanText);
        liElement.appendChild(anchorTag);

        return liElement;
    }

    /*
     * Fetch Goals
     */
    function fetchGoals() {
        let values = {};
        if (isNotEmpty(window.currentUser.walletId)) {
            values.walletId = window.currentUser.walletId;
            values.userId = window.currentUser.financialPortfolioId;
        } else {
            values.userId = window.currentUser.financialPortfolioId;
        }

        // Ajax Requests on Error
        let ajaxData = {};
        ajaxData.isAjaxReq = true;
        ajaxData.type = 'POST';
        ajaxData.url = window._config.api.invokeUrl + window._config.api.goals;
        ajaxData.dataType = "json";
        ajaxData.contentType = "application/json;charset=UTF-8";
        ajaxData.data = JSON.stringify(values);
        ajaxData.onSuccess = function (result) {
                // Dates Cache
                window.datesCreated = result.Date;

                er_a.populateBankInfo(result.BankAccount);

            },
            ajaxData.onFailure = function (thrownError) {
                manageErrors(thrownError, window.translationData.goals.dynamic.geterror, ajaxData);
            }

        // Load all user transaction from API
        jQuery.ajax({
            url: ajaxData.url,
            beforeSend: function (xhr) {
                xhr.setRequestHeader("Authorization", authHeader);
            },
            type: ajaxData.type,
            dataType: ajaxData.dataType,
            contentType: ajaxData.contentType,
            data: ajaxData.data,
            success: ajaxData.onSuccess,
            error: ajaxData.onFailure
        });
    }

}(jQuery));
