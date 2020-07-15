/*
 * Add a goal
 */
function addAGoal(values) {

    // Ajax Requests on Error
    let ajaxData = {};
    ajaxData.isAjaxReq = true;
    ajaxData.type = "PUT";
    ajaxData.url = window._config.api.invokeUrl + window._config.api.goals;
    ajaxData.dataType = "json";
    ajaxData.contentType = "application/json;charset=UTF-8";
    ajaxData.data = JSON.stringify(values);
    ajaxData.onSuccess = function (result) {
        /*
         * Build a goal
         */
        let displayedGoals = document.getElementsByClassName('displayed-goals');
        // Build Result
        result['target_type'] = result['body-json'].targetType;
        result['monthly_contribution'] = result['body-json'].monthlyContribution;
        result['goal_type'] = result['body-json'].goalType;
        result['final_amount'] = result['body-json'].targetAmount;
        result['preferable_target_date'] = result['body-json'].targetDate;
        result.goalId = result['body-json'].id;
        // Remove goals
        let emptyGoals = document.getElementById('empty-goal');
        if (isNotEmpty(emptyGoals)) {
            $(emptyGoals).fadeOut('slow', function () {
                // Fadeout and remove goals
                this.remove();
            });
        }
        // Display a goal
        let goalDisplayed = document.getElementById('goal-displayed');
        goalDisplayed.appendChild(buildAGoal(result, displayedGoals.length));
    }
    ajaxData.onFailure = function (thrownError) {
        manageErrors(thrownError, window.translationData.transactions.dynamic.get.unableerror, ajaxData);
    }

    $.ajax({
        type: ajaxData.type,
        url: ajaxData.url,
        beforeSend: function (xhr) {
            xhr.setRequestHeader("Authorization", authHeader);
        },
        dataType: ajaxData.dataType,
        contentType: ajaxData.contentType,
        data: ajaxData.data,
        success: ajaxData.onSuccess,
        error: ajaxData.onFailure
    });

    // Create goals
    $('#addGoals').modal('toggle');

}
