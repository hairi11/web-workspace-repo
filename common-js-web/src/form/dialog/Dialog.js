const Modal = require('../../modal/Modal');
const SecurityUtil = require('../../util/SecurityUtil');

const LEVELS = Object.freeze({
    INFO: 'info',
    SUCCESS: 'success',
    WARNING: 'warning',
    ERROR: 'error'
});

const MODES = Object.freeze({
    OK: 'ok',
    CONFIRM: 'confirm'
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

function normalizeConfig(config) {
    return typeof config === 'string'
        ? {message: config}
        : (config || {});
}

function normalizeLevel(level) {
    var value = SecurityUtil.sanitizeClassList(level || LEVELS.INFO)
        .split(' ')[0] || LEVELS.INFO;

    return LEVEL_CONFIG[value] ? value : LEVELS.INFO;
}

class Dialog {
    static show(config) {
        config = normalizeConfig(config);

        var mode = config.mode === MODES.CONFIRM
            ? MODES.CONFIRM
            : MODES.OK;
        var level = normalizeLevel(config.level);
        var levelConfig = LEVEL_CONFIG[level];

        return new Promise(function (resolve) {
            var content = document.createElement('div');
            content.className = 'common-dialog-content common-dialog-' + level;

            var icon = document.createElement('i');
            icon.className = 'common-dialog-icon ' + levelConfig.icon;
            icon.setAttribute('aria-hidden', 'true');

            var message = document.createElement('div');
            message.className = 'common-dialog-message';
            message.textContent = config.message || '';

            content.appendChild(icon);
            content.appendChild(message);

            var actions = document.createElement('div');
            actions.className = 'common-dialog-actions';

            var modal;

            if (mode === MODES.CONFIRM) {
                var noButton = document.createElement('button');
                noButton.type = 'button';
                noButton.className = 'common-dialog-secondary';
                noButton.textContent = config.noLabel || 'No';

                var yesButton = document.createElement('button');
                yesButton.type = 'button';
                yesButton.className = 'common-dialog-primary common-dialog-primary-' + level;
                yesButton.textContent = config.yesLabel || 'Yes';

                actions.appendChild(noButton);
                actions.appendChild(yesButton);

                modal = Modal.open({
                    title: config.title || 'Confirm',
                    content: content,
                    footer: actions,
                    size: config.size || 'sm',
                    closable: config.closable,
                    escapeClose: config.escapeClose,
                    onClose: function (reason) {
                        resolve(reason === 'yes');
                    }
                });

                noButton.addEventListener('click', function () {
                    modal.close('no');
                });

                yesButton.addEventListener('click', function () {
                    modal.close('yes');
                });

                noButton.focus();
                return;
            }

            var okButton = document.createElement('button');
            okButton.type = 'button';
            okButton.className = 'common-dialog-primary common-dialog-primary-' + level;
            okButton.textContent = config.okLabel || 'OK';
            actions.appendChild(okButton);

            modal = Modal.open({
                title: config.title || levelConfig.title,
                content: content,
                footer: actions,
                size: config.size || 'sm',
                closable: config.closable,
                escapeClose: config.escapeClose,
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

    static confirm(config) {
        config = normalizeConfig(config);

        return Dialog.show(Object.assign({}, config, {
            mode: MODES.CONFIRM,
            level: config.level || LEVELS.WARNING
        }));
    }

    static info(message, config) {
        return Dialog.show(Object.assign({}, config || {}, {
            mode: MODES.OK,
            level: LEVELS.INFO,
            message: message
        }));
    }

    static success(message, config) {
        return Dialog.show(Object.assign({}, config || {}, {
            mode: MODES.OK,
            level: LEVELS.SUCCESS,
            message: message
        }));
    }

    static warning(message, config) {
        return Dialog.show(Object.assign({}, config || {}, {
            mode: MODES.OK,
            level: LEVELS.WARNING,
            message: message
        }));
    }

    static error(message, config) {
        return Dialog.show(Object.assign({}, config || {}, {
            mode: MODES.OK,
            level: LEVELS.ERROR,
            message: message
        }));
    }
}

Dialog.Level = LEVELS;
Dialog.Mode = MODES;

module.exports = Dialog;
