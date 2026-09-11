import Common from '@company/common-js-web';
import UserService from './UserService.js';
import { saveDraft } from './action/userActionBase.js';

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

    beforeSubmit(context) {
        saveDraft({
            mode: this.options.mode,
            id: this.options.id || null,
            data: context.data
        });

        const id = this.options.id
            ? '&id=' + encodeURIComponent(this.options.id)
            : '';

        window.location.href = './view.html?preview=1' + id;
        return false;
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

    onError(error) {
        Toast.error(error && error.message ? error.message : 'Request failed.');
        console.error(error);
    }
}

export default UserFormAction;
