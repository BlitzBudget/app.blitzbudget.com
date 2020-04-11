"use strict";
(function scopeWrapper($) {

	// OVERVIEW CONSTANTS
	const OVERVIEW_CONSTANTS = {};

	// SECURITY: Defining Immutable properties as constants
	Object.defineProperties(OVERVIEW_CONSTANTS, {
		'lifetimeUrl': { value:'lifetime/', writable: false, configurable: false },
		'networthTotalUrl': { value:'?accountCategories=ALL&average=true', writable: false, configurable: false },
		'financialPortfolioId': { value : '&financialPortfolioId=', writable: false, configurable: false}	
	});

	/**
	 * Populate total Asset, Liability & Networth
	 */
	
	populateTotalAssetLiabilityAndNetworth();
	
	// Populate Income Average
	function populateTotalAssetLiabilityAndNetworth() {
		// Ajax Requests on Error
		let ajaxData = {};
   		ajaxData.isAjaxReq = true;
   		ajaxData.type = 'GET';
   		ajaxData.url = CUSTOM_DASHBOARD_CONSTANTS.overviewUrl + OVERVIEW_CONSTANTS.lifetimeUrl + OVERVIEW_CONSTANTS.networthTotalUrl + OVERVIEW_CONSTANTS.financialPortfolioId + currentUser.walletId;
   		ajaxData.onSuccess = function(totalAssetAndLiab) {
   			
   			// Liability Population
   			let liability = totalAssetAndLiab.liability;
   			// Asset Population
   			let asset = totalAssetAndLiab.asset;
   			// Net worth population
   			let networth = asset + liability;
   			// Minus sign for asset
   			let minusSign = '';
   			// Asset less than 0
   			if(asset < 0) {
   				minusSign = '-';
   			}
   			// Asset Accumulated
        // Animate Value from 0 to value 
        animateValue(document.getElementById('assetAccumuluatedAmount'), 0, Math.abs(asset), minusSign + currentCurrencyPreference ,2000);

        // Minus sign for LIABILITY
   			minusSign = '';
   			// Liability less than 0
   			if(liability < 0) {
   				minusSign = '-';
   			}
        // Debt Accumulated
        // Animate Value from 0 to value 
        animateValue(document.getElementById('debtAccumulatedAmount'), 0, Math.abs(liability), minusSign + currentCurrencyPreference ,2000);

   			// Minus sign for Nteworth
   			minusSign = '';
   			// Networth less than 0
   			if(networth < 0) {
   				minusSign = '-';
   			}
        // Networth Accumulated
        // Animate Value from 0 to value 
        animateValue(document.getElementById('networthAmount'), 0, Math.abs(networth), minusSign + currentCurrencyPreference ,2000);
      
      }
      ajaxData.onFailure = function (thrownError) {
      	manageErrors(thrownError, 'Unable to populate assets, liability and total networth. Please refresh the page and try again!',ajaxData);
      }

		jQuery.ajax({
			url: ajaxData.url,
			beforeSend: function(xhr){xhr.setRequestHeader("Authorization", authHeader);},
	        type: ajaxData.type,
	        success: ajaxData.onSuccess,
	        error: ajaxData.onFailure
		});
	}

}(jQuery));