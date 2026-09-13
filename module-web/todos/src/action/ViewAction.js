import Common from '@company/common-js-web';
import TodoService from '../TodoService.js';
import { asText, clearDraft, getDraft } from './todoActionBase.js';

const { NavigationState, Toast } = Common;

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

function configureUpdateLink(updateLink, id) {
    updateLink.hidden = !id;
    updateLink.href = id ? './update.html' : '#';
    updateLink.onclick = id
        ? () => NavigationState.set({ page: 'todo-update', id: id })
        : null;
}

export async function initView() {
    const navigation = NavigationState.consume();
    const saveButton = document.querySelector('#saveButton');
    const updateLink = document.querySelector('#updateLink');
    const backLink = document.querySelector('#backLink');

    if (navigation && navigation.preview) {
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

        if (draft.mode === 'update' && draft.id) {
            backLink.href = './update.html';
            backLink.onclick = () => NavigationState.set({ page: 'todo-update', id: draft.id });
        } else {
            backLink.href = './create.html';
            backLink.onclick = null;
        }

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
                configureUpdateLink(updateLink, saved.id);
                backLink.href = './enquiry.html';
                backLink.onclick = null;

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

    const id = navigation && navigation.id;
    if (!id) {
        Toast.error('Todo id is required.');
        window.location.href = './enquiry.html';
        return;
    }

    const response = await TodoService.getById(id);
    const todo = response.data;

    renderTodo(todo);
    saveButton.hidden = true;
    configureUpdateLink(updateLink, todo.id);
    backLink.href = './enquiry.html';
    backLink.onclick = null;
}
