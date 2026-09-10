import Common from '@company/common-js-web';
import TodoService from './TodoService.js';

const { FormAction, Validator, Toast } = Common;

class TodoFormAction extends FormAction {
    constructor(selector, options) {
        super(selector);
        this.options = options || {};
    }

    getValidationRules() {
        return {
            userId: Validator.required('User ID is required.'),
            title: Validator.required('Title is required.'),
            completed: Validator.required('Status is required.')
        };
    }

    getConfirmation() {
        return this.options.mode === 'update'
            ? 'Update this todo?'
            : 'Create this todo?';
    }

    buildRequestData(values) {
        return {
            userId: Number(values.userId),
            title: values.title,
            completed: values.completed === 'true'
        };
    }

    async load() {
        if (!this.options.id) return null;

        const response = await TodoService.getById(this.options.id);
        this.populate(response.data);
        return response.data;
    }

    populate(values) {
        if (!this.form || !values) return this;

        if (this.form.elements.userId) {
            this.form.elements.userId.value = values.userId ?? '';
        }

        if (this.form.elements.title) {
            this.form.elements.title.value = values.title ?? '';
        }

        if (this.form.elements.completed) {
            this.form.elements.completed.value = values.completed ? 'true' : 'false';

            if (window.jQuery) {
                window.jQuery(this.form.elements.completed).trigger('change.select2');
            }
        }

        if (this.formState) {
            this.formState.resetBaseline();
        }

        return this;
    }

    sendRequest(context) {
        if (this.options.mode === 'update') {
            return TodoService.update(this.options.id, context.data);
        }

        return TodoService.create(context.data);
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
                ? 'Todo updated successfully.'
                : 'Todo created successfully.'
        );

        const output = document.querySelector('#resultOutput');
        if (output) output.textContent = JSON.stringify(data, null, 2);
    }

    onError(error) {
        Toast.error(error && error.message ? error.message : 'Request failed.');
        console.error(error);
    }
}

export default TodoFormAction;
