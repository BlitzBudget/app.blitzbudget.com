"use strict";
(function scopeWrapper($) {
    window.goalType = {};
    window.goalType.emergency = 'EmergencyFund';
    window.goalType.creditcard = 'CreditCard';
    window.goalType.buyacar = 'BuyACar';
    window.goalType.buyahome = 'BuyAHome';
    window.goalType.customgoal = 'CustomGoal';
    window.goalType.improvemyhome = 'ImproveMyHome';
    window.goalType.payloan = 'PayLoan';
    window.goalType.planatrip = 'PlanATrip';
    window.goalType.retirement = 'Retirement';
    window.goalType.university = 'University';

    /*
     * Images from goal
     */
    window.imageFromGoalType = {};
    window.imageFromGoalType[window.goalType.emergency] = '../img/dashboard/goals/emergency-fund-display.jpg';
    window.imageFromGoalType[window.goalType.creditcard] = '../img/dashboard/goals/credit-card-display.jpg';
    window.imageFromGoalType[window.goalType.buyacar] = '../img/dashboard/goals/buy-a-car-display.jpg';
    window.imageFromGoalType[window.goalType.buyahome] = '../img/dashboard/goals/buy-a-home-display.jpg';
    window.imageFromGoalType[window.goalType.customgoal] = '../img/dashboard/goals/custom-goal-display.jpg';
    window.imageFromGoalType[window.goalType.improvemyhome] = '../img/dashboard/goals/improve-my-home-display.jpg';
    window.imageFromGoalType[window.goalType.payloan] = '../img/dashboard/goals/pay-loan-display.jpg';
    window.imageFromGoalType[window.goalType.planatrip] = '../img/dashboard/goals/plan-a-trip-display.jpg';
    window.imageFromGoalType[window.goalType.retirement] = '../img/dashboard/goals/retirement-display.jpg';
    window.imageFromGoalType[window.goalType.university] = '../img/dashboard/goals/university-display.jpg';

    /*
     * Type to name
     */
    window.typeToName = {};
    window.typeToName[window.goalType.emergency] = 'Emergency Fund';
    window.typeToName[window.goalType.creditcard] = 'Credit card debt';
    window.typeToName[window.goalType.buyacar] = 'Buy A Car';
    window.typeToName[window.goalType.buyahome] = 'Buy A Home';
    window.typeToName[window.goalType.customgoal] = 'Custom goal';
    window.typeToName[window.goalType.improvemyhome] = 'Improve My Home';
    window.typeToName[window.goalType.payloan] = 'Pay Off Loan';
    window.typeToName[window.goalType.planatrip] = 'Travel';
    window.typeToName[window.goalType.retirement] = 'Retirement';
    window.typeToName[window.goalType.university] = 'Save For College';

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

            /*
             * Calculate Total Planned Date
             */
            calculateTotalPlannedDate();
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

                /*
                 * Replace With Currency
                 */
                replaceWithCurrency(result.Wallet);

                /*
                 * Display Goals
                 */
                displayGoals(result.Goal);

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

    /*
     * Display goal
     */
    function displayGoals(goalArray) {
        /*
         * Goal is Empty
         */
        if (isEmpty(goalArray)) {
            return;
        }

        // Fragment Goal
        let fragmentGoal = document.createDocumentFragment();
        for (let i = 0, len = goalArray.length; i < len; i++) {
            let goal = goalArray[i];
            fragmentGoal.appendChild(buildAGoal(goal, i));
        }
        let goalDisplayed = document.getElementById('goal-displayed');
        goalDisplayed.appendChild(fragmentGoal);

        // Initialize tooltip
        activateTooltip();
    }

    /*
     * Trigger Delete Goal
     */
    $("body").on("click", ".delete-a-goal", function () {
        deleteGoalFireSwal(this);
    });

    /*
     * Delete Goals
     */
    function deleteGoalFireSwal(event) {
        Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            customClass: {
                confirmButton: 'btn btn-warning',
                cancelButton: 'btn btn-danger'
            },
            confirmButtonText: 'Yes, delete it!',
            showCloseButton: true,
            showCancelButton: false,
            focusConfirm: true,
            buttonsStyling: false
        }).then(function (result) {
            // If confirm button is clicked
            if (result.value) {
                deleteAGoal(event);
            }
        }).catch(swal.noop)
    }

    /*
     * Delete goal API
     */
    function deleteAGoal(event) {

        // Fade Out
        let targetId = event.dataset.target;
        let goalElement = document.getElementById('goal-' + targetId);
        $(goalElement).fadeOut();

        let values = {};
        values.walletId = window.currentUser.walletId;
        values.itemId = event.dataset.target;

        // Ajax Requests on Error
        let ajaxData = {};
        ajaxData.isAjaxReq = true;
        ajaxData.type = 'POST';
        ajaxData.url = window._config.api.invokeUrl + window._config.api.deleteItem;
        ajaxData.dataType = "json";
        ajaxData.contentType = "application/json;charset=UTF-8";
        ajaxData.data = JSON.stringify(values);
        ajaxData.onSuccess = function (result) {
                // delete the item
                goalElement.remove();
            },
            ajaxData.onFailure = function (thrownError) {
                manageErrors(thrownError, window.translationData.goals.dynamic.deleteerror, ajaxData);
                // Fade in
                $(goalElement).fadeIn();
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

/*
 * Build a goal
 */
function buildAGoal(oneGoal, count) {
    // Divided Column
    let mdColumn = document.createElement('div');
    mdColumn.classList = 'col-md-4 displayed-goals';
    mdColumn.id = 'goal-' + oneGoal.goalId;
    mdColumn.setAttribute('data-count', count);

    let cardProduct = document.createElement('div');
    cardProduct.classList = 'card card-product';

    let cardHeader = document.createElement('div');
    cardHeader.classList = 'card-header card-header-image animated';
    cardHeader.setAttribute('data-header-animation', 'true');

    let imageAnchor = document.createElement('a');
    imageAnchor.href = 'Javascript:void(0);';

    let imageElement = document.createElement('img');
    imageElement.classList = 'img';
    imageElement.src = getImageForGoals(oneGoal['goal_type']);
    imageAnchor.appendChild(imageElement);
    cardHeader.appendChild(imageAnchor);
    cardProduct.appendChild(cardHeader);

    /*
     * Build Card Body
     */
    let cardBody = document.createElement('div');
    cardBody.classList = 'card-body';

    let cardActions = document.createElement('div');
    cardActions.classList = 'card-actions text-center';

    // View Button
    let viewButton = document.createElement('div');
    viewButton.type = 'button';
    viewButton.classList = 'btn btn-default btn-link';
    viewButton.setAttribute('data-toggle', 'tooltip');
    viewButton.setAttribute('data-placement', 'bottom');
    viewButton.setAttribute('data-original-title', 'View goal');

    let artIcon = document.createElement('i');
    artIcon.classList = 'material-icons';
    artIcon.textContent = 'art_track';
    viewButton.appendChild(artIcon);

    // ripple Container
    let rippleContainer = document.createElement('div');
    rippleContainer.classList = 'ripple-container';
    viewButton.appendChild(rippleContainer);
    cardActions.appendChild(viewButton);

    // Edit Button
    let editButton = document.createElement('div');
    editButton.type = 'button';
    editButton.classList = 'btn btn-warning btn-link';
    editButton.setAttribute('data-toggle', 'tooltip');
    editButton.setAttribute('data-placement', 'bottom');
    editButton.setAttribute('data-original-title', 'Edit goal');

    let editIcon = document.createElement('i');
    editIcon.classList = 'material-icons';
    editIcon.textContent = 'edit';
    editButton.appendChild(editIcon);
    cardActions.appendChild(editButton);

    // Remove Button
    let removeButton = document.createElement('div');
    removeButton.type = 'button';
    removeButton.classList = 'btn btn-danger btn-link delete-a-goal';
    removeButton.setAttribute('data-target', oneGoal.goalId);
    removeButton.setAttribute('data-toggle', 'tooltip');
    removeButton.setAttribute('data-placement', 'bottom');
    removeButton.setAttribute('data-original-title', 'Delete goal');

    let removeIcon = document.createElement('i');
    removeIcon.classList = 'material-icons';
    removeIcon.textContent = 'close';
    removeButton.appendChild(removeIcon);
    cardActions.appendChild(removeButton);
    cardBody.appendChild(cardActions);

    let cardTitle = document.createElement('h3');
    cardTitle.classList = 'card-title';

    let anchorTitle = document.createElement('a');
    anchorTitle.classList = 'goal-title';
    anchorTitle.href = 'Javascript:void(0);';
    anchorTitle.textContent = window.typeToName[oneGoal['goal_type']];
    cardTitle.appendChild(anchorTitle);
    cardBody.appendChild(cardTitle);


    let cardDescription = document.createElement('div');
    cardDescription.classList = 'card-description';
    cardBody.appendChild(cardDescription);
    cardProduct.appendChild(cardBody);

    /*
     * Card Footer
     */
    let cardFooter = document.createElement('div');
    cardFooter.classList = 'card-footer';

    let footerPrice = document.createElement('div');
    footerPrice.classList = 'price';

    let footerAmount = document.createElement('div');
    footerAmount.classList = 'description';
    footerAmount.textContent = formatToCurrency(oneGoal['monthly_contribution']) + '/month';
    footerPrice.appendChild(footerAmount);
    cardFooter.appendChild(footerPrice);

    let stats = document.createElement('div');
    stats.classList = 'stats';

    let cardCategory = document.createElement('p');
    cardCategory.classList = 'card-category';
    cardCategory.textContent = 'inprogress'

    let tickIcon = document.createElement('i');
    tickIcon.classList = 'material-icons';
    tickIcon.textContent = 'autorenew';
    cardCategory.appendChild(tickIcon);
    stats.appendChild(cardCategory);
    cardFooter.appendChild(stats);
    cardProduct.appendChild(cardFooter);
    mdColumn.appendChild(cardProduct);

    return mdColumn;
}

/*
 * Goals for Image
 */
function getImageForGoals(goalType) {
    return window.imageFromGoalType[goalType];
}
