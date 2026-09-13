import Common from '@company/common-js-web';
import FxService from '../FxService.js';
import { getCreateDraft, upsertTransaction } from './fxCreateDraft.js';

const { Toast } = Common;

const REFERENCE_TYPES = {
    category: 'FX_CATEGORY',
    code: 'FX_CODE',
    currency: 'FX_CURRENCY',
    type: 'FX_TYPE'
};

let references = null;
let editIndex = null;
let mode = 'create';
let transactionId = null;

export async function initTransaction() {
    resolveMode();
    editIndex = resolveEditIndex();
    bindActions();

    try {
        references = await loadReferences();
        populateReferenceSelects();

        if (mode === 'view' || mode === 'edit') {
            await populateBackendTransaction();
            configureBackendMode();
        } else {
            populateExistingTransaction();
        }
    } catch (error) {
        Toast.error('Failed to load FX transaction data.');
        console.error(error);
    }
}

function resolveMode() {
    const params = new URLSearchParams(window.location.search);
    const requested = params.get('mode');
    transactionId = params.get('id');

    if ((requested === 'view' || requested === 'edit') && transactionId) {
        mode = requested;
    }
}

function bindActions() {
    document.querySelector('#transactionForm').addEventListener('submit', saveTransaction);
}

function resolveEditIndex() {
    const value = new URLSearchParams(window.location.search).get('index');
    if (value === null || value === '') return null;

    const index = Number(value);
    return Number.isInteger(index) && index >= 0 ? index : null;
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

function unwrapObject(response) {
    return response && response.data !== undefined ? response.data : response;
}

function populateReferenceSelects() {
    fillSelect('#fxCategory', references.category);
    fillSelect('#fxCode', references.code);
    fillSelect('#fxCurrency', references.currency);
    fillSelect('#fxType', references.type);
}

function fillSelect(selector, items) {
    const select = document.querySelector(selector);
    select.innerHTML = '';
    select.appendChild(new Option('Select...', ''));
    items.forEach((item) => select.appendChild(new Option(item.description, item.code)));
}

async function populateBackendTransaction() {
    const response = await FxService.findTransactionById(transactionId);
    const transaction = unwrapObject(response);

    if (!transaction) {
        throw new Error('FX transaction not found.');
    }

    populateTransaction(transaction);
}

function configureBackendMode() {
    const title = document.querySelector('h1');
    const submitButton = document.querySelector('#transactionForm button[type="submit"]');
    const cancelLink = document.querySelector('#transactionForm .button');

    cancelLink.href = './enquiry.html';

    if (mode === 'view') {
        title.textContent = 'View FX Transaction';
        submitButton.hidden = true;
        document.querySelectorAll('#transactionForm input, #transactionForm select, #transactionForm textarea')
            .forEach((element) => { element.disabled = true; });
    } else {
        title.textContent = 'Edit FX Transaction';
        submitButton.textContent = 'Save Changes';
    }
}

function populateExistingTransaction() {
    if (editIndex === null) return;

    const draft = getCreateDraft();
    const transaction = draft.transactions[editIndex];
    if (!transaction) {
        Toast.error('FX transaction not found.');
        window.location.href = './create.html?resume=1';
        return;
    }

    document.querySelector('h1').textContent = 'Edit FX Transaction';
    populateTransaction(transaction);
}

function populateTransaction(transaction) {
    setValue('fxDate', transaction.fxDate);
    setValue('fxCategory', transaction.fxCategory);
    setValue('fxCode', transaction.fxCode);
    setValue('fxType', transaction.fxType);
    setValue('fxRefno', transaction.fxRefno);
    setValue('fxParty', transaction.fxParty);
    setValue('fxPrincipal', transaction.fxPrincipal);
    setValue('fxCurrency', transaction.fxCurrency);
    setValue('fxAmount', transaction.fxAmount);
    setValue('fxRate', transaction.fxRate);
    setValue('fxDescription', transaction.fxDescription);
}

function setValue(id, value) {
    document.querySelector('#' + id).value = value === null || value === undefined ? '' : value;
}

async function saveTransaction(event) {
    event.preventDefault();

    if (mode === 'view') return;

    const transaction = {
        id: mode === 'edit' ? Number(transactionId) : null,
        fxDate: valueOf('fxDate'),
        fxCategory: valueOf('fxCategory'),
        fxCategoryDescription: selectedText('fxCategory'),
        fxCode: valueOf('fxCode'),
        fxCodeDescription: selectedText('fxCode'),
        fxType: valueOf('fxType'),
        fxTypeDescription: selectedText('fxType'),
        fxRefno: valueOf('fxRefno'),
        fxParty: valueOf('fxParty'),
        fxPrincipal: valueOf('fxPrincipal'),
        fxCurrency: valueOf('fxCurrency'),
        fxCurrencyDescription: selectedText('fxCurrency'),
        fxAmount: decimalValueOf('fxAmount'),
        fxRate: decimalValueOf('fxRate'),
        fxDescription: valueOf('fxDescription')
    };

    if (!validateTransaction(transaction)) return;

    if (mode === 'edit') {
        try {
            await FxService.updateTransaction(transactionId, transaction);
            Toast.success('FX transaction updated.');
            window.setTimeout(() => {
                window.location.href = './enquiry.html';
            }, 300);
        } catch (error) {
            Toast.error('Failed to update FX transaction.');
            console.error(error);
        }
        return;
    }

    upsertTransaction(editIndex, transaction);
    window.location.href = './create.html?resume=1';
}

function valueOf(id) {
    return String(document.querySelector('#' + id).value || '').trim();
}

function selectedText(id) {
    const select = document.querySelector('#' + id);
    const option = select.options[select.selectedIndex];
    return option && select.value ? option.text : '';
}

function decimalValueOf(id) {
    const value = valueOf(id);
    return value === '' ? null : Number(value);
}

function validateTransaction(transaction) {
    if (!transaction.fxDate || !transaction.fxCategory || !transaction.fxCode
        || !transaction.fxType || !transaction.fxCurrency) {
        Toast.error('Complete all required fields.');
        return false;
    }

    if (transaction.fxAmount === null || !Number.isFinite(transaction.fxAmount)) {
        Toast.error('Enter a valid FX amount.');
        return false;
    }

    if (transaction.fxRate === null || !Number.isFinite(transaction.fxRate)) {
        Toast.error('Enter a valid FX rate.');
        return false;
    }

    return true;
}
