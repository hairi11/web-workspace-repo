import Common from '@company/common-js-web';
import FxService from '../FxService.js';

const { DataTableBuilder, DateUtil, Toast } = Common;

let table = null;

export async function initEnquiry() {
    let records = [];

    try {
        records = await loadFxRecords();
    } catch (error) {
        Toast.error('Failed to load FX records.');
        console.error(error);
    }

    table = buildTable(records);
    bindReloadButton();
}

async function loadFxRecords() {
    const response = await FxService.enquiry();
    return Array.isArray(response.data) ? response.data : [];
}

function buildTable(records) {
    return new DataTableBuilder('#fxTable')
        .data(records)
        .renderer('reportDate', 'Report Date', (value) => DateUtil.formatDate(value))
        .column('recordNo', 'Record No')
        .column('fxCategory', 'FX Category')
        .column('fxCode', 'FX Code')
        .column('fxType', 'FX Type')
        .renderer('fxAmount', 'FX Amount', formatAmount)
        .renderer('fxDate', 'FX Date', (value) => DateUtil.formatDate(value))
        .searchInput('#searchInput')
        .build();
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

    reload.addEventListener('click', async () => {
        reload.disabled = true;

        try {
            table.replaceData(await loadFxRecords());
            Toast.success('FX records reloaded.');
        } catch (error) {
            Toast.error('Failed to reload FX records.');
            console.error(error);
        } finally {
            reload.disabled = false;
        }
    });
}
