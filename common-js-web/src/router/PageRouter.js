class PageRouter {
    constructor(options) {
        this.options = Object.assign({
            attribute: 'page'
        }, options || {});
        this.routes = new Map();
    }

    route(name, handler) {
        if (!name || typeof handler !== 'function') {
            throw new Error('PageRouter.route requires a route name and handler.');
        }

        this.routes.set(name, handler);
        return this;
    }

    async dispatch() {
        const page = document.body && document.body.dataset
            ? document.body.dataset[this.options.attribute]
            : null;

        if (!page) return;

        const handler = this.routes.get(page);
        if (!handler) return;

        return handler();
    }

    start() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.dispatch(), { once: true });
        } else {
            this.dispatch();
        }

        return this;
    }
}

module.exports = PageRouter;
