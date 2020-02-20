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
   		ajaxData.url = CUSTOM_DASHBOARD_CONSTANTS.overviewUrl + OVERVIEW_CONSTANTS.lifetimeUrl + OVERVIEW_CONSTANTS.networthTotalUrl + OVERVIEW_CONSTANTS.financialPortfolioId + currentUser.financialPortfolioId;
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
   			asset = minusSign + currentCurrencyPreference + formatNumber(Math.abs(asset), currentUser.locale);
        	// Minus sign for asset
   			minusSign = '';
   			// Liability less than 0
   			if(liability < 0) {
   				minusSign = '-';
   			}
   			liability = minusSign + currentCurrencyPreference + formatNumber(Math.abs(liability), currentUser.locale);
   			// Minus sign for asset
   			minusSign = '';
   			// Networth less than 0
   			if(networth < 0) {
   				minusSign = '-';
   			}
   			networth = minusSign + currentCurrencyPreference + formatNumber(Math.abs(networth), currentUser.locale);

        	// Asset Accumulated
        	document.getElementById('assetAccumuluatedAmount').innerText = asset;
        	// Debt Accumulated
        	document.getElementById('debtAccumulatedAmount').innerText = liability;
        	// Networth Accumulated
        	document.getElementById('networthAmount').innerText = networth;
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