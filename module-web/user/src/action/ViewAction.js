import UserService from '../UserService.js';
import { asText, requireId } from './userActionBase.js';

export async function initView() {
    const response = await UserService.getById(requireId());
    const user = response.data;
    const container = document.querySelector('#userView');

    container.textContent = '';

    [
        ['ID', user.id],
        ['Name', user.name],
        ['Username', user.username],
        ['Email', user.email],
        ['Phone', user.phone],
        ['Website', user.website],
        ['Company', user.company && user.company.name],
        ['City', user.address && user.address.city]
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

    document.querySelector('#updateLink').href =
        './update.html?id=' + encodeURIComponent(user.id);
}
