import Common from '@company/common-js-web';
import FxApi from './FxApi.js';

const { Ajax } = Common;

const FxService = {
    enquiry: function () {
        return Ajax.get(FxApi.enquiry, {
            cache: false,
            dedupe: true
        });
    },

    findAllMasters: function () {
        return Ajax.get(FxApi.masters, {
            cache: false,
            dedupe: true
        });
    },

    findMasterById: function (id) {
        return Ajax.get(FxApi.masterById(id), {
            cache: false
        });
    },

    findTransactionsByMasterId: function (masterId) {
        return Ajax.get(FxApi.transactionsByMasterId(masterId), {
            cache: false
        });
    },

    findTransactionById: function (id) {
        return Ajax.get(FxApi.transactionById(id), {
            cache: false
        });
    },

    save: function (data) {
        return Ajax.post(FxApi.save, data);
    },

    submit: function (data) {
        return Ajax.post(FxApi.submit, data);
    }
};

export default FxService;
