import Common from '@company/common-js-web';
import TodoApi from './TodoApi.js';

const { Ajax } = Common;

const TodoService = {
    search: function () {
        return Ajax.get(TodoApi.search, {
            cache: false,
            dedupe: true
        });
    },

    getById: function (id) {
        return Ajax.get(TodoApi.getById(id), {
            cache: false
        });
    },

    create: function (data) {
        return Ajax.post(TodoApi.action, data);
    },

    update: function (id, data) {
        return Ajax.post(TodoApi.action, {
            action: 'update',
            id: id,
            data: data
        });
    },

    delete: function (id) {
        return Ajax.post(TodoApi.action, {
            action: 'delete',
            id: id
        });
    }
};

export default TodoService;
