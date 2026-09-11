import Common from '@company/common-js-web';

const { FormAction, Toast } = Common;

class UserFormAction extends FormAction {
    constructor(selector, options) {
        super(selector);
        this.options = options || {};
    }

    getValidationRules() {
        return this.options.validationRules
            ? this.options.validationRules()
            : {};
    }

    buildRequestData(values) {
        return this.options.buildRequestData
            ? this.options.buildRequestData(values)
            : values;
    }

    populate(values) {
        if (!this.form || !values) return this;

        if (this.options.populate) {
            this.options.populate(this, values);
        } else {
            Object.keys(values).forEach((name) => {
                const field = this.form.elements[name];
                if (!field || typeof values[name] === 'object') return;

                field.value = values[name] === null || values[name] === undefined
                    ? ''
                    : values[name];
            });
        }

        if (this.formState) {
            this.formState.resetBaseline();
        }

        return this;
    }

    setField(name, value) {
        const field = this.form && this.form.elements[name];
        if (!field) return this;

        field.value = value === null || value === undefined ? '' : value;
        return this;
    }

    beforeSubmit(context) {
        return this.options.beforeSubmit
            ? this.options.beforeSubmit(context)
            : undefined;
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
