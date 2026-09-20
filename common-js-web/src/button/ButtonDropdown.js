const Button = require('./Button');

function BootstrapDropdown() {
    return require('bootstrap/js/dist/dropdown');
}

class ButtonDropdown {
    constructor(options) {
        this.options = options || {};
        this.trigger = null;
        this.menu = null;
        this.button = null;
        this.instance = null;
        this.bindings = [];
    }

    build() {
        this.trigger = this.resolve(this.options.trigger);
        this.menu = this.resolve(this.options.menu);

        if (!this.trigger || !this.menu) {
            throw new Error('ButtonDropdown trigger and menu are required.');
        }

        this.button = new Button(this.trigger, {
            variant: this.options.variant || Button.Variant.SECONDARY
        }).build();

        this.trigger.classList.add('dropdown-toggle');
        this.trigger.dataset.bsToggle = 'dropdown';
        this.trigger.setAttribute('aria-expanded', 'false');

        this.menu.hidden = false;
        this.menu.classList.add('dropdown-menu');

        this.bindings = (this.options.items || []).map((item) => this.bindItem(item));
        this.instance = BootstrapDropdown().getOrCreateInstance(this.trigger);

        if (this.options.hidden !== undefined) {
            this.setHidden(this.options.hidden);
        }

        return this;
    }

    bindItem(item) {
        var element = this.resolve(item.target);

        if (!element) {
            throw new Error('ButtonDropdown item element not found.');
        }

        element.className = 'dropdown-item';
        element.hidden = item.hidden === true;

        if ('disabled' in element) {
            element.disabled = item.disabled === true;
        }

        element.classList.toggle('disabled', item.disabled === true);

        var handler = (event) => {
            this.close();
            if (typeof item.onClick === 'function') item.onClick(event);
        };

        element.addEventListener('click', handler);
        return {element: element, handler: handler};
    }

    destroy() {
        this.bindings.forEach(function (binding) {
            binding.element.removeEventListener('click', binding.handler);
        });
        this.bindings = [];

        if (this.instance) this.instance.dispose();
        if (this.button) this.button.destroy();

        this.instance = null;
        this.button = null;
        this.trigger = null;
        this.menu = null;
        return this;
    }

    open() { if (this.instance) this.instance.show(); return this; }
    close() { if (this.instance) this.instance.hide(); return this; }
    toggle() { if (this.instance) this.instance.toggle(); return this; }

    setHidden(hidden) {
        var value = Boolean(hidden);
        if (value) this.close();
        if (this.trigger) this.trigger.hidden = value;
        return this;
    }

    resolve(target) {
        return typeof target === 'string'
            ? document.querySelector(target)
            : target || null;
    }
}

module.exports = ButtonDropdown;
