"use strict";
(function scopeWrapper($) {

	// On Click Account Header display information
	$('#recTransAndAccTable').on('click', '.accountInfoTable .recentTransactionDateGrp' , function(e) {
		// Account modal id
		let accountId = lastElement(splitElement(this.id,'-'));
		let accountModal = document.getElementById('accountInformationMdl').classList;
		let recentTransactionEntry = this.getElementsByClassName('recentTransactionEntry');
		// Set the number of transactions if present
		let numberOfTransactionsDiv = document.getElementById('numberOfTransInAcc');
		numberOfTransactionsDiv.innerText = isEmpty(recentTransactionEntry) ? 0 : recentTransactionEntry.length;
		// Set Account Title
		document.getElementById('accountLabelInModal').innerText = document.getElementById('accountTitle-' + accountId).innerText;
		// Account Balance Update 
		document.getElementById('accountAmountModal').innerText = document.getElementById('accountBalance-' + accountId).innerText;
		// Toggle Account Transaction 
		let accTransEntry = this.parentNode.getElementsByClassName('accTransEntry');
		for(let i = 0, l = accTransEntry.length; i < l; i++) {
			accTransEntry[i].classList.toggle('d-none');
			accTransEntry[i].classList.toggle('d-lg-table-row');
		}

	});

}(jQuery));