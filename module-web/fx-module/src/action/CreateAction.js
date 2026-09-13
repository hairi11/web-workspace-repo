import Common from '@company/common-js-web';
import FxService from '../FxService.js';

const { Toast } = Common;

const REFERENCE_TYPES = {
    category: 'FX_CATEGORY',
    code: 'FX_CODE',
    currency: 'FX_CURRENCY',
    type: 'FX_TYPE'
};

let references = null;
let nextRowNo = 1;

export async function initCreate() {
    bindActions();

    try {
        references = await loadReferences();
        addTransactionRow();
    } catch (error) {
        Toast.error('Failed to load FX reference data.');
        console.error(error);
    }
}

function bindActions() {
    document.querySelector('#addTransactionButton').addEventListener('click', addTransactionRow);
    document.querySelector('#saveButton').addEventListener('click', () => submit(false));
    document.querySelector('#submitButton').addEventListener('click', () => submit(true));
}

async function loadReferences() {
    const [categories, codes, currencies, types] = await Promise.all([
        FxService.findReferences(REFERENCE_TYPES.category),
        FxService.findReferences(REFERENCE_TYPES.code),
        FxService.findReferences(REFERENCE_TYPES.currency),
        FxService.findReferences(REFERENCE_TYPES.type)
    ]);

    return {
        category: unwrapData(categories),
        code: unwrapData(codes),
        currency: unwrapData(currencies),
        type: unwrapData(types)
    };
}

function unwrapData(response) {
    if (Array.isArray(response)) return response;
    if (response && Array.isArray(response.data)) return response.data;
    return [];
}

function addTransactionRow() {
    if (!references) return;

    const template = document.querySelector('#fxTransactionRowTemplate');
    const fragment = template.content.cloneNode(true);
    const row = fragment.querySelector('tr');
    const rowNo = nextRowNo++;

    row.dataset.rowNo = String(rowNo);
    row.querySelector('[data-field="recordNo"]').textContent = String(rowNo);

    fillSelect(row.querySelector('[data-field="fxCategory"]'), references.category);
    fillSelect(row.querySelector('[data-field="fxCode"]'), references.code);
    fillSelect(row.querySelector('[data-field="fxCurrency"]'), references.currency);
    fillSelect(row.querySelector('[data-field="fxType"]'), references.type);

    row.querySelector('[data-action="remove"]').addEventListener('click', () => {
        row.remove();
        renumberRows();
    });

    document.querySelector('#fxTransactionBody').appendChild(fragment);
}

function fillSelect(select, items) {
    select.appendChild(new Option('Select...', ''));

    items.forEach((item) => {
        select.appendChild(new Option(item.description, item.code));
    });
}

function renumberRows() {
    const rows = Array.from(document.querySelectorAll('#fxTransactionBody tr'));
    rows.forEach((row, index) => {
        row.dataset.rowNo = String(index + 1);
        row.querySelector('[data-field="recordNo"]').textContent = String(index + 1);
    });
    nextRowNo = rows.length + 1;
}

async function submit(isSubmit) {
    const rows = Array.from(document.querySelectorAll('#fxTransactionBody tr'));

    if (!rows.length) {
        Toast.error('Add at least one FX transaction.');
        return;
    }

    const transactions = rows.map(readTransactionRow);
    if (!validateTransactions(transactions)) {
        return;
    }

    const request = {
        master: {
            id: null
        },
        transactions: transactions
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

function readTransactionRow(row, index) {
    return {
        id: null,
        recordNo: index + 1,
        fxDate: valueOf(row, 'fxDate'),
        fxCategory: valueOf(row, 'fxCategory'),
        fxCode: valueOf(row, 'fxCode'),
        fxType: valueOf(row, 'fxType'),
        fxRefno: valueOf(row, 'fxRefno'),
        fxParty: valueOf(row, 'fxParty'),
        fxPrincipal: valueOf(row, 'fxPrincipal'),
        fxCurrency: valueOf(row, 'fxCurrency'),
        fxAmount: decimalValueOf(row, 'fxAmount'),
        fxRate: decimalValueOf(row, 'fxRate'),
        fxDescription: valueOf(row, 'fxDescription')
    };
}

function valueOf(row, field) {
    const element = row.querySelector('[data-field="' + field + '"]');
    return element ? String(element.value || '').trim() : '';
}

function decimalValueOf(row, field) {
    const value = valueOf(row, field);
    return value === '' ? null : Number(value);
}

function validateTransactions(transactions) {
    for (let index = 0; index < transactions.length; index++) {
        const trx = transactions[index];
        const rowNo = index + 1;

        if (!trx.fxDate || !trx.fxCategory || !trx.fxCode || !trx.fxType || !trx.fxCurrency) {
            Toast.error('Complete the required fields for transaction ' + rowNo + '.');
            return false;
        }

        if (trx.fxAmount === null || !Number.isFinite(trx.fxAmount)) {
            Toast.error('Enter a valid FX amount for transaction ' + rowNo + '.');
            return false;
        }

        if (trx.fxRate === null || !Number.isFinite(trx.fxRate)) {
            Toast.error('Enter a valid FX rate for transaction ' + rowNo + '.');
            return false;
        }
    }

    return true;
}

function setSubmitting(submitting) {
    document.querySelector('#saveButton').disabled = submitting;
    document.querySelector('#submitButton').disabled = submitting;
    document.querySelector('#addTransactionButton').disabled = submitting;
}
