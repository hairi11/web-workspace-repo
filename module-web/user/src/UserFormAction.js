import Common from '@company/common-js-web';
import { traceObject } from './Trace.js';

const { ButtonBar, FormAction, Logger, Toast } = Common;

const logger = new Logger('UserFormAction');

class UserFormAction extends FormAction {
    constructor(selector, options) {
        super(selector);
        this.options = traceObject(options || {}, 'UserFormAction.options');
        this.buttonBar = null;
    }

    onBuild() {
        this.buttonBar = new ButtonBar('#userButtonBar')
            .primary({ target: '#submitButton' })
            .secondary({
                target: '#cancelButton',
                placement: ButtonBar.Placement.END
            })
            .build();
    }

    onDestroy() {
        if (this.buttonBar) {
            this.buttonBar.destroy();
            this.buttonBar = null;
        }
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
        logger.error(error);
    }
}

export default UserFormAction;
