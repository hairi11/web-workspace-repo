const test = require('node:test');
const assert = require('node:assert/strict');
const ChoiceInput = require('../src/select/ChoiceInput');

test('ChoiceInput uses radio for up to five options', function () {
    assert.equal(ChoiceInput.resolveMode(0), ChoiceInput.Mode.RADIO);
    assert.equal(ChoiceInput.resolveMode(1), ChoiceInput.Mode.RADIO);
    assert.equal(ChoiceInput.resolveMode(4), ChoiceInput.Mode.RADIO);
    assert.equal(ChoiceInput.resolveMode(5), ChoiceInput.Mode.RADIO);
});

test('ChoiceInput uses select for more than five options', function () {
    assert.equal(ChoiceInput.resolveMode(6), ChoiceInput.Mode.SELECT);
});

test('ChoiceInput supports a custom threshold', function () {
    assert.equal(ChoiceInput.resolveMode(2, 3), ChoiceInput.Mode.RADIO);
    assert.equal(ChoiceInput.resolveMode(3, 3), ChoiceInput.Mode.RADIO);
    assert.equal(ChoiceInput.resolveMode(4, 3), ChoiceInput.Mode.SELECT);
});
