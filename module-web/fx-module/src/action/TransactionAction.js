import Common from '@company/common-js-web';
import FxService from '../FxService.js';
import FxTransactionFormAction from '../FxTransactionFormAction.js';
import { getCreateDraft } from './fxCreateDraft.js';

const { Toast } = Common;

export async function initTransaction() {
    const params = new URLSearchParams(window.location.search);
    const requestedMode = params.get('mode');
    const transactionId = params.get('id');
    const editIndex = resolveEditIndex(params.get('index'));
    const mode = (requestedMode === 'view' || requestedMode === 'edit') && transactionId
        ? requestedMode
        : 'create';

    const action = new FxTransactionFormAction('#transactionForm', {
        mode: mode,
        id: transactionId,
        editIndex: editIndex
    });

    try {
        await action.loadReferences();
        action.build();

        if (mode === 'view' || mode === 'edit') {
            const response = await FxService.findTransactionById(transactionId);
            const transaction = unwrapObject(response);

            if (!transaction) throw new Error('FX transaction not found.');

            action.populate(transaction);
            configureBackendMode(action, mode);
            return;
        }

        populateDraftTransaction(action, editIndex);
    } catch (error) {
        Toast.error('Failed to load FX transaction data.');
        console.error(error);
    }
}

function resolveEditIndex(value) {
    if (value === null || value === '') return null;
    const index = Number(value);
    return Number.isInteger(index) && index >= 0 ? index : null;
}

function unwrapObject(response) {
    return response && response.data !== undefined ? response.data : response;
}

function configureBackendMode(action, mode) {
    const title = document.querySelector('h1');
    const submitButton = document.querySelector('#transactionForm button[type="submit"]');
    const cancelLink = document.querySelector('#transactionForm .button');

    if (cancelLink) cancelLink.href = './enquiry.html';

    if (mode === 'view') {
        title.textContent = 'View FX Transaction';
        action.setReadOnly(true);
        return;
    }

    title.textContent = 'Edit FX Transaction';
    if (submitButton) submitButton.textContent = 'Save Changes';
}

function populateDraftTransaction(action, editIndex) {
    if (editIndex === null) return;

    const transaction = getCreateDraft().transactions[editIndex];
    if (!transaction) {
        Toast.error('FX transaction not found.');
        window.location.href = './create.html?resume=1';
        return;
    }

    document.querySelector('h1').textContent = 'Edit FX Transaction';
    action.populate(transaction);
}
