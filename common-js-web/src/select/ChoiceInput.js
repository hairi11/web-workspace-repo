const Select2 = require('./Select2');

const DEFAULT_THRESHOLD = 5;

function resolve(target) {
    return typeof target === 'string'
        ? document.querySelector(target)
        : target || null;
}

function normalizeItems(element, data) {
    if (Array.isArray(data)) {
        return data.map(function (item) {
            return {
                id: item && item.id !== undefined ? String(item.id) : '',
                text: item && item.text !== undefined ? String(item.text) : ''
            };
        });
    }

    return Array.from(element.options)
        .filter(function (option) { return option.value !== ''; })
        .map(function (option) {
            return {id: option.value, text: option.textContent};
        });
}

class ChoiceInput {
    constructor(target, options) {
        this.target = target;
        this.options = options || {};
        this.element = null;
        this.select = null;
        this.radioGroup = null;
        this.radioInputs = [];
        this.labelStates = [];
        this.mode = null;
    }

    build() {
        this.element = resolve(this.target);

        if (!this.element || this.element.tagName !== 'SELECT') {
            throw new Error('ChoiceInput requires a select element.');
        }

        var items = normalizeItems(this.element, this.options.data);
        this.mode = ChoiceInput.resolveMode(items.length, this.options.threshold);

        if (this.mode === ChoiceInput.Mode.SELECT) {
            var options = Object.assign({}, this.options, {data: items});
            delete options.threshold;
            this.select = new Select2(this.element, options).build();
        } else {
            this.buildRadios(items);
        }

        return this;
    }

    buildRadios(items) {
        var group = document.createElement('div');
        var baseId = this.element.id || this.element.name || 'choice';
        var labels = this.element.labels
            ? Array.from(this.element.labels)
            : [];

        group.className = 'choice-input-radio-group d-flex flex-wrap align-items-center gap-3 py-2';
        group.setAttribute('role', 'radiogroup');

        this.labelStates = labels.map(function (label) {
            return {
                element: label,
                htmlFor: label.htmlFor,
                id: label.id
            };
        });

        items.forEach((item, index) => {
            var wrapper = document.createElement('div');
            var input = document.createElement('input');
            var label = document.createElement('label');

            input.type = 'radio';
            input.name = this.element.name;
            input.value = item.id;
            input.id = baseId + '-option-' + String(index + 1);
            input.disabled = this.element.disabled;
            input.className = 'form-check-input';

            label.className = 'form-check-label';
            label.htmlFor = input.id;
            label.textContent = item.text;
            wrapper.className = 'form-check form-check-inline';

            wrapper.append(input, label);
            group.appendChild(wrapper);
            this.radioInputs.push(input);
        });

        if (labels.length && this.radioInputs.length) {
            if (!labels[0].id) labels[0].id = baseId + '-label';
            labels.forEach((label) => {
                label.htmlFor = this.radioInputs[0].id;
            });
            group.setAttribute('aria-labelledby', labels[0].id);
        }

        this.element.parentNode.insertBefore(group, this.element);
        this.element.remove();
        this.radioGroup = group;
    }

    value() {
        if (this.mode === ChoiceInput.Mode.SELECT) {
            return this.select ? this.select.value() : null;
        }

        var checked = this.radioInputs.find(function (input) {
            return input.checked;
        });
        return checked ? checked.value : null;
    }

    setValue(value, triggerChange) {
        if (this.mode === ChoiceInput.Mode.SELECT) {
            if (this.select) this.select.setValue(value, triggerChange);
            return this;
        }

        var expected = value == null ? '' : String(value);
        var previous = this.radioInputs.find(function (input) {
            return input.checked;
        });
        var selected = null;

        this.radioInputs.forEach(function (input) {
            input.checked = input.value === expected;
            if (input.checked) selected = input;
        });

        if (triggerChange === true && (selected || previous)) {
            (selected || previous).dispatchEvent(new Event('change', {bubbles: true}));
        }

        return this;
    }

    clear(triggerChange) {
        return this.setValue(null, triggerChange);
    }

    enable() {
        return this.setDisabled(false);
    }

    disable() {
        return this.setDisabled(true);
    }

    setDisabled(disabled) {
        var value = Boolean(disabled);

        if (this.mode === ChoiceInput.Mode.SELECT) {
            if (this.select) value ? this.select.disable() : this.select.enable();
        } else {
            this.radioInputs.forEach(function (input) {
                input.disabled = value;
            });
        }

        return this;
    }

    destroy() {
        if (this.select) {
            this.select.destroy();
            this.select = null;
        }

        if (this.radioGroup) {
            var value = this.value() || '';
            var disabled = this.radioInputs.length
                ? this.radioInputs[0].disabled
                : this.element.disabled;

            this.radioGroup.parentNode.insertBefore(this.element, this.radioGroup);
            this.radioGroup.remove();
            this.element.value = value;
            this.element.disabled = disabled;
        }

        this.labelStates.forEach(function (state) {
            state.element.htmlFor = state.htmlFor;
            if (state.id) state.element.id = state.id;
            else state.element.removeAttribute('id');
        });

        this.radioGroup = null;
        this.radioInputs = [];
        this.labelStates = [];
        this.mode = null;
        return this;
    }

    getMode() {
        return this.mode;
    }
}

ChoiceInput.DEFAULT_THRESHOLD = DEFAULT_THRESHOLD;

ChoiceInput.resolveMode = function (optionCount, threshold) {
    var limit = Number(threshold);

    if (!Number.isInteger(limit) || limit <= 0) {
        limit = DEFAULT_THRESHOLD;
    }

    return Math.max(0, Number(optionCount) || 0) <= limit
        ? ChoiceInput.Mode.RADIO
        : ChoiceInput.Mode.SELECT;
};

ChoiceInput.Mode = Object.freeze({
    RADIO: 'radio',
    SELECT: 'select'
});

module.exports = ChoiceInput;
