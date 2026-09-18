const test = require('node:test');
const assert = require('node:assert/strict');
const Navigator = require('../src/button/Navigator');

test('Navigator reports first, middle and last row boundaries', function () {
    var first = new Navigator({index: 0, count: 3});
    assert.equal(first.hasPrevious(), false);
    assert.equal(first.hasNext(), true);

    var middle = new Navigator({index: 1, count: 3});
    assert.equal(middle.hasPrevious(), true);
    assert.equal(middle.hasNext(), true);

    var last = new Navigator({index: 2, count: 3});
    assert.equal(last.hasPrevious(), true);
    assert.equal(last.hasNext(), false);
});

test('Navigator supports create position after the last existing row', function () {
    var navigator = new Navigator({index: 3, count: 3});

    assert.equal(navigator.hasPrevious(), true);
    assert.equal(navigator.hasNext(), false);
});

test('Navigator blocks navigation when beforeNavigate returns false', async function () {
    var visited = null;
    var navigator = new Navigator({
        index: 1,
        count: 3,
        beforeNavigate: function () {
            return false;
        },
        onNavigate: function (index) {
            visited = index;
        }
    });

    var result = await navigator.navigate(2);

    assert.equal(result, false);
    assert.equal(visited, null);
    assert.equal(navigator.index, 1);
});

test('Navigator updates current index after successful navigation', async function () {
    var visited = null;
    var navigator = new Navigator({
        index: 0,
        count: 3,
        onNavigate: function (index) {
            visited = index;
        }
    });

    var result = await navigator.navigate(1);

    assert.equal(result, true);
    assert.equal(visited, 1);
    assert.equal(navigator.index, 1);
});

test('Navigator reports callback errors without rejecting navigation', async function () {
    var captured = null;
    var navigator = new Navigator({
        index: 0,
        count: 2,
        onNavigate: function () {
            throw new Error('Navigation failed.');
        },
        onError: function (error) {
            captured = error;
        }
    });

    var result = await navigator.navigate(1);

    assert.equal(result, false);
    assert.equal(captured.message, 'Navigation failed.');
    assert.equal(navigator.index, 0);
});
