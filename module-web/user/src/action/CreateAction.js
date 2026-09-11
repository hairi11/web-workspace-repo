import UserFormAction from '../UserFormAction.js';
import { clearDraft, getDraft } from './userActionBase.js';

export function initCreate() {
    const step = document.body.dataset.step || 'profile';
    const params = new URLSearchParams(window.location.search);

    if (step === 'profile' && params.get('resume') !== '1') {
        clearDraft();
    }

    const action = new UserFormAction('#userForm', {
        mode: 'create',
        step: step
    });

    action.build();

    const draft = getDraft();
    if (draft && draft.mode === 'create') {
        action.populate(draft.data);
    }
}
