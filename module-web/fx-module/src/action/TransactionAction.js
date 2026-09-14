import Common from '@company/common-js-web';
import { MasterMode, TransactionMode } from '../FxConstants.js';
import FxDraft from '../FxDraft.js';
import FxService from '../FxService.js';
import FxTransactionFormAction from './FxTransactionFormAction.js';

const { FormRenderers, NavigationState, Router, Toast } = Common;

export async function initTransaction() {
    const navigation = NavigationState.consume();
    const {
        action: mode = TransactionMode.CREATE,
        key = null,
        draftKey = null
    } = navigation?.page === 'transaction' ? navigation : {};

    if (mode !== TransactionMode.VIEW && !FxDraft.get(draftKey)) {
        window.location.href = './enquiry.html';
        return;
    }

    try {
        const action = new FxTransactionFormAction('#transactionForm', {
            mode: mode,
            key: key,
            draftKey: draftKey
        });

        await action.loadReferences();
        action.build();

        await new Router()
            .route(TransactionMode.CREATE, () => {
                configurePage('Add FX Transaction', 'Add', false);
                bindBackToMaster(draftKey);
            })
            .route(TransactionMode.EDIT, () => {
                initEditTransaction(action, FxDraft.get(draftKey), key);
                bindBackToMaster(draftKey);
            })
            .route(TransactionMode.VIEW, () => initViewTransaction(action, key))
            .dispatch(mode);
    } catch (error) {
        Toast.error('Failed to load FX transaction data.');
        console.error(error);
    }
}

function initEditTransaction(action, draft, index) {
    const transaction = draft && Number.isInteger(index)
        ? draft.transactions[index]
        : null;

    if (!transaction) throw new Error('FX transaction not found.');

    action.populate(transaction);
    configurePage('Update FX Transaction', 'Update', false);
}

async function initViewTransaction(action, transactionId) {
    const transaction = await FxService.findTransactionById(transactionId);

    if (!transaction) throw new Error('FX transaction not found.');

    action.populate(transaction);
    FormRenderers.view(action, transaction);
    configurePage('View FX Transaction', null, true);
    bindBackToEnquiry();
}

function configurePage(title, submitLabel, viewMode) {
    const heading = document.querySelector('h1');
    const submitButton = document.querySelector('#transactionForm button[type="submit"]');
    const cancelButton = document.querySelector('#cancelButton');

    if (heading) heading.textContent = title;
    if (submitButton && submitLabel) submitButton.textContent = submitLabel;
    if (submitButton) submitButton.hidden = Boolean(viewMode);
    if (cancelButton && viewMode) cancelButton.textContent = 'Back';
}

function bindBackToMaster(draftKey) {
    const cancel = document.querySelector('#cancelButton');
    if (!cancel) return;

    cancel.addEventListener('click', (event) => {
        event.preventDefault();
        NavigationState.set({
            page: 'master',
            action: MasterMode.EDIT,
            draftKey: draftKey
        });
        window.location.href = './master.html';
    });
}

function bindBackToEnquiry() {
    const back = document.querySelector('#cancelButton');
    if (!back) return;

    back.addEventListener('click', (event) => {
        event.preventDefault();
        window.location.href = './enquiry.html';
    });
}
