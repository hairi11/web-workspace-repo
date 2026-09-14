import Common from '@company/common-js-web';

const { DateUtil, Storage } = Common;

const DRAFT_KEY = 'fx.master.draft';
const storage = new Storage(window.sessionStorage);

function cloneTransaction(transaction) {
    return Object.assign({}, transaction || {});
}

function cloneDraft(draft) {
    return {
        master: Object.assign({}, draft.master || {}),
        transactions: Array.isArray(draft.transactions)
            ? draft.transactions.map(cloneTransaction)
            : []
    };
}

const FxDraft = {
    create: function () {
        return this.save({
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
            master: master || {},
            transactions: transactions || []
        });
    },

    get: function () {
        const draft = storage.get(DRAFT_KEY);

        if (!draft || !draft.master || !Array.isArray(draft.transactions)) {
            return null;
        }

        return cloneDraft(draft);
    },

    save: function (draft) {
        const value = cloneDraft(draft);
        storage.set(DRAFT_KEY, value);
        return value;
    },

    clear: function () {
        storage.remove(DRAFT_KEY);
    },

    upsertTransaction: function (index, transaction) {
        const draft = this.get();
        if (!draft) return null;

        if (Number.isInteger(index) && index >= 0 && index < draft.transactions.length) {
            draft.transactions[index] = cloneTransaction(transaction);
        } else {
            draft.transactions.push(cloneTransaction(transaction));
        }

        return this.save(draft);
    },

    removeTransaction: function (index) {
        const draft = this.get();
        if (!draft) return null;

        if (Number.isInteger(index) && index >= 0 && index < draft.transactions.length) {
            draft.transactions.splice(index, 1);
        }

        return this.save(draft);
    }
};

export default FxDraft;
