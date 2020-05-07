"use strict";
(function scopeWrapper($) {

    /**
	*  Add Functionality Generic + Btn
	**/

	// Register Tooltips
	let ttinit = $("#addFncTT");
	ttinit.attr('data-original-title', 'Add Goals');
	ttinit.tooltip({
		delay: { "show": 300, "hide": 100 }
    });

    // Generic Add Functionality
    let genericAddFnc = document.getElementById('genericAddFnc');
    document.getElementById('addFncTT').innerText = 'add';
    genericAddFnc.classList = 'btn btn-round btn-warning btn-just-icon bottomFixed float-right addNewGoals';
    $(genericAddFnc).unbind('click').click(function () {
    	if(!this.classList.contains('addNewGoals')) {
    		return;
    	}

    	// Create goals
		$('#goalsModal').modal('toggle');
    });

    // Fetch all bank account information
    er_a.fetchAllBankAccountInfo(function(bankAccountList) {

    });
    
}(jQuery)); 