import Common from '@company/common-js-web';

const { DateUtil, Storage } = Common;

const ROWS_KEY_PREFIX = 'fx.rows.';
const storage = new Storage(window.sessionStorage);

function newRowsKey() {
    return 'new-' + crypto.randomUUID();
}

function rowsKeyForMaster(masterId) {
    return masterId === null || masterId === undefined
        ? newRowsKey()
        : 'master-' + String(masterId);
}

function storageKey(rowsKey) {
    return ROWS_KEY_PREFIX + rowsKey;
}

function cloneTransaction(transaction) {
    return Object.assign({}, transaction || {});
}

function cloneRows(rows) {
    return {
        rowsKey: rows.rowsKey,
        master: Object.assign({}, rows.master || {}),
        transactions: Array.isArray(rows.transactions)
            ? rows.transactions.map(cloneTransaction)
            : []
    };
}

const FxRows = {
    create: function () {
        return this.save({
            rowsKey: rowsKeyForMaster(null),
            master: {
                id: null,
                status: 'DRAFT',
                reportDate: DateUtil.toApiDate(new Date())
            },
            transactions: []
        });
    },

    load: function (master, transactions) {
        return this.save({
            rowsKey: rowsKeyForMaster(master && master.id),
            master: master || {},
            transactions: transactions || []
        });
    },

    get: function (rowsKey) {
        if (!rowsKey) return null;

        const rows = storage.get(storageKey(rowsKey));

        if (!rows || rows.rowsKey !== rowsKey || !rows.master || !Array.isArray(rows.transactions)) {
            return null;
        }

        return cloneRows(rows);
    },

    save: function (rows) {
        if (!rows || !rows.rowsKey) {
            throw new Error('FX rows key is required.');
        }

        const value = cloneRows(rows);
        storage.set(storageKey(value.rowsKey), value);
        return value;
    },

    clear: function (rowsKey) {
        if (rowsKey) storage.remove(storageKey(rowsKey));
    },

    upsertTransaction: function (rowsKey, index, transaction) {
        const rows = this.get(rowsKey);
        if (!rows) return null;

        if (Number.isInteger(index) && index >= 0 && index < rows.transactions.length) {
            rows.transactions[index] = cloneTransaction(transaction);
        } else {
            rows.transactions.push(cloneTransaction(transaction));
        }

        return this.save(rows);
    },

    removeTransaction: function (rowsKey, index) {
        const rows = this.get(rowsKey);
        if (!rows) return null;

        if (Number.isInteger(index) && index >= 0 && index < rows.transactions.length) {
            rows.transactions.splice(index, 1);
        }

        return this.save(rows);
    }
};

export default FxRows;
