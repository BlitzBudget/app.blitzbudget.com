"use strict";
(function scopeWrapper($) {
    /*
     * On Click Choose a goal
     */
    $('body').on("click", "#addGoals .chooseable", function (event) {
        let target = this.dataset.target;
        switch (target) {
            case "save-for-emergency":
                saveForEmergency();
                break;
            case "pay-off-credit-card":
                payOffCreditCard();
                break;
            case "pay-off-loans":
                payOffLoans();
                break;
            case "save-for-retirement":
                saveForRetirement()
                break;
            case "buy-a-home":
                buyAHome();
                break;
            case "buy-an-automobile":
                buyAnAutomobile();
                break;
            case "save-for-college":
                saveForCollege();
                break;
            case "take-a-trip":
                takeATrip();
                break;
            case "improve-my-home":
                improveMyHome();
                break;
            case "create-a-custom-goal":
                createACustomGoal();
                break;
            default:
                break;
        }
    });

    /*
     * Save for Emergency
     */
    function saveForEmergency() {
        document.getElementById('choose-a-goal').classList.add('d-none');
        document.getElementById('choose-goal-title').textContent = window.translationData ? window.translationData.goals.choose.emergency.title : "Save for an emergency";
        document.getElementById('save-for-emergency').classList.remove('d-none');
        document.getElementById('choose-goal-footer').classList.remove('d-none');
        // Focus the avergae expense input on click save for emergency
        document.getElementById('average-expense-emergency').focus();
        // choose month for emergency
        document.getElementById('choose-month-title').textContent = window.months[window.today.getMonth()];
        document.getElementById('choose-month-title').setAttribute('data-selected', (Number(window.today.getMonth()) + 1));
        // Choose year for emergency
        document.getElementById('choose-year-title').textContent = this.dataset.year;
        document.getElementById('choose-year-title').setAttribute('data-selected', this.dataset.year);
    }

    /*
     * Pay off credit cards
     */
    function payOffCreditCard() {
        document.getElementById('choose-a-goal').classList.add('d-none');
        document.getElementById('pay-off-credit-card').classList.remove('d-none');
        document.getElementById('choose-goal-title').textContent = window.translationData ? window.translationData.goals.choose.creditcard.title : "Pay off credit card";
        document.getElementById('choose-goal-footer').classList.remove('d-none');
    }

    /*
     * Pay off loans
     */
    function payOffLoans() {
        document.getElementById('choose-a-goal').classList.add('d-none');
        document.getElementById('pay-off-loans').classList.remove('d-none');
        document.getElementById('choose-goal-title').textContent = window.translationData ? window.translationData.goals.choose.loans.title : "Pay off loans";
        document.getElementById('choose-goal-footer').classList.remove('d-none');
    }

    /*
     * Save for Retirement
     */
    function saveForRetirement() {
        document.getElementById('choose-a-goal').classList.add('d-none');
        document.getElementById('save-for-retirement').classList.remove('d-none');
        document.getElementById('choose-goal-title').textContent = window.translationData ? window.translationData.goals.choose.retirement.title : "Save for retirement";
        document.getElementById('choose-goal-footer').classList.remove('d-none');
    }

    /*
     * Buy a home
     */
    function buyAHome() {
        document.getElementById('choose-a-goal').classList.add('d-none');
        document.getElementById('buy-a-home').classList.remove('d-none');
        document.getElementById('choose-goal-title').textContent = window.translationData ? window.translationData.goals.choose.home.title : "Buy a home";
        document.getElementById('choose-goal-footer').classList.remove('d-none');
    }

    /*
     * Buy an automobile
     */
    function buyAnAutomobile() {
        document.getElementById('choose-a-goal').classList.add('d-none');
        document.getElementById('buy-an-automobile').classList.remove('d-none');
        document.getElementById('choose-goal-title').textContent = window.translationData ? window.translationData.goals.choose.automobile.title : "Buy an automobile";
        document.getElementById('choose-goal-footer').classList.remove('d-none');
    }

    /*
     * Take a trip
     */
    function takeATrip() {
        document.getElementById('choose-a-goal').classList.add('d-none');
        document.getElementById('take-a-trip').classList.remove('d-none');
        document.getElementById('choose-goal-title').textContent = window.translationData ? window.translationData.goals.choose.trip.title : "Take a trip";
        document.getElementById('choose-goal-footer').classList.remove('d-none');
    }

    /*
     * Improve my home
     */
    function improveMyHome() {
        document.getElementById('choose-a-goal').classList.add('d-none');
        document.getElementById('improve-my-home').classList.remove('d-none');
        document.getElementById('choose-goal-title').textContent = window.translationData ? window.translationData.goals.choose.improve.title : "Improve my home";
        document.getElementById('choose-goal-footer').classList.remove('d-none');
    }

    /*
     * Create a custom goal
     */
    function createACustomGoal() {
        document.getElementById('choose-a-goal').classList.add('d-none');
        document.getElementById('create-a-custom-goal').classList.remove('d-none');
        document.getElementById('choose-goal-title').textContent = window.translationData ? window.translationData.goals.choose.custom.title : "Create a custom goal";
        document.getElementById('choose-goal-footer').classList.remove('d-none');
    }

    /*
     * Save for College
     */
    function saveForCollege() {
        document.getElementById('choose-a-goal').classList.add('d-none');
        document.getElementById('save-for-college').classList.remove('d-none');
        document.getElementById('choose-goal-title').textContent = window.translationData ? window.translationData.goals.choose.college.title : "Save for college";
        document.getElementById('choose-goal-footer').classList.remove('d-none');
    }

    /*
     * Click Back Button
     */
    $('body').on("click", "#back-goals", function (event) {
        document.getElementById('choose-a-goal').classList.remove('d-none');
        document.getElementById('save-for-emergency').classList.add('d-none');
        document.getElementById('pay-off-credit-card').classList.add('d-none');
        document.getElementById('pay-off-loans').classList.add('d-none');
        document.getElementById('save-for-retirement').classList.add('d-none');
        document.getElementById('buy-a-home').classList.add('d-none');
        document.getElementById('buy-an-automobile').classList.add('d-none');
        document.getElementById('save-for-college').classList.add('d-none');
        document.getElementById('take-a-trip').classList.add('d-none');
        document.getElementById('improve-my-home').classList.add('d-none');
        document.getElementById('create-a-custom-goal').classList.add('d-none');
        document.getElementById('choose-goal-footer').classList.add('d-none');
        document.getElementById('choose-goal-title').textContent = window.translationData ? window.translationData.goals.choose.title : "Choose a goal";
    });

}(jQuery));
