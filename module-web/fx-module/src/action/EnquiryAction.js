import Common from '@company/common-js-web';
import FxService from '../FxService.js';

const { DataTableBuilder, Toast } = Common;

let table = null;

export async function initEnquiry() {
    let records = [];

    try {
        records = await loadFxMasters();
    } catch (error) {
        Toast.error('Failed to load FX records.');
        console.error(error);
    }

    table = buildTable(records);
    bindReloadButton();
}

async function loadFxMasters() {
    const response = await FxService.findAllMasters();
    return Array.isArray(response.data) ? response.data : [];
}

function buildTable(records) {
    return new DataTableBuilder('#fxTable')
        .data(records)
        .column('id', 'ID')
        .column('status', 'Status')
        .column('reportDate', 'Report Date')
        .searchInput('#searchInput')
        .build();
}

function bindReloadButton() {
    const reload = document.querySelector('#reloadButton');

    reload.addEventListener('click', async () => {
        reload.disabled = true;

        try {
            table.replaceData(await loadFxMasters());
            Toast.success('FX records reloaded.');
        } catch (error) {
            Toast.error('Failed to reload FX records.');
            console.error(error);
        } finally {
            reload.disabled = false;
        }
    });
}
