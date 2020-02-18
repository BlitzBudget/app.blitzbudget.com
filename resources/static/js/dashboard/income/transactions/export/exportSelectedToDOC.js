"use strict";
(function scopeWrapper($) {
   let header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' "+
            "xmlns:w='urn:schemas-microsoft-com:office:word' "+
            "xmlns='http://www.w3.org/TR/REC-html40'>"+
            "<head><meta charset='utf-8'><title>Export HTML to Word Document with JavaScript</title></head><body>";

   let footer = "</body></html>";

    document.getElementById('downloadTransactionsData').addEventListener("click",function(e){
      // Export to word
      exportToWord();
    });

    // Export to Word
    function exportToWord() {
      let sourceHTML = header + getTransactionsFrag() + footer;

      let source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(sourceHTML);
      let fileDownload = document.createElement("a");
      document.body.appendChild(fileDownload);
      fileDownload.classList = 'invisible';
      fileDownload.href = source;
      fileDownload.download = 'document.doc';
      fileDownload.click();
      document.body.removeChild(fileDownload);
    }

    // Transaction Fragment
    function getTransactionsFrag() {

      // Define Transaction Obj
      let transJsonObj = {};
      
      // Update Heading for sheet
      //transJsonObj["Date"] = "Date Meant For";
      //transJsonObj["Description"] = "Description";
      //transJsonObj["Category"] = "Category Name";
      //transJsonObj["Amount"] = "Amount";
      //transJsonObj["Recurrence"] = "Recurrence";
      //transJsonObj["Account"] = "Account Id";
      //transJsonObj["Budget"] = "Budget Amount";
      
      let recentTransactionsFragment = document.createDocumentFragment();
      let allCheckedItems = $("input[type=checkbox]:checked");
      for(let i = 0, length = allCheckedItems.length; i < length; i++) {
          // To remove the select all check box values
          let transactionId = allCheckedItems[i].innerHTML;
          // Define Transaction Obj
          transJsonObj = {};
          
          // Remove the check all from the list
          if(isEqual(allCheckedItems[i].id, 'checkAll')) {
              continue;
          }
          
          // Google Chrome Compatibility 
          if(isEmpty(transactionId)) {
              transactionId = allCheckedItems[i].childNodes[0].nodeValue; 
          }
          
          if(transactionId != "on" && isNotBlank(transactionId)){
              // Fetch the transaction cached
              let transactionCached = window.transactionsCache[parseInt(transactionId)];
              // Current Category for transaction
              let currentCategory = window.categoryMap[transactionCached.categoryId];
              // Fetch the budgeted amount
              let budgetAmount = currentCurrencyPreference + formatNumber(window.userBudgetMap[transactionCached.categoryId].planned, currentUser.locale);
              // Fetch the transaction amount
              let transactionAmount = '';
              // Append a - sign if it is an expense
              if(currentCategory.parentCategory == CUSTOM_DASHBOARD_CONSTANTS.expenseCategory) {
                 transactionAmount = '-' + currentCurrencyPreference + formatNumber(transactionCached.amount, currentUser.locale);
              } else {
                 transactionAmount = currentCurrencyPreference + formatNumber(transactionCached.amount, currentUser.locale);
              }

              // Build object
              transJsonObj["Date"] = new Date(transactionCached.dateMeantFor).toString();
              transJsonObj["Description"] = transactionCached.description;
              transJsonObj["Category"] = currentCategory.categoryName;
              transJsonObj["Amount"] = transactionAmount;
              transJsonObj["Recurrence"] = transactionCached.recurrence;
              transJsonObj["Account"] = transactionCached.accountId;
              transJsonObj["Budget"] = budgetAmount;

              recentTransactionsFragment.appendChild(buildTransactionRow(transJsonObj, 'accountAggre'));
          }
      }

      return recentTransactionsFragment;
    }

    // Builds the rows for recent transactions
  function buildTransactionRow(userTransaction, idName) {
    // Convert date from UTC to user specific dates
    let creationDateUserRelevant = new Date(userTransaction.createDate);
    // Category Map 
    let categoryMapForUT = categoryMap[userTransaction.categoryId];
    
    let tableRowTransaction = document.createElement('div');
    tableRowTransaction.id = idName + '-' + userTransaction.transactionId;
    tableRowTransaction.style.letter-spacing = '0.016em';
    tableRowTransaction.style.display = 'table-row';
    
    // Cell 1
    let tableCellImagesWrapper = document.createElement('div');
    tableCellImagesWrapper.style.display =  'table-cell';
    tableCellImagesWrapper.style.verticalAlign = 'middle';
    tableCellImagesWrapper.style.borderTop = '1px solid #f6f6f6';
    tableCellImagesWrapper.style.padding = '0.25rem';
    tableCellImagesWrapper.style.textAlign = 'center';
    
    let circleWrapperDiv = document.createElement('div');
    circleWrapperDiv.style.borderRadius = '50%';
    circleWrapperDiv.style.verticalAlign = 'middle';
    circleWrapperDiv.style.background-color = '#f2f5f7';
    circleWrapperDiv.style.font-size = '16px';
    circleWrapperDiv.style.width = '48px';
    circleWrapperDiv.style.height = '48px';
    circleWrapperDiv.style.lineHeight = '48px';
    circleWrapperDiv.style.marginRight = 'auto';
    circleWrapperDiv.style.marginLeft = 'auto';
    
    // Append a - sign if it is an expense
    if(categoryMap[userTransaction.categoryId].parentCategory == CUSTOM_DASHBOARD_CONSTANTS.expenseCategory) {
      circleWrapperDiv.appendChild(creditCardSvg());
    } else {
      circleWrapperDiv.appendChild(plusRawSvg());
    }
    
    tableCellImagesWrapper.appendChild(circleWrapperDiv);
    tableRowTransaction.appendChild(tableCellImagesWrapper);
    
    // Cell 2
    let tableCellTransactionDescription = document.createElement('div');
    tableCellTransactionDescription.style.borderTop = '1px solid #f6f6f6';
    tableCellTransactionDescription.style.paddingTop = '0.25rem';
    tableCellTransactionDescription.style.display =  'table-cell';
    
    let elementWithDescription = document.createElement('div');
    elementWithDescription.style.fontWeight = '500';
    elementWithDescription.style.color = '#2e4369';
    elementWithDescription.style.letterSpacing = '0';
    elementWithDescription.style.clear = 'both';
    elementWithDescription.style.overflow = 'hidden';
    elementWithDescription.style.whiteSpace = 'nowrap';
    elementWithDescription.innerText = isEmpty(userTransaction.description) ? 'No Description' : userTransaction.description.length < 25 ? userTransaction.description : userTransaction.description.slice(0,26) + '...';
    tableCellTransactionDescription.appendChild(elementWithDescription);
    
    let elementWithCategoryName = document.createElement('div');
    elementWithCategoryName.classList = 'small categoryNameRT w-100';
    elementWithCategoryName.innerText = (categoryMapForUT.categoryName.length < 25 ? categoryMapForUT.categoryName : (categoryMapForUT.categoryName.slice(0,26) + '...')) + ' • ' + ("0" + creationDateUserRelevant.getDate()).slice(-2) + ' ' + months[creationDateUserRelevant.getMonth()].slice(0,3) + ' ' + creationDateUserRelevant.getFullYear() + ' ' + ("0" + creationDateUserRelevant.getHours()).slice(-2) + ':' + ("0" + creationDateUserRelevant.getMinutes()).slice(-2);
    tableCellTransactionDescription.appendChild(elementWithCategoryName);
    tableRowTransaction.appendChild(tableCellTransactionDescription);
    
    // Cell 3    
    let surCell = document.createElement('div');
    surCell.classList = 'd-lg-table-cell';

    let transactionAmount = document.createElement('div');
    
    // Append a - sign if it is an expense
    if(categoryMap[userTransaction.categoryId].parentCategory == CUSTOM_DASHBOARD_CONSTANTS.expenseCategory) {
      transactionAmount.classList = 'transactionAmountRT font-weight-bold text-right align-middle';
      transactionAmount.innerHTML = '-' + currentCurrencyPreference + formatNumber(userTransaction.amount, currentUser.locale);
    } else {
      transactionAmount.classList = 'transactionAmountRT font-weight-bold text-right align-middle';
      transactionAmount.innerHTML = currentCurrencyPreference + formatNumber(userTransaction.amount, currentUser.locale);
    }
    surCell.appendChild(transactionAmount);  
      
    let accountBalDiv = document.createElement('div');
    accountBalDiv.classList = 'accBalSubAmount pl-2 font-weight-bold text-right align-middle small';
    surCell.appendChild(accountBalDiv); 
    tableRowTransaction.appendChild(surCell);
    
    
    return tableRowTransaction;
    
  }
  
}(jQuery));