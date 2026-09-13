import Common from '@company/common-js-web';
import FxService from '../FxService.js';
import { TransactionMode } from '../FxTransactionMode.js';
import FxCreateFormAction from './FxCreateFormAction.js';
import FxTransactionFormAction from './FxTransactionFormAction.js';

const { NavigationState, Router, Toast } = Common;

export async function initTransaction() {
    const navigation = NavigationState.consume();
    const mode = navigation && navigation.page === 'transaction'
        ? navigation.action
        : TransactionMode.CREATE;
    const key = navigation && navigation.page === 'transaction'
        ? navigation.key
        : null;
    const action = new FxTransactionFormAction('#transactionForm', { mode, key });

    try {
        await action.loadReferences();
        action.build();

        await new Router()
            .route(TransactionMode.CREATE, () => undefined)
            .route(TransactionMode.EDIT_DRAFT, () => initDraftTransaction(action, key))
            .route(TransactionMode.EDIT, () => initExistingTransaction(action, key, {
                title: 'Edit FX Transaction',
                readOnly: false,
                submitLabel: 'Save Changes'
            }))
            .route(TransactionMode.VIEW, () => initExistingTransaction(action, key, {
                title: 'View FX Transaction',
                readOnly: true
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
    configureExistingPage(action, page);
}

function configureExistingPage(action, page) {
    setPageTitle(page.title);

    const submitButton = document.querySelector('#transactionForm button[type="submit"]');
    const cancelLink = document.querySelector('#transactionForm .button');

    if (cancelLink) cancelLink.href = './enquiry.html';
    if (submitButton && page.submitLabel) submitButton.textContent = page.submitLabel;
    if (page.readOnly) action.setReadOnly(true);
}

function setPageTitle(title) {
    const heading = document.querySelector('h1');
    if (heading) heading.textContent = title;
}
