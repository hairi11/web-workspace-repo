const test = require('node:test');
const assert = require('node:assert/strict');
const Ajax = require('../src/ajax/Ajax');
const ConfigUtil = require('../src/util/ConfigUtil');
const SecurityUtil = require('../src/util/SecurityUtil');
const UrlUtil = require('../src/util/UrlUtil');
const Logger = require('../src/logging/Logger');
const DataTableBuilder = require('../src/datatable/DataTableBuilder');
const FileValidator = require('../src/form/FileValidator');

test('UrlUtil rejects unsafe request protocols', function () {
    assert.throws(function () {
        UrlUtil.assertSafeRequestUrl('javascript:alert(1)');
    }, /protocol is not allowed/);
});

test('ConfigUtil rejects prototype pollution keys', function () {
    var payload = JSON.parse('{"__proto__":{"polluted":true}}');
    assert.throws(function () {
        ConfigUtil.merge({}, payload);
    }, /Unsafe object key rejected/);
    assert.equal({}.polluted, undefined);
});

test('Ajax blocks cross-origin credentials by default', async function () {
    await assert.rejects(
        Ajax._applySecurity({
            url: 'https://example.com/api',
            method: 'GET',
            headers: {},
            credentials: 'include',
            allowedProtocols: ['http:', 'https:'],
            allowCrossOriginCredentials: false
        }),
        /Cross-origin credentials are blocked/
    );
});

test('Ajax strips sensitive cross-origin headers by default', async function () {
    var config = await Ajax._applySecurity({
        url: 'https://example.com/api',
        method: 'GET',
        headers: {Authorization: 'Bearer secret', Accept: 'application/json'},
        credentials: 'omit',
        allowedProtocols: ['http:', 'https:'],
        allowCrossOriginCredentials: false,
        allowSensitiveHeadersCrossOrigin: false
    });

    assert.equal(config.headers.Authorization, undefined);
    assert.equal(config.headers.Accept, 'application/json');
});

test('Ajax adds CSRF token to same-origin POST through provider', async function () {
    var config = await Ajax._applySecurity({
        url: '/api/users',
        method: 'POST',
        headers: {},
        credentials: 'same-origin',
        allowedProtocols: ['http:', 'https:'],
        csrfHeader: 'X-CSRF-Token',
        csrfTokenProvider: async function () { return 'csrf-value'; }
    });

    assert.equal(config.headers['X-CSRF-Token'], 'csrf-value');
});

test('SecurityUtil redacts sensitive object values', function () {
    var value = SecurityUtil.redact({username: 'ali', password: 'secret', nested: {token: 'abc'}});
    assert.equal(value.username, 'ali');
    assert.equal(value.password, '[REDACTED]');
    assert.equal(value.nested.token, '[REDACTED]');
});

test('Logger redacts sensitive values by default', function () {
    var captured;
    var logger = new Logger('Test', {
        sink: {
            log: function () { captured = Array.prototype.slice.call(arguments); }
        }
    });

    logger.info({password: 'secret', name: 'Ali'});
    assert.equal(captured[1].password, '[REDACTED]');
    assert.equal(captured[1].name, 'Ali');
});

test('DataTable action renderer escapes action text and filters classes', function () {
    var builder = new DataTableBuilder('#table');
    builder.menuAction().addAction({
        text: '<img src=x onerror=alert(1)>',
        icon: 'fa fa-eye\" onclick=alert(1)',
        className: 'safe bad<script>'
    });

    var html = builder._renderActions();
    assert.match(html, /&lt;img/);
    assert.doesNotMatch(html, /<img/i);
    assert.doesNotMatch(html, /onclick=/);
    assert.match(html, / safe/);
});

test('FileValidator enforces size and type on file-like values', function () {
    var sizeRule = FileValidator.maxSize(100);
    var typeRule = FileValidator.allowedTypes(['image/png']);
    assert.equal(sizeRule({name: 'a.png', size: 101, type: 'image/png'}), 'File exceeds the maximum allowed size.');
    assert.equal(typeRule({name: 'a.exe', size: 10, type: 'application/octet-stream'}), 'File type is not allowed.');
});
