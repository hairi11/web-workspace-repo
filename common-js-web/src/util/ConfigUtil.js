const SecurityUtil = require('./SecurityUtil');

class ConfigUtil {
    static merge(base, override) {
        base = base || {};
        override = override || {};

        var result = {};
        ConfigUtil._copySafe(result, base);
        ConfigUtil._copySafe(result, override);

        result.headers = {};
        ConfigUtil._copySafe(result.headers, base.headers || {});
        ConfigUtil._copySafe(result.headers, override.headers || {});

        var removeHeaders = Array.isArray(override.removeHeaders) ? override.removeHeaders : [];
        removeHeaders.forEach(function (name) {
            delete result.headers[name];
        });

        Object.keys(result.headers).forEach(function (name) {
            if (result.headers[name] === null || result.headers[name] === undefined) {
                delete result.headers[name];
            }
        });

        return result;
    }

    static _copySafe(target, source) {
        Object.keys(source || {}).forEach(function (key) {
            SecurityUtil.assertSafeObjectKey(key);
            target[key] = source[key];
        });
        return target;
    }
}

module.exports = ConfigUtil;
