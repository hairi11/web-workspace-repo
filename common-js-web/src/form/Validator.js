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
