import TodoFormAction from '../TodoFormAction.js';
import { initStatusSelect } from './todoActionBase.js';

export function initCreate() {
    initStatusSelect();
    new TodoFormAction('#todoForm', { mode: 'create' }).build();
}
