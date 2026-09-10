const SecurityUtil = require('../util/SecurityUtil');

class FieldErrorRenderer {
    constructor(options) {
        this.errorClass = options && options.errorClass ? options.errorClass : 'form-action-error';
        this.invalidClass = options && options.invalidClass ? options.invalidClass : 'is-invalid';
        this.messageClass = options && options.messageClass ? options.messageClass : 'invalid-feedback';
    }

    clear(form) {
        if (!form) return;
        var old = form.querySelectorAll('.' + this.errorClass);
        Array.prototype.forEach.call(old, function (node) { node.remove(); });
        var invalid = form.querySelectorAll('.' + this.invalidClass);
        Array.prototype.forEach.call(invalid, function (node) { node.classList.remove(this.invalidClass); }, this);
    }

    render(form, errors) {
        if (!form) return;
        this.clear(form);

        Object.keys(errors || {}).forEach(function (field) {
            var input = this._findField(form, field);
            if (!input) return;

            input.classList.add(this.invalidClass);
            input.setAttribute('aria-invalid', 'true');

            var message = document.createElement('div');
            message.className = this.errorClass + ' ' + this.messageClass;
            message.textContent = SecurityUtil.sanitizeErrorMessage(errors[field], 'Invalid value.');
            input.insertAdjacentElement('afterend', message);
        }, this);
    }

    _findField(form, fieldName) {
        var fields = form.querySelectorAll('[name]');
        for (var i = 0; i < fields.length; i += 1) {
            if (fields[i].getAttribute('name') === String(fieldName)) return fields[i];
        }
        return null;
    }
}

module.exports = FieldErrorRenderer;
