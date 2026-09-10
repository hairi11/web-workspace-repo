import UserFormAction from '../UserFormAction.js';

export function initCreate() {
    new UserFormAction('#userForm', { mode: 'create' }).build();
}
