import Common from '@company/common-js-web';
import UserService from '../UserService.js';
import { asText, clearDraft, getDraft, requireId } from './userActionBase.js';

const { Toast } = Common;

function renderUser(user) {
    const container = document.querySelector('#userView');
    const address = user.address || {};
    const geo = address.geo || {};
    const company = user.company || {};

    container.textContent = '';

    [
        ['ID', user.id],
        ['Name', user.name],
        ['Username', user.username],
        ['Email', user.email],
        ['Phone', user.phone],
        ['Website', user.website],
        ['Street', address.street],
        ['Suite', address.suite],
        ['City', address.city],
        ['Zip Code', address.zipcode],
        ['Latitude', geo.lat],
        ['Longitude', geo.lng],
        ['Company', company.name],
        ['Catch Phrase', company.catchPhrase],
        ['BS', company.bs]
    ].forEach(([label, value]) => {
        const row = document.createElement('div');
        row.className = 'view-row';

        const strong = document.createElement('strong');
        strong.textContent = label;

        const span = document.createElement('span');
        span.textContent = asText(value) || '-';

        row.appendChild(strong);
        row.appendChild(span);
        container.appendChild(row);
    });
}

function configureLinks(user) {
    const updateLink = document.querySelector('#updateLink');
    const backLink = document.querySelector('#backLink');

    updateLink.hidden = !user.id;
    updateLink.href = user.id
        ? './update.html?id=' + encodeURIComponent(user.id)
        : '#';
    backLink.href = './enquiry.html';
}

export async function initView() {
    const params = new URLSearchParams(window.location.search);
    const saved = params.get('saved') === '1';

    if (saved) {
        const draft = getDraft();

        if (!draft || draft.mode !== 'saved') {
            Toast.error('Saved user data is not available.');
            window.location.href = './enquiry.html';
            return;
        }

        renderUser(draft.data);
        configureLinks(draft.data);
        clearDraft();
        return;
    }

    const response = await UserService.getById(requireId());
    const user = response.data;

    renderUser(user);
    configureLinks(user);
}
