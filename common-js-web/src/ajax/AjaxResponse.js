class AjaxResponse {
    constructor(data, response, config) {
        this.data = data;
        this.response = response;
        this.config = config;
        this.status = response ? response.status : 0;
        this.ok = response ? response.ok : true;
        this.headers = response ? response.headers : null;
    }
}

module.exports = AjaxResponse;
