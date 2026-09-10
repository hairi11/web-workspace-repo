class InterceptorManager {
    constructor() {
        this.items = [];
    }

    use(interceptor) {
        this.items.push(interceptor || {});
        var self = this;
        return function () {
            var index = self.items.indexOf(interceptor);
            if (index >= 0) self.items.splice(index, 1);
        };
    }

    async run(name, value) {
        var current = value;
        for (var i = 0; i < this.items.length; i += 1) {
            var fn = this.items[i] && this.items[i][name];
            if (typeof fn === 'function') {
                var next = await fn(current);
                if (next !== undefined) current = next;
            }
        }
        return current;
    }
}

module.exports = InterceptorManager;
