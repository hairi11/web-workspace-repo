const NumberUtil = require('../util/NumberUtil');

class Validator {
    static required(message) {
        return function (value) {
            var empty = value === null || value === undefined || String(value).trim() === '';
            return empty ? (message || 'This field is required.') : null;
        };
    }
    static email(message) {
        return function (value) {
            if (!value) return null;
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value)) ? null : (message || 'Please enter a valid email address.');
        };
    }
    static decimal(precision, scale, message) {
        var config = Validator.resolveDecimalConfig(precision, scale, message);

        return function (value) {
            if (value === null || value === undefined || String(value).trim() === '') return null;

            var normalized = NumberUtil.normalizeFormatted(value);

            if (!/^-?\d+(\.\d+)?$/.test(normalized)) {
                return config.message;
            }

            if (config.precision === null || config.scale === null) {
                return null;
            }

            var unsigned = normalized.charAt(0) === '-'
                ? normalized.slice(1)
                : normalized;
            var parts = unsigned.split('.');
            var integerPart = parts[0].replace(/^0+/, '');
            var fractionPart = parts.length > 1 ? parts[1] : '';
            var integerDigits = integerPart.length;
            var maxIntegerDigits = config.precision - config.scale;

            return integerDigits <= maxIntegerDigits
                && fractionPart.length <= config.scale
                ? null
                : config.message;
        };
    }

    static resolveDecimalConfig(precision, scale, message) {
        if (typeof precision !== 'number') {
            return {
                precision: null,
                scale: null,
                message: precision || 'Please enter a valid decimal value.'
            };
        }

        if (!Number.isInteger(precision) || precision <= 0) {
            throw new Error('Decimal precision must be a positive integer.');
        }

        if (!Number.isInteger(scale) || scale < 0 || scale > precision) {
            throw new Error('Decimal scale must be an integer between 0 and precision.');
        }

        return {
            precision: precision,
            scale: scale,
            message: message || (
                'Enter a number with up to '
                + String(precision - scale)
                + ' integer digits and '
                + String(scale)
                + ' decimal places.'
            )
        };
    }
    static minLength(length, message) {
        return function (value) {
            if (!value) return null;
            return String(value).length >= length ? null : (message || 'Minimum ' + length + ' characters required.');
        };
    }
    static maxLength(length, message) {
        return function (value) {
            if (!value) return null;
            return String(value).length <= length ? null : (message || 'Maximum ' + length + ' characters allowed.');
        };
    }
    static pattern(regex, message) {
        return function (value) {
            if (!value) return null;
            return regex.test(String(value)) ? null : (message || 'Invalid format.');
        };
    }
    static sameAs(fieldName, message) {
        return function (value, values) { return value === values[fieldName] ? null : (message || 'Fields do not match.'); };
    }
    static custom(handler) { return handler; }
}
module.exports = Validator;
