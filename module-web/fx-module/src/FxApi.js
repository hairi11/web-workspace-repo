const BASE_URL = 'http://localhost:8080/api';

const FxApi = {
    enquiry: BASE_URL + '/fx/enquiry',
    masters: BASE_URL + '/fx-masters',
    save: BASE_URL + '/fx/save',
    submit: BASE_URL + '/fx/submit',

    masterById: function (id) {
        return this.masters + '/' + encodeURIComponent(id);
    },

    transactionsByMasterId: function (masterId) {
        return this.masterById(masterId) + '/transactions';
    },

    transactionById: function (id) {
        return BASE_URL + '/fx-transactions/' + encodeURIComponent(id);
    }
};

export default FxApi;
