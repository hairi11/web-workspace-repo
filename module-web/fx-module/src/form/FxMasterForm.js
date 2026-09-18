import Common from '@company/common-js-web';
import { MasterMode } from '../FxConstants.js';
import FxRows from '../FxRows.js';
import FxService from '../FxService.js';

const { FormAction, Logger, NavigationState, Toast } = Common;

const logger = new Logger('FxMasterForm');

class FxMasterForm extends FormAction {
    constructor(selector, options) {
        super(selector);
        this.options = options || {};
        this.master = this.options.master || null;
        this.transactions = Array.isArray(this.options.transactions)
            ? this.options.transactions
            : [];
    }

    setTransactions(transactions) {
        this.transactions = Array.isArray(transactions) ? transactions : [];
        return this;
    }

    buildRequestData() {
        return {
            master: {
                id: this.master ? this.master.id : null,
                status: this.master ? this.master.status : 'DRAFT',
                reportDate: this.master ? this.master.reportDate : null
            },
            transactions: this.transactions.map((transaction) => ({
                id: transaction.id,
                masterId: transaction.masterId,
                recordNo: transaction.recordNo,
                status: transaction.status,
                fxDate: transaction.fxDate,
                fxCategory: transaction.fxCategory,
                fxCode: transaction.fxCode,
                fxType: transaction.fxType,
                fxRefno: transaction.fxRefno,
                fxParty: transaction.fxParty,
                fxPrincipal: transaction.fxPrincipal,
                fxCurrency: transaction.fxCurrency,
                fxAmount: transaction.fxAmount,
                fxRate: transaction.fxRate,
                fxDescription: transaction.fxDescription
            }))
        };
    }

    beforeSubmit(context) {
        if (!context.data.transactions.length) {
            Toast.error('Add at least one FX transaction.');
            return false;
        }

    }

    sendRequest(context) {
        return this.getSubmitAction(context) === 'submit'
            ? FxService.submit(context.data)
            : FxService.save(context.data);
    }

    onSuccess(response, context) {
        const submitted = this.getSubmitAction(context) === 'submit';
        const masterId = response && response.master && response.master.id
            ? response.master.id
            : (this.master ? this.master.id : null);

        Toast.success(
            submitted
                ? 'FX record submitted successfully.'
                : 'FX draft saved successfully.'
        );

        FxRows.clear(this.options.rowsKey);

        NavigationState.set({
            page: 'master',
            action: MasterMode.VIEW,
            key: masterId
        });

        window.setTimeout(() => {
            window.location.href = './master.html';
        }, 300);
    }

    onError(error, context) {
        const submitted = this.getSubmitAction(context) === 'submit';

        Toast.error(
            submitted
                ? 'Failed to submit FX record.'
                : 'Failed to save FX draft.'
        );
        logger.error(error);
    }

    getSubmitAction(context) {
        return context && context.submitter
            ? context.submitter.value
            : 'save';
    }
}

export default FxMasterForm;
