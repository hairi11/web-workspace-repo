import Common from '@company/common-js-web';
import FxService from './FxService.js';
import {
    clearCreateDraft,
    getCreateDraft
} from './action/fxCreateDraft.js';

const { FormAction, Toast } = Common;

class FxCreateFormAction extends FormAction {
    buildRequestData() {
        const draft = getCreateDraft();

        return {
            master: {
                id: null
            },
            transactions: draft.transactions.map((transaction) => ({
                id: null,
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

        Toast.success(
            submitted
                ? 'FX record submitted successfully.'
                : 'FX draft saved successfully.'
        );

        clearCreateDraft();

        window.setTimeout(() => {
            window.location.href = './enquiry.html';
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

export default FxCreateFormAction;
