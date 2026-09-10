import TodoService from '../TodoService.js';
import { asText, requireId } from './todoActionBase.js';

export async function initView() {
    const response = await TodoService.getById(requireId());
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
