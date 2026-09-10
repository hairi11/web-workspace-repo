const test = require('node:test');
const assert = require('node:assert/strict');
const Ajax = require('../src/ajax/Ajax');

test('Ajax GET parses JSON response', async function () {
    const originalFetch = global.fetch;
    global.fetch = async function () {
        return {
            ok: true,
            status: 200,
            headers: {get: function () { return 'application/json'; }},
            json: async function () { return {ok: true}; },
            text: async function () { return ''; }
        };
    };

    try {
        const result = await Ajax.get('/test', {cache: false, retry: 0, dedupe: false});
        assert.deepEqual(result.data, {ok: true});
    }
    finally {
        global.fetch = originalFetch;
    }
});
