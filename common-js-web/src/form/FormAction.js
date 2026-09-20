const FormSerializer = require('./FormSerializer');
const FieldErrorRenderer = require('./FieldErrorRenderer');
const FormState = require('../state/FormState');

class FormAction {
    constructor(selector) {
        this.selector = selector;
        this.form = null;
        this.formState = null;
        this.errorRenderer = null;
        this.isSubmitting = false;
        this.submitListener = null;
    }

    build() {
        this.form = document.querySelector(this.selector);

        if (!this.form) {
            throw new Error('Form not found: ' + this.selector);
        }

        this.submitListener = (event) => {
            event.preventDefault();
            this.execute(event.submitter || null);
        };

        this.form.addEventListener('submit', this.submitListener);
        this.errorRenderer = new FieldErrorRenderer();

        if (this.shouldTrackDirty()) {
            this.formState = new FormState(this.form);
        }

        this.onBuild(this.form);
        return this;
    }

    destroy() {
        if (!this.form) return this;

        if (this.submitListener) {
            this.form.removeEventListener('submit', this.submitListener);
        }

        this.onDestroy(this.form);
        this.submitListener = null;
        this.formState = null;
        this.form = null;
        return this;
    }

    async execute(submitter) {
        if (this.isSubmitting) return;

        var context = null;

        try {
            var formValues = this.serializeForm();
            var validation = await this.validateForm(formValues);

            if (!validation.valid) {
                this.showValidationErrors(validation.errors);
                return;
            }

            this.clearValidationErrors();

            context = {
                form: this.form,
                submitter: submitter || null,
                formValues: formValues,
                data: await this.buildRequestData(formValues, this.form)
            };

            if (await this.beforeSubmit(context) === false) return;

            this.setSubmitting(true);

            var result = await this.sendRequest(context);
            var data = result && Object.prototype.hasOwnProperty.call(result, 'data')
                ? result.data
                : result;

            await this.onSuccess(
                data,
                context,
                result && result.response ? result.response : null
            );

            if (this.formState) {
                this.formState.resetBaseline();
            }

            return data;
        } catch (error) {
            return this.onError(error, context);
        } finally {
            this.setSubmitting(false);
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

    async validateForm(values) {
        var rules = this.getValidationRules() || {};
        var errors = {};
        var fields = Object.keys(rules);

        for (var i = 0; i < fields.length; i += 1) {
            var validators = Array.isArray(rules[fields[i]])
                ? rules[fields[i]]
                : [rules[fields[i]]];

            for (var j = 0; j < validators.length; j += 1) {
                if (typeof validators[j] !== 'function') continue;

                var message = await validators[j](
                    values[fields[i]],
                    values,
                    this.form
                );

                if (message) {
                    errors[fields[i]] = message;
                    break;
                }
            }
        }

        return {
            valid: Object.keys(errors).length === 0,
            errors: errors
        };
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
        this.isSubmitting = Boolean(submitting);

        if (!this.form) return;

        this.form.querySelectorAll('[type="submit"]').forEach(function (button) {
            button.disabled = Boolean(submitting);
        });
    }

    getValidationRules() { return {}; }
    buildRequestData(values) { return values; }
    shouldTrackDirty() { return false; }

    sendRequest() {
        throw new Error('sendRequest() must be implemented when beforeSubmit() does not stop submission.');
    }

    beforeSubmit() {}
    onBuild() {}
    onDestroy() {}
    onSuccess() {}

    onError(error) {
        throw error;
    }
}

module.exports = FormAction;
