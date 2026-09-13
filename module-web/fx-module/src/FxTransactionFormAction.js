import Common from '@company/common-js-web';
import FxService from './FxService.js';
import { upsertTransaction } from './action/fxCreateDraft.js';

const { FormAction, Toast } = Common;

const REFERENCE_TYPES = {
    category: 'FX_CATEGORY',
    code: 'FX_CODE',
    currency: 'FX_CURRENCY',
    type: 'FX_TYPE'
};

export const TransactionFlow = {
    CREATE: 'create',
    DRAFT_EDIT: 'draft-edit',
    BACKEND_EDIT: 'backend-edit',
    VIEW: 'view'
};

class FxTransactionFormAction extends FormAction {
    constructor(selector, flow, recordKey) {
        super(selector);
        this.flow = flow;
        this.recordKey = recordKey;
        this.references = null;
    }

    async loadReferences() {
        const [categories, codes, currencies, types] = await Promise.all([
            FxService.findReferences(REFERENCE_TYPES.category),
            FxService.findReferences(REFERENCE_TYPES.code),
            FxService.findReferences(REFERENCE_TYPES.currency),
            FxService.findReferences(REFERENCE_TYPES.type)
        ]);

        this.references = {
            category: this.unwrapData(categories),
            code: this.unwrapData(codes),
            currency: this.unwrapData(currencies),
            type: this.unwrapData(types)
        };

        return this.references;
    }

    onBuild() {
        if (!this.references) return;
        this.fillSelect('fxCategory', this.references.category);
        this.fillSelect('fxCode', this.references.code);
        this.fillSelect('fxCurrency', this.references.currency);
        this.fillSelect('fxType', this.references.type);
    }

    getValidationRules() {
        const required = (message) => (value) => String(value || '').trim() ? null : message;
        const decimal = (message) => (value) => {
            if (value === null || value === undefined || String(value).trim() === '') return message;
            return Number.isFinite(Number(value)) ? null : message;
        };

        return {
            fxDate: required('FX Date is required.'),
            fxCategory: required('Category is required.'),
            fxCode: required('Code is required.'),
            fxType: required('Type is required.'),
            fxCurrency: required('Currency is required.'),
            fxAmount: decimal('Enter a valid FX amount.'),
            fxRate: decimal('Enter a valid FX rate.')
        };
    }

    buildRequestData(values) {
        return {
            id: this.flow === TransactionFlow.BACKEND_EDIT ? Number(this.recordKey) : null,
            fxDate: values.fxDate || '',
            fxCategory: values.fxCategory || '',
            fxCategoryDescription: this.selectedText('fxCategory'),
            fxCode: values.fxCode || '',
            fxCodeDescription: this.selectedText('fxCode'),
            fxType: values.fxType || '',
            fxTypeDescription: this.selectedText('fxType'),
            fxRefno: values.fxRefno || '',
            fxParty: values.fxParty || '',
            fxPrincipal: values.fxPrincipal || '',
            fxCurrency: values.fxCurrency || '',
            fxCurrencyDescription: this.selectedText('fxCurrency'),
            fxAmount: this.toDecimal(values.fxAmount),
            fxRate: this.toDecimal(values.fxRate),
            fxDescription: values.fxDescription || ''
        };
    }

    beforeSubmit(context) {
        if (this.flow === TransactionFlow.CREATE || this.flow === TransactionFlow.DRAFT_EDIT) {
            const index = this.flow === TransactionFlow.DRAFT_EDIT ? this.recordKey : null;
            upsertTransaction(index, context.data);
            window.location.href = './create.html?resume=1';
            return false;
        }

        return undefined;
    }

    sendRequest(context) {
        if (this.flow === TransactionFlow.BACKEND_EDIT) {
            return FxService.updateTransaction(this.recordKey, context.data);
        }

        return super.sendRequest(context);
    }

    async onSuccess() {
        if (this.flow !== TransactionFlow.BACKEND_EDIT) return;

        Toast.success('FX transaction updated.');
        window.setTimeout(() => {
            window.location.href = './enquiry.html';
        }, 300);
    }

    populate(values) {
        if (!this.form || !values) return this;

        Object.keys(values).forEach((name) => {
            const field = this.form.elements[name];
            if (!field || typeof values[name] === 'object') return;
            field.value = values[name] === null || values[name] === undefined ? '' : values[name];
        });

        if (this.formState) this.formState.resetBaseline();
        return this;
    }

    setReadOnly() {
        if (!this.form) return this;

        this.form.querySelectorAll('input, select, textarea').forEach((element) => {
            element.disabled = true;
        });

        const submitButton = this.form.querySelector('button[type="submit"]');
        if (submitButton) submitButton.hidden = true;
        return this;
    }

    shouldTrackDirty() {
        return this.flow !== TransactionFlow.VIEW;
    }

    onError(error) {
        Toast.error(error && error.message ? error.message : 'Failed to save FX transaction.');
        console.error(error);
    }

    unwrapData(response) {
        if (Array.isArray(response)) return response;
        return response && Array.isArray(response.data) ? response.data : [];
    }

    fillSelect(name, items) {
        const select = this.form.elements[name];
        if (!select) return;

        select.innerHTML = '';
        select.appendChild(new Option('Select...', ''));
        items.forEach((item) => select.appendChild(new Option(item.description, item.code)));
    }

    selectedText(name) {
        const select = this.form && this.form.elements[name];
        if (!select) return '';
        const option = select.options[select.selectedIndex];
        return option && select.value ? option.text : '';
    }

    toDecimal(value) {
        return value === null || value === undefined || String(value).trim() === ''
            ? null
            : Number(value);
    }
}

export default FxTransactionFormAction;
