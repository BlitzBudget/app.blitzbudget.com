"use strict";
// Custom Functions to fetch all accounts
er_a = {

    populateBankInfo(bankAccountsInfo) {
        // Assign value to constant
        window.allBankAccountInfoCache = bankAccountsInfo;
        // Populate empty bank account info
        if (isEmpty(bankAccountsInfo)) {
            er_a.populateEmptyAccountInfo();
            return;
        }

        // Populate the bank account info
        er_a.populateAccountInfo(bankAccountsInfo);
    },
    // Populate Empty account entry
    buildEmptyTableEntry(accId) {
        let rowEmpty = document.createElement('div');
        rowEmpty.classList = 'd-table-row recentTransactionDateGrp';
        rowEmpty.id = accId;

        let cell1 = document.createElement('div');
        cell1.classList = 'd-table-cell align-middle imageWrapperCell text-center';

        let roundedCircle = document.createElement('div');
        roundedCircle.classList = 'rounded-circle align-middle circleWrapperImageRT mx-auto';
        roundedCircle.appendChild(er_a.buildEmptyAccTransactionsSvg());
        cell1.appendChild(roundedCircle);
        rowEmpty.appendChild(cell1);

        let cell2 = document.createElement('div');
        cell2.classList = 'descriptionCellRT align-middle d-table-cell text-center';

        let emptyMessageRow = document.createElement('div');
        emptyMessageRow.classList = 'text-center tripleNineColor font-weight-bold';
        emptyMessageRow.textContent = isNotEmpty(window.translationData) ? window.translationData.transactions.dynamic.empty.success : "Oh! Snap! You don't have any transactions yet.";
        cell2.appendChild(emptyMessageRow);
        rowEmpty.appendChild(cell2);

        let cell3 = document.createElement('div');
        cell3.classList = 'descriptionCellRT d-table-cell';
        rowEmpty.appendChild(cell3);

        return rowEmpty;
    },
    // Empty Transactions SVG
    buildEmptyAccTransactionsSvg() {

        let svgElement = document.createElementNS("http://www.w3.org/2000/svg", 'svg');
        svgElement.setAttribute('width', '32');
        svgElement.setAttribute('height', '32');
        svgElement.setAttribute('viewBox', '0 0 64 64');
        svgElement.setAttribute('class', 'align-middle transactions-empty-svg');

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

    },
    // Appends the date header for recent transactions
    buildAccountHeader(account) {
        let accountId = account.accountId;
        let docFrag = document.createDocumentFragment();
        let accountHeader = document.createElement('div');
        accountHeader.id = 'accountSB-' + accountId;
        accountHeader.setAttribute('data-target', accountId);
        accountHeader.classList = 'tableBodyDiv accountInfoTable noselect';

        let accountTit = document.createElement('div');
        accountTit.classList = 'recentTransactionDateGrp d-table-row ml-3 font-weight-bold';

        // Title Wrapper
        let titleWrapper = document.createElement('div');
        titleWrapper.classList = 'd-table-cell text-nowrap';

        // Right Arrow
        let rightArrow = document.createElement('div');
        rightArrow.classList = 'material-icons rotateNinty';
        rightArrow.textContent = 'keyboard_arrow_right';
        titleWrapper.appendChild(rightArrow);

        // Title
        let accountTitle = document.createElement('a');
        accountTitle.id = 'accountTitle-' + accountId;
        accountTitle.classList = 'pl-4 accTitleAnchor';
        accountTitle.textContent = account['bank_account_name'];
        titleWrapper.appendChild(accountTitle);
        accountTit.appendChild(titleWrapper);

        // Empty Cell
        let emptyCell = document.createElement('div');
        emptyCell.classList = 'd-table-cell';
        accountTit.appendChild(emptyCell);

        // Account Balance
        let accountBalance = document.createElement('div');
        accountBalance.classList = 'd-table-cell text-right text-nowrap pr-3';
        if (account['account_balance'] < 0) {
            accountBalance.classList.add('expenseCategory');
        } else {
            accountBalance.classList.add('incomeCategory');
        }
        accountBalance.id = 'accountBalance-' + accountId;
        accountBalance.textContent = formatToCurrency(account['account_balance']);
        accountTit.appendChild(accountBalance);

        accountHeader.appendChild(accountTit);
        docFrag.appendChild(accountHeader);
        return docFrag;
    },
    // Populate bank account info
    populateAccountInfo(bankAccountsInfo) {
        let bAFragment = document.createDocumentFragment();

        // Bank Account Heading
        let bAHRow = document.createElement('div');
        bAHRow.classList = 'row';

        let bAHeading = document.createElement('h4');
        bAHeading.classList = 'bAHeading text-left pl-3 pr-0 col-lg-7 font-weight-bold';
        bAHeading.textContent = isNotEmpty(window.translationData) ? window.translationData.account.dynamic.populate.name : 'Accounts';
        bAHRow.appendChild(bAHeading);

        let bAManage = document.createElement('a');
        bAManage.classList = 'text-right col-lg-5 pr-3 manageBA text-dynamic-color';
        bAManage.textContent = isNotEmpty(window.translationData) ? window.translationData.account.dynamic.populate.viewall : 'view all';
        bAHRow.appendChild(bAManage);
        bAFragment.appendChild(bAHRow);

        // Populate the rest of the bank account
        let bABody = document.createElement('div');
        bABody.id = 'bank-account-list';
        for (let i = 0, length = bankAccountsInfo.length; i < length; i++) {
            let count = i + 1;
            bABody.appendChild(er_a.populateBankAccountInfo(bankAccountsInfo[i], count));
        }
        bAFragment.appendChild(bABody);

        // Bank Account Footer
        let bAFooter = document.createElement('button');
        bAFooter.classList = 'bAFooter btn-sm btn btn-round btn-dynamic-color';
        bAFooter.innerHTML = '<i class="material-icons pr-2">add_circle_outline</i> Add Account';
        bAFragment.appendChild(bAFooter);


        // Append the fragment to the account picker
        let accountPickerModal = document.getElementById('accountPickerWrapper');
        // Replace the HTML to empty and then append child
        while (accountPickerModal.firstChild) {
            accountPickerModal.removeChild(accountPickerModal.firstChild);
        }
        accountPickerModal.appendChild(bAFragment);
    },
    //Build a tick icon
    tickIcon() {
        let syncSVG = document.createElementNS("http://www.w3.org/2000/svg", 'svg');
        syncSVG.setAttribute('x', '0px');
        syncSVG.setAttribute('y', '0px');
        syncSVG.setAttribute('width', '20');
        syncSVG.setAttribute('height', '20');
        syncSVG.setAttribute('viewBox', '0 0 512 512');
        syncSVG.setAttribute('class', 'tickOuterLayer');

        let pathElement = document.createElementNS("http://www.w3.org/2000/svg", 'path');
        pathElement.setAttribute('class', 'tickPath1');
        pathElement.setAttribute('d', 'M424.3,180c-1-1.2-1.5-2.8-1.5-4.3c-14.8-26.1-15.7-58-30.5-84.1c-41.7,23.4-70.2,65.1-97.4,103.1c-16.4,22.9-31.1,46.4-44.6,71.1c-13.6,24.8-26.8,49.9-42,73.8c-2.2,3.4-7.9,5-10.3,0.7c-7.2-13.3-15.3-26.2-24.6-38.2c-8-10.3-17.1-19.5-25.3-29.6c-12.7-15.7-26.3-34.5-43.9-45.4c-6.4,21-13.9,41.8-17.2,63.6c24.6,15.9,43.4,38.9,61.5,61.6c21.2,26.6,43.1,52,66.9,76.3c15.4-20.1,26-43.5,38.8-65.3c15.1-25.7,32.7-49.4,51.4-72.6c18.7-23.2,40.3-43.7,62-63.9c10.2-9.5,22.2-17.3,33.1-26c8.2-6.6,16.2-13.4,23.7-20.7C424.4,180.2,424.4,180.1,424.3,180z');
        syncSVG.appendChild(pathElement);

        let pathElement1 = document.createElementNS("http://www.w3.org/2000/svg", 'path');
        pathElement1.setAttribute('d', 'M436.2,170.3h-2.8c-16.3-27.7-16.2-62.6-34-89.9c-1.9-3-5.4-3.1-8.3-1.6c-45.6,23.1-76.2,67.7-105.2,108.1c-16.6,23.2-31.6,47-45.4,72c-12.3,22.3-24.1,44.8-37.4,66.6c-6-10.4-12.6-20.4-19.9-29.9c-8.2-10.8-17.8-20.3-26.3-30.8c-15.2-18.7-31.4-40.9-53.7-51.5c-3.7-1.8-7.4,0.5-8.5,4.2c-6.8,23.7-15.8,47-19.5,71.4c0,0.1,0,0.2,0,0.4c-2,2.7-2.2,7.1,1.6,9.4c26.5,15.6,46,40.8,64.9,64.6c22,27.7,45.2,54.1,70.2,79.1c2.3,2.3,6.4,1.8,8.4-0.5c17.2-20.6,28.7-45,41.8-68.2c14.7-25.9,32-50.3,51.1-73.2c19.2-22.9,40-43.7,61.9-64c10.4-9.7,22.6-17.7,33.8-26.6c9-7.2,17.7-14.7,25.9-22.8c2.3-0.5,4.2-2.1,4.6-4.7c0.6-0.6,1.2-1.3,1.8-1.9C445,176.1,441.2,170.3,436.2,170.3z M400.7,201c-10.9,8.7-22.8,16.5-33.1,26c-21.8,20.2-43.4,40.7-62,63.9c-18.7,23.2-36.3,46.8-51.4,72.6c-12.8,21.8-23.4,45.2-38.8,65.3c-23.8-24.2-45.8-49.7-66.9-76.3c-18.1-22.7-37-45.8-61.5-61.6c3.3-21.8,10.8-42.6,17.2-63.6c17.7,10.9,31.2,29.7,43.9,45.4c8.2,10.1,17.3,19.3,25.3,29.6c9.3,12,17.4,24.9,24.6,38.2c2.4,4.4,8.1,2.7,10.3-0.7c15.3-23.9,28.4-49,42-73.8c13.5-24.7,28.2-48.2,44.6-71.1c27.2-38,55.8-79.8,97.4-103.1c14.8,26.1,15.7,58,30.5,84.1c0,1.5,0.5,3.1,1.5,4.3c0,0.1,0.1,0.2,0.1,0.2C416.9,187.6,408.9,194.4,400.7,201z');
        syncSVG.appendChild(pathElement1);

        return syncSVG;
    },
    // Populate one Bank account info
    populateBankAccountInfo(bankAccount, count) {
        let wrapperRow = document.createElement('div');
        wrapperRow.classList = 'row bARow';
        wrapperRow.id = 'bAR-' + count;
        wrapperRow.setAttribute('data-target', bankAccount.accountId);

        // If Selected then highlight account
        if (bankAccount['selected_account']) {
            wrapperRow.classList.add('selectedBA');
            window.selectedBankAccountId = bankAccount.accountId;
        }

        // Link Icon
        let wrapperSVG = document.createElement('div');
        wrapperSVG.classList = 'col-lg-2 py-2 bAIcon';

        if (bankAccount.linked) {
            syncSVG = cloneElementAndAppend(wrapperSVG, syncSVG);
        } else {
            unsyncSVG = cloneElementAndAppend(wrapperSVG, unsyncSVG);
        }
        wrapperRow.appendChild(wrapperSVG);

        // Bank Account Name
        let bAName = document.createElement('div');
        bAName.classList = 'col-lg-5 text-left bAName py-2';
        bAName.textContent = bankAccount['bank_account_name'];
        wrapperRow.appendChild(bAName);

        // Bank Account Balance
        let bABalance = document.createElement('div');
        bABalance.classList = 'col-lg-5 text-right font-weight-bold py-2 bAAmount';
        bABalance.textContent = formatToCurrency(bankAccount['account_balance']);
        wrapperRow.appendChild(bABalance);

        return wrapperRow;
    },
    // Populate Empty Account Info
    populateEmptyAccountInfo() {
        let emptyAccountFragment = document.createDocumentFragment();

        // First Row
        let firstRow = document.createElement('div');
        firstRow.id = "syncAccountWrap"
        firstRow.classList = 'px-3 py-3 account-box account-info-color mt-2';

        let svgWrapper = document.createElement('div');
        svgWrapper.classList = 'vertical-center-svg';

        let syncSVG = document.createElementNS("http://www.w3.org/2000/svg", 'svg');
        syncSVG.setAttribute('width', '20');
        syncSVG.setAttribute('height', '20');
        syncSVG.setAttribute('viewBox', '0 0 128 128');

        let pathElement = document.createElementNS("http://www.w3.org/2000/svg", 'path');
        pathElement.setAttribute('d', 'M9.2 62.8c-.1 0-.2 0-.2 0-1.7-.1-2.9-1.6-2.8-3.2.5-6.3 2-12.4 4.4-18.1.6-1.5 2.4-2.2 3.9-1.6 1.5.6 2.2 2.4 1.6 3.9-2.2 5.2-3.5 10.6-3.9 16.2C12 61.6 10.7 62.8 9.2 62.8zM117.1 40.6c-.7-1.5-2.4-2.2-4-1.5-1.5.7-2.2 2.4-1.5 4 8.7 19.8 4.5 42.5-10.8 57.8C90.9 110.6 77.9 116 64 116c-11.2 0-21.9-3.5-30.8-10.1l0 0h4.9c1.7 0 3-1.3 3-3s-1.3-3-3-3h-13c-1.7 0-3 1.3-3 3v13c0 1.7 1.3 3 3 3s3-1.3 3-3v-6.3l0 0C38.6 117.8 51.3 122 64 122c14.9 0 29.7-5.7 41-17C122.1 88 126.8 62.7 117.1 40.6zM25.2 25.2c1.1 1.1 2.9 1.2 4.1.1C38.9 16.7 51.1 12 64 12c11.2 0 21.9 3.5 30.8 10.1l0 0-4.8 0c-1.6 0-3.1 1.2-3.2 2.8-.1 1.7 1.3 3.2 3 3.2h13c1.7 0 3-1.3 3-3V12.3c0-1.6-1.2-3.1-2.8-3.2-1.7-.1-3.2 1.3-3.2 3v6.3l0 0C78 1.1 46.3 1.9 25.3 20.8 24 22 24 24 25.2 25.2L25.2 25.2zM11.5 77.69999999999999A2.9 2.9 0 1 0 11.5 83.5 2.9 2.9 0 1 0 11.5 77.69999999999999z');
        syncSVG.appendChild(pathElement);
        svgWrapper.appendChild(syncSVG);
        firstRow.appendChild(svgWrapper);

        let syncInfo = document.createElement('div');
        syncInfo.classList = 'font-weight-bold';

        let syncTitle = document.createElement('div');
        syncTitle.textContent = isNotEmpty(window.translationData) ? window.translationData.account.dynamic.populate.accsync : 'Automatically Sync Accounts';
        syncTitle.classList = 'noselect';
        syncInfo.appendChild(syncTitle);

        firstRow.appendChild(syncInfo);
        emptyAccountFragment.appendChild(firstRow);

        let separatorRow = document.createElement('div');
        separatorRow.classList = "separator-text"

        let separatorSpan = document.createElement('span');
        separatorSpan.textContent = isNotEmpty(window.translationData) ? window.translationData.account.dynamic.add.or : 'or';
        separatorRow.appendChild(separatorSpan);
        emptyAccountFragment.appendChild(separatorRow);

        // Second Row
        let secondRow = document.createElement('div');
        secondRow.id = 'unsyncedAccountWrap'
        secondRow.classList = 'px-3 py-3 account-box account-info-color';

        let svgWrapperTwo = document.createElement('div');
        svgWrapperTwo.classList = 'vertical-center-svg';

        let syncSVGTwo = document.createElementNS("http://www.w3.org/2000/svg", 'svg');
        syncSVGTwo.setAttribute('width', '20');
        syncSVGTwo.setAttribute('height', '20');
        syncSVGTwo.setAttribute('viewBox', '0 0 32 32');

        let gElement = document.createElementNS("http://www.w3.org/2000/svg", 'g');

        let pathElementTwo = document.createElementNS("http://www.w3.org/2000/svg", 'path');
        pathElementTwo.setAttribute('d', 'M 15.507813 2.09375 L 14.09375 3.507813 L 16.617188 6.03125 C 16.410156 6.019531 16.210938 6 16 6 C 13.609375 6 11.417969 6.867188 9.695313 8.28125 L 3.707031 2.292969 L 2.292969 3.707031 L 28.292969 29.707031 L 29.707031 28.292969 L 23.71875 22.304688 C 25.136719 20.582031 26 18.390625 26 16 C 26 14.5 25.699219 13.101563 25.097656 11.902344 L 23.597656 13.402344 C 23.898438 14.199219 24 15.101563 24 16 C 24 17.839844 23.359375 19.535156 22.300781 20.890625 L 11.109375 9.695313 C 12.464844 8.640625 14.160156 8 16 8 C 16.1875 8 16.371094 8.015625 16.558594 8.03125 L 14.09375 10.492188 L 15.507813 11.90625 L 20.414063 7 Z M 7.160156 11.347656 C 6.421875 12.738281 6 14.324219 6 16 C 6 17.5 6.300781 18.898438 6.898438 20.097656 L 8.398438 18.597656 C 8.199219 17.800781 8 16.898438 8 16 C 8 14.878906 8.234375 13.8125 8.65625 12.84375 Z M 16.199219 20.386719 L 11.585938 25 L 16.492188 29.90625 L 17.90625 28.492188 L 15.378906 25.96875 C 15.585938 25.980469 15.792969 26 16 26 C 17.675781 26 19.261719 25.578125 20.652344 24.839844 L 19.15625 23.34375 C 18.1875 23.765625 17.121094 24 16 24 C 15.8125 24 15.628906 23.988281 15.441406 23.972656 L 17.613281 21.800781 Z ');
        gElement.appendChild(pathElementTwo);
        syncSVGTwo.appendChild(gElement);
        svgWrapperTwo.appendChild(syncSVGTwo);
        secondRow.appendChild(svgWrapperTwo);

        let tenColTwo = document.createElement('div');
        tenColTwo.classList = 'font-weight-bold';

        let unsyncTitle = document.createElement('div');
        unsyncTitle.textContent = isNotEmpty(window.translationData) ? window.translationData.account.dynamic.populate.unsyncacc : 'Unsynced Accounts';
        unsyncTitle.classList = 'noselect';
        tenColTwo.appendChild(unsyncTitle);

        secondRow.appendChild(tenColTwo);
        emptyAccountFragment.appendChild(secondRow);

        // Third Row
        let rowThree = document.createElement('div');
        rowThree.classList = 'row mx-3 mt-4';

        let svgElemWrapThree = document.createElement('div');
        svgElemWrapThree.classList = 'col-lg-2 vertical-center-svg pr-2 pl-2 account-info-color';

        let svgElemThree = document.createElementNS("http://www.w3.org/2000/svg", 'svg');
        svgElemThree.setAttribute('viewBox', '0 0 16 16');

        let pathElemThree = document.createElementNS("http://www.w3.org/2000/svg", 'path');
        pathElemThree.setAttribute('d', 'M0 8C0 12.4183 3.58167 16 8 16C10.1217 16 12.1566 15.1571 13.6569 13.6569C15.1571 12.1566 16 10.1217 16 8C16 3.58167 12.4183 0 8 0C3.58167 0 0 3.58167 0 8ZM1.33337 8.00012C1.33337 4.31824 4.31812 1.3335 8 1.3335C11.6819 1.3335 14.6667 4.31824 14.6667 8.00012C14.6667 11.682 11.6819 14.6669 8 14.6669C4.31812 14.6669 1.33337 11.682 1.33337 8.00012ZM9.05125 5.22826C8.71087 5.39234 8.28912 5.39234 7.94876 5.22822C7.80589 5.15933 7.67966 5.0601 7.57907 4.93824C7.29818 4.59796 7.29818 4.06879 7.57907 3.72851C7.67949 3.60685 7.80546 3.50776 7.94802 3.43888C8.28875 3.27427 8.71124 3.27422 9.05199 3.43879C9.19461 3.50767 9.32062 3.6068 9.42107 3.7285C9.70194 4.06879 9.70194 4.59796 9.42105 4.93824C9.32043 5.06012 9.19417 5.15937 9.05125 5.22826ZM8.04517 11.0911L8.97339 7.58801C9.05212 7.28699 8.98633 6.96667 8.79565 6.72095C8.60486 6.47522 8.31079 6.33203 7.99976 6.3335H7.00342C6.81946 6.33362 6.67029 6.48279 6.67029 6.66687V6.77441C6.67029 6.91077 6.7533 7.03333 6.87976 7.08398C7.20642 7.21497 7.38416 7.56897 7.29382 7.90918L6.36548 11.4124C6.28687 11.7134 6.35266 12.0337 6.54346 12.2794C6.73425 12.5251 7.02832 12.6683 7.33936 12.6669H8.33569C8.51965 12.6667 8.6687 12.5175 8.6687 12.3335V12.2258C8.6687 12.0896 8.58582 11.967 8.45935 11.9164C8.13257 11.7854 7.95483 11.4313 8.04517 11.0911Z');
        pathElemThree.setAttribute('transform', 'translate(0 -0.00012207)');
        svgElemThree.appendChild(pathElemThree);
        svgElemWrapThree.appendChild(svgElemThree);
        rowThree.appendChild(svgElemWrapThree);

        let colTenThree = document.createElement('div');
        colTenThree.classList = 'pl-0 col-lg-10 small';

        let infoTitle = document.createElement('div');
        infoTitle.textContent = isNotEmpty(window.translationData) ? window.translationData.account.dynamic.populate.syncorunsync : 'Synced or Unsynced?';
        infoTitle.classList = 'text-left account-footer-title';
        colTenThree.appendChild(infoTitle);

        let infoDescription = document.createElement('div');
        infoDescription.classList = 'text-left';

        let knowMore = document.createElement('a');
        knowMore.href = "#";
        knowMore.classList = 'knowMoreAccount account-info-color';
        knowMore.textContent = isNotEmpty(window.translationData) ? window.translationData.account.dynamic.populate.knowmore : 'Know more';
        infoDescription.appendChild(knowMore);

        let restOfTheText = document.createElement('span');
        restOfTheText.textContent = isNotEmpty(window.translationData) ? window.translationData.account.dynamic.populate.helpdecide : ' to help you decide';
        infoDescription.appendChild(restOfTheText);

        colTenThree.appendChild(infoDescription);
        rowThree.appendChild(colTenThree);
        emptyAccountFragment.appendChild(rowThree);

        // Append the fragment to the account picker
        let accountPickerModal = document.getElementById('accountPickerWrapper');
        // Replace the HTML to empty and then append child
        while (accountPickerModal.firstChild) {
            accountPickerModal.removeChild(accountPickerModal.firstChild);
        }
        accountPickerModal.appendChild(emptyAccountFragment);

    },
    unSyncedAccount() {
        let unsyncedDocumentFragment = document.createDocumentFragment();

        let unsyncFormWrapper = document.createElement('div');
        unsyncFormWrapper.classList = 'text-left mb-4 mt-2';

        // Description
        let description = document.createElement('div');
        description.classList = 'descriptionAccount';
        description.textContent = isNotEmpty(window.translationData) ? window.translationData.account.dynamic.add.accstart : "Let's get your account started! you can always sync it later on.";
        unsyncFormWrapper.appendChild(description);
        unsyncedDocumentFragment.appendChild(unsyncFormWrapper);

        // Choose Type
        let chooseTypeWrapper = document.createElement('div');
        chooseTypeWrapper.classList = "chooseTypeWrapper text-left";

        let chooseTypeLabel = document.createElement('label');
        chooseTypeLabel.textContent = isNotEmpty(window.translationData) ? window.translationData.account.dynamic.add.typeacc : 'What is the type of your account?';
        chooseTypeWrapper.appendChild(chooseTypeLabel);


        let dropdownGroup = document.createElement('div');
        dropdownGroup.classList = 'btn-group d-md-block d-block';

        let displaySelected = document.createElement('button');
        displaySelected.classList = 'btn btn-secondary w-85 accountChosen';
        displaySelected.setAttribute('disabled', 'disabled');
        displaySelected.setAttribute('data-target', 'Cash');
        displaySelected.textContent = isNotEmpty(window.translationData) ? window.translationData.account.dynamic.add.cash : 'Cash';
        dropdownGroup.appendChild(displaySelected);

        let dropdownTrigger = document.createElement('button');
        dropdownTrigger.classList = 'changeBtnClr btn btn-dynamic-color dropdown-toggle dropdown-toggle-split';
        dropdownTrigger.setAttribute('data-toggle', 'dropdown');
        dropdownTrigger.setAttribute('aria-haspopup', 'true');
        dropdownTrigger.setAttribute('aria-expanded', 'false');

        let toggleSpan = document.createElement('span');
        toggleSpan.classList = 'sr-only';
        toggleSpan.textContent = 'Toggle Dropdown';
        dropdownTrigger.appendChild(toggleSpan);
        dropdownGroup.appendChild(dropdownTrigger);

        let dropdownMenu = document.createElement('div');
        dropdownMenu.classList = 'dropdown-menu';

        let dropdownContentWrap = document.createElement('div');
        dropdownContentWrap.classList = 'm-2';

        // Drop Down Menu
        let budgetHeading = document.createElement('label');
        budgetHeading.textContent = isNotEmpty(window.translationData) ? window.translationData.account.dynamic.add.savings : 'Savings';
        dropdownContentWrap.appendChild(budgetHeading);

        let sadata = isNotEmpty(window.translationData) ? window.translationData.account.dynamic.add.savingsacc : 'Savings Account';
        let cadata = isNotEmpty(window.translationData) ? window.translationData.account.dynamic.add.currentacc : 'Current Account';
        let cashdata = isNotEmpty(window.translationData) ? window.translationData.account.dynamic.add.cash : 'Cash';
        let assetdata = isNotEmpty(window.translationData) ? window.translationData.account.dynamic.add.assets : 'Assets';
        let creditcarddata = isNotEmpty(window.translationData) ? window.translationData.account.dynamic.add.creditcard : 'Credit Card';
        let liabilitydata = isNotEmpty(window.translationData) ? window.translationData.account.dynamic.add.liability : 'Liability';
        // Savings
        let savingsAnchor = document.createElement('a');
        savingsAnchor.classList = 'accountType d-block px-3 py-1 small';
        savingsAnchor.setAttribute('data-target', sadata);
        savingsAnchor.textContent = sadata;
        dropdownContentWrap.appendChild(savingsAnchor);

        // Current
        let currentAnchor = document.createElement('a');
        currentAnchor.classList = 'accountType d-block px-3 py-1 small';
        currentAnchor.setAttribute('data-target', cadata);
        currentAnchor.textContent = cadata;
        dropdownContentWrap.appendChild(currentAnchor);

        // Cash
        let cashAnchor = document.createElement('a');
        cashAnchor.classList = 'accountType d-block px-3 py-1 small';
        cashAnchor.setAttribute('data-target', cashdata);
        cashAnchor.textContent = cashdata;
        dropdownContentWrap.appendChild(cashAnchor);

        // Assets
        let assetsAnchor = document.createElement('a');
        assetsAnchor.classList = 'accountType d-block px-3 py-1 small';
        assetsAnchor.setAttribute('data-target', assetdata);
        assetsAnchor.textContent = assetdata;
        dropdownContentWrap.appendChild(assetsAnchor);

        // Drop Down Menu 2
        let debtHeading = document.createElement('label');
        debtHeading.textContent = isNotEmpty(window.translationData) ? window.translationData.account.dynamic.add.borrowing : 'Borrowing';
        debtHeading.classList = 'mt-2';
        dropdownContentWrap.appendChild(debtHeading);

        // Credit card
        let creditCardAnchor = document.createElement('a');
        creditCardAnchor.classList = 'accountType d-block px-3 py-1 small';
        creditCardAnchor.setAttribute('data-target', creditcarddata);
        creditCardAnchor.textContent = creditcarddata;
        dropdownContentWrap.appendChild(creditCardAnchor);

        // Liability
        let liabilityAnchor = document.createElement('a');
        liabilityAnchor.classList = 'accountType d-block px-3 py-1 small';
        liabilityAnchor.setAttribute('data-target', liabilitydata);
        liabilityAnchor.textContent = liabilitydata
        dropdownContentWrap.appendChild(liabilityAnchor);
        dropdownMenu.appendChild(dropdownContentWrap);
        dropdownGroup.appendChild(dropdownMenu);
        chooseTypeWrapper.appendChild(dropdownGroup);
        unsyncedDocumentFragment.appendChild(chooseTypeWrapper);

        // Error Div for account type
        let accountTypeError = document.createElement('div');
        accountTypeError.id = 'accountTypeErr';
        accountTypeError.classList = 'd-none text-danger text-left small mb-2 noselect';
        accountTypeError.textContent = isNotEmpty(window.translationData) ? window.translationData.account.dynamic.add.accounttype : 'Account type is not valid';
        unsyncedDocumentFragment.appendChild(accountTypeError);

        // Name Of account
        let accountNameWrapper = document.createElement('div');
        accountNameWrapper.setAttribute('data-gramm_editor', "false");
        accountNameWrapper.classList = 'accountNameWrapper text-left';

        let accountNameLabel = document.createElement('label');
        accountNameLabel.textContent = isNotEmpty(window.translationData) ? window.translationData.account.dynamic.add.giveitname : 'Give it a name';
        accountNameWrapper.appendChild(accountNameLabel);

        let accountNameInput = document.createElement('input');
        accountNameInput.id = 'accountName';
        accountNameInput.setAttribute('type', 'text');
        accountNameInput.setAttribute('autocapitalize', 'off');
        accountNameInput.setAttribute('spellcheck', 'false');
        accountNameInput.setAttribute('autocorrect', 'off');
        accountNameWrapper.appendChild(accountNameInput);
        unsyncedDocumentFragment.appendChild(accountNameWrapper);

        // Account Balance
        let accountBalWrapper = document.createElement('div');
        accountBalWrapper.classList = 'accountBalWrapper text-left';


        let accountBalLabel = document.createElement('label');
        accountBalLabel.textContent = isNotEmpty(window.translationData) ? window.translationData.account.dynamic.add.accbalance : 'What is your account balance?';
        accountBalWrapper.appendChild(accountBalLabel);

        let accountBalInput = document.createElement('input');
        accountBalInput.id = 'accountBal';
        accountBalInput.setAttribute('type', 'text');
        accountBalInput.setAttribute('autocapitalize', 'off');
        accountBalInput.setAttribute('spellcheck', 'false');
        accountBalInput.setAttribute('autocorrect', 'off');
        accountBalWrapper.appendChild(accountBalInput);
        unsyncedDocumentFragment.appendChild(accountBalWrapper);

        // Error Div for account bal
        let accountBalErr = document.createElement('div');
        accountBalErr.id = 'accountBalErr';
        accountBalErr.classList = 'd-none text-danger text-left small mb-2 noselect';
        accountBalErr.textContent = isNotEmpty(window.translationData) ? window.translationData.account.dynamic.add.numanddot : 'Account balance can contain only numbers and dot.';
        unsyncedDocumentFragment.appendChild(accountBalErr);

        return unsyncedDocumentFragment;
    },
    // Build an SVG for SYNC image
    syncSVGFc() {
        let syncSVG = document.createElementNS("http://www.w3.org/2000/svg", 'svg');
        syncSVG.setAttribute('width', '20');
        syncSVG.setAttribute('height', '20');
        syncSVG.setAttribute('viewBox', '0 0 128 128');

        let pathElement = document.createElementNS("http://www.w3.org/2000/svg", 'path');
        pathElement.setAttribute('d', 'M9.2 62.8c-.1 0-.2 0-.2 0-1.7-.1-2.9-1.6-2.8-3.2.5-6.3 2-12.4 4.4-18.1.6-1.5 2.4-2.2 3.9-1.6 1.5.6 2.2 2.4 1.6 3.9-2.2 5.2-3.5 10.6-3.9 16.2C12 61.6 10.7 62.8 9.2 62.8zM117.1 40.6c-.7-1.5-2.4-2.2-4-1.5-1.5.7-2.2 2.4-1.5 4 8.7 19.8 4.5 42.5-10.8 57.8C90.9 110.6 77.9 116 64 116c-11.2 0-21.9-3.5-30.8-10.1l0 0h4.9c1.7 0 3-1.3 3-3s-1.3-3-3-3h-13c-1.7 0-3 1.3-3 3v13c0 1.7 1.3 3 3 3s3-1.3 3-3v-6.3l0 0C38.6 117.8 51.3 122 64 122c14.9 0 29.7-5.7 41-17C122.1 88 126.8 62.7 117.1 40.6zM25.2 25.2c1.1 1.1 2.9 1.2 4.1.1C38.9 16.7 51.1 12 64 12c11.2 0 21.9 3.5 30.8 10.1l0 0-4.8 0c-1.6 0-3.1 1.2-3.2 2.8-.1 1.7 1.3 3.2 3 3.2h13c1.7 0 3-1.3 3-3V12.3c0-1.6-1.2-3.1-2.8-3.2-1.7-.1-3.2 1.3-3.2 3v6.3l0 0C78 1.1 46.3 1.9 25.3 20.8 24 22 24 24 25.2 25.2L25.2 25.2zM11.5 77.69999999999999A2.9 2.9 0 1 0 11.5 83.5 2.9 2.9 0 1 0 11.5 77.69999999999999z');
        syncSVG.appendChild(pathElement);

        return syncSVG;
    },

    // Builds an SVG for unsync image
    unsyncSVGFc() {
        let syncSVGTwo = document.createElementNS("http://www.w3.org/2000/svg", 'svg');
        syncSVGTwo.setAttribute('width', '20');
        syncSVGTwo.setAttribute('height', '20');
        syncSVGTwo.setAttribute('viewBox', '0 0 32 32');

        let gElement = document.createElementNS("http://www.w3.org/2000/svg", 'g');

        let pathElementTwo = document.createElementNS("http://www.w3.org/2000/svg", 'path');
        pathElementTwo.setAttribute('d', 'M 15.507813 2.09375 L 14.09375 3.507813 L 16.617188 6.03125 C 16.410156 6.019531 16.210938 6 16 6 C 13.609375 6 11.417969 6.867188 9.695313 8.28125 L 3.707031 2.292969 L 2.292969 3.707031 L 28.292969 29.707031 L 29.707031 28.292969 L 23.71875 22.304688 C 25.136719 20.582031 26 18.390625 26 16 C 26 14.5 25.699219 13.101563 25.097656 11.902344 L 23.597656 13.402344 C 23.898438 14.199219 24 15.101563 24 16 C 24 17.839844 23.359375 19.535156 22.300781 20.890625 L 11.109375 9.695313 C 12.464844 8.640625 14.160156 8 16 8 C 16.1875 8 16.371094 8.015625 16.558594 8.03125 L 14.09375 10.492188 L 15.507813 11.90625 L 20.414063 7 Z M 7.160156 11.347656 C 6.421875 12.738281 6 14.324219 6 16 C 6 17.5 6.300781 18.898438 6.898438 20.097656 L 8.398438 18.597656 C 8.199219 17.800781 8 16.898438 8 16 C 8 14.878906 8.234375 13.8125 8.65625 12.84375 Z M 16.199219 20.386719 L 11.585938 25 L 16.492188 29.90625 L 17.90625 28.492188 L 15.378906 25.96875 C 15.585938 25.980469 15.792969 26 16 26 C 17.675781 26 19.261719 25.578125 20.652344 24.839844 L 19.15625 23.34375 C 18.1875 23.765625 17.121094 24 16 24 C 15.8125 24 15.628906 23.988281 15.441406 23.972656 L 17.613281 21.800781 Z ');
        gElement.appendChild(pathElementTwo);
        syncSVGTwo.appendChild(gElement);

        return syncSVGTwo;
    }
}

window.unsyncSVG = er_a.unsyncSVGFc();
window.syncSVG = er_a.syncSVGFc();

// Account Information display
(function scopeWrapper($) {
    // Constants for reference
    window.allBankAccountInfoCache = '';
    // Tick Icon
    let tickIconSVG = er_a.tickIcon();

    let accountSubTypeToType = {};
    let sadata = isNotEmpty(window.translationData) ? window.translationData.account.dynamic.add.savingsacc : 'Savings Account';
    let cadata = isNotEmpty(window.translationData) ? window.translationData.account.dynamic.add.currentacc : 'Current Account';
    let cashdata = isNotEmpty(window.translationData) ? window.translationData.account.dynamic.add.cash : 'Cash';
    let assetdata = isNotEmpty(window.translationData) ? window.translationData.account.dynamic.add.assets : 'Assets';
    let creditcarddata = isNotEmpty(window.translationData) ? window.translationData.account.dynamic.add.creditcard : 'Credit Card';
    let liabilitydata = isNotEmpty(window.translationData) ? window.translationData.account.dynamic.add.liability : 'Liability';
    accountSubTypeToType[sadata] = 'ASSET';
    accountSubTypeToType[cadata] = 'ASSET';
    accountSubTypeToType[cashdata] = 'ASSET';
    accountSubTypeToType[assetdata] = 'ASSET';
    accountSubTypeToType[creditcarddata] = 'DEBT';
    accountSubTypeToType[liabilitydata] = 'DEBT';
    // Toggle Account Information
    let showAccountsDiv = document.getElementById("showAccounts");
    if (isNotEmpty(showAccountsDiv)) {
        showAccountsDiv.addEventListener("click", function () {
            let accountPickerClass = document.getElementById('accountPickerWrapper').classList;

            // If the modal is open
            if (accountPickerClass.contains('d-none')) {
                // Add click outside event listener to close the modal
                document.addEventListener('mouseup', closeShowAccountsModal, false);
            }
            // Toggle Account Picker
            accountPickerClass.toggle('d-none');

        });
    }

    // Properly closes the accounts modal and performs show accounts actions.
    function closeShowAccountsModal(event) {
        let accountPicker = document.getElementById('accountPickerWrapper');
        let showAccountsDiv = document.getElementById('showAccounts');
        if (showAccountsDiv.contains(event.target)) {
            // Remove event listener once the function performed its task
            document.removeEventListener('mouseup', closeShowAccountsModal, false);
        } else if (!accountPicker.contains(event.target)) {
            // Remove event listener once the function performed its task
            document.removeEventListener('mouseup', closeShowAccountsModal, false);
            accountPicker.classList.toggle('d-none');
        }

    }

    // Click any drop down menu
    $(document).on('click', ".accountType", function () {

        let sadata = isNotEmpty(window.translationData) ? window.translationData.account.dynamic.add.savingsacc : 'Savings Account';
        let cadata = isNotEmpty(window.translationData) ? window.translationData.account.dynamic.add.currentacc : 'Current Account';
        let cashdata = isNotEmpty(window.translationData) ? window.translationData.account.dynamic.add.cash : 'Cash';
        let assetdata = isNotEmpty(window.translationData) ? window.translationData.account.dynamic.add.assets : 'Assets';
        let creditcarddata = isNotEmpty(window.translationData) ? window.translationData.account.dynamic.add.creditcard : 'Credit Card';
        let liabilitydata = isNotEmpty(window.translationData) ? window.translationData.account.dynamic.add.liability : 'Liability';
        accountSubTypeToType[sadata] = 'ASSET';
        accountSubTypeToType[cadata] = 'ASSET';
        accountSubTypeToType[cashdata] = 'ASSET';
        accountSubTypeToType[assetdata] = 'ASSET';
        accountSubTypeToType[creditcarddata] = 'DEBT';
        accountSubTypeToType[liabilitydata] = 'DEBT';
        let selectedAT = this.getAttribute('data-target');
        let accountTypeECL = document.getElementById('accountTypeErr').classList;
        let changeClrBtn = document.getElementsByClassName('changeBtnClr')[0].classList;
        let accCfrmBtn = document.getElementsByClassName('swal2-confirm')[0];
        let accountBalErr = document.getElementById('accountBalErr').classList;
        let accBalance = document.getElementById('accountBal').value;

        // Set Text
        let accountChosen = document.getElementsByClassName('accountChosen')[0];
        accountChosen.textContent = selectedAT;
        accountChosen.setAttribute('data-target', selectedAT);

        // If the account Type is not in the selected
        if (isEmpty(accountSubTypeToType[selectedAT])) {
            accountTypeECL.remove('d-none');
            changeClrBtn.remove('btn-dynamic-color');
            changeClrBtn.add('btn-danger');
            accCfrmBtn.setAttribute('disabled', 'disabled');
            return;
        }

        // Display no error if the account type is valid
        if (!accountTypeECL.contains('d-none')) {
            accountTypeECL.add('d-none');
            changeClrBtn.remove('btn-danger');
            changeClrBtn.add('btn-dynamic-color');
        }

        // Enable confirm button
        if (accountTypeECL.contains('d-none') &&
            accountBalErr.contains('d-none') &&
            regexForFloat.test(accBalance) &&
            isNotEmpty(accountSubTypeToType[selectedAT])) {
            accCfrmBtn.removeAttribute('disabled');
        }

    });

    // Account balance check
    $(document).on('keyup', "#accountBal", function () {
        let accBlnce = this.value;
        let accountBalErr = document.getElementById('accountBalErr').classList;
        let accCfrmBtn = document.getElementsByClassName('swal2-confirm')[0];
        let accountTypeECL = document.getElementById('accountTypeErr').classList;

        // If regex test is not valid
        if (!regexForFloat.test(accBlnce)) {
            accountBalErr.remove('d-none');
            accCfrmBtn.setAttribute('disabled', 'disabled');
            return;
        }

        // Display no error if the account bal is valid
        if (!accountBalErr.contains('d-none')) {
            accountBalErr.add('d-none');
        }

        // Enable confirm button
        if (accountTypeECL.contains('d-none') && accountBalErr.contains('d-none') && regexForFloat.test(accBlnce)) {
            accCfrmBtn.removeAttribute('disabled');
        }

    });


    // Synchronized accounts
    $(document).on('click', "#syncAccountWrap", function () {
        let feature = isNotEmpty(window.translationData) ? window.translationData.account.dynamic.feature : "This feature is coming soon!";
        showNotification(feature, "info");
    });


    // Click on Add unsynced account
    $(document).on('click', "#unsyncedAccountWrap", function () {
        let create = isNotEmpty(window.translationData) ? window.translationData.account.dynamic.create : 'Create Account';
        let addtitle = isNotEmpty(window.translationData) ? window.translationData.account.dynamic.addtitle : 'Add Unsynced Account';
        // Show Sweet Alert
        Swal.fire({
            title: addtitle,
            html: er_a.unSyncedAccount(),
            inputAttributes: {
                autocapitalize: 'on'
            },
            confirmButtonClass: 'createAccount btn btn-dynamic-color',
            confirmButtonText: create,
            showCloseButton: true,
            buttonsStyling: false,
            customClass: {
                container: 'unsyncContainer',
            },
            onOpen: (docVC) => {
                $("#accountBal").keyup(function (e) {
                    let keyCode = e.keyCode || e.which;
                    if (keyCode === 13) {
                        Swal.clickConfirm();
                        e.preventDefault();
                        e.stopPropagation();
                        return false;
                    }
                });
            },
            onClose: () => {
                $("#accountBal").off('keyup');
            }
        }).then(function (result) {
            // If confirm button is clicked
            if (result.value) {
                let accountSubType = document.getElementsByClassName('accountChosen')[0].getAttribute('data-target');
                let accountBalance = parseInt(document.getElementById('accountBal').value);
                let accountType = accountSubTypeToType[accountSubType];

                if (isEqual(accountType, 'DEBT')) {
                    // Account Balance as negative
                    accountBalance *= -1;
                }

                // Populate the JSON form data
                var values = {};
                values['linked'] = false;
                values['bankAccountName'] = document.getElementById('accountName').value;
                values['accountBalance'] = accountBalance;
                values['accountType'] = accountType;
                values['accountSubType'] = accountSubType;
                values['walletId'] = window.currentUser.walletId;
                values['primaryWallet'] = window.currentUser.financialPortfolioId;
                values['selectedAccount'] = false;

                // Check if the account type is valid (Upper Case)
                if (isEmpty(accountSubTypeToType[values['accountSubType']])) {
                    showNotification(window.translationData.account.dynamic.invalidtype, window._constants.notification.error);
                    return;
                }

                // Ajax Requests on Error
                let ajaxData = {};
                ajaxData.isAjaxReq = true;
                ajaxData.type = "PUT";
                ajaxData.url = CUSTOM_DASHBOARD_CONSTANTS.bankAccountUrl;
                ajaxData.dataType = "json";
                ajaxData.contentType = "application/json;charset=UTF-8";
                ajaxData.data = JSON.stringify(values);
                ajaxData.onSuccess = function (result) {
                    result = result["body-json"];
                    // Set account properties to appropriate property
                    result['account_balance'] = result.accountBalance;
                    result['bank_account_name'] = result.bankAccountName;
                    result['account_type'] = result.accountType;
                    result['selected_account'] = result.selectedAccount;
                    showNotification(window.translationData.account.dynamic.unsynacc + values['bankAccountName'] + window.translationData.account.dynamic.unsyncacc2, window._constants.notification.success);
                    // Add Accounts to the preview mode if < 4
                    let bARows = document.getElementsByClassName('bARow');
                    if (bARows.length < 4) {
                        document.getElementById('accountPickerWrapper').appendChild(er_a.populateBankAccountInfo(result, bARows.length + 1));
                    }

                    // A new header for the rest
                    let accountHeaderNew = er_a.buildAccountHeader(result);
                    // Append Empty Table to child
                    accountHeaderNew.getElementById('accountSB-' + result.accountId).appendChild(er_a.buildEmptyTableEntry('emptyAccountEntry-' + result.accountId));
                    // Append to the transaction view
                    document.getElementById('accSortedTable').appendChild(accountHeaderNew);
                    // Remove the account Modal
                    document.getElementById('accountHeaderClose').click();
                }
                ajaxData.onFailure = function (thrownError) {
                    manageErrors(thrownError, window.translationData.account.dynamic.adderror, ajaxData);
                }

                // AJAX call for adding a new unlinked Account
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
        });

        // Change focus to account Name
        document.getElementById('accountName').focus();

        // Disable confirmation button
        let accCfrmBtn = document.getElementsByClassName('swal2-confirm')[0];
        if (!accCfrmBtn.disabled) {
            accCfrmBtn.setAttribute('disabled', 'disabled');
        }
    });

    // Click on an account to select
    $('#accountPickerWrapper').on('click', ".bARow", function () {
        let currentElem = this;
        let bnkAccountId = currentElem.getAttribute('data-target');
        // Close the account Modal
        closeAccountPopup();

        // Populate the JSON form data
        var values = {};
        values['accountId'] = bnkAccountId
        values['selectedAccount'] = true;
        values['walletId'] = currentUser.walletId;

        // Ajax Requests on Error
        let ajaxData = {};
        ajaxData.isAjaxReq = true;
        ajaxData.type = "PATCH";
        ajaxData.url = CUSTOM_DASHBOARD_CONSTANTS.bankAccountUrl;
        ajaxData.dataType = "json";
        ajaxData.contentType = "application/json;charset=UTF-8";
        ajaxData.data = JSON.stringify(values);
        ajaxData.onSuccess = function (result) {
            result = result['body-json'];
            // Append as Selected Account
            for (let i = 0, length = window.allBankAccountInfoCache.length; i < length; i++) {
                let bankAccount = window.allBankAccountInfoCache[i];
                if (isEqual(bankAccount.accountId, bnkAccountId)) {
                    bankAccount['selected_account'] = true;
                    window.selectedBankAccountId = bankAccount.accountId;
                }
            }

            let bARows = document.getElementsByClassName('bARow');
            // Remove class from list
            for (let i = 0, length = bARows.length; i < length; i++) {
                let rowElem = bARows[i];
                if (rowElem.classList.contains('selectedBA')) {
                    rowElem.classList.remove('selectedBA');
                    window.allBankAccountInfoCache[i]['selected_account'] = false;
                }
            }

            currentElem.classList.add('selectedBA');

        }
        ajaxData.onFailure = function (thrownError) {
            manageErrors(thrownError, window.translationData.account.dynamic.selecterror, ajaxData);
        }

        // AJAX call for adding a new unlinked Account
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

    });

    function closeAccountPopup() {

        let accountPickerWrapper = document.getElementById('accountPickerWrapper').classList;
        // Close the popup
        accountPickerWrapper.add('d-none');

        // Remove event listener once the function performed its task
        document.removeEventListener('mouseup', closeShowAccountsModal, false);
    }

    // Click Add Account button
    $('#accountPickerWrapper').on('click', ".bAFooter", function () {
        // Account Picker Wrapper
        let accountPickerModal = document.getElementById('accountPickerWrapper');

        // Populate add options while clicking add account
        er_a.populateEmptyAccountInfo();
        // Append Back Arrow
        let arrowFrag = document.createDocumentFragment();

        let arrowWrapper = document.createElement('div');
        arrowWrapper.classList = 'arrowWrapBA';

        let arrowIcon = document.createElement('i');
        arrowIcon.classList = 'material-icons';
        arrowIcon.textContent = 'keyboard_arrow_left';
        arrowWrapper.appendChild(arrowIcon);
        arrowFrag.appendChild(arrowWrapper);

        // Append to Account Element
        accountPickerModal.appendChild(arrowFrag);
    });

    // Click Back Button
    $('#accountPickerWrapper').on('click', ".arrowWrapBA", function () {
        // Bank Account Preview
        er_a.populateBankInfo(allBankAccountInfoCache);
    });

    // Click Know More
    $('#accountPickerWrapper').on('click', ".knowMoreAccount", function (e) {
        // Prevent refresh of link
        e.preventDefault();
        // Populate the know more
        populateKnowMore();
    });

    function populateKnowMore() {
        // Account Picker Wrapper
        let accountPickerModal = document.getElementById('accountPickerWrapper');
        let knowMoreFrag = document.createDocumentFragment();

        // Heading
        let headingWrap = document.createElement('div');
        headingWrap.classList = 'row aKMTitle noselect';

        let svgElemWrapThree = document.createElement('div');
        svgElemWrapThree.classList = 'col-lg-2 vertical-center-svg px-2 account-info-color infoAO';

        let svgElemThree = document.createElementNS("http://www.w3.org/2000/svg", 'svg');
        svgElemThree.setAttribute('viewBox', '0 0 16 16');

        let pathElemThree = document.createElementNS("http://www.w3.org/2000/svg", 'path');
        pathElemThree.setAttribute('d', 'M0 8C0 12.4183 3.58167 16 8 16C10.1217 16 12.1566 15.1571 13.6569 13.6569C15.1571 12.1566 16 10.1217 16 8C16 3.58167 12.4183 0 8 0C3.58167 0 0 3.58167 0 8ZM1.33337 8.00012C1.33337 4.31824 4.31812 1.3335 8 1.3335C11.6819 1.3335 14.6667 4.31824 14.6667 8.00012C14.6667 11.682 11.6819 14.6669 8 14.6669C4.31812 14.6669 1.33337 11.682 1.33337 8.00012ZM9.05125 5.22826C8.71087 5.39234 8.28912 5.39234 7.94876 5.22822C7.80589 5.15933 7.67966 5.0601 7.57907 4.93824C7.29818 4.59796 7.29818 4.06879 7.57907 3.72851C7.67949 3.60685 7.80546 3.50776 7.94802 3.43888C8.28875 3.27427 8.71124 3.27422 9.05199 3.43879C9.19461 3.50767 9.32062 3.6068 9.42107 3.7285C9.70194 4.06879 9.70194 4.59796 9.42105 4.93824C9.32043 5.06012 9.19417 5.15937 9.05125 5.22826ZM8.04517 11.0911L8.97339 7.58801C9.05212 7.28699 8.98633 6.96667 8.79565 6.72095C8.60486 6.47522 8.31079 6.33203 7.99976 6.3335H7.00342C6.81946 6.33362 6.67029 6.48279 6.67029 6.66687V6.77441C6.67029 6.91077 6.7533 7.03333 6.87976 7.08398C7.20642 7.21497 7.38416 7.56897 7.29382 7.90918L6.36548 11.4124C6.28687 11.7134 6.35266 12.0337 6.54346 12.2794C6.73425 12.5251 7.02832 12.6683 7.33936 12.6669H8.33569C8.51965 12.6667 8.6687 12.5175 8.6687 12.3335V12.2258C8.6687 12.0896 8.58582 11.967 8.45935 11.9164C8.13257 11.7854 7.95483 11.4313 8.04517 11.0911Z');
        pathElemThree.setAttribute('transform', 'translate(0 -0.00012207)');
        svgElemThree.appendChild(pathElemThree);
        svgElemWrapThree.appendChild(svgElemThree);
        headingWrap.appendChild(svgElemWrapThree);

        let headingElem = document.createElement('h4');
        headingElem.classList = 'col-lg-10 accOptions text-left pb-2 mb-0';
        headingElem.textContent = isNotEmpty(window.translationData) ? window.translationData.account.dynamic.accounttype : 'Account Types';
        headingWrap.appendChild(headingElem);
        knowMoreFrag.appendChild(headingWrap);

        // Account Info Description
        let accountInfoDesc = document.createElement('div');
        accountInfoDesc.classList = 'accInfoDesc text-left small mt-3 noselect';
        accountInfoDesc.textContent = isNotEmpty(window.translationData) ? window.translationData.account.dynamic.add.unsync.description : 'You will always have the option to unsync or sync the accounts at any time.';
        knowMoreFrag.appendChild(accountInfoDesc);

        // Table Responsive
        let tableReponsive = document.createElement('div');
        tableReponsive.classList = 'table-responsive mt-2 noselect';

        // Table
        let tableInfo = document.createElement('div');
        tableInfo.classList = 'table table-fixed d-table';

        // Table Heading
        let tableHeading = document.createElement('div');
        tableHeading.classList = 'tableHeadingDiv';

        // First Empty HEad
        let firstTableHead = document.createElement('div');
        firstTableHead.classList = 'w-60 d-table-cell';
        tableHeading.appendChild(firstTableHead);

        // Second Table Head
        let secTableHead = document.createElement('div');
        secTableHead.classList = 'w-20 d-table-cell';
        syncSVG = cloneElementAndAppend(secTableHead, syncSVG);
        tableHeading.appendChild(secTableHead);

        // Third Table Head
        let thirdTableHead = document.createElement('div');
        thirdTableHead.classList = 'w-20 d-table-cell';
        unsyncSVG = cloneElementAndAppend(thirdTableHead, unsyncSVG);
        tableHeading.appendChild(thirdTableHead);
        tableInfo.appendChild(tableHeading);

        // Table First Row
        let firstTableRow = document.createElement('div');
        firstTableRow.classList = 'd-table-row';

        let emptyFC1 = document.createElement('div');
        emptyFC1.classList = 'd-table-cell';
        firstTableRow.appendChild(emptyFC1);

        let titleSC1 = document.createElement('div');
        titleSC1.classList = 'd-table-cell';
        titleSC1.textContent = isNotEmpty(window.translationData) ? window.translationData.account.dynamic.add.sync.description : 'Sync';
        firstTableRow.appendChild(titleSC1);

        let titlsTC1 = document.createElement('div');
        titlsTC1.classList = 'd-table-cell';
        titlsTC1.textContent = isNotEmpty(window.translationData) ? window.translationData.account.dynamic.add.unsync.desc : 'Unsync';
        firstTableRow.appendChild(titlsTC1);
        tableInfo.appendChild(firstTableRow);

        // Table Six Row
        let SixthTableRow = document.createElement('div');
        SixthTableRow.classList = 'd-table-row';

        let emptyFC6 = document.createElement('div');
        emptyFC6.textContent = isNotEmpty(window.translationData) ? window.translationData.account.dynamic.add.unsync.connect : 'Connect to your Financial Institution';
        emptyFC6.classList = 'd-table-cell pt-2 text-left align-middle';
        SixthTableRow.appendChild(emptyFC6);

        let titleSC6 = document.createElement('div');
        titleSC6.classList = 'd-table-cell pt-2 f6x3BckGrd align-middle';
        tickIconSVG = cloneElementAndAppend(titleSC6, tickIconSVG);
        SixthTableRow.appendChild(titleSC6);

        let titlsTC6 = document.createElement('div');
        titlsTC6.classList = 'd-table-cell pt-2 f6x3BckGrd align-middle';
        titlsTC6.appendChild(xMark());
        SixthTableRow.appendChild(titlsTC6);
        tableInfo.appendChild(SixthTableRow);

        // Table Second Row
        let secondTableRow = document.createElement('div');
        secondTableRow.classList = 'd-table-row';

        let emptyFC2 = document.createElement('div');
        emptyFC2.textContent = isNotEmpty(window.translationData) ? window.translationData.account.dynamic.add.unsync.import : 'Import from a file *';
        emptyFC2.classList = 'd-table-cell pt-2 text-left align-middle';
        secondTableRow.appendChild(emptyFC2);

        let titleSC2 = document.createElement('div');
        titleSC2.classList = 'd-table-cell pt-2 f6x3BckGrd align-middle';
        tickIconSVG = cloneElementAndAppend(titleSC2, tickIconSVG);
        secondTableRow.appendChild(titleSC2);

        let titlsTC2 = document.createElement('div');
        titlsTC2.classList = 'd-table-cell pt-2 f6x3BckGrd align-middle';
        tickIconSVG = cloneElementAndAppend(titlsTC2, tickIconSVG);
        secondTableRow.appendChild(titlsTC2);
        tableInfo.appendChild(secondTableRow);

        // Table Third Row
        let ThirdTableRow = document.createElement('div');
        ThirdTableRow.classList = 'd-table-row';

        let emptyFC3 = document.createElement('div');
        emptyFC3.textContent = isNotEmpty(window.translationData) ? window.translationData.account.dynamic.add.unsync.manual : 'Manually Enter Transactions';
        emptyFC3.classList = 'd-table-cell pt-2 text-left align-middle';
        ThirdTableRow.appendChild(emptyFC3);

        let titleSC3 = document.createElement('div');
        titleSC3.classList = 'd-table-cell pt-2 f6x3BckGrd align-middle';
        tickIconSVG = cloneElementAndAppend(titleSC3, tickIconSVG);
        ThirdTableRow.appendChild(titleSC3);

        let titlsTC3 = document.createElement('div');
        titlsTC3.classList = 'd-table-cell pt-2 f6x3BckGrd align-middle';
        tickIconSVG = cloneElementAndAppend(titlsTC3, tickIconSVG);
        ThirdTableRow.appendChild(titlsTC3);
        tableInfo.appendChild(ThirdTableRow);

        // Table Fourth Row
        let FourthTableRow = document.createElement('div');
        FourthTableRow.classList = 'd-table-row';

        let emptyFC4 = document.createElement('div');
        emptyFC4.textContent = isNotEmpty(window.translationData) ? window.translationData.account.dynamic.add.unsync.available : 'International Availability *';
        emptyFC4.classList = 'd-table-cell pt-2 text-left align-middle';
        FourthTableRow.appendChild(emptyFC4);

        let titleSC4 = document.createElement('div');
        titleSC4.classList = 'd-table-cell pt-2 f6x3BckGrd align-middle';
        tickIconSVG = cloneElementAndAppend(titleSC4, tickIconSVG);
        FourthTableRow.appendChild(titleSC4);

        let titlsTC4 = document.createElement('div');
        titlsTC4.classList = 'd-table-cell pt-2 f6x3BckGrd align-middle';
        tickIconSVG = cloneElementAndAppend(titlsTC4, tickIconSVG);
        FourthTableRow.appendChild(titlsTC4);
        tableInfo.appendChild(FourthTableRow);

        // Table Fifth Row
        let FifthTableRow = document.createElement('div');
        FifthTableRow.classList = 'd-table-row';

        let emptyFC5 = document.createElement('div');
        emptyFC5.textContent = isNotEmpty(window.translationData) ? window.translationData.account.dynamic.add.unsync.mobile : 'Mobile Apps Availability';
        emptyFC5.classList = 'd-table-cell pt-2 text-left align-middle';
        FifthTableRow.appendChild(emptyFC5);

        let titleSC5 = document.createElement('div');
        titleSC5.classList = 'd-table-cell pt-2 f6x3BckGrd align-middle';
        tickIconSVG = cloneElementAndAppend(titleSC5, tickIconSVG);
        FifthTableRow.appendChild(titleSC5);

        let titlsTC5 = document.createElement('div');
        titlsTC5.classList = 'd-table-cell pt-2 f6x3BckGrd align-middle';
        tickIconSVG = cloneElementAndAppend(titlsTC5, tickIconSVG);
        FifthTableRow.appendChild(titlsTC5);
        tableInfo.appendChild(FifthTableRow);
        tableReponsive.appendChild(tableInfo);
        knowMoreFrag.appendChild(tableReponsive);

        // Append Back Arrow
        let arrowWrapper = document.createElement('div');
        arrowWrapper.classList = 'arrowWrapKM btn-round btn-sm btn btn-dynamic-color';
        arrowWrapper.textContent = isNotEmpty(window.translationData) ? window.translationData.account.dynamic.know.back : 'Back';
        knowMoreFrag.appendChild(arrowWrapper);

        // Replace the HTML to empty and then append child
        while (accountPickerModal.firstChild) {
            accountPickerModal.removeChild(accountPickerModal.firstChild);
        }

        // Expand account picker and append child
        accountPickerModal.classList.add('knowMore');
        // For easing the height with transition
        if (accountPickerModal.classList.contains('heightEI')) {
            accountPickerModal.classList.remove('heightEI');
        }
        accountPickerModal.appendChild(knowMoreFrag);
    }

    // Back Arrow Click
    $('#accountPickerWrapper').on('click', ".arrowWrapKM", function () {
        // Account Picker Wrapper
        let accountPickerModal = document.getElementById('accountPickerWrapper');

        // Populate add options while clicking add account
        er_a.populateEmptyAccountInfo();

        // If bank account is present then display back button
        if (isNotEmpty(allBankAccountInfoCache)) {
            // Append Back Arrow
            let arrowFrag = document.createDocumentFragment();

            let arrowWrapper = document.createElement('div');
            arrowWrapper.classList = 'arrowWrapBA';

            let arrowIcon = document.createElement('i');
            arrowIcon.classList = 'material-icons';
            arrowIcon.textContent = 'keyboard_arrow_left';
            arrowWrapper.appendChild(arrowIcon);
            arrowFrag.appendChild(arrowWrapper);

            // Append to Account Element
            accountPickerModal.appendChild(arrowFrag);
        }

        // Remove know more if present
        if (accountPickerModal.classList.contains('knowMore')) {
            accountPickerModal.classList.remove('knowMore');
            // For easing the height with transition
            accountPickerModal.classList.add('heightEI');
        }
    });

    // Build an X with SVG
    function xMark() {
        let syncSVGTwo = document.createElementNS("http://www.w3.org/2000/svg", 'svg');
        syncSVGTwo.setAttribute('x', '0px');
        syncSVGTwo.setAttribute('y', '0px');
        syncSVGTwo.setAttribute('width', '15');
        syncSVGTwo.setAttribute('height', '15');
        syncSVGTwo.setAttribute('viewBox', '0 0 50 50');

        let pathElementTwo = document.createElementNS("http://www.w3.org/2000/svg", 'path');
        pathElementTwo.setAttribute('class', 'xWithRed');
        pathElementTwo.setAttribute('d', 'M31.202,25l13.63-20.445c0.204-0.307,0.224-0.701,0.05-1.026S44.369,3,44,3h-7.34c-0.327,0-0.634,0.16-0.821,0.429L25,19 L14.16,3.429C13.973,3.16,13.667,3,13.34,3H6C5.631,3,5.292,3.203,5.118,3.528s-0.154,0.72,0.05,1.026L18.798,25L5.168,45.445 c-0.204,0.307-0.224,0.701-0.05,1.026S5.631,47,6,47h7.34c0.327,0,0.634-0.16,0.821-0.429L25,31l10.84,15.571 C36.027,46.84,36.333,47,36.66,47H44c0.369,0,0.708-0.203,0.882-0.528s0.154-0.72-0.05-1.026L31.202,25z');
        syncSVGTwo.appendChild(pathElementTwo);

        return syncSVGTwo;
    }

    // Click View All
    $('#accountPickerWrapper').on('click', ".manageBA", function () {
        // Close the account Modal
        closeAccountPopup();
        // Store the account sorting in window.sortingTransTable
        let manageaccount = isNotEmpty(window.translationData) ? window.translationData.account.dynamic.manage : 'Account';
        window.sortingTransTable = manageaccount;
        // Check if the transactions page is active
        let sidebar = document.getElementById('transaction-dashboard-sidebar');
        // If already in transactions page
        if (sidebar.classList.contains('active')) {
            // Change the table sorting to account
            er.tableSortMechanism();
        } else {
            // Click the transactions page
            document.getElementById('transactionsPage').click();
        }
    });


}(jQuery));
