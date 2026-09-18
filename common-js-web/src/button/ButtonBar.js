const Button = require('./Button');
const Navigator = require('./Navigator');

class ButtonBar {
    constructor(target) {
        this.target = target;
        this.element = null;
        this.primaryConfigs = [];
        this.secondaryConfigs = [];
        this.navigatorConfig = null;
        this.buttons = [];
        this.navigatorComponent = null;
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

        this.buttons = this.secondaryConfigs
            .concat(this.primaryConfigs)
            .map((config) => new Button(config.target, config.options).build());

        if (this.navigatorConfig) {
            this.navigatorComponent = new Navigator(this.navigatorConfig).build();
        }

        return this;
    }

    destroy() {
        this.buttons.forEach((button) => button.destroy());
        this.buttons = [];

        if (this.navigatorComponent) {
            this.navigatorComponent.destroy();
            this.navigatorComponent = null;
        }

        this.element = null;
        return this;
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

    resolveElement(target) {
        if (typeof target === 'string') {
            return document.querySelector(target);
        }

        return target || null;
    }
}

module.exports = ButtonBar;
