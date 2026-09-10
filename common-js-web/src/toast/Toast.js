const SecurityUtil = require('../util/SecurityUtil');

class Toast {
    static show(message, type, duration) {
        type = SecurityUtil.sanitizeClassList(type || 'info').split(' ')[0] || 'info';
        duration = duration === undefined ? 3000 : Math.max(0, Number(duration) || 0);
        var el = document.createElement('div');
        el.className = 'common-toast common-toast-' + type;
        el.textContent = message === null || message === undefined ? '' : String(message);
        document.body.appendChild(el);
        if (duration > 0) setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, duration);
        return el;
    }

    static success(message, duration) { return Toast.show(message, 'success', duration); }
    static error(message, duration) { return Toast.show(message, 'error', duration); }
    static info(message, duration) { return Toast.show(message, 'info', duration); }
}

module.exports = Toast;
