const BASE_URL = 'https://jsonplaceholder.typicode.com/todos';

const TodoApi = {
    search: BASE_URL,
    action: BASE_URL,
    statusOptions: './status-options.json',

    getById: function (id) {
        return BASE_URL + '/' + encodeURIComponent(id);
    }
};

export default TodoApi;
