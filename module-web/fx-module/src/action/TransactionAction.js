import Common from '@company/common-js-web';
import FxService from '../FxService.js';
import FxTransactionFormAction, { TransactionMode } from '../FxTransactionFormAction.js';
import { getCreateDraft } from './fxCreateDraft.js';

const { NavigationState, Router, Toast } = Common;

export async function initTransaction() {
    const navigation = NavigationState.consume({
        page: 'transaction',
        action: TransactionMode.CREATE
    });
    const route = resolveRoute(navigation);
    const action = new FxTransactionFormAction('#transactionForm', route);

    try {
        await action.loadReferences();
        action.build();

        await new Router()
            .route(TransactionMode.CREATE, () => initCreateTransaction())
            .route(TransactionMode.EDIT_DRAFT, () => initDraftTransaction(action, route.key))
            .route(TransactionMode.EDIT, () => initExistingTransaction(action, route.key, {
                title: 'Edit FX Transaction',
                readOnly: false,
                submitLabel: 'Save Changes'
            }))
            .route(TransactionMode.VIEW, () => initExistingTransaction(action, route.key, {
                title: 'View FX Transaction',
                readOnly: true
            }))
            .dispatch(route.mode);
    } catch (error) {
        Toast.error('Failed to load FX transaction data.');
        console.error(error);
    }
}

function resolveRoute(navigation) {
    if (!navigation || navigation.page !== 'transaction') {
        return { mode: TransactionMode.CREATE, key: null };
    }

    if (navigation.action === TransactionMode.VIEW || navigation.action === TransactionMode.EDIT) {
        return { mode: navigation.action, key: navigation.id };
    }

    if (navigation.action === TransactionMode.EDIT_DRAFT) {
        return { mode: navigation.action, key: navigation.index };
    }

    return { mode: TransactionMode.CREATE, key: null };
}

function initCreateTransaction() {
    return undefined;
}

function initDraftTransaction(action, index) {
    const transaction = getCreateDraft().transactions[index];
    if (!transaction) {
        Toast.error('FX transaction not found.');
        window.location.href = './create.html?resume=1';
        return;
    }

    setPageTitle('Edit FX Transaction');
    action.populate(transaction);
}

async function initExistingTransaction(action, id, page) {
    const response = await FxService.findTransactionById(id);
    const transaction = unwrapObject(response);

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

function unwrapObject(response) {
    return response && response.data !== undefined ? response.data : response;
}
