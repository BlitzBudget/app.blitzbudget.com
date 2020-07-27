"use strict";
(function scopeWrapper($) {
    // User Budget Map Cache
    let userBudgetCache = {};
    // OVERVIEW CONSTANTS
    const OVERVIEW_CONSTANTS = {};
    // SECURITY: Defining Immutable properties as constants
    let oneyearoverview = isNotEmpty(window.translationData) ? window.translationData.overview.dynamic.oneyear : 'One Year Overview';
    let incomeparam = isNotEmpty(window.translationData) ? window.translationData.overview.dynamic.incomeparam : 'Income';
    let expenseparam = isNotEmpty(window.translationData) ? window.translationData.overview.dynamic.expenseparam : 'Expense';
    // Lifetime Income Transactions cache
    window.liftimeTransactionsCache = {};
    // populate category breakdown for income or expense
    let fetchIncomeBreakDownCache = true;
    // One year Overview
    let oneYearOverviewOption = 'oneyearoverview';
    // Category Breakdown
    let categoryBreakdownOption = 'categorybreakdown';
    // One Year Overview option
    window.whichChartIsOpen = oneYearOverviewOption;
    // Cache the previous year picker date
    let currentYearSelect = new Date().getFullYear();
    let previousDateYearPicker = currentYearSelect - 2;
    // Cache the next year Picker data
    let nextDateYearPicker = currentYearSelect + 2;

    /**
     * Get Overview
     **/
    /**
     * START loading the page
     *
     */
    let currentPageInCookie = er.getCookie('currentPage');
    if (isEqual(currentPageInCookie, 'overviewPage')) {
        if (isEqual(window.location.href, window._config.app.invokeUrl)) {
            populateCurrentPage('overviewPage');
        }
    }

    let overviewPage = document.getElementById('overviewPage');
    if (isNotEmpty(overviewPage)) {
        overviewPage.addEventListener("click", function (e) {
            populateCurrentPage('overviewPage');
        });
    }

    function populateCurrentPage(page) {
        er.refreshCookiePageExpiry(page);
        er.fetchCurrentPage('/overview', function (data) {
            // Load the new HTML
            $('#mutableDashboard').html(data);
            // Translate current Page
            translatePage(getLanguage());
            /**
             * Get Overview
             **/
            fetchOverview(incomeparam);
            populateOverviewPage();
            // Set Current Page
            let currentPage = document.getElementById('currentPage');
            currentPage.setAttribute('data-i18n', 'overview.page.title');
            currentPage.textContent = isNotEmpty(window.translationData) ? window.translationData.overview.dynamic.title : 'Overview';
        });
    }

    function populateOverviewPage() {
        /**
         *  Add Functionality Generic + Btn
         **/

        // Generic Add Functionality
        let genericAddFnc = document.getElementById('genericAddFnc');
        genericAddFnc.classList.add('d-none');

        // If highlight is not present
        if (document.getElementsByClassName('highlightOverviewSelected').length == 0) {
            // Add highlighted element to the income
            document.getElementsByClassName('income')[0].classList.add('highlightOverviewSelected');
            // Choose one year overview
            window.whichChartIsOpen = oneYearOverviewOption;
        }

        /**
         * Date Picker
         */

        // Date Picker on click month
        $('.monthPickerMonth').unbind('click').click(function () {
            // Month picker is current selected then do nothing
            if (this.classList.contains('monthPickerMonthSelected')) {
                return;
            }

            // Set chosen date
            er.setChosenDateWithSelected(this);
            // Calculate the income and expense image
            let highlightedOverview = document.getElementsByClassName('highlightOverviewSelected')[0].classList;
            let expenseImage = highlightedOverview.contains('expense');
            let incomeImage = highlightedOverview.contains('income');
            let incomeTotalParam;
            if (expenseImage) {
                incomeTotalParam = expenseparam;
            }
            if (incomeImage) {
                incomeTotalParam = incomeparam;
            }

            fetchOverview(incomeTotalParam);

        });
    }

    function fetchOverview(incomeTotalParam) {

        let budgetDivFragment = document.createDocumentFragment();

        let values = {};
        if (isNotEmpty(window.currentUser.walletId)) {
            values.walletId = window.currentUser.walletId;
            values.userId = window.currentUser.financialPortfolioId;
        } else {
            values.userId = window.currentUser.financialPortfolioId;
        }
        let y = window.chosenDate.getFullYear(),
            m = window.chosenDate.getMonth();
        values.startsWithDate = new Date(y, m);
        values.endsWithDate = new Date(y, m + 1, 0);

        // Ajax Requests on Error
        let ajaxData = {};
        ajaxData.isAjaxReq = true;
        ajaxData.type = 'POST';
        ajaxData.url = CUSTOM_DASHBOARD_CONSTANTS.overviewUrl;
        ajaxData.dataType = "json";
        ajaxData.contentType = "application/json;charset=UTF-8";
        ajaxData.data = JSON.stringify(values);
        ajaxData.onSuccess = function (result) {
                oneyearoverview = isNotEmpty(window.translationData) ? window.translationData.overview.dynamic.oneyear : 'One Year Overview';
                incomeparam = isNotEmpty(window.translationData) ? window.translationData.overview.dynamic.incomeparam : 'Income';
                expenseparam = isNotEmpty(window.translationData) ? window.translationData.overview.dynamic.expenseparam : 'Expense';
                // Dates Cache
                window.datesCreated = result.Date;
                // Global Transactions Cache
                window.overviewTransactionsCache = result.Transaction;

                er_a.populateBankInfo(result.BankAccount);

                fetchJSONForCategories(result.Category);

                populateAppropriateChart(result.Date);

                // Replace currentCurrencySymbol with currency symbol
                replaceWithCurrency(result.Wallet);
                /**
                 * Populate total Asset, Liability & Networth
                 */
                populateTotalAssetLiabilityAndNetworth(result.Wallet);
            },
            ajaxData.onFailure = function (thrownError) {
                manageErrors(thrownError, window.translationData.overview.dynamic.geterror, ajaxData);
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

    /*
     * Populate appropriate chart
     */
    function populateAppropriateChart(dateLineChart) {
        // Replace the drop down for chart options
        let incomeOrExpenseLabel = fetchIncomeBreakDownCache ? "Income" : "Expense";
        // Label For Category
        let labelForCategory = fetchIncomeBreakDownCache ? window.translationData.overview.dynamic.incomebreakdown : window.translationData.overview.dynamic.expensebreakdown;
        appendChartOptionsForIncomeOrExpense(incomeOrExpenseLabel, labelForCategory);
        // Show the button to choose charts
        document.getElementById('chosenChartIncAndExp').classList.remove('d-none');
        document.getElementById('chosenChartIncAndExp').classList.add('d-lg-block');
        // Which Chart is open
        switch (window.whichChartIsOpen) {
            case categoryBreakdownOption:
                // Populate category brakdown
                populateCategoryBreakdown(fetchIncomeBreakDownCache);
                document.getElementById('chartDisplayTitle').firstChild.nodeValue = labelForCategory;
                break;
            case oneYearOverviewOption:
                // Upon refresh call the income overview chart
                populateLineChart(dateLineChart, true);
                document.getElementById('chartDisplayTitle').firstChild.nodeValue = labelForCategory;
                break;
            case 'categorizebytags':
                // Populate Categorize By tags
                populateCategorizeByTags(fetchIncomeBreakDownCache, window.overviewTransactionsCache);
                break;
            case 'categorizebyaccounts':
                // Populate Categorize By Account
                populateCategorizeByAccount(fetchIncomeBreakDownCache, window.overviewTransactionsCache);
                break;
        }
    }

    // Populate Income Average
    function populateTotalAssetLiabilityAndNetworth(wallet) {

        // Asset Accumulated
        // Animate Value from 0 to value 
        animateValue(document.getElementById('assetAccumuluatedAmount'), 0, wallet['total_asset_balance'], currentCurrencyPreference, 200);

        // Debt Accumulated
        // Animate Value from 0 to value 
        animateValue(document.getElementById('debtAccumulatedAmount'), 0, wallet['total_debt_balance'], currentCurrencyPreference, 200);

        // Networth Accumulated
        // Animate Value from 0 to value 
        animateValue(document.getElementById('networthAmount'), 0, wallet['wallet_balance'], currentCurrencyPreference, 200);
    }

    /**
     * Chart Functionality
     *
     */

    function incomeOrExpenseOverviewChart(incomeTotalParameter, dateAndAmountAsList) {
        // If income Total Param is empty
        if (isEmpty(incomeTotalParameter)) {
            return;
        }

        // Replace the Drop down with one year view
        replaceChartChosenLabel(oneyearoverview);

        // Store it in a cache
        liftimeTransactionsCache = dateAndAmountAsList;
        // Make it reasonably immutable
        Object.freeze(liftimeTransactionsCache);
        Object.seal(liftimeTransactionsCache);
        // Income or Expense Chart Options
        let incomeOrExpense = '';
        let translatedText;

        if (isEqual(incomeparam, incomeTotalParameter)) {

            incomeOrExpense = 'Income';
            translatedText = window.translationData.overview.dynamic.chart.incomeoverview;

            calcAndBuildLineChart(dateAndAmountAsList, 'income_total');

        } else {

            incomeOrExpense = 'Expense';
            translatedText = window.translationData.overview.dynamic.chart.expenseoverview;

            calcAndBuildLineChart(dateAndAmountAsList, 'expense_total');
        }

        appendChartOptionsForIncomeOrExpense(incomeOrExpense, translatedText);
    }

    // Calculate and build line chart for income / expense
    function calcAndBuildLineChart(dateAndAmountAsList, totalAm) {
        let labelsArray = [];
        let seriesArray = [];

        let chartAppendingDiv = document.getElementById('colouredRoundedLineChart');
        // Replace inner HTML with EMPTY
        while (chartAppendingDiv.firstChild) {
            chartAppendingDiv.removeChild(chartAppendingDiv.firstChild);
        }
        // Replace with empty chart message
        if (isEmpty(dateAndAmountAsList)) {
            chartAppendingDiv.appendChild(buildEmptyChartMessageForOverview());
            // Populate the empty data in detail
            populateDetailedOverviewForChart(seriesArray, true, "Highest Income", "Lowest Income", "Average Income", "Your Income");
            return;
        }

        // If year selected in IYP then
        let countValue = 0;
        // One year of data at a time;
        countValue = dateAndAmountAsList.length > 12 ? (dateAndAmountAsList.length - 12) : 0;

        for (let countGrouped = countValue, length = dateAndAmountAsList.length; countGrouped < length; countGrouped++) {
            let dateItem = dateAndAmountAsList[countGrouped];

            // Convert the date key as date
            let dateAsDate = new Date(lastElement(splitElement(dateItem.dateId, '#')));

            labelsArray.push(months[dateAsDate.getMonth()].slice(0, 3) + " '" + dateAsDate.getFullYear().toString().slice(-2));

            // Build the series array with total amount for date
            seriesArray.push(dateItem[totalAm]);

        }

        // Build the data for the line chart
        dataColouredRoundedLineChart = {
            labels: labelsArray,
            series: [
		        	seriesArray
		         ]
        };

        // Populate the data in detail
        populateDetailedOverviewForChart(dataColouredRoundedLineChart, true, "Highest Income", "Lowest Income", "Average Income", "Your Income");

        // Replace with empty chart message
        if (isEmpty(seriesArray)) {
            chartAppendingDiv.appendChild(buildEmptyChartMessageForOverview());
            return;
        } else if (seriesArray.length == 1) {
            chartAppendingDiv.appendChild(buildInsufficientInfoMessage());
            return;
        }

        // Display the line chart
        coloredRounedLineChart(dataColouredRoundedLineChart);
    }

    // Click the overview card items
    $('body').on('click', '.chart-option', function () {
        oneyearoverview = isNotEmpty(window.translationData) ? window.translationData.overview.dynamic.oneyear : 'One Year Overview';
        incomeparam = isNotEmpty(window.translationData) ? window.translationData.overview.dynamic.incomeparam : 'Income';
        expenseparam = isNotEmpty(window.translationData) ? window.translationData.overview.dynamic.expenseparam : 'Expense';
        $('.chart-option').removeClass('active');
        this.classList.add('active');
        // Append spinner
        let chartAppendingDiv = document.getElementById('colouredRoundedLineChart');
        let materialSpinnerDocumentFragment = document.createDocumentFragment();
        materialSpinnerDocumentFragment.appendChild(buildMaterialSpinner());
        // Replace inner HTML with EMPTY
        while (chartAppendingDiv.firstChild) {
            chartAppendingDiv.removeChild(chartAppendingDiv.firstChild);
        }
        chartAppendingDiv.appendChild(materialSpinnerDocumentFragment);

        // Start requesting the chart
        let firstChildClassList = this.classList;
        if (firstChildClassList.contains('income')) {
            fetchIncomeBreakDownCache = true;
            // Populate appropriate chart
            populateAppropriateChart(liftimeTransactionsCache);
        } else if (firstChildClassList.contains('expense')) {
            fetchIncomeBreakDownCache = false;
            // Populate appropriate chart
            populateAppropriateChart(liftimeTransactionsCache);
        } else if (firstChildClassList.contains('assets')) {
            // Populate Asset Chart
            populateAssetBarChart(true);
            // Change Label
            document.getElementById('chartDisplayTitle').firstChild.nodeValue = window.translationData.overview.dynamic.chart.assetoverview;
        } else if (firstChildClassList.contains('debt')) {
            // Populate Debt Chart
            populateAssetBarChart(false);
            // Change Label
            document.getElementById('chartDisplayTitle').firstChild.nodeValue = window.translationData.overview.dynamic.chart.debtoverview;
        } else if (firstChildClassList.contains('networth')) {
            // Show the button to choose charts
            document.getElementById('chosenChartIncAndExp').classList.add('d-none');
            document.getElementById('chosenChartIncAndExp').classList.remove('d-lg-block');
            populateNetworthBarChart();
            // Change Label
            document.getElementById('chartDisplayTitle').firstChild.nodeValue = window.translationData.overview.dynamic.chart.networthoverview;
        }

        // Remove the old highlighted element
        let overviewEntryrow = document.getElementsByClassName('overviewEntryRow');
        for (let count = 0, length = overviewEntryrow.length; count < length; count++) {
            let overviewEntryElement = overviewEntryrow[count];

            if (overviewEntryElement.classList.contains('highlightOverviewSelected')) {
                overviewEntryElement.classList.remove('highlightOverviewSelected');
            }
        }

        // Add the highlight to the element
        this.classList.add('highlightOverviewSelected');
    });

    /*  **************** Coloured Rounded Line Chart - Line Chart ******************** */

    function coloredRounedLineChart(dataColouredRoundedLineChart) {

        optionsColouredRoundedLineChart = {
            lineSmooth: Chartist.Interpolation.cardinal({
                tension: 10
            }),
            axisY: {
                showGrid: true,
                offset: 70,
                labelInterpolationFnc: function (value) {

                    value = formatLargeCurrencies(value);
                    return value + currentCurrencyPreference;
                },
                scaleMinSpace: 15
            },
            axisX: {
                showGrid: false,
                offset: 40
            },
            showPoint: true,
            height: '400px'
        };

        // Empty the chart div
        let coloredChartDiv = document.getElementById('colouredRoundedLineChart');
        // Replace inner HTML with EMPTY
        while (coloredChartDiv.firstChild) {
            coloredChartDiv.removeChild(coloredChartDiv.firstChild);
        }
        // Dispose the previous tooltips created
        $("#colouredRoundedLineChart").tooltip('dispose');

        // Append tooltip with line chart
        let colouredRoundedLineChart = new Chartist.Line('#colouredRoundedLineChart', dataColouredRoundedLineChart, optionsColouredRoundedLineChart).on("draw", function (data) {
            if (data.type === "point") {
                data.element._node.setAttribute("title", data.axisX.ticks[data.index] + ": <strong>" + formatToCurrency(data.value.y) + '</strong>');
                data.element._node.setAttribute("data-chart-tooltip", "colouredRoundedLineChart");
            }
        }).on("created", function () {
            // Initiate Tooltip
            $("#colouredRoundedLineChart").tooltip({
                selector: '[data-chart-tooltip="colouredRoundedLineChart"]',
                container: "#colouredRoundedLineChart",
                html: true,
                placement: 'auto',
                delay: {
                    "show": 300,
                    "hide": 100
                }
            });
        });

        md.startAnimationForLineChart(colouredRoundedLineChart);
    }

    // Build material Spinner
    function buildMaterialSpinner() {
        let materialSpinnerDiv = document.createElement('div');
        materialSpinnerDiv.classList = 'material-spinner rtSpinner';

        return materialSpinnerDiv;
    }

    // Build Insufficient Information Message
    function buildInsufficientInfoMessage() {
        let emptyChartMessage = document.createElement('div');
        emptyChartMessage.classList = 'text-center align-middle';

        let divIconWrapper = document.createElement('div');
        divIconWrapper.classList = 'icon-center';

        let iconChart = document.createElement('i');
        iconChart.classList = 'material-icons noDataChartIcon';
        iconChart.textContent = 'bubble_chart';
        divIconWrapper.appendChild(iconChart);
        emptyChartMessage.appendChild(divIconWrapper);

        let emptyMessage = document.createElement('div');
        emptyMessage.classList = 'font-weight-bold tripleNineColor';
        emptyMessage.textContent = window.translationData.overview.dynamic.chart.onecategory;
        emptyChartMessage.appendChild(emptyMessage);

        return emptyChartMessage;

    }

    /**
     * Chart Overview Drop Down (Income / Expense)
     */
    function appendChartOptionsForIncomeOrExpense(incomeOrExpenseParam, incomeOrExpText) {
        let anchorFragment = document.createDocumentFragment();

        let anchorDropdownItem = document.createElement('a');
        anchorDropdownItem.classList = 'dropdown-item chartOverview' + incomeOrExpenseParam;

        let categoryLabelDiv = document.createElement('div');
        categoryLabelDiv.classList = 'font-weight-bold';
        categoryLabelDiv.textContent = oneyearoverview;
        anchorDropdownItem.appendChild(categoryLabelDiv);
        anchorFragment.appendChild(anchorDropdownItem);

        let anchorDropdownItem1 = document.createElement('a');
        anchorDropdownItem1.classList = 'dropdown-item chartBreakdown' + incomeOrExpenseParam;

        let categoryLabelDiv1 = document.createElement('div');
        categoryLabelDiv1.classList = 'font-weight-bold';
        categoryLabelDiv1.textContent = incomeOrExpText;
        anchorDropdownItem1.appendChild(categoryLabelDiv1);
        anchorFragment.appendChild(anchorDropdownItem1);

        // By Account
        let anchorDropdownItem2 = document.createElement('a');
        anchorDropdownItem2.classList = 'dropdown-item accountOverview';
        anchorDropdownItem2.setAttribute('data-target', incomeOrExpenseParam);

        let categoryLabelDiv2 = document.createElement('div');
        categoryLabelDiv2.classList = 'font-weight-bold';
        categoryLabelDiv2.textContent = isNotEmpty(window.translationData) ? window.translationData.overview.dynamic.categorizebyaccount : 'Account';
        anchorDropdownItem2.appendChild(categoryLabelDiv2);
        anchorFragment.appendChild(anchorDropdownItem2);

        // By Tags
        let anchorDropdownItem3 = document.createElement('a');
        anchorDropdownItem3.classList = 'dropdown-item tagsOverview';
        anchorDropdownItem3.setAttribute('data-target', incomeOrExpenseParam);

        let categoryLabelDiv3 = document.createElement('div');
        categoryLabelDiv3.classList = 'font-weight-bold';
        categoryLabelDiv3.textContent = isNotEmpty(window.translationData) ? window.translationData.overview.dynamic.categorizebytags : 'Tags';
        anchorDropdownItem3.appendChild(categoryLabelDiv3);
        anchorFragment.appendChild(anchorDropdownItem3);

        let chooseCategoryDD = document.getElementById('chooseCategoryDD');
        // Replace inner HTML with EMPTY
        while (chooseCategoryDD.firstChild) {
            chooseCategoryDD.removeChild(chooseCategoryDD.firstChild);
        }
        chooseCategoryDD.appendChild(anchorFragment);
    }

    // Chart Income One Year Overview
    $("body").on("click", "#chooseCategoryDD .chartOverviewIncome", function () {
        // Dough nut breakdown open cache
        window.whichChartIsOpen = oneYearOverviewOption;
        // populate the income line chart from cache
        populateLineChart(liftimeTransactionsCache, true);
    });

    // Chart Income Breakdown Chart
    $("body").on("click", "#chooseCategoryDD .chartBreakdownIncome", function () {
        // Dough nut breakdown open cache
        window.whichChartIsOpen = categoryBreakdownOption;
        // Populate Breakdown Category
        populateCategoryBreakdown(true);
    });

    // Chart Expense One Year Overview
    $("body").on("click", "#chooseCategoryDD .chartOverviewExpense", function () {
        // Dough nut breakdown open cache
        window.whichChartIsOpen = oneYearOverviewOption;
        // Populate the expense line chart from cache
        populateLineChart(liftimeTransactionsCache, false);
    });

    // Chart Expense  Breakdown Chart
    $("body").on("click", "#chooseCategoryDD .chartBreakdownExpense", function () {
        // Dough nut breakdown open cache
        window.whichChartIsOpen = categoryBreakdownOption;
        // Populate Breakdown Category
        populateCategoryBreakdown(false);
    });

    // Populate Breakdown Category
    function populateCategoryBreakdown(fetchIncome) {
        // Fetch the expense cache
        fetchIncomeBreakDownCache = fetchIncome;

        // Label For Category
        let labelForCategory = fetchIncome ? window.translationData.overview.dynamic.incomebreakdown : window.translationData.overview.dynamic.expensebreakdown;

        // Replace the Drop down with category options label
        replaceChartChosenLabel(labelForCategory);

        let labelsArray = [];
        let seriesArray = [];
        let idArray = [];
        let otherIdArray = [];
        let absoluteTotal = 0;
        let othersTotal = 0;
        let otherLabels = [];

        // Build the Absolute total
        let incomeCategory = fetchIncome ? CUSTOM_DASHBOARD_CONSTANTS.incomeCategory : CUSTOM_DASHBOARD_CONSTANTS.expenseCategory;
        let categoryKeys = Object.keys(window.categoryMap);
        for (let count = 0, length = categoryKeys.length; count < length; count++) {
            let categoryId = categoryKeys[count];
            let categoryObject = window.categoryMap[categoryId];
            if (categoryObject.type == incomeCategory && isNotEmpty(categoryObject.categoryTotal)) {
                // Add the category total to absolute total
                absoluteTotal += Math.abs(categoryObject.categoryTotal);
            }
        }

        // Build the legend and the series array
        for (let count = 0, length = categoryKeys.length; count < length; count++) {
            let categoryId = categoryKeys[count];
            let categoryObject = window.categoryMap[categoryId];

            if (categoryObject.type == incomeCategory && isNotEmpty(categoryObject.categoryTotal)) {
                let percentageOfTotal = (Math.abs(categoryObject.categoryTotal) / absoluteTotal) * 100;
                // If the total is greater than 5 % then print it separate else accumulate it with others
                if (percentageOfTotal > 5) {
                    labelsArray.push(categoryObject.name);
                    seriesArray.push(Math.abs(categoryObject.categoryTotal));
                    idArray.push(categoryId);
                } else {
                    othersTotal += Math.abs(categoryObject.categoryTotal);
                    otherLabels.push(categoryObject.name);
                    otherIdArray.push(categoryId);
                }

            }
        }

        // If others total is > 0 then print it.
        if (othersTotal > 0) {
            if (otherLabels.length > 1) {
                labelsArray.push('Others');
            } else {
                labelsArray.push(otherLabels[0]);
            }
            seriesArray.push(Math.abs(othersTotal));
            idArray.push(otherIdArray);
        }

        // Build the data for the line chart
        let dataSimpleBarChart = {
            labels: labelsArray,
            series: seriesArray,
            ids: idArray

        }

        buildPieChartForOverview(dataSimpleBarChart, 'colouredRoundedLineChart', absoluteTotal, 'category', fetchIncome);
    }

    // Populate the line chart from cache
    function populateLineChart(dateAndTimeAsList, incomeChart) {
        // Reset the line chart with spinner
        let colouredRoundedLineChart = document.getElementById('colouredRoundedLineChart');
        // Replace HTML with Empty
        while (colouredRoundedLineChart.firstChild) {
            colouredRoundedLineChart.removeChild(colouredRoundedLineChart.firstChild);
        }
        let h20 = document.createElement('div');
        h20.classList = 'h-20';
        let materialSpinnerElement = document.createElement('div');
        materialSpinnerElement.classList = 'material-spinner rtSpinner';
        h20.appendChild(materialSpinnerElement);
        colouredRoundedLineChart.appendChild(h20);

        if (incomeChart) {
            incomeOrExpenseOverviewChart(incomeparam, dateAndTimeAsList);
        } else {
            incomeOrExpenseOverviewChart(expenseparam, dateAndTimeAsList);
        }

    }

    /**
     * Build Total Assets / liability
     **/
    function populateAssetBarChart(fetchAssets) {
        // Show the button to choose charts
        document.getElementById('chosenChartIncAndExp').classList.add('d-none');
        document.getElementById('chosenChartIncAndExp').classList.remove('d-lg-block');
        // Fetch asset or liability
        let accType = fetchAssets ? 'ASSET' : 'DEBT';

        buildBarchartForAssetOrDebt(window.allBankAccountInfoCache, accType);
    }

    // Build Barchart For Asset Or Debt
    function buildBarchartForAssetOrDebt(bankAccountList, accType) {
        let labelsArray = [];
        let seriesArray = [];

        // Iterate all bank accounts
        for (let i = 0, length = bankAccountList.length; i < length; i++) {
            let bankAcc = bankAccountList[i];
            // Ensure if the asset type matches the bank account
            if (isEqual(accType, bankAcc['account_type'])) {
                labelsArray.push(bankAcc['bank_account_name']);
                seriesArray.push(bankAcc['account_balance']);
            }
        }

        let dataSimpleBarChart = {
            labels: labelsArray,
            series: seriesArray
        };

        let chartAppendingDiv = document.getElementById('colouredRoundedLineChart');
        // Replace inner HTML with EMPTY
        while (chartAppendingDiv.firstChild) {
            chartAppendingDiv.removeChild(chartAppendingDiv.firstChild);
        }
        // If series array is empty then
        if (isEmpty(seriesArray)) {
            chartAppendingDiv.appendChild(buildEmptyChartMessageForOverview());
            return;
        }


        let optionsSimpleBarChart = {
            distributeSeries: true,
            seriesBarDistance: 10,
            axisX: {
                showGrid: false,
                offset: 40
            },
            axisY: {
                labelInterpolationFnc: function (value, index) {
                    value = formatLargeCurrencies(value);
                    return value + currentCurrencyPreference;
                },
                // Offset Y axis label
                offset: 70
            },
            height: '400px'
        };


        buildBarChart(dataSimpleBarChart, optionsSimpleBarChart);
    }

    // Build Empty Chart information
    function populateEmptyChartInfo() {
        let chartAppendingDiv = document.getElementById('colouredRoundedLineChart');
        let emptyMessageDocumentFragment = document.createDocumentFragment();
        emptyMessageDocumentFragment.appendChild(buildEmptyChartMessageForOverview());
        // Replace inner HTML with EMPTY
        while (chartAppendingDiv.firstChild) {
            chartAppendingDiv.removeChild(chartAppendingDiv.firstChild);
        }
        chartAppendingDiv.appendChild(emptyMessageDocumentFragment);
    }

    // build line chart
    function buildBarChart(dataSimpleBarChart, optionsSimpleBarChart) {
        /*  **************** Simple Bar Chart - barchart ******************** */

        let responsiveOptionsSimpleBarChart = [
            ['screen and (max-width: 640px)', {
                seriesBarDistance: 5,
                axisX: {
                    labelInterpolationFnc: function (value) {
                        return value[0];
                    }
                }
            }]
        ];

        // Empty the chart div
        let coloredChartDiv = document.getElementById('colouredRoundedLineChart');
        // Replace inner HTML with EMPTY
        while (coloredChartDiv.firstChild) {
            coloredChartDiv.removeChild(coloredChartDiv.firstChild);
        }
        // Dispose the previous tooltips created
        $("#colouredRoundedLineChart").tooltip('dispose');

        let simpleBarChart = Chartist.Bar('#colouredRoundedLineChart', dataSimpleBarChart, optionsSimpleBarChart, responsiveOptionsSimpleBarChart);

        // On draw bar chart
        simpleBarChart.on("draw", function (data) {
            if (data.type === "bar") {
                // Tooltip
                let minusSign = '';
                amount = formatToCurrency(data.value.y);
                data.element._node.setAttribute("title", data.axisX.ticks[data.seriesIndex] + ": <strong>" + amount + '</strong>');
                data.element._node.setAttribute("data-chart-tooltip", "colouredRoundedLineChart");
            }
        }).on("created", function () {
            // Initiate Tooltip
            $("#colouredRoundedLineChart").tooltip({
                selector: '[data-chart-tooltip="colouredRoundedLineChart"]',
                container: "#colouredRoundedLineChart",
                html: true,
                placement: 'auto',
                delay: {
                    "show": 300,
                    "hide": 100
                }
            });
        });


        //start animation for the Emails Subscription Chart
        er.startAnimationForBarChart(simpleBarChart);

    }


    /**
     *	Populate networth
     **/
    function populateNetworthBarChart() {

        // Reset the line chart with spinner
        let colouredRoundedLineChart = document.getElementById('colouredRoundedLineChart');
        // Replace HTML with Empty
        while (colouredRoundedLineChart.firstChild) {
            colouredRoundedLineChart.removeChild(colouredRoundedLineChart.firstChild);
        }
        let h20 = document.createElement('div');
        h20.classList = 'h-20';
        let materialSpinnerElement = document.createElement('div');
        materialSpinnerElement.classList = 'material-spinner rtSpinner';
        h20.appendChild(materialSpinnerElement);
        colouredRoundedLineChart.appendChild(h20);

        buildchartForNetworth(window.allBankAccountInfoCache);
    }


    // Build Barchart For Asset Or Debt
    function buildchartForNetworth(bankAccountList) {
        let labelsArray = [];
        let seriesArray = [];
        let seriesArrayDebt = [];

        // Iterate all bank accounts
        for (let i = 0, length = bankAccountList.length; i < length; i++) {
            let bankAcc = bankAccountList[i];
            labelsArray.push(bankAcc['bank_account_name']);
            seriesArray.push(bankAcc['account_balance']);
        }

        let dataSimpleBarChart = {
            labels: labelsArray,
            series: seriesArray
        };

        // If series array is empty then
        if (isEmpty(seriesArray)) {
            let chartAppendingDiv = document.getElementById('colouredRoundedLineChart');
            let emptyMessageDocumentFragment = document.createDocumentFragment();
            emptyMessageDocumentFragment.appendChild(buildEmptyChartMessageForOverview());
            // Replace inner HTML with EMPTY
            while (chartAppendingDiv.firstChild) {
                chartAppendingDiv.removeChild(chartAppendingDiv.firstChild);
            }
            chartAppendingDiv.appendChild(emptyMessageDocumentFragment);
            return;
        }

        let optionsSimpleBarChart = {
            distributeSeries: true,
            seriesBarDistance: 10,
            axisX: {
                showGrid: false,
                offset: 40
            },
            axisY: {
                labelInterpolationFnc: function (value, index) {
                    value = formatLargeCurrencies(value);
                    return value + currentCurrencyPreference;
                },
                // Offset Y axis label
                offset: 70
            },
            height: '400px'
        };


        buildBarChart(dataSimpleBarChart, optionsSimpleBarChart);
    }

}(jQuery));

// Replaces the text of the chart chosen
function replaceChartChosenLabel(chosenChartText) {
    let chosenChartLabel = document.getElementsByClassName('chosenChart');
    chosenChartLabel[0].textContent = chosenChartText;
}

// Introduce Chartist pie chart
function buildPieChartForOverview(dataPreferences, id, absoluteTotal, type, fetchIncome) {

    let chartAppendingDiv = document.getElementById('colouredRoundedLineChart');

    // Replace inner HTML with EMPTY
    while (chartAppendingDiv.firstChild) {
        chartAppendingDiv.removeChild(chartAppendingDiv.firstChild);
    }

    // Replace with empty chart message
    if (isEmpty(dataPreferences.series)) {
        chartAppendingDiv.appendChild(buildEmptyChartMessageForOverview());
        return;
    }

    /*  **************** Public Preferences - Pie Chart ******************** */

    let optionsPreferences = {
        donut: true,
        donutWidth: 50,
        startAngle: 270,
        showLabel: true,
        height: '300px'
    };

    let responsiveOptions = [
    	  ['screen and (min-width: 640px)', {
            chartPadding: 40,
            labelOffset: 50,
            labelDirection: 'explode',
            labelInterpolationFnc: function (value, idx) {
                // Calculates the percentage of category total vs absolute total
                let percentage = round((dataPreferences.series[idx] / absoluteTotal * 100), 2) + '%';
                return value + ': ' + percentage;
            }
    	  }],
    	  ['screen and (min-width: 1301px)', {
            labelOffset: 30,
            chartPadding: 10
    	  }],
    	  ['screen and (min-width: 992px)', {
            labelOffset: 45,
            chartPadding: 40,
      	  }],

    	];

    // Reset the chart
    replaceHTML(id, '');
    $("#" + id).tooltip('dispose');

    // Append Tooltip for Doughnut chart
    if (isNotEmpty(dataPreferences)) {
        let categoryBreakdownChart = new Chartist.Pie('#' + id, dataPreferences, optionsPreferences, responsiveOptions).on('draw', function (data) {
            if (data.type === 'slice') {
                let sliceValue = data.element._node.getAttribute('ct:value');
                data.element._node.setAttribute("title", dataPreferences.labels[data.index] + ": <strong>" + formatToCurrency(Number(sliceValue)) + '</strong>');
                data.element._node.setAttribute("data-chart-tooltip", id);
                // On click listener to show all transactions
                data.element._node.onclick = function () {
                    Swal.fire({
                        title: dataPreferences.labels[data.index],
                        html: buildTransactionsForOverview(dataPreferences.ids[data.index], type, fetchIncome),
                        customClass: {
                            confirmButton: 'btn btn-info',
                        },
                        buttonsStyling: false,
                        confirmButtonText: 'Got it!',
                    })
                }
            }
        }).on("created", function () {
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
        });

        // Animate the doughnut chart
        er.startAnimationDonutChart(categoryBreakdownChart);
    }

}

// Build Transactions for overview
function buildTransactionsForOverview(label, type, fetchIncome) {
    let docFrag = document.createDocumentFragment();

    /*
     * Table Responsive
     */
    let tableResponsive = document.createElement('div');
    tableResponsive.classList = 'table-responsive';

    let tableFixed = document.createElement('div');
    tableFixed.classList = 'table table-fixed d-table';

    /*
     * Table Heading
     */
    let tableHeading = document.createElement('div');
    tableHeading.classList = 'tableHeadingDiv';

    let widthFifteen = document.createElement('div');
    widthFifteen.classList = 'w-15 d-table-cell';
    tableHeading.appendChild(widthFifteen);

    let widthSixtyFive = document.createElement('div');
    widthSixtyFive.classList = 'w-65 d-table-cell';
    tableHeading.appendChild(widthSixtyFive);

    let widthThirty = document.createElement('div');
    widthThirty.classList = 'text-right d-table-cell';
    tableHeading.appendChild(widthThirty);
    tableFixed.appendChild(tableHeading);

    let tableBody = document.createElement('div');
    tableBody.classList = 'tableBodyDiv text-left';

    switch (type) {
        case 'category':
            for (let count = 0, length = window.overviewTransactionsCache.length; count < length; count++) {
                let transaction = window.overviewTransactionsCache[count];
                let category = transaction.category;
                let incomeCategory = transaction.amount > 0 ? true : false;
                if (incomeCategory == fetchIncome && isNotEmpty(category)) {
                    // Check tag matches the label
                    if (isEqual(category, label)) {
                        tableBody.appendChild(buildTransactionRow(transaction));
                    }
                }
            }
            break;
        case 'tag':
            for (let count = 0, length = window.overviewTransactionsCache.length; count < length; count++) {
                let transaction = window.overviewTransactionsCache[count];
                let tags = transaction.tags;
                let incomeCategory = transaction.amount > 0 ? true : false;
                if (incomeCategory == fetchIncome && isNotEmpty(tags)) {
                    // Add the amount for all the tags
                    for (let i = 0, len = tags.length; i < len; i++) {
                        let tag = tags[i];
                        // Check tag matches the label
                        if (isEqual(tag, label)) {
                            tableBody.appendChild(buildTransactionRow(transaction));
                        }
                    }
                }
            }
            break;
        case 'account':
            for (let count = 0, length = window.overviewTransactionsCache.length; count < length; count++) {
                let transaction = window.overviewTransactionsCache[count];
                let account = transaction.account;
                let incomeCategory = transaction.amount > 0 ? true : false;
                if (incomeCategory == fetchIncome && isNotEmpty(account)) {
                    // Check tag matches the label
                    if (isEqual(account, label)) {
                        tableBody.appendChild(buildTransactionRow(transaction));
                    }
                }
            }
            break;
    }

    /*
     * Append Table Body
     */
    tableFixed.appendChild(tableBody);
    tableResponsive.appendChild(tableFixed);
    docFrag.appendChild(tableResponsive);
    return docFrag;

}

// Builds the rows for recent transactions
function buildTransactionRow(userTransaction) {
    // Convert date from UTC to user specific dates
    let creationDateUserRelevant = new Date(userTransaction['creation_date']);
    // Category Map
    let categoryMapForUT = window.categoryMap[userTransaction.category];

    let tableRowTransaction = document.createElement('div');
    tableRowTransaction.id = 'overview-transaction' + '-' + userTransaction.transactionId;
    tableRowTransaction.setAttribute('data-target', userTransaction.transactionId);
    tableRowTransaction.classList = 'recentTransactionEntry d-table-row';

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
    elementWithCategoryName.classList = 'font-size-70 categoryNameRT w-100';
    elementWithCategoryName.textContent = (categoryMapForUT.name.length < 25 ? categoryMapForUT.name : (categoryMapForUT.name.slice(0, 26) + '...')) + ' • ' + ("0" + creationDateUserRelevant.getDate()).slice(-2) + ' ' + months[creationDateUserRelevant.getMonth()].slice(0, 3) + ' ' + creationDateUserRelevant.getFullYear() + ' ' + ("0" + creationDateUserRelevant.getHours()).slice(-2) + ':' + ("0" + creationDateUserRelevant.getMinutes()).slice(-2);
    tableCellTransactionDescription.appendChild(elementWithCategoryName);
    tableRowTransaction.appendChild(tableCellTransactionDescription);

    // Cell 3
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

    return tableRowTransaction;

}

// Build Empty chart
function buildEmptyChartMessageForOverview() {
    let emptyChartMessage = document.createElement('div');
    emptyChartMessage.classList = 'text-center align-middle h-20';

    let divIconWrapper = document.createElement('div');
    divIconWrapper.classList = 'icon-center';

    let iconChart = document.createElement('i');
    iconChart.classList = 'material-icons noDataChartIcon';
    iconChart.textContent = 'multiline_chart';
    divIconWrapper.appendChild(iconChart);
    emptyChartMessage.appendChild(divIconWrapper);

    let emptyMessage = document.createElement('div');
    emptyMessage.classList = 'font-weight-bold tripleNineColor';
    emptyMessage.textContent = window.translationData.overview.dynamic.chart.nodata;
    emptyChartMessage.appendChild(emptyMessage);

    return emptyChartMessage;
}
