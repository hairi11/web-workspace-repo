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

test('sameAs compares another field', function () {
    assert.equal(Validator.sameAs('password')('x', {password: 'x'}), null);
    assert.ok(Validator.sameAs('password')('y', {password: 'x'}));
});
