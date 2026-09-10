const test = require('node:test');
const assert = require('node:assert/strict');
const ConfigUtil = require('../src/util/ConfigUtil');

test('removes null header overrides', function () {
    var result = ConfigUtil.merge(
        {headers: {Authorization: 'Bearer token', Accept: 'application/json'}},
        {headers: {Authorization: null}}
    );
    assert.equal(result.headers.Authorization, undefined);
    assert.equal(result.headers.Accept, 'application/json');
});
