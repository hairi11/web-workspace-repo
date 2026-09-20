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

const LEVEL_CONFIG = Object.freeze({
    info: {
        title: 'Information',
        icon: 'fa fa-info-circle',
        textClass: 'text-primary'
    },
    success: {
        title: 'Success',
        icon: 'fa fa-check-circle',
        textClass: 'text-success'
    },
    warning: {
        title: 'Warning',
        icon: 'fa fa-exclamation-triangle',
        textClass: 'text-warning'
    },
    error: {
        title: 'Error',
        icon: 'fa fa-times-circle',
        textClass: 'text-danger'
    }
});

function normalizeConfig(config) {
    return typeof config === 'string'
        ? {message: config}
        : (config || {});
}

function normalizeLevel(level) {
    return LEVEL_CONFIG[level] ? level : LEVELS.INFO;
}

function createContent(level, messageText) {
    var content = document.createElement('div');
    var icon = document.createElement('i');
    var message = document.createElement('div');

    content.className = 'd-flex align-items-start gap-3';
    icon.className = LEVEL_CONFIG[level].icon
        + ' fs-4 '
        + LEVEL_CONFIG[level].textClass;
    icon.setAttribute('aria-hidden', 'true');

    message.className = 'flex-grow-1';
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

function createActions(paired) {
    var actions = document.createElement('div');

    actions.className = 'd-flex gap-2 ms-auto';

    if (paired) {
        actions.style.minWidth = '248px';
    }

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

function showConfirm(config, content, resolve) {
    var actions = createActions(true);
    var noButton = createButton(
        config.noLabel || 'No',
        'btn btn-outline-secondary flex-fill'
    );
    var yesButton = createButton(
        config.yesLabel || 'Yes',
        'btn btn-primary flex-fill'
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
    var actions = createActions(false);
    var okButton = createButton(
        config.okLabel || 'OK',
        'btn btn-primary px-4'
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
                showConfirm(config, content, resolve);
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
