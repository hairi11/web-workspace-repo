class Navigator {
    constructor(options) {
        this.options = options || {};
        this.previousElement = null;
        this.nextElement = null;
        this.bindings = [];
        this.index = Number.isInteger(this.options.index) ? this.options.index : 0;
        this.count = Navigator.count(this.options.count);
        this.navigating = false;
    }

    build() {
        this.previousElement = this.resolve(this.options.previous);
        this.nextElement = this.resolve(this.options.next);

        if (!this.previousElement || !this.nextElement) {
            throw new Error('Navigator previous and next elements are required.');
        }

        this.prepare(this.previousElement, 'navigator-previous', -1);
        this.prepare(this.nextElement, 'navigator-next', 1);
        this.setHidden(this.options.hidden === true);
        return this.refresh();
    }

    prepare(element, className, offset) {
        element.classList.remove('navigator-link', 'is-disabled');
        element.classList.add('btn', 'btn-link', 'text-decoration-none', className);

        var handler = (event) => {
            event.preventDefault();
            if (element.getAttribute('aria-disabled') !== 'true') {
                this.navigate(this.index + offset);
            }
        };

        element.addEventListener('click', handler);
        this.bindings.push({element: element, handler: handler});
    }

    destroy() {
        this.bindings.forEach(function (binding) {
            binding.element.removeEventListener('click', binding.handler);
        });
        this.bindings = [];
        this.previousElement = null;
        this.nextElement = null;
        return this;
    }

    update(index, count) {
        if (Number.isInteger(index)) this.index = index;
        if (count !== undefined) this.count = Navigator.count(count);
        return this.refresh();
    }

    setHidden(hidden) {
        var value = Boolean(hidden);
        if (this.previousElement) this.previousElement.hidden = value;
        if (this.nextElement) this.nextElement.hidden = value;
        return this;
    }

    refresh() {
        this.setDisabled(this.previousElement, !this.hasPrevious());
        this.setDisabled(this.nextElement, !this.hasNext());
        return this;
    }

    hasPrevious() {
        return this.count > 0 && this.index > 0;
    }

    hasNext() {
        return this.count > 0 && this.index < this.count - 1;
    }

    async navigate(index) {
        if (
            this.navigating
            || !Number.isInteger(index)
            || index < 0
            || index >= this.count
        ) {
            return false;
        }

        this.navigating = true;

        try {
            if (
                typeof this.options.beforeNavigate === 'function'
                && await this.options.beforeNavigate(index) === false
            ) {
                return false;
            }

            if (typeof this.options.onNavigate === 'function') {
                await this.options.onNavigate(index);
            }

            this.index = index;
            this.refresh();
            return true;
        } catch (error) {
            if (typeof this.options.onError === 'function') {
                this.options.onError(error);
            }
            return false;
        } finally {
            this.navigating = false;
        }
    }

    setDisabled(element, disabled) {
        if (!element) return;

        var value = Boolean(disabled);
        element.classList.toggle('disabled', value);
        element.setAttribute('aria-disabled', String(value));
        element.tabIndex = value ? -1 : 0;
    }

    resolve(target) {
        return typeof target === 'string'
            ? document.querySelector(target)
            : target || null;
    }

    static count(value) {
        value = Number(value);
        return Number.isInteger(value) && value >= 0 ? value : 0;
    }
}

module.exports = Navigator;
