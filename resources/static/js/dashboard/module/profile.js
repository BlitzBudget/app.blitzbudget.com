"use strict";

(function scopeWrapper($) {

    // Custom Javascript for dashboard
    const PROFILE_CONSTANTS = {};

    // SECURITY: Defining Immutable properties as constants
    Object.defineProperties(PROFILE_CONSTANTS, {
        'resetAccountUrl': {
            value: '/profile/reset-account',
            writable: false,
            configurable: false
        },
        'userAttributeUrl': {
            value: '/profile/user-attribute',
            writable: false,
            configurable: false
        },
        'firstUserNameParam': {
            value: '?userName=',
            writable: false,
            configurable: false
        },
        'signinUrl': {
            value: window._config.api.invokeUrl + window._config.api.profile.signin,
            writable: false,
            configurable: false
        }
    });

    /**
     * START loading the page
     *
     */
    let currentPageInCookie = er.getCookie('currentPage');
    if (isEqual(currentPageInCookie, 'profilePage') || isEqual(currentPageInCookie, 'profilePgDD')) {
        if (isEqual(window.location.href, window._config.app.invokeUrl)) {
            populateCurrentPage('profilePage');
        }
    }

    let profilePage = document.getElementById('profilePage');
    if (isNotEmpty(profilePage)) {
        profilePage.addEventListener("click", function (e) {
            populateCurrentPage('profilePage');
        });
    }

    let profilePgDD = document.getElementById('profilePgDD');
    if (isNotEmpty(profilePgDD)) {
        profilePgDD.addEventListener("click", function (e) {
            populateCurrentPage('profilePage');
        });
    }

    function populateCurrentPage(page) {
        er.refreshCookiePageExpiry(page);
        er.fetchCurrentPage('/profile', function (data) {
            // Load the new HTML
            $('#mutableDashboard').html(data);
            // Translate current Page
            translatePage(getLanguage());
            /**
             * populate Profile
             **/
            displayUserDetailsProfile();
            displayCreatedDate();
            // Href pointing to send Feature request with appropriate parameters
            let featureRequest = document.getElementById('sendFeatureRequest');
            if (!includesStr(featureRequest.href, '?email_id')) {
                featureRequest.href = featureRequest.href + '?email_id=' + currentUser.email;
            }
            // Set Current Page
            let currentPage = document.getElementById('currentPage');
            currentPage.setAttribute('data-i18n', 'profile.page.title');
            currentPage.textContent = isNotEmpty(window.translationData) ? window.translationData.profile.dynamic.title : 'Profile';

            /**
             *  Add Functionality Generic + Btn
             **/

            // Generic Add Functionality
            let genericAddFnc = document.getElementById('genericAddFnc');
            genericAddFnc.classList.add('d-none');
        });
    }

    /**
     *	Display User Created Date
     **/
    function displayCreatedDate() {
        // Ajax Requests on Error
        let ajaxData = {};
        ajaxData.isAjaxReq = true;
        ajaxData.type = 'GET';
        ajaxData.url = _config.api.invokeUrl + PROFILE_CONSTANTS.userAttributeUrl + PROFILE_CONSTANTS.firstUserNameParam + currentUser.email;
        ajaxData.onSuccess = function (result) {
            let userCreationDate = result.UserCreateDate;
            document.getElementById('userCreationDate').textContent = months[Number(userCreationDate.substring(5, 7)) - 1] + ' ' + userCreationDate.substring(0, 4);
        }
        ajaxData.onFailure = function (thrownError) {
            let createddateerror = isNotEmpty(window.translationData) ? window.translationData.profile.dynamic.createerror : "There was an error while fetching user information!";
            manageErrors(thrownError, createddateerror, ajaxData);
        }
        jQuery.ajax({
            url: ajaxData.url,
            beforeSend: function (xhr) {
                xhr.setRequestHeader("Authorization", authHeader);
            },
            type: ajaxData.type,
            contentType: ajaxData.contentType,
            data: ajaxData.data,
            success: ajaxData.onSuccess,
            error: ajaxData.onFailure
        });
    }

    /**
     *  Display User Details
     **/
    function displayUserDetailsProfile() {
        // User Name
        let userName = currentUser.name + ' ' + currentUser.family_name;
        document.getElementById('userNameProfileDisplay').textContent = userName;

        // Email
        document.getElementById('emailProfileDisplay').textContent = currentUser.email;

    }

    // Old Password Key Up listener
    $(document).on('keyup', "#oldPasswordCP", function (e) {
        let oldPassword = this.value;
        let newPassword = document.getElementById('newPassCP').value;
        let changePassBtn = document.getElementsByClassName('swal2-confirm')[0];

        let keyCode = e.keyCode || e.which;
        if (keyCode === 13) {
            document.activeElement.blur();
            e.preventDefault();
            e.stopPropagation();
            // Click the confirm button to continue
            document.getElementById('newPassCP').focus();
            return false;
        }

        if ((isNotEmpty(oldPassword) && oldPassword.length >= 8) && (isNotEmpty(newPassword) && newPassword.length >= 8)) {
            changePassBtn.removeAttribute('disabled');
        } else {
            changePassBtn.setAttribute('disabled', 'disabled');
        }

    });

    // Focus out Old password
    $(document).on('focusout', "#oldPasswordCP", function () {
        let oldPassword = this.value;
        let errorCPOld = document.getElementById('cpErrorDispOld');
        let errorCPNew = document.getElementById('cpErrorDispNew');

        if (isEmpty(oldPassword) || oldPassword.length < 8) {
            errorCPNew.textContent = '';
            errorCPOld.textContent = isNotEmpty(window.translationData) ? window.translationData.profile.dynamic.mininumpassworderror : 'The current password field should have a minimum length of 8 characters.';
            return;
        }

    });

    // Focus out New password
    $(document).on('focusout', "#newPassCP", function () {
        let newPassword = this.value;
        let errorCPNew = document.getElementById('cpErrorDispNew');
        let errorCPOld = document.getElementById('cpErrorDispOld');

        if (isEmpty(newPassword) || newPassword.length < 8) {
            errorCPOld.textContent = '';
            errorCPNew.textContent = isNotEmpty(window.translationData) ? window.translationData.profile.dynamic.newminimumerror : 'The new password should have a minimum length of 8 characters.';
            return;
        }
    });

    // New Password Key Up listener
    $(document).on('keyup', "#newPassCP", function (e) {
        let newPassword = this.value;
        let oldPasswordCP = document.getElementById('oldPasswordCP').value;
        let changePassBtn = document.getElementsByClassName('swal2-confirm')[0];

        let keyCode = e.keyCode || e.which;
        if (keyCode === 13) {
            document.activeElement.blur();
            e.preventDefault();
            e.stopPropagation();
            // Click the confirm button to continue
            changePassBtn.click();
            return false;
        }

        if ((isNotEmpty(newPassword) && newPassword.length >= 8) && (isNotEmpty(oldPasswordCP) && oldPasswordCP.length >= 8)) {
            changePassBtn.removeAttribute('disabled');
        } else {
            changePassBtn.setAttribute('disabled', 'disabled');
        }

    });

    function changePasswordFrag() {
        let changePassFrag = document.createDocumentFragment();

        // Old Password
        let oldPassWrapper = document.createElement('div');
        oldPassWrapper.setAttribute('data-gramm_editor', "false");
        oldPassWrapper.classList = 'oldPassWrapper text-left';

        let oldPassLabel = document.createElement('label');
        oldPassLabel.textContent = isNotEmpty(window.translationData) ? window.translationData.profile.dynamic.changepassword.oldpassword : 'Old Password';
        oldPassWrapper.appendChild(oldPassLabel);


        let dropdownGroupOP = document.createElement('div');
        dropdownGroupOP.classList = 'btn-group d-md-block d-block';

        let oldPassInput = document.createElement('input');
        oldPassInput.id = 'oldPasswordCP';
        oldPassInput.setAttribute('type', 'password');
        oldPassInput.setAttribute('autocapitalize', 'off');
        oldPassInput.setAttribute('spellcheck', 'false');
        oldPassInput.setAttribute('autocorrect', 'off');
        oldPassInput.setAttribute('autocomplete', 'off');
        dropdownGroupOP.appendChild(oldPassInput);

        let dropdownTriggerOP = document.createElement('button');
        dropdownTriggerOP.classList = 'changeDpt btn btn-info';
        dropdownTriggerOP.setAttribute('data-toggle', 'dropdown');
        dropdownTriggerOP.setAttribute('aria-haspopup', 'true');
        dropdownTriggerOP.setAttribute('aria-expanded', 'false');

        let miEye = document.createElement('i');
        miEye.classList = 'material-icons';
        miEye.textContent = 'remove_red_eye';
        dropdownTriggerOP.appendChild(miEye);
        dropdownGroupOP.appendChild(dropdownTriggerOP);
        oldPassWrapper.appendChild(dropdownGroupOP);

        // Error Text
        let errorCPOld = document.createElement('div');
        errorCPOld.id = 'cpErrorDispOld';
        errorCPOld.classList = 'text-danger text-left small mb-2 noselect';
        oldPassWrapper.appendChild(errorCPOld);
        changePassFrag.appendChild(oldPassWrapper);

        // New Password
        let newPassInput = document.createElement('div');
        newPassInput.setAttribute('data-gramm_editor', "false");
        newPassInput.classList = 'newPassInput text-left';

        let newPassLabel = document.createElement('label');
        newPassLabel.textContent = isNotEmpty(window.translationData) ? window.translationData.profile.dynamic.changepassword.newpassword : 'New Password';
        newPassLabel.appendChild(informationIconSVG());
        newPassInput.appendChild(newPassLabel);

        let dropdownGroupNP = document.createElement('div');
        dropdownGroupNP.classList = 'btn-group d-md-block d-block';

        let newPassNameInput = document.createElement('input');
        newPassNameInput.id = 'newPassCP';
        newPassNameInput.setAttribute('type', 'password');
        newPassNameInput.setAttribute('autocapitalize', 'off');
        newPassNameInput.setAttribute('spellcheck', 'false');
        newPassNameInput.setAttribute('autocorrect', 'off');
        newPassNameInput.setAttribute('autocomplete', 'off');
        dropdownGroupNP.appendChild(newPassNameInput);

        let dropdownTriggerNP = document.createElement('button');
        dropdownTriggerNP.classList = 'changeDpt btn btn-info';
        dropdownTriggerNP.setAttribute('data-toggle', 'dropdown');
        dropdownTriggerNP.setAttribute('aria-haspopup', 'true');
        dropdownTriggerNP.setAttribute('aria-expanded', 'false');

        let miEyeNP = document.createElement('i');
        miEyeNP.classList = 'material-icons';
        miEyeNP.textContent = 'remove_red_eye';
        dropdownTriggerNP.appendChild(miEyeNP);
        dropdownGroupNP.appendChild(dropdownTriggerNP);
        newPassInput.appendChild(dropdownGroupNP);

        // Error Text
        let errorCP = document.createElement('div');
        errorCP.id = 'cpErrorDispNew';
        errorCP.classList = 'text-danger text-left small mb-2 noselect';
        newPassInput.appendChild(errorCP);
        changePassFrag.appendChild(newPassInput);

        return changePassFrag;
    }

    // Build info icon for password
    function informationIconSVG() {
        let svgElement = document.createElementNS("http://www.w3.org/2000/svg", 'svg');
        svgElement.setAttribute('width', '20');
        svgElement.setAttribute('height', '20');
        svgElement.setAttribute('viewBox', '0 0 25 29');
        svgElement.setAttribute('class', 'align-middle fill-info ml-1');
        svgElement.setAttribute('id', 'input-pass-cp');
        svgElement.setAttribute('data-original-title', '<div class="text-left"><span>Your password must:</span> <br> <ul class="text-left tooltip-color mt-2"><li>Be at least 8 characters</li><li>Have at least one number</li><li>Have at least one symbol</li><li>Have at least one upper case letter</li><li>Have at least one lower case letter</li></ul></div>');
        svgElement.setAttribute('data-placement', 'right');

        let pathElement1 = document.createElementNS("http://www.w3.org/2000/svg", 'path');
        pathElement1.setAttribute('d', 'M 12 2 C 6.4889971 2 2 6.4889971 2 12 C 2 17.511003 6.4889971 22 12 22 C 17.511003 22 22 17.511003 22 12 C 22 6.4889971 17.511003 2 12 2 z M 12 4 C 16.430123 4 20 7.5698774 20 12 C 20 16.430123 16.430123 20 12 20 C 7.5698774 20 4 16.430123 4 12 C 4 7.5698774 7.5698774 4 12 4 z M 11 7 L 11 9 L 13 9 L 13 7 L 11 7 z M 11 11 L 11 17 L 13 17 L 13 11 L 11 11 z');
        svgElement.appendChild(pathElement1);

        return svgElement;
    }

    // Change Password Flow
    function changePassword(oldPassword, newPassword) {

        // Authentication Details
        let values = {};
        values.previousPassword = oldPassword;
        values.newPassword = newPassword;
        /*
         * GET Access Token before changing password
         */
        if (isEmpty(window.accessToken)) {
            window.accessToken = localStorage.getItem("accessToken");
        }
        values.accessToken = window.accessToken;

        // Ajax Requests on Error
        let ajaxData = {};
        ajaxData.isAjaxReq = true;
        ajaxData.type = "POST";
        ajaxData.url = window._config.api.invokeUrl + window._config.api.profile.changePassword;
        ajaxData.dataType = "json";
        ajaxData.contentType = "application/json;charset=UTF-8";
        ajaxData.data = JSON.stringify(values);
        ajaxData.onSuccess = function (data) {
            showNotification(window.translationData.profile.dynamic.changepassword.success, window._constants.notification.success);
        }
        ajaxData.onFailure = function (data) {
            showNotification(data.message, window._constants.notification.error);
            return;
        }

        $.ajax({
            type: ajaxData.type,
            url: ajaxData.url,
            beforeSend: function (xhr) {
                xhr.setRequestHeader("Authorization", authHeader);
            },
            dataType: ajaxData.dataType,
            contentType: ajaxData.contentType,
            data: ajaxData.data,
            success: ajaxData.onSuccess,
            error: ajaxData.onFailure
        });

    }

    /**
     *  Change Password Flow (Profile)
     **/
    $('body').on('click', '#changePasswordProfile', function (e) {
        // Show Sweet Alert
        Swal.fire({
            title: isNotEmpty(window.translationData) ? window.translationData.profile.dynamic.changepassword.change : 'Change Password',
            html: changePasswordFrag(),
            inputAttributes: {
                autocapitalize: 'on'
            },
            confirmButtonClass: 'changePassword btn btn-info',
            confirmButtonText: window.translationData.profile.dynamic.changepassword.button,
            showCloseButton: true,
            buttonsStyling: false,
            showLoaderOnConfirm: true,
            preConfirm: () => {
                return new Promise(function (resolve) {
                    let confPasswordUA = document.getElementById('oldPasswordCP');

                    // Authentication Details
                    let values = {};
                    values.username = currentUser.email;
                    values.password = confPasswordUA.value;
                    values.checkPassword = true;

                    // Authenticate Before cahnging password
                    $.ajax({
                        type: 'POST',
                        url: PROFILE_CONSTANTS.signinUrl,
                        dataType: 'json',
                        contentType: "application/json;charset=UTF-8",
                        data: JSON.stringify(values),
                        success: function (result) {
                            // Hide loading
                            Swal.hideLoading();
                            // Resolve the promise
                            resolve();

                        },
                        error: function (err) {
                            // Error Message
                            let errMessage = lastElement(splitElement(err.responseJSON.errorMessage, ':'));
                            // Hide loading
                            Swal.hideLoading();
                            // Show error message
                            Swal.showValidationMessage(
                                `${errMessage}`
                            );
                            // Change Focus to password field
                            confPasswordUA.focus();
                        }
                    });
                });
            },
            allowOutsideClick: () => !Swal.isLoading(),
            closeOnClickOutside: () => !Swal.isLoading()
        }).then(function (result) {
            // Hide the validation message if present
            Swal.resetValidationMessage()
            let newPassword = document.getElementById("newPassCP").value;
            let oldPassword = document.getElementById('oldPasswordCP').value;
            // If confirm button is clicked
            if (result.value) {
                // dispose the tool tip once the swal is closed
                $("#input-pass-cp").tooltip("dispose");
                changePassword(oldPassword, newPassword);
            }

        });

        // Initialize the tool tip for password
        $("#input-pass-cp").tooltip({
            html: true,
            delay: {
                "show": 300,
                "hide": 100
            },
            template: '<div class="tooltip" role="tooltip"><div class="arrow"></div><div class="tooltip-inner bs-tooltip-cp"></div></div>'
        });

        // Disable Change Password button 
        let changePassBtn = document.getElementsByClassName('swal2-confirm')[0];
        if (!changePassBtn.disabled) {
            changePassBtn.setAttribute('disabled', 'disabled');
        }

        // Change focus to Old password
        document.getElementById('oldPasswordCP').focus();
    });

    // Reset Account
    $('body').on('click', '#resetBBAccount', function (e) {
        Swal.fire({
            title: isNotEmpty(window.translationData) ? window.translationData.profile.dynamic.reset.title : 'Reset your Blitz Budget user account',
            html: resetBBAccount(),
            inputAttributes: {
                autocapitalize: 'on'
            },
            icon: 'info',
            showCancelButton: true,
            showCloseButton: true,
            confirmButtonText: isNotEmpty(window.translationData) ? window.translationData.profile.dynamic.reset.yes : 'Yes, reset it!',
            cancelButtonText: isNotEmpty(window.translationData) ? window.translationData.profile.dynamic.reset.no : 'No, keep it',
            confirmButtonClass: "btn btn-info",
            cancelButtonClass: "btn btn-secondary",
            buttonsStyling: false,
            showLoaderOnConfirm: true,
            preConfirm: () => {
                return new Promise(function (resolve) {
                    let confPasswordUA = document.getElementById('oldPasswordRP');
                    // Authentication Details
                    let values = {};
                    values.username = currentUser.email;
                    values.password = confPasswordUA.value;
                    values.checkPassword = true;

                    // Authenticate Before cahnging password
                    $.ajax({
                        type: 'POST',
                        url: PROFILE_CONSTANTS.signinUrl,
                        dataType: 'json',
                        contentType: "application/json;charset=UTF-8",
                        data: JSON.stringify(values),
                        success: function (result) {
                            // Hide loading
                            Swal.hideLoading();
                            // Resolve the promise
                            resolve();

                        },
                        error: function (err) {
                            // Error Message
                            let errMessage = lastElement(splitElement(err.responseJSON.errorMessage, ':'));
                            // Hide loading
                            Swal.hideLoading();
                            // Show error message
                            Swal.showValidationMessage(
                                `${errMessage}`
                            );
                            // Change Focus to password field
                            confPasswordUA.focus();
                        }
                    });
                });
            },
            allowOutsideClick: () => !Swal.isLoading(),
            closeOnClickOutside: () => !Swal.isLoading()
        }).then(function (result) {
            // Hide the validation message if present
            Swal.resetValidationMessage()
            // If the Reset Button is pressed
            if (result.value) {
                let values = {};
                values.walletId = currentUser.financialPortfolioId;
                values.deleteAccount = false;

                // Ajax Requests on Error
                let ajaxData = {};
                ajaxData.isAjaxReq = true;
                ajaxData.type = 'POST';
                ajaxData.url = window._config.api.invokeUrl + PROFILE_CONSTANTS.resetAccountUrl;
                ajaxData.dataType = "json";
                ajaxData.contentType = "application/json;charset=UTF-8";
                ajaxData.data = JSON.stringify(values);
                ajaxData.onSuccess = function (jsonObj) {
                    showNotification(window.translationData.profile.dynamic.reset.success, window._constants.notification.success);
                    // Delete Wallet Id and Wallet Currency
                    delete window.currentUser.walletId;
                    delete window.currentUser.walletCurrency;
                    localStorage.setItem("currentUserSI", JSON.stringify(window.currentUser));
                }
                ajaxData.onFailure = function (thrownError) {
                    manageErrors(thrownError, window.translationData.profile.dynamic.reset.error, ajaxData);
                }
                jQuery.ajax({
                    url: ajaxData.url,
                    beforeSend: function (xhr) {
                        xhr.setRequestHeader("Authorization", authHeader);
                    },
                    type: ajaxData.type,
                    dataType: ajaxData.dataType,
                    contentType: ajaxData.contentType,
                    data: ajaxData.data,
                    success: ajaxData.onSuccess,
                    error: ajaxData.onFailure
                });
            }

        });

        // Disable Change Password button
        let resetBBBtn = document.getElementsByClassName('swal2-confirm')[0];
        if (!resetBBBtn.disabled) {
            resetBBBtn.setAttribute('disabled', 'disabled');
        }

        // Change Focus to Confirm Password
        document.getElementById('oldPasswordRP').focus();
    });

    // Delete button
    $('body').on('click', '#deleteBBAccount', function (e) {

        Swal.fire({
            title: window.translationData.profile.dynamic.delete.title,
            html: deleteBBAccount(),
            inputAttributes: {
                autocapitalize: 'on'
            },
            icon: 'info',
            showCancelButton: true,
            showCloseButton: true,
            confirmButtonText: window.translationData.profile.dynamic.delete.yes,
            cancelButtonText: window.translationData.profile.dynamic.delete.no,
            confirmButtonClass: "btn btn-info",
            cancelButtonClass: "btn btn-secondary",
            buttonsStyling: false,
            showLoaderOnConfirm: true,
            preConfirm: () => {
                return new Promise(function (resolve) {
                    let confPasswordUA = document.getElementById('oldPasswordDA');
                    // Authentication Details
                    let values = {};
                    values.username = currentUser.email;
                    values.password = confPasswordUA.value;
                    values.checkPassword = true;

                    // Authenticate Before cahnging password
                    $.ajax({
                        type: 'POST',
                        url: PROFILE_CONSTANTS.signinUrl,
                        dataType: 'json',
                        contentType: "application/json;charset=UTF-8",
                        data: JSON.stringify(values),
                        success: function (result) {
                            // Hide loading
                            Swal.hideLoading();
                            // Resolve the promise
                            resolve();

                        },
                        error: function (err) {
                            // Error Message
                            let errMessage = lastElement(splitElement(err.responseJSON.errorMessage, ':'));
                            // Hide loading
                            Swal.hideLoading();
                            // Show error message
                            Swal.showValidationMessage(
                                `${errMessage}`
                            );
                            // Change Focus to password field
                            confPasswordUA.focus();
                        }
                    });
                });
            },
            allowOutsideClick: () => !Swal.isLoading(),
            closeOnClickOutside: () => !Swal.isLoading()
        }).then(function (result) {
            // Hide the validation message if present
            Swal.resetValidationMessage()
            // If the Delete Button is pressed
            if (result.value) {
                let values = {};
                values.userName = currentUser.email;
                values.walletId = currentUser.financialPortfolioId;
                values.deleteAccount = true;

                // Ajax Requests on Error
                let ajaxData = {};
                ajaxData.isAjaxReq = true;
                ajaxData.type = 'POST';
                ajaxData.url = _config.api.invokeUrl + PROFILE_CONSTANTS.resetAccountUrl;
                ajaxData.dataType = "json";
                ajaxData.contentType = "application/json;charset=UTF-8";
                ajaxData.data = JSON.stringify(values);
                ajaxData.onSuccess = function (jsonObj) {
                    localStorage.clear();
                    window.location.href = window._config.home.invokeUrl;
                }
                ajaxData.onFailure = function (thrownError) {
                    manageErrors(thrownError, window.translationData.profile.dynamic.delete.error, ajaxData);
                }
                jQuery.ajax({
                    url: ajaxData.url,
                    beforeSend: function (xhr) {
                        xhr.setRequestHeader("Authorization", authHeader);
                    },
                    type: ajaxData.type,
                    dataType: ajaxData.dataType,
                    contentType: ajaxData.contentType,
                    data: ajaxData.data,
                    success: ajaxData.onSuccess,
                    error: ajaxData.onFailure
                });
            }

        });

        // Disable Change Password button
        let deleteBBBtn = document.getElementsByClassName('swal2-confirm')[0];
        if (!deleteBBBtn.disabled) {
            deleteBBBtn.setAttribute('disabled', 'disabled');
        }

        // Change focus to old password
        document.getElementById('oldPasswordDA').focus();
    });

    // Reset BB Account
    function resetBBAccount() {
        let resetPassFrag = document.createDocumentFragment();

        // Warning Text
        let warnDiv = document.createElement('div');
        warnDiv.classList = 'noselect text-left mb-3 fs-90';
        warnDiv.innerHTML = window.translationData.profile.dynamic.reset.swal.title + ' <strong>' + currentUser.email + '</strong>' + window.translationData.profile.dynamic.reset.swal.title2 + '<strong>' + window.translationData.profile.dynamic.reset.swal.title3 + '</strong>' + window.translationData.profile.dynamic.reset.swal.title4;
        resetPassFrag.appendChild(warnDiv);

        // UL tag
        let ulWarn = document.createElement('ul');
        ulWarn.classList = 'noselect text-left mb-3 fs-90';

        let liOne = document.createElement('li');
        liOne.textContent = window.translationData.profile.dynamic.reset.swal.transactions;
        ulWarn.appendChild(liOne);

        let liTwo = document.createElement('li');
        liTwo.textContent = window.translationData.profile.dynamic.reset.swal.budgets;
        ulWarn.appendChild(liTwo);

        let liThree = document.createElement('li');
        liThree.textContent = window.translationData.profile.dynamic.reset.swal.goals;
        ulWarn.appendChild(liThree);

        let liFour = document.createElement('li');
        liFour.textContent = window.translationData.profile.dynamic.reset.swal.bankaccounts;
        ulWarn.appendChild(liFour);

        let liFive = document.createElement('li');
        liFive.textContent = window.translationData.profile.dynamic.reset.swal.wallets;
        ulWarn.appendChild(liFive);

        let liSix = document.createElement('li');
        liSix.textContent = window.translationData.profile.dynamic.reset.swal.investments;
        ulWarn.appendChild(liSix);
        resetPassFrag.appendChild(ulWarn);

        // Subscription
        let subsText = document.createElement('div');
        subsText.classList = 'noselect text-left mb-3 fs-90';
        subsText.textContent = window.translationData.profile.dynamic.reset.swal.premium;
        resetPassFrag.appendChild(subsText);

        // Old Password
        let oldPassWrapper = document.createElement('div');
        oldPassWrapper.setAttribute('data-gramm_editor', "false");
        oldPassWrapper.classList = 'oldPassWrapper text-left';

        let oldPassLabel = document.createElement('label');
        oldPassLabel.textContent = window.translationData.profile.dynamic.reset.swal.confirm;
        oldPassWrapper.appendChild(oldPassLabel);


        let dropdownGroupOP = document.createElement('div');
        dropdownGroupOP.classList = 'btn-group d-md-block d-block';

        let oldPassInput = document.createElement('input');
        oldPassInput.id = 'oldPasswordRP';
        oldPassInput.setAttribute('type', 'password');
        oldPassInput.setAttribute('autocapitalize', 'off');
        oldPassInput.setAttribute('spellcheck', 'false');
        oldPassInput.setAttribute('autocorrect', 'off');
        dropdownGroupOP.appendChild(oldPassInput);

        let dropdownTriggerOP = document.createElement('button');
        dropdownTriggerOP.classList = 'changeDpt btn btn-info';
        dropdownTriggerOP.setAttribute('data-toggle', 'dropdown');
        dropdownTriggerOP.setAttribute('aria-haspopup', 'true');
        dropdownTriggerOP.setAttribute('aria-expanded', 'false');

        let miEye = document.createElement('i');
        miEye.classList = 'material-icons';
        miEye.textContent = 'remove_red_eye';
        dropdownTriggerOP.appendChild(miEye);
        dropdownGroupOP.appendChild(dropdownTriggerOP);
        oldPassWrapper.appendChild(dropdownGroupOP);

        // Error Text
        let errorCPOld = document.createElement('div');
        errorCPOld.id = 'cpErrorDispOldRA';
        errorCPOld.classList = 'text-danger text-left small mb-2 noselect';
        oldPassWrapper.appendChild(errorCPOld);
        resetPassFrag.appendChild(oldPassWrapper);

        return resetPassFrag;
    }

    // New Password Key Up listener For Reset Password
    $(document).on('keyup', "#oldPasswordRP", function (e) {

        let resetAccountBtn = document.getElementsByClassName('swal2-confirm')[0];
        let errorDispRA = document.getElementById('cpErrorDispOldRA');
        let passwordEnt = this.value;

        if (isEmpty(passwordEnt) || passwordEnt.length < 8) {
            resetAccountBtn.setAttribute('disabled', 'disabled');
            return;
        }

        errorDispRA.textContent = '';
        resetAccountBtn.removeAttribute('disabled');

        let keyCode = e.keyCode || e.which;
        if (keyCode === 13) {
            document.activeElement.blur();
            e.preventDefault();
            e.stopPropagation();
            // Click the confirm button of SWAL
            resetAccountBtn.click();
            return false;
        }

    });

    // On focus out Listener for Reset password
    $(document).on('focusout', "#oldPasswordRP", function () {

        let resetAccountBtn = document.getElementsByClassName('swal2-confirm')[0];
        let errorDispRA = document.getElementById('cpErrorDispOldRA');
        let passwordEnt = this.value;

        if (isEmpty(passwordEnt) || passwordEnt.length < 8) {
            errorDispRA.textContent = window.translationData.profile.dynamic.confirmpassword.error;
            resetAccountBtn.setAttribute('disabled', 'disabled');
            return;
        }

        errorDispRA.textContent = '';

    });

    // Delete BB Account
    function deleteBBAccount() {
        let deletePassFrag = document.createDocumentFragment();

        // Warning Text
        let warnDiv = document.createElement('div');
        warnDiv.classList = 'noselect text-left mb-3 fs-90';
        warnDiv.innerHTML = window.translationData.profile.dynamic.delete.swal.title + ' <strong>' + currentUser.email + '</strong>' + window.translationData.profile.dynamic.delete.swal.title2 + '<strong>' + window.translationData.profile.dynamic.delete.swal.title3 + window.translationData.profile.dynamic.delete.swal.title4;
        deletePassFrag.appendChild(warnDiv);

        // UL tag
        let ulWarn = document.createElement('ul');
        ulWarn.classList = 'noselect text-left mb-3 fs-90';

        let liOne = document.createElement('li');
        liOne.innerHTML = window.translationData.profile.dynamic.delete.swal.alldata + '<strong>' + window.translationData.profile.dynamic.delete.swal.alldata2 + '</strong>' + window.translationData.profile.dynamic.delete.swal.alldata3;
        ulWarn.appendChild(liOne);

        let liTwo = document.createElement('li');
        liTwo.textContent = window.translationData.profile.dynamic.delete.swal.premium;
        ulWarn.appendChild(liTwo);

        let liThree = document.createElement('li');
        liThree.textContent = window.translationData.profile.dynamic.delete.swal.account;
        ulWarn.appendChild(liThree);
        deletePassFrag.appendChild(ulWarn);

        // Subscription
        let subsText = document.createElement('div');
        subsText.classList = 'noselect text-left mb-3 fs-90';
        subsText.textContent = window.translationData.profile.dynamic.delete.swal.consider;
        deletePassFrag.appendChild(subsText);

        // Old Password
        let oldPassWrapper = document.createElement('div');
        oldPassWrapper.setAttribute('data-gramm_editor', "false");
        oldPassWrapper.classList = 'oldPassWrapper text-left';

        let oldPassLabel = document.createElement('label');
        oldPassLabel.textContent = window.translationData.profile.dynamic.delete.swal.confirm;
        oldPassWrapper.appendChild(oldPassLabel);


        let dropdownGroupOP = document.createElement('div');
        dropdownGroupOP.classList = 'btn-group d-md-block d-block';

        let oldPassInput = document.createElement('input');
        oldPassInput.id = 'oldPasswordDA';
        oldPassInput.setAttribute('type', 'password');
        oldPassInput.setAttribute('autocapitalize', 'off');
        oldPassInput.setAttribute('spellcheck', 'false');
        oldPassInput.setAttribute('autocorrect', 'off');
        dropdownGroupOP.appendChild(oldPassInput);

        let dropdownTriggerOP = document.createElement('button');
        dropdownTriggerOP.classList = 'changeDpt btn btn-info';
        dropdownTriggerOP.setAttribute('data-toggle', 'dropdown');
        dropdownTriggerOP.setAttribute('aria-haspopup', 'true');
        dropdownTriggerOP.setAttribute('aria-expanded', 'false');

        let miEye = document.createElement('i');
        miEye.classList = 'material-icons';
        miEye.textContent = 'remove_red_eye';
        dropdownTriggerOP.appendChild(miEye);
        dropdownGroupOP.appendChild(dropdownTriggerOP);
        oldPassWrapper.appendChild(dropdownGroupOP);

        // Error Text
        let errorCPOld = document.createElement('div');
        errorCPOld.id = 'cpErrorDispOldDA';
        errorCPOld.classList = 'text-danger text-left small mb-2 noselect';
        oldPassWrapper.appendChild(errorCPOld);
        deletePassFrag.appendChild(oldPassWrapper);

        return deletePassFrag;
    }

    // Confirm Password Key Up listener For Delete User
    $(document).on('keyup', "#oldPasswordDA", function (e) {

        let deleteAccountBtn = document.getElementsByClassName('swal2-confirm')[0];
        let errorDispRA = document.getElementById('cpErrorDispOldDA');
        let passwordEnt = this.value;

        if (isEmpty(passwordEnt) || passwordEnt.length < 8) {
            deleteAccountBtn.setAttribute('disabled', 'disabled');
            return;
        }

        errorDispRA.textContent = '';
        deleteAccountBtn.removeAttribute('disabled');

        // Delete Account
        let keyCode = e.keyCode || e.which;
        if (keyCode === 13) {
            document.activeElement.blur();
            e.preventDefault();
            e.stopPropagation();
            // Click the confirm button of SWAL
            deleteAccountBtn.click();
            return false;
        }
    });

    // Confirm Password Focus Out listener For Delete User
    $(document).on('focusout', "#oldPasswordDA", function () {

        let deleteAccountBtn = document.getElementsByClassName('swal2-confirm')[0];
        let errorDispRA = document.getElementById('cpErrorDispOldDA');
        let passwordEnt = this.value;

        if (isEmpty(passwordEnt) || passwordEnt.length < 8) {
            errorDispRA.textContent = window.translationData.profile.dynamic.oldpassworderror;
            deleteAccountBtn.setAttribute('disabled', 'disabled');
            return;
        }

        errorDispRA.textContent = '';

    });

    // Change User Name
    $('body').on('click', '#userNameEdit', function (e) {
        // Hide the Element
        this.classList.add('d-none');
        // Name
        let userNameProfileDisplay = document.getElementById('userNameProfileDisplay').classList;
        userNameProfileDisplay.add('d-none');
        // Change the User Name
        let userNameModInp = document.getElementById('userNameModInp');
        userNameModInp.value = currentUser.name + ' ' + currentUser.family_name;
        // Display Edit Form
        let userNameEditProf = document.getElementById('userNameEditProf');
        userNameEditProf.classList.remove('d-none');
        userNameEditProf.classList.add('d-block');

        // Change Focus to element
        document.getElementById('userNameModInp').focus();
    });

    // Click Enter to Change Name and Last Name
    $('body').on('keyup', '#userNameModInp', function (e) {
        let keyCode = e.keyCode || e.which;
        if (keyCode === 13) {
            // Enter key
            document.activeElement.blur();
            e.preventDefault();
            // Edit first name and last name
            editUserDetailsFNAndLN();
        } else if (e.keyCode === 27) {
            // ESC key
            document.activeElement.blur();
            e.preventDefault();
            e.stopPropagation();

            // Name
            let userNameProfileDisplay = document.getElementById('userNameProfileDisplay').classList;
            userNameProfileDisplay.remove('d-none');

            // Display Edit Form
            let userNameEditProf = document.getElementById('userNameEditProf');
            userNameEditProf.classList.remove('d-block');
            userNameEditProf.classList.add('d-none');

            // Edit Button
            let userNameEdit = document.getElementById('userNameEdit');
            userNameEdit.classList.remove('d-none');
        }
    });

    // User Edit Complete Btn
    $('body').on('click', '#userNameEdiBtn', function (e) {
        editUserDetailsFNAndLN();
    });

    function editUserDetailsFNAndLN() {
        // Name
        let userNameProfileDisplay = document.getElementById('userNameProfileDisplay').classList;
        userNameProfileDisplay.remove('d-none');

        // Display Edit Form
        let userNameEditProf = document.getElementById('userNameEditProf');
        userNameEditProf.classList.remove('d-block');
        userNameEditProf.classList.add('d-none');

        // Edit Button
        let userNameEdit = document.getElementById('userNameEdit');
        userNameEdit.classList.remove('d-none');

        // Update First Name and Last Name
        let userNameModInp = document.getElementById('userNameModInp').value;
        let userNameLis = splitElement(userNameModInp, ' ');

        if (userNameLis.length < 1) {
            showNotification('First name and last name cannot be empty', window._constants.notification.error);
            return;
        }

        /*
         * Build first name and second name
         */
        let firstName, lastName;
        if (Array.isArray(userNameLis)) {
            firstName = userNameLis[0];
            lastName = userNameLis.length > 1 ? userNameLis[1] : ' ';
        } else {
            firstName = userNameLis;
            lastName = ' ';
        }


        // If Authenticated User is present
        updateUserName(firstName, lastName);
    }

    function confirmPasswordFrag() {
        let confPassFrag = document.createDocumentFragment();

        // Old Password
        let oldPassWrapper = document.createElement('div');
        oldPassWrapper.setAttribute('data-gramm_editor', "false");
        oldPassWrapper.classList = 'oldPassWrapper text-left';

        let oldPassLabel = document.createElement('label');
        oldPassLabel.textContent = window.translationData.profile.dynamic.confirmpassword.title;
        oldPassWrapper.appendChild(oldPassLabel);


        let dropdownGroupOP = document.createElement('div');
        dropdownGroupOP.classList = 'btn-group d-md-block d-block';

        let oldPassInput = document.createElement('input');
        oldPassInput.id = 'confPasswordUA';
        oldPassInput.setAttribute('type', 'password');
        oldPassInput.setAttribute('autocapitalize', 'off');
        oldPassInput.setAttribute('spellcheck', 'false');
        oldPassInput.setAttribute('autocorrect', 'off');
        dropdownGroupOP.appendChild(oldPassInput);

        let dropdownTriggerOP = document.createElement('button');
        dropdownTriggerOP.classList = 'changeDpt btn btn-info';
        dropdownTriggerOP.setAttribute('data-toggle', 'dropdown');
        dropdownTriggerOP.setAttribute('aria-haspopup', 'true');
        dropdownTriggerOP.setAttribute('aria-expanded', 'false');

        let miEye = document.createElement('i');
        miEye.classList = 'material-icons';
        miEye.textContent = 'remove_red_eye';
        dropdownTriggerOP.appendChild(miEye);
        dropdownGroupOP.appendChild(dropdownTriggerOP);
        oldPassWrapper.appendChild(dropdownGroupOP);

        // Error Text
        let errorCPOld = document.createElement('div');
        errorCPOld.id = 'cpErrorDispUA';
        errorCPOld.classList = 'text-danger text-left small mb-2 noselect';
        oldPassWrapper.appendChild(errorCPOld);
        confPassFrag.appendChild(oldPassWrapper);

        return confPassFrag;
    }


    // Update User Attribute
    function updateUserName(firstName, lastName) {
        let userNameProfileDisplay = document.getElementById('userNameProfileDisplay')
        let userNameDispText = userNameProfileDisplay.textContent;
        userNameProfileDisplay.textContent = firstName + ' ' + lastName;

        let values = {
            "name": firstName,
            "family_name": lastName,
            "userName": currentUser.email
        };

        // Ajax Requests on Error
        let ajaxData = {};
        ajaxData.isAjaxReq = true;
        ajaxData.type = 'POST';
        ajaxData.url = _config.api.invokeUrl + PROFILE_CONSTANTS.userAttributeUrl;
        ajaxData.contentType = "application/json;charset=UTF-8";
        ajaxData.data = JSON.stringify(values);
        ajaxData.onSuccess = function (result) {
            // Update User Cache
            currentUser.name = firstName;
            currentUser.family_name = lastName;
            // We save the item in the localStorage.
            localStorage.setItem("currentUserSI", JSON.stringify(currentUser));
            // Update User Name in App
            document.getElementById('userName').textContent = firstName + ' ' + lastName;
        }
        ajaxData.onFailure = function (thrownError) {
            // Replace Old name to Profile
            userNameProfileDisplay.textContent = userNameDispText;
            manageErrors(thrownError, window.translationData.profile.dynamic.changenameerror, ajaxData);
        }
        jQuery.ajax({
            url: ajaxData.url,
            beforeSend: function (xhr) {
                xhr.setRequestHeader("Authorization", authHeader);
            },
            type: ajaxData.type,
            contentType: ajaxData.contentType,
            data: ajaxData.data,
            success: ajaxData.onSuccess,
            error: ajaxData.onFailure
        });

    }

    // Confirm Password Key Up listener For Update User Attributes
    $(document).on('keyup', "#confPasswordUA", function (e) {

        let confirmPassBtn = document.getElementsByClassName('swal2-confirm')[0];
        let cpErrorDispUA = document.getElementById('cpErrorDispUA');
        let passwordEnt = this.value;

        if (isEmpty(passwordEnt) || passwordEnt.length < 8) {
            confirmPassBtn.setAttribute('disabled', 'disabled');
            return;
        }

        cpErrorDispUA.textContent = '';
        confirmPassBtn.removeAttribute('disabled');

        let keyCode = e.keyCode || e.which;
        if (keyCode === 13) {
            document.activeElement.blur();
            e.preventDefault();
            e.stopPropagation();
            // Click the confirm button of SWAL
            confirmPassBtn.click();
            return false;
        }
    });

    // Confirm Password Focus Out listener For Update User Attributes
    $(document).on('focusout', "#confPasswordUA", function () {

        let confirmPassBtn = document.getElementsByClassName('swal2-confirm')[0];
        let cpErrorDispUA = document.getElementById('cpErrorDispUA');
        let passwordEnt = this.value;

        if (isEmpty(passwordEnt) || passwordEnt.length < 8) {
            cpErrorDispUA.textContent = window.translationData.profile.dynamic.confirmpassword.error;
            confirmPassBtn.setAttribute('disabled', 'disabled');
            return;
        }

        cpErrorDispUA.textContent = '';

    });

    // Edit Email
    $('body').on('click', '#emailEdit', function (e) {
        // Hide the Element
        this.classList.add('d-none');
        // Name
        let emailProfileDisplay = document.getElementById('emailProfileDisplay').classList;
        emailProfileDisplay.add('d-none');
        // Change the User Name
        let emailModInp = document.getElementById('emailModInp');
        emailModInp.value = currentUser.email;
        // Display Edit Form
        let emailEditProf = document.getElementById('emailEditProf');
        emailEditProf.classList.remove('d-none');
        emailEditProf.classList.add('d-block');

        // Change Focus to element
        document.getElementById('emailModInp').focus();
    });


    // User Edit Complete Btn
    $('body').on('click', '#emailEditBtn', function (e) {
        editUserDetailsEmail();
    });

    // User Edit email key up listener
    $('body').on('keyup', '#emailModInp', function (e) {

        let keyCode = e.keyCode || e.which;
        if (keyCode === 13) {
            document.activeElement.blur();
            e.preventDefault();
            e.stopPropagation();
            // Click the confirm button of SWAL
            document.getElementById('emailEditBtn').click();
            return false;
        } else if (e.keyCode === 27) {
            // ESC key
            document.activeElement.blur();
            e.preventDefault();
            e.stopPropagation();

            // Name
            let emailProfileDisplay = document.getElementById('emailProfileDisplay').classList;
            emailProfileDisplay.remove('d-none');

            // Display Edit Form
            let emailEditProf = document.getElementById('emailEditProf');
            emailEditProf.classList.remove('d-block');
            emailEditProf.classList.add('d-none');

            // Edit Button
            let emailEdit = document.getElementById('emailEdit');
            emailEdit.classList.remove('d-none');

        }
    });

    // edit Email address of user
    function editUserDetailsEmail() {
        // Name
        let emailProfileDisplay = document.getElementById('emailProfileDisplay').classList;
        emailProfileDisplay.remove('d-none');

        // Display Edit Form
        let emailEditProf = document.getElementById('emailEditProf');
        emailEditProf.classList.remove('d-block');
        emailEditProf.classList.add('d-none');

        // Edit Button
        let emailEdit = document.getElementById('emailEdit');
        emailEdit.classList.remove('d-none');

        // Update First Name and Last Name
        let emailModInp = document.getElementById('emailModInp').value;

        if (emailModInp.length < 4) {
            showNotification(window.translationData.profile.dynamic.email.error, window._constants.notification.error);
            return;
        }


        // Show Sweet Alert
        Swal.fire({
            title: window.translationData.profile.dynamic.confirmpassword.title,
            html: confirmPasswordFrag(),
            inputAttributes: {
                autocapitalize: 'on'
            },
            confirmButtonClass: 'btn btn-info',
            confirmButtonText: window.translationData.profile.dynamic.confirmpassword.title,
            showCloseButton: true,
            buttonsStyling: false,
            showLoaderOnConfirm: true,
            preConfirm: () => {
                return new Promise(function (resolve) {
                    // Hide the validation message if present
                    Swal.resetValidationMessage();
                    let confPasswordUA = document.getElementById('confPasswordUA');
                    // Authentication Details
                    let values = {};
                    values.username = currentUser.email;
                    values.password = confPasswordUA.value;
                    values.checkPassword = true;

                    // Authenticate Before cahnging password
                    $.ajax({
                        type: 'POST',
                        url: PROFILE_CONSTANTS.signinUrl,
                        dataType: 'json',
                        contentType: "application/json;charset=UTF-8",
                        data: JSON.stringify(values),
                        success: function (result) {
                            // Hide loading
                            Swal.hideLoading();
                            // Resolve the promise
                            resolve(true);

                        },
                        error: function (err) {
                            // Error Message
                            let errMessage = lastElement(splitElement(err.responseJSON.errorMessage, ':'));
                            // Hide loading
                            Swal.hideLoading();
                            // Show error message
                            Swal.showValidationMessage(
                                `${errMessage}`
                            );
                            // Change Focus to password field
                            confPasswordUA.focus();
                        }
                    });
                });
            },
            allowOutsideClick: () => !Swal.isLoading(),
            closeOnClickOutside: () => !Swal.isLoading()
        }).then(function (result) {
            // Hide the validation message if present
            Swal.resetValidationMessage();
            let confPasswordUA = document.getElementById('confPasswordUA').value;
            // If confirm button is clicked
            if (result.value) {
                // Update User Email 
                updateEmail(emailModInp, confPasswordUA);
            }

        });

        // Disable Confirm Password button 
        let confBBBtn = document.getElementsByClassName('swal2-confirm')[0];
        if (!confBBBtn.disabled) {
            confBBBtn.setAttribute('disabled', 'disabled');
        }

        // CHange Focus to Confirm Password
        document.getElementById('confPasswordUA').focus();
    }

    // Update User Attribute Email
    function updateEmail(emailModInp, confPasswordUA) {


        // Authentication Details
        let values = {};
        values.username = emailModInp;
        values.password = confPasswordUA;
        values.firstname = window.currentUser.name;
        values.lastname = window.currentUser.family_name;
        values.checkPassword = false;

        // Authenticate Before cahnging password
        $.ajax({
            type: 'POST',
            url: window._config.api.invokeUrl + window._config.api.profile.signup,
            dataType: 'json',
            contentType: "application/json;charset=UTF-8",
            data: JSON.stringify(values),
            success: function (result) {
                signUpSuccessCB(result, confPasswordUA, emailModInp);

            },
            error: function (err) {
                showNotification(err.message, window._constants.notification.error);

                // Hide the Element
                document.getElementById('emailEdit').classList.add('d-none');
                // Name
                let emailProfileDisplay = document.getElementById('emailProfileDisplay').classList;
                emailProfileDisplay.add('d-none');
                // Change the User Name
                let emailModInp = document.getElementById('emailModInp');
                emailModInp.value = currentUser.email;
                // Display Edit Form
                let emailEditProf = document.getElementById('emailEditProf');
                emailEditProf.classList.remove('d-none');
                emailEditProf.classList.add('d-block');

                // Change Focus to element
                document.getElementById('emailModInp').focus();
            }
        });
    }

    /**
     *  Upon successful sign up call
     **/
    function signUpSuccessCB(result, confPasswordUA, emailModInp) {
        let oldUserAcessToken = '';
        // Show Sweet Alert
        Swal.fire({
            title: window.translationData.profile.dynamic.email.verify.title,
            html: window.translationData.profile.dynamic.email.verify.description + '<strong>' + emailModInp + '</strong>',
            input: 'text',
            confirmButtonClass: 'btn btn-info',
            confirmButtonText: window.translationData.profile.dynamic.email.verify.button,
            showCancelButton: false,
            allowEscapeKey: false,
            allowOutsideClick: false,
            closeOnClickOutside: false,
            onOpen: (docVC) => {
                $(".swal2-input").keyup(function () {
                    // Input Key Up listener
                    let inputVal = this.value;

                    if (inputVal.length == 6) {
                        Swal.clickConfirm();
                    }

                });
            },
            inputValidator: (value) => {
                if (!value) {
                    return window.translationData.profile.dynamic.email.verify.emptyerror;
                }

                if (value.length < 6) {
                    return window.translationData.profile.dynamic.email.verify.lessthansixerror;
                }

                if (isNaN(value)) {
                    return window.translationData.profile.dynamic.email.verify.nanerror;
                }
            },
            showClass: {
                popup: 'animated fadeInDown faster'
            },
            hideClass: {
                popup: 'animated fadeOutUp faster'
            },
            onClose: () => {
                $(".swal2-input").off('keyup');
            },
            showLoaderOnConfirm: true,
            preConfirm: () => {
                return new Promise(function (resolve) {
                    // Hide the validation message if present
                    Swal.resetValidationMessage();
                    let verificationCode = document.getElementsByClassName("swal2-input")[0];

                    if (verificationCode.value) {
                        // Authentication Details
                        let values = {};
                        values.username = emailModInp;
                        values.password = confPasswordUA;
                        values.confirmationCode = verificationCode.value;
                        values.doNotCreateWallet = true;

                        // Authenticate Before cahnging password
                        $.ajax({
                            type: 'POST',
                            url: window._config.api.invokeUrl + window._config.api.profile.confirmSignup,
                            dataType: 'json',
                            contentType: "application/json;charset=UTF-8",
                            data: JSON.stringify(values),
                            success: function (result) {
                                // Successfully deleted the user
                                currentUser.email = emailModInp;
                                // store in session storage
                                localStorage.setItem("currentUserSI", JSON.stringify(currentUser));

                                // Accesstoken of previous user
                                oldUserAcessToken = window.accessToken;
                                // Store Auth Token
                                storeAuthToken(result);
                                // Store Refresh token
                                storeRefreshToken(result);
                                // Store Access Token
                                storeAccessToken(result);

                                // Hide loading
                                Swal.hideLoading();
                                // Resolve the promise
                                resolve();
                            },
                            error: function (err) {
                                // Error Message
                                let errMessage = lastElement(splitElement(err.responseJSON.errorMessage, ':'));
                                // Hide loading
                                Swal.hideLoading();
                                // Show error message
                                Swal.showValidationMessage(
                                    `${errMessage}`
                                );
                                // Change Focus to password field
                                verificationCode.focus();
                            }
                        });
                    }
                });
            },
        }).then(function (result) {
            if (result.value) {
                // Hide the validation message if present
                Swal.resetValidationMessage();
                // Authentication Details
                let values = {};
                values.accessToken = oldUserAcessToken;

                // Delete the registered user
                $.ajax({
                    type: 'POST',
                    url: window._config.api.invokeUrl + window._config.api.profile.deleteUser,
                    beforeSend: function (xhr) {
                        xhr.setRequestHeader("Authorization", authHeader);
                    },
                    dataType: 'json',
                    contentType: "application/json;charset=UTF-8",
                    data: JSON.stringify(values),
                    success: function (result) {
                        // Update email
                        document.getElementById('emailProfileDisplay').textContent = emailModInp;

                        // Authentication Details
                        let values = {};
                        values.username = emailModInp;
                        values.password = confPasswordUA;
                        values.checkPassword = true;

                        showNotification(window.translationData.profile.dynamic.email.success, window._constants.notification.success);
                    },
                    error: function (err) {
                        showNotification(err.message, window._constants.notification.error);
                    }
                });
            }
        });
    }

    function storeAuthToken(result) {
        // Set JWT Token For authentication
        let idToken = JSON.stringify(result.AuthenticationResult.IdToken);
        idToken = idToken.substring(1, idToken.length - 1);
        localStorage.setItem('idToken', idToken);
        window.authHeader = idToken;
    }

    function storeRefreshToken(result) {
        // Set JWT Token For authentication
        let refreshToken = JSON.stringify(result.AuthenticationResult.RefreshToken);
        refreshToken = refreshToken.substring(1, refreshToken.length - 1);
        localStorage.setItem('refreshToken', refreshToken);
        window.refreshToken = refreshToken;
    }

    function storeAccessToken(result) {
        // Set JWT Token For authentication
        let accessToken = JSON.stringify(result.AuthenticationResult.AccessToken);
        accessToken = accessToken.substring(1, accessToken.length - 1);
        localStorage.setItem('accessToken', accessToken);
        window.accessToken = accessToken;
    }

}(jQuery));
