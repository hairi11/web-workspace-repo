class RequestRegistry {
    constructor() {
        this.pending = new Map();
    }

    has(key) { return this.pending.has(key); }
    get(key) { return this.pending.get(key); }
    set(key, promise) { this.pending.set(key, promise); return promise; }
    delete(key) { this.pending.delete(key); }
    clear() { this.pending.clear(); }
}

module.exports = RequestRegistry;
