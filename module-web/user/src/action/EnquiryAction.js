import Common from '@company/common-js-web';
import UserService from '../UserService.js';

const { Actions, DataTableBuilder, Dialog, Logger, NavigationState, Toast } = Common;

const logger = new Logger('UserEnquiryAction');

let table = null;

export async function initEnquiry() {
    let records = [];

    try {
        records = await loadUsers();
    } catch (error) {
        Toast.error('Failed to load users.');
        logger.error(error);
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
            NavigationState.set({ page: 'user-view', id: user.id });
            window.location.href = './view.html';
        }))
        .addAction(Actions.edit((user) => {
            NavigationState.set({ page: 'user-update', id: user.id });
            window.location.href = './update.html';
        }, { text: 'Update' }))
        .addAction(Actions.delete(async (user, row) => {
            const confirmed = await Dialog.confirm({
                title: 'Delete User',
                message: 'Delete user #' + user.id + '?',
                yesLabel: 'Delete',
                noLabel: 'Cancel'
            });
            if (!confirmed) return;

            try {
                await UserService.delete(user.id);
                row.remove().draw(false);
                Toast.success('Delete action posted successfully.');
            } catch (error) {
                Toast.error('Delete action failed.');
                logger.error(error);
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
            logger.error(error);
        } finally {
            reload.disabled = false;
        }
    });
}
