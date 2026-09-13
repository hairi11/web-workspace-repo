class Router {
    constructor() {
        this.routes = new Map();
    }

    route(name, handler) {
        if (!name || typeof handler !== 'function') {
            throw new Error('Router.route requires a route name and handler.');
        }

        this.routes.set(name, handler);
        return this;
    }

    has(name) {
        return this.routes.has(name);
    }

    async dispatch(name, context) {
        const handler = this.routes.get(name);
        if (!handler) return;
        return handler(context);
    }
}

module.exports = Router;
