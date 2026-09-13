import Common from '@company/common-js-web';
import { initEnquiry } from './action/EnquiryAction.js';
import { initCreate } from './action/CreateAction.js';
import { initUpdate } from './action/UpdateAction.js';
import { initView } from './action/ViewAction.js';

const { PageRouter } = Common;

new PageRouter()
    .route('enquiry', initEnquiry)
    .route('create', initCreate)
    .route('update', initUpdate)
    .route('view', initView)
    .start();
