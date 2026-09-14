import Common from '@company/common-js-web';

const { DateUtil, Storage } = Common;

const DRAFT_KEY_PREFIX = 'fx.master.draft.';
const storage = new Storage(window.sessionStorage);

function newDraftKey() {
    return 'new-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
}

function draftKeyForMaster(masterId) {
    return masterId === null || masterId === undefined
        ? newDraftKey()
        : 'master-' + String(masterId);
}

function storageKey(draftKey) {
    return DRAFT_KEY_PREFIX + draftKey;
}

function cloneTransaction(transaction) {
    return Object.assign({}, transaction || {});
}

function cloneDraft(draft) {
    return {
        draftKey: draft.draftKey,
        master: Object.assign({}, draft.master || {}),
        transactions: Array.isArray(draft.transactions)
            ? draft.transactions.map(cloneTransaction)
            : []
    };
}

const FxDraft = {
    create: function () {
        return this.save({
            draftKey: draftKeyForMaster(null),
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
            draftKey: draftKeyForMaster(master && master.id),
            master: master || {},
            transactions: transactions || []
        });
    },

    get: function (draftKey) {
        if (!draftKey) return null;

        const draft = storage.get(storageKey(draftKey));

        if (!draft || draft.draftKey !== draftKey || !draft.master || !Array.isArray(draft.transactions)) {
            return null;
        }

        return cloneDraft(draft);
    },

    save: function (draft) {
        if (!draft || !draft.draftKey) {
            throw new Error('FX draft key is required.');
        }

        const value = cloneDraft(draft);
        storage.set(storageKey(value.draftKey), value);
        return value;
    },

    clear: function (draftKey) {
        if (draftKey) storage.remove(storageKey(draftKey));
    },

    upsertTransaction: function (draftKey, index, transaction) {
        const draft = this.get(draftKey);
        if (!draft) return null;

        if (Number.isInteger(index) && index >= 0 && index < draft.transactions.length) {
            draft.transactions[index] = cloneTransaction(transaction);
        } else {
            draft.transactions.push(cloneTransaction(transaction));
        }

        return this.save(draft);
    },

    removeTransaction: function (draftKey, index) {
        const draft = this.get(draftKey);
        if (!draft) return null;

        if (Number.isInteger(index) && index >= 0 && index < draft.transactions.length) {
            draft.transactions.splice(index, 1);
        }

        return this.save(draft);
    }
};

export default FxDraft;
