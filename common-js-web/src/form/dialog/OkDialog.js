const Modal = require('../../modal/Modal');
const SecurityUtil = require('../../util/SecurityUtil');

const LEVELS = Object.freeze({
    INFO: 'info',
    SUCCESS: 'success',
    WARNING: 'warning',
    ERROR: 'error'
});

const LEVEL_CONFIG = Object.freeze({
    info: {
        title: 'Information',
        icon: 'fa fa-info-circle'
    },
    success: {
        title: 'Success',
        icon: 'fa fa-check-circle'
    },
    warning: {
        title: 'Warning',
        icon: 'fa fa-exclamation-triangle'
    },
    error: {
        title: 'Error',
        icon: 'fa fa-times-circle'
    }
});

class OkDialog {
    static show(config) {
        config = typeof config === 'string' ? {message: config} : (config || {});

        var level = SecurityUtil.sanitizeClassList(config.level || LEVELS.INFO)
            .split(' ')[0] || LEVELS.INFO;

        if (!LEVEL_CONFIG[level]) {
            level = LEVELS.INFO;
        }

        var levelConfig = LEVEL_CONFIG[level];

        return new Promise(function (resolve) {
            var content = document.createElement('div');
            content.className = 'common-ok-content common-ok-' + level;

            var icon = document.createElement('i');
            icon.className = 'common-ok-icon ' + levelConfig.icon;
            icon.setAttribute('aria-hidden', 'true');

            var message = document.createElement('div');
            message.className = 'common-ok-message';
            message.textContent = config.message || '';

            content.appendChild(icon);
            content.appendChild(message);

            var footer = document.createElement('div');
            footer.className = 'common-ok-actions';

            var okButton = document.createElement('button');
            okButton.type = 'button';
            okButton.className = 'common-ok-button common-ok-button-' + level;
            okButton.textContent = config.okLabel || 'OK';

            footer.appendChild(okButton);

            var modal = Modal.open({
                title: config.title || levelConfig.title,
                content: content,
                footer: footer,
                size: config.size || 'sm',
                onClose: function (reason) {
                    resolve(reason === 'ok');
                }
            });

            okButton.addEventListener('click', function () {
                modal.close('ok');
            });

            okButton.focus();
        });
    }

    static info(message, config) {
        return this.show(Object.assign({}, config || {}, {
            level: LEVELS.INFO,
            message: message
        }));
    }

    static success(message, config) {
        return this.show(Object.assign({}, config || {}, {
            level: LEVELS.SUCCESS,
            message: message
        }));
    }

    static warning(message, config) {
        return this.show(Object.assign({}, config || {}, {
            level: LEVELS.WARNING,
            message: message
        }));
    }

    static error(message, config) {
        return this.show(Object.assign({}, config || {}, {
            level: LEVELS.ERROR,
            message: message
        }));
    }
}

OkDialog.Level = LEVELS;

module.exports = OkDialog;
