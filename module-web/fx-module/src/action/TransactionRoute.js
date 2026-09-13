import Common from '@company/common-js-web';
import { TransactionMode } from '../FxTransactionFormAction.js';

const { Storage } = Common;

const storage = new Storage(window.sessionStorage);
const STORAGE_KEY = 'fx.transaction.route';

export function setTransactionRoute(mode, key = null) {
    storage.set(STORAGE_KEY, { mode, key });
}

export function getTransactionRoute() {
    const route = storage.get(STORAGE_KEY);

    if (!route || !Object.values(TransactionMode).includes(route.mode)) {
        return { mode: TransactionMode.CREATE, key: null };
    }

    return route;
}

export function clearTransactionRoute() {
    storage.remove(STORAGE_KEY);
}
