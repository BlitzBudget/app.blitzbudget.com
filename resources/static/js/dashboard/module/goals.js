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
     * On Click Choose a goal
     */
    $('body').on("click", "#addGoals .chooseable", function (event) {
        let target = this.dataset.target;
        switch (target) {
            case "save-for-emergency":
                saveForEmergency();
                break;
            default:
                break;
        }
    });

    function saveForEmergency() {
        document.getElementById('choose-a-goal').classList.add('d-none');
        document.getElementById('save-for-emergency').classList.remove('d-none');
    }

    /*
     * Initial Load of goals page
     */
    function initialLoad() {
        /*
         * save For Emergency
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

        window.emergencyFundMonths.noUiSlider.on('update', function (values, handle) {
            updateSliderValue.textContent = values[handle];
        });
    }

}(jQuery));
