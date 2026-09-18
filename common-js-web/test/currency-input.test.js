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


test('CurrencyInput limits integer digits from precision and scale', function () {
    assert.equal(
        CurrencyInput.format('12345678901234567.12345', {
            precision: 20,
            decimalScale: 4
        }),
        '1,234,567,890,123,456.1234'
    );
});

test('CurrencyInput can limit decimals without grouping', function () {
    assert.equal(
        CurrencyInput.format('123456789.1234567', {
            precision: 14,
            decimalScale: 6,
            useGrouping: false
        }),
        '12345678.123456'
    );
});


test('CurrencyInput enforces DECIMAL(14,6) rate limits', function () {
    const options = {
        precision: 14,
        decimalScale: 6,
        useGrouping: false
    };

    assert.equal(CurrencyInput.isWithinLimit('99999999.999999', options), true);
    assert.equal(CurrencyInput.isWithinLimit('999999999.999999', options), false);
    assert.equal(CurrencyInput.isWithinLimit('99999999.9999999', options), false);
});
