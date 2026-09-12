const DateUtil = require('../date/DateUtil');

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
        return Renderers.number(Object.assign({
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }, options || {}));
    }
}

module.exports = Renderers;
