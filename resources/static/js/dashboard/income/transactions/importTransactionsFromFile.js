"use strict";
(function scopeWrapper($) {
	

	// On DRAG START (The dragstart event is fired when the user starts dragging an element or text selection.)
	$('#recTransAndAccTable').on('dragstart', '.accTransEntry' , function(e) {
		
	});

	// On DRAG END (The dragend event is fired when a drag operation is being ended (by releasing a mouse button or hitting the escape key)).
	$('#recTransAndAccTable').on('dragend', '.accTransEntry' , function(e) {
		
	});

	// On DRAG ENTER (When the dragging has entered this div) (Triggers even for all child elements)
	$('#recTransAndAccTable').on('dragenter', '.accountInfoTable' , function(e) {
		
	});

	// On DRAG OVER (The dragover event is fired when an element or text selection is being dragged over a valid drop target (every few hundred milliseconds)) (Triggers even for all child elements)
	$('#recTransAndAccTable').on('dragover', '.accountInfoTable' , function(e) {
		
	});

	// On DROP (The drop event is fired when an element or text selection is dropped on a valid drop target.)
	$('#recTransAndAccTable').on('drop', '.accountInfoTable' , function(e) {
		
	});

	// On DRAG LEAVE (only parent elements)
	document.addEventListener( "dragster:leave", function (e) {		
	});

	// On DRAG ENTER (only parent elements)
	document.addEventListener( "dragster:enter", function (e) {		
	});	

});