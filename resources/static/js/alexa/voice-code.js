"use strict";
(function scopeWrapper($) {

    const REDIRECT_TO_VOICE_CODE = "The voice code was empty. Please fill in the details!";
    const GENERIC_ERROR = "There was an error trying to save a voice code";
    const ENTER_KEY = "Enter";
    let emailRegex = /(.+)@(.+){2,}\.(.+){2,}/;
    // Voice Code Element on focus
    let voiceCodeEl = document.getElementById('voice-code');
    // Email Element on focus
    let emailEl = document.getElementById('email');
    let saveButtonEl = document.getElementById('saveButton');
    let continueButtonEl = document.getElementById('continueButton');
    let nextButtonEl = document.getElementById('nextButton');
    let voiceCodeBoxEl = document.getElementById('voice-code-box');
    let emailBoxEl = document.getElementById('email-box');
    let passwordBoxEl = document.getElementById('password-box');
    let optOutOfVoiceCode = document.getElementById('opt-out-voice-code');
    let changeVoiceCode = document.getElementById('change-voice-code');
    let forgotPasswordAnchor = document.getElementById('forgot-password');
    let materialSpinnerLoading = document.getElementById('material-spinner-loading');
    let deleteVoiceCodeIfPresent = false;

    /*
     * OAUTH AUTHORIZE URLS
     */
    const OAUTH_AUTHORIZE_URL = "https://auth.blitzbudget.com/oauth2/authorize";
    const QUERY_PARAMETER = window.location.search;
    const FORGOT_PASSWORD_URL = "https://auth.blitzbudget.com/forgotPassword";
    // FREEZE THE OBJECTS
    Object.freeze(OAUTH_AUTHORIZE_URL);
    Object.seal(OAUTH_AUTHORIZE_URL);
    Object.preventExtensions(OAUTH_AUTHORIZE_URL);
    Object.freeze(QUERY_PARAMETER);
    Object.seal(QUERY_PARAMETER);
    Object.preventExtensions(QUERY_PARAMETER);
    Object.freeze(FORGOT_PASSWORD_URL);
    Object.seal(FORGOT_PASSWORD_URL);
    Object.preventExtensions(FORGOT_PASSWORD_URL);

    voiceCodeEl.focus();

    /*
     * populate HREF
     */
    populateHref();

    /*
     * Redirect To Voice Code
     */
    redirectToVoiceCodeText();

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
            nextButtonEl.click();
        } else if (val.length < 4) {
            nextButtonEl.setAttribute('disabled', 'disabled');
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

            if (isEqual(keyPressed, ENTER_KEY)) {
                continueButtonEl.click();
            }

        } else {
            continueButtonEl.setAttribute('disabled', 'disabled');

            if (isEqual(keyPressed, ENTER_KEY)) {
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

        if (isEqual(keyPressed, ENTER_KEY)) {
            saveButtonEl.click();
        }
    });

    /*
     * Next Button
     */
    nextButtonEl.addEventListener('click', function () {
        voiceCodeBoxEl.classList.add('d-none');
        // Email Focus Code
        emailBoxEl.classList.remove('d-none');

        // Next button and continur button
        this.classList.add('d-none');
        continueButtonEl.classList.remove('d-none');
        saveButtonEl.classList.add('d-none');

        // Forgot Password anchor tag displayed
        optOutOfVoiceCode.classList.add('d-none');
        // Change Voice Code anchor tag displayed
        changeVoiceCode.classList.remove('d-none');
        document.getElementById('forgot-password').classList.add('d-none');

        emailEl.focus();
    });

    /*
     * Change Voice Code
     */
    changeVoiceCode.addEventListener('click', function () {

        // Voice Code Focus
        voiceCodeBoxEl.classList.remove('d-none');

        emailBoxEl.classList.add('d-none');

        // Forgot Password anchor tag displayed
        optOutOfVoiceCode.classList.remove('d-none');
        // Change Voice Code anchor tag displayed
        changeVoiceCode.classList.add('d-none');
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
        emailBoxEl.classList.add('d-none');
        document.getElementById('password-box').classList.remove('d-none');

        // Opt Out voice code anchor tag displayed
        changeVoiceCode.classList.add('d-none');
        optOutOfVoiceCode.classList.add('d-none');
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
        emailBoxEl.classList.remove('d-none');
        document.getElementById('password-box').classList.add('d-none');

        // Opt Out voice code anchor tag displayed
        changeVoiceCode.classList.remove('d-none');
        optOutOfVoiceCode.classList.add('d-none');
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

        /*
         * Redirect To Voice Code
         */
        if (isEmpty(voiceCodeEl.value)) {
            redirectToVoiceCodeText();
            showNotification(REDIRECT_TO_VOICE_CODE, window._constants.notification.error);
            return;
        }

        /*
         * Material Spinner for loading
         */
        materialSpinnerLoading.classList.remove('d-none');
        saveButtonEl.classList.add('d-none');

        // Post a new budget to the user budget module and change to auto generated as false.
        var values = {};
        values['voiceCode'] = document.getElementById('voice-code').value;
        values['username'] = document.getElementById('email').value;
        values['password'] = document.getElementById('password').value;
        values['deleteVoiceCode'] = deleteVoiceCodeIfPresent;

        // Ajax Requests on Error
        let ajaxData = {};
        ajaxData.isAjaxReq = true;
        ajaxData.type = "POST";
        ajaxData.url = "https://api.blitzbudget.com/alexa/voice-code";
        ajaxData.dataType = "json";
        ajaxData.contentType = "application/json;charset=UTF-8";
        ajaxData.data = JSON.stringify(values);
        ajaxData.onSuccess = function registerSuccess(result) {
            let timerInterval;
            Swal.fire({
                icon: 'success',
                title: 'Voice code saved successfully!',
                text: 'Now, You will be redirected to login again to finish the alexa linking process.',
                confirmButtonText: 'Redirect to login',
                confirmButtonColor: '#00bcd4',
            }).then((result) => {
                // Material Spinner Loading
                materialSpinnerLoading.classList.add('d-none');
                saveButtonEl.classList.remove('d-none');

                // Redirect to blitzbudget login
                window.location.href = OAUTH_AUTHORIZE_URL + QUERY_PARAMETER;
            })
        }
        ajaxData.onFailure = function (thrownError) {
            let responseJson = thrownError.responseJSON;
            if (isNotEmpty(responseJson)) {
                let message = isNotEmpty(responseJson.errorMessage) ? responseJson.errorMessage : responseJson.message;
                showNotification(message, window._constants.notification.error);
            } else {
                showNotification(GENERIC_ERROR, window._constants.notification.error);
            }

            materialSpinnerLoading.classList.add('d-none');
            saveButtonEl.classList.remove('d-none');
        }

        $.ajax({
            type: ajaxData.type,
            url: ajaxData.url,
            dataType: ajaxData.dataType,
            contentType: ajaxData.contentType,
            data: ajaxData.data,
            success: ajaxData.onSuccess,
            error: ajaxData.onFailure
        });

    });

    /*
     * Redirect To Voice Code Text
     */
    function redirectToVoiceCodeText() {
        /*
         * Upon clicking back button the input values are lost so, reset the page
         */
        if (isEmpty(voiceCodeEl.value)) {
            voiceCodeBoxEl.classList.remove('d-none');
            emailBoxEl.classList.add('d-none');
            passwordBoxEl.classList.add('d-none');
            // Change Button Element
            nextButtonEl.classList.remove('d-none');
            continueButtonEl.classList.add('d-none');
            saveButtonEl.classList.add('d-none');
            materialSpinnerLoading.classList.add('d-none');
            // Footer link
            optOutOfVoiceCode.classList.remove('d-none');
            changeVoiceCode.classList.add('d-none');
            forgotPasswordAnchor.classList.add('d-none');
            voiceCodeEl.focus();
        }
    }

    /*
     * Populate HREF
     */
    function populateHref() {
        document.getElementById('forgot-password').href = FORGOT_PASSWORD_URL + QUERY_PARAMETER;
    }

    /*
     *
     * Opt Out of Voice Code
     *
     */
    optOutOfVoiceCode.addEventListener('click', function () {
        deleteVoiceCodeIfPresent = true;
        // Remove Disabled from next button
        nextButtonEl.removeAttribute('disabled');
        // Next Button Click
        nextButtonEl.click();
        // If the Voice Code is not filled upto the fourth element
        if (voiceCodeEl.value.length < 4) {
            // Set Disabled from next button
            nextButtonEl.setAttribute('disabled', 'disabled');
        }
    });
}(jQuery));
