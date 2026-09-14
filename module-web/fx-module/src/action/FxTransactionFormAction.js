import Common from '@company/common-js-web';
import { ReferenceType, TransactionMode } from '../FxConstants.js';
import FxService from '../FxService.js';
import FxCreateFormAction from './FxCreateFormAction.js';

const {
    DatePicker,
    DateUtil,
    FormAction,
    NavigationState,
    Select2,
    Toast,
    Validator
} = Common;

class FxTransactionFormAction extends FormAction {
    constructor(selector, options) {
        super(selector);
        this.options = options || {};
        this.references = null;
        this.datePicker = null;
        this.selects = {};
    }

    async loadReferences() {
        const [categories, codes, currencies, types] = await Promise.all([
            FxService.findReferences(ReferenceType.CATEGORY),
            FxService.findReferences(ReferenceType.CODE),
            FxService.findReferences(ReferenceType.CURRENCY),
            FxService.findReferences(ReferenceType.TYPE)
        ]);

        this.references = {
            category: categories,
            code: codes,
            currency: currencies,
            type: types
        };

        return this.references;
    }

    onBuild() {
        this.datePicker = new DatePicker('#fxDate').build();

        this.selects.fxCategory = this.buildSelect('#fxCategory', this.references.category);
        this.selects.fxCode = this.buildSelect('#fxCode', this.references.code);
        this.selects.fxCurrency = this.buildSelect('#fxCurrency', this.references.currency);
        this.selects.fxType = this.buildSelect('#fxType', this.references.type);
    }

    onDestroy() {
        if (this.datePicker) this.datePicker.destroy();
        Object.values(this.selects).forEach((select) => select.destroy());
        this.datePicker = null;
        this.selects = {};
    }

    getValidationRules() {
        return {
            fxDate: Validator.required('FX Date is required.'),
            fxCategory: Validator.required('Category is required.'),
            fxCode: Validator.required('Code is required.'),
            fxType: Validator.required('Type is required.'),
            fxCurrency: Validator.required('Currency is required.'),
            fxAmount: Validator.custom((value) => this.validateDecimal(value, 'Enter a valid FX amount.')),
            fxRate: Validator.custom((value) => this.validateDecimal(value, 'Enter a valid FX rate.'))
        };
    }

    buildRequestData(values) {
        return {
            id: this.options.mode === TransactionMode.EDIT ? Number(this.options.key) : null,
            fxDate: values.fxDate || '',
            fxCategory: values.fxCategory || '',
            fxCategoryDescription: this.referenceDescription('category', values.fxCategory),
            fxCode: values.fxCode || '',
            fxCodeDescription: this.referenceDescription('code', values.fxCode),
            fxType: values.fxType || '',
            fxTypeDescription: this.referenceDescription('type', values.fxType),
            fxRefno: values.fxRefno || '',
            fxParty: values.fxParty || '',
            fxPrincipal: values.fxPrincipal || '',
            fxCurrency: values.fxCurrency || '',
            fxCurrencyDescription: this.referenceDescription('currency', values.fxCurrency),
            fxAmount: this.toDecimal(values.fxAmount),
            fxRate: this.toDecimal(values.fxRate),
            fxDescription: values.fxDescription || ''
        };
    }

    beforeSubmit(context) {
        if (this.options.mode === TransactionMode.CREATE || this.options.mode === TransactionMode.EDIT_DRAFT) {
            const index = this.options.mode === TransactionMode.EDIT_DRAFT ? this.options.key : null;
            FxCreateFormAction.upsertTransaction(index, context.data);
            NavigationState.set({ page: 'create', action: 'resume' });
            window.location.href = './create.html';
            return false;
        }

        return undefined;
    }

    sendRequest(context) {
        if (this.options.mode === TransactionMode.EDIT) {
            return FxService.updateTransaction(this.options.key, context.data);
        }

        return super.sendRequest(context);
    }

    async onSuccess() {
        if (this.options.mode === TransactionMode.EDIT) {
            Toast.success('FX transaction updated.');
            window.setTimeout(() => {
                window.location.href = './enquiry.html';
            }, 300);
        }
    }

    populate(values) {
        if (!this.form || !values) return this;

        Object.keys(values).forEach((name) => {
            const field = this.form.elements[name];
            if (!field || typeof values[name] === 'object') return;

            const value = values[name] === null || values[name] === undefined ? '' : values[name];

            if (name === 'fxDate' && this.datePicker) {
                this.datePicker.setDate(value, false);
                return;
            }

            if (this.selects[name]) {
                this.selects[name].setValue(String(value), false);
                return;
            }

            field.value = value;
        });

        if (this.formState) this.formState.resetBaseline();
        return this;
    }

    renderView(values) {
        if (!this.form || !values) return this;

        if (this.datePicker) {
            this.datePicker.destroy();
            this.datePicker = null;
        }

        Object.values(this.selects).forEach((select) => select.destroy());
        this.selects = {};

        this.form.querySelectorAll('input, select, textarea').forEach((field) => {
            const display = document.createElement('div');
            display.className = 'view-value';
            display.textContent = this.viewValue(field.name, values[field.name]);
            field.replaceWith(display);
        });

        return this;
    }

    viewValue(name, value) {
        if (value === null || value === undefined || String(value).trim() === '') {
            return '-';
        }

        switch (name) {
            case 'fxDate':
                return DateUtil.formatDate(value);
            case 'fxCategory':
                return this.referenceDescription('category', value);
            case 'fxCode':
                return this.referenceDescription('code', value);
            case 'fxType':
                return this.referenceDescription('type', value);
            case 'fxCurrency':
                return this.referenceDescription('currency', value);
            default:
                return String(value);
        }
    }

    shouldTrackDirty() {
        return this.options.mode !== TransactionMode.VIEW;
    }

    onError(error) {
        Toast.error(error && error.message ? error.message : 'Failed to save FX transaction.');
        console.error(error);
    }

    buildSelect(selector, items) {
        return new Select2(selector, {
            width: '100%',
            placeholder: 'Select...',
            data: items.map((item) => ({
                id: item.code,
                text: item.description
            }))
        }).build();
    }

    referenceDescription(type, code) {
        const item = (this.references[type] || []).find((entry) => entry.code === code);
        return item ? item.description : code || '';
    }

    validateDecimal(value, message) {
        if (value === null || value === undefined || String(value).trim() === '') return message;
        return Number.isFinite(Number(value)) ? null : message;
    }

    toDecimal(value) {
        return value === null || value === undefined || String(value).trim() === ''
            ? null
            : Number(value);
    }
}

FxTransactionFormAction.Mode = TransactionMode;

export default FxTransactionFormAction;
