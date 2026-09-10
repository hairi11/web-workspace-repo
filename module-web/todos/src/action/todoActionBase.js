import Common from '@company/common-js-web';

const { Toast } = Common;

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
