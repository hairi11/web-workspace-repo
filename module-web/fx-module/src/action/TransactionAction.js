import Common from '@company/common-js-web';
import { MasterMode, TransactionMode } from '../FxConstants.js';
import FxService from '../FxService.js';
import FxTransactionFormAction from './FxTransactionFormAction.js';

const { NavigationState, Router, Toast } = Common;

export async function initTransaction() {
    const navigation = NavigationState.consume();
    const {
        action: mode = TransactionMode.CREATE,
        masterId = null,
        key = null
    } = navigation?.page === 'transaction' ? navigation : {};

    if (!masterId) {
        window.location.href = './enquiry.html';
        return;
    }

    try {
        const master = await FxService.findMasterById(masterId);

        if (!master) throw new Error('FX master not found.');

        const action = new FxTransactionFormAction('#transactionForm', {
            mode: mode,
            key: key,
            masterId: masterId,
            status: master.status
        });

        await action.loadReferences();
        action.build();
        bindCancel(masterId);

        await new Router()
            .route(TransactionMode.CREATE, () => configurePage('Add FX Transaction', 'Add'))
            .route(TransactionMode.EDIT, () => initEditTransaction(action, key))
            .dispatch(mode);
    } catch (error) {
        Toast.error('Failed to load FX transaction data.');
        console.error(error);
    }
}

async function initEditTransaction(action, id) {
    const transaction = await FxService.findTransactionById(id);

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

function bindCancel(masterId) {
    const cancel = document.querySelector('#cancelButton');
    if (!cancel) return;

    cancel.addEventListener('click', (event) => {
        event.preventDefault();
        NavigationState.set({
            page: 'master',
            action: MasterMode.EDIT,
            key: masterId
        });
        window.location.href = './master.html';
    });
}
