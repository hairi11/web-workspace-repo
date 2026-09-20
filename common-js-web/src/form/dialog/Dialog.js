const Modal = require('../../modal/Modal');

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

const LEVEL_CONFIG = {
    info: ['Information', 'fa fa-info-circle', 'text-primary'],
    success: ['Success', 'fa fa-check-circle', 'text-success'],
    warning: ['Warning', 'fa fa-exclamation-triangle', 'text-warning'],
    error: ['Error', 'fa fa-times-circle', 'text-danger']
};

function normalize(config) {
    return typeof config === 'string' ? {message: config} : (config || {});
}

function button(text, className) {
    var element = document.createElement('button');
    element.type = 'button';
    element.className = className;
    element.textContent = text;
    return element;
}

function content(level, message) {
    var wrapper = document.createElement('div');
    var icon = document.createElement('i');
    var text = document.createElement('div');
    var meta = LEVEL_CONFIG[level];

    wrapper.className = 'd-flex align-items-start gap-3';
    icon.className = meta[1] + ' ' + meta[2] + ' fs-4';
    icon.setAttribute('aria-hidden', 'true');
    text.className = 'flex-grow-1';
    text.textContent = message || '';

    wrapper.append(icon, text);
    return wrapper;
}

class Dialog {
    static show(input) {
        var config = normalize(input);
        var confirm = config.mode === MODES.CONFIRM;
        var level = LEVEL_CONFIG[config.level] ? config.level : LEVELS.INFO;
        var actions = document.createElement('div');
        var primary;
        var focusButton;

        actions.className = 'd-flex gap-2 ms-auto';

        if (confirm) {
            actions.style.minWidth = '248px';

            var secondary = button(
                config.noLabel || 'No',
                'btn btn-outline-secondary flex-fill'
            );
            primary = button(
                config.yesLabel || 'Yes',
                'btn btn-primary flex-fill'
            );
            actions.append(secondary, primary);
            focusButton = secondary;
        } else {
            primary = button(config.okLabel || 'OK', 'btn btn-primary px-4');
            actions.appendChild(primary);
            focusButton = primary;
        }

        return new Promise(function (resolve) {
            var modal = Modal.open({
                title: config.title || (confirm ? 'Confirm' : LEVEL_CONFIG[level][0]),
                content: content(level, config.message),
                footer: actions,
                size: config.size || 'sm',
                closable: config.closable,
                escapeClose: config.escapeClose,
                onClose: function (reason) {
                    resolve(confirm ? reason === 'yes' : reason === 'ok');
                }
            });

            if (confirm) {
                actions.firstChild.addEventListener('click', function () {
                    modal.close('no');
                });
                primary.addEventListener('click', function () {
                    modal.close('yes');
                });
            } else {
                primary.addEventListener('click', function () {
                    modal.close('ok');
                });
            }

            modal.element.addEventListener('shown.bs.modal', function () {
                focusButton.focus();
            }, {once: true});
        });
    }

    static confirm(config) {
        config = normalize(config);
        return Dialog.show(Object.assign({}, config, {
            mode: MODES.CONFIRM,
            level: config.level || LEVELS.WARNING
        }));
    }

    static info(message, config) {
        return Dialog.level(LEVELS.INFO, message, config);
    }

    static success(message, config) {
        return Dialog.level(LEVELS.SUCCESS, message, config);
    }

    static warning(message, config) {
        return Dialog.level(LEVELS.WARNING, message, config);
    }

    static error(message, config) {
        return Dialog.level(LEVELS.ERROR, message, config);
    }

    static level(level, message, config) {
        return Dialog.show(Object.assign({}, config || {}, {
            mode: MODES.OK,
            level: level,
            message: message
        }));
    }
}

Dialog.Level = LEVELS;
Dialog.Mode = MODES;

module.exports = Dialog;
