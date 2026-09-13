import Common from '@company/common-js-web';
import { initEnquiry } from './action/EnquiryAction.js';
import { initCreate } from './action/CreateAction.js';
import { initTransaction } from './action/TransactionAction.js';

const { PageRouter } = Common;

new PageRouter()
    .route('enquiry', initEnquiry)
    .route('create', initCreate)
    .route('transaction', initTransaction)
    .start();
