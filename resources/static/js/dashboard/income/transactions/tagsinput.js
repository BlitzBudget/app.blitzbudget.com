"use strict";
(function scopeWrapper($) {

    // Onn hit enter
    $('body').on("keyup", "#add-transaction-value", function (e) {
        var keyCode = e.key;
        if (isEqual(keyCode, 'Enter')) {
            e.preventDefault();
            // Create a new tag
            createANewTag('add-transaction-tags', this.value);
            // Empty the input value
            this.value = '';
            return false;
        }
    });

    /*
     * Creates a new tag
     */
    function createANewTag(id, content) {
        let badge = document.createElement('span');
        badge.classList = 'tag badge';
        badge.textContent = content;

        let removeButton = document.createElement('span');
        removeButton.setAttribute('data-role', 'remove');
        removeButton.classList = 'badge-remove';
        badge.appendChild(removeButton);

        let parentElement = document.getElementById(id);
        parentElement.insertBefore(badge, parentElement.childNodes[0]);
    }

    /*
     * Remove the tag
     */
    $('body').on("click", "#add-transaction-tags .tag.badge .badge-remove", function (e) {
        // Remove the parent element
        this.parentNode.remove();
    });

}(jQuery));
