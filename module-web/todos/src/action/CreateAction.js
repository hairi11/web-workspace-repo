import TodoFormAction from '../TodoFormAction.js';

export function initCreate() {
    new TodoFormAction('#todoForm', { mode: 'create' }).build();
}
