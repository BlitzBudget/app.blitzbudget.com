"use strict";
(function scopeWrapper($) {
	let dragSrcEl = null;

	// On DRAG START Account transaction display information
	$('#recTransAndAccTable').on('dragstart', '.accTransEntry' , function(e) {
		handleDragStart(this);
	});

	function handleDragStart(e) {
		// this / e.target is the source node.
	  	e.classList.add('op-50');
	  	// Set the drag start element
	  	dragSrcEl = e;
	  	e.dataTransfer.effectAllowed = 'move';
	  	e.dataTransfer.dropEffect = 'move';
 	 	e.dataTransfer.setData('text/plain', e.target.id);
	}

	

	function handleDrop(e) {
	  // this or e.target is current target element.
	  e.preventDefault();

	  if (e.stopPropagation) {
	  	// stops the browser from redirecting.
	    e.stopPropagation(); 
	  }

	  // Don't do anything if dropping the same column we're dragging.
	  if (dragSrcEl != this) {
	    // Set the source column's HTML to the HTML of the column we dropped on.
	    let a = document.getElementById(e.dataTransfer.getData('text/plain'));
	    e.appendChild(a);
	  }

	  return false;
	}

	function handleDragEnd(e) {
	  // this/e.target is the source node.
	 
	}

}(jQuery));