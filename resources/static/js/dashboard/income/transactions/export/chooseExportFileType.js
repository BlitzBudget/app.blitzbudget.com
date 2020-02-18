"use strict";
(function scopeWrapper($) {

	// Fetch CurrentUser
	let exportFileFormat = currentUser.exportFileFormat;
	let chosenJs = "/js/dashboard/income/transactions/export/exportSelectedToCSV.min.js"; 

	// XLS format
	if(isEqual(exportFileFormat , 'XLS')) {
		chosenJs = "/js/dashboard/income/transactions/export/exportSelectedToXLS.min.js";
	} else if (isEqual(exportFileFormat , 'DOCX')) {
		chosenJs = "/js/dashboard/income/transactions/export/exportSelectedToDOCX.min.js";
	}

	$.getScript( chosenJs )
	  .done(function( script, textStatus ) {
	    // Successfully downloaded the scripts
	  })
	  .fail(function( jqxhr, settings, exception ) {
	  	showNotification('Unable to fetch dependencies for export',window._constants.notification.error);
	  });


}(jQuery));