const DEFAULT_OPTIONS = {
    width: '100%'
};

class Select2 {
    constructor(selector, options) {
        this.selector = selector;
        this.options = Object.assign({}, DEFAULT_OPTIONS, options || {});
        this.element = null;
        this.instance = null;
    }

    option(name, value) {
        this.options[name] = value;
        return this;
    }

    optionsConfig(config) {
        this.options = Object.assign(this.options, config || {});
        return this;
    }

    build() {
        if (typeof window === 'undefined' || !window.jQuery || !window.jQuery.fn.select2) {
            throw new Error('Select2 requires jQuery and Select2.');
        }

        this.element = window.jQuery(this.selector);

        if (!this.element.length) {
            return this;
        }

        this.element.select2(this.options);
        this.instance = this.element.data('select2') || null;
        return this;
    }

    value() {
        return this.element && this.element.length ? this.element.val() : null;
    }

    setValue(value, triggerChange) {
        if (!this.element || !this.element.length) return this;

        this.element.val(value);

        if (triggerChange !== false) {
            this.element.trigger('change.select2');
        }

        return this;
    }

    clear(triggerChange) {
        return this.setValue(null, triggerChange);
    }

    enable() {
        if (this.element && this.element.length) {
            this.element.prop('disabled', false).trigger('change.select2');
        }
        return this;
    }

    disable() {
        if (this.element && this.element.length) {
            this.element.prop('disabled', true).trigger('change.select2');
        }
        return this;
    }

    destroy() {
        if (this.element && this.element.length && this.element.hasClass('select2-hidden-accessible')) {
            this.element.select2('destroy');
        }

        this.instance = null;
        this.element = null;
        return this;
    }

    getInstance() {
        return this.instance;
    }
}

Select2.DEFAULT_OPTIONS = DEFAULT_OPTIONS;

module.exports = Select2;
