const STORAGE_KEY = 'fx.create.draft';

export function getCreateDraft() {
    try {
        const raw = window.sessionStorage.getItem(STORAGE_KEY);
        const draft = raw ? JSON.parse(raw) : null;
        return draft && Array.isArray(draft.transactions)
            ? draft
            : { master: { id: null }, transactions: [] };
    } catch (error) {
        return { master: { id: null }, transactions: [] };
    }
}

export function saveCreateDraft(draft) {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
}

export function clearCreateDraft() {
    window.sessionStorage.removeItem(STORAGE_KEY);
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
