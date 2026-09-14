import Common from '@company/common-js-web';
import { MasterMode } from '../FxConstants.js';
import FxService from '../FxService.js';

const { FormAction, NavigationState, Toast } = Common;

class FxMasterFormAction extends FormAction {
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
                id: this.master ? this.master.id : null
            },
            transactions: this.transactions.map((transaction) => ({
                id: transaction.id,
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

        return undefined;
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
            : this.master.id;

        Toast.success(
            submitted
                ? 'FX record submitted successfully.'
                : 'FX draft saved successfully.'
        );

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
        console.error(error);
    }

    getSubmitAction(context) {
        return context && context.submitter
            ? context.submitter.value
            : 'save';
    }
}

export default FxMasterFormAction;
