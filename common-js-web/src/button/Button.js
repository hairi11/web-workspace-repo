class Button {
    constructor(target, options) {
        this.target = target;
        this.options = options || {};
        this.element = null;
        this.clickHandler = null;
    }

    build() {
        this.element = this.resolveElement();

        if (!this.element) {
            throw new Error('Button element not found.');
        }

        this.applyVariant();
        this.setText(this.options.text);

        if (this.options.hidden !== undefined) {
            this.setHidden(this.options.hidden);
        }

        if (this.options.disabled !== undefined) {
            this.setDisabled(this.options.disabled);
        }

        this.bindClick();
        return this;
    }

    destroy() {
        if (this.element && this.clickHandler) {
            this.element.removeEventListener('click', this.clickHandler);
        }

        this.clickHandler = null;
        this.element = null;
        return this;
    }

    setText(text) {
        if (this.element && text !== undefined && text !== null) {
            this.element.textContent = String(text);
        }
        return this;
    }

    setHidden(hidden) {
        if (this.element) {
            this.element.hidden = Boolean(hidden);
        }
        return this;
    }

    setDisabled(disabled) {
        if (!this.element) return this;

        var value = Boolean(disabled);

        if ('disabled' in this.element) {
            this.element.disabled = value;
        }

        this.element.classList.toggle('disabled', value);
        this.element.setAttribute('aria-disabled', String(value));

        if (!('disabled' in this.element)) {
            this.element.tabIndex = value ? -1 : 0;
        }

        return this;
    }

    applyVariant() {
        if (!this.element) return this;

        var primary = this.options.variant === Button.Variant.PRIMARY;

        this.element.classList.remove(
            'button',
            'button-primary',
            'button-secondary',
            'btn-primary',
            'btn-outline-secondary'
        );
        this.element.classList.add(
            'btn',
            primary ? 'btn-primary' : 'btn-outline-secondary'
        );

        return this;
    }

    bindClick() {
        if (!this.element || typeof this.options.onClick !== 'function') return;

        this.clickHandler = (event) => {
            if (this.element.getAttribute('aria-disabled') === 'true') {
                event.preventDefault();
                return;
            }

            this.options.onClick(event);
        };

        this.element.addEventListener('click', this.clickHandler);
    }

    resolveElement() {
        if (typeof this.target === 'string') {
            return document.querySelector(this.target);
        }

        return this.target || null;
    }
}

Button.Variant = Object.freeze({
    PRIMARY: 'primary',
    SECONDARY: 'secondary'
});

module.exports = Button;
