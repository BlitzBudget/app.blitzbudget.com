'use strict';
(function scopeWrapper ($) {
  // Sorts the table by aggregating transactions by account
  $('body').on('click', '#accountSortBy', function (e) {
    tr.sortTransactionsByAccount()
  })
}(jQuery))
