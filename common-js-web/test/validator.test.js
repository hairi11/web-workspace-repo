const test = require('node:test');
const assert = require('node:assert/strict');
const Validator = require('../src/form/Validator');

test('required rejects empty values', function () {
    assert.equal(Validator.required()(''), 'This field is required.');
    assert.equal(Validator.required()('abc'), null);
});

test('email validates format', function () {
    assert.equal(Validator.email()('a@b.com'), null);
    assert.ok(Validator.email()('abc'));
});

test('decimal validates finite numeric values and leaves required handling separate', function () {
    assert.equal(Validator.decimal()(''), null);
    assert.equal(Validator.decimal()('123.45'), null);
    assert.equal(Validator.decimal()('-0.25'), null);
    assert.equal(Validator.decimal()('.5'), null);
    assert.equal(Validator.decimal()('1.'), null);
    assert.equal(Validator.decimal()('abc'), 'Please enter a valid decimal value.');
    assert.equal(Validator.decimal()('Infinity'), 'Please enter a valid decimal value.');
});

test('sameAs compares another field', function () {
    assert.equal(Validator.sameAs('password')('x', {password: 'x'}), null);
    assert.ok(Validator.sameAs('password')('y', {password: 'x'}));
});


test('decimal validates precision and scale without numeric conversion', function () {
    const decimal20x4 = Validator.decimal(20, 4);

    assert.equal(decimal20x4('9,999,999,999,999,999.9999'), null);
    assert.ok(decimal20x4('99,999,999,999,999,999.9999'));
    assert.ok(decimal20x4('9,999,999,999,999,999.99999'));
    assert.equal(decimal20x4('0.0001'), null);
    assert.equal(decimal20x4('-1,234.5000'), null);
});

test('decimal precision and scale validates configuration', function () {
    assert.throws(function () {
        Validator.decimal(0, 0);
    }, /precision/);

    assert.throws(function () {
        Validator.decimal(4, 5);
    }, /scale/);
});
