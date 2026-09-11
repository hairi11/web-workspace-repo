import Common from '@company/common-js-web';

const { Toast } = Common;
const DRAFT_KEY = 'module-web:todo:draft';

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
    window.sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
}

export function getDraft() {
    const value = window.sessionStorage.getItem(DRAFT_KEY);
    return value ? JSON.parse(value) : null;
}

export function clearDraft() {
    window.sessionStorage.removeItem(DRAFT_KEY);
}
