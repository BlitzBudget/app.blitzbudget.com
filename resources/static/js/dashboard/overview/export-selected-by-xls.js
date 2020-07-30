// Script to generate a file from JavaScript such
// that MS Excel will honor non-ASCII characters.
"use strict";
(function scopeWrapper($) {
    $('body').on('click', '#detailedOverviewOfChart #export-as-csv', function (e) {

        // Check if the CSV is the selected option
        if (isNotEqual(window.currentUser.exportFileFormat, 'XLS')) {
            return;
        }

        if (isEmpty(window.dataSeriesForExport) || isEmpty(window.dataSeriesForExport.labels)) {
            showNotification(window.translationData.overview.dynamic.detailed.nodataavailable, window._constants.notification.error);
            return;
        }

        // Define Transaction Obj
        let transJsonObj = {};
        // Check all check boxes by default
        let transactionData = [];
        // Update Heading for sheet
        transJsonObj["Label"] = "Label";
        transJsonObj["Value"] = "Value";
        transactionData.push(transJsonObj);

        let allCheckedItems = $("input[type=checkbox]:checked");
        for (let i = 0, length = window.dataSeriesForExport.labels.length; i < length; i++) {
            let value = window.dataSeriesForExport.series[i];
            let label = window.dataSeriesForExport.labels[i];

            // Build object
            transJsonObj["Label"] = label;
            transJsonObj["Value"] = value;
            transactionData.push(transJsonObj);

        }

        transactionData.join(",");

        // Json to csv convertor
        JSONToXLSConvertor(JSON.stringify(transactionData), "transactions");

    });

    function JSONToXLSConvertor(data, fileName) {
        download(jsonToSsXml(data), fileName + '.xls', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
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

    emitXmlFooter = function () {
        return '\n</ss:Table>\n' +
            '</ss:Worksheet>\n' +
            '</ss:Workbook>\n';
    };

    jsonToSsXml = function (jsonObject) {
        var row;
        var col;
        var xml;
        var data = typeof jsonObject != "object" ?
            JSON.parse(jsonObject) :
            jsonObject;

        xml = emitXmlHeader();

        for (row = 0; row < data.length; row++) {
            xml += '<ss:Row>\n';

            for (col in data[row]) {
                xml += '  <ss:Cell>\n';
                xml += '    <ss:Data ss:Type="' + JsonObjFormat[col] + '">';
                xml += data[row][col] + '</ss:Data>\n';
                xml += '  </ss:Cell>\n';
            }

            xml += '</ss:Row>\n';
        }

        xml += emitXmlFooter();
        return xml;
    };

    // Download the excel
    function download(content, filename, contentType) {
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
        showNotification('Successfully downloaded the selected transactions', window._constants.notification.success);

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
