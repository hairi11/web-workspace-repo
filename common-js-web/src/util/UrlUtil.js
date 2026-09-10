class UrlUtil {
    static appendQuery(url, query) {
        var params = new URLSearchParams();

        Object.keys(query || {}).forEach(function (name) {
            if (UrlUtil._isUnsafeKey(name)) {
                throw new Error('Unsafe query key rejected: ' + name);
            }

            var value = query[name];

            if (value === null || value === undefined || value === '') return;

            if (Array.isArray(value)) {
                value.forEach(function (item) {
                    if (item !== null && item !== undefined && item !== '') {
                        params.append(name, String(item));
                    }
                });
                return;
            }

            if (typeof value === 'object') {
                throw new Error('Query values must be scalar values or arrays.');
            }

            params.append(name, String(value));
        });

        var queryString = params.toString();
        if (!queryString) return url;
        return url + (url.indexOf('?') >= 0 ? '&' : '?') + queryString;
    }

    static assertSafeRequestUrl(url, options) {
        options = options || {};
        var allowedProtocols = options.allowedProtocols || ['http:', 'https:'];
        var parsed = UrlUtil.parse(url);

        if (parsed && allowedProtocols.indexOf(parsed.protocol) < 0) {
            throw new Error('URL protocol is not allowed: ' + parsed.protocol);
        }

        return url;
    }

    static isSameOrigin(url) {
        if (!url) return true;
        if (typeof location === 'undefined' || !location.href) {
            return !/^[a-zA-Z][a-zA-Z\d+.-]*:/.test(String(url));
        }

        var parsed = new URL(String(url), location.href);
        return parsed.origin === location.origin;
    }

    static parse(url) {
        if (!url) return null;
        try {
            if (typeof location !== 'undefined' && location.href) {
                return new URL(String(url), location.href);
            }
            if (/^[a-zA-Z][a-zA-Z\d+.-]*:/.test(String(url))) {
                return new URL(String(url));
            }
            return null;
        }
        catch (error) {
            throw new Error('Invalid URL.');
        }
    }

    static _isUnsafeKey(key) {
        return key === '__proto__' || key === 'prototype' || key === 'constructor';
    }
}

module.exports = UrlUtil;
