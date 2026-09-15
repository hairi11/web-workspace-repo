export const MasterMode = Object.freeze({
    EDIT: 'edit',
    VIEW: 'view'
});

export const TransactionMode = Object.freeze({
    CREATE: 'create',
    EDIT: 'edit',
    VIEW: 'view',

    isCreate: function (mode) {
        return mode === this.CREATE;
    },

    isEdit: function (mode) {
        return mode === this.EDIT;
    },

    isView: function (mode) {
        return mode === this.VIEW;
    }
});

export const ReferenceType = Object.freeze({
    CATEGORY: 'FX_CATEGORY',
    CODE: 'FX_CODE',
    CURRENCY: 'FX_CURRENCY',
    TYPE: 'FX_TYPE'
});
