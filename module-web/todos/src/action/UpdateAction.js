import TodoFormAction from '../TodoFormAction.js';
import { requireId } from './todoActionBase.js';

export async function initUpdate() {
    const action = new TodoFormAction('#todoForm', {
        mode: 'update',
        id: requireId()
    });

    action.build();
    await action.load();
}
