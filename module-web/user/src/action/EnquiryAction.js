import Common from '@company/common-js-web';
import UserService from '../UserService.js';
import UserActionBase from './UserActionBase.js';

const { Actions, DataTableBuilder, Toast } = Common;

class EnquiryAction extends UserActionBase {
    constructor() {
        super();
        this.table = null;
    }

    async init() {
        const records = await this.loadUsers();
        this.table = this.buildTable(records);
        this.bindReloadButton();
    }

    async loadUsers() {
        try {
            const response = await UserService.search();
            return Array.isArray(response.data) ? response.data : [];
        } catch (error) {
            Toast.error('Failed to load users.');
            console.error(error);
            return [];
        }
    }

    buildTable(records) {
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

    bindReloadButton() {
        const reload = document.querySelector('#reloadButton');

        reload.addEventListener('click', async () => {
            reload.disabled = true;

            try {
                const records = await this.loadUsers();
                this.table.replaceData(records);
                Toast.success('Users reloaded.');
            } finally {
                reload.disabled = false;
            }
        });
    }
}

export default EnquiryAction;
