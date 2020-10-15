"use strict";
(function scopeWrapper($) {

    document.getElementById("voice-code").addEventListener('keyup', function () {
        let val = this.value;
        if (isNaN(val)) {
            this.classList.add('errorborder');
            document.getElementById('errorFourDigit').classList.remove('d-none');
            document.getElementById('nextButton').setAttribute('disabled', 'disabled');
        } else {
            this.classList.remove('errorborder');
            document.getElementById('errorFourDigit').classList.add('d-none');
            document.getElementById('nextButton').removeAttribute('disabled');
        }
    });

    document.getElementById('nextButton').addEventListener('click', function () {
        let voiceCode = document.getElementById('voice-code-box');
        voiceCode.classList.add('d-none');
        let emailBox = document.getElementById('email-box');
        emailBox.classList.remove('d-none');
    });

}(jQuery));
