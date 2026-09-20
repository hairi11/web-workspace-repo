const SafeDom = require('../util/SafeDom');

var modalCounter = 0;

function getBootstrapModal() {
    return require('bootstrap/js/dist/modal');
}

function dialogSizeClass(size) {
    if (size === 'sm') return 'modal-sm';
    if (size === 'lg') return 'modal-lg';
    if (size === 'xl') return 'modal-xl';
    return '';
}

class Modal {
    static open(config) {
        config = config || {};

        var root = document.createElement('div');
        var dialog = document.createElement('div');
        var content = document.createElement('div');
        var header = document.createElement('div');
        var title = document.createElement('h5');
        var closeButton = document.createElement('button');
        var body = document.createElement('div');

        root.className = 'modal fade';
        root.tabIndex = -1;
        root.setAttribute('aria-hidden', 'true');

        dialog.className = 'modal-dialog modal-dialog-centered';
        var sizeClass = dialogSizeClass(config.size || 'md');
        if (sizeClass) dialog.classList.add(sizeClass);

        content.className = 'modal-content';
        header.className = 'modal-header';
        body.className = 'modal-body';

        title.className = 'modal-title';
        title.textContent = config.title || '';
        title.id = 'common-modal-title-' + (++modalCounter);
        root.setAttribute('aria-labelledby', title.id);

        closeButton.type = 'button';
        closeButton.className = 'btn-close';
        closeButton.setAttribute('aria-label', 'Close');

        if (config.closable === false) {
            closeButton.hidden = true;
        } else {
            closeButton.setAttribute('data-bs-dismiss', 'modal');
        }

        SafeDom.appendContent(body, config.content, {
            trustedHtml: config.trustedHtml === true
        });

        header.appendChild(title);
        header.appendChild(closeButton);
        content.appendChild(header);
        content.appendChild(body);

        if (config.footer !== null && config.footer !== undefined) {
            var footer = document.createElement('div');
            footer.className = 'modal-footer';
            SafeDom.appendContent(footer, config.footer, {
                trustedHtml: config.trustedHtml === true
            });
            content.appendChild(footer);
        }

        dialog.appendChild(content);
        root.appendChild(dialog);
        document.body.appendChild(root);

        var BootstrapModal = getBootstrapModal();
        var instance = new BootstrapModal(root, {
            backdrop: 'static',
            focus: true,
            keyboard: config.escapeClose !== false
        });
        var reason = 'close';
        var closed = false;

        var api = {
            element: root,
            modal: root,
            instance: instance,
            close: function (closeReason) {
                if (closed) return;
                reason = closeReason || 'close';
                instance.hide();
            }
        };

        closeButton.addEventListener('click', function () {
            reason = 'close';
        });

        root.addEventListener('hidden.bs.modal', function () {
            if (closed) return;
            closed = true;

            instance.dispose();

            if (root.parentNode) {
                root.parentNode.removeChild(root);
            }

            if (typeof config.onClose === 'function') {
                config.onClose(reason, api);
            }
        }, {once: true});

        instance.show();
        return api;
    }
}

module.exports = Modal;
