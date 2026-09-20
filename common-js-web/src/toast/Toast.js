const TYPE_CLASS = {
    success: 'text-bg-success',
    error: 'text-bg-danger',
    info: 'text-bg-primary'
};

function BootstrapToast() {
    return require('bootstrap/js/dist/toast');
}

function container() {
    var element = document.querySelector('[data-common-toast-container]');

    if (!element) {
        element = document.createElement('div');
        element.className = 'toast-container position-fixed bottom-0 end-0 p-3';
        element.dataset.commonToastContainer = '';
        document.body.appendChild(element);
    }

    return element;
}

class Toast {
    static show(message, type, duration) {
        type = TYPE_CLASS[type] ? type : 'info';
        duration = duration === undefined ? 3000 : Math.max(0, Number(duration) || 0);

        var element = document.createElement('div');
        var row = document.createElement('div');
        var body = document.createElement('div');
        var close = document.createElement('button');

        element.className = 'toast align-items-center border-0 ' + TYPE_CLASS[type];
        element.setAttribute('role', 'alert');
        row.className = 'd-flex';
        body.className = 'toast-body';
        body.textContent = message == null ? '' : String(message);
        close.type = 'button';
        close.className = 'btn-close btn-close-white me-2 m-auto';
        close.dataset.bsDismiss = 'toast';
        close.setAttribute('aria-label', 'Close');

        row.append(body, close);
        element.appendChild(row);
        container().appendChild(element);

        var instance = new (BootstrapToast())(element, {
            autohide: duration > 0,
            delay: duration || 3000
        });

        element.addEventListener('hidden.bs.toast', function () {
            instance.dispose();
            element.remove();
        }, {once: true});

        instance.show();
        return element;
    }

    static success(message, duration) { return Toast.show(message, 'success', duration); }
    static error(message, duration) { return Toast.show(message, 'error', duration); }
    static info(message, duration) { return Toast.show(message, 'info', duration); }
}

module.exports = Toast;
