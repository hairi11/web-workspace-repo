const TYPE_CLASS = Object.freeze({
    success: 'text-bg-success',
    error: 'text-bg-danger',
    info: 'text-bg-primary'
});

function getBootstrapToast() {
    return require('bootstrap/js/dist/toast');
}

function getContainer() {
    var container = document.querySelector('[data-common-toast-container]');

    if (container) return container;

    container = document.createElement('div');
    container.className = 'toast-container position-fixed bottom-0 end-0 p-3';
    container.setAttribute('data-common-toast-container', '');
    document.body.appendChild(container);

    return container;
}

class Toast {
    static show(message, type, duration) {
        type = TYPE_CLASS[type] ? type : 'info';
        duration = duration === undefined
            ? 3000
            : Math.max(0, Number(duration) || 0);

        var element = document.createElement('div');
        var row = document.createElement('div');
        var body = document.createElement('div');
        var closeButton = document.createElement('button');

        element.className = 'toast align-items-center border-0 ' + TYPE_CLASS[type];
        element.setAttribute('role', 'alert');
        element.setAttribute('aria-live', 'assertive');
        element.setAttribute('aria-atomic', 'true');

        row.className = 'd-flex';
        body.className = 'toast-body';
        body.textContent = message === null || message === undefined
            ? ''
            : String(message);

        closeButton.type = 'button';
        closeButton.className = 'btn-close btn-close-white me-2 m-auto';
        closeButton.setAttribute('data-bs-dismiss', 'toast');
        closeButton.setAttribute('aria-label', 'Close');

        row.appendChild(body);
        row.appendChild(closeButton);
        element.appendChild(row);
        getContainer().appendChild(element);

        var BootstrapToast = getBootstrapToast();
        var instance = new BootstrapToast(element, {
            autohide: duration > 0,
            delay: duration > 0 ? duration : 3000
        });

        element.addEventListener('hidden.bs.toast', function () {
            instance.dispose();

            if (element.parentNode) {
                element.parentNode.removeChild(element);
            }
        }, {once: true});

        instance.show();
        return element;
    }

    static success(message, duration) {
        return Toast.show(message, 'success', duration);
    }

    static error(message, duration) {
        return Toast.show(message, 'error', duration);
    }

    static info(message, duration) {
        return Toast.show(message, 'info', duration);
    }
}

module.exports = Toast;
