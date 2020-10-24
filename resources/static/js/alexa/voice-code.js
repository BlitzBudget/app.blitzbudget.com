"use strict";
(function scopeWrapper($) {

    let enterKey = "Enter";
    let emailRegex = /(.+)@(.+){2,}\.(.+){2,}/;
    // Voice Code Element on focus
    let voiceCodeEl = document.getElementById('voice-code');
    // Email Element on focus
    let emailEl = document.getElementById('email');
    let saveButtonEl = document.getElementById('saveButton');
    let continueButtonEl = document.getElementById('continueButton');
    let nextButtonEl = document.getElementById('nextButton');
    voiceCodeEl.focus();

    /*
     * Voice Code
     */
    voiceCodeEl.addEventListener('keyup', function (e) {
        let val = this.value;
        let keyPressed = e.key;
        if (isNaN(val)) {
            this.classList.add('errorborder');
            document.getElementById('errorFourDigit').classList.remove('d-none');
            nextButtonEl.setAttribute('disabled', 'disabled');
        } else if (val.length == 4) {
            // If the value's length is 4
            this.classList.remove('errorborder');
            document.getElementById('errorFourDigit').classList.add('d-none');
            nextButtonEl.removeAttribute('disabled');

            if (isEqual(keyPressed, enterKey)) {
                nextButtonEl.click();
            }
        }
    });

    /*
     * Email Input
     */
    emailEl.addEventListener('keyup', function (e) {
        let val = this.value;
        let keyPressed = e.key;
        let errorEmail = document.getElementById('error-email');

        // Test Email Regex
        if (emailRegex.test(val)) {
            continueButtonEl.removeAttribute('disabled');
            errorEmail.classList.add('d-none');

            if (isEqual(keyPressed, enterKey)) {
                continueButtonEl.click();
            }

        } else {
            continueButtonEl.setAttribute('disabled', 'disabled');

            if (isEqual(keyPressed, enterKey)) {
                errorEmail.classList.remove('d-none');
            }
        }
    });

    /*
     * Password Input
     */
    document.getElementById('password').addEventListener('keyup', function (e) {
        let keyPressed = e.key;
        let errorPassword = document.getElementById('error-password-length');
        let saveButton = document.getElementById('saveButton');

        if (this.value.length >= 8) {
            errorPassword.classList.add('d-none');
            saveButton.removeAttribute('disabled');
        } else {
            errorPassword.classList.remove('d-none');
            saveButton.setAttribute('disabled', 'disabled');
        }

        if (isEqual(keyPressed, enterKey)) {
            saveButtonEl.click();
        }
    });

    /*
     * Next Button
     */
    nextButtonEl.addEventListener('click', function () {
        document.getElementById('voice-code-box').classList.add('d-none');
        // Email Focus Code
        document.getElementById('email-box').classList.remove('d-none');

        // Next button and continur button
        this.classList.add('d-none');
        continueButtonEl.classList.remove('d-none');
        saveButtonEl.classList.add('d-none');

        // Forgot Password anchor tag displayed
        document.getElementById('opt-out-voice-code').classList.add('d-none');
        // Change Voice Code anchor tag displayed
        document.getElementById('change-voice-code').classList.remove('d-none');
        document.getElementById('forgot-password').classList.add('d-none');

        emailEl.focus();
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
        nextButtonEl.classList.remove('d-none');
        continueButtonEl.classList.add('d-none');
        saveButtonEl.classList.add('d-none');

        document.getElementById('voice-code').focus();
    });

    /*
     * Continue Button
     */
    continueButtonEl.addEventListener('click', function () {
        // Input Element display
        document.getElementById('email-address-display').textContent = emailEl.value;

        // Email and Password boxes
        document.getElementById('email-box').classList.add('d-none');
        document.getElementById('password-box').classList.remove('d-none');

        // Opt Out voice code anchor tag displayed
        document.getElementById('change-voice-code').classList.add('d-none');
        document.getElementById('opt-out-voice-code').classList.add('d-none');
        document.getElementById('forgot-password').classList.remove('d-none');

        // Next button and continur button
        nextButtonEl.classList.add('d-none');
        continueButtonEl.classList.add('d-none');
        saveButtonEl.classList.remove('d-none');

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
        nextButtonEl.classList.add('d-none');
        continueButtonEl.classList.remove('d-none');
        saveButtonEl.classList.add('d-none');

        emailEl.focus();
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
    saveButtonEl.addEventListener('click', function () {

    });

}(jQuery));
