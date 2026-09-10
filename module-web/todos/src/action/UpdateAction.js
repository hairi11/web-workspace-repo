import TodoFormAction from '../TodoFormAction.js';
import { initStatusSelect, requireId } from './todoActionBase.js';

export async function initUpdate() {
    initStatusSelect();

    const action = new TodoFormAction('#todoForm', {
        mode: 'update',
        id: requireId()
    });

    action.build();
    await action.load();
}
