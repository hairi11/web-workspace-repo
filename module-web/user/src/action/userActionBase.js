import Common from '@company/common-js-web';

const { Storage, Toast, Validator } = Common;
const DRAFT_KEY = 'module-web:user:draft';
const storage = new Storage(window.sessionStorage);

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
        populate: null
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

            action.setField('street', address.street);
            action.setField('suite', address.suite);
            action.setField('city', address.city);
            action.setField('zipcode', address.zipcode);
            action.setField('lat', geo.lat);
            action.setField('lng', geo.lng);
        }
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

            action.setField('companyName', company.name);
            action.setField('catchPhrase', company.catchPhrase);
            action.setField('bs', company.bs);
        }
    }
};

export function getStepConfig(step) {
    const config = STEP_CONFIG[step || 'profile'];

    if (!config) {
        throw new Error('Unsupported user form step: ' + step);
    }

    return config;
}

export function getId() {
    return new URLSearchParams(window.location.search).get('id');
}

export function requireId() {
    const id = getId();

    if (!id) {
        Toast.error('User id is required.');
        throw new Error('Missing user id.');
    }

    return id;
}

export function asText(value) {
    return value === null || value === undefined ? '' : String(value);
}

export function saveDraft(draft) {
    storage.set(DRAFT_KEY, draft);
}

export function getDraft() {
    return storage.get(DRAFT_KEY);
}

export function clearDraft() {
    storage.remove(DRAFT_KEY);
}
