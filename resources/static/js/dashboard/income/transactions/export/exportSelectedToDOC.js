"use strict";
(function scopeWrapper($) {
   let header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' "+
            "xmlns:w='urn:schemas-microsoft-com:office:word' "+
            "xmlns='http://www.w3.org/TR/REC-html40'>"+
            "<head><meta charset='utf-8'><title>Export HTML to Word Document with JavaScript</title></head><body>";

   let footer = "</body></html>";

    document.getElementById('downloadTransactionsData').addEventListener("click",function(e){
      // Export to word
      exportToWord();
    });

    function exportToWord() {
      let sourceHTML = header+document.getElementById("productsJson").innerHTML+footer;

      let source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(sourceHTML);
      let fileDownload = document.createElement("a");
      document.body.appendChild(fileDownload);
      fileDownload.classList = 'invisible';
      fileDownload.href = source;
      fileDownload.download = 'document.doc';
      fileDownload.click();
      document.body.removeChild(fileDownload);
    }
}(jQuery));