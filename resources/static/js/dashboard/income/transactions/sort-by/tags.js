'use strict';
(function scopeWrapper ($) {
  // Click on sort by future transactions
  $('body').on('click', '#tagsSortBy', function (e) {
    // Change title of in the dropdown
    const sortByDiv = document.getElementById('sortByBtnTit')
    sortByDiv.setAttribute('data-i18n', 'transactions.dynamic.sort.tags')
    sortByDiv.textContent = isNotEmpty(window.translationData) ? window.translationData.transactions.dynamic.sort.tags : 'Tags'
    // hide the recent transactions
    document.getElementById('recentTransactions').classList.add('d-none')
    // hide the accountTable
    document.getElementById('accountTable').classList.add('d-none')
    // show the category view
    const transactionsTable = document.getElementById('transactionsTable')
    transactionsTable.classList.remove('d-table')
    transactionsTable.classList.add('d-none')
    // Open Account Modal
    document.getElementById('accountInformationMdl').classList.add('d-none')
    // Close Category Modal
    document.getElementById('categoryInformationMdl').classList.add('d-none')
    // Toggle  Financial Position
    document.getElementsByClassName('transactions-chart')[0].classList.remove('d-none')
    // Hide Recurring transactions modal
    document.getElementById('recurringTransactionInformationMdl').classList.add('d-none')
    // Hide Transaction Inormation Modal
    document.getElementById('transactionInformationMdl').classList.add('d-none')
    // show the future transactions
    const futureTransactionsTable = document.getElementById('futureTransactionsTable')
    futureTransactionsTable.classList.add('d-none')
    futureTransactionsTable.classList.remove('d-table')
    // show the tags sortby
    const tabsTable = document.getElementById('tagsTable')
    tabsTable.classList.remove('d-none')
    tabsTable.classList.add('d-table')
    // Hide all account tables loaded
    const accSortedTable = document.getElementById('accSortedTable')
    accSortedTable.classList.add('d-none')
    accSortedTable.classList.remove('d-table')
  })

  /*
      * Tag Info Table header on click
      */
  $('body').on('click', '.tagInfoTable .tagSortGrp', function (e) {
    // Rotate the arrow
    const arrowIndicator = this.firstElementChild.firstElementChild
    arrowIndicator.classList.toggle('rotateZero')
    arrowIndicator.classList.toggle('rotateNinty')
    const childElementWrappers = this.parentNode.childNodes
    for (let i = 1, len = childElementWrappers.length; i < len; i++) {
      const childElementWrapper = childElementWrappers[i]
      childElementWrapper.classList.toggle('d-none')
      childElementWrapper.classList.toggle('d-table-row')
    }
  })
}(jQuery))

/*
  * Categorize by Tags in Transactions
  */
function populateTagsTransactions (transactions) {
  const tagsTable = document.getElementById('tagsTable')
  const tagsInfoTable = document.getElementsByClassName('tagInfoTable')
  // Replace HTML with Empty
  while (tagsInfoTable[0]) {
    tagsInfoTable[0].parentNode.removeChild(tagsInfoTable[0])
  }

  if (isEmpty(transactions)) {
    tagsTable.appendChild(buildEmptyTransactionsTab('tagInfoTable'))
  } else {
    tagsTable.appendChild(populateTransactionsByTags(transactions))
  }
}

/*
  * Categorize by Tags in Transactions
  */
function populateTransactionsByTags (transactions) {
  const populateTransactionsFragment = document.createDocumentFragment()
  const createdTagIds = []
  let containsTags = false

  for (let i = 0, len = transactions.length; i < len; i++) {
    const userTransaction = transactions[i]
    const tags = userTransaction.tags

    // Is Empty Tags then
    if (isEmpty(tags)) {
      continue
    }

    for (let j = 0, leng = tags.length; j < leng; j++) {
      const oneTag = tags[j]

      if (!includesStr(createdTagIds, oneTag)) {
        populateTransactionsFragment.appendChild(buildTagsHeaders(oneTag))
        // Add Created Tag ID to the array
        createdTagIds.push(oneTag)
      }
      populateTransactionsFragment.getElementById('tagSB-' + oneTag).appendChild(buildTransactionRow(userTransaction, 'tagsSorted'))
    }
    // Contains Tags
    containsTags = true
  }

  // Contains Tags
  if (!containsTags) {
    populateTransactionsFragment.appendChild(buildEmptyTransactionsTab('tagInfoTable'))
  }

  // Upload to tags table
  return populateTransactionsFragment
}

// Appends the tags header for sorted transactions
function buildTagsHeaders (oneTag) {
  const docFrag = document.createDocumentFragment()
  const tagHeader = document.createElement('div')
  tagHeader.id = 'tagSB-' + oneTag
  tagHeader.setAttribute('data-target', oneTag)
  tagHeader.classList = 'tableBodyDiv tagInfoTable noselect'

  const tagTit = document.createElement('div')
  tagTit.classList = 'tagSortGrp d-table-row ml-3 font-weight-bold'

  // Title Wrapper
  const titleWrapper = document.createElement('div')
  titleWrapper.classList = 'd-table-cell text-nowrap'

  // Right Arrow
  const rightArrow = document.createElement('div')
  rightArrow.classList = 'material-icons rotateNinty'
  rightArrow.textContent = 'keyboard_arrow_right'
  titleWrapper.appendChild(rightArrow)

  // Title
  const tagTitle = document.createElement('a')
  tagTitle.id = 'tagTitle-' + oneTag
  tagTitle.classList = 'pl-4 accTitleAnchor'
  tagTitle.textContent = oneTag
  titleWrapper.appendChild(tagTitle)
  tagTit.appendChild(titleWrapper)

  // Empty Cell
  const emptyCell = document.createElement('div')
  emptyCell.classList = 'd-table-cell'
  tagTit.appendChild(emptyCell)

  // Empty Cell
  const tagBalance = document.createElement('div')
  tagBalance.classList = 'd-table-cell text-right text-nowrap pr-3'
  tagTit.appendChild(tagBalance)

  tagHeader.appendChild(tagTit)
  docFrag.appendChild(tagHeader)
  return docFrag
}
