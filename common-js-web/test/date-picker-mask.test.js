const test = require('node:test');
const assert = require('node:assert/strict');
const DatePicker = require('../src/datepicker/DatePicker');

test('DatePicker masks numeric date input as dd/mm/yyyy', function () {
    assert.equal(DatePicker.maskDateInput('1'), '1');
    assert.equal(DatePicker.maskDateInput('180'), '18/0');
    assert.equal(DatePicker.maskDateInput('18092026'), '18/09/2026');
    assert.equal(DatePicker.maskDateInput('18-09-2026'), '18/09/2026');
});
