import Common from '@company/common-js-web';

const { Toast } = Common;

class UserActionBase {
    init() {
        throw new Error('init() must be implemented.');
    }

    getId() {
        return new URLSearchParams(window.location.search).get('id');
    }

    requireId() {
        const id = this.getId();

        if (!id) {
            Toast.error('User id is required.');
            throw new Error('Missing user id.');
        }

        return id;
    }

    asText(value) {
        return value === null || value === undefined ? '' : String(value);
    }
}

export default UserActionBase;
