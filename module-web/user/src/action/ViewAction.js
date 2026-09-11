import Common from '@company/common-js-web';
import UserService from '../UserService.js';
import { asText, clearDraft, getDraft, requireId } from './userActionBase.js';

const { Toast } = Common;

function renderUser(user) {
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
}

export async function initView() {
    const params = new URLSearchParams(window.location.search);
    const preview = params.get('preview') === '1';
    const saveButton = document.querySelector('#saveButton');
    const updateLink = document.querySelector('#updateLink');
    const backLink = document.querySelector('#backLink');

    if (preview) {
        const draft = getDraft();

        if (!draft) {
            Toast.error('Preview data is not available.');
            window.location.href = './enquiry.html';
            return;
        }

        const user = Object.assign({}, draft.data, {
            id: draft.id || null
        });

        renderUser(user);
        saveButton.hidden = false;
        updateLink.hidden = true;
        backLink.href = draft.mode === 'update' && draft.id
            ? './update.html?id=' + encodeURIComponent(draft.id)
            : './create.html';

        saveButton.addEventListener('click', async () => {
            saveButton.disabled = true;

            try {
                const response = draft.mode === 'update'
                    ? await UserService.update(draft.id, draft.data)
                    : await UserService.create(draft.data);

                const saved = Object.assign({}, draft.data, response.data || {});

                if (draft.mode === 'update') {
                    saved.id = draft.id;
                }

                clearDraft();
                renderUser(saved);

                saveButton.hidden = true;
                updateLink.hidden = !saved.id;
                backLink.href = './enquiry.html';

                if (saved.id) {
                    updateLink.href = './update.html?id=' + encodeURIComponent(saved.id);
                    window.history.replaceState({}, '', './view.html?id=' + encodeURIComponent(saved.id));
                }

                Toast.success(
                    draft.mode === 'update'
                        ? 'User updated successfully.'
                        : 'User created successfully.'
                );
            } catch (error) {
                Toast.error(error && error.message ? error.message : 'Save failed.');
                console.error(error);
            } finally {
                saveButton.disabled = false;
            }
        });

        return;
    }

    const response = await UserService.getById(requireId());
    const user = response.data;

    renderUser(user);
    saveButton.hidden = true;
    updateLink.hidden = false;
    updateLink.href = './update.html?id=' + encodeURIComponent(user.id);
    backLink.href = './enquiry.html';
}
