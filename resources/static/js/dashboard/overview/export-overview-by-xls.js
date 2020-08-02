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

        // Json to csv convertor
        downloadAsXLS(window.translationData.overview.dynamic.detailed.csvtitle);

    });

    function downloadAsXLS(fileName) {
        download(convertToXLS(), fileName + '.xls', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    }

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

    convertToXLS = function () {
        var row;
        var col;
        var xml;

        xml = emitXmlHeader();

        // Labels Header
        xml += '<ss:Row>\n';
        xml += '  <ss:Cell>\n';
        xml += '    <ss:Data ss:Type="String">';
        xml += window.translationData.overview.dynamic.detailed.label + '</ss:Data>\n';
        xml += '  </ss:Cell>\n';
        xml += '</ss:Row>\n';

        // Value Header
        xml += '<ss:Row>\n';
        xml += '  <ss:Cell>\n';
        xml += '    <ss:Data ss:Type="String">';
        xml += window.translationData.overview.dynamic.detailed.value + '</ss:Data>\n';
        xml += '  </ss:Cell>\n';
        xml += '</ss:Row>\n';

        for (let i = 0, length = window.dataSeriesForExport.labels.length; i < length; i++) {
            let value = window.dataSeriesForExport.series[i];
            let label = window.dataSeriesForExport.labels[i];

            // if series is an array then
            if (window.dataSeriesForExport.isSeriesAnArray) {
                value = window.dataSeriesForExport.series[0][i];
            }

            // Labels Value
            xml += '<ss:Row>\n';
            xml += '  <ss:Cell>\n';
            xml += '    <ss:Data ss:Type="String">';
            xml += label + '</ss:Data>\n';
            xml += '  </ss:Cell>\n';
            xml += '</ss:Row>\n';

            // Value
            xml += '<ss:Row>\n';
            xml += '  <ss:Cell>\n';
            xml += '    <ss:Data ss:Type="String">';
            xml += formatToCurrency(value) + '</ss:Data>\n';
            xml += '  </ss:Cell>\n';
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
        showNotification(window.translationData.overview.dynamic.detailed.downloadedtocsv, window._constants.notification.success);

    }

}(jQuery));
