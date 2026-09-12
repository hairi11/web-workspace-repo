import Common from '@company/common-js-web';
import FxService from '../FxService.js';

const { DataTableBuilder, DateUtil, Toast } = Common;

let table = null;

export async function initEnquiry() {
    table = buildTable();
    bindReloadButton();
}

function buildTable() {
    return new DataTableBuilder('#fxTable')
        .option('pageLength', 20)
        .option('processing', true)
        .option('serverSide', true)
        .option('ajax', loadFxPage)
        .renderer('reportDate', 'Report Date', (value) => DateUtil.formatDate(value))
        .column('recordNo', 'Record No')
        .column('fxCategory', 'FX Category')
        .column('fxCode', 'FX Code')
        .column('fxType', 'FX Type')
        .renderer('fxAmount', 'FX Amount', formatAmount)
        .renderer('fxDate', 'FX Date', (value) => DateUtil.formatDate(value))
        .build();
}

async function loadFxPage(request, callback) {
    const size = Number(request.length) > 0 ? Number(request.length) : 20;
    const start = Number(request.start) > 0 ? Number(request.start) : 0;
    const page = Math.floor(start / size);

    try {
        const response = await FxService.enquiry(page, size);
        const result = response.data || {};
        const total = Number(result.totalElements) || 0;

        callback({
            draw: request.draw,
            recordsTotal: total,
            recordsFiltered: total,
            data: Array.isArray(result.content) ? result.content : []
        });
    } catch (error) {
        Toast.error('Failed to load FX records.');
        console.error(error);

        callback({
            draw: request.draw,
            recordsTotal: 0,
            recordsFiltered: 0,
            data: []
        });
    }
}

function formatAmount(value) {
    if (value === null || value === undefined || value === '') {
        return '';
    }

    const amount = Number(value);
    if (!Number.isFinite(amount)) {
        return value;
    }

    return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
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
