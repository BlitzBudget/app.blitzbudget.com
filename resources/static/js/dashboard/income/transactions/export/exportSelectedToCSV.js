"use strict";
(function scopeWrapper($) {

    document.getElementById('downloadTransactionsData').addEventListener("click",function(e){
        // Check all check boxes by default
        let transactionIds = [];
        
        let allCheckedItems = $("input[type=checkbox]:checked");
        for(let i = 0, length = allCheckedItems.length; i < length; i++) {
            // To remove the select all check box values
            let transactionId = allCheckedItems[i].innerHTML;
            
            // Remove the check all from the list
            if(isEqual(allCheckedItems[i].id, 'checkAll')) {
                continue;
            }
            
            // Google Chrome Compatibility 
            if(isEmpty(transactionId)) {
                transactionId = allCheckedItems[i].childNodes[0].nodeValue; 
            }
            
            if(transactionId != "on" && isNotBlank(transactionId)){
                transactionIds.push(transactionId);
            }
        }

        transactionIds.join(",");

        // Json to csv convertor
        JSONToCSVConvertor(JSON.stringify(transactionIds), "transactions", false);

        // Successfully downloaded the excel
        showNotification('Successfully downloaded the selected transactions',window._constants.notification.success);

    });

    // Convert JSON to CSV
    function JSONToCSVConvertor(JSONData, ReportTitle, ShowLabel) {
        //If JSONData is not an object then JSON.parse will parse the JSON string in an Object
        let arrData = typeof JSONData != 'object' ? JSON.parse(JSONData) : JSONData;
        
        let CSV = '';    
        //Set Report title in first row or line
        
        CSV += ReportTitle + '\r\n\n';

        //This condition will generate the Label/Header
        if (ShowLabel) {
            let row = "";
            
            //This loop will extract the label from 1st index of on array
            for (let index in arrData[0]) {
                
                //Now convert each value to string and comma-seprated
                row += index + ',';
            }

            row = row.slice(0, -1);
            
            //append Label row with line break
            CSV += row + '\r\n';
        }
        
        //1st loop is to extract each row
        for (let i = 0; i < arrData.length; i++) {
            let row = "";
            
            //2nd loop will extract each column and convert it in string comma-seprated
            row += '"' + arrData[i] + '",';

            row.slice(0, row.length - 1);
            
            //add a line break after each row
            CSV += row + '\r\n';
        }

        if (CSV == '') {        
            showNotification('Invalid data. Please refresh and try again!',window._constants.notification.error);
            return;
        }   
        
        //Generate a file name
        let fileName = "";
        //this will remove the blank-spaces from the title and replace it with an underscore
        fileName += ReportTitle.replace(/ /g,"_");   
        
        //Initialize file format you want csv or xls
        let uri = 'data:text/csv;charset=utf-8,' + escape(CSV);
        
        // Now the little tricky part.
        // you can use either>> window.open(uri);
        // but this will not work in some browsers
        // or you will not get the correct file extension    
        
        //this trick will generate a temp <a /> tag
        let link = document.createElement("a");    
        link.href = uri;
        
        //set the visibility hidden so it will not effect on your web-layout
        link.style = "visibility:hidden";
        link.download = fileName + ".csv";
        
        //this part will append the anchor tag and remove it after automatic click
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

}(jQuery));