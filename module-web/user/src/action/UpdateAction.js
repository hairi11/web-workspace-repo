import UserFormAction from '../UserFormAction.js';
import { requireId } from './userActionBase.js';

export async function initUpdate() {
    const action = new UserFormAction('#userForm', {
        mode: 'update',
        id: requireId()
    });

    action.build();
    await action.load();
}
