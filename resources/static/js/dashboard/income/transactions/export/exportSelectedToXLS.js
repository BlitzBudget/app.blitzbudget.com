// Test script to generate a file from JavaScript such
// that MS Excel will honor non-ASCII characters.

document.getElementById('downloadTransactionsData').addEventListener("click",function(e){
    // Check all check boxes by default
    let transactionData = [];
    
    let allCheckedItems = $("input[type=checkbox]:checked");
    for(let i = 0, length = allCheckedItems.length; i < length; i++) {
        // To remove the select all check box values
        let transactionId = allCheckedItems[i].innerHTML;
        // Define Transaction Obj
        let transJsonObj = {};
        
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
            transactionData.push(transJsonObj);
        }
    }

    transactionData.join(",");

    // Json to csv convertor
    JSONToXLSConvertor(JSON.stringify(transactionData), "transactions");

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

});

function JSONToXLSConvertor(data, fileName) {
    download(jsonToSsXml(data), fileName +'.xls', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
}

// Simple type mapping; dates can be hard
// and I would prefer to simply use `datevalue`
// ... you could even add the formula in here.
JsonObjFormat = {
    "Date": "String",
    "Description": "String",
    "Category": "String",
    "Amount": "String",
    "Recurrence": "String",
    "Account": "String",
    "Budget": "String"
};

emitXmlHeader = function () {
    return '<?xml version="1.0"?>\n' +
           '<ss:Workbook xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">\n' +
           '<ss:Worksheet ss:Name="Sheet1">\n' +
           '<ss:Table>\n\n';
};

emitXmlFooter = function() {
    return '\n</ss:Table>\n' +
           '</ss:Worksheet>\n' +
           '</ss:Workbook>\n';
};

jsonToSsXml = function (jsonObject) {
    var row;
    var col;
    var xml;
    var data = typeof jsonObject != "object" 
             ? JSON.parse(jsonObject) 
             : jsonObject;
    
    xml = emitXmlHeader();

    for (row = 0; row < data.length; row++) {
        xml += '<ss:Row>\n';
      
        for (col in data[row]) {
            xml += '  <ss:Cell>\n';
            xml += '    <ss:Data ss:Type="' + JsonObjFormat[col]  + '">';
            xml += data[row][col] + '</ss:Data>\n';
            xml += '  </ss:Cell>\n';
        }

        xml += '</ss:Row>\n';
    }
    
    xml += emitXmlFooter();
    return xml;  
};

function download (content, filename, contentType) {
    if (!contentType) contentType = 'application/octet-stream';
    var a = document.getElementById('test');
    var blob = new Blob([content], {
        'type': contentType
    });
    a.href = window.URL.createObjectURL(blob);
    a.download = filename;
    window.navigator.msSaveOrOpenBlob(blob,filename);
};