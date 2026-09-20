const Button = require('./Button');

function getBootstrapDropdown() {
    return require('bootstrap/js/dist/dropdown');
}

class ButtonDropdown {
    constructor(options) {
        this.options = options || {};
        this.trigger = null;
        this.menu = null;
        this.instance = null;
        this.triggerButton = null;
        this.actionButton = null;
        this.itemBindings = [];
    }

    build() {
        this.trigger = this.resolveElement(this.options.trigger);
        this.menu = this.resolveElement(this.options.menu);

        if (!this.trigger || !this.menu) {
            throw new Error('ButtonDropdown trigger and menu are required.');
        }

        this.triggerButton = new Button(this.trigger, {
            variant: this.options.variant || Button.Variant.SECONDARY
        }).build();

        this.trigger.classList.add('dropdown-toggle');
        this.trigger.setAttribute('data-bs-toggle', 'dropdown');
        this.trigger.setAttribute('aria-expanded', 'false');

        this.menu.hidden = false;
        this.menu.classList.remove('button-dropdown-menu');
        this.menu.classList.add('dropdown-menu');

        this.actionButton = this.buildAction(this.options.action);
        this.itemBindings = this.buildItems(this.options.items);

        var Dropdown = getBootstrapDropdown();
        this.instance = Dropdown.getOrCreateInstance(this.trigger, {
            autoClose: true
        });

        if (this.options.hidden !== undefined) {
            this.setHidden(this.options.hidden);
        }

        return this;
    }

    destroy() {
        this.itemBindings.forEach(function (binding) {
            binding.element.removeEventListener('click', binding.handler);
        });
        this.itemBindings = [];

        if (this.instance) {
            this.instance.dispose();
            this.instance = null;
        }

        if (this.triggerButton) {
            this.triggerButton.destroy();
            this.triggerButton = null;
        }

        if (this.actionButton) {
            this.actionButton.destroy();
            this.actionButton = null;
        }

        this.trigger = null;
        this.menu = null;
        return this;
    }

    open() {
        if (this.instance) this.instance.show();
        return this;
    }

    close() {
        if (this.instance) this.instance.hide();
        return this;
    }

    toggle() {
        if (this.instance) this.instance.toggle();
        return this;
    }

    setHidden(hidden) {
        var value = Boolean(hidden);

        if (value) this.close();
        if (this.trigger) this.trigger.hidden = value;
        if (this.actionButton) this.actionButton.setHidden(value);

        return this;
    }

    buildAction(config) {
        if (!config) return null;

        var target = config.target || config;
        var element = this.resolveElement(target);

        if (!element) {
            throw new Error('ButtonDropdown action element not found.');
        }

        return new Button(element, config).build();
    }

    buildItems(config) {
        var self = this;
        var configs = Array.isArray(config) ? config : [];

        return configs.map(function (item) {
            var element = self.resolveElement(item.target);

            if (!element) {
                throw new Error('ButtonDropdown item element not found.');
            }

            self.prepareItem(element, item);

            var handler = function (event) {
                self.close();

                if (typeof item.onClick === 'function') {
                    item.onClick(event);
                }
            };

            element.addEventListener('click', handler);

            return {
                element: element,
                handler: handler
            };
        });
    }

    prepareItem(element, config) {
        element.classList.remove(
            'button',
            'button-primary',
            'button-secondary',
            'button-dropdown-item',
            'btn',
            'btn-primary',
            'btn-outline-secondary'
        );
        element.classList.add('dropdown-item');

        if (config.hidden !== undefined) {
            element.hidden = Boolean(config.hidden);
        }

        if (config.disabled !== undefined) {
            var disabled = Boolean(config.disabled);

            if ('disabled' in element) {
                element.disabled = disabled;
            }

            element.classList.toggle('disabled', disabled);
            element.setAttribute('aria-disabled', String(disabled));
        }
    }

    resolveElement(target) {
        if (typeof target === 'string') {
            return document.querySelector(target);
        }

        return target || null;
    }
}

module.exports = ButtonDropdown;
