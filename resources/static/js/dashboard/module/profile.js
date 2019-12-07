"use strict";

(function scopeWrapper($) {

	displayUserDetailsProfile();

	/**
	*  Display User Details
	**/
	function displayUserDetailsProfile() {
		// User Name
		let userName = currentUser.name + ' ' + currentUser.family_name;
		document.getElementById('userNameProfileDisplay').innerText = userName;

		// Email
		document.getElementById('emailProfileDisplay').innerText = currentUser.email;

		// 
		
	}
	
}(jQuery));	