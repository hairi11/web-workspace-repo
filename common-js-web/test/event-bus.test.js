const test = require('node:test');
const assert = require('node:assert/strict');
const EventBus = require('../src/event/EventBus');

test('EventBus emits and unsubscribes', function () {
    const bus = new EventBus();
    let count = 0;
    const off = bus.on('save', function () { count += 1; });
    bus.emit('save');
    off();
    bus.emit('save');
    assert.equal(count, 1);
});
