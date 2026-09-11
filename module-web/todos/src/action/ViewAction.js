import Common from '@company/common-js-web';
import TodoService from '../TodoService.js';
import { asText, clearDraft, getDraft, requireId } from './todoActionBase.js';

const { Toast } = Common;

function renderTodo(todo) {
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

        const todo = Object.assign({}, draft.data, {
            id: draft.id || null
        });

        renderTodo(todo);
        saveButton.hidden = false;
        updateLink.hidden = true;
        backLink.href = draft.mode === 'update' && draft.id
            ? './update.html?id=' + encodeURIComponent(draft.id)
            : './create.html';

        saveButton.addEventListener('click', async () => {
            saveButton.disabled = true;

            try {
                const response = draft.mode === 'update'
                    ? await TodoService.update(draft.id, draft.data)
                    : await TodoService.create(draft.data);

                const saved = Object.assign({}, draft.data, response.data || {});

                if (draft.mode === 'update') {
                    saved.id = draft.id;
                }

                clearDraft();
                renderTodo(saved);

                saveButton.hidden = true;
                updateLink.hidden = !saved.id;
                backLink.href = './enquiry.html';

                if (saved.id) {
                    updateLink.href = './update.html?id=' + encodeURIComponent(saved.id);
                    window.history.replaceState({}, '', './view.html?id=' + encodeURIComponent(saved.id));
                }

                Toast.success(
                    draft.mode === 'update'
                        ? 'Todo updated successfully.'
                        : 'Todo created successfully.'
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

    const response = await TodoService.getById(requireId());
    const todo = response.data;

    renderTodo(todo);
    saveButton.hidden = true;
    updateLink.hidden = false;
    updateLink.href = './update.html?id=' + encodeURIComponent(todo.id);
    backLink.href = './enquiry.html';
}
