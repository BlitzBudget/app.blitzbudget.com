"use strict";
(function scopeWrapper($) {

    // TRANSACTIONS CONSTANTS
    const TRANSACTIONS_CONSTANTS = {};
    // SECURITY: Defining Immutable properties as constants
    Object.defineProperties(TRANSACTIONS_CONSTANTS, {
        'firstWalletIdParam': {
            value: '?walletId=',
            writable: false,
            configurable: false
        },
    });

    // Description Text
    let descriptionTextEdited = '';
    // Amount Text
    let amountEditedTransaction = '';
    // User Updated Budegt
    let userUpdateBudgetCached = '';

    const replaceTransactionsId = "productsJson";
    const recentTransactionsId = 'recentTransactions';
    // Used to refresh the transactions only if new ones are added
    let registeredNewTransaction = false;
    // Divs for error message while adding transactions
    let errorAddingTransactionDiv = '<div class="row ml-auto mr-auto"><i class="material-icons red-icon">highlight_off</i><p class="margin-bottom-zero red-icon margin-left-five">';
    // Bills & Fees Options selection
    const selectedOption = '4';
    // Delete Transaction Button Inside TD
    const deleteButton = '<button class="btn btn-danger btn-sm removeRowTransaction">Remove</button>';
    // New Pie Chart Storage Variable
    window.transactionsChart = '';
    // Success SVG Fragment
    let successSVGFormed = successSvgMessage();
    // String Today
    const TODAY = isNotEmpty(window.translationData) ? window.translationData.transactions.dynamic.today : 'Today';
    // Initialize transactions Cache
    window.transactionsCache = {};
    // Initialize user budget
    window.userBudgetMap = {};

    /**
     * START loading the page
     *
     */
    if (isEqual(er.getCookie('currentPage'), 'transactionsPage')) {
        if (isEqual(window.location.href, window._config.app.invokeUrl)) {
            er.refreshCookiePageExpiry('transactionsPage');
            er.fetchCurrentPage('/transactions', function (data) {
                // Load the new HTML
                $('#mutableDashboard').html(data);
                // Translate current Page
                translatePage(getLanguage());
                // Call the transaction API to fetch information.
                initialLoadOfTransactions();
                // Set Current Page
                let currentPage = document.getElementById('currentPage');
                currentPage.setAttribute('data-i18n', 'transactions.dynamic.title');
                currentPage.textContent = isNotEmpty(window.translationData) ? window.translationData.transactions.dynamic.title : "Transactions";
            });
        }
    }

    let transactionsPage = document.getElementById('transactionsPage');
    if (isNotEmpty(transactionsPage)) {
        transactionsPage.addEventListener("click", function (e) {
            er.refreshCookiePageExpiry('transactionsPage');
            er.fetchCurrentPage('/transactions', function (data) {
                // Load the new HTML
                $('#mutableDashboard').html(data);
                // Translate current Page
                translatePage(getLanguage());
                initialLoadOfTransactions();
                // Set Current Page
                let currentPage = document.getElementById('currentPage');
                currentPage.setAttribute('data-i18n', 'transactions.dynamic.title');
                currentPage.textContent = isNotEmpty(window.translationData) ? window.translationData.transactions.dynamic.title : "Transactions";
            });
        });
    }

    function initialLoadOfTransactions() {
        /**
         * START Load at the end of the javascript
         */

        // Call the transaction API to fetch information.
        fetchJSONForTransactions();
        // Date Picker
        // On click month (UNBIND other click events)
        $('.monthPickerMonth').unbind('click').click(function () {
            // Month picker is current selected then do nothing
            if (this.classList.contains('monthPickerMonthSelected')) {
                return;
            }

            let transactionTable = document.getElementById('transactionsTable');

            if (transactionTable == null) {
                return;
            }

            // Replace Transactions Table with empty spinner
            replaceTransactionsWithMSpinner();
            replacePieChartWithMSpinner();

            // Set chosen Date
            er.setChosenDateWithSelected(this);

            // Call transactions
            fetchJSONForTransactions();

        });

        /**
         *  Add Functionality Generic + Btn
         **/

        // Register Tooltips
        let ttinit = $("#addFncTT");
        let tttitle = isNotEmpty(window.translationData) ? window.translationData.transactions.dynamic.add.tooltip : 'Add Transactions';
        ttinit.attr('data-original-title', tttitle);
        ttinit.tooltip({
            delay: {
                "show": 300,
                "hide": 100
            }
        });

        // Generic Add Functionalitys
        let genericAddFnc = document.getElementById('genericAddFnc');
        genericAddFnc.classList = 'btn btn-round btn-success btn-just-icon bottomFixed float-right addNewTrans';
        $(genericAddFnc).unbind('click').click(function () {
            genericAddFnc.classList.toggle('d-none');
            $('#GSCCModal').modal('toggle');
        });

        // refresh the transactions page on closing the modal
        $('#GSCCModal').on('hidden.bs.modal', function () {
            // Add icon d-none
            document.getElementById('genericAddFnc').classList.toggle('d-none');
            replaceHTML('successMessage', "");
            replaceHTML('errorMessage', "");

            if (registeredNewTransaction) {

                // Populate category based table
                fetchJSONForTransactions();
                // Do not refresh the transactions if no new transactions are added
                registeredNewTransaction = false;
            }
        });

        // show the login modal
        $('#GSCCModal').on('show.bs.modal', function () {
            // Load Expense category and income category
            let expenseOptGroup = document.getElementById('expenseSelection');
            let incomeOptgroup = document.getElementById('incomeSelection');
            // If the Category items are not populate then populate them
            if (!expenseOptGroup.firstElementChild) {
                expenseDropdownItems = cloneElementAndAppend(expenseOptGroup, expenseDropdownItems);
            }
            if (!incomeOptgroup.firstElementChild) {
                incomeDropdownItems = cloneElementAndAppend(incomeOptgroup, incomeDropdownItems);
            }
        });

        // Change the focus to amount after the modal is shown
        $('#GSCCModal').on('shown.bs.modal', function () {
            // Change focus
            document.getElementById('amount').focus();
        });


    }

    // Save Transactions on form submit
    $('body').on("click", "#addNewTransactions", function (event) {
        event.preventDefault();
        event.stopImmediatePropagation(); // necessary to prevent submitting the form twice
        // disable button after successful submission
        this.setAttribute("disabled", "disabled");
        registerTransaction(event, this);
    });

    function registerTransaction(event, addTransactionsButton) {
        replaceHTML('successMessage', '');
        replaceHTML('errorMessage', '');
        let formValidation = true;

        let amount = document.getElementById('amount').value;
        if (amount == null || amount == '') {
            fadeoutMessage('#errorMessage', errorAddingTransactionDiv + window.translationData.transactions.dynamic.add.amounterror + '</p></div> <br/>', 2000);
            formValidation = false;
        }

        amount = er.convertToNumberFromCurrency(amount, currentCurrencyPreference);
        if (amount == 0) {
            fadeoutMessage('#errorMessage', errorAddingTransactionDiv + window.translationData.transactions.dynamic.add.nonzeroerror + '</p></div> <br/>', 2000);
            formValidation = false;
        }

        if (!formValidation) {
            // enable button after successful submission
            addTransactionsButton.removeAttribute("disabled");
            return;
        }

        amount = Math.abs(amount);
        // Get all the input radio buttons for recurrence to check which one is clicked
        let recurrence = document.querySelector('.register-recurrence.active');
        let recurrenceValues = ['NEVER', 'WEEKLY', 'BI-MONTHLY', 'MONTHLY'];

        // If the recurrence is not empty then assign the checked one
        let recurrenceValue = recurrence.getAttribute('data-target');
        // Security to ensure data is not manipulated
        if (notIncludesStr(recurrenceValues, recurrenceValue)) {
            fadeoutMessage('#errorMessage', errorAddingTransactionDiv + window.translationData.transactions.dynamic.add.recurerror, 2000);
            // enable button after successful submission
            addTransactionsButton.removeAttribute("disabled");
            return;
        }

        let description = document.getElementById('description').value;
        let categoryOptions = document.getElementById('categoryOptions').getAttribute('data-chosen');
        let tagsChosen = document.querySelectorAll('#add-transaction-tags .badge');
        let tagsArray = [];

        // Tags Chosen
        for (let i = 0, len = tagsChosen.length; i < len; i++) {
            let currentTag = tagsChosen[i];
            let badgeText = currentTag.innerText;
            // Push tags to the array
            tagsArray.push(badgeText);
        }

        /*
         * If the input field in the tag is not empty then.
         */
        let badgeText = document.getElementById('add-transaction-value').value;
        if (isNotBlank(badgeText)) {
            // Push tags to the array
            tagsArray.push(badgeText);
        }


        let values = {};
        if (notIncludesStr(categoryOptions, 'Category#')) {
            let chosenCategory = window.categoryMap[categoryOptions];
            if (isEmpty(chosenCategory)) {
                fadeoutMessage('#errorMessage', errorAddingTransactionDiv + window.translationData.transactions.dynamic.add.categoryerror, 2000);
                // enable button after successful submission
                addTransactionsButton.removeAttribute("disabled");
                return;
            }
            values['categoryType'] = chosenCategory.type;
            values['category'] = chosenCategory.name;
        } else {
            values['category'] = categoryOptions;
        }

        if (window.categoryMap[categoryOptions].type == CUSTOM_DASHBOARD_CONSTANTS.expenseCategory) {
            // Update as negative amount
            amount *= -1;
        }

        values['amount'] = amount;
        values['description'] = description;
        values['dateMeantFor'] = window.currentDateAsID;
        values['recurrence'] = recurrenceValue;
        values['account'] = window.selectedBankAccountId;
        values['walletId'] = window.currentUser.walletId;
        values['tags'] = tagsArray;

        // Ajax Requests on Error
        let ajaxData = {};
        ajaxData.isAjaxReq = true;
        ajaxData.type = "PUT";
        ajaxData.url = CUSTOM_DASHBOARD_CONSTANTS.transactionAPIUrl;
        ajaxData.dataType = "json";
        ajaxData.contentType = "application/json;charset=UTF-8";
        ajaxData.data = JSON.stringify(values);
        ajaxData.onSuccess = function (result) {
            // Convert result to transactions
            let transaction = result['body-json'];
            // Assign Category Id
            assignCategoryId(transaction);
            // Set Current Date as ID (For First time)
            window.currentDateAsID = transaction.dateMeantFor;
            // Populate CurrentDateAsId if necessary
            if (notIncludesStr(window.currentDateAsID, 'Date#')) {
                window.currentDateAsID = transaction.dateMeantFor
            }
            // Fetch success message DIV
            let successMessageDocument = document.getElementById('successMessage');
            // Clone and Append the success Message
            successSVGFormed = cloneElementAndAppend(successMessageDocument, successSVGFormed);
            // Add css3 to fade in and out
            successMessageDocument.classList.add('messageFadeInAndOut');
            // Set Registered new transactions as true
            registeredNewTransaction = true;
            // Enable the Add Button
            addTransactionsButton.removeAttribute("disabled");
        }
        ajaxData.onFailure = function (data) {
            fadeoutMessage('#errorMessage', errorAddingTransactionDiv + window.translationData.transactions.dynamic.add.unableerror + '</p></div> <br/>', 2000);
            registeredNewTransaction = false;
            addTransactionsButton.removeAttribute("disabled");

            if (isEmpty(data)) {
                return;
            }

            let responseError = JSON.parse(data.responseText);
            if (responseError.error.includes("Unauthorized")) {
                $('#GSCCModal').modal('hide');
                er.sessionExpiredSwal(ajaxData);
            }
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

    // on click dropdown set the data chosen attribute
    $('body').on("click", "#categoryOptions .dropdown-item", function (event) {
        let dropdownValue = this.lastElementChild.value;
        let categoryOption = document.getElementById('categoryOptions');
        categoryOption.firstElementChild.textContent = window.categoryMap[dropdownValue].name;
        categoryOption.setAttribute('data-chosen', dropdownValue);
    });

    // Set Active Class on click button
    $(document).on('click', ".register-recurrence", function () {
        $('.register-recurrence').removeClass('active');
        this.classList.add('active');

    });

    // Use this function to fade the message out
    function fadeoutMessage(divId, message, milliSeconds) {
        $(divId).fadeIn('slow').show().append(message);
        setTimeout(function () {
            $(divId).fadeOut();
        }, milliSeconds);
    }

    // Populates the transaction table
    function fetchJSONForTransactions() {
        let values = {};
        if (isNotEmpty(window.currentUser.walletId)) {
            values.walletId = window.currentUser.walletId;
        } else {
            values.userId = window.currentUser.financialPortfolioId;
        }
        let y = window.chosenDate.getFullYear(),
            m = window.chosenDate.getMonth();
        values.startsWithDate = new Date(y, m, 1);
        values.endsWithDate = new Date(y, m + 1, 0);

        // Ajax Requests on Error
        let ajaxData = {};
        ajaxData.isAjaxReq = true;
        ajaxData.type = 'POST';
        ajaxData.url = CUSTOM_DASHBOARD_CONSTANTS.transactionAPIUrl;
        ajaxData.dataType = "json";
        ajaxData.contentType = "application/json;charset=UTF-8";
        ajaxData.data = JSON.stringify(values);
        ajaxData.onSuccess = function (result) {
            er_a.populateBankInfo(result.BankAccount);

            fetchJSONForCategories(result.Category);
            tr.loadCategoriesForTransaction('categoryOptions', 'expenseSelection', 'incomeSelection');

            // Dates Cache
            window.datesCreated = result.Date;
            populateCurrentDate(result.Date);

            /*
             * Replace With Currency
             */
            replaceWithCurrency(result.Wallet);
            // Populate Category Sort
            populateCategorySort(result);
            // update the Total Available Section
            tr.updateTotalAvailableSection(result.incomeTotal, result.expenseTotal, result.balance);
            // Update Budget from API
            updateBudgetForIncome(result.Budget);
            // Change the table sorting on page load
            er.tableSortMechanism();
            // Call Account / Recent Transactions
            populateRecentTransactions(result.Transaction);
            // Populate Recurring Transactions
            populateRecurringTransactions(result.RecurringTransactions);
            // Populate Tags Transactions
            populateTagsTransactions(result.Transaction);
            // hide other modals
            hideOtherModals();
        }
        ajaxData.onFailure = function (thrownError) {
            manageErrors(thrownError, window.translationData.transactions.dynamic.get.unableerror, ajaxData);
        }
        // Load all user transaction from API
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

    function populateCategorySort(result) {
        if (isEmpty(result.Transaction) && isEmpty(result.Category)) {
            let transactionsTable = document.getElementById(replaceTransactionsId);
            // Replace HTML with Empty
            while (transactionsTable.firstChild) {
                transactionsTable.removeChild(transactionsTable.firstChild);
            }
            transactionsTable.appendChild(buildEmptyTransactionsTab());
            transactionsTable.classList.remove('d-none');
        } else {
            let categoryInfoTable = document.getElementsByClassName('categoryInfoTable');
            // Replace HTML with Empty
            while (categoryInfoTable[0]) {
                categoryInfoTable[0].parentNode.removeChild(categoryInfoTable[0]);
            }
            populateTransactionsByCategory(result.Transaction);
            buildCategoryHeaders(result.Category);
        }
    }

    // Fetches the budget for all the category rows if present and updates the category row
    function updateBudgetForIncome(data) {
        for (let count = 0, length = data.length; count < length; count++) {
            let value = data[count];
            // Update user budget to global map (Exportation)
            window.userBudgetMap[value.category] = value;
        }
    }

    // Generate SVG Tick Element and success element
    function successSvgMessage() {
        let alignmentDiv = document.createElement('div');
        alignmentDiv.className = 'row justify-content-center';

        // Parent Div Svg container
        let divSvgContainer = document.createElement('div');
        divSvgContainer.className = 'svg-container';

        // SVG element
        let svgElement = document.createElementNS("http://www.w3.org/2000/svg", 'svg');
        svgElement.setAttribute('class', 'ft-green-tick');
        svgElement.setAttribute('height', '20');
        svgElement.setAttribute('width', '20');
        svgElement.setAttribute('viewBox', '0 0 48 48');
        svgElement.setAttribute('aria-hidden', true);

        let circleElement = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circleElement.setAttribute('class', 'circle');
        circleElement.setAttribute('fill', '#5bb543');
        circleElement.setAttribute('cx', '24');
        circleElement.setAttribute('cy', '24');
        circleElement.setAttribute('r', '22');

        let pathElement = document.createElementNS("http://www.w3.org/2000/svg", 'path');
        pathElement.setAttribute('class', 'tick');
        pathElement.setAttribute('fill', 'none');
        pathElement.setAttribute('stroke', '#FFF');
        pathElement.setAttribute('stroke-width', '6');
        pathElement.setAttribute('stroke-linecap', 'round');
        pathElement.setAttribute('stroke-linejoin', 'round');
        pathElement.setAttribute('stroke-miterlimit', '10');
        pathElement.setAttribute('d', 'M14 27l5.917 4.917L34 17');

        svgElement.appendChild(circleElement);
        svgElement.appendChild(pathElement);
        divSvgContainer.appendChild(svgElement);

        let messageParagraphElement = document.createElement('p');
        messageParagraphElement.className = 'green-icon margin-bottom-zero margin-left-five';
        messageParagraphElement.setAttribute('data-i18n', 'transactions.dynamic.add.success');
        messageParagraphElement.textContent = isNotEmpty(window.translationData) ? window.translationData.transactions.dynamic.add.success : "Successfully added the transaction.";

        var br = document.createElement('br');

        alignmentDiv.appendChild(divSvgContainer);
        alignmentDiv.appendChild(messageParagraphElement);
        alignmentDiv.appendChild(br);


        return alignmentDiv;
    }


    // Replace transactions table with empty spinner
    function replaceTransactionsWithMSpinner() {
        // Replace the product json with empty table
        document.getElementById(replaceTransactionsId).classList.remove('d-none');
        // Remove all category sorted transactions
        let categoryInfoTable = document.getElementsByClassName('categoryInfoTable');
        // Replace HTML with Empty
        while (categoryInfoTable[0]) {
            categoryInfoTable[0].parentNode.removeChild(categoryInfoTable[0]);
        }
    }

    // Replace Pie Chart with Material Spinner
    function replacePieChartWithMSpinner() {
        // Reset the chart
        if (isNotEmpty(window.transactionsChart)) {
            window.transactionsChart.detach();
        }

        let chartFinPosition = document.getElementById('chartFinancialPosition');
        // Replace HTML with Empty
        while (chartFinPosition.firstChild) {
            chartFinPosition.removeChild(chartFinPosition.firstChild);
        }
        let materialSpinnerElement = document.createElement('div');
        materialSpinnerElement.classList = 'material-spinner';
        chartFinPosition.appendChild(materialSpinnerElement);
    }

    /*
     * Populate Recent transactions ()Aggregated by account)
     */

    // Populate Recent Transactions
    function populateRecentTransactions(userTransactionsList) {
        // Ajax Requests on Error
        populateRecentTransInfo(userTransactionsList);
        populateAccountTableInformation(userTransactionsList);
    }

    // Populate Account table information
    function populateAccountTableInformation(userTransactionsList) {

        if (isEmpty(userTransactionsList)) {
            let accountTable = document.getElementById('accountTable');
            // Replace HTML with Empty
            while (accountTable.firstChild) {
                accountTable.removeChild(accountTable.firstChild);
            }
            accountTable.appendChild(buildEmptyTransactionsTab());
            // Remove all the account transaction information
            let accountInfoTable = document.getElementsByClassName('accountInfoTable');
            // Replace HTML with Empty
            while (accountInfoTable[0]) {
                accountInfoTable[0].parentNode.removeChild(accountInfoTable[0]);
            }
        } else {
            // Populate Transaction
            popTransByAccWOAJAX();
        }
    }

    // POpulate Recent Transaction information
    function populateRecentTransInfo(userTransactionsList) {

        let latestCreationDateItr = new Date();
        let recentTransactionsDiv = document.getElementById(recentTransactionsId);
        let recentTransactionsFragment = document.createDocumentFragment();

        if (isEmpty(userTransactionsList)) {
            recentTransactionsFragment.appendChild(buildEmptyTransactionsTab());
        } else {

            // Check if it is the same day
            if (isToday(new Date(userTransactionsList[0]['creation_date']))) {
                recentTransactionsFragment.appendChild(appendToday());
            }

            let resultKeySet = Object.keys(userTransactionsList);
            for (let countGrouped = 0; countGrouped < resultKeySet.length; countGrouped++) {
                let key = resultKeySet[countGrouped];
                let userTransaction = userTransactionsList[key];
                let creationDate = new Date(userTransaction['creation_date']);

                if (!sameDate(creationDate, latestCreationDateItr)) {
                    recentTransactionsFragment.appendChild(appendDateHeader(creationDate));
                    // Set the latest header to creation date
                    latestCreationDateItr = creationDate;
                }
                recentTransactionsFragment.appendChild(buildTransactionRow(userTransaction, 'recentTransaction'));
            }
        }

        // Empty HTML
        while (recentTransactionsDiv.firstChild) {
            recentTransactionsDiv.removeChild(recentTransactionsDiv.firstChild);
        }
        recentTransactionsDiv.appendChild(recentTransactionsFragment);
    }

    // Appends the date header (TODAY) for recent transactions
    function appendToday() {
        let dateHeader = document.createElement('div');
        dateHeader.classList = 'recentTransactionDateGrp ml-3 font-weight-bold';
        dateHeader.textContent = TODAY;

        return dateHeader;
    }

    // Appends the date header for recent transactions
    function appendDateHeader(creationDate) {
        let dateHeader = document.createElement('div');
        dateHeader.classList = 'recentTransactionDateGrp ml-3 font-weight-bold';
        dateHeader.textContent = getWeekDays(creationDate.getDay()) + ' ' + ordinalSuffixOf(creationDate.getDate());

        return dateHeader;
    }

    // Builds the rows for recent transactions
    function buildTransactionRow(userTransaction, idName) {
        // Convert date from UTC to user specific dates
        let creationDateUserRelevant = new Date(userTransaction['creation_date']);
        // Category Map
        let categoryMapForUT = categoryMap[userTransaction.category];

        let tableRowTransaction = document.createElement('div');
        tableRowTransaction.id = idName + '-' + userTransaction.transactionId;
        tableRowTransaction.setAttribute('data-target', userTransaction.transactionId);
        tableRowTransaction.classList = 'recentTransactionEntry d-table-row';

        // Make the account section draggable
        if (isEqual(idName, 'accountAggre')) {
            tableRowTransaction.classList.add('accTransEntry');
            tableRowTransaction.draggable = 'true';
        }

        // Category Sorted being draggable
        if (isEqual(idName, 'categorySorted')) {
            tableRowTransaction.classList.add('catTransEntry');
            tableRowTransaction.draggable = 'true';
        }

        // Cell 1
        let tableCellImagesWrapper = document.createElement('div');
        tableCellImagesWrapper.classList = 'd-table-cell align-middle imageWrapperCell text-center';

        let circleWrapperDiv = document.createElement('div');
        circleWrapperDiv.classList = 'rounded-circle align-middle circleWrapperImageRT mx-auto';

        // Append a - sign if it is an expense
        if (categoryMapForUT.type == CUSTOM_DASHBOARD_CONSTANTS.expenseCategory) {
            circleWrapperDiv.appendChild(creditCardSvg());
        } else {
            circleWrapperDiv.appendChild(plusRawSvg());
        }

        tableCellImagesWrapper.appendChild(circleWrapperDiv);
        tableRowTransaction.appendChild(tableCellImagesWrapper);

        // Cell 2
        let tableCellTransactionDescription = document.createElement('div');
        tableCellTransactionDescription.classList = 'descriptionCellRT d-table-cell';

        let elementWithDescription = document.createElement('div');
        elementWithDescription.classList = 'font-weight-bold recentTransactionDescription';
        elementWithDescription.textContent = isEmpty(userTransaction.description) ? window.translationData.transactions.dynamic.card.description : userTransaction.description.length < 25 ? userTransaction.description : userTransaction.description.slice(0, 26) + '...';
        tableCellTransactionDescription.appendChild(elementWithDescription);

        let elementWithCategoryName = document.createElement('div');
        elementWithCategoryName.classList = 'small categoryNameRT w-100';
        // Category Sorted being draggable
        if (isEqual(idName, 'categorySorted')) {
            for (let i = 0, length = window.allBankAccountInfoCache.length; i < length; i++) {
                let bankAcc = window.allBankAccountInfoCache[i];
                if (isEqual(bankAcc.accountId, userTransaction.account)) {
                    elementWithCategoryName.textContent = (bankAcc['bank_account_name']) + ' • ' + ("0" + creationDateUserRelevant.getDate()).slice(-2) + ' ' + months[creationDateUserRelevant.getMonth()].slice(0, 3) + ' ' + creationDateUserRelevant.getFullYear() + ' ' + ("0" + creationDateUserRelevant.getHours()).slice(-2) + ':' + ("0" + creationDateUserRelevant.getMinutes()).slice(-2);
                }
            }
        } else {
            elementWithCategoryName.textContent = (categoryMapForUT.name.length < 25 ? categoryMapForUT.name : (categoryMapForUT.name.slice(0, 26) + '...')) + ' • ' + ("0" + creationDateUserRelevant.getDate()).slice(-2) + ' ' + months[creationDateUserRelevant.getMonth()].slice(0, 3) + ' ' + creationDateUserRelevant.getFullYear() + ' ' + ("0" + creationDateUserRelevant.getHours()).slice(-2) + ':' + ("0" + creationDateUserRelevant.getMinutes()).slice(-2);
        }
        tableCellTransactionDescription.appendChild(elementWithCategoryName);
        tableRowTransaction.appendChild(tableCellTransactionDescription);

        // Cell 3
        if (isEqual(idName, 'recentTransaction')) {
            let transactionAmount = document.createElement('div');

            // Append a - sign if it is an expense
            if (categoryMap[userTransaction.category].type == CUSTOM_DASHBOARD_CONSTANTS.expenseCategory) {
                transactionAmount.classList = 'transactionAmountRT expenseCategory font-weight-bold d-table-cell text-right align-middle';
            } else {
                transactionAmount.classList = 'transactionAmountRT incomeCategory font-weight-bold d-table-cell text-right align-middle';
            }
            transactionAmount.textContent = formatToCurrency(userTransaction.amount);
            tableRowTransaction.appendChild(transactionAmount);
        } else {
            let surCell = document.createElement('div');
            surCell.classList = 'd-table-cell';

            let transactionAmount = document.createElement('div');

            // Append a - sign if it is an expense
            if (categoryMap[userTransaction.category].type == CUSTOM_DASHBOARD_CONSTANTS.expenseCategory) {
                transactionAmount.classList = 'transactionAmountRT font-weight-bold text-right align-middle';
            } else {
                transactionAmount.classList = 'transactionAmountRT font-weight-bold text-right align-middle';

            }
            transactionAmount.textContent = formatToCurrency(userTransaction.amount);
            surCell.appendChild(transactionAmount);

            let accountBalDiv = document.createElement('div');
            accountBalDiv.classList = 'accBalSubAmount pl-2 font-weight-bold text-right align-middle small';
            surCell.appendChild(accountBalDiv);
            tableRowTransaction.appendChild(surCell);
        }

        return tableRowTransaction;

    }

    // Empty Transactions SVG
    function buildEmptyTransactionsSvg() {

        let svgElement = document.createElementNS("http://www.w3.org/2000/svg", 'svg');
        svgElement.setAttribute('width', '64');
        svgElement.setAttribute('height', '64');
        svgElement.setAttribute('viewBox', '0 0 64 64');
        svgElement.setAttribute('class', 'transactions-empty-svg svg-absolute-center');

        let pathElement1 = document.createElementNS("http://www.w3.org/2000/svg", 'path');
        pathElement1.setAttribute('d', 'M 5 8 C 3.346 8 2 9.346 2 11 L 2 53 C 2 54.654 3.346 56 5 56 L 59 56 C 60.654 56 62 54.654 62 53 L 62 11 C 62 9.346 60.654 8 59 8 L 5 8 z M 5 10 L 59 10 C 59.551 10 60 10.449 60 11 L 60 20 L 4 20 L 4 11 C 4 10.449 4.449 10 5 10 z M 28 12 C 26.897 12 26 12.897 26 14 L 26 16 C 26 17.103 26.897 18 28 18 L 56 18 C 57.103 18 58 17.103 58 16 L 58 14 C 58 12.897 57.103 12 56 12 L 28 12 z M 28 14 L 56 14 L 56.001953 16 L 28 16 L 28 14 z M 4 22 L 60 22 L 60 53 C 60 53.551 59.551 54 59 54 L 5 54 C 4.449 54 4 53.551 4 53 L 4 22 z');
        svgElement.appendChild(pathElement1);

        let pathElement11 = document.createElementNS("http://www.w3.org/2000/svg", 'path');
        pathElement11.setAttribute('class', 'coloredTransactionLine');
        pathElement11.setAttribute('d', ' M 8 13 A 2 2 0 0 0 6 15 A 2 2 0 0 0 8 17 A 2 2 0 0 0 10 15 A 2 2 0 0 0 8 13 z');
        svgElement.appendChild(pathElement11);

        let pathElement12 = document.createElementNS("http://www.w3.org/2000/svg", 'path');
        pathElement12.setAttribute('d', ' M 14 13 A 2 2 0 0 0 12 15 A 2 2 0 0 0 14 17 A 2 2 0 0 0 16 15 A 2 2 0 0 0 14 13 z M 20 13 A 2 2 0 0 0 18 15 A 2 2 0 0 0 20 17 A 2 2 0 0 0 22 15 A 2 2 0 0 0 20 13 z ');
        svgElement.appendChild(pathElement12);

        let pathElement2 = document.createElementNS("http://www.w3.org/2000/svg", 'path');
        pathElement2.setAttribute('class', 'coloredTransactionLine');
        pathElement2.setAttribute('d', 'M 11 27.974609 C 10.448 27.974609 10 28.422609 10 28.974609 C 10 29.526609 10.448 29.974609 11 29.974609 L 15 29.974609 C 15.552 29.974609 16 29.526609 16 28.974609 C 16 28.422609 15.552 27.974609 15 27.974609 L 11 27.974609 z M 19 27.974609 C 18.448 27.974609 18 28.422609 18 28.974609 C 18 29.526609 18.448 29.974609 19 29.974609 L 33 29.974609 C 33.552 29.974609 34 29.526609 34 28.974609 C 34 28.422609 33.552 27.974609 33 27.974609 L 19 27.974609 z');
        svgElement.appendChild(pathElement2);

        let pathElement21 = document.createElementNS("http://www.w3.org/2000/svg", 'path');
        pathElement21.setAttribute('d', ' M 39 27.974609 C 38.448 27.974609 38 28.422609 38 28.974609 C 38 29.526609 38.448 29.974609 39 29.974609 L 41 29.974609 C 41.552 29.974609 42 29.526609 42 28.974609 C 42 28.422609 41.552 27.974609 41 27.974609 L 39 27.974609 z M 45 27.974609 C 44.448 27.974609 44 28.422609 44 28.974609 C 44 29.526609 44.448 29.974609 45 29.974609 L 47 29.974609 C 47.552 29.974609 48 29.526609 48 28.974609 C 48 28.422609 47.552 27.974609 47 27.974609 L 45 27.974609 z M 51 27.974609 C 50.448 27.974609 50 28.422609 50 28.974609 C 50 29.526609 50.448 29.974609 51 29.974609 L 53 29.974609 C 53.552 29.974609 54 29.526609 54 28.974609 C 54 28.422609 53.552 27.974609 53 27.974609 L 51 27.974609 z');
        svgElement.appendChild(pathElement21);

        let pathElement3 = document.createElementNS("http://www.w3.org/2000/svg", 'path');
        pathElement3.setAttribute('class', 'coloredTransactionLine');
        pathElement3.setAttribute('d', 'M 11 33.974609 C 10.448 33.974609 10 34.422609 10 34.974609 C 10 35.526609 10.448 35.974609 11 35.974609 L 15 35.974609 C 15.552 35.974609 16 35.526609 16 34.974609 C 16 34.422609 15.552 33.974609 15 33.974609 L 11 33.974609 z M 19 33.974609 C 18.448 33.974609 18 34.422609 18 34.974609 C 18 35.526609 18.448 35.974609 19 35.974609 L 33 35.974609 C 33.552 35.974609 34 35.526609 34 34.974609 C 34 34.422609 33.552 33.974609 33 33.974609 L 19 33.974609 z');
        svgElement.appendChild(pathElement3);

        let pathElement31 = document.createElementNS("http://www.w3.org/2000/svg", 'path');
        pathElement31.setAttribute('d', ' M 45 33.974609 C 44.448 33.974609 44 34.422609 44 34.974609 C 44 35.526609 44.448 35.974609 45 35.974609 L 47 35.974609 C 47.552 35.974609 48 35.526609 48 34.974609 C 48 34.422609 47.552 33.974609 47 33.974609 L 45 33.974609 z M 51 33.974609 C 50.448 33.974609 50 34.422609 50 34.974609 C 50 35.526609 50.448 35.974609 51 35.974609 L 53 35.974609 C 53.552 35.974609 54 35.526609 54 34.974609 C 54 34.422609 53.552 33.974609 53 33.974609 L 51 33.974609 z');
        svgElement.appendChild(pathElement31);

        let pathElement4 = document.createElementNS("http://www.w3.org/2000/svg", 'path');
        pathElement4.setAttribute('class', 'coloredTransactionLine');
        pathElement4.setAttribute('d', 'M 11 39.974609 C 10.448 39.974609 10 40.422609 10 40.974609 C 10 41.526609 10.448 41.974609 11 41.974609 L 15 41.974609 C 15.552 41.974609 16 41.526609 16 40.974609 C 16 40.422609 15.552 39.974609 15 39.974609 L 11 39.974609 z M 19 39.974609 C 18.448 39.974609 18 40.422609 18 40.974609 C 18 41.526609 18.448 41.974609 19 41.974609 L 33 41.974609 C 33.552 41.974609 34 41.526609 34 40.974609 C 34 40.422609 33.552 39.974609 33 39.974609 L 19 39.974609 z');
        svgElement.appendChild(pathElement4);

        let pathElement41 = document.createElementNS("http://www.w3.org/2000/svg", 'path');
        pathElement41.setAttribute('d', 'M 39 39.974609 C 38.448 39.974609 38 40.422609 38 40.974609 C 38 41.526609 38.448 41.974609 39 41.974609 L 41 41.974609 C 41.552 41.974609 42 41.526609 42 40.974609 C 42 40.422609 41.552 39.974609 41 39.974609 L 39 39.974609 z M 45 39.974609 C 44.448 39.974609 44 40.422609 44 40.974609 C 44 41.526609 44.448 41.974609 45 41.974609 L 47 41.974609 C 47.552 41.974609 48 41.526609 48 40.974609 C 48 40.422609 47.552 39.974609 47 39.974609 L 45 39.974609 z M 51 39.974609 C 50.448 39.974609 50 40.422609 50 40.974609 C 50 41.526609 50.448 41.974609 51 41.974609 L 53 41.974609 C 53.552 41.974609 54 41.526609 54 40.974609 C 54 40.422609 53.552 39.974609 53 39.974609 L 51 39.974609 z ');
        svgElement.appendChild(pathElement41);

        let pathElement5 = document.createElementNS("http://www.w3.org/2000/svg", 'path');
        pathElement5.setAttribute('d', 'M 7 48 C 6.448 48 6 48.448 6 49 L 6 51 C 6 51.552 6.448 52 7 52 C 7.552 52 8 51.552 8 51 L 8 49 C 8 48.448 7.552 48 7 48 z M 12 48 C 11.448 48 11 48.448 11 49 L 11 51 C 11 51.552 11.448 52 12 52 C 12.552 52 13 51.552 13 51 L 13 49 C 13 48.448 12.552 48 12 48 z M 17 48 C 16.448 48 16 48.448 16 49 L 16 51 C 16 51.552 16.448 52 17 52 C 17.552 52 18 51.552 18 51 L 18 49 C 18 48.448 17.552 48 17 48 z M 22 48 C 21.448 48 21 48.448 21 49 L 21 51 C 21 51.552 21.448 52 22 52 C 22.552 52 23 51.552 23 51 L 23 49 C 23 48.448 22.552 48 22 48 z M 27 48 C 26.448 48 26 48.448 26 49 L 26 51 C 26 51.552 26.448 52 27 52 C 27.552 52 28 51.552 28 51 L 28 49 C 28 48.448 27.552 48 27 48 z M 32 48 C 31.448 48 31 48.448 31 49 L 31 51 C 31 51.552 31.448 52 32 52 C 32.552 52 33 51.552 33 51 L 33 49 C 33 48.448 32.552 48 32 48 z M 37 48 C 36.448 48 36 48.448 36 49 L 36 51 C 36 51.552 36.448 52 37 52 C 37.552 52 38 51.552 38 51 L 38 49 C 38 48.448 37.552 48 37 48 z M 42 48 C 41.448 48 41 48.448 41 49 L 41 51 C 41 51.552 41.448 52 42 52 C 42.552 52 43 51.552 43 51 L 43 49 C 43 48.448 42.552 48 42 48 z M 47 48 C 46.448 48 46 48.448 46 49 L 46 51 C 46 51.552 46.448 52 47 52 C 47.552 52 48 51.552 48 51 L 48 49 C 48 48.448 47.552 48 47 48 z M 52 48 C 51.448 48 51 48.448 51 49 L 51 51 C 51 51.552 51.448 52 52 52 C 52.552 52 53 51.552 53 51 L 53 49 C 53 48.448 52.552 48 52 48 z M 57 48 C 56.448 48 56 48.448 56 49 L 56 51 C 56 51.552 56.448 52 57 52 C 57.552 52 58 51.552 58 51 L 58 49 C 58 48.448 57.552 48 57 48 z');
        svgElement.appendChild(pathElement5);

        return svgElement;

    }

    /*
     * Sort By Functionality
     */

    // Click on sort by creation date
    $('body').on('click', '#creationDateSortBy', function (e) {
        // Change title of in the dropdown
        let sortByDiv = document.getElementById('sortByBtnTit');
        sortByDiv.setAttribute('data-i18n', 'transactions.dynamic.sort.creationdate');
        sortByDiv.textContent = isNotEmpty(window.translationData) ? window.translationData.transactions.dynamic.sort.creationdate : "Creation Date";
        // hide the category view
        let transactionsTable = document.getElementById('transactionsTable');
        transactionsTable.classList.remove('d-table');
        transactionsTable.classList.add('d-none');
        // hide the accountTable
        document.getElementById('accountTable').classList.add('d-none');
        // show the recent transactions
        document.getElementById(recentTransactionsId).classList.remove('d-none');
        // Hide all account tables loaded
        let accSortedTable = document.getElementById('accSortedTable');
        accSortedTable.classList.add('d-none');
        accSortedTable.classList.remove('d-table');
        // Open Account Modal
        document.getElementById('accountInformationMdl').classList.add('d-none');
        // Close Category Modal
        document.getElementById('categoryInformationMdl').classList.add('d-none');
        // Toggle  Financial Position
        document.getElementsByClassName('transactions-chart')[0].classList.remove('d-none');
        // show the future transactions
        let futureTransactionsTable = document.getElementById('futureTransactionsTable');
        futureTransactionsTable.classList.add('d-none');
        futureTransactionsTable.classList.remove('d-table');
        // show the tags sortby
        let tabsTable = document.getElementById('tagsTable');
        tabsTable.classList.add('d-none');
        tabsTable.classList.remove('d-table');
    });

    // Sort Options Wrapper
    $('body').on('click', '#sortOptionsWrapper .dropdown-item', function (e) {
        // If a new transaction is registered then population is necessary
        if (registeredNewTransaction) {
            registeredNewTransaction = false;
            // replace pie chart with material spinner
            replacePieChartWithMSpinner();
            // Fetch JSOn for transactions and populate pie chart
            fetchJSONForTransactions();
            return;
        }
    });

    // Click on sort by creation date
    $('body').on('click', '#categorySortBy', function (e) {
        // Change title of in the dropdown
        let sortByDiv = document.getElementById('sortByBtnTit');
        sortByDiv.setAttribute('data-i18n', 'transactions.dynamic.sort.category');
        sortByDiv.textContent = isNotEmpty(window.translationData) ? window.translationData.transactions.dynamic.sort.category : "Category";
        // hide the recent transactions
        document.getElementById(recentTransactionsId).classList.add('d-none');
        // hide the accountTable
        document.getElementById('accountTable').classList.add('d-none');
        // Hide all account tables loaded
        let accSortedTable = document.getElementById('accSortedTable');
        accSortedTable.classList.add('d-none');
        accSortedTable.classList.remove('d-table');
        // show the category view
        let transactionsTable = document.getElementById('transactionsTable');
        transactionsTable.classList.add('d-table');
        transactionsTable.classList.remove('d-none');
        // Open Account Modal
        document.getElementById('accountInformationMdl').classList.add('d-none');
        // Close Category Modal
        document.getElementById('categoryInformationMdl').classList.add('d-none');
        // Toggle  Financial Position
        document.getElementsByClassName('transactions-chart')[0].classList.remove('d-none');
        // show the future transactions
        let futureTransactionsTable = document.getElementById('futureTransactionsTable');
        futureTransactionsTable.classList.add('d-none');
        futureTransactionsTable.classList.remove('d-table');
        // show the tags sortby
        let tabsTable = document.getElementById('tagsTable');
        tabsTable.classList.add('d-none');
        tabsTable.classList.remove('d-table');
    });

    // Sorts the table by aggregating transactions by category
    $('body').on('click', '.categorySortGrp', function (e) {
        let parentWrapper = this.parentNode;
        let materialArrow = this.firstElementChild.firstElementChild;
        materialArrow.classList.toggle('rotateZero');
        materialArrow.classList.toggle('rotateNinty');
        let childElementWrappers = parentWrapper.childNodes;
        for (let i = 1, len = childElementWrappers.length; i < len; i++) {
            let childElementWrapper = childElementWrappers[i];
            childElementWrapper.classList.toggle('d-none');
            childElementWrapper.classList.toggle('d-table-row');
        }

    });

    // Sorts the table by aggregating transactions by account
    $('body').on('click', '#accountSortBy', function (e) {
        tr.sortTransactionsByAccount();
    });

    // Appends the date header for recent transactions
    function buildCategoryHeader(category) {
        let categoryData = window.categoryMap[category];
        let docFrag = document.createDocumentFragment();
        let categoryHeader = document.createElement('div');
        categoryHeader.id = 'categorySB-' + category;
        categoryHeader.setAttribute('data-target', category);
        categoryHeader.classList = 'tableBodyDiv categoryInfoTable noselect';

        let categoryTit = document.createElement('div');
        categoryTit.classList = 'categorySortGrp d-table-row ml-3 font-weight-bold';

        // Title Wrapper
        let titleWrapper = document.createElement('div');
        titleWrapper.classList = 'd-table-cell text-nowrap';

        // Right Arrow
        let rightArrow = document.createElement('div');
        rightArrow.classList = 'material-icons rotateNinty';
        rightArrow.textContent = 'keyboard_arrow_right';
        titleWrapper.appendChild(rightArrow);

        // Title
        let categoryTitle = document.createElement('a');
        categoryTitle.id = 'categoryTitle-' + category;
        categoryTitle.classList = 'pl-4 accTitleAnchor';
        categoryTitle.textContent = isNotEmpty(window.translatedCategoryName) ? window.translatedCategoryName[categoryData.name] : categoryData.name;
        titleWrapper.appendChild(categoryTitle);
        categoryTit.appendChild(titleWrapper);

        // Empty Cell
        let emptyCell = document.createElement('div');
        emptyCell.classList = 'd-table-cell';
        categoryTit.appendChild(emptyCell);

        // Account Balance
        let categoryBalance = document.createElement('div');
        categoryBalance.classList = 'd-table-cell text-right text-nowrap pr-3';
        if (categoryData.categoryTotal < 0) {
            categoryBalance.classList.add('expenseCategory');
        } else {
            categoryBalance.classList.add('incomeCategory');
        }
        categoryBalance.id = 'categoryBalance-' + category;
        categoryBalance.textContent = formatToCurrency(categoryData.categoryTotal);
        categoryTit.appendChild(categoryBalance);

        categoryHeader.appendChild(categoryTit);
        docFrag.appendChild(categoryHeader);
        return docFrag;
    }

    // Populate the account sort by section
    function populateTransactionsByCategory(userTransactionsList) {
        window.transactionsCache = {};
        // Remove all the transactions
        let transactionsTable = document.getElementById('transactionsTable');
        let populateTransactionsFragment = document.createDocumentFragment();
        let createdCategoryIds = [];

        for (let i = 0, len = userTransactionsList.length; i < len; i++) {
            let userTransaction = userTransactionsList[i];
            window.transactionsCache[userTransaction.transactionId] = userTransaction;
            let category = userTransaction.category;

            if (!includesStr(createdCategoryIds, category)) {
                populateTransactionsFragment.appendChild(buildCategoryHeader(category));
                // Add Created Accounts ID to the array
                createdCategoryIds.push(category);
            }
            populateTransactionsFragment.getElementById('categorySB-' + category).appendChild(buildTransactionRow(userTransaction, 'categorySorted'));
        }

        transactionsTable.appendChild(populateTransactionsFragment);
        document.getElementById(replaceTransactionsId).classList.add('d-none');
    }

    // Fetch all bank account information
    function buildCategoryHeaders(categoryList) {

        // Remove all the transactions
        let transactionsTable = document.getElementById('transactionsTable');
        let populateTransactionsFragment = document.createDocumentFragment();
        for (let i = 0, len = categoryList.length; i < len; i++) {
            let category = categoryList[i];

            if (isEmpty(document.getElementById('categorySB-' + category.categoryId))) {
                populateTransactionsFragment.appendChild(buildCategoryHeader(category.categoryId));
                populateTransactionsFragment.getElementById('categorySB-' + category.categoryId).appendChild(buildEmptyTableEntry('emptyCategoryItem-' + category.categoryId));
            }
        }

        transactionsTable.appendChild(populateTransactionsFragment);
        document.getElementById(replaceTransactionsId).classList.add('d-none');

    }

    // Populate the account sort by section
    function popTransByAccWOAJAX() {
        // Remove all the transactions
        $('.accountInfoTable').remove();
        let accountAggreDiv = document.getElementById('accSortedTable');
        let recentTransactionsFragment = document.createDocumentFragment();
        let createdAccIds = [];

        // Iterate all bank accounts
        let bankAccountMap = {};
        for (let i = 0, length = window.allBankAccountInfoCache.length; i < length; i++) {
            let bankAcc = window.allBankAccountInfoCache[i];
            // Bank account ID to map
            bankAccountMap[bankAcc.accountId] = bankAcc;
        }

        // Transactions Cache
        for (var key of Object.keys(window.transactionsCache)) {
            let userTransaction = window.transactionsCache[key];
            let accountId = userTransaction.account;

            if (notIncludesStr(createdAccIds, accountId)) {
                recentTransactionsFragment.appendChild(buildAccountHeader(bankAccountMap[accountId]));
                // Add Created Accounts ID to the array
                createdAccIds.push(accountId);
            }
            recentTransactionsFragment.getElementById('accountSB-' + accountId).appendChild(buildTransactionRow(userTransaction, 'accountAggre'));
        }

        document.getElementById('accountTable').classList.add('d-none');
        accountAggreDiv.appendChild(recentTransactionsFragment);

        // Fetch all bank account information To populate EMPTY Account
        let accHeadFrag = document.createDocumentFragment();
        // Iterate all bank accounts
        for (let i = 0, length = window.allBankAccountInfoCache.length; i < length; i++) {
            let bankAcc = window.allBankAccountInfoCache[i];
            // If the ID corresponding wiht the bank account is not populated then
            if (notIncludesStr(createdAccIds, bankAcc.accountId)) {
                // A new header for the rest
                let accountHeaderNew = buildAccountHeader(bankAcc);
                let accBal = accountHeaderNew.getElementById('accountBalance-' + bankAcc.accountId);
                if (bankAcc['account_balance'] < 0) {
                    accBal.classList.add('expenseCategory');
                } else {
                    accBal.classList.add('incomeCategory');
                }
                accBal.textContent = formatToCurrency(bankAcc['account_balance']);
                // Append Empty Table to child
                accountHeaderNew.getElementById('accountSB-' + bankAcc.accountId).appendChild(buildEmptyTableEntry('emptyAccountEntry-' + bankAcc.accountId));
                // Append to the transaction view
                accHeadFrag.appendChild(accountHeaderNew);
            }
        }

        // Append the account transactions to the table
        accountAggreDiv.appendChild(accHeadFrag);

    }

    // Hide Other Modals
    function hideOtherModals() {
        // Close Account Modal
        document.getElementById('accountInformationMdl').classList.add('d-none');
        // Close  Financial Position
        document.getElementsByClassName('transactions-chart')[0].classList.remove('d-none');
        // Close Category Modal
        document.getElementById('categoryInformationMdl').classList.add('d-none');
        // Close Transaction Modal
        document.getElementById('transactionInformationMdl').classList.add('d-none');
        // Remove all classlist that contains the selected transactions
        let selectedTransactions = document.querySelectorAll('.transaction-selected');
        /*
         * Delete all classlist with transactions selected
         */
        // Tags Chosen
        for (let i = 0, len = selectedTransactions.length; i < len; i++) {
            // remove the class
            selectedTransactions[i].classList.remove('transaction-selected');
        }
    }

}(jQuery));

tr = {

    // Total available section
    updateTotalAvailableSection(totalIncomeTransactions, totalExpensesTransactions, totalAvailableTransactions) {
        // Update the total income and expense cache
        window.totalIncomeForDate = totalIncomeTransactions;
        window.totalExpenseForDate = totalExpensesTransactions;

        animateValue(document.getElementById('totalAvailableTransactions'), 0, totalAvailableTransactions, currentCurrencyPreference, 1000);
        animateValue(document.getElementById('totalIncomeTransactions'), 0, totalIncomeTransactions, currentCurrencyPreference, 1000);
        animateValue(document.getElementById('totalExpensesTransactions'), 0, totalExpensesTransactions, currentCurrencyPreference, 1000);

        // Build Pie chart
        tr.buildPieChart(tr.updatePieChartTransactions(Math.abs(totalIncomeTransactions), Math.abs(totalExpensesTransactions), Math.abs(totalAvailableTransactions)), 'chartFinancialPosition');

    },

    // Update Totals for Transactions
    updatePieChartTransactions(totalIncomeTransactions, totalExpensesTransactions, totalAvailableTransactions) {
        let dataPreferences = {};
        if (totalIncomeTransactions === 0 && totalExpensesTransactions === 0) {
            let empty = isNotEmpty(window.translationData) ? window.translationData.transactions.dynamic.chart.empty : "Please fill in adequare data to build a chart";
            replaceHTML('legendPieChart', empty);
        } else if (totalIncomeTransactions < Math.abs(totalExpensesTransactions)) {
            let exp = isNotEmpty(window.translationData) ? window.translationData.transactions.dynamic.chart.expense : "Total Income & Total Overspent as a percentage of Total Expense";
            let overspent = isNotEmpty(window.translationData) ? window.translationData.transactions.dynamic.chart.overspent : "Total Overspent";
            replaceHTML('legendPieChart', exp);
            replaceHTML('totalAvailableLabel', overspent);
            let totalDeficitAsPercentageOfExpense = round(((totalAvailableTransactions / totalExpensesTransactions) * 100), 1);
            let totalIncomeAsPercentageOfExpense = round(((totalIncomeTransactions / totalExpensesTransactions) * 100), 1);
            // labels: [INCOME,EXPENSE,AVAILABLE]
            dataPreferences = {
                labels: [totalIncomeAsPercentageOfExpense + '%', " ", " ", totalDeficitAsPercentageOfExpense + '%'],
                series: [totalIncomeTransactions, 0, 0, totalAvailableTransactions]
            };
        } else {
            let income = isNotEmpty(window.translationData) ? window.translationData.transactions.dynamic.chart.income : "Total Spent & Total Available as a percentage of Total Income";
            let available = isNotEmpty(window.translationData) ? window.translationData.transactions.dynamic.chart.available : "Total Available";
            replaceHTML('legendPieChart', income);
            replaceHTML('totalAvailableLabel', available);
            let totalAvailableAsPercentageOfIncome = round(((totalAvailableTransactions / totalIncomeTransactions) * 100), 1);
            let totalExpenseAsPercentageOfIncome = round(((totalExpensesTransactions / totalIncomeTransactions) * 100), 1);
            // labels: [INCOME,EXPENSE,AVAILABLE]
            dataPreferences = {
                labels: [" ", totalExpenseAsPercentageOfIncome + '%', totalAvailableAsPercentageOfIncome + '%', " "],
                series: [0, totalExpensesTransactions, totalAvailableTransactions, 0]
            };
        }

        return dataPreferences;

    },

    // Build Pie Chart for transactions
    buildPieChart(dataPreferences, id) {
        /*  **************** Public Preferences - Pie Chart ******************** */
        let inc = window.translationData.transactions.dynamic.chart.labels.income;
        let spent = window.translationData.transactions.dynamic.chart.labels.spent;
        let avai = window.translationData.transactions.dynamic.chart.labels.available;
        let oversp = window.translationData.transactions.dynamic.chart.labels.overspent;
        let labels = [inc, spent, avai, oversp];

        var optionsPreferences = {
            donut: true,
            donutWidth: 50,
            startAngle: 270,
            showLabel: true,
            height: '230px'
        };

        // Reset the chart
        if (isNotEmpty(window.transactionsChart)) {
            window.transactionsChart.detach();
        }
        replaceHTML(id, '');
        // Dispose tooltips
        $("#" + id).tooltip('dispose');

        if (isNotEmpty(dataPreferences)) {
            window.transactionsChart = new Chartist.Pie('#' + id, dataPreferences, optionsPreferences).on('draw', function (data) {
                if (data.type === 'slice') {
                    let sliceValue = data.element._node.getAttribute('ct:value');
                    data.element._node.setAttribute("title", labels[data.index] + ": <strong>" + formatToCurrency(Number(sliceValue)) + '</strong>');
                    data.element._node.setAttribute("data-chart-tooltip", id);
                }
            }).on("created", function () {
                let chartLegend = document.getElementById('chartLegend');
                let incomeAmount = document.getElementById('totalIncomeTransactions');
                let expenseAmount = document.getElementById('totalExpensesTransactions');
                let totalAvailable = document.getElementById('totalAvailableTransactions');

                // Initiate Tooltip
                $("#" + id).tooltip({
                    selector: '[data-chart-tooltip="' + id + '"]',
                    container: "#" + id,
                    html: true,
                    placement: 'auto',
                    delay: {
                        "show": 300,
                        "hide": 100
                    }
                });

                $('.ct-slice-donut').on('mouseover mouseout', function () {
                    chartLegend.classList.toggle('hiddenAfterHalfASec');
                    chartLegend.classList.toggle('visibleAfterHalfASec');
                });

                $('.ct-series-a').on('mouseover mouseout', function () {
                    incomeAmount.classList.toggle('transitionTextToNormal');
                    incomeAmount.classList.toggle('transitionTextTo120');
                });

                $('.ct-series-b').on('mouseover mouseout', function () {
                    expenseAmount.classList.toggle('transitionTextToNormal');
                    expenseAmount.classList.toggle('transitionTextTo120');
                });

                $('.ct-series-c').on('mouseover mouseout', function () {
                    totalAvailable.classList.toggle('transitionTextToNormal');
                    totalAvailable.classList.toggle('transitionTextTo120');
                });
            });

            // Animate the doughnut chart
            er.startAnimationDonutChart(window.transactionsChart);
        }

    },

    // Load Categories for transaction
    loadCategoriesForTransaction(dropdownId, expenseId, incomeId) {
        // set default category
        let defaultCategory = window.defaultCategories[1];
        if (isEmpty(defaultCategory.id)) {
            document.getElementById(dropdownId).setAttribute('data-chosen', defaultCategory.name);
        } else {
            document.getElementById(dropdownId).setAttribute('data-chosen', defaultCategory.id);
        }

        // Load Expense category and income category
        let expenseSelectionDiv = document.getElementById(expenseId);
        while (expenseSelectionDiv.firstChild) {
            expenseSelectionDiv.removeChild(expenseSelectionDiv.lastChild);
        }
        let incomeSelectionDiv = document.getElementById(incomeId);
        while (incomeSelectionDiv.firstChild) {
            incomeSelectionDiv.removeChild(incomeSelectionDiv.lastChild);
        }
        expenseDropdownItems = cloneElementAndAppend(expenseSelectionDiv, expenseDropdownItems);
        incomeDropdownItems = cloneElementAndAppend(incomeSelectionDiv, incomeDropdownItems);

    },


    /*
     * Sort Transactions by Account
     */
    sortTransactionsByAccount() {
        // Change title of in the dropdown
        let sortByDiv = document.getElementById('sortByBtnTit');
        sortByDiv.setAttribute('data-i18n', 'transactions.dynamic.sort.account');
        sortByDiv.textContent = isNotEmpty(window.translationData) ? window.translationData.transactions.dynamic.sort.account : "Account";
        // hide the recent transactions
        document.getElementById('recentTransactions').classList.add('d-none');
        // Show the account Table
        let accSortedTable = document.getElementById('accSortedTable');
        accSortedTable.classList.remove('d-none');
        accSortedTable.classList.add('d-table');
        // Close Category Modal
        document.getElementById('categoryInformationMdl').classList.add('d-none');
        // show the future transactions
        let futureTransactionsTable = document.getElementById('futureTransactionsTable');
        futureTransactionsTable.classList.add('d-none');
        futureTransactionsTable.classList.remove('d-table');
        // show the tags sortby
        let tabsTable = document.getElementById('tagsTable');
        tabsTable.classList.add('d-none');
        tabsTable.classList.remove('d-table');
        // Toggle  Financial Position
        document.getElementsByClassName('transactions-chart')[0].classList.remove('d-none');
        // hide the transactions table
        let transactionsTable = document.getElementById('transactionsTable');
        transactionsTable.classList.remove('d-table');
        transactionsTable.classList.add('d-none');
        // Remove Account Table Class
        let popAccInfoTab = document.getElementsByClassName('accountInfoTable');
        if (isEmpty(popAccInfoTab)) {
            // Show the accountTable
            document.getElementById('accountTable').classList.remove('d-none');
        } else {
            for (let i = 0, len = popAccInfoTab.length; i < len; i++) {
                let elementInArray = popAccInfoTab[i];

                if (elementInArray.classList.contains('rotateZero')) {
                    elementInArray.classList.remove('rotateZero');
                    elementInArray.classList.add('rotateNinty');
                }
            }
        }
    }

}

// Build EmptyRecTransTable
function buildEmptyTransactionsTab(className) {

    let rowEmpty = document.createElement('div');
    rowEmpty.classList = 'd-table-row ' + className;

    let cell1 = document.createElement('div');
    cell1.classList = 'd-table-cell';
    rowEmpty.appendChild(cell1);

    let cell2 = document.createElement('div');
    cell2.classList = 'd-table-cell text-center';
    cell2.appendChild(buildEmptyTransactionsSvg());

    let emptyMessageRow = document.createElement('div');
    emptyMessageRow.classList = 'text-center tripleNineColor font-weight-bold';
    emptyMessageRow.setAttribute('data-i18n', 'transactions.dynamic.empty.success');
    emptyMessageRow.textContent = isNotEmpty(window.translationData) ? window.translationData.transactions.dynamic.empty.success : "Oh! Snap! You don't have any transactions yet.";
    cell2.appendChild(emptyMessageRow);
    rowEmpty.appendChild(cell2);

    let cell3 = document.createElement('div');
    cell3.classList = 'd-table-cell';
    rowEmpty.appendChild(cell3);

    return rowEmpty;
}

// Empty Transactions SVG
function buildEmptyTransactionsSvg() {

    let svgElement = document.createElementNS("http://www.w3.org/2000/svg", 'svg');
    svgElement.setAttribute('width', '64');
    svgElement.setAttribute('height', '64');
    svgElement.setAttribute('viewBox', '0 0 64 64');
    svgElement.setAttribute('class', 'transactions-empty-svg');

    let pathElement1 = document.createElementNS("http://www.w3.org/2000/svg", 'path');
    pathElement1.setAttribute('d', 'M 5 8 C 3.346 8 2 9.346 2 11 L 2 53 C 2 54.654 3.346 56 5 56 L 59 56 C 60.654 56 62 54.654 62 53 L 62 11 C 62 9.346 60.654 8 59 8 L 5 8 z M 5 10 L 59 10 C 59.551 10 60 10.449 60 11 L 60 20 L 4 20 L 4 11 C 4 10.449 4.449 10 5 10 z M 28 12 C 26.897 12 26 12.897 26 14 L 26 16 C 26 17.103 26.897 18 28 18 L 56 18 C 57.103 18 58 17.103 58 16 L 58 14 C 58 12.897 57.103 12 56 12 L 28 12 z M 28 14 L 56 14 L 56.001953 16 L 28 16 L 28 14 z M 4 22 L 60 22 L 60 53 C 60 53.551 59.551 54 59 54 L 5 54 C 4.449 54 4 53.551 4 53 L 4 22 z');
    svgElement.appendChild(pathElement1);

    let pathElement11 = document.createElementNS("http://www.w3.org/2000/svg", 'path');
    pathElement11.setAttribute('class', 'coloredTransactionLine');
    pathElement11.setAttribute('d', ' M 8 13 A 2 2 0 0 0 6 15 A 2 2 0 0 0 8 17 A 2 2 0 0 0 10 15 A 2 2 0 0 0 8 13 z');
    svgElement.appendChild(pathElement11);

    let pathElement12 = document.createElementNS("http://www.w3.org/2000/svg", 'path');
    pathElement12.setAttribute('d', ' M 14 13 A 2 2 0 0 0 12 15 A 2 2 0 0 0 14 17 A 2 2 0 0 0 16 15 A 2 2 0 0 0 14 13 z M 20 13 A 2 2 0 0 0 18 15 A 2 2 0 0 0 20 17 A 2 2 0 0 0 22 15 A 2 2 0 0 0 20 13 z ');
    svgElement.appendChild(pathElement12);

    let pathElement2 = document.createElementNS("http://www.w3.org/2000/svg", 'path');
    pathElement2.setAttribute('class', 'coloredTransactionLine');
    pathElement2.setAttribute('d', 'M 11 27.974609 C 10.448 27.974609 10 28.422609 10 28.974609 C 10 29.526609 10.448 29.974609 11 29.974609 L 15 29.974609 C 15.552 29.974609 16 29.526609 16 28.974609 C 16 28.422609 15.552 27.974609 15 27.974609 L 11 27.974609 z M 19 27.974609 C 18.448 27.974609 18 28.422609 18 28.974609 C 18 29.526609 18.448 29.974609 19 29.974609 L 33 29.974609 C 33.552 29.974609 34 29.526609 34 28.974609 C 34 28.422609 33.552 27.974609 33 27.974609 L 19 27.974609 z');
    svgElement.appendChild(pathElement2);

    let pathElement21 = document.createElementNS("http://www.w3.org/2000/svg", 'path');
    pathElement21.setAttribute('d', ' M 39 27.974609 C 38.448 27.974609 38 28.422609 38 28.974609 C 38 29.526609 38.448 29.974609 39 29.974609 L 41 29.974609 C 41.552 29.974609 42 29.526609 42 28.974609 C 42 28.422609 41.552 27.974609 41 27.974609 L 39 27.974609 z M 45 27.974609 C 44.448 27.974609 44 28.422609 44 28.974609 C 44 29.526609 44.448 29.974609 45 29.974609 L 47 29.974609 C 47.552 29.974609 48 29.526609 48 28.974609 C 48 28.422609 47.552 27.974609 47 27.974609 L 45 27.974609 z M 51 27.974609 C 50.448 27.974609 50 28.422609 50 28.974609 C 50 29.526609 50.448 29.974609 51 29.974609 L 53 29.974609 C 53.552 29.974609 54 29.526609 54 28.974609 C 54 28.422609 53.552 27.974609 53 27.974609 L 51 27.974609 z');
    svgElement.appendChild(pathElement21);

    let pathElement3 = document.createElementNS("http://www.w3.org/2000/svg", 'path');
    pathElement3.setAttribute('class', 'coloredTransactionLine');
    pathElement3.setAttribute('d', 'M 11 33.974609 C 10.448 33.974609 10 34.422609 10 34.974609 C 10 35.526609 10.448 35.974609 11 35.974609 L 15 35.974609 C 15.552 35.974609 16 35.526609 16 34.974609 C 16 34.422609 15.552 33.974609 15 33.974609 L 11 33.974609 z M 19 33.974609 C 18.448 33.974609 18 34.422609 18 34.974609 C 18 35.526609 18.448 35.974609 19 35.974609 L 33 35.974609 C 33.552 35.974609 34 35.526609 34 34.974609 C 34 34.422609 33.552 33.974609 33 33.974609 L 19 33.974609 z');
    svgElement.appendChild(pathElement3);

    let pathElement31 = document.createElementNS("http://www.w3.org/2000/svg", 'path');
    pathElement31.setAttribute('d', ' M 45 33.974609 C 44.448 33.974609 44 34.422609 44 34.974609 C 44 35.526609 44.448 35.974609 45 35.974609 L 47 35.974609 C 47.552 35.974609 48 35.526609 48 34.974609 C 48 34.422609 47.552 33.974609 47 33.974609 L 45 33.974609 z M 51 33.974609 C 50.448 33.974609 50 34.422609 50 34.974609 C 50 35.526609 50.448 35.974609 51 35.974609 L 53 35.974609 C 53.552 35.974609 54 35.526609 54 34.974609 C 54 34.422609 53.552 33.974609 53 33.974609 L 51 33.974609 z');
    svgElement.appendChild(pathElement31);

    let pathElement4 = document.createElementNS("http://www.w3.org/2000/svg", 'path');
    pathElement4.setAttribute('class', 'coloredTransactionLine');
    pathElement4.setAttribute('d', 'M 11 39.974609 C 10.448 39.974609 10 40.422609 10 40.974609 C 10 41.526609 10.448 41.974609 11 41.974609 L 15 41.974609 C 15.552 41.974609 16 41.526609 16 40.974609 C 16 40.422609 15.552 39.974609 15 39.974609 L 11 39.974609 z M 19 39.974609 C 18.448 39.974609 18 40.422609 18 40.974609 C 18 41.526609 18.448 41.974609 19 41.974609 L 33 41.974609 C 33.552 41.974609 34 41.526609 34 40.974609 C 34 40.422609 33.552 39.974609 33 39.974609 L 19 39.974609 z');
    svgElement.appendChild(pathElement4);

    let pathElement41 = document.createElementNS("http://www.w3.org/2000/svg", 'path');
    pathElement41.setAttribute('d', 'M 39 39.974609 C 38.448 39.974609 38 40.422609 38 40.974609 C 38 41.526609 38.448 41.974609 39 41.974609 L 41 41.974609 C 41.552 41.974609 42 41.526609 42 40.974609 C 42 40.422609 41.552 39.974609 41 39.974609 L 39 39.974609 z M 45 39.974609 C 44.448 39.974609 44 40.422609 44 40.974609 C 44 41.526609 44.448 41.974609 45 41.974609 L 47 41.974609 C 47.552 41.974609 48 41.526609 48 40.974609 C 48 40.422609 47.552 39.974609 47 39.974609 L 45 39.974609 z M 51 39.974609 C 50.448 39.974609 50 40.422609 50 40.974609 C 50 41.526609 50.448 41.974609 51 41.974609 L 53 41.974609 C 53.552 41.974609 54 41.526609 54 40.974609 C 54 40.422609 53.552 39.974609 53 39.974609 L 51 39.974609 z ');
    svgElement.appendChild(pathElement41);

    let pathElement5 = document.createElementNS("http://www.w3.org/2000/svg", 'path');
    pathElement5.setAttribute('d', 'M 7 48 C 6.448 48 6 48.448 6 49 L 6 51 C 6 51.552 6.448 52 7 52 C 7.552 52 8 51.552 8 51 L 8 49 C 8 48.448 7.552 48 7 48 z M 12 48 C 11.448 48 11 48.448 11 49 L 11 51 C 11 51.552 11.448 52 12 52 C 12.552 52 13 51.552 13 51 L 13 49 C 13 48.448 12.552 48 12 48 z M 17 48 C 16.448 48 16 48.448 16 49 L 16 51 C 16 51.552 16.448 52 17 52 C 17.552 52 18 51.552 18 51 L 18 49 C 18 48.448 17.552 48 17 48 z M 22 48 C 21.448 48 21 48.448 21 49 L 21 51 C 21 51.552 21.448 52 22 52 C 22.552 52 23 51.552 23 51 L 23 49 C 23 48.448 22.552 48 22 48 z M 27 48 C 26.448 48 26 48.448 26 49 L 26 51 C 26 51.552 26.448 52 27 52 C 27.552 52 28 51.552 28 51 L 28 49 C 28 48.448 27.552 48 27 48 z M 32 48 C 31.448 48 31 48.448 31 49 L 31 51 C 31 51.552 31.448 52 32 52 C 32.552 52 33 51.552 33 51 L 33 49 C 33 48.448 32.552 48 32 48 z M 37 48 C 36.448 48 36 48.448 36 49 L 36 51 C 36 51.552 36.448 52 37 52 C 37.552 52 38 51.552 38 51 L 38 49 C 38 48.448 37.552 48 37 48 z M 42 48 C 41.448 48 41 48.448 41 49 L 41 51 C 41 51.552 41.448 52 42 52 C 42.552 52 43 51.552 43 51 L 43 49 C 43 48.448 42.552 48 42 48 z M 47 48 C 46.448 48 46 48.448 46 49 L 46 51 C 46 51.552 46.448 52 47 52 C 47.552 52 48 51.552 48 51 L 48 49 C 48 48.448 47.552 48 47 48 z M 52 48 C 51.448 48 51 48.448 51 49 L 51 51 C 51 51.552 51.448 52 52 52 C 52.552 52 53 51.552 53 51 L 53 49 C 53 48.448 52.552 48 52 48 z M 57 48 C 56.448 48 56 48.448 56 49 L 56 51 C 56 51.552 56.448 52 57 52 C 57.552 52 58 51.552 58 51 L 58 49 C 58 48.448 57.552 48 57 48 z');
    svgElement.appendChild(pathElement5);

    return svgElement;

}

// Raw Plus Svg
function plusRawSvg() {
    let svgElement = document.createElementNS("http://www.w3.org/2000/svg", 'svg');
    svgElement.setAttribute('class', 'align-middle plusRawSvg');
    svgElement.setAttribute('x', '0px');
    svgElement.setAttribute('y', '0px');
    svgElement.setAttribute('width', '24');
    svgElement.setAttribute('height', '24');
    svgElement.setAttribute('viewBox', '0 0 25 29');
    svgElement.setAttribute('fill', '#000000');

    let pathElement = document.createElementNS("http://www.w3.org/2000/svg", 'path');
    pathElement.setAttribute('class', 'plusRawPath');
    pathElement.setAttribute('overflow', 'visible');
    pathElement.setAttribute('white-space', 'normal');
    pathElement.setAttribute('font-family', 'sans-serif');
    pathElement.setAttribute('font-weight', '400');
    pathElement.setAttribute('d', 'M 11 2 L 11 11 L 2 11 L 2 13 L 11 13 L 11 22 L 13 22 L 13 13 L 22 13 L 22 11 L 13 11 L 13 2 Z');

    svgElement.appendChild(pathElement);

    return svgElement;
}

// Credit card SVG Image
function creditCardSvg() {
    let svgElement = document.createElementNS("http://www.w3.org/2000/svg", 'svg');
    svgElement.setAttribute('class', 'align-middle creditCardSvg');
    svgElement.setAttribute('x', '0px');
    svgElement.setAttribute('y', '0px');
    svgElement.setAttribute('width', '30');
    svgElement.setAttribute('height', '30');
    svgElement.setAttribute('viewBox', '0 0 80 90');
    svgElement.setAttribute('fill', '#000000');

    let pathElement = document.createElementNS("http://www.w3.org/2000/svg", 'path');
    pathElement.setAttribute('class', 'creditCardPath');
    pathElement.setAttribute('d', 'M 11 16 C 8.2504839 16 6 18.250484 6 21 L 6 59 C 6 61.749516 8.2504839 64 11 64 L 69 64 C 71.749516 64 74 61.749516 74 59 L 74 21 C 74 18.250484 71.749516 16 69 16 L 11 16 z M 11 18 L 69 18 C 70.668484 18 72 19.331516 72 21 L 72 26 L 8 26 L 8 21 C 8 19.331516 9.3315161 18 11 18 z M 8 30 L 72 30 L 72 59 C 72 60.668484 70.668484 62 69 62 L 11 62 C 9.3315161 62 8 60.668484 8 59 L 8 30 z M 12 35 A 1 1 0 0 0 11 36 A 1 1 0 0 0 12 37 A 1 1 0 0 0 13 36 A 1 1 0 0 0 12 35 z M 16 35 A 1 1 0 0 0 15 36 A 1 1 0 0 0 16 37 A 1 1 0 0 0 17 36 A 1 1 0 0 0 16 35 z M 20 35 A 1 1 0 0 0 19 36 A 1 1 0 0 0 20 37 A 1 1 0 0 0 21 36 A 1 1 0 0 0 20 35 z M 24 35 A 1 1 0 0 0 23 36 A 1 1 0 0 0 24 37 A 1 1 0 0 0 25 36 A 1 1 0 0 0 24 35 z M 28 35 A 1 1 0 0 0 27 36 A 1 1 0 0 0 28 37 A 1 1 0 0 0 29 36 A 1 1 0 0 0 28 35 z M 32 35 A 1 1 0 0 0 31 36 A 1 1 0 0 0 32 37 A 1 1 0 0 0 33 36 A 1 1 0 0 0 32 35 z M 36 35 A 1 1 0 0 0 35 36 A 1 1 0 0 0 36 37 A 1 1 0 0 0 37 36 A 1 1 0 0 0 36 35 z M 52 43 C 48.145666 43 45 46.145666 45 50 C 45 53.854334 48.145666 57 52 57 C 53.485878 57 54.862958 56.523344 55.996094 55.730469 A 7 7 0 0 0 60 57 A 7 7 0 0 0 67 50 A 7 7 0 0 0 60 43 A 7 7 0 0 0 55.990234 44.265625 C 54.858181 43.47519 53.483355 43 52 43 z M 52 45 C 52.915102 45 53.75982 45.253037 54.494141 45.681641 A 7 7 0 0 0 53 50 A 7 7 0 0 0 54.498047 54.314453 C 53.762696 54.74469 52.916979 55 52 55 C 49.226334 55 47 52.773666 47 50 C 47 47.226334 49.226334 45 52 45 z');

    svgElement.appendChild(pathElement);

    return svgElement;
}
