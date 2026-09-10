class AjaxError extends Error {
    constructor(message, options) {
        super(message);
        this.name = 'AjaxError';
        options = options || {};
        this.status = options.status || 0;
        this.data = options.data;
        this.response = options.response || null;
        this.cause = options.cause;
    }
}

module.exports = AjaxError;
