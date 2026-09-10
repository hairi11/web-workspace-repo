const FormSerializer = require('../form/FormSerializer');

class FormState {
    constructor(form) {
        this.form = form;
        this.initial = FormSerializer.serialize(form);
    }

    snapshot() {
        return FormSerializer.serialize(this.form);
    }

    isDirty() {
        return JSON.stringify(this.snapshot()) !== JSON.stringify(this.initial);
    }

    resetBaseline() {
        this.initial = this.snapshot();
        return this;
    }
}

module.exports = FormState;
