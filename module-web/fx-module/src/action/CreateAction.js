import Common from '@company/common-js-web';
import FxService from '../FxService.js';
import {
    clearCreateDraft,
    getCreateDraft,
    removeTransaction
} from './fxCreateDraft.js';

const { DataTableBuilder, Renderers, Toast } = Common;

let table = null;

export async function initCreate() {
    const params = new URLSearchParams(window.location.search);

    if (params.get('resume') !== '1') {
        clearCreateDraft();
    }

    bindActions();
    table = buildTable(getRows());
}

function bindActions() {
    document.querySelector('#addTransactionButton').addEventListener('click', () => {
        window.location.href = './transaction.html';
    });
    document.querySelector('#saveButton').addEventListener('click', () => submit(false));
    document.querySelector('#submitButton').addEventListener('click', () => submit(true));
}

function getRows() {
    return getCreateDraft().transactions.map((transaction, index) => Object.assign({}, transaction, {
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
        .menuAction({ title: 'Action', mode: 'inline' })
        .addAction({
            text: 'Edit',
            icon: 'fa fa-pen',
            onClick: (row) => {
                window.location.href = './transaction.html?index=' + encodeURIComponent(row.rowIndex);
            }
        })
        .addAction({
            text: 'Remove',
            icon: 'fa fa-trash',
            className: 'text-danger',
            onClick: (row) => {
                removeTransaction(row.rowIndex);
                table.replaceData(getRows(), false);
            }
        })
        .build();
}

async function submit(isSubmit) {
    const draft = getCreateDraft();

    if (!draft.transactions.length) {
        Toast.error('Add at least one FX transaction.');
        return;
    }

    const request = {
        master: {
            id: null
        },
        transactions: draft.transactions.map(toRequestTransaction)
    };

    setSubmitting(true);

    try {
        if (isSubmit) {
            await FxService.submit(request);
            Toast.success('FX record submitted successfully.');
        } else {
            await FxService.save(request);
            Toast.success('FX draft saved successfully.');
        }

        clearCreateDraft();
        window.setTimeout(() => {
            window.location.href = './enquiry.html';
        }, 300);
    } catch (error) {
        Toast.error(isSubmit ? 'Failed to submit FX record.' : 'Failed to save FX draft.');
        console.error(error);
    } finally {
        setSubmitting(false);
    }
}

function toRequestTransaction(transaction) {
    return {
        id: null,
        fxDate: transaction.fxDate,
        fxCategory: transaction.fxCategory,
        fxCode: transaction.fxCode,
        fxType: transaction.fxType,
        fxRefno: transaction.fxRefno,
        fxParty: transaction.fxParty,
        fxPrincipal: transaction.fxPrincipal,
        fxCurrency: transaction.fxCurrency,
        fxAmount: transaction.fxAmount,
        fxRate: transaction.fxRate,
        fxDescription: transaction.fxDescription
    };
}

function setSubmitting(submitting) {
    document.querySelector('#saveButton').disabled = submitting;
    document.querySelector('#submitButton').disabled = submitting;
    document.querySelector('#addTransactionButton').disabled = submitting;
}
