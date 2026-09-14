function isPlainObject(value) {
    if (!value || Object.prototype.toString.call(value) !== '[object Object]') {
        return false;
    }

    var prototype = Object.getPrototypeOf(value);
    return prototype === Object.prototype || prototype === null;
}

function toCamelCase(value) {
    return String(value).replace(/_([a-z0-9])/g, function (_, character) {
        return character.toUpperCase();
    });
}

function toSnakeCase(value) {
    return String(value)
        .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
        .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
        .toLowerCase();
}

function mapKeys(value, keyMapper) {
    if (Array.isArray(value)) {
        return value.map(function (item) {
            return mapKeys(item, keyMapper);
        });
    }

    if (!isPlainObject(value)) {
        return value;
    }

    return Object.keys(value).reduce(function (result, key) {
        result[keyMapper(key)] = mapKeys(value[key], keyMapper);
        return result;
    }, {});
}

const CaseUtil = {
    toCamelCase: toCamelCase,
    toSnakeCase: toSnakeCase,
    toCamelKeys: function (value) {
        return mapKeys(value, toCamelCase);
    },
    toSnakeKeys: function (value) {
        return mapKeys(value, toSnakeCase);
    }
};

module.exports = CaseUtil;
