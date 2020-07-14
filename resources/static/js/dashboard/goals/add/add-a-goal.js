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
        result['target_type'] = result.targetType;
        result['monthly_contribution'] = result.monthlyContribution;
        result['goal_type'] = result.goalType;
        result['final_amount'] = result.targetAmount;
        result['preferable_target_date'] = result.targetDate;
        result.goalId = result.id;
        buildAGoal(result, displayedGoals.length);
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
