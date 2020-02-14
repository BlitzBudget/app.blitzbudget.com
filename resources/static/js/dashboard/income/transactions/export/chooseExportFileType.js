"use strict";
(function scopeWrapper($) {

	// Fetch CurrentUser
	let exportFileFormat = currentUser.exportFileFormat;

	$.getScript( "ajax/test.js" )
	  .done(function( script, textStatus ) {
	    console.log( textStatus );
	  })
	  .fail(function( jqxhr, settings, exception ) {
	    $( "div.log" ).text( "Triggered ajaxError handler." );
	});


}(jQuery));