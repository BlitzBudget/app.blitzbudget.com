"use strict";
(function scopeWrapper($) {

    // Voice Code Element on focus
    let voiceCodeEl = document.getElementById('voice-code');
    voiceCodeEl.focus();

    /*
     * Voice Code
     */
    voiceCodeEl.addEventListener('keyup', function () {
        let val = this.value;
        if (isNaN(val)) {
            this.classList.add('errorborder');
            document.getElementById('errorFourDigit').classList.remove('d-none');
            document.getElementById('nextButton').setAttribute('disabled', 'disabled');
        } else if (val.length == 4) {
            // If the value's length is 4
            this.classList.remove('errorborder');
            document.getElementById('errorFourDigit').classList.add('d-none');
            document.getElementById('nextButton').removeAttribute('disabled');
        }
    });

    /*
     * Next Button
     */
    document.getElementById('nextButton').addEventListener('click', function () {
        document.getElementById('voice-code-box').classList.add('d-none');
        // Email Focus Code
        document.getElementById('email-box').classList.remove('d-none');

        // Next button and continur button
        document.getElementById('nextButton').classList.add('d-none');
        document.getElementById('continueButton').classList.remove('d-none');
        document.getElementById('saveButton').classList.add('d-none');

        // Forgot Password anchor tag displayed
        document.getElementById('opt-out-voice-code').classList.add('d-none');
        // Change Voice Code anchor tag displayed
        document.getElementById('change-voice-code').classList.remove('d-none');
        document.getElementById('forgot-password').classList.add('d-none');

        document.getElementById('email').focus();
    });

    /*
     * Change Voice Code
     */
    document.getElementById('change-voice-code').addEventListener('click', function () {

        // Voice Code Focus
        document.getElementById('voice-code-box').classList.remove('d-none');

        document.getElementById('email-box').classList.add('d-none');

        // Forgot Password anchor tag displayed
        document.getElementById('opt-out-voice-code').classList.remove('d-none');
        // Change Voice Code anchor tag displayed
        document.getElementById('change-voice-code').classList.add('d-none');
        document.getElementById('forgot-password').classList.add('d-none');

        // Next button and continur button
        document.getElementById('nextButton').classList.remove('d-none');
        document.getElementById('continueButton').classList.add('d-none');
        document.getElementById('saveButton').classList.add('d-none');

        document.getElementById('voice-code').focus();
    });

    /*
     * Continue Button
     */
    document.getElementById('continueButton').addEventListener('click', function () {
        // Input Element display
        let email = document.getElementById('email');
        document.getElementById('email-address-display').textContent = email.value;

        // Email and Password boxes
        document.getElementById('email-box').classList.add('d-none');
        document.getElementById('password-box').classList.remove('d-none');

        // Opt Out voice code anchor tag displayed
        document.getElementById('change-voice-code').classList.add('d-none');
        document.getElementById('opt-out-voice-code').classList.add('d-none');
        document.getElementById('forgot-password').classList.remove('d-none');

        // Next button and continur button
        document.getElementById('nextButton').classList.add('d-none');
        document.getElementById('continueButton').classList.add('d-none');
        document.getElementById('saveButton').classList.remove('d-none');

        document.getElementById('password').focus();
    });

    /*
     * Change Email
     */
    document.getElementById('change-email').addEventListener('click', function () {
        // Email and Password boxes
        document.getElementById('email-box').classList.remove('d-none');
        document.getElementById('password-box').classList.add('d-none');

        // Opt Out voice code anchor tag displayed
        document.getElementById('change-voice-code').classList.remove('d-none');
        document.getElementById('opt-out-voice-code').classList.add('d-none');
        document.getElementById('forgot-password').classList.add('d-none');

        // Next button and continur button
        document.getElementById('nextButton').classList.add('d-none');
        document.getElementById('continueButton').classList.remove('d-none');
        document.getElementById('saveButton').classList.add('d-none');

        document.getElementById('email').focus();
    });

    /*
     * Show Hide Password
     */
    document.getElementById('show_hide_password').addEventListener('click', function () {
        let passwordField = document.getElementById('password');
        if (isEqual(passwordField.type, 'password')) {
            passwordField.type = 'text';
            this.textContent = 'visibility';
        } else {
            passwordField.type = 'password';
            this.textContent = 'visibility_off';
        }

        // Password Field
        passwordField.focus();
    });

    /*
     * Save Voice Code
     */
    document.getElementById('saveButton').addEventListener('click', function () {

    });

}(jQuery));
