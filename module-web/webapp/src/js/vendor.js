import $ from 'jquery';
import 'datatables.net-bs5';
import 'datatables.net-select-bs5';
import flatpickr from 'flatpickr';
import select2 from 'select2';

window.jQuery = window.$ = $;
window.flatpickr = flatpickr;
select2(window, $);
