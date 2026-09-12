import Common from '@company/common-js-web';
import FxService from '../FxService.js';

const { DataTableBuilder, Toast } = Common;

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
        .column('reportDate', 'Report Date')
        .column('recordNo', 'Record No')
        .column('fxCategory', 'FX Category')
        .column('fxCode', 'FX Code')
        .column('fxType', 'FX Type')
        .column('fxAmount', 'FX Amount')
        .column('fxDate', 'FX Date')
        .searchInput('#searchInput')
        .build();
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
