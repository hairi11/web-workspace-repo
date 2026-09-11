class Storage {
    constructor(provider) {
        if (!provider || typeof provider.setItem !== 'function' || typeof provider.getItem !== 'function') {
            throw new Error('Storage requires a compatible provider.');
        }

        this.provider = provider;
    }

    set(key, value) {
        this.provider.setItem(key, JSON.stringify(value));
        return this;
    }

    get(key) {
        const value = this.provider.getItem(key);
        return value === null ? null : JSON.parse(value);
    }

    remove(key) {
        this.provider.removeItem(key);
        return this;
    }

    clear() {
        this.provider.clear();
        return this;
    }
}

module.exports = Storage;
