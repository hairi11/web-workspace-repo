const NumberUtil = require('../util/NumberUtil');

const DEFAULT_OPTIONS = {
    precision: null,
    decimalScale: 2,
    allowNegative: true,
    useGrouping: true
};

class CurrencyInput {
    constructor(target, options) {
        this.target = target;
        this.options = Object.assign({}, DEFAULT_OPTIONS, options || {});
        this.element = null;
        this.inputHandler = null;
        this.beforeInputHandler = null;
        this.pasteHandler = null;
        this.blurHandler = null;
    }

    build() {
        this.element = this.resolveElement(this.target);

        if (!this.element) {
            throw new Error('CurrencyInput element not found.');
        }

        this.validateOptions();
        this.element.inputMode = 'decimal';
        this.element.autocomplete = 'off';
        this.applyMaxLength();

        this.beforeInputHandler = (event) => {
            if (!event.inputType || !event.inputType.startsWith('insert')) return;
            if (event.data === null || event.data === undefined) return;

            if (!this.canInsert(event.data)) {
                event.preventDefault();
            }
        };
        this.pasteHandler = (event) => {
            var text = event.clipboardData
                ? event.clipboardData.getData('text')
                : '';

            if (text && !this.canInsert(text)) {
                event.preventDefault();
            }
        };
        this.inputHandler = () => {
            this.formatCurrentValue();
        };
        this.blurHandler = () => {
            this.formatCurrentValue();
        };

        this.element.addEventListener('beforeinput', this.beforeInputHandler);
        this.element.addEventListener('paste', this.pasteHandler);
        this.element.addEventListener('input', this.inputHandler);
        this.element.addEventListener('blur', this.blurHandler);

        if (this.element.value) {
            this.setValue(this.element.value);
        }

        return this;
    }

    destroy() {
        if (this.element && this.beforeInputHandler) {
            this.element.removeEventListener('beforeinput', this.beforeInputHandler);
        }

        if (this.element && this.pasteHandler) {
            this.element.removeEventListener('paste', this.pasteHandler);
        }

        if (this.element && this.inputHandler) {
            this.element.removeEventListener('input', this.inputHandler);
        }

        if (this.element && this.blurHandler) {
            this.element.removeEventListener('blur', this.blurHandler);
        }

        this.beforeInputHandler = null;
        this.pasteHandler = null;
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

    validateOptions() {
        var precision = this.options.precision;
        var scale = Number(this.options.decimalScale);

        if (precision !== null && precision !== undefined) {
            precision = Number(precision);

            if (!Number.isInteger(precision) || precision <= 0) {
                throw new Error('CurrencyInput precision must be a positive integer.');
            }

            if (!Number.isInteger(scale) || scale < 0 || scale > precision) {
                throw new Error('CurrencyInput decimalScale must be between 0 and precision.');
            }

            this.options.precision = precision;
        }

        this.options.decimalScale = Number.isInteger(scale) && scale >= 0
            ? scale
            : DEFAULT_OPTIONS.decimalScale;
    }

    applyMaxLength() {
        if (!this.element || this.options.precision === null) return;

        var integerDigits = this.options.precision - this.options.decimalScale;
        var separators = this.options.useGrouping
            ? Math.max(0, Math.ceil(integerDigits / 3) - 1)
            : 0;
        var decimalCharacters = this.options.decimalScale > 0
            ? this.options.decimalScale + 1
            : 0;
        var signCharacters = this.options.allowNegative ? 1 : 0;

        this.element.maxLength = integerDigits
            + separators
            + decimalCharacters
            + signCharacters;
    }

    canInsert(text) {
        if (!this.element) return false;

        var start = this.element.selectionStart === null
            ? this.element.value.length
            : this.element.selectionStart;
        var end = this.element.selectionEnd === null
            ? start
            : this.element.selectionEnd;
        var proposed = this.element.value.slice(0, start)
            + String(text)
            + this.element.value.slice(end);

        return CurrencyInput.isWithinLimit(proposed, this.options);
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
    var precision = options.precision === null || options.precision === undefined
        ? null
        : Number(options.precision);
    var maxIntegerDigits = precision === null
        ? null
        : Math.max(0, precision - scale);

    if (maxIntegerDigits !== null) {
        integerPart = integerPart.slice(0, maxIntegerDigits);
        if (integerPart === '') integerPart = '0';
    }

    decimalPart = decimalPart.slice(0, scale);

    var formattedInteger = options.useGrouping === false
        ? integerPart
        : integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    var result = (negative ? '-' : '') + formattedInteger;

    if (firstDot >= 0 && scale > 0) {
        result += '.' + decimalPart;
    }

    return result;
};

CurrencyInput.isWithinLimit = function (value, options) {
    options = Object.assign({}, DEFAULT_OPTIONS, options || {});

    var normalized = NumberUtil.normalizeFormatted(value);

    if (normalized === '' || normalized === '-' || normalized === '.' || normalized === '-.') {
        return true;
    }

    if (!/^-?\d*(?:\.\d*)?$/.test(normalized)) {
        return false;
    }

    if (!options.allowNegative && normalized.charAt(0) === '-') {
        return false;
    }

    var unsigned = normalized.charAt(0) === '-'
        ? normalized.slice(1)
        : normalized;
    var parts = unsigned.split('.');
    var integerPart = parts[0].replace(/^0+/, '');
    var fractionPart = parts.length > 1 ? parts[1] : '';
    var scale = Math.max(0, Number(options.decimalScale) || 0);

    if (fractionPart.length > scale) {
        return false;
    }

    if (options.precision === null || options.precision === undefined) {
        return true;
    }

    var precision = Number(options.precision);
    var maxIntegerDigits = Math.max(0, precision - scale);

    return integerPart.length <= maxIntegerDigits;
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
