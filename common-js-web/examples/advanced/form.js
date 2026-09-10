const {FormAction, Toast, Validator} = require('../../src');

class ProfileFormAction extends FormAction {
    getUrl() {
        return '/api/profile';
    }

    getValidationRules() {
        return {
            name: Validator.required(),
            email: [Validator.required(), Validator.email()]
        };
    }

    shouldTrackDirty() {
        return true;
    }

    mapServerErrors(error) {
        return error.data && error.data.errors
            ? error.data.errors
            : {};
    }

    onDirtyChange(dirty) {
        console.log('Dirty:', dirty);
    }

    onSuccess() {
        Toast.success('Profile saved.');
    }
}

new ProfileFormAction('#profileForm').build();

module.exports = ProfileFormAction;
