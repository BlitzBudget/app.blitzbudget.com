 "use strict";
 (function scopeWrapper($) {

     // Click on sort by future transactions
     $('body').on('click', '#futureTransactionsSortBy', function (e) {
         // Change title of in the dropdown
         let sortByDiv = document.getElementById('sortByBtnTit');
         sortByDiv.setAttribute('data-i18n', 'transactions.dynamic.sort.futuretransactions');
         sortByDiv.textContent = isNotEmpty(window.translationData) ? window.translationData.transactions.dynamic.sort.futuretransactions : "Future Transactions";
         // hide the recent transactions
         document.getElementById('recentTransactions').classList.add('d-none');
         // hide the accountTable
         document.getElementById('accountTable').classList.add('d-none');
         // show the category view
         let transactionsTable = document.getElementById('transactionsTable');
         transactionsTable.classList.remove('d-table');
         transactionsTable.classList.add('d-none');
         // Open Account Modal
         document.getElementById('accountInformationMdl').classList.add('d-none');
         // Close Category Modal
         document.getElementById('categoryInformationMdl').classList.add('d-none');
         // Toggle  Financial Position
         document.getElementsByClassName('transactions-chart')[0].classList.remove('d-none');
         // show the future transactions
         let futureTransactionsTable = document.getElementById('futureTransactionsTable');
         futureTransactionsTable.classList.remove('d-none');
         futureTransactionsTable.classList.add('d-table');
         // show the recurTranss sortby
         let tabsTable = document.getElementById('tagsTable');
         tabsTable.classList.add('d-none');
         tabsTable.classList.remove('d-table');
         // Hide all account tables loaded
         let accSortedTable = document.getElementById('accSortedTable');
         accSortedTable.classList.add('d-none');
         accSortedTable.classList.remove('d-table');
     });

     /*
      * Tag Info Table header on click
      */
     $('body').on('click', '.recurTransInfoTable .recurTransSortGrp', function (e) {
         // Rotate the arrow
         let arrowIndicator = this.firstElementChild.firstElementChild;
         arrowIndicator.classList.toggle('rotateZero');
         arrowIndicator.classList.toggle('rotateNinty');
         let childElementWrappers = this.parentNode.childNodes;
         for (let i = 1, len = childElementWrappers.length; i < len; i++) {
             let childElementWrapper = childElementWrappers[i];
             childElementWrapper.classList.toggle('d-none');
             childElementWrapper.classList.toggle('d-table-row');
         }
     });

 }(jQuery));

 // Populate Recurring transactions
 function populateRecurringTransactions(recurringTransactionsList) {
     let futureTransactionsTable = document.getElementById('futureTransactionsTable');
     let recurringTransactionsDiv = document.getElementsByClassName('recurTransInfoTable');
     let futureTransactionsFragment = document.createDocumentFragment();

     if (isEmpty(recurringTransactionsList)) {
         futureTransactionsFragment.appendChild(buildEmptyTransactionsTab('recurTransInfoTable'));
     } else {

         let resultKeySet = Object.keys(recurringTransactionsList);
         let createdRecurTransRecurrence = [];
         window.recurringTransactionCache = {};
         for (let countGrouped = 0; countGrouped < resultKeySet.length; countGrouped++) {
             let key = resultKeySet[countGrouped];
             let recurringTransaction = recurringTransactionsList[key];
             // Recurring Transactions Cache with ID
             window.recurringTransactionCache[recurringTransaction.recurringTransactionsId] = recurringTransaction;

             if (!includesStr(createdRecurTransRecurrence, recurringTransaction.recurrence)) {
                 futureTransactionsFragment.appendChild(buildRecurTransHeaders(recurringTransaction.recurrence));
                 // Add Created recurTrans ID to the array
                 createdRecurTransRecurrence.push(recurringTransaction.recurrence);
             }

             futureTransactionsFragment.getElementById('recurTransSB-' + recurringTransaction.recurrence).appendChild(buildFutureTransactionRow(recurringTransaction));
         }
     }

     // Replace HTML with Empty
     while (recurringTransactionsDiv[0]) {
         recurringTransactionsDiv[0].parentNode.removeChild(recurringTransactionsDiv[0]);
     }
     futureTransactionsTable.appendChild(futureTransactionsFragment);
 }

 // Recurring transactions headers
 function buildRecurTransHeaders(recurringTransaction) {
     let docFrag = document.createDocumentFragment();
     let recurTransHeader = document.createElement('div');
     recurTransHeader.id = 'recurTransSB-' + recurringTransaction;
     recurTransHeader.setAttribute('data-target', recurringTransaction);
     recurTransHeader.classList = 'tableBodyDiv recurTransInfoTable noselect';

     let recurTransTit = document.createElement('div');
     recurTransTit.classList = 'recurTransSortGrp d-table-row ml-3 font-weight-bold';

     // Title Wrapper
     let titleWrapper = document.createElement('div');
     titleWrapper.classList = 'd-table-cell text-nowrap';

     // Right Arrow
     let rightArrow = document.createElement('div');
     rightArrow.classList = 'material-icons rotateNinty';
     rightArrow.textContent = 'keyboard_arrow_right';
     titleWrapper.appendChild(rightArrow);

     // Title
     let recurTransTitle = document.createElement('a');
     recurTransTitle.id = 'recurTransTitle-' + recurringTransaction;
     recurTransTitle.classList = 'pl-4 accTitleAnchor';
     recurTransTitle.textContent = recurringTransaction;
     titleWrapper.appendChild(recurTransTitle);
     recurTransTit.appendChild(titleWrapper);

     // Empty Cell
     let emptyCell = document.createElement('div');
     emptyCell.classList = 'd-table-cell';
     recurTransTit.appendChild(emptyCell);

     // Empty Cell
     let recurTransBalance = document.createElement('div');
     recurTransBalance.classList = 'd-table-cell text-right text-nowrap pr-3';
     recurTransTit.appendChild(recurTransBalance);

     recurTransHeader.appendChild(recurTransTit);
     docFrag.appendChild(recurTransHeader);
     return docFrag;
 }

 // Builds the rows for recent transactions
 function buildFutureTransactionRow(recurringTransaction) {
     // Convert date from UTC to user specific dates
     let nextScheduledDate = new Date(recurringTransaction['next_scheduled']);

     let tableRowTransaction = document.createElement('div');
     tableRowTransaction.id = 'recurTransaction-' + recurringTransaction.recurringTransactionsId;
     tableRowTransaction.setAttribute('data-target', recurringTransaction.recurringTransactionsId);
     tableRowTransaction.classList = 'recentTransactionEntry d-table-row recurTransEntry';
     tableRowTransaction.draggable = 'true';

     // Cell 1
     let tableCellImagesWrapper = document.createElement('div');
     tableCellImagesWrapper.classList = 'd-table-cell align-middle imageWrapperCell text-center';

     let circleWrapperDiv = document.createElement('div');
     circleWrapperDiv.classList = 'rounded-circle align-middle circleWrapperImageRT mx-auto';

     // Append a - sign if it is an expense
     circleWrapperDiv.appendChild(cachedIcons());


     tableCellImagesWrapper.appendChild(circleWrapperDiv);
     tableRowTransaction.appendChild(tableCellImagesWrapper);

     // Cell 2
     let tableCellTransactionDescription = document.createElement('div');
     tableCellTransactionDescription.classList = 'descriptionCellRT d-table-cell';

     let elementWithDescription = document.createElement('div');
     elementWithDescription.classList = 'font-weight-bold recentTransactionDescription';
     elementWithDescription.textContent = isEmpty(recurringTransaction.description) ? window.translationData.transactions.dynamic.card.description : recurringTransaction.description.length < 25 ? recurringTransaction.description : recurringTransaction.description.slice(0, 26) + '...';
     tableCellTransactionDescription.appendChild(elementWithDescription);

     let elementWithCategoryName = document.createElement('div');
     elementWithCategoryName.classList = 'small categoryNameRT w-100';
     elementWithCategoryName.textContent = (recurringTransaction.recurrence) + ' • ' + ("0" + nextScheduledDate.getDate()).slice(-2) + ' ' + months[nextScheduledDate.getMonth()].slice(0, 3) + ' ' + nextScheduledDate.getFullYear() + ' ' + ("0" + nextScheduledDate.getHours()).slice(-2) + ':' + ("0" + nextScheduledDate.getMinutes()).slice(-2);
     tableCellTransactionDescription.appendChild(elementWithCategoryName);
     tableRowTransaction.appendChild(tableCellTransactionDescription);

     // Cell 3
     let surCell = document.createElement('div');
     surCell.classList = 'd-table-cell';

     let transactionAmount = document.createElement('div');
     transactionAmount.classList = 'transactionAmountRT font-weight-bold text-right align-middle';
     transactionAmount.textContent = formatToCurrency(recurringTransaction.amount);
     surCell.appendChild(transactionAmount);

     let recurrencePeriod = document.createElement('div');
     recurrencePeriod.classList = 'accBalSubAmount pl-2 font-weight-bold text-right align-middle small';
     surCell.appendChild(recurrencePeriod);
     tableRowTransaction.appendChild(surCell);

     return tableRowTransaction;
 }

 // Cache Icons For Recurring Icons
 function cachedIcons() {
     let materialIconsCache = document.createElement('span');
     materialIconsCache.classList = 'material-icons align-middle recur-transactions';
     materialIconsCache.textContent = 'cached';
     return materialIconsCache;
 }
