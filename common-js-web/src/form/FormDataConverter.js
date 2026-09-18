const DateUtil = require('../date/DateUtil');
const NumberUtil = require('../util/NumberUtil');

const TYPES = Object.freeze({
    TEXT: 'text',
    DECIMAL: 'decimal',
    DATE: 'date',
    SELECT: 'select'
});

const converters = {
    text: {
        fromForm: function (value) {
            return value === null || value === undefined ? '' : String(value);
        },
        toForm: function (value) {
            return value === null || value === undefined ? '' : String(value);
        }
    },
    decimal: {
        fromForm: function (value) {
            return NumberUtil.parseFormatted(value);
        },
        toForm: function (value) {
            return value === null || value === undefined ? '' : String(value);
        }
    },
    date: {
        fromForm: function (value) {
            return value ? DateUtil.toApiDate(value) : '';
        },
        toForm: function (value) {
            return value ? DateUtil.toApiDate(value) : '';
        }
    },
    select: {
        fromForm: function (value) {
            return value === null || value === undefined ? '' : String(value);
        },
        toForm: function (value) {
            return value === null || value === undefined ? '' : String(value);
        }
    }
};

function resolveConverter(type) {
    if (!type) return null;

    if (typeof type === 'string') {
        if (!converters[type]) {
            throw new Error('Unsupported form data type: ' + type);
        }
        return converters[type];
    }

    if (typeof type === 'object') {
        return type;
    }

    throw new Error('Invalid form data converter definition.');
}

function convert(values, schema, direction) {
    if (!values || typeof values !== 'object') return {};

    schema = schema || {};

    return Object.keys(values).reduce(function (result, name) {
        var converter = resolveConverter(schema[name]);
        var handler = converter && converter[direction];
        result[name] = typeof handler === 'function'
            ? handler(values[name], values, name)
            : values[name];
        return result;
    }, {});
}

class FormDataConverter {
    static fromForm(values, schema) {
        return convert(values, schema, 'fromForm');
    }

    static toForm(values, schema) {
        return convert(values, schema, 'toForm');
    }
}

FormDataConverter.Types = TYPES;

module.exports = FormDataConverter;
