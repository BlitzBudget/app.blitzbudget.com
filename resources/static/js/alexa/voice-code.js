"use strict";
(function scopeWrapper($) {

    document.getElementById("voice-code").addEventListener('keyup', function () {
        let val = this.value;
        if (isNaN(val)) {
            this.classList.add('errorborder');
            document.getElementById('errorFourDigit').classList.remove('d-none');
        } else {
            this.classList.remove('errorborder');
            document.getElementById('errorFourDigit').classList.add('d-none');
        }
    });

}(jQuery));
