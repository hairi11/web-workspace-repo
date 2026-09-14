const test = require('node:test');
const assert = require('node:assert/strict');
const FormRenderers = require('../src/form/FormRenderers');

test('FormRenderers.view replaces controls and uses action hooks', function () {
    const originalDocument = global.document;
    const replacements = {};
    const events = [];

    global.document = {
        createElement: function () {
            return {
                className: '',
                textContent: ''
            };
        }
    };

    const fields = [
        {
            name: 'name',
            replaceWith: function (display) {
                replacements.name = display;
            }
        },
        {
            name: 'amount',
            replaceWith: function (display) {
                replacements.amount = display;
            }
        }
    ];

    const action = {
        form: {
            querySelectorAll: function () {
                return fields;
            }
        },
        beforeRenderView: function () {
            events.push('before');
        },
        viewValue: function (name, value) {
            return name === 'amount' ? 'RM ' + value : String(value);
        },
        afterRenderView: function () {
            events.push('after');
        }
    };

    try {
        const result = FormRenderers.view(action, {
            name: 'Ali',
            amount: 100
        });

        assert.equal(result, action);
        assert.deepEqual(events, ['before', 'after']);
        assert.equal(replacements.name.className, 'view-value');
        assert.equal(replacements.name.textContent, 'Ali');
        assert.equal(replacements.amount.textContent, 'RM 100');
    }
    finally {
        global.document = originalDocument;
    }
});

test('FormRenderers.view uses default dash for empty values', function () {
    const originalDocument = global.document;
    let replacement = null;

    global.document = {
        createElement: function () {
            return {
                className: '',
                textContent: ''
            };
        }
    };

    const action = {
        form: {
            querySelectorAll: function () {
                return [{
                    name: 'description',
                    replaceWith: function (display) {
                        replacement = display;
                    }
                }];
            }
        }
    };

    try {
        FormRenderers.view(action, {description: ''});
        assert.equal(replacement.textContent, '-');
    }
    finally {
        global.document = originalDocument;
    }
});
