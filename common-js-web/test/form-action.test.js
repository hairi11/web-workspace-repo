const test = require('node:test');
const assert = require('node:assert/strict');
const FormAction = require('../src/form/FormAction');
const Validator = require('../src/form/Validator');

class TestFormAction extends FormAction {
    constructor() {
        super('#testForm');
        this.events = [];
        this.form = {
            querySelectorAll: function () { return []; },
            reset: function () {}
        };
        this.errorRenderer = {
            render: function () {},
            clear: function () {}
        };
    }

    serializeForm() {
        return {name: 'Ali'};
    }

    getValidationRules() {
        return {name: Validator.required()};
    }

    buildRequestData(values) {
        return {user: {name: values.name}};
    }

    beforeSubmit(context) {
        this.events.push('beforeSubmit');
        assert.deepEqual(context.data, {user: {name: 'Ali'}});
    }

    sendRequest(context) {
        this.events.push('sendRequest');
        return Promise.resolve({
            data: {id: 1, name: context.data.user.name},
            response: {status: 200}
        });
    }

    onSuccess(data) {
        this.events.push('onSuccess');
        assert.equal(data.name, 'Ali');
    }
}

test('FormAction runs the project submit lifecycle', async function () {
    const action = new TestFormAction();
    const result = await action.execute();

    assert.deepEqual(result, {id: 1, name: 'Ali'});
    assert.equal(action.shouldTrackDirty(), false);
    assert.deepEqual(action.events, [
        'beforeSubmit',
        'sendRequest',
        'onSuccess'
    ]);
});

test('FormAction stops on validation errors', async function () {
    const action = new TestFormAction();
    action.serializeForm = function () { return {name: ''}; };

    const result = await action.execute();

    assert.equal(result, undefined);
    assert.deepEqual(action.events, []);
});
