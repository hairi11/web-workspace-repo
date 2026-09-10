const Common = require('../src');

class RegistrationFormAction extends Common.FormAction {
    getUrl() {
        return '/api/users';
    }

    getValidationRules() {
        return {
            name: Common.Validator.required(),
            email: [
                Common.Validator.required(),
                Common.Validator.email()
            ],
            password: [
                Common.Validator.required(),
                Common.Validator.minLength(8)
            ]
        };
    }

    getConfirmation() {
        return 'Create user?';
    }

    buildRequestData(form) {
        return {
            name: form.name,
            email: form.email,
            password: form.password
        };
    }

    onSuccess() {
        Common.Toast.success('User created.');
    }

    onError(error) {
        Common.Toast.error(error.message);
    }
}

new RegistrationFormAction('#registrationForm').build();

module.exports = RegistrationFormAction;
