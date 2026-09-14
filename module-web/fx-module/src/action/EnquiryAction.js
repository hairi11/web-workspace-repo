import Common from '@company/common-js-web';
import { MasterMode, TransactionMode } from '../FxConstants.js';
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
            onClick: (row) => openMaster(row.masterId, MasterMode.VIEW)
        })
        .addAction({
            text: 'Edit',
            icon: 'fa fa-pen',
            onClick: (row) => openTransaction(row.masterId, row.id)
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

    button.addEventListener('click', async () => {
        button.disabled = true;

        try {
            const master = await FxService.createMaster({ status: 'DRAFT' });

            if (!master || !master.id) {
                throw new Error('FX master was not created.');
            }

            NavigationState.set({
                page: 'transaction',
                action: TransactionMode.CREATE,
                masterId: master.id,
                key: null
            });
            window.location.href = './transaction.html';
        } catch (error) {
            button.disabled = false;
            Toast.error('Failed to create FX draft.');
            console.error(error);
        }
    });
}

function openMaster(masterId, mode) {
    NavigationState.set({
        page: 'master',
        action: mode,
        key: masterId
    });
    window.location.href = './master.html';
}

function openTransaction(masterId, transactionId) {
    NavigationState.set({
        page: 'transaction',
        action: TransactionMode.EDIT,
        masterId: masterId,
        key: transactionId
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
