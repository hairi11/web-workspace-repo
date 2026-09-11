import Common from '@company/common-js-web';
import UserService from './UserService.js';
import { getDraft, saveDraft } from './action/userActionBase.js';

const { FormAction, Validator, Toast } = Common;

const STEP_CONFIG = {
    profile: {
        validationRules: function () {
            return {
                name: Validator.required('Name is required.'),
                username: Validator.required('Username is required.'),
                email: [
                    Validator.required('Email is required.'),
                    Validator.email('Please enter a valid email address.')
                ]
            };
        },
        buildRequestData: function (values) {
            return {
                name: values.name,
                username: values.username,
                email: values.email,
                phone: values.phone || '',
                website: values.website || ''
            };
        },
        populate: function (action, values) {
            Object.keys(values).forEach((name) => {
                const field = action.form.elements[name];
                if (!field || typeof values[name] === 'object') return;

                field.value = values[name] === null || values[name] === undefined
                    ? ''
                    : values[name];
            });
        },
        nextUrl: './create-address.html'
    },

    address: {
        validationRules: function () {
            return {
                street: Validator.required('Street is required.'),
                city: Validator.required('City is required.'),
                zipcode: Validator.required('Zip code is required.')
            };
        },
        buildRequestData: function (values) {
            return {
                address: {
                    street: values.street || '',
                    suite: values.suite || '',
                    city: values.city || '',
                    zipcode: values.zipcode || '',
                    geo: {
                        lat: values.lat || '',
                        lng: values.lng || ''
                    }
                }
            };
        },
        populate: function (action, values) {
            const address = values.address || {};
            const geo = address.geo || {};

            action._setField('street', address.street);
            action._setField('suite', address.suite);
            action._setField('city', address.city);
            action._setField('zipcode', address.zipcode);
            action._setField('lat', geo.lat);
            action._setField('lng', geo.lng);
        },
        nextUrl: './create-company.html'
    },

    company: {
        validationRules: function () {
            return {
                companyName: Validator.required('Company name is required.')
            };
        },
        buildRequestData: function (values) {
            return {
                company: {
                    name: values.companyName || '',
                    catchPhrase: values.catchPhrase || '',
                    bs: values.bs || ''
                }
            };
        },
        populate: function (action, values) {
            const company = values.company || {};

            action._setField('companyName', company.name);
            action._setField('catchPhrase', company.catchPhrase);
            action._setField('bs', company.bs);
        },
        nextUrl: './view.html?preview=1'
    }
};

class UserFormAction extends FormAction {
    constructor(selector, options) {
        super(selector);
        this.options = options || {};
    }

    _getStepConfig() {
        return STEP_CONFIG[this.options.step || 'profile'];
    }

    getValidationRules() {
        return this._getStepConfig().validationRules();
    }

    buildRequestData(values) {
        return this._getStepConfig().buildRequestData(values);
    }

    async load() {
        if (!this.options.id) return null;

        const response = await UserService.getById(this.options.id);
        this.populate(response.data);
        return response.data;
    }

    populate(values) {
        if (!this.form || !values) return this;

        this._getStepConfig().populate(this, values);

        if (this.formState) {
            this.formState.resetBaseline();
        }

        return this;
    }

    _setField(name, value) {
        const field = this.form && this.form.elements[name];
        if (!field) return;
        field.value = value === null || value === undefined ? '' : value;
    }

    beforeSubmit(context) {
        if (this.options.mode === 'create') {
            const existing = getDraft();
            const draft = existing && existing.mode === 'create'
                ? existing
                : { mode: 'create', id: null, data: {} };

            draft.data = Object.assign({}, draft.data, context.data);
            saveDraft(draft);

            window.location.href = this._getStepConfig().nextUrl;
            return false;
        }

        saveDraft({
            mode: this.options.mode,
            id: this.options.id || null,
            data: context.data
        });

        const id = this.options.id
            ? '&id=' + encodeURIComponent(this.options.id)
            : '';

        window.location.href = './view.html?preview=1' + id;
        return false;
    }

    sendRequest(context) {
        if (this.options.mode === 'update') {
            return UserService.update(this.options.id, context.data);
        }

        return UserService.create(context.data);
    }

    shouldTrackDirty() {
        return true;
    }

    onError(error) {
        Toast.error(error && error.message ? error.message : 'Request failed.');
        console.error(error);
    }
}

export default UserFormAction;
