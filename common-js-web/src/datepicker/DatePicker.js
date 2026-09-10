const DEFAULT_OPTIONS = {
    allowInput: true,
    dateFormat: 'd-M-Y',
    position: 'auto'
};

class DatePicker {
    constructor(selector, options) {
        this.selector = selector;
        this.options = Object.assign({}, DEFAULT_OPTIONS, options || {});
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
        if (typeof window === 'undefined' || typeof window.flatpickr !== 'function') {
            throw new Error('DatePicker requires Flatpickr.');
        }

        this.instance = window.flatpickr(this.selector, this.options);
        return this;
    }

    setDate(value, triggerChange) {
        if (this.instance && typeof this.instance.setDate === 'function') {
            this.instance.setDate(value, triggerChange === true);
        }
        return this;
    }

    clear() {
        if (this.instance && typeof this.instance.clear === 'function') {
            this.instance.clear();
        }
        return this;
    }

    open() {
        if (this.instance && typeof this.instance.open === 'function') {
            this.instance.open();
        }
        return this;
    }

    close() {
        if (this.instance && typeof this.instance.close === 'function') {
            this.instance.close();
        }
        return this;
    }

    destroy() {
        if (this.instance && typeof this.instance.destroy === 'function') {
            this.instance.destroy();
        }
        this.instance = null;
        return this;
    }

    getInstance() {
        return this.instance;
    }
}

DatePicker.DEFAULT_OPTIONS = DEFAULT_OPTIONS;

module.exports = DatePicker;
