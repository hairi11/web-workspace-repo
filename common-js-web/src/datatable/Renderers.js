const DateUtil = require('../date/DateUtil');
const NumberUtil = require('../util/NumberUtil');

class Renderers {
    static text(fallback) {
        return function (value) {
            if (value === null || value === undefined || value === '') return fallback || '';
            return String(value);
        };
    }

    static boolean(trueText, falseText) {
        return function (value) { return value ? (trueText || 'Yes') : (falseText || 'No'); };
    }

    static property(property, options) {
        options = Object.assign({fallbackToValue: true}, options || {});

        return function (value, type, row) {
            if (type && type !== 'display' && type !== 'filter') return value;

            var displayValue = row && property ? row[property] : null;
            if (displayValue !== null && displayValue !== undefined && displayValue !== '') {
                return String(displayValue);
            }

            if (!options.fallbackToValue || value === null || value === undefined || value === '') {
                return '';
            }
            return String(value);
        };
    }

    static date(pattern) {
        return function (value, type) {
            if (!value) return '';
            if (type && type !== 'display' && type !== 'filter') return value;

            try {
                return DateUtil.formatDate(value, pattern);
            }
            catch (error) {
                return String(value);
            }
        };
    }

    static number(options) {
        options = options || {};
        var locale = options.locale || 'en-US';
        var formatOptions = Object.assign({}, options);
        delete formatOptions.locale;
        var formatter = new Intl.NumberFormat(locale, formatOptions);

        return function (value, type) {
            if (value === null || value === undefined || value === '') return '';

            var number = Number(value);
            if (!Number.isFinite(number)) return value;
            if (type && type !== 'display' && type !== 'filter') return number;

            return formatter.format(number);
        };
    }

    static amount(options) {
        options = Object.assign({
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
            locale: 'en-US'
        }, options || {});

        var localeFormatter = new Intl.NumberFormat(options.locale);
        var localeParts = localeFormatter.formatToParts(1000.1);
        var groupPart = localeParts.find(function (part) {
            return part.type === 'group';
        });
        var decimalPart = localeParts.find(function (part) {
            return part.type === 'decimal';
        });

        return function (value, type) {
            if (value === null || value === undefined || value === '') return '';

            var normalized = NumberUtil.normalizeFormatted(value);

            if (type && type !== 'display' && type !== 'filter') {
                return normalized;
            }

            return NumberUtil.formatDecimal(normalized, {
                minimumFractionDigits: options.minimumFractionDigits,
                maximumFractionDigits: options.maximumFractionDigits,
                useGrouping: options.useGrouping,
                groupSeparator: groupPart ? groupPart.value : ',',
                decimalSeparator: decimalPart ? decimalPart.value : '.'
            });
        };
    }
}

module.exports = Renderers;
