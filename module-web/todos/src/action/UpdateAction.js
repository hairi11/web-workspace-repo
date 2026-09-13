import Common from '@company/common-js-web';
import TodoFormAction from '../TodoFormAction.js';

const { NavigationState, Toast } = Common;

export async function initUpdate() {
    const navigation = NavigationState.consume();
    const id = navigation && navigation.id;

    if (!id) {
        Toast.error('Todo id is required.');
        throw new Error('Missing todo id.');
    }

    const action = new TodoFormAction('#todoForm', {
        mode: 'update',
        id: id
    });

    await action.loadStatusOptions();
    action.build();
    await action.load();
}
