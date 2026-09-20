const SafeDom = require('../util/SafeDom');

let modalId = 0;

function BootstrapModal() {
    return require('bootstrap/js/dist/modal');
}

function node(tag, className) {
    var element = document.createElement(tag);
    if (className) element.className = className;
    return element;
}

class Modal {
    static open(config) {
        config = config || {};

        var root = node('div', 'modal fade');
        var dialog = node('div', 'modal-dialog modal-dialog-centered');
        var content = node('div', 'modal-content');
        var header = node('div', 'modal-header');
        var title = node('h5', 'modal-title');
        var close = node('button', 'btn-close');
        var body = node('div', 'modal-body');
        var sizeClass = {
            sm: 'modal-sm',
            lg: 'modal-lg',
            xl: 'modal-xl'
        }[config.size];

        root.tabIndex = -1;
        if (sizeClass) dialog.classList.add(sizeClass);

        title.id = 'common-modal-title-' + (++modalId);
        title.textContent = config.title || '';
        root.setAttribute('aria-labelledby', title.id);

        close.type = 'button';
        close.setAttribute('aria-label', 'Close');
        close.hidden = config.closable === false;
        if (!close.hidden) close.dataset.bsDismiss = 'modal';

        SafeDom.appendContent(body, config.content, {
            trustedHtml: config.trustedHtml === true
        });

        header.append(title, close);
        content.append(header, body);

        if (config.footer !== null && config.footer !== undefined) {
            var footer = node('div', 'modal-footer');
            SafeDom.appendContent(footer, config.footer, {
                trustedHtml: config.trustedHtml === true
            });
            content.appendChild(footer);
        }

        dialog.appendChild(content);
        root.appendChild(dialog);
        document.body.appendChild(root);

        var instance = new (BootstrapModal())(root, {
            backdrop: 'static',
            keyboard: config.escapeClose !== false
        });
        var reason = 'close';
        var closed = false;

        var api = {
            element: root,
            modal: root,
            instance: instance,
            close: function (value) {
                if (closed) return;
                reason = value || 'close';
                instance.hide();
            }
        };

        root.addEventListener('hidden.bs.modal', function () {
            if (closed) return;
            closed = true;
            instance.dispose();
            root.remove();

            if (typeof config.onClose === 'function') {
                config.onClose(reason, api);
            }
        }, {once: true});

        instance.show();
        return api;
    }
}

module.exports = Modal;
