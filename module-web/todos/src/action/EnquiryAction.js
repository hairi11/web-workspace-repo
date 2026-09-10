import Common from '@company/common-js-web';
import TodoService from '../TodoService.js';

const { Actions, DataTableBuilder, Toast } = Common;

let table = null;

export async function initEnquiry() {
    let records = [];

    try {
        records = await loadTodos();
    } catch (error) {
        Toast.error('Failed to load todos.');
        console.error(error);
    }

    table = buildTable(records);
    bindReloadButton();
}

async function loadTodos() {
    const response = await TodoService.search();
    return Array.isArray(response.data) ? response.data : [];
}

function buildTable(records) {
    return new DataTableBuilder('#todoTable')
        .data(records)
        .column('id', 'ID')
        .column('userId', 'User ID')
        .column('title', 'Title')
        .renderer('completed', 'Status', (completed) => completed ? 'Completed' : 'Pending')
        .searchInput('#searchInput')
        .menuAction({ mode: 'context' })
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
}

function bindReloadButton() {
    const reload = document.querySelector('#reloadButton');

    reload.addEventListener('click', async () => {
        reload.disabled = true;

        try {
            table.replaceData(await loadTodos());
            Toast.success('Todos reloaded.');
        } catch (error) {
            Toast.error('Failed to reload todos.');
            console.error(error);
        } finally {
            reload.disabled = false;
        }
    });
}
