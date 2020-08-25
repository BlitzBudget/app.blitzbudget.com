"use strict";
(function scopeWrapper($) {

    // Add New Categories
    $('body').on('click', '#addNewCategory', function (e) {
        document.getElementById('newCategorySelection').classList.toggle('d-none');
        document.getElementById('categoryOptions').classList.toggle('d-none');
    });

}(jQuery));
