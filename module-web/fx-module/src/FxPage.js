import { initEnquiry } from './action/EnquiryAction.js';

const actions = {
    enquiry: initEnquiry
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
