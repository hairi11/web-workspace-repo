const Button = require('./Button');
const ButtonDropdown = require('./ButtonDropdown');
const Navigator = require('./Navigator');

var dropdownCounter = 0;

class ButtonBar {
    constructor(target) {
        this.target = target;
        this.element = null;
        this.primaryConfigs = [];
        this.secondaryConfigs = [];
        this.navigatorConfig = null;
        this.buttons = [];
        this.navigatorComponent = null;
        this.secondaryDropdownComponent = null;
        this.secondaryGroup = null;
    }

    primary(config) {
        this.addConfigs(this.primaryConfigs, config, Button.Variant.PRIMARY);
        return this;
    }

    secondary(config) {
        this.addConfigs(this.secondaryConfigs, config, Button.Variant.SECONDARY);
        return this;
    }

    navigator(config) {
        this.navigatorConfig = config || null;
        return this;
    }

    build() {
        this.element = this.resolveElement(this.target);

        if (!this.element) {
            throw new Error('ButtonBar element not found.');
        }

        this.element.classList.add('button-bar');

        this.buttons = this.buildButtons(this.primaryConfigs);
        this.buildSecondaryControls();
        this.buildNavigator();

        return this;
    }

    destroy() {
        this.buttons.forEach((button) => button.destroy());
        this.buttons = [];

        if (this.navigatorComponent) {
            this.navigatorComponent.destroy();
            this.navigatorComponent = null;
        }

        if (this.secondaryDropdownComponent) {
            this.secondaryDropdownComponent.destroy();
            this.secondaryDropdownComponent = null;
        }

        this.restoreSecondaryGroup();
        this.element = null;

        return this;
    }

    buildSecondaryControls() {
        var visibleConfigs = this.secondaryConfigs.filter(
            (config) => config.options.hidden !== true
        );
        var hiddenConfigs = this.secondaryConfigs.filter(
            (config) => config.options.hidden === true
        );

        this.buttons = this.buttons.concat(this.buildButtons(hiddenConfigs));

        if (visibleConfigs.length <= 1) {
            this.buttons = this.buttons.concat(this.buildButtons(visibleConfigs));
            return;
        }

        this.buildSecondaryDropdown(visibleConfigs);
    }

    buildSecondaryDropdown(configs) {
        var actionConfig = configs[0];
        var itemConfigs = configs.slice(1);
        var actionElement = this.requireElement(actionConfig.target);
        var itemElements = itemConfigs.map(
            (config) => this.requireElement(config.target)
        );
        var wrapper = document.createElement('div');
        var trigger = this.createDropdownTrigger();
        var menu = document.createElement('div');

        wrapper.className = 'button-dropdown button-dropdown-split';
        menu.className = 'button-dropdown-menu';
        menu.id = 'button-dropdown-menu-' + (++dropdownCounter);
        menu.hidden = true;

        trigger.setAttribute('aria-controls', menu.id);

        actionElement.parentNode.insertBefore(wrapper, actionElement);
        wrapper.appendChild(actionElement);
        wrapper.appendChild(trigger);
        wrapper.appendChild(menu);

        itemElements.forEach((element) => {
            menu.appendChild(element);
        });

        this.secondaryGroup = {
            wrapper: wrapper,
            elements: [actionElement].concat(itemElements)
        };

        this.secondaryDropdownComponent = new ButtonDropdown({
            trigger: trigger,
            menu: menu,
            action: this.asDropdownConfig(actionConfig, actionElement),
            items: itemConfigs.map((config, index) => (
                this.asDropdownConfig(config, itemElements[index])
            ))
        }).build();
    }

    buildNavigator() {
        if (!this.navigatorConfig) return;

        this.navigatorComponent = new Navigator(this.navigatorConfig).build();
    }

    buildButtons(configs) {
        return configs.map(
            (config) => new Button(config.target, config.options).build()
        );
    }

    createDropdownTrigger() {
        var trigger = document.createElement('button');
        var icon = document.createElement('span');

        trigger.type = 'button';
        trigger.setAttribute('aria-label', 'More secondary actions');
        trigger.title = 'More secondary actions';

        icon.textContent = '▾';
        icon.setAttribute('aria-hidden', 'true');
        trigger.appendChild(icon);

        return trigger;
    }

    asDropdownConfig(config, element) {
        return Object.assign({}, config.options, {
            target: element
        });
    }

    restoreSecondaryGroup() {
        if (!this.secondaryGroup) return;

        var wrapper = this.secondaryGroup.wrapper;

        if (wrapper && wrapper.parentNode) {
            this.secondaryGroup.elements.forEach((element) => {
                wrapper.parentNode.insertBefore(element, wrapper);
            });
            wrapper.parentNode.removeChild(wrapper);
        }

        this.secondaryGroup = null;
    }

    addConfigs(destination, config, variant) {
        var configs = Array.isArray(config) ? config : [config];

        configs
            .filter(Boolean)
            .forEach((item) => {
                if (!item.target) {
                    throw new Error('Button target is required.');
                }

                destination.push({
                    target: item.target,
                    options: Object.assign({}, item, {variant: variant})
                });
            });
    }

    requireElement(target) {
        var element = this.resolveElement(target);

        if (!element) {
            throw new Error('Button element not found.');
        }

        return element;
    }

    resolveElement(target) {
        if (typeof target === 'string') {
            return document.querySelector(target);
        }

        return target || null;
    }
}

module.exports = ButtonBar;
