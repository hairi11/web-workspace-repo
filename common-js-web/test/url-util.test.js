const test = require('node:test');
const assert = require('node:assert/strict');
const UrlUtil = require('../src/util/UrlUtil');

test('appends scalar and array query values', function () {
    var url = UrlUtil.appendQuery('/users', {page: 2, role: ['admin', 'editor'], empty: ''});
    assert.equal(url, '/users?page=2&role=admin&role=editor');
});
