const Ajax = require('../ajax/Ajax');
const FormSerializer = require('./FormSerializer');
const ConfirmDialog = require('./dialog/ConfirmDialog');
const ConfigUtil = require('../util/ConfigUtil');
const FieldErrorRenderer = require('./FieldErrorRenderer');
const FormState = require('../state/FormState');

class FormAction {
    constructor(selector) {
        this.selector = selector;
        this.form = null;
        this.isSubmitting = false;
        this.formState = null;
        this.errorRenderer = null;
        this._submitListener = null;
        this._dirtyListener = null;
    }

    build() {
        this.form = document.querySelector(this.selector);

        if (!this.form) {
            throw new Error('Form not found: ' + this.selector);
        }

        var self = this;

        this._submitListener = function (event) {
            event.preventDefault();
            self.execute();
        };

        this.form.addEventListener('submit', this._submitListener);
        this.errorRenderer = this.getErrorRenderer() || new FieldErrorRenderer();

        if (this.shouldTrackDirty()) {
            this.formState = new FormState(this.form);
            this._dirtyListener = function () {
                self.onDirtyChange(self.formState.isDirty(), self.formState);
            };
            this.form.addEventListener('input', this._dirtyListener);
            this.form.addEventListener('change', this._dirtyListener);
        }

        this.onBuild(this.form);

        return this;
    }

    destroy() {
        if (!this.form) return this;

        if (this._submitListener) {
            this.form.removeEventListener('submit', this._submitListener);
        }

        if (this._dirtyListener) {
            this.form.removeEventListener('input', this._dirtyListener);
            this.form.removeEventListener('change', this._dirtyListener);
        }

        this.onDestroy(this.form);

        this._submitListener = null;
        this._dirtyListener = null;
        this.formState = null;
        this.form = null;

        return this;
    }

    async execute() {
        if (this.isSubmitting) return;

        var context = null;
        var result = null;
        var requestError = null;

        try {
            var formValues = this.serializeForm();

            await this.beforeValidate(formValues, this.form);

            var validation = await this.validateForm(formValues);

            await this.afterValidate(validation, formValues, this.form);

            if (!validation.valid) {
                this.showValidationErrors(validation.errors);
                await this.onValidationError(validation.errors, formValues, this.form);
                return;
            }

            this.clearValidationErrors();

            await this.beforeConfirm(formValues, this.form);

            var confirmed = await this.confirmSubmission(formValues);

            await this.afterConfirm(confirmed, formValues, this.form);

            if (!confirmed) return;

            context = await this.createContext(formValues);

            var beforeResult = await this.beforeSubmit(context);
            if (beforeResult === false) return;

            this.setSubmitting(true);

            result = await this.sendRequest(context);

            var responseData = await this.transformResponse(
                result.data,
                result.response,
                context
            );

            await this.onSuccess(responseData, context, result.response);

            if (this.shouldResetOnSuccess() && this.form) {
                this.form.reset();
            }

            if (this.formState) {
                this.formState.resetBaseline();
            }

            return responseData;
        }
        catch (error) {
            requestError = error;

            var mappedErrors = await this.mapServerErrors(error, context);

            if (mappedErrors && Object.keys(mappedErrors).length) {
                this.showValidationErrors(mappedErrors);
            }

            return this.onError(error, context);
        }
        finally {
            this.setSubmitting(false);

            await this.onComplete({
                context: context,
                error: requestError,
                result: result
            });
        }
    }

    reset() {
        if (this.form) this.form.reset();
        this.clearValidationErrors();
        if (this.formState) this.formState.resetBaseline();
        return this;
    }

    isDirty() {
        return this.formState ? this.formState.isDirty() : false;
    }

    serializeForm() {
        return FormSerializer.serialize(this.form);
    }

    async validateForm(formValues) {
        var rules = this.getValidationRules() || {};
        var errors = {};
        var fields = Object.keys(rules);

        for (var i = 0; i < fields.length; i += 1) {
            var field = fields[i];
            var validators = Array.isArray(rules[field]) ? rules[field] : [rules[field]];

            for (var j = 0; j < validators.length; j += 1) {
                var validator = validators[j];
                if (typeof validator !== 'function') continue;

                var message = await validator(
                    formValues[field],
                    formValues,
                    this.form
                );

                if (message) {
                    errors[field] = message;
                    break;
                }
            }
        }

        return {
            valid: Object.keys(errors).length === 0,
            errors: errors
        };
    }

    async confirmSubmission(formValues) {
        var confirmation = this.getConfirmation();

        if (!confirmation) return true;

        return Boolean(
            await this.getConfirmationHandler()(
                confirmation,
                formValues,
                this.form
            )
        );
    }

    async createContext(formValues) {
        return {
            method: String(this.getMethod() || 'POST').toUpperCase(),
            url: this.getUrl(),
            form: this.form,
            formValues: formValues,
            data: await this.buildRequestData(formValues, this.form),
            requestOptions: ConfigUtil.merge({}, this.getRequestOptions() || {})
        };
    }

    sendRequest(context) {
        if (!context.url) {
            throw new Error('getUrl() must return a URL when using FormAction.sendRequest().');
        }

        if (context.method === 'GET') {
            return Ajax.get(
                context.url,
                ConfigUtil.merge(
                    context.requestOptions,
                    {query: context.data}
                )
            );
        }

        if (context.method === 'POST') {
            return Ajax.post(
                context.url,
                context.data,
                context.requestOptions
            );
        }

        throw new Error('FormAction supports GET and POST only.');
    }

    showValidationErrors(errors) {
        if (this.errorRenderer) {
            this.errorRenderer.render(this.form, errors || {});
        }
    }

    clearValidationErrors() {
        if (this.errorRenderer) {
            this.errorRenderer.clear(this.form);
        }
    }

    setSubmitting(submitting) {
        this.isSubmitting = submitting;

        if (!this.form || !this.shouldDisableWhileSubmitting()) return;

        var buttons = this.form.querySelectorAll('[type="submit"]');

        Array.prototype.forEach.call(buttons, function (button) {
            button.disabled = submitting;
        });
    }

    // Template methods. Override only what the child action needs.

    getMethod() {
        return 'POST';
    }

    getUrl() {
        return null;
    }

    getValidationRules() {
        return {};
    }

    getConfirmation() {
        return null;
    }

    getConfirmationHandler() {
        return ConfirmDialog.show;
    }

    buildRequestData(formValues) {
        return formValues;
    }

    getRequestOptions() {
        return {};
    }

    getErrorRenderer() {
        return new FieldErrorRenderer();
    }

    shouldTrackDirty() {
        return false;
    }

    shouldResetOnSuccess() {
        return false;
    }

    shouldDisableWhileSubmitting() {
        return true;
    }

    beforeValidate() {}
    afterValidate() {}
    beforeConfirm() {}
    afterConfirm() {}
    beforeSubmit() {}
    onBuild() {}
    onDestroy() {}
    onDirtyChange() {}
    onValidationError() {}

    transformResponse(data) {
        return data;
    }

    mapServerErrors() {
        return {};
    }

    onSuccess() {}

    onError(error) {
        throw error;
    }

    onComplete() {}
}

module.exports = FormAction;
