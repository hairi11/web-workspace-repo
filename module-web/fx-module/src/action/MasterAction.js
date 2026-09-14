import Common from '@company/common-js-web';
import { MasterMode, TransactionMode } from '../FxConstants.js';
import FxService from '../FxService.js';
import FxMasterFormAction from './FxMasterFormAction.js';

const { DataTableBuilder, DateUtil, NavigationState, Renderers, Toast } = Common;

let table = null;
let formAction = null;
let transactions = [];

export async function initMaster() {
    const navigation = NavigationState.consume();
    const {
        action: mode = MasterMode.VIEW,
        key: masterId = null
    } = navigation?.page === 'master' ? navigation : {};

    if (!masterId) {
        window.location.href = './enquiry.html';
        return;
    }

    try {
        const [master, rows] = await Promise.all([
            FxService.findMasterById(masterId),
            FxService.findTransactionsByMasterId(masterId)
        ]);

        if (!master) throw new Error('FX master not found.');

        transactions = rows;
        renderMasterSummary(master);
        configurePage(mode);

        formAction = new FxMasterFormAction('#fxMasterForm', {
            master: master,
            transactions: transactions
        }).build();

        table = buildTable(mode, master.id);

        if (mode === MasterMode.EDIT) {
            bindAddTransaction(master.id);
        }
    } catch (error) {
        Toast.error('Failed to load FX master.');
        console.error(error);
    }
}

function renderMasterSummary(master) {
    const status = document.querySelector('#masterStatus');
    const reportDate = document.querySelector('#masterReportDate');

    if (status) status.textContent = master.status || '-';
    if (reportDate) {
        reportDate.textContent = master.reportDate
            ? DateUtil.formatDate(master.reportDate)
            : '-';
    }
}

function configurePage(mode) {
    const editing = mode === MasterMode.EDIT;
    const heading = document.querySelector('h1');
    const addButton = document.querySelector('#addTransactionButton');
    const saveButton = document.querySelector('#saveButton');
    const submitButton = document.querySelector('#submitButton');
    const backButton = document.querySelector('#backButton');

    if (heading) heading.textContent = editing ? 'Edit FX Master' : 'View FX Master';
    if (addButton) addButton.hidden = !editing;
    if (saveButton) saveButton.hidden = !editing;
    if (submitButton) submitButton.hidden = !editing;
    if (backButton) backButton.hidden = editing;
}

function buildTable(mode, masterId) {
    const builder = new DataTableBuilder('#fxMasterTable')
        .data(getRows())
        .option('paging', false)
        .option('info', false)
        .option('ordering', false)
        .column('recordNo', 'No.')
        .renderer('fxDate', 'FX Date', Renderers.date())
        .column('fxCategory', 'Category')
        .column('fxCode', 'Code')
        .column('fxType', 'Type')
        .column('fxCurrency', 'Currency')
        .renderer('fxAmount', 'Amount', Renderers.amount());

    if (mode === MasterMode.EDIT) {
        builder
            .menuAction({ mode: 'context' })
            .addAction({
                text: 'Edit',
                icon: 'fa fa-pen',
                onClick: (row) => openTransaction(masterId, TransactionMode.EDIT, row.id)
            })
            .addAction({
                text: 'Remove',
                icon: 'fa fa-trash',
                className: 'text-danger',
                onClick: (row) => removeTransaction(row)
            });
    }

    return builder.build();
}

function getRows() {
    return transactions.map((transaction, index) => Object.assign({}, transaction, {
        recordNo: transaction.recordNo || index + 1
    }));
}

function bindAddTransaction(masterId) {
    const button = document.querySelector('#addTransactionButton');
    if (!button) return;

    button.addEventListener('click', () => {
        openTransaction(masterId, TransactionMode.CREATE, null);
    });
}

function openTransaction(masterId, mode, transactionId) {
    NavigationState.set({
        page: 'transaction',
        action: mode,
        masterId: masterId,
        key: transactionId
    });
    window.location.href = './transaction.html';
}

async function removeTransaction(row) {
    if (!window.confirm('Remove this FX transaction?')) return;

    try {
        await FxService.deleteTransaction(row.id);
        transactions = transactions.filter((transaction) => transaction.id !== row.id);
        formAction.setTransactions(transactions);
        table.replaceData(getRows(), false);
        Toast.success('FX transaction removed.');
    } catch (error) {
        Toast.error('Failed to remove FX transaction.');
        console.error(error);
    }
}
