 "use strict";
 (function scopeWrapper($) {

     // Click on sort by future transactions
     $('body').on('click', '#tagsSortBy', function (e) {
         // Change title of in the dropdown
         let sortByDiv = document.getElementById('sortByBtnTit');
         sortByDiv.setAttribute('data-i18n', 'transactions.dynamic.sort.tags');
         sortByDiv.textContent = isNotEmpty(window.translationData) ? window.translationData.transactions.dynamic.sort.tags : "Tags";
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
         document.getElementById('futureTransactionsEntry').classList.add('d-none');
         // show the tags sortby
         let tabsTable = document.getElementById('tagsTable');
         tabsTable.classList.remove('d-none');
         tabsTable.classList.add('d-table');
         // Hide all account tables loaded
         let accSortedTable = document.getElementById('accSortedTable');
         accSortedTable.classList.add('d-none');
         accSortedTable.classList.remove('d-table');
         // Rotate the arrow
         let arrowIndicator = this.firstElementChild.firstElementChild;
         arrowIndicator.classList.toggle('rotateZero');
         arrowIndicator.classList.toggle('rotateNinty');
     });

 }(jQuery));

 /*
  * Categorize by Tags in Transactions
  */
 function populateTagsTransactions(transactions) {
     let tagsTable = document.getElementById('tagsTable');
     let tagsInfoTable = document.getElementsByClassName('tagInfoTable');
     // Replace HTML with Empty
     while (tagsInfoTable[0]) {
         tagsInfoTable[0].parentNode.removeChild(tagsInfoTable[0]);
     }

     if (isEmpty(transactions)) {
         tagsTable.appendChild(buildEmptyTransactionsTab('tagInfoTable'));
     } else {
         tagsTable.appendChild(populateTransactionsByTags(transactions));
     }
 }

 /*
  * Categorize by Tags in Transactions
  */
 function populateTransactionsByTags(transactions) {
     let populateTransactionsFragment = document.createDocumentFragment();
     let createdTagIds = [];

     for (let i = 0, len = transactions.length; i < len; i++) {
         let userTransaction = transactions[i];
         let tags = userTransaction.tags;

         // Is Empty Tags then
         if (isEmpty(tags)) {
             continue;
         }

         for (let j = 0, leng = tags.length; j < leng; j++) {
             let oneTag = tags[j];

             if (!includesStr(createdTagIds, oneTag)) {
                 populateTransactionsFragment.appendChild(buildTagsHeaders(oneTag));
                 // Add Created Tag ID to the array
                 createdTagIds.push(oneTag);
             }
             populateTransactionsFragment.getElementById('tagSB-' + oneTag).appendChild(buildTransactionRow(userTransaction, 'tagsSorted'));
         }
     }

     // Upload to tags table
     return populateTransactionsFragment;
 }

 // Appends the tags header for sorted transactions
 function buildTagsHeaders(oneTag) {
     let docFrag = document.createDocumentFragment();
     let tagHeader = document.createElement('div');
     tagHeader.id = 'tagSB-' + oneTag;
     tagHeader.setAttribute('data-target', oneTag);
     tagHeader.classList = 'tableBodyDiv tagInfoTable noselect';

     let tagTit = document.createElement('div');
     tagTit.classList = 'tagSortGrp d-table-row ml-3 font-weight-bold';

     // Title Wrapper
     let titleWrapper = document.createElement('div');
     titleWrapper.classList = 'd-table-cell text-nowrap';

     // Right Arrow
     let rightArrow = document.createElement('div');
     rightArrow.classList = 'material-icons rotateNinty';
     rightArrow.textContent = 'keyboard_arrow_right';
     titleWrapper.appendChild(rightArrow);

     // Title
     let tagTitle = document.createElement('a');
     tagTitle.id = 'tagTitle-' + oneTag;
     tagTitle.classList = 'pl-4 accTitleAnchor';
     tagTitle.textContent = oneTag;
     titleWrapper.appendChild(tagTitle);
     tagTit.appendChild(titleWrapper);

     // Empty Cell
     let emptyCell = document.createElement('div');
     emptyCell.classList = 'd-table-cell';
     tagTit.appendChild(emptyCell);

     // Empty Cell
     let tagBalance = document.createElement('div');
     tagBalance.classList = 'd-table-cell text-right text-nowrap pr-3';
     tagTit.appendChild(tagBalance);

     tagHeader.appendChild(tagTit);
     docFrag.appendChild(tagHeader);
     return docFrag;
 }
