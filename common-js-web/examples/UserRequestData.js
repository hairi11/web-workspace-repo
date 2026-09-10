class UserRequestData {
    static registration() {
        return function (form) {
            return {
                name: form.name,
                email: form.email,
                password: form.password
            };
        };
    }
}

module.exports = UserRequestData;
