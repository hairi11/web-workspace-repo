const { LRUCache } = require('lru-cache');

class MemoryCache {
    constructor(options) {
        options = options || {};
        this.cache = new LRUCache({
            max: options.max || 1000
        });
    }

    get(key) {
        return this.cache.get(key);
    }

    set(key, value, ttl) {
        this.cache.set(key, value, ttl > 0 ? { ttl: ttl } : undefined);
        return value;
    }

    delete(key) {
        return this.cache.delete(key);
    }

    clear() {
        this.cache.clear();
    }
}

module.exports = MemoryCache;
