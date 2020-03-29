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
      // Trigger Successfully downloaded content
      succesfullyDownloadedContent();
    }

    // Transaction Fragment
    function getTransactionsFrag() {

      // Define Transaction Obj
      let transJsonObj = {};
      
      let recentTransactionsFragment = document.createDocumentFragment();
      // Append headers
      recentTransactionsFragment.appendChild(buildAccountHeader());
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
            recentTransactionsFragment.appendChild(buildTransactionRow(transactionCached, 'accountAggre'));
          }
      }

      // To fetch the INNER HTML
      let wrapperDiv = document.createElement('div');
      // DOC fragment do not have inner HTML
      wrapperDiv.appendChild(recentTransactionsFragment);
      return wrapperDiv.innerHTML;
    }

    // Appends the date header for recent transactions
   function buildAccountHeader() {
      let accountHeader = document.createElement('div');

      let accountTit = document.createElement('div');
      accountTit.style.display = 'table-row';

      // Empty Cell
      let emptyCell = document.createElement('div');
      emptyCell.style.display =  'table-cell';
      accountTit.appendChild(emptyCell);

      // Title
      let accountTitle = document.createElement('a');
      accountTitle.style.display =  'table-cell';
      accountTitle.innerText = 'Description';
      accountTit.appendChild(accountTitle);


      // Account Balance
      let transactionAmount = document.createElement('div');
      transactionAmount.style.display =  'table-cell';
      transactionAmount.style.verticalAlign = 'middle';
      transactionAmount.style.borderTop = '1px solid #f6f6f6';
      transactionAmount.style.paddingTop = '0.25rem';
      transactionAmount.style.paddingRight = '1rem';
      transactionAmount.style.fontWeight = '500';
      transactionAmount.style.textAlign = 'right';
      transactionAmount.innerText = 'Transaction Amount'
      accountTit.appendChild(transactionAmount);

      accountHeader.appendChild(accountTit);
      return accountHeader;
   }

   // Builds the rows for recent transactions
   function buildTransactionRow(userTransaction, idName) {
    // Convert date from UTC to user specific dates
    let creationDateUserRelevant = new Date(userTransaction.createDate);
    // Category Map 
    let categoryMapForUT = categoryMap[userTransaction.categoryId];
    
    let tableRowTransaction = document.createElement('div');
    tableRowTransaction.style.letterSpacing = '0.016em';
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
    circleWrapperDiv.style.backgroundColor = '#f2f5f7';
    circleWrapperDiv.style.fontSize = '16px';
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
    elementWithCategoryName.style.fontSize = '80%';
    elementWithCategoryName.style.marginBottom = '0';
    elementWithCategoryName.style.color = '#5d7079';
    elementWithCategoryName.style.width = '100%';
    elementWithCategoryName.innerText = (categoryMapForUT.categoryName.length < 25 ? categoryMapForUT.categoryName : (categoryMapForUT.categoryName.slice(0,26) + '...')) + ' • ' + ("0" + creationDateUserRelevant.getDate()).slice(-2) + ' ' + months[creationDateUserRelevant.getMonth()].slice(0,3) + ' ' + creationDateUserRelevant.getFullYear() + ' ' + ("0" + creationDateUserRelevant.getHours()).slice(-2) + ':' + ("0" + creationDateUserRelevant.getMinutes()).slice(-2);
    tableCellTransactionDescription.appendChild(elementWithCategoryName);
    tableRowTransaction.appendChild(tableCellTransactionDescription);
    
    // Cell 3    
    let surCell = document.createElement('div');
    surCell.style.display =  'table-cell';

    let transactionAmount = document.createElement('div');
    transactionAmount.style.verticalAlign = 'middle';
    transactionAmount.style.borderTop = '1px solid #f6f6f6';
    transactionAmount.style.paddingTop = '0.25rem';
    transactionAmount.style.paddingRight = '1rem';
    transactionAmount.style.fontWeight = '500';
    transactionAmount.style.textAlign = 'right';
    
    // Append a - sign if it is an expense
    if(categoryMap[userTransaction.categoryId].parentCategory == CUSTOM_DASHBOARD_CONSTANTS.expenseCategory) {
      transactionAmount.innerHTML = '-' + currentCurrencyPreference + formatNumber(userTransaction.amount, currentUser.locale);
    } else {
      transactionAmount.innerHTML = currentCurrencyPreference + formatNumber(userTransaction.amount, currentUser.locale);
    }
    surCell.appendChild(transactionAmount);  
      
    let accountBalDiv = document.createElement('div');
    accountBalDiv.style.color = '#bfbfbf';
    accountBalDiv.style.paddingLeft = '0.5rem';
    accountBalDiv.style.fontWeight = '500';
    accountBalDiv.style.textAlign = 'right';
    accountBalDiv.style.verticalAlign = 'middle';
    accountBalDiv.style.fontSize = '80%';
    surCell.appendChild(accountBalDiv); 
    tableRowTransaction.appendChild(surCell);
    
    
    return tableRowTransaction;
    
   }

   // Credit card SVG Image
   function creditCardSvg() {
      let svgElement = document.createElementNS("http://www.w3.org/2000/svg", 'svg');
      svgElement.setAttribute('style','vertical-align: middle;');
      svgElement.setAttribute('x','0px');
      svgElement.setAttribute('y','0px');
      svgElement.setAttribute('width','30');
      svgElement.setAttribute('height','30');
      svgElement.setAttribute('viewBox','0 0 80 80');
      svgElement.setAttribute('fill','#000000');
      
      let pathElement = document.createElementNS("http://www.w3.org/2000/svg", 'path');
      pathElement.setAttribute('style','line-height:normal;text-indent:0;text-align:start;text-decoration-line:none;text-decoration-style:solid;text-decoration-color:#000;text-transform:none;block-progression:tb;isolation:auto;mix-blend-mode:normal');
      pathElement.setAttribute('d','M 11 16 C 8.2504839 16 6 18.250484 6 21 L 6 59 C 6 61.749516 8.2504839 64 11 64 L 69 64 C 71.749516 64 74 61.749516 74 59 L 74 21 C 74 18.250484 71.749516 16 69 16 L 11 16 z M 11 18 L 69 18 C 70.668484 18 72 19.331516 72 21 L 72 26 L 8 26 L 8 21 C 8 19.331516 9.3315161 18 11 18 z M 8 30 L 72 30 L 72 59 C 72 60.668484 70.668484 62 69 62 L 11 62 C 9.3315161 62 8 60.668484 8 59 L 8 30 z M 12 35 A 1 1 0 0 0 11 36 A 1 1 0 0 0 12 37 A 1 1 0 0 0 13 36 A 1 1 0 0 0 12 35 z M 16 35 A 1 1 0 0 0 15 36 A 1 1 0 0 0 16 37 A 1 1 0 0 0 17 36 A 1 1 0 0 0 16 35 z M 20 35 A 1 1 0 0 0 19 36 A 1 1 0 0 0 20 37 A 1 1 0 0 0 21 36 A 1 1 0 0 0 20 35 z M 24 35 A 1 1 0 0 0 23 36 A 1 1 0 0 0 24 37 A 1 1 0 0 0 25 36 A 1 1 0 0 0 24 35 z M 28 35 A 1 1 0 0 0 27 36 A 1 1 0 0 0 28 37 A 1 1 0 0 0 29 36 A 1 1 0 0 0 28 35 z M 32 35 A 1 1 0 0 0 31 36 A 1 1 0 0 0 32 37 A 1 1 0 0 0 33 36 A 1 1 0 0 0 32 35 z M 36 35 A 1 1 0 0 0 35 36 A 1 1 0 0 0 36 37 A 1 1 0 0 0 37 36 A 1 1 0 0 0 36 35 z M 52 43 C 48.145666 43 45 46.145666 45 50 C 45 53.854334 48.145666 57 52 57 C 53.485878 57 54.862958 56.523344 55.996094 55.730469 A 7 7 0 0 0 60 57 A 7 7 0 0 0 67 50 A 7 7 0 0 0 60 43 A 7 7 0 0 0 55.990234 44.265625 C 54.858181 43.47519 53.483355 43 52 43 z M 52 45 C 52.915102 45 53.75982 45.253037 54.494141 45.681641 A 7 7 0 0 0 53 50 A 7 7 0 0 0 54.498047 54.314453 C 53.762696 54.74469 52.916979 55 52 55 C 49.226334 55 47 52.773666 47 50 C 47 47.226334 49.226334 45 52 45 z');
      
      svgElement.appendChild(pathElement);
      
      return svgElement;
      
   }

   // Raw Plus Svg
   function plusRawSvg() {
      let svgElement = document.createElementNS("http://www.w3.org/2000/svg", 'svg');
      svgElement.setAttribute('style','vertical-align: middle;');
      svgElement.setAttribute('x','0px');
      svgElement.setAttribute('y','0px');
      svgElement.setAttribute('width','24');
      svgElement.setAttribute('height','24');
      svgElement.setAttribute('viewBox','0 0 25 29');
      svgElement.setAttribute('fill','#000000');
      
      let pathElement = document.createElementNS("http://www.w3.org/2000/svg", 'path');
      pathElement.setAttribute('style','line-height:normal;text-indent:0;text-align:start;text-decoration-line:none;text-decoration-style:solid;text-decoration-color:#000;text-transform:none;block-progression:tb;isolation:auto;mix-blend-mode:normal');
      pathElement.setAttribute('overflow','visible');
      pathElement.setAttribute('white-space','normal');
      pathElement.setAttribute('font-family','sans-serif');
      pathElement.setAttribute('font-weight','400');
      pathElement.setAttribute('d','M 11 2 L 11 11 L 2 11 L 2 13 L 11 13 L 11 22 L 13 22 L 13 13 L 22 13 L 22 11 L 13 11 L 13 2 Z');
      
      svgElement.appendChild(pathElement);
      
      return svgElement;
   }

   // Revert back to sort by functionality
   function succesfullyDownloadedContent() {
      // Successfully downloaded the excel
      showNotification('Successfully downloaded the selected transactions',window._constants.notification.success);

      // Hide the export button in conjunction with delete button
      let expDataCL = document.getElementById('exportData').classList;
      expDataCL.add('d-none');
      expDataCL.remove('d-inline-block');

      // show the Sort Options wrapper
      let sortOptionsWrapper = document.getElementById('sortOptionsWrapper').classList;
      sortOptionsWrapper.remove('d-none');
      sortOptionsWrapper.add('d-inline-block');
   }
  
}(jQuery));