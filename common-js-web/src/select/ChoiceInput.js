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

        if (items.length < threshold) {
            this.buildRadios(items);
            this.mode = ChoiceInput.Mode.RADIO;
        } else {
            this.select = new Select2(this.element, this.getSelectOptions(items)).build();
            this.mode = ChoiceInput.Mode.SELECT;
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
        var changedInput = null;

        this.radioInputs.forEach(function (input) {
            var checked = input.value === normalized;
            input.checked = checked;
            if (checked) changedInput = input;
        });

        if (triggerChange === true && changedInput) {
            changedInput.dispatchEvent(new Event('change', {bubbles: true}));
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
        return Object.assign({}, this.options, {
            data: items,
            threshold: undefined
        });
    }

    buildRadios(items) {
        var group = document.createElement('div');
        var name = this.element.name;
        var baseId = this.element.id || name || 'choice';

        group.className = 'choice-input-radio-group';
        group.setAttribute('role', 'radiogroup');

        this.labels = this.getLabels();

        items.forEach((item, index) => {
            var option = document.createElement('label');
            var input = document.createElement('input');
            var text = document.createElement('span');

            input.type = 'radio';
            input.name = name;
            input.value = item.id;
            input.id = baseId + '-option-' + String(index + 1);
            input.disabled = this.element.disabled;

            option.className = 'choice-input-radio';
            option.htmlFor = input.id;
            text.textContent = item.text;

            option.appendChild(input);
            option.appendChild(text);
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
                delete label.dataset.choiceInputGeneratedId;
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

ChoiceInput.Mode = Object.freeze({
    RADIO: 'radio',
    SELECT: 'select'
});

module.exports = ChoiceInput;
