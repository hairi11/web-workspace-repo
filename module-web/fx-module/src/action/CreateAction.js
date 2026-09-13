import Common from '@company/common-js-web';
import { TransactionMode } from '../FxConstants.js';
import FxCreateFormAction from './FxCreateFormAction.js';

const { DataTableBuilder, NavigationState, Renderers } = Common;

let table = null;

export async function initCreate() {
    const navigation = NavigationState.consume();
    const resume = navigation
        && navigation.page === 'create'
        && navigation.action === 'resume';

    if (!resume) {
        FxCreateFormAction.clearDraft();
    }

    new FxCreateFormAction('#fxCreateForm').build();
    bindActions();
    table = buildTable(getRows());
}

function bindActions() {
    document.querySelector('#addTransactionButton').addEventListener('click', () => {
        NavigationState.set({
            page: 'transaction',
            action: TransactionMode.CREATE,
            key: null
        });
        window.location.href = './transaction.html';
    });
}

function getRows() {
    return FxCreateFormAction.getDraft().transactions.map((transaction, index) => Object.assign({}, transaction, {
        rowIndex: index,
        recordNo: index + 1
    }));
}

function buildTable(rows) {
    return new DataTableBuilder('#fxCreateTable')
        .data(rows)
        .option('paging', false)
        .option('info', false)
        .option('ordering', false)
        .column('recordNo', 'No.')
        .renderer('fxDate', 'FX Date', Renderers.date())
        .column('fxCategoryDescription', 'Category')
        .column('fxCodeDescription', 'Code')
        .column('fxTypeDescription', 'Type')
        .column('fxCurrencyDescription', 'Currency')
        .renderer('fxAmount', 'Amount', Renderers.amount())
        .menuAction({ mode: 'context' })
        .addAction({
            text: 'Edit',
            icon: 'fa fa-pen',
            onClick: (row) => {
                NavigationState.set({
                    page: 'transaction',
                    action: TransactionMode.EDIT_DRAFT,
                    key: row.rowIndex
                });
                window.location.href = './transaction.html';
            }
        })
        .addAction({
            text: 'Remove',
            icon: 'fa fa-trash',
            className: 'text-danger',
            onClick: (row) => {
                FxCreateFormAction.removeTransaction(row.rowIndex);
                table.replaceData(getRows(), false);
            }
        })
        .build();
}
