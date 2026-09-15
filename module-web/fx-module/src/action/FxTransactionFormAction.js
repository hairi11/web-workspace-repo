import Common from '@company/common-js-web';
import { MasterMode, ReferenceType, TransactionMode } from '../FxConstants.js';
import FxRows from '../FxRows.js';
import FxService from '../FxService.js';

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
        const rows = FxRows.get(this.options.rowsKey);
        const index = this.options.mode === TransactionMode.EDIT
            ? this.options.key
            : null;
        const existing = rows && Number.isInteger(index)
            ? rows.transactions[index] || {}
            : {};
        const data = FormDataConverter.fromForm(values, this.getDataSchema());

        return {
            id: existing.id || null,
            masterId: rows && rows.master ? rows.master.id || null : null,
            recordNo: existing.recordNo || null,
            status: rows && rows.master ? rows.master.status || 'DRAFT' : 'DRAFT',
            ...data
        };
    }

    beforeSubmit(context) {
        if (this.options.mode === TransactionMode.VIEW) return false;

        const index = this.options.mode === TransactionMode.EDIT
            ? this.options.key
            : null;
        const rows = FxRows.upsertTransaction(
            this.options.rowsKey,
            index,
            context.data
        );

        if (!rows) {
            Toast.error('FX working rows not found.');
            return false;
        }

        NavigationState.set({
            page: 'master',
            action: MasterMode.EDIT,
            rowsKey: this.options.rowsKey
        });
        window.location.href = './master.html';
        return false;
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
        Toast.error(error && error.message ? error.message : 'Failed to update FX transaction.');
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

export default FxTransactionFormAction;
