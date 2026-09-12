import FxService from './FxService.js';

const actions = {};

async function init() {
    const page = document.body.dataset.page;

    if (!page) {
        return;
    }

    const action = actions[page];
    if (action) {
        await action({ service: FxService });
    }
}

document.addEventListener('DOMContentLoaded', init);
