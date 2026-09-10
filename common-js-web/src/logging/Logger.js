const loglevel = require('loglevel');
const SecurityUtil = require('../util/SecurityUtil');

class Logger {
    constructor(namespace, options) {
        options = options || {};
        this.namespace = namespace || 'CommonJS';
        this.enabled = options.enabled !== false;
        this.redact = options.redact !== false;
        this.redactionOptions = options.redactionOptions || {};
        this.sink = options.sink || null;
        this.logger = loglevel.getLogger(this.namespace);

        if (options.level) this.logger.setLevel(options.level);
        if (!this.enabled) this.logger.disableAll();
    }

    _write(level, args) {
        if (!this.enabled) return;

        var values = Array.prototype.slice.call(args);
        if (this.redact) {
            values = values.map(function (value) {
                return SecurityUtil.redact(value, this.redactionOptions);
            }, this);
        }

        if (this.sink) {
            var sinkFn = this.sink[level] || this.sink.log;
            if (typeof sinkFn === 'function') {
                sinkFn.apply(this.sink, ['[' + this.namespace + ']'].concat(values));
            }
            return;
        }

        var loggerFn = this.logger[level] || this.logger.info;
        loggerFn.apply(this.logger, values);
    }

    debug() { this._write('debug', arguments); }
    info() { this._write('info', arguments); }
    warn() { this._write('warn', arguments); }
    error() { this._write('error', arguments); }
}

module.exports = Logger;
