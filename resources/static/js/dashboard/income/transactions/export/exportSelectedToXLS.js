// Script to generate a file from JavaScript such
// that MS Excel will honor non-ASCII characters.
"use strict";
(function scopeWrapper($) {
    $('body').on('click', '#downloadTransactionsData' , function(e) {
        // Define Transaction Obj
        let transJsonObj = {};
        // Check all check boxes by default
        let transactionData = [];
        // Update Heading for sheet
        transJsonObj["Date"] = "Date Meant For";
        transJsonObj["Description"] = "Description";
        transJsonObj["Category"] = "Category Name";
        transJsonObj["Amount"] = "Amount";
        transJsonObj["Recurrence"] = "Recurrence";
        transJsonObj["Account"] = "Account Id";
        transJsonObj["Budget"] = "Budget Amount";
        transactionData.push(transJsonObj);
        
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
                let budgetCategory = window.userBudgetMap[transactionCached.categoryId];
                let budgetAmount = isNotEmpty(budgetCategory) ? formatToCurrency(budgetCategory.planned) : formatToCurrency(0);
                // Fetch the transaction amount
                let transactionAmount = '';
                // Append a - sign if it is an expense
                if(currentCategory.type == CUSTOM_DASHBOARD_CONSTANTS.expenseCategory) {
                   transactionAmount = formatToCurrency(transactionCached.amount);
                } else {
                   transactionAmount = formatToCurrency(transactionCached.amount);
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
               '<ss:Worksheet ss:Name="transactions">\n' +
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

    // Download the excel
    function download (content, filename, contentType) {
        if (!contentType) contentType = 'application/octet-stream';
        let elem = document.createElement('a');
        let blob = new Blob([content], {
            'type': contentType
        });
        elem.href = window.URL.createObjectURL(blob);
        elem.classList = 'invisible';
        elem.download = filename;
        document.body.appendChild(elem);
        elem.click();        
        window.URL.revokeObjectURL(blob);
        document.body.removeChild(elem);
        // Successfully downloaded content
        succesfullyDownloadedContent();
    };

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