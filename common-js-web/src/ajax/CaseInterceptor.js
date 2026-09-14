const CaseUtil = require('../util/CaseUtil');

const CaseInterceptor = {
    beforeRequest: function (config) {
        if (config && config.data !== undefined) {
            config.data = CaseUtil.toSnakeKeys(config.data);
        }
        return config;
    },

    afterResponse: function (response) {
        if (response && response.data !== undefined) {
            response.data = CaseUtil.toCamelKeys(response.data);
        }
        return response;
    },

    onError: function (error) {
        if (error && error.data !== undefined) {
            error.data = CaseUtil.toCamelKeys(error.data);
        }
        return error;
    }
};

module.exports = CaseInterceptor;
