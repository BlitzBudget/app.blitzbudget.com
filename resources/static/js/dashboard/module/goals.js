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
            case "pay-off-credit-card":
                payOffCreditCard();
                break;
            case "pay-off-loans":
                payOffLoans();
                break;
            case "save-for-retirement":
                saveForRetirement()
                break;
            case "buy-a-home":
                buyAHome();
                break;
            case "buy-an-automobile":
                buyAnAutomobile();
                break;
            case "save-for-college":
                saveForCollege();
                break;
            case "take-a-trip":
                takeATrip();
                break;
            case "improve-my-home":
                improveMyHome();
                break;
            case "create-a-custom-goal":
                createACustomGoal();
                break;
            default:
                break;
        }
    });

    /*
     * Save for Emergency
     */
    function saveForEmergency() {
        document.getElementById('choose-a-goal').classList.add('d-none');
        document.getElementById('save-for-emergency').classList.remove('d-none');
        document.getElementById('choose-goal-footer').classList.remove('d-none');
    }

    /*
     * Pay off credit cards
     */
    function payOffCreditCard() {
        document.getElementById('choose-a-goal').classList.add('d-none');
        document.getElementById('pay-off-credit-card').classList.remove('d-none');
        document.getElementById('choose-goal-footer').classList.remove('d-none');
    }

    /*
     * Pay off loans
     */
    function payOffLoans() {
        document.getElementById('choose-a-goal').classList.add('d-none');
        document.getElementById('pay-off-loans').classList.remove('d-none');
        document.getElementById('choose-goal-footer').classList.remove('d-none');
    }

    /*
     * Save for Retirement
     */
    function saveForRetirement() {
        document.getElementById('choose-a-goal').classList.add('d-none');
        document.getElementById('save-for-retirement').classList.remove('d-none');
        document.getElementById('choose-goal-footer').classList.remove('d-none');
    }

    /*
     * Buy a home
     */
    function buyAHome() {
        document.getElementById('choose-a-goal').classList.add('d-none');
        document.getElementById('buy-a-home').classList.remove('d-none');
        document.getElementById('choose-goal-footer').classList.remove('d-none');
    }

    /*
     * Buy an automobile
     */
    function buyAnAutomobile() {
        document.getElementById('choose-a-goal').classList.add('d-none');
        document.getElementById('buy-an-automobile').classList.remove('d-none');
        document.getElementById('choose-goal-footer').classList.remove('d-none');
    }

    /*
     * Take a trip
     */
    function takeATrip() {
        document.getElementById('choose-a-goal').classList.add('d-none');
        document.getElementById('take-a-trip').classList.remove('d-none');
        document.getElementById('choose-goal-footer').classList.remove('d-none');
    }

    /*
     * Improve my home
     */
    function improveMyHome() {
        document.getElementById('choose-a-goal').classList.add('d-none');
        document.getElementById('improve-my-home').classList.remove('d-none');
        document.getElementById('choose-goal-footer').classList.remove('d-none');
    }

    /*
     * Create a custom goal
     */
    function createACustomGoal() {
        document.getElementById('choose-a-goal').classList.add('d-none');
        document.getElementById('create-a-custom-goal').classList.remove('d-none');
        document.getElementById('choose-goal-footer').classList.remove('d-none');
    }

    /*
     * Save for College
     */
    function saveForCollege() {
        document.getElementById('choose-a-goal').classList.add('d-none');
        document.getElementById('save-for-college').classList.remove('d-none');
        document.getElementById('choose-goal-footer').classList.remove('d-none');
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

    /*
     * Click Back Button
     */
    $('body').on("click", "#back-goals", function (event) {
        document.getElementById('choose-a-goal').classList.remove('d-none');
        document.getElementById('save-for-emergency').classList.add('d-none');
        document.getElementById('pay-off-credit-card').classList.add('d-none');
        document.getElementById('pay-off-loans').classList.add('d-none');
        document.getElementById('save-for-retirement').classList.add('d-none');
        document.getElementById('buy-a-home').classList.add('d-none');
        document.getElementById('buy-an-automobile').classList.add('d-none');
        document.getElementById('save-for-college').classList.add('d-none');
        document.getElementById('take-a-trip').classList.add('d-none');
        document.getElementById('improve-my-home').classList.add('d-none');
        document.getElementById('create-a-custom-goal').classList.add('d-none');
        document.getElementById('choose-goal-footer').classList.add('d-none');
    });

}(jQuery));
