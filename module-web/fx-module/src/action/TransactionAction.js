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

    const isView = TransactionMode.isView(mode);

    try {
        // LOAD
        let rows = null;

        if (!isView) {
            rows = FxRows.get(rowsKey);
        }

        if (!isView && !rows) {
            window.location.href = './enquiry.html';
            return;
        }

        let transaction = null;
        let pageConfig = null;

        await new Router()
            .route(TransactionMode.CREATE, () => {
                pageConfig = {
                    title: 'Add FX Transaction',
                    submitLabel: 'Add',
                    viewMode: false
                };
            })
            .route(TransactionMode.EDIT, () => {
                transaction = Number.isInteger(key)
                    ? rows.transactions[key]
                    : null;

                if (!transaction) throw new Error('FX transaction not found.');

                pageConfig = {
                    title: 'Update FX Transaction',
                    submitLabel: 'Update',
                    viewMode: false
                };
            })
            .route(TransactionMode.VIEW, async () => {
                transaction = await FxService.findTransactionById(key);

                if (!transaction) throw new Error('FX transaction not found.');

                pageConfig = {
                    title: 'View FX Transaction',
                    submitLabel: null,
                    viewMode: true
                };
            })
            .dispatch(mode);

        const action = new FxTransactionFormAction('#transactionForm', {
            mode: mode,
            key: key,
            rowsKey: rowsKey
        });

        await action.loadReferences();

        // BUILD
        action.build();

        // POPULATE
        if (transaction) action.populate(transaction);

        // CONFIGURE
        if (pageConfig.viewMode) {
            FormRenderers.view(action, transaction);
        }

        configurePage(
            pageConfig.title,
            pageConfig.submitLabel,
            pageConfig.viewMode
        );
        configureRowNavigation(mode, key, rows);

        // BIND
        bindReturnButton(returnTo);
        bindRowNavigation(action, mode, key, rowsKey, rows, returnTo);
    } catch (error) {
        Toast.error('Failed to load FX transaction data.');
        console.error(error);
    }
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

function configureRowNavigation(mode, key, rows) {
    const previousButton = document.querySelector('#previousButton');
    const nextButton = document.querySelector('#nextButton');
    const viewMode = TransactionMode.isView(mode);

    if (previousButton) previousButton.hidden = viewMode;
    if (nextButton) nextButton.hidden = viewMode;

    if (viewMode || !rows) return;

    const currentIndex = TransactionMode.isCreate(mode)
        ? rows.transactions.length
        : key;
    const lastIndex = rows.transactions.length;

    if (previousButton) {
        previousButton.disabled = !Number.isInteger(currentIndex) || currentIndex <= 0;
    }

    if (nextButton) {
        nextButton.disabled = !Number.isInteger(currentIndex) || currentIndex >= lastIndex;
    }
}

function bindRowNavigation(action, mode, key, rowsKey, rows, returnTo) {
    if (TransactionMode.isView(mode) || !rows) return;

    const previousButton = document.querySelector('#previousButton');
    const nextButton = document.querySelector('#nextButton');
    const currentIndex = TransactionMode.isCreate(mode)
        ? rows.transactions.length
        : key;

    if (previousButton) {
        previousButton.addEventListener('click', () => {
            navigateToRow(action, currentIndex - 1, rows, rowsKey, returnTo);
        });
    }

    if (nextButton) {
        nextButton.addEventListener('click', () => {
            navigateToRow(action, currentIndex + 1, rows, rowsKey, returnTo);
        });
    }
}

function navigateToRow(action, targetIndex, rows, rowsKey, returnTo) {
    if (!Number.isInteger(targetIndex) || targetIndex < 0 || targetIndex > rows.transactions.length) {
        return;
    }

    if (action.isDirty() && !window.confirm('Discard unsaved changes and move to another transaction?')) {
        return;
    }

    const createMode = targetIndex === rows.transactions.length;

    NavigationState.set({
        page: 'transaction',
        action: createMode ? TransactionMode.CREATE : TransactionMode.EDIT,
        key: createMode ? null : targetIndex,
        rowsKey: rowsKey,
        returnTo: returnTo
    });
    window.location.href = './transaction.html';
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
