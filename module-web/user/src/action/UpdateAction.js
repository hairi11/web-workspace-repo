import Common from '@company/common-js-web';
import UserFormAction from '../UserFormAction.js';
import UserService from '../UserService.js';
import { getDraft, getStepConfig, saveDraft } from './userActionBase.js';

const { NavigationState, Toast } = Common;

function nextUrl(step) {
    if (step === 'profile') return './update-address.html';
    if (step === 'address') return './update-company.html';
    return null;
}

export async function initUpdate() {
    const navigation = NavigationState.consume();
    const id = navigation && navigation.id;

    if (!id) {
        Toast.error('User id is required.');
        throw new Error('Missing user id.');
    }

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
        beforeSubmit: async function (context) {
            const current = getDraft() || {
                mode: 'update',
                id: id,
                data: {}
            };

            current.mode = 'update';
            current.id = id;
            current.data = Object.assign({}, current.data, context.data);

            if (step !== 'company') {
                saveDraft(current);
                NavigationState.set({ page: 'user-update', id: id });
                window.location.href = nextUrl(step);
                return false;
            }

            const response = await UserService.update(id, current.data);
            const saved = Object.assign({}, current.data, response.data || {}, {
                id: id
            });

            saveDraft({
                mode: 'saved',
                id: id,
                data: saved
            });

            NavigationState.set({ page: 'user-view', id: id, saved: true });
            window.location.href = './view.html';
            return false;
        }
    });

    action.build();
    action.populate(draft.data);
}
