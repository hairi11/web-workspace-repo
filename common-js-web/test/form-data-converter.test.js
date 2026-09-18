const test = require('node:test');
const assert = require('node:assert/strict');
const FormDataConverter = require('../src/form/FormDataConverter');

const Type = FormDataConverter.Types;

const schema = {
    name: Type.TEXT,
    amount: Type.DECIMAL,
    rate: Type.DECIMAL,
    date: Type.DATE,
    category: Type.SELECT
};

test('FormDataConverter converts form values to typed data', function () {
    const nested = {keep: true};
    const result = FormDataConverter.fromForm({
        name: 'FX Deal',
        amount: '1234.50',
        rate: '',
        date: '2026-09-14',
        category: 10,
        metadata: nested
    }, schema);

    assert.equal(result.name, 'FX Deal');
    assert.equal(result.amount, '1234.50');
    assert.equal(result.rate, null);
    assert.equal(result.date, '2026-09-14');
    assert.equal(result.category, '10');
    assert.equal(result.metadata, nested);
});

test('FormDataConverter converts typed data to form values', function () {
    const nested = {keep: true};
    const result = FormDataConverter.toForm({
        name: null,
        amount: 1234.5,
        rate: null,
        date: '2026-09-14',
        category: 10,
        metadata: nested
    }, schema);

    assert.equal(result.name, '');
    assert.equal(result.amount, '1234.5');
    assert.equal(result.rate, '');
    assert.equal(result.date, '2026-09-14');
    assert.equal(result.category, '10');
    assert.equal(result.metadata, nested);
});

test('FormDataConverter supports custom field converters', function () {
    const customSchema = {
        code: {
            fromForm: function (value) { return String(value).toUpperCase(); },
            toForm: function (value) { return String(value).toLowerCase(); }
        }
    };

    assert.equal(FormDataConverter.fromForm({code: 'usd'}, customSchema).code, 'USD');
    assert.equal(FormDataConverter.toForm({code: 'USD'}, customSchema).code, 'usd');
});


test('FormDataConverter preserves DECIMAL(20,4) precision', function () {
    const result = FormDataConverter.fromForm({
        amount: '9,999,999,999,999,999.9999'
    }, {
        amount: Type.DECIMAL
    });

    assert.equal(result.amount, '9999999999999999.9999');
});
