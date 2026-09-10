import Common from '@company/common-js-web';
import UserService from './UserService.js';

const { FormAction, Validator, Toast } = Common;

class UserFormAction extends FormAction {
    constructor(selector, options) {
        super(selector);
        this.options = options || {};
    }

    getValidationRules() {
        return {
            name: Validator.required('Name is required.'),
            username: Validator.required('Username is required.'),
            email: [
                Validator.required('Email is required.'),
                Validator.email('Please enter a valid email address.')
            ]
        };
    }

    getConfirmation() {
        return this.options.mode === 'update'
            ? 'Update this user?'
            : 'Create this user?';
    }

    buildRequestData(values) {
        return {
            name: values.name,
            username: values.username,
            email: values.email,
            phone: values.phone || '',
            website: values.website || ''
        };
    }

    async load() {
        if (!this.options.id) return null;

        const response = await UserService.getById(this.options.id);
        this.populate(response.data);
        return response.data;
    }

    populate(values) {
        if (!this.form || !values) return this;

        Object.keys(values).forEach((name) => {
            const field = this.form.elements[name];
            if (!field) return;

            field.value = values[name] === null || values[name] === undefined
                ? ''
                : values[name];
        });

        if (this.formState) {
            this.formState.resetBaseline();
        }

        return this;
    }

    sendRequest(context) {
        if (this.options.mode === 'update') {
            return UserService.update(this.options.id, context.data);
        }

        return UserService.create(context.data);
    }

    shouldTrackDirty() {
        return true;
    }

    shouldResetOnSuccess() {
        return this.options.mode === 'create';
    }

    onSuccess(data) {
        Toast.success(
            this.options.mode === 'update'
                ? 'User updated successfully.'
                : 'User created successfully.'
        );

        const output = document.querySelector('#resultOutput');
        if (output) output.textContent = JSON.stringify(data, null, 2);
    }

    onError(error) {
        Toast.error(error && error.message ? error.message : 'Request failed.');
        console.error(error);
    }
}

export default UserFormAction;
