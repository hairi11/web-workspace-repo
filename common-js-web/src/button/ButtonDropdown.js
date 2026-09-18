const Button = require('./Button');

class ButtonDropdown {
    constructor(options) {
        this.options = options || {};
        this.trigger = null;
        this.menu = null;
        this.triggerButton = null;
        this.actionButton = null;
        this.itemButtons = [];
        this.triggerHandler = null;
        this.documentHandler = null;
        this.keydownHandler = null;
    }

    build() {
        this.trigger = this.resolveElement(this.options.trigger);
        this.menu = this.resolveElement(this.options.menu);

        if (!this.trigger || !this.menu) {
            throw new Error('ButtonDropdown trigger and menu are required.');
        }

        this.trigger.setAttribute('aria-haspopup', 'menu');
        this.trigger.setAttribute('aria-expanded', 'false');
        this.menu.setAttribute('role', 'menu');
        this.menu.hidden = true;

        this.triggerButton = new Button(this.trigger, {
            variant: this.options.variant || Button.Variant.SECONDARY
        }).build();

        this.actionButton = this.buildAction(this.options.action);
        this.itemButtons = this.buildItems(this.options.items);

        this.triggerHandler = (event) => {
            event.preventDefault();
            this.toggle();
        };
        this.documentHandler = (event) => {
            if (!this.contains(event.target)) {
                this.close();
            }
        };
        this.keydownHandler = (event) => {
            if (event.key !== 'Escape' || this.menu.hidden) return;

            event.preventDefault();
            this.close();
            this.trigger.focus();
        };

        this.trigger.addEventListener('click', this.triggerHandler);
        document.addEventListener('click', this.documentHandler);
        document.addEventListener('keydown', this.keydownHandler);

        if (this.options.hidden !== undefined) {
            this.setHidden(this.options.hidden);
        }

        return this;
    }

    destroy() {
        if (this.trigger && this.triggerHandler) {
            this.trigger.removeEventListener('click', this.triggerHandler);
        }

        document.removeEventListener('click', this.documentHandler);
        document.removeEventListener('keydown', this.keydownHandler);

        if (this.triggerButton) {
            this.triggerButton.destroy();
            this.triggerButton = null;
        }

        if (this.actionButton) {
            this.actionButton.destroy();
            this.actionButton = null;
        }

        this.itemButtons.forEach((button) => button.destroy());
        this.itemButtons = [];

        this.trigger = null;
        this.menu = null;
        this.triggerHandler = null;
        this.documentHandler = null;
        this.keydownHandler = null;

        return this;
    }

    open() {
        if (!this.menu || !this.trigger) return this;

        this.menu.hidden = false;
        this.trigger.setAttribute('aria-expanded', 'true');

        var firstItem = this.menu.querySelector('[role="menuitem"]:not([hidden])');
        if (firstItem && typeof firstItem.focus === 'function') {
            firstItem.focus();
        }

        return this;
    }

    close() {
        if (!this.menu || !this.trigger) return this;

        this.menu.hidden = true;
        this.trigger.setAttribute('aria-expanded', 'false');
        return this;
    }

    toggle() {
        return this.menu && this.menu.hidden
            ? this.open()
            : this.close();
    }

    setHidden(hidden) {
        var value = Boolean(hidden);

        if (this.trigger) this.trigger.hidden = value;
        if (this.actionButton) this.actionButton.setHidden(value);
        if (this.menu) this.menu.hidden = true;

        if (value && this.trigger) {
            this.trigger.setAttribute('aria-expanded', 'false');
        }

        return this;
    }

    buildAction(config) {
        if (!config) return null;

        var target = config.target || config;
        var element = this.resolveElement(target);

        if (!element) {
            throw new Error('ButtonDropdown action element not found.');
        }

        return new Button(
            element,
            this.createButtonOptions(config)
        ).build();
    }

    buildItems(config) {
        var configs = Array.isArray(config) ? config : [];

        return configs.map((item) => {
            var element = this.resolveElement(item.target);

            if (!element) {
                throw new Error('ButtonDropdown item element not found.');
            }

            element.setAttribute('role', 'menuitem');

            return new Button(
                element,
                this.createButtonOptions(item)
            ).build();
        });
    }

    createButtonOptions(config) {
        return Object.assign({}, config, {
            variant: Button.Variant.SECONDARY,
            onClick: (event) => {
                this.close();

                if (typeof config.onClick === 'function') {
                    config.onClick(event);
                }
            }
        });
    }

    contains(target) {
        return Boolean(
            target
            && (
                (this.trigger && this.trigger.contains(target))
                || (this.menu && this.menu.contains(target))
            )
        );
    }

    resolveElement(target) {
        if (typeof target === 'string') {
            return document.querySelector(target);
        }

        return target || null;
    }
}

module.exports = ButtonDropdown;
