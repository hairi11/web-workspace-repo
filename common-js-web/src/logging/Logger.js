const SecurityUtil = require('../util/SecurityUtil');

class Logger {
    constructor(namespace, options) {
        options = options || {};
        this.namespace = namespace || 'CommonJS';
        this.enabled = options.enabled !== false;
        this.sink = options.sink || console;
        this.redact = options.redact !== false;
        this.redactionOptions = options.redactionOptions || {};
    }

    _write(level, args) {
        if (!this.enabled || !this.sink) return;
        var fn = this.sink[level] || this.sink.log;
        if (typeof fn !== 'function') return;

        var values = Array.prototype.slice.call(args);
        if (this.redact) {
            values = values.map(function (value) {
                return SecurityUtil.redact(value, this.redactionOptions);
            }, this);
        }

        fn.apply(this.sink, ['[' + this.namespace + ']'].concat(values));
    }

    debug() { this._write('debug', arguments); }
    info() { this._write('info', arguments); }
    warn() { this._write('warn', arguments); }
    error() { this._write('error', arguments); }
}

module.exports = Logger;
