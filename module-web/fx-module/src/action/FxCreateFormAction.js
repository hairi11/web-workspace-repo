import Common from '@company/common-js-web';
import FxService from '../FxService.js';

const { FormAction, Storage, Toast } = Common;

const DRAFT_KEY = 'fx.create.draft';
const storage = new Storage(window.sessionStorage);

function emptyDraft() {
    return {
        master: { id: null },
        transactions: []
    };
}

class FxCreateFormAction extends FormAction {
    static getDraft() {
        const draft = storage.get(DRAFT_KEY);
        return draft && Array.isArray(draft.transactions) ? draft : emptyDraft();
    }

    static saveDraft(draft) {
        storage.set(DRAFT_KEY, draft);
        return draft;
    }

    static clearDraft() {
        storage.remove(DRAFT_KEY);
    }

    static upsertTransaction(index, transaction) {
        const draft = FxCreateFormAction.getDraft();

        if (Number.isInteger(index) && index >= 0 && index < draft.transactions.length) {
            draft.transactions[index] = transaction;
        } else {
            draft.transactions.push(transaction);
        }

        return FxCreateFormAction.saveDraft(draft);
    }

    static removeTransaction(index) {
        const draft = FxCreateFormAction.getDraft();

        if (Number.isInteger(index) && index >= 0 && index < draft.transactions.length) {
            draft.transactions.splice(index, 1);
            FxCreateFormAction.saveDraft(draft);
        }

        return draft;
    }

    buildRequestData() {
        const draft = FxCreateFormAction.getDraft();

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

        FxCreateFormAction.clearDraft();

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
