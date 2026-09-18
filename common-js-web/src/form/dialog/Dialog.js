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

function createContent(level, messageText) {
    var content = document.createElement('div');
    content.className = 'common-dialog-content common-dialog-' + level;

    var icon = document.createElement('i');
    icon.className = 'common-dialog-icon ' + LEVEL_CONFIG[level].icon;
    icon.setAttribute('aria-hidden', 'true');

    var message = document.createElement('div');
    message.className = 'common-dialog-message';
    message.textContent = messageText || '';

    content.appendChild(icon);
    content.appendChild(message);
    return content;
}

function createButton(label, className) {
    var button = document.createElement('button');
    button.type = 'button';
    button.className = className;
    button.textContent = label;
    return button;
}

function createActions() {
    var actions = document.createElement('div');
    actions.className = 'common-dialog-actions';
    return actions;
}

function openModal(config, title, content, actions, onClose) {
    return Modal.open({
        title: title,
        content: content,
        footer: actions,
        size: config.size || 'sm',
        closable: config.closable,
        escapeClose: config.escapeClose,
        onClose: onClose
    });
}

function showConfirm(config, level, content, resolve) {
    var actions = createActions();
    var noButton = createButton(
        config.noLabel || 'No',
        'common-dialog-secondary'
    );
    var yesButton = createButton(
        config.yesLabel || 'Yes',
        'common-dialog-primary common-dialog-primary-' + level
    );

    actions.appendChild(noButton);
    actions.appendChild(yesButton);

    var modal = openModal(
        config,
        config.title || 'Confirm',
        content,
        actions,
        function (reason) {
            resolve(reason === 'yes');
        }
    );

    noButton.addEventListener('click', function () {
        modal.close('no');
    });

    yesButton.addEventListener('click', function () {
        modal.close('yes');
    });

    noButton.focus();
}

function showOk(config, level, content, resolve) {
    var actions = createActions();
    var okButton = createButton(
        config.okLabel || 'OK',
        'common-dialog-primary common-dialog-primary-' + level
    );

    actions.appendChild(okButton);

    var modal = openModal(
        config,
        config.title || LEVEL_CONFIG[level].title,
        content,
        actions,
        function (reason) {
            resolve(reason === 'ok');
        }
    );

    okButton.addEventListener('click', function () {
        modal.close('ok');
    });

    okButton.focus();
}

class Dialog {
    static show(config) {
        config = normalizeConfig(config);

        var mode = config.mode === MODES.CONFIRM
            ? MODES.CONFIRM
            : MODES.OK;
        var level = normalizeLevel(config.level);
        var content = createContent(level, config.message);

        return new Promise(function (resolve) {
            if (mode === MODES.CONFIRM) {
                showConfirm(config, level, content, resolve);
                return;
            }

            showOk(config, level, content, resolve);
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
