const Ajax = require('../ajax/Ajax');

class Repository {
    constructor(baseUrl) {
        this.baseUrl = String(baseUrl || '').replace(/\/$/, '');
    }

    list(query, options) {
        return Ajax.get(this.baseUrl, Object.assign({}, options || {}, {query: query || {}}));
    }

    get(id, options) {
        return Ajax.get(this.baseUrl + '/' + encodeURIComponent(id), options || {});
    }

    create(data, options) {
        return Ajax.post(this.baseUrl, data, options || {});
    }

    action(name, data, options) {
        return Ajax.post(this.baseUrl + '/' + encodeURIComponent(name), data || {}, options || {});
    }
}

module.exports = Repository;
