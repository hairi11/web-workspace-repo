const NumberUtil = require('../util/NumberUtil');

const DEFAULT_OPTIONS = {
    decimalScale: 2,
    allowNegative: true
};

class CurrencyInput {
    constructor(target, options) {
        this.target = target;
        this.options = Object.assign({}, DEFAULT_OPTIONS, options || {});
        this.element = null;
        this.inputHandler = null;
        this.blurHandler = null;
    }

    build() {
        this.element = this.resolveElement(this.target);

        if (!this.element) {
            throw new Error('CurrencyInput element not found.');
        }

        this.element.inputMode = 'decimal';
        this.element.autocomplete = 'off';

        this.inputHandler = () => {
            this.formatCurrentValue();
        };
        this.blurHandler = () => {
            this.formatCurrentValue();
        };

        this.element.addEventListener('input', this.inputHandler);
        this.element.addEventListener('blur', this.blurHandler);

        if (this.element.value) {
            this.setValue(this.element.value);
        }

        return this;
    }

    destroy() {
        if (this.element && this.inputHandler) {
            this.element.removeEventListener('input', this.inputHandler);
        }

        if (this.element && this.blurHandler) {
            this.element.removeEventListener('blur', this.blurHandler);
        }

        this.inputHandler = null;
        this.blurHandler = null;
        this.element = null;

        return this;
    }

    value() {
        return this.element
            ? NumberUtil.normalizeFormatted(this.element.value)
            : '';
    }

    setValue(value, triggerChange) {
        if (!this.element) return this;

        this.element.value = CurrencyInput.format(value, this.options);

        if (triggerChange === true) {
            this.element.dispatchEvent(new Event('change', {bubbles: true}));
        }

        return this;
    }

    clear(triggerChange) {
        return this.setValue('', triggerChange);
    }

    formatCurrentValue() {
        if (!this.element) return this;

        var start = this.element.selectionStart;
        var rawBeforeCaret = start === null
            ? ''
            : this.element.value.slice(0, start);
        var significantBeforeCaret = CurrencyInput.countSignificant(rawBeforeCaret);
        var formatted = CurrencyInput.format(this.element.value, this.options);

        this.element.value = formatted;

        if (start !== null && document.activeElement === this.element) {
            var caret = CurrencyInput.findCaret(formatted, significantBeforeCaret);
            this.element.setSelectionRange(caret, caret);
        }

        return this;
    }

    resolveElement(target) {
        if (typeof target === 'string') {
            return document.querySelector(target);
        }

        return target || null;
    }
}

CurrencyInput.format = function (value, options) {
    options = Object.assign({}, DEFAULT_OPTIONS, options || {});

    if (value === null || value === undefined || String(value).trim() === '') {
        return '';
    }

    var source = NumberUtil.normalizeFormatted(value);
    var negative = options.allowNegative && source.startsWith('-');

    source = source.replace(/-/g, '').replace(/[^0-9.]/g, '');

    var firstDot = source.indexOf('.');
    var integerPart = firstDot >= 0 ? source.slice(0, firstDot) : source;
    var decimalPart = firstDot >= 0 ? source.slice(firstDot + 1).replace(/\./g, '') : '';

    integerPart = integerPart.replace(/^0+(?=\d)/, '') || '0';

    var scale = Math.max(0, Number(options.decimalScale) || 0);
    decimalPart = decimalPart.slice(0, scale);

    var grouped = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    var result = (negative ? '-' : '') + grouped;

    if (firstDot >= 0 && scale > 0) {
        result += '.' + decimalPart;
    }

    return result;
};

CurrencyInput.countSignificant = function (value) {
    return (String(value).match(/[0-9.]/g) || []).length;
};

CurrencyInput.findCaret = function (formatted, significantCount) {
    if (significantCount <= 0) return 0;

    var seen = 0;

    for (var i = 0; i < formatted.length; i += 1) {
        if (/[0-9.]/.test(formatted.charAt(i))) {
            seen += 1;
            if (seen >= significantCount) return i + 1;
        }
    }

    return formatted.length;
};

CurrencyInput.DEFAULT_OPTIONS = DEFAULT_OPTIONS;

module.exports = CurrencyInput;
