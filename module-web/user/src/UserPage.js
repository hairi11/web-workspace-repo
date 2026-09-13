import Common from '@company/common-js-web';
import UserFormAction from './UserFormAction.js';
import UserService from './UserService.js';
import UserApi from './UserApi.js';
import { initEnquiry } from './action/EnquiryAction.js';
import { initCreate } from './action/CreateAction.js';
import { initUpdate } from './action/UpdateAction.js';
import { initView } from './action/ViewAction.js';
import { traceClass, traceFunction, traceObject, traceStatic } from './Trace.js';

const { Ajax, DataTableBuilder, PageRouter, Storage } = Common;

traceClass(UserFormAction, true);
traceClass(DataTableBuilder, true);
traceClass(Storage, true);
traceStatic(Ajax, 'Ajax');
traceObject(UserService, 'UserService');
traceObject(UserApi, 'UserApi');

new PageRouter()
    .route('enquiry', traceFunction(initEnquiry, 'EnquiryAction.initEnquiry'))
    .route('create', traceFunction(initCreate, 'CreateAction.initCreate'))
    .route('update', traceFunction(initUpdate, 'UpdateAction.initUpdate'))
    .route('view', traceFunction(initView, 'ViewAction.initView'))
    .start();
