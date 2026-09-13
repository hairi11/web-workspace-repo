import Common from '@company/common-js-web';
import FxService from '../FxService.js';
import { TransactionMode } from '../FxTransactionMode.js';
import FxCreateFormAction from './FxCreateFormAction.js';

const {
    DatePicker,
    FormAction,
    NavigationState,
    Select2,
    Toast,
    Validator
} = Common;

const REFERENCE_TYPES = {
    category: 'FX_CATEGORY',
    code: 'FX_CODE',
    currency: 'FX_CURRENCY',
    type: 'FX_TYPE'
};

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
            FxService.findReferences(REFERENCE_TYPES.category),
            FxService.findReferences(REFERENCE_TYPES.code),
            FxService.findReferences(REFERENCE_TYPES.currency),
            FxService.findReferences(REFERENCE_TYPES.type)
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

    setReadOnly(readOnly) {
        if (!this.form) return this;

        if (this.selects.fxCategory) this.selects.fxCategory.disable();
        if (this.selects.fxCode) this.selects.fxCode.disable();
        if (this.selects.fxCurrency) this.selects.fxCurrency.disable();
        if (this.selects.fxType) this.selects.fxType.disable();

        this.form.querySelectorAll('input, textarea').forEach((element) => {
            element.disabled = Boolean(readOnly);
        });

        const submitButton = this.form.querySelector('button[type="submit"]');
        if (submitButton) submitButton.hidden = Boolean(readOnly);
        return this;
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
