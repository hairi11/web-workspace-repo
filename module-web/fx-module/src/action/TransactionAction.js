import Common from '@company/common-js-web';
import { MasterMode, TransactionMode } from '../FxConstants.js';
import FxDraft from '../FxDraft.js';
import FxTransactionFormAction from './FxTransactionFormAction.js';

const { NavigationState, Router, Toast } = Common;

export async function initTransaction() {
    const navigation = NavigationState.consume();
    const {
        action: mode = TransactionMode.CREATE,
        key = null,
        draftKey = null
    } = navigation?.page === 'transaction' ? navigation : {};
    const draft = FxDraft.get(draftKey);

    if (!draft) {
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
        bindCancel(draftKey);

        await new Router()
            .route(TransactionMode.CREATE, () => configurePage('Add FX Transaction', 'Add'))
            .route(TransactionMode.EDIT, () => initEditTransaction(action, draft, key))
            .dispatch(mode);
    } catch (error) {
        Toast.error('Failed to load FX transaction data.');
        console.error(error);
    }
}

function initEditTransaction(action, draft, index) {
    const transaction = Number.isInteger(index)
        ? draft.transactions[index]
        : null;

    if (!transaction) throw new Error('FX transaction not found.');

    action.populate(transaction);
    configurePage('Update FX Transaction', 'Update');
}

function configurePage(title, submitLabel) {
    const heading = document.querySelector('h1');
    const submitButton = document.querySelector('#transactionForm button[type="submit"]');

    if (heading) heading.textContent = title;
    if (submitButton) submitButton.textContent = submitLabel;
}

function bindCancel(draftKey) {
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
