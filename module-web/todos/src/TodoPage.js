import $ from 'jquery';
import 'datatables.net';
import Common from '@company/common-js-web';
import TodoFormAction from './TodoFormAction.js';
import TodoService from './TodoService.js';

window.jQuery = window.$ = $;

const { Actions, DataTableBuilder, Toast } = Common;

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
    const reload = document.querySelector('#reloadButton');
    let records = [];

    try {
        const response = await TodoService.search();
        records = Array.isArray(response.data) ? response.data : [];
    } catch (error) {
        Toast.error('Failed to load todos.');
        console.error(error);
    }

    const table = new DataTableBuilder('#todoTable')
        .data(records)
        .column('id', 'ID')
        .column('userId', 'User ID')
        .column('title', 'Title')
        .renderer('completed', 'Status', (completed) => completed ? 'Completed' : 'Pending')
        .searchInput('#searchInput')
        .menuAction({ title: 'Actions', mode: 'inline' })
        .addAction(Actions.view((todo) => {
            window.location.href = './view.html?id=' + encodeURIComponent(todo.id);
        }))
        .addAction(Actions.edit((todo) => {
            window.location.href = './update.html?id=' + encodeURIComponent(todo.id);
        }, { text: 'Update' }))
        .addAction(Actions.delete(async (todo, row) => {
            if (!window.confirm('Delete todo #' + todo.id + '?')) return;

            try {
                await TodoService.delete(todo.id);
                row.remove().draw(false);
                Toast.success('Delete action posted successfully.');
            } catch (error) {
                Toast.error('Delete action failed.');
                console.error(error);
            }
        }))
        .build();

    reload.addEventListener('click', async () => {
        reload.disabled = true;

        try {
            const response = await TodoService.search();
            records = Array.isArray(response.data) ? response.data : [];
            table.replaceData(records);
            Toast.success('Todos reloaded.');
        } catch (error) {
            Toast.error('Failed to reload todos.');
            console.error(error);
        } finally {
            reload.disabled = false;
        }
    });
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

document.addEventListener('DOMContentLoaded', init);
