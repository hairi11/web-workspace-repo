const AjaxError = require('./AjaxError');
const AjaxResponse = require('./AjaxResponse');
const InterceptorManager = require('./InterceptorManager');
const MemoryCache = require('../cache/MemoryCache');
const RequestRegistry = require('./RequestRegistry');
const ConfigUtil = require('../util/ConfigUtil');
const UrlUtil = require('../util/UrlUtil');
const SecurityUtil = require('../util/SecurityUtil');

class Ajax {
    static configure(config) {
        Ajax.defaults = ConfigUtil.merge(Ajax.defaults, config || {});
        return Ajax;
    }

    static use(interceptor) { return Ajax.interceptors.use(interceptor); }
    static clearCache() { Ajax.cache.clear(); return Ajax; }
    static createCancelToken() {
        var controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
        return {
            signal: controller ? controller.signal : null,
            cancel: function () { if (controller) controller.abort(); }
        };
    }

    static get(url, options) {
        return Ajax.request(Object.assign({}, options || {}, {method: 'GET', url: url}));
    }

    static post(url, data, options) {
        return Ajax.request(Object.assign({}, options || {}, {data: data, method: 'POST', url: url}));
    }

    static async request(config) {
        var original = ConfigUtil.merge(Ajax.defaults, config || {});
        original.method = String(original.method || 'GET').toUpperCase();
        original.url = UrlUtil.appendQuery(original.url, original.query);
        UrlUtil.assertSafeRequestUrl(original.url, {allowedProtocols: original.allowedProtocols});

        if (original.method !== 'GET' && original.method !== 'POST') {
            throw new Error('Ajax supports GET and POST only.');
        }

        var cacheKey = original.cacheKey || (original.method + ':' + original.url);
        if (original.method === 'GET' && original.cache) {
            var cached = Ajax.cache.get(cacheKey);
            if (cached !== undefined) return cached;
        }

        var dedupeKey = original.dedupeKey || (original.dedupe ? Ajax._buildDedupeKey(original) : null);
        if (dedupeKey && Ajax.registry.has(dedupeKey)) return Ajax.registry.get(dedupeKey);

        var promise = Ajax._execute(original, cacheKey);
        if (dedupeKey) {
            Ajax.registry.set(dedupeKey, promise);
            promise.finally(function () { Ajax.registry.delete(dedupeKey); });
        }
        return promise;
    }

    static async _execute(original, cacheKey) {
        var context = await Ajax.interceptors.run('beforeRequest', original);
        context = ConfigUtil.merge(context, {headers: context.headers, removeHeaders: context.removeHeaders});
        context = await Ajax._applySecurity(context);
        var attempts = Math.max(0, Number(context.retry) || 0) + 1;
        var lastError;

        for (var attempt = 1; attempt <= attempts; attempt += 1) {
            try {
                var result = await Ajax._send(context);
                result = await Ajax.interceptors.run('afterResponse', result);
                if (context.method === 'GET' && context.cache) {
                    Ajax.cache.set(cacheKey, result, Number(context.cacheTtl) || 0);
                }
                return result;
            }
            catch (error) {
                lastError = error;
                try {
                    var transformed = await Ajax.interceptors.run('onError', error);
                    if (transformed instanceof Error) lastError = transformed;
                }
                catch (interceptorError) { lastError = interceptorError; }

                var shouldRetry = attempt < attempts;
                if (shouldRetry && typeof context.retryWhen === 'function') {
                    shouldRetry = Boolean(await context.retryWhen(lastError, attempt, context));
                }
                if (!shouldRetry) break;
                await Ajax._delay(Number(context.retryDelay) || 0);
            }
        }
        throw lastError;
    }


    static async _applySecurity(config) {
        UrlUtil.assertSafeRequestUrl(config.url, {allowedProtocols: config.allowedProtocols});

        var sameOrigin = UrlUtil.isSameOrigin(config.url);
        var headers = Object.assign({}, config.headers || {});

        Ajax._validateHeaders(headers);

        if (!sameOrigin) {
            if (config.credentials === 'include' && config.allowCrossOriginCredentials !== true) {
                throw new Error('Cross-origin credentials are blocked by default. Set allowCrossOriginCredentials=true to opt in.');
            }

            if (config.allowSensitiveHeadersCrossOrigin !== true) {
                Object.keys(headers).forEach(function (name) {
                    if (SecurityUtil.isSensitiveHeader(name, config.sensitiveHeaders)) {
                        delete headers[name];
                    }
                });
            }
        }

        if (sameOrigin && config.method === 'POST' && typeof config.csrfTokenProvider === 'function') {
            var csrfHeader = config.csrfHeader || 'X-CSRF-Token';
            var hasHeader = Object.keys(headers).some(function (name) {
                return SecurityUtil.normalizeHeaderName(name) === SecurityUtil.normalizeHeaderName(csrfHeader);
            });

            if (!hasHeader) {
                var token = await config.csrfTokenProvider(config);
                if (token !== null && token !== undefined && token !== '') {
                    headers[csrfHeader] = String(token);
                }
            }
        }

        config.headers = headers;
        return config;
    }

    static _validateHeaders(headers) {
        Object.keys(headers || {}).forEach(function (name) {
            var value = headers[name];
            if (/[\r\n]/.test(String(name)) || /[\r\n]/.test(String(value))) {
                throw new Error('Invalid request header.');
            }
        });
    }

    static async _send(config) {
        var timeoutController = typeof AbortController !== 'undefined' ? new AbortController() : null;
        var timeoutId = null;
        var options = {
            method: config.method,
            headers: Object.assign({}, config.headers || {}),
            credentials: config.credentials
        };

        if (timeoutController && config.timeout > 0) {
            timeoutId = setTimeout(function () { timeoutController.abort(); }, Number(config.timeout));
        }

        if (config.signal && timeoutController) {
            if (config.signal.aborted) timeoutController.abort();
            else config.signal.addEventListener('abort', function () { timeoutController.abort(); }, {once: true});
        }
        options.signal = timeoutController ? timeoutController.signal : config.signal;

        if (config.method === 'POST') Ajax._applyBody(options, config.data, config.maxBodyLength);

        try {
            var response = await fetch(config.url, options);
            var data = await Ajax._parseResponse(response);
            if (!response.ok) {
                throw new AjaxError(
                    data && data.message ? SecurityUtil.sanitizeErrorMessage(data.message, 'Request failed.') : 'Request failed: ' + response.status,
                    {status: response.status, data: data, response: response}
                );
            }
            return new AjaxResponse(data, response, config);
        }
        catch (error) {
            if (error instanceof AjaxError) throw error;
            var aborted = error && error.name === 'AbortError';
            throw new AjaxError(aborted ? 'Request aborted or timed out.' : SecurityUtil.sanitizeErrorMessage(error && error.message, 'Network request failed.'), {
                cause: error,
                aborted: aborted
            });
        }
        finally { if (timeoutId) clearTimeout(timeoutId); }
    }

    static _buildDedupeKey(config) {
        var body = config.method === 'POST' ? JSON.stringify(config.data || {}) : '';
        return config.method + ':' + config.url + ':' + body;
    }

    static _applyBody(options, data, maxBodyLength) {
        if (typeof FormData !== 'undefined' && data instanceof FormData) { options.body = data; return; }
        if (typeof URLSearchParams !== 'undefined' && data instanceof URLSearchParams) {
            options.headers['Content-Type'] = 'application/x-www-form-urlencoded;charset=UTF-8';
            options.body = data.toString();
            return;
        }
        options.headers['Content-Type'] = options.headers['Content-Type'] || 'application/json;charset=UTF-8';
        var body = JSON.stringify(data === undefined ? {} : data);
        if (maxBodyLength > 0 && body.length > Number(maxBodyLength)) {
            throw new Error('Request body exceeds the configured maximum length.');
        }
        options.body = body;
    }

    static async _parseResponse(response) {
        if (response.status === 204) return null;
        var contentType = response.headers.get('content-type') || '';
        if (contentType.indexOf('application/json') >= 0) return response.json();
        return response.text();
    }

    static _delay(ms) { return new Promise(function (resolve) { setTimeout(resolve, ms); }); }
}

Ajax.defaults = {
    headers: {Accept: 'application/json'},
    credentials: 'same-origin',
    allowedProtocols: ['http:', 'https:'],
    allowCrossOriginCredentials: false,
    allowSensitiveHeadersCrossOrigin: false,
    sensitiveHeaders: SecurityUtil.defaultSensitiveHeaders.slice(),
    csrfHeader: 'X-CSRF-Token',
    csrfTokenProvider: null,
    retry: 0,
    retryDelay: 250,
    retryWhen: null,
    timeout: 0,
    cache: false,
    cacheTtl: 0,
    dedupe: false,
    maxBodyLength: 2000000
};
Ajax.interceptors = new InterceptorManager();
Ajax.cache = new MemoryCache();
Ajax.registry = new RequestRegistry();

module.exports = Ajax;
