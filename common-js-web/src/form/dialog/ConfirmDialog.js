const Modal = require('../../modal/Modal');

class ConfirmDialog {
    static show(config) {
        config = typeof config === 'string' ? {message: config} : (config || {});

        return new Promise(function (resolve) {
            var message = document.createElement('div');
            message.className = 'common-confirm-message';
            message.textContent = config.message || 'Are you sure?';

            var footer = document.createElement('div');
            footer.className = 'common-confirm-actions';

            var noButton = document.createElement('button');
            noButton.type = 'button';
            noButton.className = 'common-confirm-no';
            noButton.textContent = config.noLabel || 'No';

            var yesButton = document.createElement('button');
            yesButton.type = 'button';
            yesButton.className = 'common-confirm-yes';
            yesButton.textContent = config.yesLabel || 'Yes';

            footer.appendChild(noButton);
            footer.appendChild(yesButton);

            var modal = Modal.open({
                title: config.title || 'Confirm',
                content: message,
                footer: footer,
                size: config.size || 'sm',
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
        });
    }
}

module.exports = ConfirmDialog;
