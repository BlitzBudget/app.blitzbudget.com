"use strict";
(function scopeWrapper($) {

	// On DRAG START Account transaction display information
	$('#recTransAndAccTable').on('dragstart', '.accTransEntry' , function(e) {
		handleDragStart(this);
	});

	function handleDragStart(e) {
	  e.classList.add('op-50');  // this / e.target is the source node.
	}

	// On DRAG START Account transaction display information
	$('#recTransAndAccTable').on('dragenter', '.accTransEntry' , function(e) {
		handleDragEnter(this);
	});

	function handleDragEnter(e) {
	  // this / e.target is the current hover target.
	  e.classList.add('dragStarted');
	}

	// On DRAG START Account transaction display information
	$('#recTransAndAccTable').on('dragleave', '.accTransEntry' , function(e) {
		handleDragLeave(this);
	});

	function handleDragLeave(e) {
	  e.classList.remove('dragStarted');  // this / e.target is previous target element.
	}


	function handleDrop(e) {
	  // this / e.target is current target element.

	  if (e.stopPropagation) {
	    e.stopPropagation(); // stops the browser from redirecting.
	  }

	  // See the section on the DataTransfer object.

	  return false;
	}

	function handleDragEnd(e) {
	  // this/e.target is the source node.
	 
	}

}(jQuery));