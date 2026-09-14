import Common from '@company/common-js-web';
import { initEnquiry } from './action/EnquiryAction.js';
import { initMaster } from './action/MasterAction.js';
import { initTransaction } from './action/TransactionAction.js';

const { PageRouter } = Common;

new PageRouter()
    .route('enquiry', initEnquiry)
    .route('master', initMaster)
    .route('transaction', initTransaction)
    .start();
