import Common from '@company/common-js-web';
import { MasterMode, TransactionMode } from '../FxConstants.js';
import FxDraft from '../FxDraft.js';
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

    try {
        const data = mode === MasterMode.EDIT
            ? loadDraftData()
            : await loadViewData(masterId);

        if (!data || !data.master) {
            window.location.href = './enquiry.html';
            return;
        }

        transactions = data.transactions;
        renderMasterSummary(data.master);
        configurePage(mode);

        formAction = new FxMasterFormAction('#fxMasterForm', {
            master: data.master,
            transactions: transactions
        }).build();

        table = buildTable(mode);

        if (mode === MasterMode.EDIT) {
            bindAddTransaction();
        }
    } catch (error) {
        Toast.error('Failed to load FX master.');
        console.error(error);
    }
}

function loadDraftData() {
    return FxDraft.get();
}

async function loadViewData(masterId) {
    if (!masterId) return null;

    const [master, rows] = await Promise.all([
        FxService.findMasterById(masterId),
        FxService.findTransactionsByMasterId(masterId)
    ]);

    return {
        master: master,
        transactions: rows
    };
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

function buildTable(mode) {
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
                onClick: (row) => openTransaction(TransactionMode.EDIT, row.rowIndex)
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
        rowIndex: index,
        recordNo: transaction.recordNo || index + 1
    }));
}

function bindAddTransaction() {
    const button = document.querySelector('#addTransactionButton');
    if (!button) return;

    button.addEventListener('click', () => {
        openTransaction(TransactionMode.CREATE, null);
    });
}

function openTransaction(mode, index) {
    NavigationState.set({
        page: 'transaction',
        action: mode,
        key: index
    });
    window.location.href = './transaction.html';
}

function removeTransaction(row) {
    if (!window.confirm('Remove this FX transaction?')) return;

    const draft = FxDraft.removeTransaction(row.rowIndex);
    if (!draft) return;

    transactions = draft.transactions;
    formAction.setTransactions(transactions);
    table.replaceData(getRows(), false);
    Toast.success('FX transaction removed from draft.');
}
