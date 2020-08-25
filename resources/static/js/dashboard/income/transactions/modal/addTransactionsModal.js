"use strict";
(function scopeWrapper($) {

    // Add New Categories
    $('body').on('click', '#typeSelection .dropdown-item', function (e) {
        let dropdownValue = this.lastElementChild.value;
        let typeSelection = document.getElementById('typeSelection');
        typeSelection.firstElementChild.textContent = dropdownValue;
        typeSelection.setAttribute('data-chosen', dropdownValue);
    });

}(jQuery));
