"use strict";
(function scopeWrapper($) {
    document.getElementById('downloadTransactionsData').addEventListener("click",function(e){
      // Export to word
      exportToWord();
    });

    function exportToWord() {
      var link, blob, url;
      blob = new Blob(['\ufeff', document.getElementById("productsJson").innerHTML], {
            type: 'application/msword'
      });
      url = URL.createObjectURL(blob);
      link = document.createElement('a');
      link.classList = 'invisible';
      link.href = url;
      link.download = 'transactions';  // default name without extension 
      document.body.appendChild(link);
      if (navigator.msSaveOrOpenBlob )
           navigator.msSaveOrOpenBlob( blob, 'transactions.docx'); // IE10-11
      else link.click();  // other browsers
      document.body.removeChild(link);
    };
}(jQuery));