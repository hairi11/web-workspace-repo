const test = require('node:test');
const assert = require('node:assert/strict');
const Renderers = require('../src/datatable/Renderers');

test('amount renderer preserves large decimal precision', function () {
    const render = Renderers.amount();

    assert.equal(
        render('9999999999999999', 'display'),
        '9,999,999,999,999,999.00'
    );
});

test('amount renderer rounds decimals without Number conversion', function () {
    const render = Renderers.amount();

    assert.equal(
        render('9999999999999999.995', 'display'),
        '10,000,000,000,000,000.00'
    );
});
