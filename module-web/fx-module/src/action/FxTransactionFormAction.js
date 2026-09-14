import Common from '@company/common-js-web';
import { ReferenceType, TransactionMode } from '../FxConstants.js';
import FxService from '../FxService.js';
import FxCreateFormAction from './FxCreateFormAction.js';

const {
    DatePicker,
    DateUtil,
    FormAction,
    FormDataConverter,
    NavigationState,
    Select2,
    Toast,
    Validator
} = Common;

const FormDataType = FormDataConverter.Types;

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
        this.destroyControls();
    }

    getValidationRules() {
        return {
            fxDate: Validator.required('FX Date is required.'),
            fxCategory: Validator.required('Category is required.'),
            fxCode: Validator.required('Code is required.'),
            fxType: Validator.required('Type is required.'),
            fxCurrency: Validator.required('Currency is required.'),
            fxAmount: [
                Validator.required('FX Amount is required.'),
                Validator.decimal('Enter a valid FX amount.')
            ],
            fxRate: [
                Validator.required('FX Rate is required.'),
                Validator.decimal('Enter a valid FX rate.')
            ]
        };
    }

    getDataSchema() {
        return {
            fxDate: FormDataType.DATE,
            fxCategory: FormDataType.SELECT,
            fxCode: FormDataType.SELECT,
            fxType: FormDataType.SELECT,
            fxRefno: FormDataType.TEXT,
            fxParty: FormDataType.TEXT,
            fxPrincipal: FormDataType.TEXT,
            fxCurrency: FormDataType.SELECT,
            fxAmount: FormDataType.DECIMAL,
            fxRate: FormDataType.DECIMAL,
            fxDescription: FormDataType.TEXT
        };
    }

    buildRequestData(values) {
        const data = FormDataConverter.fromForm(values, this.getDataSchema());

        return {
            id: this.options.mode === TransactionMode.EDIT ? Number(this.options.key) : null,
            ...data,
            fxCategoryDescription: this.referenceDescription('category', data.fxCategory),
            fxCodeDescription: this.referenceDescription('code', data.fxCode),
            fxTypeDescription: this.referenceDescription('type', data.fxType),
            fxCurrencyDescription: this.referenceDescription('currency', data.fxCurrency)
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

        const formValues = FormDataConverter.toForm(values, this.getDataSchema());

        Object.keys(formValues).forEach((name) => {
            const field = this.form.elements[name];
            if (!field || typeof formValues[name] === 'object') return;

            const value = formValues[name];

            if (name === 'fxDate' && this.datePicker) {
                this.datePicker.setDate(value, false);
                return;
            }

            if (this.selects[name]) {
                this.selects[name].setValue(value, false);
                return;
            }

            field.value = value;
        });

        if (this.formState) this.formState.resetBaseline();
        return this;
    }

    beforeRenderView() {
        this.destroyControls();
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

    destroyControls() {
        if (this.datePicker) this.datePicker.destroy();
        Object.values(this.selects).forEach((select) => select.destroy());
        this.datePicker = null;
        this.selects = {};
    }

    referenceDescription(type, code) {
        const item = (this.references[type] || []).find((entry) => entry.code === code);
        return item ? item.description : code || '';
    }
}

FxTransactionFormAction.Mode = TransactionMode;

export default FxTransactionFormAction;
