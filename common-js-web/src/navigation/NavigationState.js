const Storage = require('../storage/Storage');

const STORAGE_KEY = 'app.navigation.state';

class NavigationState {
    static set(state) {
        if (!state || typeof state !== 'object' || Array.isArray(state)) {
            throw new Error('NavigationState.set requires a state object.');
        }

        NavigationState._storage().set(STORAGE_KEY, state);
        return state;
    }

    static get(defaultValue) {
        const state = NavigationState._storage().get(STORAGE_KEY);
        return state === null ? (defaultValue === undefined ? null : defaultValue) : state;
    }

    static consume(defaultValue) {
        const state = NavigationState.get(defaultValue);
        NavigationState.clear();
        return state;
    }

    static clear() {
        NavigationState._storage().remove(STORAGE_KEY);
    }

    static _storage() {
        if (typeof window === 'undefined' || !window.sessionStorage) {
            throw new Error('NavigationState requires sessionStorage.');
        }
        return new Storage(window.sessionStorage);
    }
}

module.exports = NavigationState;
