import EnquiryAction from './action/EnquiryAction.js';
import CreateAction from './action/CreateAction.js';
import UpdateAction from './action/UpdateAction.js';
import ViewAction from './action/ViewAction.js';

const actions = {
    enquiry: EnquiryAction,
    create: CreateAction,
    update: UpdateAction,
    view: ViewAction
};

async function init() {
    try {
        const page = document.body.dataset.page;
        const Action = actions[page];

        if (!Action) {
            throw new Error('Unsupported user page: ' + page);
        }

        await new Action().init();
    } catch (error) {
        console.error(error);
    }
}

document.addEventListener('DOMContentLoaded', init);
