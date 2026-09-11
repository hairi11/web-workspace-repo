import UserFormAction from '../UserFormAction.js';
import { clearDraft, getDraft, getStepConfig, saveDraft } from './userActionBase.js';

const NEXT_URL = {
    profile: './create-address.html',
    address: './create-company.html',
    company: './view.html?preview=1'
};

export function initCreate() {
    const step = document.body.dataset.step || 'profile';
    const params = new URLSearchParams(window.location.search);
    const config = getStepConfig(step);

    if (step === 'profile' && params.get('resume') !== '1') {
        clearDraft();
    }

    const action = new UserFormAction('#userForm', {
        validationRules: config.validationRules,
        buildRequestData: config.buildRequestData,
        populate: config.populate,
        beforeSubmit: function (context) {
            const existing = getDraft();
            const draft = existing && existing.mode === 'create'
                ? existing
                : { mode: 'create', id: null, data: {} };

            draft.data = Object.assign({}, draft.data, context.data);
            saveDraft(draft);

            window.location.href = NEXT_URL[step];
            return false;
        }
    });

    action.build();

    const draft = getDraft();
    if (draft && draft.mode === 'create') {
        action.populate(draft.data);
    }
}
