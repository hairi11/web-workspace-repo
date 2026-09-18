const Select2 = require('./Select2');

const DEFAULT_THRESHOLD = 5;

class ChoiceInput {
    constructor(target, options) {
        this.target = target;
        this.options = options || {};
        this.element = null;
        this.select = null;
        this.radioGroup = null;
        this.radioInputs = [];
        this.labels = [];
        this.mode = null;
    }

    build() {
        this.element = this.resolveElement(this.target);

        if (!this.element || this.element.tagName !== 'SELECT') {
            throw new Error('ChoiceInput requires a select element.');
        }

        var items = this.getItems();
        var threshold = this.getThreshold();

        this.mode = ChoiceInput.resolveMode(items.length, threshold);

        if (this.mode === ChoiceInput.Mode.RADIO) {
            this.buildRadios(items);
        } else {
            this.select = new Select2(this.element, this.getSelectOptions(items)).build();
        }

        return this;
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

        var normalized = value === null || value === undefined ? '' : String(value);
        var previousInput = this.radioInputs.find(function (input) {
            return input.checked;
        });
        var changedInput = null;

        this.radioInputs.forEach(function (input) {
            var checked = input.value === normalized;
            input.checked = checked;
            if (checked) changedInput = input;
        });

        var eventTarget = changedInput || previousInput;
        if (triggerChange === true && eventTarget) {
            eventTarget.dispatchEvent(new Event('change', {bubbles: true}));
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
            if (this.select) {
                value ? this.select.disable() : this.select.enable();
            }
            return this;
        }

        this.radioInputs.forEach(function (input) {
            input.disabled = value;
        });

        return this;
    }

    destroy() {
        if (this.select) {
            this.select.destroy();
            this.select = null;
        }

        if (this.radioGroup && this.radioGroup.parentNode) {
            this.element.value = this.value() || '';
            if (this.radioInputs.length) {
                this.element.disabled = this.radioInputs[0].disabled;
            }
            this.radioGroup.parentNode.insertBefore(this.element, this.radioGroup);
            this.radioGroup.remove();
        }

        this.restoreLabels();
        this.radioGroup = null;
        this.radioInputs = [];
        this.labels = [];
        this.mode = null;

        return this;
    }

    getMode() {
        return this.mode;
    }

    getThreshold() {
        var threshold = Number(this.options.threshold);

        return Number.isInteger(threshold) && threshold > 0
            ? threshold
            : DEFAULT_THRESHOLD;
    }

    getItems() {
        if (Array.isArray(this.options.data)) {
            return this.options.data.map(this.normalizeItem);
        }

        return Array.prototype
            .filter.call(this.element.options, function (option) {
                return option.value !== '';
            })
            .map(function (option) {
                return {
                    id: option.value,
                    text: option.textContent
                };
            });
    }

    normalizeItem(item) {
        return {
            id: item && item.id !== undefined ? String(item.id) : '',
            text: item && item.text !== undefined ? String(item.text) : ''
        };
    }

    getSelectOptions(items) {
        var options = Object.assign({}, this.options, {
            data: items
        });

        delete options.threshold;
        return options;
    }

    buildRadios(items) {
        var group = document.createElement('div');
        var name = this.element.name;
        var baseId = this.element.id || name || 'choice';

        group.className = 'choice-input-radio-group';
        group.setAttribute('role', 'radiogroup');

        this.labels = this.getLabels();

        items.forEach((item, index) => {
            var option = document.createElement('div');
            var input = document.createElement('input');
            var label = document.createElement('label');

            input.type = 'radio';
            input.name = name;
            input.value = item.id;
            input.id = baseId + '-option-' + String(index + 1);
            input.disabled = this.element.disabled;
            input.className = 'form-check-input';

            option.className = 'form-check form-check-inline';
            label.className = 'form-check-label';
            label.htmlFor = input.id;
            label.textContent = item.text;

            option.appendChild(input);
            option.appendChild(label);
            group.appendChild(option);
            this.radioInputs.push(input);
        });

        if (this.labels.length && this.radioInputs.length) {
            this.labels.forEach((label) => {
                label.htmlFor = this.radioInputs[0].id;
            });
            group.setAttribute('aria-labelledby', this.ensureLabelId(this.labels[0], baseId));
        }

        this.element.parentNode.insertBefore(group, this.element);
        this.element.remove();
        this.radioGroup = group;
    }

    getLabels() {
        if (this.element.labels) {
            return Array.prototype.slice.call(this.element.labels);
        }

        var id = this.element.id;
        if (!id) return [];

        return Array.prototype.filter.call(document.querySelectorAll('label'), function (label) {
            return label.htmlFor === id;
        });
    }

    ensureLabelId(label, baseId) {
        if (!label.id) {
            label.id = baseId + '-label';
            label.dataset.choiceInputGeneratedId = 'true';
        }

        return label.id;
    }

    restoreLabels() {
        var id = this.element && this.element.id ? this.element.id : '';

        this.labels.forEach(function (label) {
            label.htmlFor = id;

            if (label.dataset.choiceInputGeneratedId === 'true') {
                label.removeAttribute('id');
                label.removeAttribute('data-choice-input-generated-id');
            }
        });
    }

    resolveElement(target) {
        if (typeof target === 'string') {
            return document.querySelector(target);
        }

        return target || null;
    }
}

ChoiceInput.DEFAULT_THRESHOLD = DEFAULT_THRESHOLD;

ChoiceInput.resolveMode = function (optionCount, threshold) {
    var count = Math.max(0, Number(optionCount) || 0);
    var numericThreshold = Number(threshold);
    var limit = Number.isInteger(numericThreshold) && numericThreshold > 0
        ? numericThreshold
        : DEFAULT_THRESHOLD;

    return count <= limit
        ? ChoiceInput.Mode.RADIO
        : ChoiceInput.Mode.SELECT;
};

ChoiceInput.Mode = Object.freeze({
    RADIO: 'radio',
    SELECT: 'select'
});

module.exports = ChoiceInput;
