import Common from '@company/common-js-web';

const { Storage } = Common;
const STORAGE_KEY = 'fx.create.draft';
const storage = new Storage(window.sessionStorage);

function emptyDraft() {
    return { master: { id: null }, transactions: [] };
}

export function getCreateDraft() {
    try {
        const draft = storage.get(STORAGE_KEY);
        return draft && Array.isArray(draft.transactions)
            ? draft
            : emptyDraft();
    } catch (error) {
        return emptyDraft();
    }
}

export function saveCreateDraft(draft) {
    storage.set(STORAGE_KEY, draft);
}

export function clearCreateDraft() {
    storage.remove(STORAGE_KEY);
}

export function upsertTransaction(index, transaction) {
    const draft = getCreateDraft();

    if (index === null || index === undefined || index < 0 || index >= draft.transactions.length) {
        draft.transactions.push(transaction);
    } else {
        draft.transactions[index] = transaction;
    }

    saveCreateDraft(draft);
    return draft;
}

export function removeTransaction(index) {
    const draft = getCreateDraft();
    if (index >= 0 && index < draft.transactions.length) {
        draft.transactions.splice(index, 1);
        saveCreateDraft(draft);
    }
    return draft;
}
