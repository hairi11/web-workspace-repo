const Button = require('./Button');
const ButtonDropdown = require('./ButtonDropdown');
const Navigator = require('./Navigator');

let dropdownId = 0;

function asArray(value) {
    return Array.isArray(value) ? value : [value];
}

class ButtonBar {
    constructor(target) {
        this.target = target;
        this.element = null;
        this.primaryConfigs = [];
        this.secondaryConfigs = [];
        this.navigatorConfig = null;
        this.buttons = [];
        this.navigatorComponent = null;
        this.dropdown = null;
        this.group = null;
    }

    primary(config) {
        return this.add(this.primaryConfigs, config, Button.Variant.PRIMARY);
    }

    secondary(config) {
        return this.add(this.secondaryConfigs, config, Button.Variant.SECONDARY);
    }

    navigator(config) {
        this.navigatorConfig = config || null;
        return this;
    }

    add(destination, config, variant) {
        asArray(config).filter(Boolean).forEach(function (item) {
            if (!item.target) throw new Error('Button target is required.');
            destination.push({
                target: item.target,
                options: Object.assign({}, item, {variant: variant})
            });
        });
        return this;
    }

    build() {
        this.element = this.resolve(this.target);

        if (!this.element) {
            throw new Error('ButtonBar element not found.');
        }

        this.element.classList.add(
            'd-flex', 'justify-content-end', 'align-items-center',
            'flex-wrap', 'gap-2', 'mt-4', 'pt-3', 'border-top'
        );

        this.buttons = this.buildButtons(this.primaryConfigs);
        this.buildSecondaries();

        if (this.navigatorConfig) {
            this.navigatorComponent = new Navigator(this.navigatorConfig).build();
        }

        return this;
    }

    buildSecondaries() {
        var visible = this.secondaryConfigs
            .filter((config) => config.options.hidden !== true)
            .sort(function (a, b) {
                return Number(a.options.placement === ButtonBar.Placement.END)
                    - Number(b.options.placement === ButtonBar.Placement.END);
            });
        var hidden = this.secondaryConfigs.filter(
            (config) => config.options.hidden === true
        );

        this.buttons.push.apply(this.buttons, this.buildButtons(hidden));

        var visiblePrimaryCount = this.primaryConfigs.filter(
            (config) => config.options.hidden !== true
        ).length;

        if (visiblePrimaryCount + visible.length <= 2 || visible.length <= 1) {
            this.buttons.push.apply(this.buttons, this.buildButtons(visible));
            return;
        }

        this.buildDropdown(visible);
    }

    buildButtons(configs) {
        return configs.map((config) => {
            var button = new Button(config.target, config.options).build();
            if (button.element) button.element.style.minWidth = '140px';
            return button;
        });
    }

    buildDropdown(configs) {
        var elements = configs.map((config) => this.require(config.target));
        var wrapper = document.createElement('div');
        var trigger = document.createElement('button');
        var menu = document.createElement('div');

        wrapper.className = 'dropup';
        wrapper.style.minWidth = '140px';

        trigger.type = 'button';
        trigger.textContent = ButtonBar.DEFAULT_DROPDOWN_LABEL;

        menu.className = 'dropdown-menu w-100';
        menu.id = 'button-dropdown-menu-' + (++dropdownId);
        trigger.setAttribute('aria-controls', menu.id);

        elements[0].parentNode.insertBefore(wrapper, elements[0]);
        wrapper.appendChild(trigger);
        wrapper.appendChild(menu);
        elements.forEach((element) => menu.appendChild(element));

        this.group = {wrapper: wrapper, elements: elements};
        this.dropdown = new ButtonDropdown({
            trigger: trigger,
            menu: menu,
            items: configs.map((config, index) => Object.assign(
                {},
                config.options,
                {target: elements[index]}
            ))
        }).build();
    }

    destroy() {
        this.buttons.forEach((button) => button.destroy());
        this.buttons = [];

        if (this.navigatorComponent) this.navigatorComponent.destroy();
        if (this.dropdown) this.dropdown.destroy();

        this.navigatorComponent = null;
        this.dropdown = null;
        this.restoreGroup();
        this.element = null;
        return this;
    }

    restoreGroup() {
        if (!this.group) return;

        var wrapper = this.group.wrapper;
        if (wrapper.parentNode) {
            this.group.elements.forEach((element) => {
                wrapper.parentNode.insertBefore(element, wrapper);
            });
            wrapper.remove();
        }

        this.group = null;
    }

    require(target) {
        var element = this.resolve(target);
        if (!element) throw new Error('Button element not found.');
        return element;
    }

    resolve(target) {
        return typeof target === 'string'
            ? document.querySelector(target)
            : target || null;
    }
}

ButtonBar.DEFAULT_DROPDOWN_LABEL = 'More actions';
ButtonBar.Placement = Object.freeze({END: 'end'});

module.exports = ButtonBar;
