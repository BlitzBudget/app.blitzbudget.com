"use strict";
(function scopeWrapper($) {

	// On Click Account Header display information
	$('#recTransAndAccTable').on('click', '.accountInfoTable .recentTransactionDateGrp' , function(e) {
		// TODO account modal
		let accountId = lastElement(splitElement(this.id,'-'));
		let accountModal = document.getElementById('accountInformationMdl').classList;
		// Toggle account modal
		accountModal.toggle('d-none');
		accountModal.toggle('accountModalShown');
		// Toggle  Financial Position
		let financialPositionDiv = document.getElementsByClassName('transactions-chart');
		financialPositionDiv[0].classList.remove('d-none');
		// Toggle Account Transaction 
		let accTransEntry = this.parentNode.getElementsByClassName('accTransEntry');
		for(let i = 0, l = accTransEntry.length; i < l; i++) {
			accTransEntry[i].classList.toggle('d-none');
			accTransEntry[i].classList.toggle('d-lg-table-row');
		}

	});

}(jQuery));