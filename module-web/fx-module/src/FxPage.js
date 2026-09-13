import { initEnquiry } from './action/EnquiryAction.js';
import { initCreate } from './action/CreateAction.js';

const actions = {
    enquiry: initEnquiry,
    create: initCreate
};

async function init() {
    const page = document.body.dataset.page;

    if (!page) {
        return;
    }

    const action = actions[page];
    if (action) {
        await action();
    }
}

document.addEventListener('DOMContentLoaded', init);
