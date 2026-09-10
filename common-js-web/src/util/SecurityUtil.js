class SecurityUtil {
    static isUnsafeKey(key) {
        return key === '__proto__' || key === 'prototype' || key === 'constructor';
    }

    static assertSafeObjectKey(key) {
        if (SecurityUtil.isUnsafeKey(String(key))) {
            throw new Error('Unsafe object key rejected: ' + key);
        }
        return key;
    }

    static redact(value, options, seen) {
        options = options || {};
        seen = seen || [];
        var sensitive = (options.sensitiveKeys || SecurityUtil.defaultSensitiveKeys)
            .map(function (key) { return String(key).toLowerCase(); });
        var replacement = options.replacement || '[REDACTED]';

        if (value === null || value === undefined) return value;
        if (typeof value !== 'object') return value;
        if (seen.indexOf(value) >= 0) return '[Circular]';

        seen.push(value);

        if (Array.isArray(value)) {
            var arrayResult = value.map(function (item) {
                return SecurityUtil.redact(item, options, seen);
            });
            seen.pop();
            return arrayResult;
        }

        var result = {};
        Object.keys(value).forEach(function (key) {
            if (sensitive.indexOf(String(key).toLowerCase()) >= 0) {
                result[key] = replacement;
            }
            else {
                result[key] = SecurityUtil.redact(value[key], options, seen);
            }
        });

        seen.pop();
        return result;
    }

    static escapeHtml(value) {
        return String(value === null || value === undefined ? '' : value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/\"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    static sanitizeClassList(value) {
        return String(value || '')
            .split(/\s+/)
            .filter(function (token) { return /^[A-Za-z0-9_-]+$/.test(token); })
            .join(' ');
    }

    static sanitizeErrorMessage(message, fallback) {
        var text = message === null || message === undefined ? '' : String(message);
        text = text.replace(/[\r\n\t]+/g, ' ').replace(/\s{2,}/g, ' ').trim();
        if (!text) return fallback || 'An unexpected error occurred.';
        if (text.length > 500) text = text.substring(0, 500) + '…';
        return text;
    }

    static normalizeHeaderName(name) {
        return String(name || '').trim().toLowerCase();
    }

    static isSensitiveHeader(name, sensitiveHeaders) {
        var normalized = SecurityUtil.normalizeHeaderName(name);
        return (sensitiveHeaders || SecurityUtil.defaultSensitiveHeaders)
            .map(SecurityUtil.normalizeHeaderName)
            .indexOf(normalized) >= 0;
    }
}

SecurityUtil.defaultSensitiveHeaders = [
    'authorization',
    'cookie',
    'proxy-authorization',
    'x-api-key',
    'x-auth-token',
    'x-csrf-token'
];

SecurityUtil.defaultSensitiveKeys = [
    'authorization',
    'cookie',
    'password',
    'passwd',
    'secret',
    'token',
    'accessToken',
    'refreshToken',
    'apiKey',
    'csrfToken',
    'clientSecret'
];

module.exports = SecurityUtil;
