import Common from '@company/common-js-web';
import TodoService from './TodoService.js';
import { saveDraft } from './action/todoActionBase.js';

const { ButtonBar, ChoiceInput, FormAction, Logger, NavigationState, Validator, Toast } = Common;

const logger = new Logger('TodoFormAction');

class TodoFormAction extends FormAction {
    constructor(selector, options) {
        super(selector);
        this.options = options || {};
        this.statusOptions = [];
        this.statusChoice = null;
        this.buttonBar = null;
    }

    async loadStatusOptions() {
        const response = await TodoService.getStatusOptions();
        this.statusOptions = Array.isArray(response.data) ? response.data : [];
        return this.statusOptions;
    }

    onBuild(form) {
        if (form.elements.completed) {
            this.statusChoice = new ChoiceInput(form.elements.completed, {
                width: '100%',
                data: this.statusOptions
            }).build();
        }

        this.buttonBar = new ButtonBar('#todoButtonBar')
            .primary({ target: '#submitButton' })
            .secondary({
                target: '#cancelButton',
                placement: ButtonBar.Placement.END
            })
            .build();
    }

    onDestroy() {
        if (this.statusChoice) {
            this.statusChoice.destroy();
            this.statusChoice = null;
        }

        if (this.buttonBar) {
            this.buttonBar.destroy();
            this.buttonBar = null;
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

            if (this.statusChoice) {
                this.statusChoice.setValue(value);
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

        NavigationState.set({
            page: 'todo-view',
            preview: true,
            mode: this.options.mode,
            id: this.options.id || null
        });
        window.location.href = './view.html';
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
        logger.error(error);
    }
}

export default TodoFormAction;
