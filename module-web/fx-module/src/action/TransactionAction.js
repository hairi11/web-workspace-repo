import Common from '@company/common-js-web';
import { MasterMode, TransactionMode } from '../FxConstants.js';
import FxRows from '../FxRows.js';
import FxService from '../FxService.js';
import FxTransactionFormAction from './FxTransactionFormAction.js';

const { FormRenderers, NavigationState, Router, Toast } = Common;

export async function initTransaction() {
    const navigation = NavigationState.consume();
    const {
        action: mode = TransactionMode.CREATE,
        key = null,
        rowsKey = null
    } = navigation?.page === 'transaction' ? navigation : {};

    if (mode !== TransactionMode.VIEW && !FxRows.get(rowsKey)) {
        window.location.href = './enquiry.html';
        return;
    }

    try {
        const action = new FxTransactionFormAction('#transactionForm', {
            mode: mode,
            key: key,
            rowsKey: rowsKey
        });

        await action.loadReferences();
        action.build();

        await new Router()
            .route(TransactionMode.CREATE, () => {
                configurePage('Add FX Transaction', 'Add', false);
                bindBackToMaster(rowsKey);
            })
            .route(TransactionMode.EDIT, () => {
                initEditTransaction(action, FxRows.get(rowsKey), key);
                bindBackToMaster(rowsKey);
            })
            .route(TransactionMode.VIEW, () => initViewTransaction(action, key))
            .dispatch(mode);
    } catch (error) {
        Toast.error('Failed to load FX transaction data.');
        console.error(error);
    }
}

function initEditTransaction(action, rows, index) {
    const transaction = rows && Number.isInteger(index)
        ? rows.transactions[index]
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

function bindBackToMaster(rowsKey) {
    const cancel = document.querySelector('#cancelButton');
    if (!cancel) return;

    cancel.addEventListener('click', (event) => {
        event.preventDefault();
        NavigationState.set({
            page: 'master',
            action: MasterMode.EDIT,
            rowsKey: rowsKey
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
