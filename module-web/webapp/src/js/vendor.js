import Common from '@company/common-js-web';
import $ from 'jquery';
import 'datatables.net-bs5';
import 'datatables.net-select-bs5';
import flatpickr from 'flatpickr';
import select2 from 'select2';

const { Ajax, CaseInterceptor } = Common;

window.jQuery = window.$ = $;
window.flatpickr = flatpickr;
select2(window, $);

Ajax.use(CaseInterceptor);
