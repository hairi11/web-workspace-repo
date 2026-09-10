const createStore = require('unistore');
const FormSerializer = require('../form/FormSerializer');

class FormState {
    constructor(form) {
        this.form = form;
        this.store = createStore({
            initial: FormSerializer.serialize(form)
        });
    }

    snapshot() {
        return FormSerializer.serialize(this.form);
    }

    isDirty() {
        return JSON.stringify(this.snapshot()) !== JSON.stringify(this.store.getState().initial);
    }

    resetBaseline() {
        this.store.setState({
            initial: this.snapshot()
        });
        return this;
    }
}

module.exports = FormState;
