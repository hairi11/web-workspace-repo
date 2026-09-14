import Common from '@company/common-js-web';
import { TransactionMode } from '../FxConstants.js';
import FxService from '../FxService.js';
import FxCreateFormAction from './FxCreateFormAction.js';
import FxTransactionFormAction from './FxTransactionFormAction.js';

const { NavigationState, Router, Toast } = Common;

export async function initTransaction() {
    const navigation = NavigationState.consume();
    const {
        action: mode = TransactionMode.CREATE,
        key = null
    } = navigation?.page === 'transaction' ? navigation : {};
    const action = new FxTransactionFormAction('#transactionForm', { mode, key });

    try {
        await action.loadReferences();
        action.build();

        await new Router()
            .route(TransactionMode.CREATE, () => undefined)
            .route(TransactionMode.EDIT_DRAFT, () => initDraftTransaction(action, key))
            .route(TransactionMode.EDIT, () => initExistingTransaction(action, key, {
                title: 'Edit FX Transaction',
                submitLabel: 'Save Changes'
            }))
            .route(TransactionMode.VIEW, () => initExistingTransaction(action, key, {
                title: 'View FX Transaction',
                viewMode: true
            }))
            .dispatch(mode);
    } catch (error) {
        Toast.error('Failed to load FX transaction data.');
        console.error(error);
    }
}

function initDraftTransaction(action, index) {
    const transaction = FxCreateFormAction.getDraft().transactions[index];

    if (!transaction) {
        Toast.error('FX transaction not found.');
        NavigationState.set({ page: 'create', action: 'resume' });
        window.location.href = './create.html';
        return;
    }

    setPageTitle('Edit FX Transaction');
    action.populate(transaction);
}

async function initExistingTransaction(action, id, page) {
    const transaction = await FxService.findTransactionById(id);

    if (!transaction) throw new Error('FX transaction not found.');

    action.populate(transaction);

    if (page.viewMode) {
        renderTransactionView(action, transaction);
    }

    configureExistingPage(page);
}

function renderTransactionView(action, values) {
    if (action.datePicker) {
        action.datePicker.destroy();
        action.datePicker = null;
    }

    Object.values(action.selects).forEach((select) => select.destroy());
    action.selects = {};

    const form = document.querySelector('#transactionForm');
    if (!form) return;

    form.querySelectorAll('input, select, textarea').forEach((field) => {
        const display = document.createElement('div');
        display.className = 'view-value';
        display.textContent = action.viewValue(field.name, values[field.name]);
        field.replaceWith(display);
    });
}

function configureExistingPage(page) {
    setPageTitle(page.title);

    const submitButton = document.querySelector('#transactionForm button[type="submit"]');
    const cancelLink = document.querySelector('#transactionForm .button');

    if (cancelLink) {
        cancelLink.href = './enquiry.html';
        if (page.viewMode) cancelLink.textContent = 'Back';
    }

    if (submitButton && page.submitLabel) submitButton.textContent = page.submitLabel;
    if (submitButton && page.viewMode) submitButton.hidden = true;
}

function setPageTitle(title) {
    const heading = document.querySelector('h1');
    if (heading) heading.textContent = title;
}
