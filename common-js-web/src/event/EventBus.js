class EventBus {
    constructor() {
        this.listeners = {};
    }

    on(eventName, handler) {
        if (typeof handler !== 'function') throw new TypeError('Event handler must be a function.');
        if (!this.listeners[eventName]) this.listeners[eventName] = [];
        this.listeners[eventName].push(handler);

        var self = this;
        return function unsubscribe() {
            self.off(eventName, handler);
        };
    }

    once(eventName, handler) {
        var unsubscribe = null;
        unsubscribe = this.on(eventName, function () {
            unsubscribe();
            return handler.apply(null, arguments);
        });
        return unsubscribe;
    }

    off(eventName, handler) {
        var handlers = this.listeners[eventName] || [];
        this.listeners[eventName] = handlers.filter(function (item) {
            return item !== handler;
        });
        return this;
    }

    emit(eventName) {
        var args = Array.prototype.slice.call(arguments, 1);
        var handlers = (this.listeners[eventName] || []).slice();
        handlers.forEach(function (handler) {
            handler.apply(null, args);
        });
        return this;
    }

    clear(eventName) {
        if (eventName) delete this.listeners[eventName];
        else this.listeners = {};
        return this;
    }
}

module.exports = EventBus;
