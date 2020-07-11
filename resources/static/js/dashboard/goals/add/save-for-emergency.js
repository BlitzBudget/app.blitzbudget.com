"use strict";
(function scopeWrapper($) {

    /*
     * Selected month for emergency
     */
    $('body').on("click", "#data-picker-month-emergency .dropdown-item", function (event) {
        let currentMonth = (Number(this.dataset.month) + 1);
        document.getElementById('choose-month-title').textContent = window.months[this.dataset.month];
        let ple = document.getElementById('planned-date-emergency');
        ple.textContent = window.months[this.dataset.month] + ' ' + ple.dataset.dateChosenYear;
        ple.setAttribute('data-date-chosen-month', currentMonth);
    });

    /*
     * Selected month for emergency
     */
    $('body').on("click", "#data-picker-emergency .dropdown-item", function (event) {
        document.getElementById('choose-year-title').textContent = this.dataset.year;
        let ple = document.getElementById('planned-date-emergency');
        ple.textContent = window.months[Number(ple.dataset.dateChosenMonth) - 1] + ' ' + this.dataset.year;
        ple.setAttribute('data-date-chosen-year', this.dataset.year);
    });

    /*
     * Average Expense emergency change updates the emergency fund value
     */
    $("body").on("change paste keyup", "#average-expense-emergency", function () {
        // Convert average expense emergency to number
        let avEmergencyExp = this.value;
        if (isEmpty(avEmergencyExp)) {
            avEmergencyExp = 0;
        } else {
            avEmergencyExp = er.convertToNumberFromCurrency(avEmergencyExp, currentCurrencyPreference);
        }

        /*
         * Disable or enable NEXT button
         */
        let monthlyContribution = document.getElementById('your-monthly-contribution').value;
        // If is not a number then
        if (isNaN(avEmergencyExp)) {
            document.getElementById('save-emergency-goals').setAttribute('disabled', 'disabled');
        } else if (!isNaN(er.convertToNumberFromCurrency(monthlyContribution, currentCurrencyPreference))) {
            document.getElementById('save-emergency-goals').removeAttribute('disabled');
        }

        // See the text value in resume
        document.getElementById("emergency-fund-value").textContent = formatToCurrency(window.emergencyFundMonths.noUiSlider.get().substring(0, 2) * avEmergencyExp);

        /*
         * Calculate Total Planned Date
         */
        calculateTotalPlannedDate();
    });

    /*
     * Average Expense emergency change updates the emergency fund value
     */
    $("body").on("change paste keyup", "#your-monthly-contribution", function () {
        // Convert average expense emergency to number
        let monthlyCtb = this.value;
        if (isEmpty(monthlyCtb)) {
            monthlyCtb = 0;
        }

        /*
         * Disable or enable NEXT button
         */
        let averageExpenseEmergency = document.getElementById('average-expense-emergency').value;
        averageExpenseEmergency = er.convertToNumberFromCurrency(averageExpenseEmergency, currentCurrencyPreference);
        // If is not a number then
        if (isNaN(er.convertToNumberFromCurrency(monthlyCtb, currentCurrencyPreference))) {
            document.getElementById('save-emergency-goals').setAttribute('disabled', 'disabled');
        } else if (!isNaN(averageExpenseEmergency)) {
            document.getElementById('save-emergency-goals').removeAttribute('disabled');
        }

        // Change in the display as well
        document.getElementById("monthly-contribution-display").textContent = formatToCurrency(monthlyCtb);

        /*
         * Calculate Total Planned Date
         */
        calculateTotalPlannedDate();
    });

    /*
     * Your Monthly Contribution on focus out
     */
    $("body").on("focusout", "#your-monthly-contribution", function () {
        // Convert average expense emergency to number
        let monthlyCtb = this.value;
        monthlyCtb = isEmpty(monthlyCtb) ? 0 : er.convertToNumberFromCurrency(monthlyCtb, currentCurrencyPreference);
        // If Empty or Not a Number then 0
        monthlyCtb = isNaN(monthlyCtb) ? 0 : monthlyCtb;

        this.value = formatToCurrency(monthlyCtb);
    });

    /*
     * Average Expense emergency on focus out
     */
    $("body").on("focusout", "#average-expense-emergency", function () {
        // Convert average expense emergency to number
        let avExp = this.value;
        avExp = isEmpty(avExp) ? 0 : er.convertToNumberFromCurrency(avExp, currentCurrencyPreference);
        // If Empty or Not a Number then 0
        avExp = isNaN(avExp) ? 0 : avExp;

        this.value = formatToCurrency(avExp);
    });

    $('body').on("click", "#save-emergency-goals.emergency-add", function (event) {
        // Choose Planned Date
        let plannedDate = document.getElementById('planned-date-emergency');
        let newDate = new Date();
        newDate.setMonth(Number(plannedDate.dataset.dateChosenMonth) + 1);
        newDate.setFullYear(plannedDate.dataset.dateChosenYear);

        // Average Expense
        let averageExp = document.getElementById('average-expense-emergency').value;
        if (isEmpty(averageExp)) {
            averageExp = 0;
        } else {
            averageExp = er.convertToNumberFromCurrency(averageExp, window.currentCurrencyPreference);
        }

        /*
         * Build params for add goals
         */
        let walletId = window.currentUser.walletId;
        let goalType = "EmergencyFund";
        let targetAmount = averageExp * window.emergencyFundMonths.noUiSlider.get().substring(0, 2);
        let targetDate = newDate;
        let targetType = "Wallet";
        let targetId = window.currentUser.walletId;
        let monthlyContribution = document.getElementById('your-monthly-contribution').value;
        if (isEmpty(monthlyContribution)) {
            monthlyContribution = 0;
        } else {
            monthlyContribution = er.convertToNumberFromCurrency(monthlyContribution, window.currentCurrencyPreference);
        }

        let values = {};
        values['walletId'] = walletId;
        values['goalType'] = goalType;
        values['monthlyContribution'] = monthlyContribution;
        values['targetAmount'] = targetAmount;
        values['targetDate'] = targetDate;
        values['targetId'] = targetId;
        values['targetType'] = targetType;

        // Add a goal
        addAGoal(values);

    });

}(jQuery));

/*
 * Calculate Total Planned Date
 */
function calculateTotalPlannedDate() {
    /*
     * Calculate the Dates before which one could pay it off
     */
    let averageExpenseEmergency = document.getElementById('average-expense-emergency').value;
    let monthlyCtb = document.getElementById('your-monthly-contribution').value;
    averageExpenseEmergency = er.convertToNumberFromCurrency(averageExpenseEmergency, currentCurrencyPreference);
    monthlyCtb = er.convertToNumberFromCurrency(monthlyCtb, currentCurrencyPreference);
    let totalEmergencyFund = averageExpenseEmergency * Number(window.emergencyFundMonths.noUiSlider.get().substring(0, 2));
    let numberOfMonthsRequired = totalEmergencyFund / monthlyCtb;
    // Rounding the numbers
    numberOfMonthsRequired = (numberOfMonthsRequired <= 1) ? 1 : Math.round(numberOfMonthsRequired);

    /*
     * Date calculated
     */
    let currentDate = new Date();
    currentDate.setMonth(currentDate.getMonth() + numberOfMonthsRequired);

    /*
     * Display in date picker
     */
    document.getElementById('choose-month-title').textContent = window.months[currentDate.getMonth()];
    document.getElementById('choose-year-title').textContent = currentDate.getFullYear();

    /*
     * Displayed Years and Months
     */
    let ple = document.getElementById('planned-date-emergency');
    ple.textContent = window.months[currentDate.getMonth()] + ' ' + currentDate.getFullYear();
    ple.setAttribute('data-date-chosen-month', currentDate.getMonth());
    ple.setAttribute('data-date-chosen-year', currentDate.getFullYear());
}
