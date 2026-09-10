import Common from '@company/common-js-web';
import UserFormAction from './UserFormAction.js';
import UserService from './UserService.js';

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
    const tbody = document.querySelector('#userTableBody');
    const search = document.querySelector('#searchInput');
    const reload = document.querySelector('#reloadButton');
    let records = [];

    async function load() {
        showMessage(tbody, 'Loading...');

        try {
            const response = await UserService.search();
            records = Array.isArray(response.data) ? response.data : [];
            render();
        } catch (error) {
            showMessage(tbody, 'Failed to load users.');
            Toast.error('Failed to load users.');
            console.error(error);
        }
    }

    function render() {
        const keyword = (search.value || '').trim().toLowerCase();

        const filtered = keyword
            ? records.filter((user) =>
                [user.id, user.name, user.username, user.email, user.phone]
                    .some((v) => asText(v).toLowerCase().includes(keyword))
            )
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
            if (!window.confirm('Delete user #' + id + '?')) return;

            try {
                await UserService.delete(id);
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

function showMessage(tbody, message) {
    tbody.textContent = '';
    const row = document.createElement('tr');
    const cell = document.createElement('td');
    cell.colSpan = 6;
    cell.textContent = message;
    row.appendChild(cell);
    tbody.appendChild(row);
}

function renderRows(tbody, users) {
    tbody.textContent = '';

    if (!users.length) {
        showMessage(tbody, 'No users found.');
        return;
    }

    users.forEach((user) => {
        const row = document.createElement('tr');

        [user.id, user.name, user.username, user.email, user.phone].forEach((value) => {
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
            button.dataset.id = user.id;
            actions.appendChild(button);
        });

        row.appendChild(actions);
        tbody.appendChild(row);
    });
}

document.addEventListener('DOMContentLoaded', init);
