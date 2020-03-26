window._config = {
    cognito: {
        userPoolId: 'eu-west-1_cjfC8qNiB', // e.g. us-east-2_uXboG5pAb
        userPoolClientId: 'l7nmpavlqp3jcfjbr237prqae', // e.g. 25ddkmj4v6hfsfvruhpfi7n4hv
        region: 'eu-west-1' // e.g. us-east-2
    },
    api: {
        invokeUrl: 'https://api.blitzbudget.com', // e.g. https://rc7nyt4tql.execute-api.us-west-2.amazonaws.com/prod,
        sendEmailUrl : '/send-email'
    },
    home: {
    	invokeUrl: 'https://www.blitzbudget.com'
    },
    help: {
        invokeUrl: 'https://help.blitzbudget.com',
        html: '/support/modal',
        js: '/js/dashboard/support/support.min.js'
    }
};
