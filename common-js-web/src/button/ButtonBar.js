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

        this.element.classList.add(
            'button-bar',
            'd-flex',
            'justify-content-end',
            'align-items-center',
            'flex-wrap',
            'gap-2',
            'mt-4',
            'pt-3',
            'border-top'
        );

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
        var visibleConfigs = this.orderSecondaryConfigs(
            this.secondaryConfigs.filter(
                (config) => config.options.hidden !== true
            )
        );
        var hiddenConfigs = this.secondaryConfigs.filter(
            (config) => config.options.hidden === true
        );

        this.buttons = this.buttons.concat(this.buildButtons(hiddenConfigs));

        if (!this.shouldGroupSecondaries(visibleConfigs)) {
            this.buttons = this.buttons.concat(this.buildButtons(visibleConfigs));
            return;
        }

        this.buildSecondaryDropdown(visibleConfigs);
    }

    orderSecondaryConfigs(configs) {
        var regular = configs.filter(
            (config) => config.options.placement !== ButtonBar.Placement.END
        );
        var terminal = configs.filter(
            (config) => config.options.placement === ButtonBar.Placement.END
        );

        return regular.concat(terminal);
    }

    shouldGroupSecondaries(visibleSecondaryConfigs) {
        var visiblePrimaryCount = this.primaryConfigs.filter(
            (config) => config.options.hidden !== true
        ).length;
        var totalVisibleButtons = visiblePrimaryCount + visibleSecondaryConfigs.length;

        return totalVisibleButtons > 2
            && visibleSecondaryConfigs.length > 1;
    }

    buildSecondaryDropdown(configs) {
        var itemElements = configs.map(
            (config) => this.requireElement(config.target)
        );
        var anchorElement = itemElements[0];
        var wrapper = document.createElement('div');
        var trigger = this.createDropdownTrigger();
        var menu = document.createElement('div');

        wrapper.className = 'dropup';
        wrapper.style.minWidth = '140px';
        menu.className = 'dropdown-menu w-100';
        menu.id = 'button-dropdown-menu-' + (++dropdownCounter);
        menu.hidden = false;

        trigger.setAttribute('aria-controls', menu.id);

        anchorElement.parentNode.insertBefore(wrapper, anchorElement);
        wrapper.appendChild(trigger);
        wrapper.appendChild(menu);

        itemElements.forEach((element) => {
            menu.appendChild(element);
        });

        this.secondaryGroup = {
            wrapper: wrapper,
            elements: itemElements
        };

        this.secondaryDropdownComponent = new ButtonDropdown({
            trigger: trigger,
            menu: menu,
            items: configs.map((config, index) => (
                this.asDropdownConfig(config, itemElements[index])
            ))
        }).build();
    }

    buildNavigator() {
        if (!this.navigatorConfig) return;

        this.navigatorComponent = new Navigator(this.navigatorConfig).build();
    }

    buildButtons(configs) {
        return configs.map(function (config) {
            var button = new Button(config.target, config.options).build();

            if (button.element) {
                button.element.style.minWidth = '140px';
            }

            return button;
        });
    }

    createDropdownTrigger() {
        var trigger = document.createElement('button');
        trigger.type = 'button';
        trigger.textContent = ButtonBar.DEFAULT_DROPDOWN_LABEL;
        trigger.setAttribute('aria-label', ButtonBar.DEFAULT_DROPDOWN_LABEL);
        trigger.title = ButtonBar.DEFAULT_DROPDOWN_LABEL;

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

ButtonBar.DEFAULT_DROPDOWN_LABEL = 'More actions';

ButtonBar.Placement = Object.freeze({
    END: 'end'
});

module.exports = ButtonBar;
