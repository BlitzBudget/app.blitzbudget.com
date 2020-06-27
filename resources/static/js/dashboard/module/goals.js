"use strict";
(function scopeWrapper($) {

    /**
     * START loading the page
     *
     */
    let currentPageInCookie = er.getCookie('currentPage');
    if (isEqual(currentPageInCookie, 'goalsPage')) {
        if (isEqual(window.location.href, window._config.app.invokeUrl)) {
            populateCurrentPage('goalsPage');
        }
    }

    /*
     * On Click goals
     */
    let goalsPage = document.getElementById('goalsPage');
    if (isNotEmpty(settingsPage)) {
        goalsPage.addEventListener("click", function (e) {
            populateCurrentPage('goalsPage');
        });
    }

    function populateCurrentPage(page) {
        er.refreshCookiePageExpiry(page);
        er.fetchCurrentPage('/goals', function (data) {
            // Load the new HTML
            $('#mutableDashboard').html(data);
            // Translate current Page
            translatePage(getLanguage());
            // Set Current Page
            let currentPage = document.getElementById('currentPage');
            currentPage.setAttribute('data-i18n', 'goals.page.title');
            currentPage.textContent = 'Goals';
        });

        /**
         *  Add Functionality Generic + Btn
         **/

        // Register Tooltips
        let ttinit = $("#addFncTT");
        ttinit.attr('data-original-title', 'Add Goals');
        ttinit.tooltip({
            delay: {
                "show": 300,
                "hide": 100
            }
        });

        // Generic Add Functionality
        let genericAddFnc = document.getElementById('genericAddFnc');
        document.getElementById('addFncTT').textContent = 'add';
        genericAddFnc.classList = 'btn btn-round btn-warning btn-just-icon bottomFixed float-right addNewGoals';
        $(genericAddFnc).unbind('click').click(function () {
            if (!this.classList.contains('addNewGoals')) {
                return;
            }

            // Create goals
            $('#addGoals').modal('toggle');
        });
    }

    /*
     * On Click Choose a goal
     */
    $('body').on("click", "#addGoals .chooseable", function (event) {
        let target = this.dataset.target;
        switch (target) {
            case "save-for-emergency":
                document.getElementById('choose-a-goal').classList.add('d-none');
                break;
            default:
                break;
        }
    });

}(jQuery));
