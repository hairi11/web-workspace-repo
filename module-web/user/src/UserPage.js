import { initEnquiry } from './action/EnquiryAction.js';
import { initCreate } from './action/CreateAction.js';
import { initUpdate } from './action/UpdateAction.js';
import { initView } from './action/ViewAction.js';

const actions = {
    enquiry: initEnquiry,
    create: initCreate,
    update: initUpdate,
    view: initView
};

async function init() {
    try {
        const page = document.body.dataset.page;
        const action = actions[page];

        if (!action) {
            throw new Error('Unsupported user page: ' + page);
        }

        await action();
    } catch (error) {
        console.error(error);
    }
}

document.addEventListener('DOMContentLoaded', init);
