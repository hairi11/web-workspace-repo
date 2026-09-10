const test = require('node:test');
const assert = require('node:assert/strict');
const FormAction = require('../src/form/FormAction');
const Validator = require('../src/form/Validator');

class TestFormAction extends FormAction {
    constructor() {
        super('#testForm');
        this.events = [];
        this.form = {
            reset: function () {},
            querySelectorAll: function () { return []; }
        };
        this.errorRenderer = {
            render: function () {},
            clear: function () {}
        };
    }

    serializeForm() {
        return {name: 'Ali'};
    }

    getUrl() {
        return '/api/users';
    }

    getValidationRules() {
        return {name: Validator.required()};
    }

    getConfirmation() {
        return null;
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

    onComplete() {
        this.events.push('onComplete');
    }
}

test('FormAction template flow uses inherited defaults and overridden hooks', async function () {
    var action = new TestFormAction();
    var result = await action.execute();

    assert.deepEqual(result, {id: 1, name: 'Ali'});
    assert.equal(action.getMethod(), 'POST');
    assert.equal(action.shouldTrackDirty(), false);
    assert.equal(action.shouldResetOnSuccess(), false);
    assert.equal(action.shouldDisableWhileSubmitting(), true);
    assert.deepEqual(action.events, [
        'beforeSubmit',
        'sendRequest',
        'onSuccess',
        'onComplete'
    ]);
});

class GetFormAction extends TestFormAction {
    getMethod() {
        return 'GET';
    }
}

test('FormAction child only overrides getMethod for GET behavior', async function () {
    var action = new GetFormAction();
    var context = await action.createContext({name: 'Ali'});

    assert.equal(context.method, 'GET');
    assert.equal(context.url, '/api/users');
    assert.deepEqual(context.data, {user: {name: 'Ali'}});
});
