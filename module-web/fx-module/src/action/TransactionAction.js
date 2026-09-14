import Common from '@company/common-js-web';
import { TransactionMode } from '../FxConstants.js';
import FxRows from '../FxRows.js';
import FxService from '../FxService.js';
import FxTransactionFormAction from './FxTransactionFormAction.js';

const { FormRenderers, NavigationState, Router, Toast } = Common;

export async function initTransaction() {
    const navigation = NavigationState.consume();
    const {
        action: mode = TransactionMode.CREATE,
        key = null,
        rowsKey = null,
        returnTo = { page: 'enquiry' }
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
                bindReturnButton(returnTo);
            })
            .route(TransactionMode.EDIT, () => {
                initEditTransaction(action, FxRows.get(rowsKey), key);
                bindReturnButton(returnTo);
            })
            .route(TransactionMode.VIEW, () => initViewTransaction(action, key, returnTo))
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

async function initViewTransaction(action, transactionId, returnTo) {
    const transaction = await FxService.findTransactionById(transactionId);

    if (!transaction) throw new Error('FX transaction not found.');

    action.populate(transaction);
    FormRenderers.view(action, transaction);
    configurePage('View FX Transaction', null, true);
    bindReturnButton(returnTo);
}

function configurePage(title, submitLabel, viewMode) {
    const heading = document.querySelector('h1');
    const submitButton = document.querySelector('#transactionForm button[type="submit"]');
    const cancelButton = document.querySelector('#cancelButton');

    if (heading) heading.textContent = title;
    if (submitButton && submitLabel) submitButton.textContent = submitLabel;
    if (submitButton) submitButton.hidden = Boolean(viewMode);
    if (cancelButton) cancelButton.textContent = viewMode ? 'Back' : 'Cancel';
}

function bindReturnButton(returnTo) {
    const button = document.querySelector('#cancelButton');
    if (!button) return;

    button.addEventListener('click', (event) => {
        event.preventDefault();
        navigateTo(returnTo);
    });
}

function navigateTo(target) {
    const destination = target && target.page ? target : { page: 'enquiry' };

    if (destination.page === 'master') {
        NavigationState.set(destination);
        window.location.href = './master.html';
        return;
    }

    window.location.href = './enquiry.html';
}
