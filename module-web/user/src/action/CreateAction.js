import UserFormAction from '../UserFormAction.js';
import UserActionBase from './UserActionBase.js';

class CreateAction extends UserActionBase {
    init() {
        new UserFormAction('#userForm', { mode: 'create' }).build();
    }
}

export default CreateAction;
