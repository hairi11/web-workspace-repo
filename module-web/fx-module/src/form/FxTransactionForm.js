import Common from '@company/common-js-web';
import { MasterMode, ReferenceType, TransactionMode } from '../FxConstants.js';
import FxRows from '../FxRows.js';
import FxService from '../FxService.js';

const {
    ChoiceInput,
    CurrencyInput,
    DatePicker,
    DateUtil,
    FormAction,
    FormDataConverter,
    Logger,
    NavigationState,
    Toast,
    Validator
} = Common;

const FormDataType = FormDataConverter.Types;
const logger = new Logger('FxTransactionForm');

class FxTransactionForm extends FormAction {
    constructor(selector, options) {
        super(selector);
        this.options = options || {};
        this.references = null;
        this.datePicker = null;
        this.amountInput = null;
        this.choices = {};
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
        this.amountInput = new CurrencyInput('#fxAmount', {
            decimalScale: 4
        }).build();

        this.choices.fxCategory = this.buildChoice('#fxCategory', this.references.category);
        this.choices.fxCode = this.buildChoice('#fxCode', this.references.code);
        this.choices.fxCurrency = this.buildChoice('#fxCurrency', this.references.currency);
        this.choices.fxType = this.buildChoice('#fxType', this.references.type);

        if (this.formState) {
            this.formState.resetBaseline();
        }
    }

    onDestroy() {
        this.destroyControls();
    }

    getValidationRules() {
        return {
            fxDate: [
                Validator.required('FX Date is required.'),
                Validator.custom(async (value) => {
                    if (!value) return null;

                    const result = await FxService.validateFxDate(value);
                    return result && result.valid
                        ? null
                        : (result && result.message ? result.message : 'FX Date is invalid.');
                })
            ],
            fxCategory: Validator.required('Category is required.'),
            fxCode: Validator.required('Code is required.'),
            fxType: Validator.required('Type is required.'),
            fxCurrency: Validator.required('Currency is required.'),
            fxAmount: [
                Validator.required('FX Amount is required.'),
                Validator.decimal(20, 4, 'FX Amount supports up to 16 integer digits and 4 decimal places.')
            ],
            fxRate: [
                Validator.required('FX Rate is required.'),
                Validator.decimal(19, 8, 'FX Rate supports up to 11 integer digits and 8 decimal places.')
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

        const rows = this.saveWorkingRow(context.data);
        if (!rows) return false;

        NavigationState.set({
            page: 'master',
            action: MasterMode.EDIT,
            rowsKey: this.options.rowsKey
        });
        window.location.href = './master.html';
        return false;
    }

    saveWorkingRow(data) {
        if (this.options.mode === TransactionMode.VIEW) return null;

        const index = this.options.mode === TransactionMode.EDIT
            ? this.options.key
            : null;
        const rows = FxRows.upsertTransaction(
            this.options.rowsKey,
            index,
            data
        );

        if (!rows) {
            Toast.error('FX working rows not found.');
            return null;
        }

        if (this.formState) {
            this.formState.resetBaseline();
        }

        return rows;
    }

    async saveDirtyRow() {
        try {
            const formValues = this.serializeForm();

            await this.beforeValidate(formValues, this.form);

            const validation = await this.validateForm(formValues);

            await this.afterValidate(validation, formValues, this.form);

            if (!validation.valid) {
                this.showValidationErrors(validation.errors);
                await this.onValidationError(validation.errors, formValues, this.form);
                return false;
            }

            this.clearValidationErrors();

            const data = await this.buildRequestData(formValues, this.form);
            return Boolean(this.saveWorkingRow(data));
        } catch (error) {
            this.onError(error);
            return false;
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

            if (this.choices[name]) {
                this.choices[name].setValue(value, false);
                return;
            }

            if (name === 'fxAmount' && this.amountInput) {
                this.amountInput.setValue(value, false);
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
        logger.error(error);
    }

    buildChoice(selector, items) {
        return new ChoiceInput(selector, {
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
        if (this.amountInput) this.amountInput.destroy();
        Object.values(this.choices).forEach((choice) => choice.destroy());
        this.datePicker = null;
        this.amountInput = null;
        this.choices = {};
    }

    referenceDescription(type, code) {
        const item = (this.references[type] || []).find((entry) => entry.code === code);
        return item ? item.description : code || '';
    }
}

export default FxTransactionForm;
