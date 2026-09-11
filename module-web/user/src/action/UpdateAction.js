import UserFormAction from '../UserFormAction.js';
import UserService from '../UserService.js';
import { getDraft, getStepConfig, requireId, saveDraft } from './userActionBase.js';

function nextUrl(step, id) {
    const encodedId = encodeURIComponent(id);

    if (step === 'profile') return './update-address.html?id=' + encodedId;
    if (step === 'address') return './update-company.html?id=' + encodedId;
    return './view.html?preview=1&id=' + encodedId;
}

export async function initUpdate() {
    const id = requireId();
    const step = document.body.dataset.step || 'profile';
    const config = getStepConfig(step);

    let draft = getDraft();

    if (!draft || draft.mode !== 'update' || String(draft.id) !== String(id)) {
        const response = await UserService.getById(id);
        draft = {
            mode: 'update',
            id: id,
            data: response.data
        };
        saveDraft(draft);
    }

    const action = new UserFormAction('#userForm', {
        validationRules: config.validationRules,
        buildRequestData: config.buildRequestData,
        populate: config.populate,
        beforeSubmit: function (context) {
            const current = getDraft() || {
                mode: 'update',
                id: id,
                data: {}
            };

            current.mode = 'update';
            current.id = id;
            current.data = Object.assign({}, current.data, context.data);
            saveDraft(current);

            window.location.href = nextUrl(step, id);
            return false;
        }
    });

    action.build();
    action.populate(draft.data);
}
