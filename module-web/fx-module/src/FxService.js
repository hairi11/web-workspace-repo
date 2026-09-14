import Common from '@company/common-js-web';
import FxApi from './FxApi.js';

const { Ajax, CaseUtil } = Common;

function responseData(response) {
    return response ? CaseUtil.toCamelKeys(response.data) : null;
}

function responseObject(response) {
    const data = responseData(response);
    return data && typeof data === 'object' && !Array.isArray(data) ? data : null;
}

function responseArray(response) {
    const data = responseData(response);
    return Array.isArray(data) ? data : [];
}

function post(url, data) {
    return Ajax.post(url, CaseUtil.toSnakeKeys(data)).then((response) => {
        if (response) response.data = CaseUtil.toCamelKeys(response.data);
        return response;
    });
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

    findAllMasters: function () {
        return Ajax.get(FxApi.masters, {
            cache: false,
            dedupe: true
        }).then(responseArray);
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

    updateTransaction: function (id, data) {
        return post(FxApi.transactionById(id), data);
    },

    deleteTransaction: function (id) {
        return post(FxApi.transactionById(id) + '/delete', {});
    },

    save: function (data) {
        return post(FxApi.save, data);
    },

    submit: function (data) {
        return post(FxApi.submit, data);
    }
};

export default FxService;
