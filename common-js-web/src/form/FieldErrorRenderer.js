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
        Array.prototype.forEach.call(invalid, function (node) {
            node.classList.remove(this.invalidClass);
            node.removeAttribute('aria-invalid');
        }, this);
    }

    render(form, errors) {
        if (!form) return;
        this.clear(form);

        Object.keys(errors || {}).forEach(function (field) {
            var input = this._findField(form, field);
            if (!input) return;

            var visibleInput = this._visibleInput(input);
            var messageTarget = this._messageTarget(input, visibleInput);

            input.classList.add(this.invalidClass);
            input.setAttribute('aria-invalid', 'true');

            if (visibleInput !== input) {
                visibleInput.classList.add(this.invalidClass);
                visibleInput.setAttribute('aria-invalid', 'true');
            }

            var message = document.createElement('div');
            message.className = this.errorClass + ' ' + this.messageClass;
            message.textContent = SecurityUtil.sanitizeErrorMessage(errors[field], 'Invalid value.');
            messageTarget.insertAdjacentElement('afterend', message);
        }, this);
    }

    _visibleInput(input) {
        return input._flatpickr && input._flatpickr.altInput
            ? input._flatpickr.altInput
            : input;
    }

    _messageTarget(input, visibleInput) {
        var datePickerControl = input.closest('.date-picker-control');
        return datePickerControl || visibleInput;
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
