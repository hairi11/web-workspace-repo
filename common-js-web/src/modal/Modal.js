const SafeDom = require('../util/SafeDom');
const SecurityUtil = require('../util/SecurityUtil');

var modalCounter = 0;

class Modal {
    static open(config) {
        config = config || {};

        var overlay = document.createElement('div');
        overlay.className = 'common-modal-overlay';

        var modal = document.createElement('div');
        var size = SecurityUtil.sanitizeClassList(config.size || 'md').split(' ')[0] || 'md';
        modal.className = 'common-modal common-modal-' + size;
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');

        var header = document.createElement('div');
        header.className = 'common-modal-header';

        var title = document.createElement('strong');
        title.textContent = config.title || '';
        title.id = 'common-modal-title-' + (++modalCounter);
        modal.setAttribute('aria-labelledby', title.id);

        var closeButton = document.createElement('button');
        closeButton.type = 'button';
        closeButton.className = 'common-modal-close';
        closeButton.setAttribute('aria-label', 'Close');
        closeButton.textContent = '×';

        var body = document.createElement('div');
        body.className = 'common-modal-body';
        SafeDom.appendContent(body, config.content, {trustedHtml: config.trustedHtml === true});

        header.appendChild(title);
        header.appendChild(closeButton);
        modal.appendChild(header);
        modal.appendChild(body);

        if (config.footer !== null && config.footer !== undefined) {
            var footer = document.createElement('div');
            footer.className = 'common-modal-footer';
            SafeDom.appendContent(footer, config.footer, {
                trustedHtml: config.trustedHtml === true
            });
            modal.appendChild(footer);
        }

        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        var closed = false;
        var keydownHandler = function (event) {
            if (event.key === 'Escape') {
                event.preventDefault();
                api.close('escape');
            }
        };

        var api = {
            element: overlay,
            modal: modal,
            close: function (reason) {
                if (closed) return;
                closed = true;

                if (config.escapeClose !== false) {
                    document.removeEventListener('keydown', keydownHandler);
                }

                if (overlay.parentNode) {
                    overlay.parentNode.removeChild(overlay);
                }

                if (typeof config.onClose === 'function') {
                    config.onClose(reason || 'close', api);
                }
            }
        };

        if (config.closable === false) {
            closeButton.hidden = true;
        } else {
            closeButton.addEventListener('click', function () {
                api.close('close');
            });
        }

        if (config.escapeClose !== false) {
            document.addEventListener('keydown', keydownHandler);
        }

        return api;
    }
}

module.exports = Modal;
