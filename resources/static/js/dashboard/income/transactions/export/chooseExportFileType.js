"use strict";
(function scopeWrapper($) {

	// Fetch CurrentUser
	let exportFileFormat = currentUser.exportFileFormat;
	let chosenJs = "/dashboard/income/transactions/export/exportSelectedToCSV.min.js"; 

	$.getScript( chosenJs )
	  .done(function( script, textStatus ) {
	    // Successfully downloaded the scripts
	  })
	  .fail(function( jqxhr, settings, exception ) {
	  	showNotification('Unable to fetch dependencies for export',window._constants.notification.error);
	  });


}(jQuery));