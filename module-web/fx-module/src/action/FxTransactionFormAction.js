import Common from '@company/common-js-web';
import { MasterMode, ReferenceType, TransactionMode } from '../FxConstants.js';
import FxDraft from '../FxDraft.js';
import FxService from '../FxService.js';

const {
    DatePicker,
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
        const draft = FxDraft.get();
        const index = this.options.mode === TransactionMode.EDIT
            ? this.options.key
            : null;
        const existing = draft && Number.isInteger(index)
            ? draft.transactions[index] || {}
            : {};
        const data = FormDataConverter.fromForm(values, this.getDataSchema());

        return {
            id: existing.id || null,
            masterId: draft && draft.master ? draft.master.id || null : null,
            recordNo: existing.recordNo || null,
            status: draft && draft.master ? draft.master.status || 'DRAFT' : 'DRAFT',
            ...data
        };
    }

    beforeSubmit(context) {
        const index = this.options.mode === TransactionMode.EDIT
            ? this.options.key
            : null;

        FxDraft.upsertTransaction(index, context.data);

        NavigationState.set({
            page: 'master',
            action: MasterMode.EDIT
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

    shouldTrackDirty() {
        return true;
    }

    onError(error) {
        Toast.error(error && error.message ? error.message : 'Failed to update FX transaction draft.');
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
}

FxTransactionFormAction.Mode = TransactionMode;

export default FxTransactionFormAction;
