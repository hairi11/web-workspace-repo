const test = require('node:test');
const assert = require('node:assert/strict');
const { addDays, format } = require('date-fns');
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
    assert.equal(Validator.decimal()('abc'), 'Please enter a valid decimal value.');
    assert.equal(Validator.decimal()('Infinity'), 'Please enter a valid decimal value.');
});

test('sameAs compares another field', function () {
    assert.equal(Validator.sameAs('password')('x', {password: 'x'}), null);
    assert.ok(Validator.sameAs('password')('y', {password: 'x'}));
});

test('maxDaysFromToday rejects dates beyond the allowed future range', function () {
    const validate = Validator.maxDaysFromToday(14);
    const today = new Date();
    const withinRange = format(addDays(today, 14), 'yyyy-MM-dd');
    const beyondRange = format(addDays(today, 15), 'yyyy-MM-dd');
    const pastDate = format(addDays(today, -30), 'yyyy-MM-dd');

    assert.equal(validate(withinRange), null);
    assert.equal(validate(pastDate), null);
    assert.equal(validate(beyondRange), 'Date cannot be more than 14 days from today.');
});
