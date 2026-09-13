import Common from '@company/common-js-web';
import FxService from '../FxService.js';

const { DataTableBuilder, Renderers, Toast } = Common;

let table = null;

export async function initEnquiry() {
    table = buildTable();
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
            onClick: (row) => {
                window.location.href = './transaction.html?mode=view&id=' + encodeURIComponent(row.id);
            }
        })
        .addAction({
            text: 'Edit',
            icon: 'fa fa-pen',
            onClick: (row) => {
                window.location.href = './transaction.html?mode=edit&id=' + encodeURIComponent(row.id);
            }
        })
        .addAction({ divider: true })
        .addAction({
            text: 'Delete',
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
