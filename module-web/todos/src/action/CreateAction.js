import TodoFormAction from '../TodoFormAction.js';

export async function initCreate() {
    const action = new TodoFormAction('#todoForm', { mode: 'create' });

    await action.loadStatusOptions();
    action.build();
}
