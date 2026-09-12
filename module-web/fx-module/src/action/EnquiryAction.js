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
        .serverPage((page, size, sort) => FxService.enquiry(
            page,
            size,
            sort.sortBy,
            sort.sortDir
        ), {
            pageLength: 20,
            defaultSortBy: 'reportDate',
            defaultSortDir: 'desc',
            defaultOrder: [[0, 'desc']],
            onError: (error) => {
                Toast.error('Failed to load FX records.');
                console.error(error);
            }
        })
        .renderer('reportDate', 'Report Date', Renderers.date())
        .column('recordNo', 'Record No')
        .column('fxCategory', 'FX Category')
        .column('fxCode', 'FX Code')
        .column('fxType', 'FX Type')
        .renderer('fxAmount', 'FX Amount', Renderers.amount())
        .renderer('fxDate', 'FX Date', Renderers.date())
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
