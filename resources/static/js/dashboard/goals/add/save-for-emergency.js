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
            document.getElementById('save-goals').setAttribute('disabled', 'disabled');
        } else if (!isNaN(er.convertToNumberFromCurrency(monthlyContribution, currentCurrencyPreference))) {
            document.getElementById('save-goals').removeAttribute('disabled');
        }

        // See the text value in resume
        document.getElementById("emergency-fund-value").textContent = formatToCurrency(window.emergencyFundMonths.noUiSlider.get().charAt(0) * avEmergencyExp);
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
        // If is not a number then
        if (isNaN(er.convertToNumberFromCurrency(monthlyCtb, currentCurrencyPreference))) {
            document.getElementById('save-goals').setAttribute('disabled', 'disabled');
        } else if (!isNaN(er.convertToNumberFromCurrency(averageExpenseEmergency, currentCurrencyPreference))) {
            document.getElementById('save-goals').removeAttribute('disabled');
        }

        // Change in the display as well
        document.getElementById("monthly-contribution-display").textContent = formatToCurrency(monthlyCtb);

        /*
         * Calculate the Dates before which one could pay it off
         */
        let totalEmergencyFund = averageExpenseEmergency * window.emergencyFundMonths.noUiSlider.get().charAt(0);
        let monthlyContribution = er.convertToNumberFromCurrency(monthlyCtb, currentCurrencyPreference);
        let numberOfMonthsRequired = totalEmergencyFund / monthlyContribution;
        // Rounding the numbers
        numberOfMonthsRequired = (numberOfMonthsRequired <= 1) ? 1 : Math.round(numberOfMonthsRequired);

        /*
         * Date calculated
         */
        let currentDate = new Date();
        currentDate.setMonth(numberOfMonthsRequired);

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
        ple.setAttribute('data-date-chosen-month', currentMonth);
        ple.setAttribute('data-date-chosen-year', this.dataset.year);
    });

}(jQuery));
