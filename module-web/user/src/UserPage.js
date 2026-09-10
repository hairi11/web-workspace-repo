import Common from '@company/common-js-web';
import UserFormAction from './UserFormAction.js';
import UserService from './UserService.js';

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
        Toast.error('User id is required.');
        throw new Error('Missing user id.');
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
                new UserFormAction('#userForm', { mode: 'create' }).build();
                break;
            case 'update':
                await initUpdate();
                break;
            case 'view':
                await initView();
                break;
            default:
                throw new Error('Unsupported user page: ' + pageName());
        }
    } catch (error) {
        console.error(error);
    }
}

async function initEnquiry() {
    const reload = document.querySelector('#reloadButton');
    let records = [];

    try {
        const response = await UserService.search();
        records = Array.isArray(response.data) ? response.data : [];
    } catch (error) {
        Toast.error('Failed to load users.');
        console.error(error);
    }

    const table = new DataTableBuilder('#userTable')
        .data(records)
        .column('id', 'ID')
        .column('name', 'Name')
        .column('username', 'Username')
        .column('email', 'Email')
        .column('phone', 'Phone')
        .searchInput('#searchInput')
        .menuAction({ title: 'Actions', mode: 'inline' })
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

    reload.addEventListener('click', async () => {
        reload.disabled = true;

        try {
            const response = await UserService.search();
            records = Array.isArray(response.data) ? response.data : [];
            table.replaceData(records);
            Toast.success('Users reloaded.');
        } catch (error) {
            Toast.error('Failed to reload users.');
            console.error(error);
        } finally {
            reload.disabled = false;
        }
    });
}

async function initUpdate() {
    const id = requiredId();
    const action = new UserFormAction('#userForm', {
        mode: 'update',
        id: id
    });

    action.build();
    await action.load();
}

async function initView() {
    const id = requiredId();
    const response = await UserService.getById(id);
    const user = response.data;
    const container = document.querySelector('#userView');

    container.textContent = '';

    [
        ['ID', user.id],
        ['Name', user.name],
        ['Username', user.username],
        ['Email', user.email],
        ['Phone', user.phone],
        ['Website', user.website],
        ['Company', user.company && user.company.name],
        ['City', user.address && user.address.city]
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
        './update.html?id=' + encodeURIComponent(user.id);
}

document.addEventListener('DOMContentLoaded', init);
