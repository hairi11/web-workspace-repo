import Common from '@company/common-js-web';

const { Storage, Toast } = Common;
const DRAFT_KEY = 'module-web:todo:draft';
const storage = new Storage(window.sessionStorage);

export function getId() {
    return new URLSearchParams(window.location.search).get('id');
}

export function requireId() {
    const id = getId();

    if (!id) {
        Toast.error('Todo id is required.');
        throw new Error('Missing todo id.');
    }

    return id;
}

export function asText(value) {
    return value === null || value === undefined ? '' : String(value);
}

export function saveDraft(draft) {
    storage.set(DRAFT_KEY, draft);
}

export function getDraft() {
    return storage.get(DRAFT_KEY);
}

export function clearDraft() {
    storage.remove(DRAFT_KEY);
}
