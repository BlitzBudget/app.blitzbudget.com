"use strict";
(function scopeWrapper($) {

    // Add New Categories
    $('body').on('click', '#addNewCategory', function (e) {
        document.getElementById('newCategorySelection').classList.toggle('d-none');
        document.getElementById('categoryOptions').classList.toggle('d-none');
    });

    // Add New Categories
    $('body').on('click', '#typeSelection .dropdown-item', function (e) {
        let dropdownValue = this.lastElementChild.value;
        let typeSelection = document.getElementById('typeSelection');
        typeSelection.firstElementChild.textContent = window.categoryMap[dropdownValue].name;
        typeSelection.setAttribute('data-chosen', dropdownValue);
    });

}(jQuery));
