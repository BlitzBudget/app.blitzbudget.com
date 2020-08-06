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
         document.getElementById('futureTransactionsEntry').classList.remove('d-none');
         // show the tags sortby
         let tabsTable = document.getElementById('tagsTable');
         tabsTable.classList.add('d-none');
         tabsTable.classList.remove('d-table');
         // Hide all account tables loaded
         let accSortedTable = document.getElementById('accSortedTable');
         accSortedTable.classList.add('d-none');
         accSortedTable.classList.remove('d-table');
     });

 }(jQuery));

 // Populate Recurring transactions
 function populateRecurringTransactions(recurringTransactionsList) {
     let recurringTransactionsDiv = document.getElementById('futureTransactionsEntry');
     let futureTransactionsFragment = document.createDocumentFragment();

     if (isEmpty(recurringTransactionsList)) {
         futureTransactionsFragment.appendChild(buildEmptyTransactionsTab('futureTransactionsEntry'));
     } else {

         let resultKeySet = Object.keys(recurringTransactionsList);
         for (let countGrouped = 0; countGrouped < resultKeySet.length; countGrouped++) {
             let key = resultKeySet[countGrouped];
             let recurringTransaction = recurringTransactionsList[key];

             futureTransactionsFragment.appendChild(buildFutureTransactionRow(recurringTransaction));
         }
     }

     // Empty HTML
     while (recurringTransactionsDiv.firstChild) {
         recurringTransactionsDiv.removeChild(recurringTransactionsDiv.firstChild);
     }
     recurringTransactionsDiv.appendChild(futureTransactionsFragment);
 }

 // Builds the rows for recent transactions
 function buildFutureTransactionRow(recurringTransaction) {
     // Convert date from UTC to user specific dates
     let nextScheduledDate = new Date(recurringTransaction['next_scheduled']);

     let tableRowTransaction = document.createElement('div');
     tableRowTransaction.id = 'recurTransaction-' + recurringTransaction.recurringTransactionsId;
     tableRowTransaction.setAttribute('data-target', recurringTransaction.recurringTransactionsId);
     tableRowTransaction.classList = 'recentTransactionEntry d-table-row';

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
