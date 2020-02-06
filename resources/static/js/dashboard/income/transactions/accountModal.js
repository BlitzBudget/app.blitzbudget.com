"use strict";
(function scopeWrapper($) {
	let currentAccount = 0;

	// On Click Account Header display information
	$('#recTransAndAccTable').on('click', '.accountInfoTable .recentTransactionDateGrp' , function(e) {
		// Account modal id
		let accInfoTable = this.closest('.accountInfoTable');
		let accountId = lastElement(splitElement(accInfoTable.id,'-'));
		// Set the current account
		currentAccount = accountId;
		let accountModal = document.getElementById('accountInformationMdl').classList;
		// Fetch the total number of transactions for the account
		let recentTransactionEntry = accInfoTable.getElementsByClassName('recentTransactionEntry');
		// Set the number of transactions if present
		let numberOfTransactionsDiv = document.getElementById('numberOfTransInAcc');
		numberOfTransactionsDiv.innerText = isEmpty(recentTransactionEntry) ? 0 : recentTransactionEntry.length;
		// Set Account Title
		document.getElementById('accountLabelInModal').innerText = document.getElementById('accountTitle-' + accountId).innerText;
		// Account Balance Update 
		document.getElementById('accountAmountEntry').innerText = document.getElementById('accountBalance-' + accountId).innerText;
		// Toggle Account Transaction 
		let accTransEntry = this.parentNode.getElementsByClassName('accTransEntry');
		for(let i = 0, l = accTransEntry.length; i < l; i++) {
			accTransEntry[i].classList.toggle('d-none');
			accTransEntry[i].classList.toggle('d-lg-table-row');
		}
		// Open Account Modal
		document.getElementById('accountInformationMdl').classList.remove('d-none');
		// Close  Financial Position
		document.getElementsByClassName('transactions-chart')[0].classList.add('d-none');

	});

	document.getElementById('accountHeaderClose').addEventListener("click",function(e){
		// Close Account Modal
		document.getElementById('accountInformationMdl').classList.add('d-none');
		// Open  Financial Position
		document.getElementsByClassName('transactions-chart')[0].classList.remove('d-none');
	});

}(jQuery));