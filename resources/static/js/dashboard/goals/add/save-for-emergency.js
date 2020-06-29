"use strict";
(function scopeWrapper($) {

    /*
     * Selected month for emergency
     */
    $('body').on("click", "#data-picker-month-emergency .dropdown-item", function (event) {
        document.getElementById('choose-month-title').textContent = window.months[this.dataset.month];
        document.getElementById('choose-month-title').setAttribute('data-selected', (Number(this.dataset.month) + 1));
    });

    /*
     * Selected month for emergency
     */
    $('body').on("click", "#data-picker-emergency .dropdown-item", function (event) {
        document.getElementById('choose-year-title').textContent = this.dataset.year;
        document.getElementById('choose-year-title').setAttribute('data-selected', this.dataset.year);
    });

}(jQuery));
