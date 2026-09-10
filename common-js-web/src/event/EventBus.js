const EventEmitter = require('eventemitter3');

class EventBus {
    constructor() {
        this.emitter = new EventEmitter();
    }

    on(eventName, handler) {
        if (typeof handler !== 'function') throw new TypeError('Event handler must be a function.');
        this.emitter.on(eventName, handler);

        var self = this;
        return function unsubscribe() {
            self.off(eventName, handler);
        };
    }

    once(eventName, handler) {
        if (typeof handler !== 'function') throw new TypeError('Event handler must be a function.');
        this.emitter.once(eventName, handler);

        var self = this;
        return function unsubscribe() {
            self.off(eventName, handler);
        };
    }

    off(eventName, handler) {
        this.emitter.off(eventName, handler);
        return this;
    }

    emit() {
        this.emitter.emit.apply(this.emitter, arguments);
        return this;
    }

    clear(eventName) {
        if (eventName) this.emitter.removeAllListeners(eventName);
        else this.emitter.removeAllListeners();
        return this;
    }
}

module.exports = EventBus;
