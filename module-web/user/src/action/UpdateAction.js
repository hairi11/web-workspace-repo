import UserFormAction from '../UserFormAction.js';
import UserActionBase from './UserActionBase.js';

class UpdateAction extends UserActionBase {
    async init() {
        const id = this.requireId();
        const action = new UserFormAction('#userForm', {
            mode: 'update',
            id: id
        });

        action.build();
        await action.load();
    }
}

export default UpdateAction;
