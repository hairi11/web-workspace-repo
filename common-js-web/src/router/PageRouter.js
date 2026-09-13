const Router = require('./Router');

class PageRouter extends Router {
    constructor(options) {
        super();
        this.options = Object.assign({
            attribute: 'page'
        }, options || {});
    }

    async dispatchPage() {
        const page = document.body && document.body.dataset
            ? document.body.dataset[this.options.attribute]
            : null;

        if (!page) return;
        return super.dispatch(page);
    }

    start() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.dispatchPage(), { once: true });
        } else {
            this.dispatchPage();
        }

        return this;
    }
}

module.exports = PageRouter;
