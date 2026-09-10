const {Ajax} = require('../../src');

Ajax.configure({timeout: 10000, retry: 2, dedupe: true});

Ajax.use({
    beforeRequest: function (config) {
        config.headers['X-App'] = 'example';
        return config;
    }
});

const token = Ajax.createCancelToken();

Ajax.get('/api/users', {
    cache: true,
    cacheTtl: 30000,
    signal: token.signal
}).then(function (response) {
    console.log(response.data);
});
