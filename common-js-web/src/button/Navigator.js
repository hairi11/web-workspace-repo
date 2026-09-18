class Navigator {
    constructor(options) {
        this.options = options || {};
        this.previousElement = null;
        this.nextElement = null;
        this.previousHandler = null;
        this.nextHandler = null;
        this.index = Number.isInteger(this.options.index) ? this.options.index : 0;
        this.count = this.normalizeCount(this.options.count);
        this.navigating = false;
    }

    build() {
        this.previousElement = this.resolveElement(this.options.previous);
        this.nextElement = this.resolveElement(this.options.next);

        if (!this.previousElement || !this.nextElement) {
            throw new Error('Navigator previous and next elements are required.');
        }

        this.previousHandler = (event) => {
            this.handleClick(event, -1);
        };
        this.nextHandler = (event) => {
            this.handleClick(event, 1);
        };

        this.previousElement.classList.add('navigator-link', 'navigator-previous');
        this.nextElement.classList.add('navigator-link', 'navigator-next');

        this.previousElement.addEventListener('click', this.previousHandler);
        this.nextElement.addEventListener('click', this.nextHandler);

        this.setHidden(this.options.hidden === true);
        this.refresh();

        return this;
    }

    destroy() {
        if (this.previousElement && this.previousHandler) {
            this.previousElement.removeEventListener('click', this.previousHandler);
        }

        if (this.nextElement && this.nextHandler) {
            this.nextElement.removeEventListener('click', this.nextHandler);
        }

        this.previousHandler = null;
        this.nextHandler = null;
        this.previousElement = null;
        this.nextElement = null;
        return this;
    }

    update(index, count) {
        if (Number.isInteger(index)) {
            this.index = index;
        }

        if (count !== undefined) {
            this.count = this.normalizeCount(count);
        }

        this.refresh();
        return this;
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
        return this.count > 0
            && Number.isInteger(this.index)
            && this.index > 0;
    }

    hasNext() {
        return this.count > 0
            && Number.isInteger(this.index)
            && this.index < this.count - 1;
    }

    async navigate(targetIndex) {
        if (!this.isValidTarget(targetIndex) || this.navigating) {
            return false;
        }

        this.navigating = true;

        try {
            if (typeof this.options.beforeNavigate === 'function') {
                var proceed = await this.options.beforeNavigate(targetIndex);
                if (proceed === false) return false;
            }

            if (typeof this.options.onNavigate === 'function') {
                await this.options.onNavigate(targetIndex);
            }

            this.index = targetIndex;
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

    handleClick(event, offset) {
        event.preventDefault();

        var element = offset < 0 ? this.previousElement : this.nextElement;
        if (!element || element.getAttribute('aria-disabled') === 'true') return;

        this.navigate(this.index + offset);
    }

    isValidTarget(index) {
        return Number.isInteger(index)
            && index >= 0
            && index < this.count;
    }

    setDisabled(element, disabled) {
        if (!element) return;

        var value = Boolean(disabled);
        element.classList.toggle('is-disabled', value);
        element.setAttribute('aria-disabled', String(value));
        element.tabIndex = value ? -1 : 0;
    }

    resolveElement(target) {
        if (typeof target === 'string') {
            return document.querySelector(target);
        }

        return target || null;
    }

    normalizeCount(count) {
        var value = Number(count);
        return Number.isInteger(value) && value >= 0 ? value : 0;
    }
}

module.exports = Navigator;
