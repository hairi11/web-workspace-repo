import Common from '@company/common-js-web';
import UserFormAction from './UserFormAction.js';
import UserService from './UserService.js';
import UserApi from './UserApi.js';
import { initEnquiry } from './action/EnquiryAction.js';
import { initCreate } from './action/CreateAction.js';
import { initUpdate } from './action/UpdateAction.js';
import { initView } from './action/ViewAction.js';
import { traceClass, traceFunction, traceObject, traceStatic } from './Trace.js';

const { Ajax, DataTableBuilder, Storage } = Common;

traceClass(UserFormAction, true);
traceClass(DataTableBuilder, true);
traceClass(Storage, true);
traceStatic(Ajax, 'Ajax');
traceObject(UserService, 'UserService');
traceObject(UserApi, 'UserApi');

const actions = {
    enquiry: traceFunction(initEnquiry, 'EnquiryAction.initEnquiry'),
    create: traceFunction(initCreate, 'CreateAction.initCreate'),
    update: traceFunction(initUpdate, 'UpdateAction.initUpdate'),
    view: traceFunction(initView, 'ViewAction.initView')
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

document.addEventListener('DOMContentLoaded', traceFunction(init, 'UserPage.init'));
