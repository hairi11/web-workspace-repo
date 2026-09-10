import Common from '@company/common-js-web';
import TodoFormAction from './TodoFormAction.js';
import TodoService from './TodoService.js';

const { Toast } = Common;

function pageName() {
    return document.body.dataset.page;
}

function queryId() {
    return new URLSearchParams(window.location.search).get('id');
}

function requiredId() {
    const id = queryId();

    if (!id) {
        Toast.error('Todo id is required.');
        throw new Error('Missing todo id.');
    }

    return id;
}

function asText(value) {
    return value === null || value === undefined ? '' : String(value);
}

async function init() {
    try {
        switch (pageName()) {
            case 'enquiry':
                await initEnquiry();
                break;
            case 'create':
                new TodoFormAction('#todoForm', { mode: 'create' }).build();
                break;
            case 'update':
                await initUpdate();
                break;
            case 'view':
                await initView();
                break;
            default:
                throw new Error('Unsupported todo page: ' + pageName());
        }
    } catch (error) {
        console.error(error);
    }
}

async function initEnquiry() {
    const tbody = document.querySelector('#todoTableBody');
    const search = document.querySelector('#searchInput');
    const reload = document.querySelector('#reloadButton');
    let records = [];

    async function load() {
        showMessage(tbody, 'Loading...');

        try {
            const response = await TodoService.search();
            records = Array.isArray(response.data) ? response.data : [];
            render();
        } catch (error) {
            showMessage(tbody, 'Failed to load todos.');
            Toast.error('Failed to load todos.');
            console.error(error);
        }
    }

    function render() {
        const keyword = (search.value || '').trim().toLowerCase();

        const filtered = keyword
            ? records.filter((todo) => {
                const status = todo.completed ? 'completed' : 'pending';
                return [todo.id, todo.userId, todo.title, status]
                    .some((v) => asText(v).toLowerCase().includes(keyword));
            })
            : records;

        renderRows(tbody, filtered);
    }

    search.addEventListener('input', render);
    reload.addEventListener('click', load);

    tbody.addEventListener('click', async function (event) {
        const button = event.target.closest('[data-action]');
        if (!button) return;

        const id = button.dataset.id;

        if (button.dataset.action === 'view') {
            window.location.href = './view.html?id=' + encodeURIComponent(id);
            return;
        }

        if (button.dataset.action === 'update') {
            window.location.href = './update.html?id=' + encodeURIComponent(id);
            return;
        }

        if (button.dataset.action === 'delete') {
            if (!window.confirm('Delete todo #' + id + '?')) return;

            try {
                await TodoService.delete(id);
                records = records.filter((row) => String(row.id) !== String(id));
                render();
                Toast.success('Delete action posted successfully.');
            } catch (error) {
                Toast.error('Delete action failed.');
                console.error(error);
            }
        }
    });

    await load();
}

async function initUpdate() {
    const id = requiredId();
    const action = new TodoFormAction('#todoForm', {
        mode: 'update',
        id: id
    });

    action.build();
    await action.load();
}

async function initView() {
    const id = requiredId();
    const response = await TodoService.getById(id);
    const todo = response.data;
    const container = document.querySelector('#todoView');

    container.textContent = '';

    [
        ['ID', todo.id],
        ['User ID', todo.userId],
        ['Title', todo.title],
        ['Status', todo.completed ? 'Completed' : 'Pending']
    ].forEach(([label, value]) => {
        const row = document.createElement('div');
        row.className = 'view-row';

        const strong = document.createElement('strong');
        strong.textContent = label;

        const span = document.createElement('span');
        span.textContent = asText(value) || '-';

        row.appendChild(strong);
        row.appendChild(span);
        container.appendChild(row);
    });

    document.querySelector('#updateLink').href =
        './update.html?id=' + encodeURIComponent(todo.id);
}

function showMessage(tbody, message) {
    tbody.textContent = '';
    const row = document.createElement('tr');
    const cell = document.createElement('td');
    cell.colSpan = 5;
    cell.textContent = message;
    row.appendChild(cell);
    tbody.appendChild(row);
}

function renderRows(tbody, todos) {
    tbody.textContent = '';

    if (!todos.length) {
        showMessage(tbody, 'No todos found.');
        return;
    }

    todos.forEach((todo) => {
        const row = document.createElement('tr');

        [
            todo.id,
            todo.userId,
            todo.title,
            todo.completed ? 'Completed' : 'Pending'
        ].forEach((value) => {
            const cell = document.createElement('td');
            cell.textContent = asText(value);
            row.appendChild(cell);
        });

        const actions = document.createElement('td');
        actions.className = 'actions';

        [
            ['View', 'view'],
            ['Update', 'update'],
            ['Delete', 'delete']
        ].forEach(([label, action]) => {
            const button = document.createElement('button');
            button.type = 'button';
            button.textContent = label;
            button.dataset.action = action;
            button.dataset.id = todo.id;
            actions.appendChild(button);
        });

        row.appendChild(actions);
        tbody.appendChild(row);
    });
}

document.addEventListener('DOMContentLoaded', init);
