class MemoryCache {
    constructor() {
        this.items = new Map();
    }

    get(key) {
        var entry = this.items.get(key);
        if (!entry) return undefined;

        if (entry.expiresAt && Date.now() > entry.expiresAt) {
            this.items.delete(key);
            return undefined;
        }

        return entry.value;
    }

    set(key, value, ttl) {
        this.items.set(key, {
            value: value,
            expiresAt: ttl > 0 ? Date.now() + ttl : 0
        });
        return value;
    }

    delete(key) {
        return this.items.delete(key);
    }

    clear() {
        this.items.clear();
    }
}

module.exports = MemoryCache;
