import Common from '@company/common-js-web';
import FxService from '../FxService.js';
import FxTransactionFormAction, { TransactionFlow } from '../FxTransactionFormAction.js';
import { getCreateDraft } from './fxCreateDraft.js';

const { Toast } = Common;

export async function initTransaction() {
    const params = new URLSearchParams(window.location.search);
    const route = resolveRoute(params);
    const action = new FxTransactionFormAction('#transactionForm', route.flow, route.key);

    try {
        await action.loadReferences();
        action.build();

        if (route.flow === TransactionFlow.BACKEND_EDIT || route.flow === TransactionFlow.VIEW) {
            const response = await FxService.findTransactionById(route.key);
            const transaction = unwrapObject(response);

            if (!transaction) throw new Error('FX transaction not found.');

            action.populate(transaction);
            configureBackendPage(action, route.flow);
            return;
        }

        if (route.flow === TransactionFlow.DRAFT_EDIT) {
            populateDraftTransaction(action, route.key);
        }
    } catch (error) {
        Toast.error('Failed to load FX transaction data.');
        console.error(error);
    }
}

function resolveRoute(params) {
    const mode = params.get('mode');
    const id = params.get('id');
    const index = parseIndex(params.get('index'));

    if (mode === 'view' && id) {
        return { flow: TransactionFlow.VIEW, key: id };
    }

    if (mode === 'edit' && id) {
        return { flow: TransactionFlow.BACKEND_EDIT, key: id };
    }

    if (index !== null) {
        return { flow: TransactionFlow.DRAFT_EDIT, key: index };
    }

    return { flow: TransactionFlow.CREATE, key: null };
}

function parseIndex(value) {
    if (value === null || value === '') return null;
    const index = Number(value);
    return Number.isInteger(index) && index >= 0 ? index : null;
}

function unwrapObject(response) {
    return response && response.data !== undefined ? response.data : response;
}

function configureBackendPage(action, flow) {
    const title = document.querySelector('h1');
    const submitButton = document.querySelector('#transactionForm button[type="submit"]');
    const cancelLink = document.querySelector('#transactionForm .button');

    if (cancelLink) cancelLink.href = './enquiry.html';

    if (flow === TransactionFlow.VIEW) {
        title.textContent = 'View FX Transaction';
        action.setReadOnly();
        return;
    }

    title.textContent = 'Edit FX Transaction';
    if (submitButton) submitButton.textContent = 'Save Changes';
}

function populateDraftTransaction(action, index) {
    const transaction = getCreateDraft().transactions[index];
    if (!transaction) {
        Toast.error('FX transaction not found.');
        window.location.href = './create.html?resume=1';
        return;
    }

    document.querySelector('h1').textContent = 'Edit FX Transaction';
    action.populate(transaction);
}
