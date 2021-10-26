'use strict';
(function scopeWrapper ($) {
  $('body').on('click', '#detailedOverviewOfChart #export-as-csv', function (e) {
    // Check if the CSV is the selected option
    if (isNotEqual(window.currentUser.exportFileFormat, 'CSV')) {
      return
    }

    if (isEmpty(window.dataSeriesForExport) || isEmpty(window.dataSeriesForExport.labels)) {
      showNotification(window.translationData.overview.dynamic.detailed.nodataavailable, window._constants.notification.error)
      return
    }

    // Json to csv convertor
    downloadAsCSV(window.dataSeriesForExport, window.translationData.overview.dynamic.detailed.csvtitle, true)
  })

  // Convert JSON to CSV
  function downloadAsCSV (dataSeries, ReportTitle, ShowLabel) {
    let CSV = ''
    let totalWhatever = 0
    // Set Report title in first row or line

    CSV += ReportTitle + '\r\n\n'

    // This condition will generate the Label/Header
    if (ShowLabel) {
      let row = ''

      // Now convert each value to string and comma-seprated
      row += '"' + window.translationData.overview.dynamic.detailed.label + '","' +
                window.translationData.overview.dynamic.detailed.value + '"'

      // append Label row with line break
      CSV += row + '\r\n'
    }

    // 1st loop is to extract each row
    for (let i = 0; i < dataSeries.labels.length; i++) {
      let row = ''
      let value = dataSeries.series[i]
      const label = dataSeries.labels[i]

      // if series is an array then
      if (dataSeries.isSeriesAnArray) {
        value = dataSeries.series[0][i]
      }

      // 2nd loop will extract each column and convert it in string comma-seprated
      row += '"' + label + '","' +
                formatToCurrency(value) + '"'

      row.slice(0, row.length - 1)

      // Calculate Average Spent
      totalWhatever += value

      // add a line break after each row
      CSV += row + '\r\n'
    }

    if (CSV == '') {
      showNotification(window.translationData.overview.dynamic.detailed.invaliddata, window._constants.notification.error)
      return
    }

    // Total Whatever
    const row = '"' + window.translationData.overview.dynamic.detailed.total + '","' +
            formatToCurrency(totalWhatever) + '"'
    row.slice(0, row.length - 1)
    // add a line break after each row
    CSV += row + '\r\n'

    // Generate a file name
    let fileName = ''
    // this will remove the blank-spaces from the title and replace it with an underscore
    fileName += ReportTitle.replace(/ /g, '_')

    // Initialize file format you want csv or xls
    const uri = 'data:text/csv;charset=utf-8,' + escape(CSV)

    // Now the little tricky part.
    // you can use either>> window.open(uri);
    // but this will not work in some browsers
    // or you will not get the correct file extension

    // this trick will generate a temp <a /> tag
    const link = document.createElement('a')
    link.href = uri

    // set the visibility hidden so it will not effect on your web-layout
    link.classList = 'invisible'
    link.download = fileName + '.csv'

    // this part will append the anchor tag and remove it after automatic click
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    // Successfully downloaded content
    succesfullyDownloadedContent()
  }

  // Revert back to sort by functionality
  function succesfullyDownloadedContent () {
    // Successfully downloaded the excel
    showNotification(window.translationData.overview.dynamic.detailed.downloadedtocsv, window._constants.notification.success)
  }
}(jQuery))
