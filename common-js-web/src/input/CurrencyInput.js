const NumberUtil = require('../util/NumberUtil');

const DEFAULT_OPTIONS = {
    precision: null,
    decimalScale: 2,
    allowNegative: true,
    useGrouping: true
};

function resolve(target) {
    return typeof target === 'string'
        ? document.querySelector(target)
        : target || null;
}

function normalizeOptions(options) {
    var result = Object.assign({}, DEFAULT_OPTIONS, options || {});
    var scale = Number(result.decimalScale);

    result.decimalScale = Number.isInteger(scale) && scale >= 0
        ? scale
        : DEFAULT_OPTIONS.decimalScale;

    if (result.precision !== null && result.precision !== undefined) {
        var precision = Number(result.precision);

        if (!Number.isInteger(precision) || precision <= 0) {
            throw new Error('CurrencyInput precision must be a positive integer.');
        }

        if (result.decimalScale > precision) {
            throw new Error('CurrencyInput decimalScale must be between 0 and precision.');
        }

        result.precision = precision;
    }

    return result;
}

class CurrencyInput {
    constructor(target, options) {
        this.target = target;
        this.options = normalizeOptions(options);
        this.element = null;
        this.handlers = {};
    }

    build() {
        this.element = resolve(this.target);

        if (!this.element) {
            throw new Error('CurrencyInput element not found.');
        }

        this.element.inputMode = 'decimal';
        this.element.autocomplete = 'off';

        if (this.options.precision !== null) {
            this.element.maxLength = CurrencyInput.maxLength(this.options);
        }

        this.handlers = {
            beforeinput: (event) => {
                if (
                    event.inputType
                    && event.inputType.startsWith('insert')
                    && event.data != null
                    && !this.canInsert(event.data)
                ) {
                    event.preventDefault();
                }
            },
            paste: (event) => {
                var text = event.clipboardData
                    ? event.clipboardData.getData('text')
                    : '';

                if (text && !this.canInsert(text)) {
                    event.preventDefault();
                }
            },
            input: () => this.formatCurrentValue(),
            blur: () => this.formatCurrentValue()
        };

        Object.keys(this.handlers).forEach((name) => {
            this.element.addEventListener(name, this.handlers[name]);
        });

        if (this.element.value) this.setValue(this.element.value);
        return this;
    }

    destroy() {
        if (this.element) {
            Object.keys(this.handlers).forEach((name) => {
                this.element.removeEventListener(name, this.handlers[name]);
            });
        }

        this.handlers = {};
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

    canInsert(text) {
        if (!this.element) return false;

        var start = this.element.selectionStart ?? this.element.value.length;
        var end = this.element.selectionEnd ?? start;
        var proposed = this.element.value.slice(0, start)
            + String(text)
            + this.element.value.slice(end);

        return CurrencyInput.isWithinLimit(proposed, this.options);
    }

    formatCurrentValue() {
        if (!this.element) return this;

        var caret = this.element.selectionStart;
        var significant = caret === null
            ? 0
            : CurrencyInput.countSignificant(this.element.value.slice(0, caret));

        this.element.value = CurrencyInput.format(this.element.value, this.options);

        if (caret !== null && document.activeElement === this.element) {
            var next = CurrencyInput.findCaret(this.element.value, significant);
            this.element.setSelectionRange(next, next);
        }

        return this;
    }
}

CurrencyInput.format = function (value, options) {
    options = normalizeOptions(options);

    if (value == null || String(value).trim() === '') return '';

    var source = NumberUtil.normalizeFormatted(value);
    var negative = options.allowNegative && source.startsWith('-');
    var unsigned = source.replace(/-/g, '').replace(/[^0-9.]/g, '');
    var dot = unsigned.indexOf('.');
    var integer = dot >= 0 ? unsigned.slice(0, dot) : unsigned;
    var decimal = dot >= 0
        ? unsigned.slice(dot + 1).replace(/\./g, '')
        : '';

    integer = integer.replace(/^0+(?=\d)/, '') || '0';

    if (options.precision !== null) {
        integer = integer.slice(0, options.precision - options.decimalScale) || '0';
    }

    decimal = decimal.slice(0, options.decimalScale);

    if (options.useGrouping) {
        integer = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }

    return (negative ? '-' : '')
        + integer
        + (dot >= 0 && options.decimalScale > 0 ? '.' + decimal : '');
};

CurrencyInput.isWithinLimit = function (value, options) {
    options = normalizeOptions(options);

    var normalized = NumberUtil.normalizeFormatted(value);

    if (['', '-', '.', '-.'].includes(normalized)) return true;
    if (!/^-?\d*(?:\.\d*)?$/.test(normalized)) return false;
    if (!options.allowNegative && normalized.startsWith('-')) return false;

    var parts = normalized.replace(/^-/, '').split('.');
    var integer = (parts[0] || '').replace(/^0+/, '');
    var decimal = parts[1] || '';

    if (decimal.length > options.decimalScale) return false;
    if (options.precision === null) return true;

    return integer.length <= options.precision - options.decimalScale;
};

CurrencyInput.maxLength = function (options) {
    options = normalizeOptions(options);

    if (options.precision === null) return 0;

    var integerDigits = options.precision - options.decimalScale;
    var grouping = options.useGrouping
        ? Math.max(0, Math.ceil(integerDigits / 3) - 1)
        : 0;

    return integerDigits
        + grouping
        + (options.decimalScale > 0 ? options.decimalScale + 1 : 0)
        + (options.allowNegative ? 1 : 0);
};

CurrencyInput.countSignificant = function (value) {
    return (String(value).match(/[0-9.]/g) || []).length;
};

CurrencyInput.findCaret = function (formatted, count) {
    if (count <= 0) return 0;

    var seen = 0;

    for (var i = 0; i < formatted.length; i += 1) {
        if (/[0-9.]/.test(formatted.charAt(i)) && ++seen >= count) {
            return i + 1;
        }
    }

    return formatted.length;
};

CurrencyInput.DEFAULT_OPTIONS = DEFAULT_OPTIONS;

module.exports = CurrencyInput;
