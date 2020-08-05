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
         // Hide all account tables loaded
         $('.accountInfoTable').addClass('d-none');
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
         document.getElementById('tagsTransactionsEntry').classList.add('d-none');
     });

 }(jQuery));
