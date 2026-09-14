import Common from '@company/common-js-web';
import { TransactionMode } from '../FxConstants.js';
import FxRows from '../FxRows.js';
import FxService from '../FxService.js';

const { DataTableBuilder, NavigationState, Renderers, Toast } = Common;

let table = null;

export async function initEnquiry() {
    table = buildTable();
    bindCreateButton();
    bindReloadButton();
}

function buildTable() {
    return new DataTableBuilder('#fxTable')
        .serverPage((page, size, options) => FxService.enquiry(
            page,
            size,
            options.sort
        ), {
            pageLength: 20,
            defaultOrder: [[0, 'desc'], [1, 'asc']],
            onError: (error) => {
                Toast.error('Failed to load FX records.');
                console.error(error);
            }
        })
        .renderer('reportDate', 'Report Date', Renderers.date())
        .column('recordNo', 'Record No')
        .renderer('fxCategory', 'FX Category', Renderers.property('fxCategoryDescription'))
        .renderer('fxCode', 'FX Code', Renderers.property('fxCodeDescription'))
        .renderer('fxType', 'FX Type', Renderers.property('fxTypeDescription'))
        .renderer('fxAmount', 'FX Amount', Renderers.amount())
        .renderer('fxDate', 'FX Date', Renderers.date())
        .menuAction({ mode: 'context' })
        .addAction({
            text: 'View',
            icon: 'fa fa-eye',
            onClick: (row) => openTransaction(TransactionMode.VIEW, row.id, null)
        })
        .addAction({
            text: 'Edit',
            icon: 'fa fa-pen',
            onClick: (row) => openExistingTransaction(row.masterId, row.id)
        })
        .addAction({ divider: true })
        .addAction({
            text: 'Delete Transaction',
            icon: 'fa fa-trash',
            className: 'text-danger',
            onClick: async (row) => {
                if (!window.confirm('Delete this FX transaction?')) return;

                try {
                    await FxService.deleteTransaction(row.id);
                    Toast.success('FX transaction deleted.');
                    table.refresh(false);
                } catch (error) {
                    Toast.error('Failed to delete FX transaction.');
                    console.error(error);
                }
            }
        })
        .build();
}

function bindCreateButton() {
    const button = document.querySelector('#createFxButton');
    if (!button) return;

    button.addEventListener('click', () => {
        const rows = FxRows.create();
        openTransaction(TransactionMode.CREATE, null, rows.rowsKey);
    });
}

async function openExistingTransaction(masterId, transactionId) {
    try {
        const [master, transactions] = await Promise.all([
            FxService.findMasterById(masterId),
            FxService.findTransactionsByMasterId(masterId)
        ]);

        const index = transactions.findIndex((transaction) => transaction.id === transactionId);
        if (!master || index < 0) throw new Error('FX transaction not found.');

        const rows = FxRows.load(master, transactions);
        openTransaction(TransactionMode.EDIT, index, rows.rowsKey);
    } catch (error) {
        Toast.error('Failed to load FX record.');
        console.error(error);
    }
}

function openTransaction(mode, key, rowsKey) {
    NavigationState.set({
        page: 'transaction',
        action: mode,
        key: key,
        rowsKey: rowsKey
    });
    window.location.href = './transaction.html';
}

function bindReloadButton() {
    const reload = document.querySelector('#reloadButton');

    reload.addEventListener('click', () => {
        reload.disabled = true;

        try {
            table.refresh(false);
            Toast.success('FX records reloaded.');
        } finally {
            window.setTimeout(() => {
                reload.disabled = false;
            }, 300);
        }
    });
}
