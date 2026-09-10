const SafeDom = require('../util/SafeDom');
const SecurityUtil = require('../util/SecurityUtil');

class Modal {
    static open(config) {
        config = config || {};

        var overlay = document.createElement('div');
        overlay.className = 'common-modal-overlay';

        var modal = document.createElement('div');
        var size = SecurityUtil.sanitizeClassList(config.size || 'md').split(' ')[0] || 'md';
        modal.className = 'common-modal common-modal-' + size;

        var header = document.createElement('div');
        header.className = 'common-modal-header';

        var title = document.createElement('strong');
        title.textContent = config.title || '';

        var closeButton = document.createElement('button');
        closeButton.type = 'button';
        closeButton.setAttribute('aria-label', 'Close');
        closeButton.textContent = '×';

        var body = document.createElement('div');
        body.className = 'common-modal-body';
        SafeDom.appendContent(body, config.content, {trustedHtml: config.trustedHtml === true});

        header.appendChild(title);
        header.appendChild(closeButton);
        modal.appendChild(header);
        modal.appendChild(body);
        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        var api = {
            element: overlay,
            close: function () {
                if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
            }
        };

        closeButton.addEventListener('click', api.close);
        return api;
    }
}

module.exports = Modal;
