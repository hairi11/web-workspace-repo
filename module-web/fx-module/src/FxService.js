import Common from '@company/common-js-web';
import FxApi from './FxApi.js';

const { Ajax } = Common;

function responseData(response) {
    return response ? response.data : null;
}

function responseObject(response) {
    const data = responseData(response);
    return data && typeof data === 'object' && !Array.isArray(data) ? data : null;
}

function responseArray(response) {
    const data = responseData(response);
    return Array.isArray(data) ? data : [];
}

const FxService = {
    enquiry: function (page, size, sort) {
        const sortParams = Array.isArray(sort)
            ? sort.map((item) => item.field + ',' + item.dir)
            : [];

        return Ajax.get(FxApi.enquiry, {
            cache: false,
            dedupe: true,
            query: {
                page: page,
                size: size,
                sort: sortParams
            }
        }).then(responseObject);
    },

    findReferences: function (type) {
        return Ajax.get(FxApi.references, {
            cache: true,
            dedupe: true,
            query: {
                type: type
            }
        }).then(responseArray);
    },

    validateFxDate: function (date) {
        return Ajax.get(FxApi.validateDate, {
            cache: false,
            query: {
                date: date
            }
        }).then(responseObject);
    },

    findMasterById: function (id) {
        return Ajax.get(FxApi.masterById(id), {
            cache: false
        }).then(responseObject);
    },

    findTransactionsByMasterId: function (masterId) {
        return Ajax.get(FxApi.transactionsByMasterId(masterId), {
            cache: false
        }).then(responseArray);
    },

    findTransactionById: function (id) {
        return Ajax.get(FxApi.transactionById(id), {
            cache: false
        }).then(responseObject);
    },

    deleteTransaction: function (id) {
        return Ajax.post(FxApi.transactionById(id) + '/delete', {});
    },

    deleteMaster: function (id) {
        return Ajax.post(FxApi.masterById(id) + '/delete', {});
    },

    save: function (data) {
        return Ajax.post(FxApi.save, data);
    },

    submit: function (data) {
        return Ajax.post(FxApi.submit, data);
    }
};

export default FxService;
