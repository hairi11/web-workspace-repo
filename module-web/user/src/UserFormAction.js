import Common from '@company/common-js-web';
import UserService from './UserService.js';
import { getDraft, saveDraft } from './action/userActionBase.js';

const { FormAction, Validator, Toast } = Common;

class UserFormAction extends FormAction {
    constructor(selector, options) {
        super(selector);
        this.options = options || {};
    }

    getValidationRules() {
        if (this.options.mode === 'create' && this.options.step === 'address') {
            return {
                street: Validator.required('Street is required.'),
                city: Validator.required('City is required.'),
                zipcode: Validator.required('Zip code is required.')
            };
        }

        if (this.options.mode === 'create' && this.options.step === 'company') {
            return {
                companyName: Validator.required('Company name is required.')
            };
        }

        return {
            name: Validator.required('Name is required.'),
            username: Validator.required('Username is required.'),
            email: [
                Validator.required('Email is required.'),
                Validator.email('Please enter a valid email address.')
            ]
        };
    }

    buildRequestData(values) {
        if (this.options.mode === 'create' && this.options.step === 'address') {
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
        }

        if (this.options.mode === 'create' && this.options.step === 'company') {
            return {
                company: {
                    name: values.companyName || '',
                    catchPhrase: values.catchPhrase || '',
                    bs: values.bs || ''
                }
            };
        }

        return {
            name: values.name,
            username: values.username,
            email: values.email,
            phone: values.phone || '',
            website: values.website || ''
        };
    }

    async load() {
        if (!this.options.id) return null;

        const response = await UserService.getById(this.options.id);
        this.populate(response.data);
        return response.data;
    }

    populate(values) {
        if (!this.form || !values) return this;

        if (this.options.mode === 'create' && this.options.step === 'address') {
            const address = values.address || {};
            const geo = address.geo || {};

            this._setField('street', address.street);
            this._setField('suite', address.suite);
            this._setField('city', address.city);
            this._setField('zipcode', address.zipcode);
            this._setField('lat', geo.lat);
            this._setField('lng', geo.lng);
        } else if (this.options.mode === 'create' && this.options.step === 'company') {
            const company = values.company || {};

            this._setField('companyName', company.name);
            this._setField('catchPhrase', company.catchPhrase);
            this._setField('bs', company.bs);
        } else {
            Object.keys(values).forEach((name) => {
                const field = this.form.elements[name];
                if (!field || typeof values[name] === 'object') return;

                field.value = values[name] === null || values[name] === undefined
                    ? ''
                    : values[name];
            });
        }

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

            if (this.options.step === 'profile') {
                window.location.href = './create-address.html';
                return false;
            }

            if (this.options.step === 'address') {
                window.location.href = './create-company.html';
                return false;
            }

            window.location.href = './view.html?preview=1';
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
