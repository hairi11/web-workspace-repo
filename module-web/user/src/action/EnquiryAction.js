import Common from '@company/common-js-web';
import UserService from '../UserService.js';

const { Actions, DataTableBuilder, Toast } = Common;

let table = null;

export async function initEnquiry() {
    let records = [];

    try {
        records = await loadUsers();
    } catch (error) {
        Toast.error('Failed to load users.');
        console.error(error);
    }

    table = buildTable(records);
    bindReloadButton();
}

async function loadUsers() {
    const response = await UserService.search();
    return Array.isArray(response.data) ? response.data : [];
}

function buildTable(records) {
    return new DataTableBuilder('#userTable')
        .data(records)
        .column('id', 'ID')
        .column('name', 'Name')
        .column('username', 'Username')
        .column('email', 'Email')
        .column('phone', 'Phone')
        .searchInput('#searchInput')
        .menuAction({ mode: 'context' })
        .addAction(Actions.view((user) => {
            window.location.href = './view.html?id=' + encodeURIComponent(user.id);
        }))
        .addAction(Actions.edit((user) => {
            window.location.href = './update.html?id=' + encodeURIComponent(user.id);
        }, { text: 'Update' }))
        .addAction(Actions.delete(async (user, row) => {
            if (!window.confirm('Delete user #' + user.id + '?')) return;

            try {
                await UserService.delete(user.id);
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
            table.replaceData(await loadUsers());
            Toast.success('Users reloaded.');
        } catch (error) {
            Toast.error('Failed to reload users.');
            console.error(error);
        } finally {
            reload.disabled = false;
        }
    });
}
