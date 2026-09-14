const DEFAULT_OPTIONS = {
    allowInput: true,
    dateFormat: 'Y-m-d',
    altInput: true,
    altFormat: 'd-M-Y',
    position: 'auto'
};

class DatePicker {
    constructor(selector, options) {
        this.selector = selector;
        this.options = Object.assign({}, DEFAULT_OPTIONS, options || {});
        this.instance = null;
        this.element = null;
        this.control = null;
        this.toggleButton = null;
        this.clearButton = null;
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

        this.element = typeof this.selector === 'string'
            ? document.querySelector(this.selector)
            : this.selector;

        if (!this.element) return this;

        this.buildControls();
        this.instance = window.flatpickr(this.element, this.options);
        this.syncClearButton();
        return this;
    }

    buildControls() {
        const parent = this.element.parentNode;
        if (!parent) return;

        this.control = document.createElement('div');
        this.control.className = 'date-picker-control';

        parent.insertBefore(this.control, this.element);
        this.control.appendChild(this.element);

        this.clearButton = this.createButton(
            'date-picker-clear',
            'Clear date',
            '<i class="fa fa-times" aria-hidden="true"></i>'
        );
        this.clearButton.hidden = true;
        this.clearButton.addEventListener('click', () => {
            if (this.isDisabled()) return;
            this.clear();
        });

        this.toggleButton = this.createButton(
            'date-picker-toggle',
            'Open calendar',
            '<i class="fa fa-calendar" aria-hidden="true"></i>'
        );
        this.toggleButton.addEventListener('click', () => {
            if (this.isDisabled()) return;
            this.open();
        });

        this.control.appendChild(this.clearButton);
        this.control.appendChild(this.toggleButton);
        this.element.addEventListener('change', () => this.syncClearButton());
    }

    createButton(className, label, html) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'date-picker-button ' + className;
        button.setAttribute('aria-label', label);
        button.innerHTML = html;
        return button;
    }

    setDate(value, triggerChange) {
        if (this.instance && typeof this.instance.setDate === 'function') {
            this.instance.setDate(value, triggerChange === true);
            this.syncClearButton();
        }
        return this;
    }

    clear() {
        if (this.instance && typeof this.instance.clear === 'function') {
            this.instance.clear();
            this.syncClearButton();
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

        if (this.control && this.element && this.control.parentNode) {
            this.control.parentNode.insertBefore(this.element, this.control);
            this.control.remove();
        }

        this.instance = null;
        this.element = null;
        this.control = null;
        this.toggleButton = null;
        this.clearButton = null;
        return this;
    }

    syncClearButton() {
        if (!this.clearButton) return;

        const hasValue = this.instance
            ? Array.isArray(this.instance.selectedDates) && this.instance.selectedDates.length > 0
            : Boolean(this.element && this.element.value);

        this.clearButton.hidden = !hasValue;
    }

    isDisabled() {
        return Boolean(
            (this.element && this.element.disabled)
            || (this.instance && this.instance.altInput && this.instance.altInput.disabled)
        );
    }

    getInstance() {
        return this.instance;
    }
}

DatePicker.DEFAULT_OPTIONS = DEFAULT_OPTIONS;

module.exports = DatePicker;
