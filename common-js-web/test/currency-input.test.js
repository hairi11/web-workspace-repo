const test = require('node:test');
const assert = require('node:assert/strict');
const CurrencyInput = require('../src/input/CurrencyInput');
const NumberUtil = require('../src/util/NumberUtil');

test('CurrencyInput formats grouping and decimals', function () {
    assert.equal(CurrencyInput.format('1234.56'), '1,234.56');
    assert.equal(CurrencyInput.format('1234567.8912', {decimalScale: 4}), '1,234,567.8912');
});

test('CurrencyInput keeps partial decimal input', function () {
    assert.equal(CurrencyInput.format('1234.', {decimalScale: 4}), '1,234.');
});

test('NumberUtil parses grouped formatted values', function () {
    assert.equal(NumberUtil.parseFormatted('1,234.56'), 1234.56);
    assert.equal(NumberUtil.parseFormatted(''), null);
});
