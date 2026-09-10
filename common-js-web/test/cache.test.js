const test = require('node:test');
const assert = require('node:assert/strict');
const MemoryCache = require('../src/cache/MemoryCache');

test('MemoryCache stores and clears data', function () {
    const cache = new MemoryCache();
    cache.set('a', 1, 0);
    assert.equal(cache.get('a'), 1);
    cache.clear();
    assert.equal(cache.get('a'), undefined);
});
