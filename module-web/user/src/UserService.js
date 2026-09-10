import Common from '@company/common-js-web';
import UserApi from './UserApi.js';

const { Ajax } = Common;

const UserService = {
    search: function () {
        return Ajax.get(UserApi.search, {
            cache: false,
            dedupe: true
        });
    },

    getById: function (id) {
        return Ajax.get(UserApi.getById(id), {
            cache: false
        });
    },

    create: function (data) {
        return Ajax.post(UserApi.action, data);
    },

    update: function (id, data) {
        return Ajax.post(UserApi.action, {
            action: 'update',
            id: id,
            data: data
        });
    },

    delete: function (id) {
        return Ajax.post(UserApi.action, {
            action: 'delete',
            id: id
        });
    }
};

export default UserService;
