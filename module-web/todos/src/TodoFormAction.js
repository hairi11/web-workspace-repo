import Common from '@company/common-js-web';
import TodoService from './TodoService.js';
import { saveDraft } from './action/todoActionBase.js';

const { FormAction, Select2, Validator, Toast } = Common;

class TodoFormAction extends FormAction {
    constructor(selector, options) {
        super(selector);
        this.options = options || {};
        this.statusOptions = [];
        this.statusSelect = null;
    }

    async loadStatusOptions() {
        const response = await TodoService.getStatusOptions();
        this.statusOptions = Array.isArray(response.data) ? response.data : [];
        return this.statusOptions;
    }

    onBuild(form) {
        if (!form.elements.completed) return;

        this.statusSelect = new Select2(form.elements.completed, {
            width: '100%',
            minimumResultsForSearch: Infinity,
            data: this.statusOptions
        }).build();
    }

    onDestroy() {
        if (this.statusSelect) {
            this.statusSelect.destroy();
            this.statusSelect = null;
        }
    }

    getValidationRules() {
        return {
            userId: Validator.required('User ID is required.'),
            title: Validator.required('Title is required.'),
            completed: Validator.required('Status is required.')
        };
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
            const value = values.completed ? 'true' : 'false';

            if (this.statusSelect) {
                this.statusSelect.setValue(value);
            } else {
                this.form.elements.completed.value = value;
            }
        }

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
            return TodoService.update(this.options.id, context.data);
        }

        return TodoService.create(context.data);
    }

    shouldTrackDirty() {
        return true;
    }

    onError(error) {
        Toast.error(error && error.message ? error.message : 'Request failed.');
        console.error(error);
    }
}

export default TodoFormAction;
