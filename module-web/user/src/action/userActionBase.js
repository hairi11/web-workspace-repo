import Common from '@company/common-js-web';
import { traceFunction } from '../Trace.js';

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

function getStepConfigImpl(step) {
    const config = STEP_CONFIG[step || 'profile'];

    if (!config) {
        throw new Error('Unsupported user form step: ' + step);
    }

    return config;
}

function getIdImpl() {
    return new URLSearchParams(window.location.search).get('id');
}

function requireIdImpl() {
    const id = getId();

    if (!id) {
        Toast.error('User id is required.');
        throw new Error('Missing user id.');
    }

    return id;
}

function asTextImpl(value) {
    return value === null || value === undefined ? '' : String(value);
}

function saveDraftImpl(draft) {
    storage.set(DRAFT_KEY, draft);
}

function getDraftImpl() {
    return storage.get(DRAFT_KEY);
}

function clearDraftImpl() {
    storage.remove(DRAFT_KEY);
}

export const getStepConfig = traceFunction(getStepConfigImpl, 'userActionBase.getStepConfig');
export const getId = traceFunction(getIdImpl, 'userActionBase.getId');
export const requireId = traceFunction(requireIdImpl, 'userActionBase.requireId');
export const asText = traceFunction(asTextImpl, 'userActionBase.asText');
export const saveDraft = traceFunction(saveDraftImpl, 'userActionBase.saveDraft');
export const getDraft = traceFunction(getDraftImpl, 'userActionBase.getDraft');
export const clearDraft = traceFunction(clearDraftImpl, 'userActionBase.clearDraft');
